define(
	[

		"dojo/aspect",
		"dojo/cookie",
		"dojo/Deferred",
		"dojo/json",
		"dojo/on",
		"dojo/query",
		"dojo/window",
		"dojo/_base/array",
		"dojo/_base/declare",
		"dojo/_base/Color",
		"dojo/_base/lang",
		"dojo/_base/unload",
		"dojo/_base/window",
		"dojo/date/locale",
		"dojo/dom",
		"dojo/dom-construct",
		"dojo/dom-style",
		"dojo/dom-class",
		"dojo/i18n!./nls/text",
		"dojo/i18n!esri/nls/jsapi",

		"dijit/CheckedMenuItem",
		"dijit/Menu",
		"dijit/MenuItem",
		"dijit/MenuSeparator",
		"dijit/registry",
		"dijit/Toolbar",
		"dijit/form/Button",
		"dijit/form/DropDownButton",
		"dijit/layout/AccordionContainer",
		"dijit/layout/BorderContainer",
		"dijit/layout/ContentPane",

		"dojox/lang/functional",
		"dojox/layout/Dock",
		"dojox/layout/FloatingPane",

		"esri/domUtils",
		"esri/IdentityManager",
		"esri/InfoTemplate",
		"esri/map",
		"esri/request",
		"esri/dijit/BasemapGallery",
		"esri/dijit/Popup",
		"esri/dijit/Legend",
		"esri/dijit/Geocoder",
		"esri/geometry/Extent",
		"esri/layers/ArcGISDynamicMapServiceLayer",
		"esri/layers/ArcGISTiledMapServiceLayer",
		"esri/layers/FeatureLayer",
		"esri/layers/LayerDrawingOptions",
		"esri/renderers/jsonUtils",
		"esri/symbols/PictureMarkerSymbol",
		"esri/tasks/QueryTask",
		"esri/tasks/query",
		"esri/tasks/StatisticDefinition",

		"./config",
		"./visual",
		"./filter",
		"./reading",
		"./rink",
		"./popup",
		"./chart",
		"./report",

		"dojo/NodeList-traverse"


	], function(

		aspect,
		cookie,
		Deferred,
		JSON,
		on,
		$,
		dojoWindow,
		array,
		declare,
		Color,
		lang,
		baseUnload,
		win,
		locale,
		dom,
		domConstruct,
		domStyle,
		domClass,
		i18n,
		bundle,

		CheckedMenuItem,
		Menu,
		MenuItem,
		MenuSeparator,
		registry,
		Toolbar,
		Button,
		DropDownButton,
		AccordionContainer,
		BorderContainer,
		ContentPane,

		functional,
		Dock,
		FloatingPane,

		domUtils,
		IdentityManager,
		InfoTemplate,
		Map,
		esriRequest,
		BasemapGallery,
		Popup,
		Legend,
		Geocoder,
		Extent,
		ArcGISDynamicMapServiceLayer,
		ArcGISTiledMapServiceLayer,
		FeatureLayer,
		LayerDrawingOptions,
		jsonUtils,
		PictureMarkerSymbol,
		QueryTask,
		Query,
		StatisticDefinition,

		config,
		visual,
		filter,
		reading,
		rink,
		popup,
		chart,
		report

	) {

		return declare(null, {

			queryOnClick: true,

			// A spot to store information about groups of layers that are considered mutually exclusive.
			layerLists: {},

			constructor: function() {

				// Set title of document
				document.title = i18n.title;

				// Set the name of the cookie for the rinkwatch app
				this.cred = "esri_jsapi_id_manager_data";

				// Force Array objects to provide the indexOf function (e.g., for IE7):
				if (!Array.indexOf) {
					Array.prototype.indexOf = function(item) {
						for(var i=0; i<this.length; i++) {
							if(this[i]===item) return i;
						}
						return -1;
					};
				}

				// Change string in IdentityManager sign in dialog box
				bundle.identity.info = i18n.signIn.idManager + "<span class='dijitOffScreen'>${server}${resource}</span>";

				// set root path
				this.root = window.location.protocol+"//"+window.location.hostname+(window.location.port?":"+window.location.port:"");
				this.rinkwatch = rinkwatch;

				if (!this.mainWindow) {
					this.createMainWindow();
				}

				if (!this.rinkwatchMenu) {
					this.createFloatingPane();
				}

				// Look for credentials
				this.loadCredentials();

				// Check if the user logged in via RW
				var process = this.logInUser();
				process.then(lang.hitch(this, function(response) {
					console.log(response);
					// Create the initial components for the website
					if (!this.readingArray) {
						this.createReadingArray();
					}
				// }));

					// Store credentials before the page unloads
					// baseUnload.addOnUnload(lang.hitch(this, this.storeCredentials));

					// Set extent of map
					this.initialExtent = new Extent(config.extentSettings);

					// Configure Popup
					this.initialPopup = new Popup({
						fillSymbol: false,
						highlight: false,
						lineSymbol: false,
						markerSymbol: false
					}, domConstruct.create("div"));

					this.basemap = new ArcGISTiledMapServiceLayer(config.basemapUrl);
					this.referenceBasemap = new ArcGISTiledMapServiceLayer(config.referenceUrl);

					// Create Map
					this.map = new Map("map", {
						wrapAround180: true,
						extent: this.initialExtent,
						infoWindow: this.initialPopup
					});
					this.map.addLayer(this.basemap, 0);
					this.map.addLayer(this.referenceBasemap, 1);

					on(this.map, "load",lang.hitch(this, function() {
						// Initialize login process
						this.doLogin();
						// Make sure the map size/position are refreshed when its container has changed size
						on(this.map, "resize", lang.hitch(this, this.resizeMap));
					}));

					// Show loading status in bottom right corner
					on(this.map, "update-start", function() {
						domUtils.show(dom.byId("status"));
					});
					on(this.map, "update-end", function() {
						domUtils.hide(dom.byId("status"));
					});

					// Store the previous extent of the map to be used for zooming to previous extent or browser resizing
					on(this.map, "extent-change", lang.hitch(this, function(evt) {
						this.saveExtent(evt);
					}));

					// Purely aesthetic - make sure IdentityManager sign in prompt is clear every time a user initializes it
					on(esri.id, "dialog-cancel", function() {
						registry.byId("dijit_form_ValidationTextBox_0").reset();
						registry.byId("dijit_form_ValidationTextBox_1").reset();
					});

					this.map.infoWindow.resize(200,70);

					// Initialize filter and visual modules
					this.filter = new filter(this);
					this.visual = new visual(this);

				}));

			},

			createReadingArray: function() {
			 	var queryRoot = this.root+config.tables.url+"/";
				var readingQueryTask = new QueryTask(queryRoot+config.tables.layers.reading);
				var readingQuery = new Query();
				//readingQuery.where = config.defaultQuerySettings.reading.expression;
				readingQuery.outFields = ["*"];
				//readingQuery.where = "1=1";
				readingQuery.where = "flag < 2";
				readingQuery.orderByFields = ["reading_time DESC"];
				readingQueryTask.execute(readingQuery, lang.hitch(this, function(fs) {
					if (fs.features.length > 0) {
						this.readingArray = [];
						array.forEach(fs.features, function(f) {
							var rinkId = f.attributes.reading_rink_id;
							if (!this.readingArray[rinkId]) {
								this.readingArray[rinkId] = [f];
							} else {
								this.readingArray[rinkId].push(f);
							}
						}, this);
					}
				})).then(lang.hitch(this, function() {

					// Display rinks once readingArray has populated
					this.filter.setRinkDisplay();
				}));
			},

			createMainWindow: function() {

				// mainWindow BorderContainer
				this.mainWindow = registry.byId("mainWindow");
				// this.mainWindow = new BorderContainer({
				// 	"id": "mainWindow",
				// 	"gutters": false
				// }).placeAt(win.body());

				// headerTools ContentPane
				this.headerTools = registry.byId("headerTools");
				// this.headerTools = new ContentPane({
				// 	"id": "headerTools",
				// 	"class": "claro",
				// 	"region": "top"
				// });

				// Toolbar
				this.toolbar = registry.byId("toolbar");
				// this.toolbar = new Toolbar({
				// 	"id": "toolbar"
				// });
				// this.headerTools.addChild(this.toolbar);

				// // imageDiv
				// this.imageDiv = domConstruct.create("div", {
				// 	"id": "imageDiv"
				// }, this.headerTools.domNode);

				// // rinkwatchLogo img
				// domConstruct.create("img", {
				// 	"id": "rinkwatchLogo",
				// 	"src": config.img.rw_logo
				// }, this.imageDiv);

				// // mapDiv ContentPane
				// this.mapDiv = new ContentPane({
				// 	"id": "map",
				// 	"class": "claro",
				// 	"region": "bottom"
				// });

				// // heatLayer div
				// domConstruct.create("div", {
				// 	"id": "heatLayer"
				// }, this.mapDiv.domNode);

				// this.mainWindow.addChild(this.headerTools);
				// this.mainWindow.addChild(this.mapDiv);

				// status span
				domConstruct.create("span", {
					"id": "status",
					"innerHTML": i18n.status
				}, this.mainWindow.domNode);

				// this.mainWindow.resize();

			},

			/**
			 * Creates floating pane for the rinkwatch menu to display within
			 *
			 * @this {rinkwatch}
			 *
			 */
			createFloatingPane: function() {

				// dock for FloatingPane
				// this.dock = new Dock({
				// 	"id": "dock",
				// 	"class": "claro",
				// 	"style": "position: absolute; bottom: 0; right: 0; height: 0; width: 0; display: none; z-index: 0; background-color: #FFFFFF;"
				// }).placeAt(win.body());

				// rinkwatchMenu FloatingPane
				this.rinkwatchMenu = registry.byId("rinkwatchMenu");
				this.rinkwatchMenu.startup();
				// this.rinkwatchMenu = new FloatingPane({
				// 	"id": "rinkwatchMenu",
				// 	"class": "claro",
				// 	"closable": false,
				// 	"dockable": true,
				// 	"dockTo": this.dock,
				// 	"resizable": true,
				// 	"title": i18n.menu.title,
				// 	"style": "position: absolute; top: 170px; left: 32px; width: 283px !important; height: 62%; visibility: hidden; z-index: 948; overflow: hidden;"
				// }).placeAt(win.body());
				this.rinkwatchMenu.set("title", i18n.menu.title);
				this.rinkwatchMenu.dockTo = registry.byId("dock");

				// // menuFrame ContentPane
				this.menuFrame = registry.byId("menuFrame");
				// this.menuFrame = new ContentPane({
				// 	"id": "menuFrame",
				// 	"class": "claro"
				// });

				// // menuAccordion AccordionContainer
				this.menuAccordion = registry.byId("menuAccordion");

				// this.esriLogo = domConstruct.create("a", {
				// 	"class": "esriLogo",
				// 	"href": config.esriUrl,
				// 	"target": "_blank"
				// }, this.rinkwatchMenu.domNode);

				// domConstruct.create("img", {
				// 	"src": config.img.esriLogo,
				// 	"width": 183,
				// 	"height": 34
				// }, this.esriLogo);

				// this.menuAccordion = new AccordionContainer({
				// 	"id": "menuAccordion"
				// });
				// this.menuFrame.addChild(this.menuAccordion);

				// this.rinkwatchMenu.addChild(this.menuFrame);

				// Ensure rinkwatchMenu is always on top of all elements
				aspect.after(this.rinkwatchMenu, "onFocus", lang.hitch(this, function() {
					this.rinkwatchMenu.bringToTop();
				}));
				aspect.after(this.rinkwatchMenu, "onShow", lang.hitch(this, function() {
					this.rinkwatchMenu.bringToTop();
				}));

			},

			/**
			 * Sends a request to the service and loads user interface.
			 *
			 * @this {rinkwatch}
			 */
			loadInterface: function() {

				esriRequest({
					url: this.root + config.rinkwatchPublicUrl,
					content: {
						"f": "json"
					},
					"handleAs": "json"
				}).then(lang.hitch(this, function(data) {
					this.doLogin();
				}));

			},

			/**
			 * Begins the login process and checks user credentials.
			 *
			 * @this {rinkwatch}
			 */
			doLogin: function() {

				var username;
				if (esri.id.credentials.length > 0) {
					username = esri.id.findCredential(this.root+config.rinkwatchUrl).userId;
					this.hasAccount = true;
				} else {
					username = i18n.toolbar.buttons.userTools;
				}
				this.finishLogin(username);

			},

			/**
			 * Finishes the login process and loads all necessary map elements.
			 *
			 * @this {rinkwatch}
			 */
			finishLogin: function(username) {

				// After layers are added to the map, either create or refresh the legend.
				on(this.map, "layer-add-result", lang.hitch(this, function() {
					domStyle.set(dom.byId("toolbar"), {
						"visibility": "visible"
					});
					this.rinkwatchMenu.show();
				}));

				on(this.map.infoWindow, "hide", lang.hitch(this, function() {
					if (this._infoWindowGraphics && this._infoWindowGraphics.length>0) {
						array.forEach(this._infoWindowGraphics, function(g) {
							this.map.graphics.remove(g);
						}, this);
					}
					// destroy the lightbox dijit when a popup is closed
					if (this.popupLB) {
						this.popupLB.destroy();
					}
				}));

				this.username = username;
				this.rinkwatchLayer = new ArcGISDynamicMapServiceLayer(this.root+config.rinkwatchPublicUrl, {
					"id": "rinkwatchLayer",
					"visible": false
				});
				this.rinkwatchLayer.setImageFormat("png32");
				this.setRendererSettings(this.rinkwatchLayer, 0);
				this.map.addLayer(this.rinkwatchLayer, 2);

				// Set the rinksLayer depending on if the user has a RinkWatch account
				this.setLayers();

				on(this.rinkwatchLayer, "update-end", lang.hitch(this, function() {
					if (this.legend) {
						this.legend.refresh();
					}
				}));

				// Check which user interface to display
				if (this.hasAccount) {
					this.modifyInterface();
				} else {
					// Create content for toolbar
					this.setToolbar(this.username);
				}

				// Change button type based on size of window
				window.onresize = lang.hitch(this, function() {
					this.resizeButtons();
				});

				on(this.map,"click", lang.hitch(this, this.executeQueryTask));
				on(this.map,"mouse-move", lang.hitch(this, this.getCountOnMouseMove));
				on(this.map,"zoom-start", lang.hitch(this, function() {
					this.cancelMouseMove();
					this.hideToolTip();
				}));
				on(this.map,"pan-start", lang.hitch(this, function() {
					this.cancelMouseMove();
					this.hideToolTip();
				}));
				on(dom.byId("map"), "mouseout", lang.hitch(this, this.cancelMouseMove));
				on($(".esriPopupWrapper")[0], "mouseover", lang.hitch(this, this.hideToolTip));

				this.rinkwatchRenderer = config.rendererSettings[0];

			},

			createLegend: function() {

				if (!this.legend) {
					domConstruct.empty("map_legend");
					this.legend = new Legend({
						layerInfos: this.filter.legendLayers,
						map: this.map
					},"map_legend");
					this.legend.startup();
				} else {
					this.legend.refresh(this.filter.legendLayers);
				}

			},

			/**
			 * Create or modify the toolbar depending on the level of user
			 *
			 * @this {rinkwatch}
			 *
			 * @param {string} username - the user name of the current user; if not logged on, defaults to ""
			 *
			 */
			setToolbar: function(username) {

				this.userLog = new Menu();

				// Change this.userLog based on level of user (public vs. Mapper account)
				if (this.hasAccount) {

					this.userLog.addChild(new MenuItem({
						label: i18n.toolbar.userLog.downloadData,
						onClick: lang.hitch(this, function() {
							// Download Rink Data
							if (this.filter && this.rink) {
								var startDate = this.filter.startDateBox.value;
								var endDate = this.filter.endDateBox.value;
								var rinkid = "(";
								array.forEach(this.rink.curRink.options, function(o) {
									rinkid += "reading_rink_id = " + o.value + " OR ";
								}, this);
								rinkid += "reading_rink_id = 0)";
								var sd = "timestamp '" + startDate.getUTCFullYear() + "/" + (startDate.getUTCMonth() + 1) + "/" + startDate.getUTCDate() + " 05:00:00'";
								var ed = "timestamp '" + endDate.getUTCFullYear() + "/" + (endDate.getUTCMonth() + 1) + "/" + endDate.getUTCDate() + " 05:00:00'";
								var params = {
									"in_features": rinkid + " AND reading_time >= " + sd + " AND reading_time <= " + ed,
									"language": i18n.toolbar.buttons.switchLocale
								};
								report.downloadRinkReport(params);
							}
						})
					}));

					// this.userLog.addChild(new MenuItem({
					// 	label: i18n.toolbar.userLog.signOut,
					// 	onClick: lang.hitch(this, function() {
					// 		cookie(this.cred, null, {expires:-1});
					// 		this.cred = "logout";
					// 		window.location.reload();
					// 	})
					// }));

				} else {
					this.userLog.addChild(new MenuItem({
						label: i18n.toolbar.userLog.signIn,
						onClick: lang.hitch(this, function() {
							// esriRequest({
							// 	"url": this.root+config.rinkwatchUrl,
							// 	"content": {
							// 		"f":"json"
							// 	},
							// 	"handleAs":"json"
							// }).then(lang.hitch(this, this.modifyInterface));
							window.location.href = config.logInUrl;
						})
					}));
				}

				// Destroy previous userTools button
				if (this.userTools) {
					registry.byId("toolbar").removeChild(this.userTools);
					domConstruct.destroy(this.userTools.domNode);
				} else {
					// If userTools doesn't exist, implies that toolbar doesn't either, so create toolbar items
					var menuBtn = new Button({
						label: i18n.toolbar.buttons.menuBtn,
						id: "menuBtn",
						style: "padding: 3px 0px 0px 0px;",
						onClick: lang.hitch(this, function() {
							if (this.rinkwatchMenu._isShown()) {
								this.rinkwatchMenu.hide();
							} else {
								this.rinkwatchMenu.show();
							}
						})
					});

					// For resized window
					var menuBtnSmall = new Button({
						label: i18n.toolbar.buttons.menuBtnSmall,
						id: "menuBtnSmall",
						style: "padding: 3px 0px 0px 0px;",
						title: i18n.toolbar.buttons.menuBtnTitle,
						onClick: lang.hitch(this, function() {
							if (this.rinkwatchMenu._isShown()) {
								this.rinkwatchMenu.hide();
							} else {
								this.rinkwatchMenu.show();
							}
						})
					});

					var extentBtn = new Button({
						label: i18n.toolbar.buttons.extentBtn,
						id: "extentBtn",
						iconClass: "zoomIcon",
						style: "padding: 3px 0px 0px 0px;"
					});

					var extentBtnSmall = new Button({
						id: "extentBtnSmall",
						iconClass: "zoomIcon",
						style: "padding: 3px 0px 0px 0px;",
						title: i18n.toolbar.buttons.extentBtnTitle
					});

					var langBtn = new Button({
						label: i18n.toolbar.buttons.switchLocale,
						id: "langBtn",
						style: "padding: 3px 0px 0px 0px",
					});

					domClass.add(dom.byId(registry.byId("extentBtnSmall").domNode), "extentBtnSmall");

					on(registry.byId("extentBtn"), "click", lang.hitch(this, this.showPreviousExtent));
					on(registry.byId("extentBtnSmall"), "click", lang.hitch(this, this.showPreviousExtent));
					on(registry.byId("langBtn"), "click", lang.hitch(this, this.switchLocale));

					// Populate toolbar
					// this.addLayerList(); !!! remove for now
					registry.byId("toolbar").addChild(extentBtn);
					registry.byId("toolbar").addChild(extentBtnSmall);
					// Set width for extentBtnSmall
					domStyle.set($(".extentBtnSmall").children()[0], "padding-left", "9px");
					// domStyle.set($(".extentBtnSmall.dijitButtonHover"), "padding-left", "8px");
					this.addBasemapGallery();
					registry.byId("toolbar").addChild(menuBtn);
					registry.byId("toolbar").addChild(menuBtnSmall);
					registry.byId("toolbar").addChild(langBtn);
					this.addGeocoder();

				}

				if (this.hasAccount && this.hasAccount === true) {
					this.userTools = new DropDownButton({
						"label": username,
						// "title": "User Tools",
						"style": "padding: 3px 0px 0px 0px;",
						"dropDown": this.userLog
					});

				} else {
					this.userTools = new Button({
						label: i18n.toolbar.userLog.signIn,
						style: "padding: 3px 0px 0px 0px;",
						onClick: lang.hitch(this, function() {
							// esriRequest({
							// 	"url": this.root+config.rinkwatchUrl,
							// 	"content": {
							// 		"f":"json"
							// 	},
							// 	"handleAs":"json"
							// }).then(lang.hitch(this, this.modifyInterface));
							window.location.href = config.logInUrl;
						})
					});
				}

				registry.byId("toolbar").addChild(this.userTools);

				// Setting the initial button size
				this.resizeButtons();

			},

			/**
			 * Cancels any previous mousemove timeouts
			 *
			 * @this {rinkwatch}
			 */
			cancelMouseMove: function() {

				if (this._mouseMoveQueryTimer) clearTimeout(this._mouseMoveQueryTimer);
				this._mouseMoveQueryTimer = false;

			},

			/**
			 * Get the number of rinks at a given location when a user pauses the mouse there:
			 *
			 * @this {rinkwatch}
			 *
			 * @param {boolean} e - the onMouseMove event object for the map
			 *
			 */
			getCountOnMouseMove: function(e) {

				if (!this.queryOnClick) return; // If queryOnClick is set to false, this is an indication that something else, like drawing, is happening, so don't perform the query.

				// If there is a previous mousemove event, abort if it is the same location as the last mousemove event (mousemove gets repeatedly triggered in Chrome for no apparent reason)...otherwise, hide the tool tip.
				if (this._lastMouseMoveEvent) {
					if (this._lastMouseMoveEvent.screenPoint.x == e.screenPoint.x && this._lastMouseMoveEvent.screenPoint.y == e.screenPoint.y) return;
					else this.hideToolTip();
				}
				this._lastMouseMoveEvent = e;

				this.cancelMouseMove();

				var currentTimer = this._mouseMoveQueryTimer = setTimeout(lang.hitch(this, function() {
					var rinkwatchSettings = config.rinkwatchLayers[0];
					var rinkwatchQueryTask = new QueryTask(this.root+config.rinkwatchPublicUrl+"/"+rinkwatchSettings.index);

					var querySettings = config.defaultQuerySettings[rinkwatchSettings.querySettings];
					var query = new Query();
					query.outFields = querySettings.fields;

					query.returnGeometry = true;
					if (this.filter.allDQ) {
						query.where = this.filter.allDQ;
					}
					// var rinkwatchTemplate = new InfoTemplate(i18n.popup.title, popup.popupTemplate);

					// !!!
					var symbol = new PictureMarkerSymbol(this.rinkwatchRenderer.symbol.url, this.rinkwatchRenderer.symbol.width, this.rinkwatchRenderer.symbol.height);

					query.geometry = this.pointToExtent(e.mapPoint, this.rinkwatchRenderer.symbol.width);

					var sd = new StatisticDefinition();
					sd.outStatisticFieldName="total";
					sd.onStatisticField = "*";
					sd.statisticType = "count";

					query.outStatistics = [sd];

					rinkwatchQueryTask.execute(query, lang.hitch(this, function(r) {
							if (currentTimer == this._mouseMoveQueryTimer) {
								if (r && r.features && r.features[0] && r.features[0].attributes && r.features[0].attributes.total > 0) {
									this.showToolTip(r.features[0].attributes.total+i18n.mouseOver, e.screenPoint);
								}
							}
						}),
						lang.hitch(this, function(e) {
							if (currentTimer == this._mouseMoveQueryTimer) {
								// if (console && console.log) console.log("Error: ",e.message,e);
							}
						})
					);
				}), 500);

			},

			executeQueryTask: function(e) {

				if (!this.queryOnClick) return;

				var rinkwatchSettings = config.rinkwatchLayers[0];
				var rinkwatchQueryTask = new QueryTask(this.root+config.rinkwatchPublicUrl+"/"+rinkwatchSettings.index);

				var querySettings = config.defaultQuerySettings[rinkwatchSettings.querySettings];
				var query = new Query();
				query.outFields = querySettings.fields;
				query.where = "rink_user_id > 0";

				query.returnGeometry = true;
				if (this.filter.allDQ) {
						query.where = this.filter.allDQ;
					}
				var rinkwatchTemplate = new InfoTemplate(i18n.popup.title, popup.popupTemplate);

				var symbol = new PictureMarkerSymbol(this.rinkwatchRenderer.symbol.url, this.rinkwatchRenderer.symbol.width, this.rinkwatchRenderer.symbol.height);

				query.geometry = this.pointToExtent(e.mapPoint,this.rinkwatchRenderer.symbol.width);

				//var schoolFilter = this.getRinkwatchFilterDefinition();

				//if (schoolFilter) query.where += " and "+schoolFilter;

				rinkwatchQueryTask.execute(query, lang.hitch(this, function(fs) {

					this.map.graphics.clear();
					// var queryRoot = this.root+config.tables.url+"/";

						if (fs.features.length > 0) {
							// var readingQueryTask = new QueryTask(queryRoot+config.tables.layers.reading);
							// var readingQuery = new Query();
							// var curFeature = 0;
							// readingQuery.outFields = ["*"];
							// readingQuery.orderByFields = ["reading_time DESC"];
							// readingQuery.where = "reading_rink_id = '";
							// array.forEach(fs.features, function(f) {
							// 	curFeature++;
							// 	if (curFeature == fs.features.length) {
							// 		// Once all readings have been stored, attribute then to a rink id in the readingArray
							// 		readingQuery.where += f.attributes.id + "'";
							// 		readingQueryTask.execute(readingQuery, lang.hitch(this, function(featureSet) {
							// 			if (featureSet.features.length > 0) {
							// 				this.readingArray = [];
							// 				array.forEach(featureSet.features, function(feature) {
							// 					var rinkid = feature.attributes.reading_rink_id;
							// 					if (!this.readingArray[rinkid]) {
							// 						this.readingArray[rinkid] = [feature];
							// 					} else {
							// 						this.readingArray[rinkid].push(feature);
							// 					}
							// 				}, this);
							// 			}
							// 		})).then(lang.hitch(this, function() {
										array.forEach(fs.features, function(f) {
											if(this.readingArray) {
												var rinkid = f.attributes.id;
												console.log(f.attributes.id)
												if (this.readingArray[rinkid]) {
													f.attributes.reading = [];
													// Add the readingArray reading data to each rink for the infoTemplate
													if (this.readingArray[rinkid].length > 4) {
														var curRink = 0;
														array.some(this.readingArray[rinkid], function(r) {
															f.attributes.reading.push(r.attributes);
															curRink++;
															if (curRink > 4) {
																return true;
															}
														}, this);
													} else {
														f.attributes.reading.push(this.readingArray[rinkid][0].attributes);
													}
												}
											}
											f.setInfoTemplate(rinkwatchTemplate);
										}, this);

										// Display the infoWindow
										this.map.infoWindow.resize(querySettings.popupSize.w, querySettings.popupSize.h);
										this.map.infoWindow.clearFeatures();
										this.map.infoWindow.setFeatures(fs.features);
										this.map.infoWindow.show(fs.features[0].geometry);
										this.hideToolTip();

							// 		}));
							// 	} else {
							// 		// Create query string to find all readings
							// 		readingQuery.where += f.attributes.id + "' OR reading_rink_id = '";
							// 	}
							// }, this);
						}

				}));

			},

			// queryAlternateLayer: function(layerSettings, query, e) {

			// 	var layerSettings = layerSettings||config.rinkwatchLayers[config.alternateQueryLayer];

			// 	var layerQuerySettings = config.defaultQuerySettings[layerSettings.querySettings];
			// 	query.geometry = e.mapPoint;
			// 	query.where = null;
			// 	query.geometryPrecision = 0;
			// 	query.outFields = layerQuerySettings.fields;

			// 	var alternateQueryTask = new QueryTask(this.root+config.rinkwatchPublicUrl+"/"+layerSettings.index);

			// 	alternateQueryTask.execute(query,lang.hitch(this, function(fs) {

			// 		if (!fs.features || fs.features.length==0) {
			// 			if (layerSettings.index != config.alternateQueryLayer) this.queryAlternateLayer(config.alternateQueryLayer,query,e);
			// 			return;
			// 		}

			// 		this.map.graphics.clear();

			// 		var alternateQueryTemplate = new InfoTemplate(layerQuerySettings.popupTitle, layerQuerySettings.popupTemplate);
			// 		this.map.infoWindow.setTitle(layerQuerySettings.popupTitle);


			// 		array.forEach(fs.features, function(f) {
			// 			f.setInfoTemplate(alternateQueryTemplate);
			// 		});
			// 		this.map.infoWindow.resize(layerQuerySettings.popupSize.w,layerQuerySettings.popupSize.h);
			// 		this.map.infoWindow.clearFeatures();
			// 		this.map.infoWindow.setFeatures(fs.features);
			// 		this.map.infoWindow.show(fs.features[0].geometry.getExtent().getCenter());
			// 	}));

			// },

			pointToExtent: function(point, toleranceInPixels) {

				var pixelWidth = this.map.extent.getWidth() / this.map.width;
				var toleraceInMapCoords = toleranceInPixels * pixelWidth;
				return new Extent(point.x - toleraceInMapCoords,
					point.y - toleraceInMapCoords,
					point.x + toleraceInMapCoords,
					point.y + toleraceInMapCoords,
					this.map.spatialReference);

			},

			//Add the basemap gallery widget to the application
			addBasemapGallery: function() {

				// Prevent duplicate calls in IE7/IE8
				if (this.basemapGallery) return;

				var cp = new ContentPane({
					"id": "basemapGallery",
					"class": "claro"
				});

				// If a bing maps key is provided - display bing maps too.
				this.basemapGallery = new BasemapGallery({
					showArcGISBasemaps: true,
					map: this.map
				}, domConstruct.create("div"));

				cp.set("content", this.basemapGallery.domNode);

				this.basemapGalleryDropDown = new DropDownButton({
					label: i18n.toolbar.buttons.basemapBtn,
					id: "basemapBtn",
					iconClass: "basemapIcon",
					style: "padding: 3px 0px 0px 0px;",
					dropDown: cp
				}).placeAt(registry.byId("toolbar"));

				// For lower resolutions
				this.basemapGalleryDropDownSmall = new DropDownButton({
					id: "basemapBtnSmall",
					iconClass: "basemapIcon",
					title: i18n.toolbar.buttons.basemapBtnTitle,
					style: "padding: 3px 0px 0px 0px;",
					dropDown: cp
				}).placeAt(registry.byId("toolbar"));


				// this.basemapGalleryDropDown.set("iconClass", "basemapIcon");

				// Remove labels from map once initial basemap is changed
				var osc = on(this.basemapGallery, "selection-change", lang.hitch(this, function() {
					osc.remove();
					if (this.referenceBasemap) {
						this.map.removeLayer(this.referenceBasemap);
					}
				}));

				on(this.basemapGallery, "selection-change", function() {
					registry.byId("basemapBtn").closeDropDown();
					registry.byId("basemapBtnSmall").closeDropDown();
				});

				this.basemapGallery.startup();

			},

			/**
			 * Creates a geocoder in the toolbar and displays results
			 *
			 * @this {rinkwatch}
			 */
			addGeocoder: function() {

				// Create the geocoder
				this.searchWrapper = domConstruct.create("d", {
					id: "searchWrapper"
				}, dom.byId("toolbar"));

				this.geocoder = new Geocoder({
					map: this.map,
					arcgisGeocoder: {
						sourceCountry: "CAN",
						placeholder: i18n.toolbar.geocoder.placeholder
					}
				}, this.searchWrapper);

				this.geocoder.startup();
				this.geocoder.focus();

				 var searchSymbol = new PictureMarkerSymbol({
					"angle":0,
					"xoffset":0,
					"yoffset": 0,
					"type":"esriPMS",
					"url":"http://static.arcgis.com/images/Symbols/Shapes/BluePin1LargeB.png",
					"contentType":"image/png",
					"width":24,
					"height":24
				});

				var searchTemplate = new InfoTemplate(i18n.toolbar.geocoder.template, "${name}");

				// Display results of geocoder
				on(this.geocoder, "find-results", lang.hitch(this, function(response) {
					// Hide the info window if displayed
					if (this.map.infoWindow.isShowing) {
						this.map.infoWindow.hide();
					}
					this.map.graphics.clear();
					array.forEach(response.results.results, function(r) {
						r.feature.attributes.name = r.name;
						r.feature.setSymbol(searchSymbol);
						r.feature.setInfoTemplate(searchTemplate);
						this.map.graphics.add(r.feature);
					}, this);
				}));

			},

			// Create a menu with a list of operational layers. Each menu item contains a check box
			// that allows users to toggle layer visibility.
			addLayerList: function() {

				// Prevent duplicate calls to this in IE7/IE8
				if (this.layerMenu) return;

				this.layerMenu = new Menu({
					id: "layerMenu"
				});

				// Menu item for toggling schools layers
				this.schoolsLayerItem = new CheckedMenuItem({
					label: "Schools",
					checked: true //(this.rinkwatchLayer.visibleLayers.indexOf(config.schools1)>=0)
				});

				on(this.schoolsLayerItem,"change", lang.hitch(this, function () {
					this.toggleRinkwatchLayers([config.rinkwatchLayers[0].index], this.schoolsLayerItem.checked);
				}));

				this.layerMenu.addChild(this.schoolsLayerItem);

				// Menu items for toggling school filters:
				this.sfAll = this.makeSchoolFilterRadioMenuItem("All Schools", null, "rinkwatchFilters");
					this.layerMenu.addChild(this.sfAll);
				this.sfHED = this.makeSchoolFilterRadioMenuItem("University / College", "edu_level in (4, 5, 6)", "rinkwatchFilters");
					this.layerMenu.addChild(this.sfHED);
				this.sfAllK12 = this.makeSchoolFilterRadioMenuItem("Primary/Secondary Schools (K-12)", "edu_level in (1, 2, 3)", "rinkwatchFilters");
					this.layerMenu.addChild(this.sfAllK12);
				this.sfPrimary = this.makeSchoolFilterRadioMenuItem("Primary Schools (K-6)", "edu_level in (1)", "rinkwatchFilters");
					this.layerMenu.addChild(this.sfPrimary);
				this.sfSecondary = this.makeSchoolFilterRadioMenuItem("Secondary Schools (7-12)", "edu_level in (2)", "rinkwatchFilters");
					this.layerMenu.addChild(this.sfSecondary);
				//this.sfOnlyK12 = this.makeSchoolFilterRadioMenuItem("K-12 Schools","edu_level in (3)","rinkwatchFilters");
					//this.layerMenu.addChild(this.sfOnlyK12);
				//this.sfUnknown = this.makeSchoolFilterRadioMenuItem("Unknown Schools","edu_level in (0)","rinkwatchFilters");
					//this.layerMenu.addChild(this.sfUnknown);

				this.layerMenu.addChild(new MenuSeparator());
				this.layerMenu.addChild(new MenuSeparator());

				var layerGroups = {};
				array.forEach(config.rinkwatchLayers, function(l, i) {
					if (i>0) {// Skip the first layer, which should be the schools layer...
						if (!l.groupname) {
							this.layerMenu.addChild(this.makeMarketLayerRadioMenuItem(l.label, [l.index], "backgroundLayers"));
						} else {
							layerGroups[l.groupname] = layerGroups[l.groupname]||{name:l.groupname,indexes:[]};
							layerGroups[l.groupname].indexes.push(l.index);
						}
					}
				}, this);

				functional.forIn(layerGroups, function(g, i) {
					this.layerMenu.addChild(this.makeMarketLayerRadioMenuItem(g.name, g.indexes, "backgroundLayers"));
				}, this);

				/*
				// Menu item for toggling boards layer
				this.boardsLayerItem = this.makeMarketLayerRadioMenuItem("School Boards",[config.boards],"backgroundLayers");
					this.layerMenu.addChild(this.boardsLayerItem);

				// Menu items for toggling demographic layers
				this.dem0509 = this.makeMarketLayerRadioMenuItem("Total Population (aged 5-9)",[config.da0509,config.csd0509,config.pr0509],"backgroundLayers");
					this.layerMenu.addChild(this.dem0509);
				this.dem1014 = this.makeMarketLayerRadioMenuItem("Total Population (aged 10-14)",[config.da1014,config.csd1014,config.pr1014],"backgroundLayers");
					this.layerMenu.addChild(this.dem1014);
				this.dem1519 = this.makeMarketLayerRadioMenuItem("Total Population (aged 15-19)",[config.da1519,config.csd0509,config.pr1519],"backgroundLayers");
					this.layerMenu.addChild(this.dem1519);
				this.dem2024 = this.makeMarketLayerRadioMenuItem("Total Population (aged 20-24)",[config.da2024,config.csd2024,config.pr2024],"backgroundLayers");
					this.layerMenu.addChild(this.dem2024);
				*/

				this.layerDropDown = new DropDownButton({
					label: "Layers",
					id: "layerBtn",
					iconClass: "esriLayerIcon",
					// title: "Layers",
					style: "padding: 3px 0px 0px 0px;",
					dropDown: this.layerMenu
				}).placeAt(registry.byId("toolbar"));

			},

			/**
			 * Turn layers on/off in a dynamic map layer...
			 * @author mleahy
			 *
			 * @this {rinkwatch}
			 *
			 * @param {array} ids - the layer ids to toggle
			 * @param {boolean} on - the state to toggle to
			 * @param {boolean} skipRefresh - specify whether to refresh the map layer
			 * @param {ArcGISDynamicMapServiceLayer} l - the map service to toggle layers in (if not specified, defaults to this.rinkwatchLayer).
			 */
			toggleRinkwatchLayers: function(ids, on, skipRefresh, l) {

				l = l || this.rinkwatchLayer;

				if (!l) return;

				if (on) {
					l.setVisibleLayers(l.visibleLayers.concat(ids), skipRefresh);
					if (!l.visible) l.show();
				} else {
					var visLayers = [], prevVisLayers = l.visibleLayers.length;
					array.forEach(l.visibleLayers, function(l, i) {
						if (ids.indexOf(l)==-1) visLayers.push(l);
					}, this);
					l.setVisibleLayers(visLayers, skipRefresh);
					if (visLayers.length === 0) l.hide();
				}

			},

			/**
			 * Makes a radio item for switching between layers
			 * @author mleahy
			 *
			 * @this {rinkwatch}
			 *
			 * @param {string} label - the name of the menu item
			 * @param {array} ids - the layer ids associated with the selected item
			 * @param {string} listId - a list ID (items in the dropdown list with the same list ID will be treated as mutually exclusive options);
			 *
			 * @return {CheckedMenuItem}
			 */
			makeMarketLayerRadioMenuItem: function(label, ids, listId) {

				if (!this.layerLists[listId]) this.layerLists[listId] = {};

				var layerGroup = this.layerLists[listId];
				var item = new CheckedMenuItem({
					label: label,
					checked: (this.rinkwatchLayer.visibleLayers.indexOf(ids[0])>=0)
				});

				on(item, "change", lang.hitch(this, function() {
					if (!this._toggling) {
						this._toggling = true;
						if (layerGroup._lastRadioChecked) {
							layerGroup._lastRadioChecked.set("checked", false);
							layerGroup._lastRadioChecked.onChange();
						}
						this._toggling = false;
						layerGroup._lastRadioChecked = item;
					}

					this.toggleRinkwatchLayers(ids, item.checked, this._toggling);

					// Manually set the style to the claro radio icon...
					domStyle.set($(".dijitMenuItemIcon", item.domNode)[0], {"backgroundPosition": (item.checked?"-92px 50%":"-107px 50%")});

				}));
				domStyle.set($(".dijitMenuItemIcon", item.domNode)[0], {"backgroundPosition": (item.checked?"-92px 50%":"-107px 50%")});
				if (item.checked) layerGroup._lastRadioChecked = item;
				return item;

			},

			/**
			 * Makes a radio item for switching between filters on the Schools layer
			 * @author mleahy
			 *
			 * @this {rinkwatch}
			 *
			 * @param {string} label - the name of the menu item
			 * @param {string} filter - the filter that gets added to the school layer definitions when this item is selected
			 * @param {string} listId - a list ID (items in the dropdown list with the same list ID will be mutually exclusive options)
			 *
			 * @return {CheckedMenuItem}
			 */
			makeSchoolFilterRadioMenuItem: function(label, filter, listId) {

				if (!this.layerLists[listId]) this.layerLists[listId] = {};

				var layerGroup = this.layerLists[listId];

				var item = new CheckedMenuItem({
					label: label,
					checked: (this.rinkwatchFilters.layerFilter==filter || !this.rinkwatchFilters.layerFilter && !filter)
				});

				on(item, "change", lang.hitch(this, function() {
					if (!this._toggling) {
						this._toggling = true;
						item.set("checked", true);
						if (layerGroup._lastRadioChecked && layerGroup._lastRadioChecked != item) {
							layerGroup._lastRadioChecked.set("checked", false);
							layerGroup._lastRadioChecked.onChange();
						}
						this._toggling = false;
						layerGroup._lastRadioChecked = item;
					}

					if (item.checked) {
						this.rinkwatchFilters.layerFilter = filter;
						this.rinkwatchLayer.layerInfos[config.rinkwatchLayers[0].index].name = /*this.rinkwatchLayer.layerInfos[config.schools2].name =*/ label;
						this.updaterinkwatchFilterDefinition();
					}

					if (!this._toggling) {
						//this.legend.refresh();
						// this.report.loadSummary(); // Comment out for now
					}

					// Manually set the style to the claro radio icon...
					domStyle.set($(".dijitMenuItemIcon", item.domNode)[0], {"marginLeft":"10px", "backgroundPosition": (item.checked?"-92px 50%":"-107px 50%")});

				}));

				domStyle.set($(".dijitMenuItemIcon", item.domNode)[0], {"marginLeft":"10px", "backgroundPosition": (item.checked?"-92px 50%":"-107px 50%")});
				if (item.checked) layerGroup._lastRadioChecked = item;
				return item;

			},

			/**
			 * Returns the id for the first layer that matches a given name from the layerInfo of a dynamic map service.
			 * @author mleahy
			 *
			 * @this {rinkwatch}
			 *
			 * @param {string} n - the name of the layer to look for
			 * @param {ArcGISDynamicMapServiceLayer} l - the layer to search for (if not specified, defaults to this.rinkwatchLayer).
			 *
			 * @return {integer}
			 */
			getLayerID: function(n, l) {

				l = l || this.rinkwatchLayer;

				if (!l) return;

				for (var i=0;i<l.layerInfos.length;i++)
				{
					if (l.layerInfos[i].name==n) return l.layerInfos[i].id;
				}

			},

			/**
			 * Returns the SQL layer definition for a rinkwatch layer based on the items stored in this.rinkwatchFilters
			 *
			 * @this {rinkwatch}
			 *
			 * @return {string}
			 */
			getRinkwatchFilterDefinition: function() {

				var d = [];
				functional.forIn(this.rinkwatchFilters, function(f, i) {
					if (f) d.push(f);
				});
				if (d.length>0) return d.join(" and ");

			},

			/**
			 * Updates the filter on the schools layers (without altering the filters on the other layers).
			 *
			 * @this {rinkwatch}
			 *
			 * @param {boolean} skipRefresh - if true, the map will not be refreshed automatically.
			 *
			 */
			updateRinkwatchFilterDefinition: function(skipRefresh) {

				var defs = ([]).concat(this.rinkwatchLayer.layerDefinitions);
				defs[config.rinkwatchLayers[0].index] = this.getRinkWatchFilterDefinition();
				this.rinkwatchLayer.setLayerDefinitions(defs, skipRefresh);

			},

			/**
			 * Displays a tooltip
			 *
			 * @this {rinkwatch}
			 *
			 * @param {string} tipText - the text to show in the tooltip
			 * @param {Point} screenPoint - the location on the screen to display the tooltip
			 *
			 */
			showToolTip: function(tipText, screenPoint) {

				if (!this._toolTipDiv) {
					this._toolTipDiv = domConstruct.create("div", {"class":"emTooltip"}, win.body());
					on(this.map, "click", lang.hitch(this, function() {
						this.hideToolTip();
					}));
				}
				domConstruct.empty(this._toolTipDiv);
				domConstruct.create("span", {innerHTML:tipText}, this._toolTipDiv);
				domStyle.set(this._toolTipDiv, {display:"block", top:(this.map.position.y+screenPoint.y-20)+"px", left:(this.map.position.x+screenPoint.x+10)+"px"});
				this._toolTipVisible = true;

			},

			/**
			 * Hides the tooltip
			 *
			 * @this {rinkwatch}
			 *
			 */
			hideToolTip: function() {

				if (this._toolTipDiv) {
					domStyle.set(this._toolTipDiv, {"display":"none"});
					domConstruct.empty(this._toolTipDiv);
					this._toolTipVisible = false;
				}

			},

			/**
			 * Loads previously stored cookie at start of session
			 *
			 * @this {rinkwatch}
			 *
			 */
			loadCredentials: function() {

				var idJson = cookie(this.cred);

				if ( idJson && idJson != "null" && idJson.length > 4) {
					var idObject = JSON.parse(idJson);
					// esri.id.initialize(idObject);
					// Delete cookies for this version of app
					cookie(this.cred, null, {expires:-1});
					console.log("deleting credentials");
					this.credCheck = true;
				} else {
					console.log("no credentials to load");
					this.credCheck = false;
				}

			},

			/**
			 * Stores cookie at end of session
			 *
			 * @this {rinkwatch}
			 *
			 */
			storeCredentials: function() {

				// Make sure there are some credentials to persist
				if ( esri.id.credentials.length === 0 ) {
					return;
				}

				if (this.cred !== "logout") {
					// Serialize the ID manager state to a string
					var idString = JSON.stringify(esri.id.toJson());

					// Store a cookie
					cookie(this.cred, idString, {
						expires: 24
					});
					console.log("wrote credentials");
				}

			},

			/**
			 * Resize buttons to appropriate dimension based on window size
			 *
			 * @this {rinkwatch}
			 *
			 */
			resizeButtons: function() {

				var windowWidth = dojoWindow.getBox().w;
				var toolbarWidth = registry.byId("toolbar").domNode.clientWidth;
				var logoWidth = 208;
				if ((windowWidth - 1200) > logoWidth) {
						domStyle.set(registry.byId("basemapBtnSmall").domNode, "display", "none");
						domStyle.set(registry.byId("menuBtnSmall").domNode, "display", "none");
						domStyle.set(registry.byId("extentBtnSmall").domNode, "display", "none");
						domStyle.set(registry.byId("basemapBtn").domNode, "display", "inline-block");
						domStyle.set(registry.byId("menuBtn").domNode, "display", "inline-block");
						domStyle.set(registry.byId("extentBtn").domNode, "display", "inline-block");
						// if (registry.byId("readingBtn")) {
						// 	domStyle.set(registry.byId("readingBtnSmall").domNode, "display", "none");
						// 	domStyle.set(registry.byId("readingBtn").domNode, "display", "inline-block");
						// }
					} else {
						domStyle.set(registry.byId("basemapBtn").domNode, "display", "none");
						domStyle.set(registry.byId("menuBtn").domNode, "display", "none");
						domStyle.set(registry.byId("extentBtn").domNode, "display", "none");
						domStyle.set(registry.byId("basemapBtnSmall").domNode, "display", "inline-block");
						domStyle.set(registry.byId("menuBtnSmall").domNode, "display", "inline-block");
						domStyle.set(registry.byId("extentBtnSmall").domNode, "display", "inline-block");
						// if (registry.byId("readingBtn")) {
						// 	// domStyle.set(registry.byId("readingBtnSmall").domNode, "display", "inline-block");
						// 	// domStyle.set(registry.byId("readingBtn").domNode, "display", "none");
						// 	domStyle.set(registry.byId("readingBtnSmall").domNode, "display", "none");
						// 	domStyle.set(registry.byId("readingBtn").domNode, "display", "inline-block");
						// }
					}

			 },

			/**
			 * If the user has logged in with a RinkWatch account, modify user interface to allow the user to report rink readings
			 *
			 * @this {rinkwatch}
			 *
			 */
			modifyInterface: function() {

				this.hasAccount = true;

				this.username = esri.id.credentials[0].userId;
				this.setToolbar(this.username);
				registry.byId("toolbar").addChild(this.userTools);
				this.setLayers();
				this.rink = new rink(this);
				this.reading = new reading(this);

			},

			/**
			 * Set the rinksLayer depending on the level of user
			 *
			 * @this {rinkwatch}
			 *
			 */
			setLayers: function() {

				if (this.rinksLayer) {
					this.map.removeLayer(this.rinksLayer);
					domConstruct.destroy(this.rinksLayer.domNode);
				}

				if (this.hasAccount) {
					this.rinksLayer = new FeatureLayer(this.root + config.rinkwatchFeatures, {
						"mode": FeatureLayer.MODE_ONDEMAND,
						"visible": false
					});
					this.rinksPublicLayer = new FeatureLayer(this.root + config.rinkwatchPublicFeatures, {
						"mode": FeatureLayer.MODE_ONDEMAND,
						"visible": false
					});
					this.readingsTable = new FeatureLayer(this.root + config.readingsTable);
					this.rinksTable = new FeatureLayer(this.root + config.rinksTable);
					if (!this.usersTable) {
						this.usersTable = new FeatureLayer(this.root + config.usersTable);
					}
				} else {
					this.rinksLayer = new FeatureLayer(this.root + config.rinkwatchPublicFeatures, {
						"mode": FeatureLayer.MODE_ONDEMAND,
						"visible": false
					});
				}

				this.map.addLayer(this.rinksLayer);

			},

			/**
			 * Set the renderer for any ArcGISMapServiceLayer
			 *
			 * @this {rinkwatch}
			 *
			 * @param {layer} layer - the layer to set the renderer for
			 * @param {integer} i - the index of that layer which values are stored under in the config/language settings
			 */
			setRendererSettings: function(layer, i) {

				var renderer = jsonUtils.fromJson(config.rendererSettings[i]);
				renderer.label = i18n.legend.layers[i];
				var drawingOptions = [];
				var drawingOption = new LayerDrawingOptions();
				drawingOption.renderer = renderer;
				drawingOptions.push(drawingOption);
				layer.setLayerDrawingOptions(drawingOptions);

			},

			/**
			 * Set the layer definition for any ArcGISMapServiceLayer
			 *
			 * @this {rinkwatch}
			 *
			 * @param {layer} layer - the layer to set the definition for
			 * @param {string} defQuery - the query string defining how the layer will be displayed
			 */
			setLD: function(layer, defQuery) {

				var layerDefs = [];
				layerDefs.push(defQuery);
				layer.setLayerDefinitions(layerDefs);

			},

			/**
			 * Reset the extent when the window size is changed
			 *
			 * @this {rinkwatch}
			 *
			 */
			resizeMap: function() {

				var resizeTimer;
				clearTimeout(resizeTimer);
				resizeTimer = setTimeout(lang.hitch(this, this.showPreviousExtent), 500);

			},

			/**
			 * Store the previous extent of the map to be used for zooming to previous extent or browser resizing
			 *
			 * @this {rinkwatch}
			 *
			 */
			saveExtent: function(evt) {

				if(!this.changeExtent) {
					this.changeExtent = evt.extent;
					this.previousExtent = evt.extent;
				} else {
					this.previousExtent = this.changeExtent;
					this.changeExtent = evt.extent;
				}

			},

			showPreviousExtent: function() {

				if (this.changeExtent) {
					this.map.setExtent(this.previousExtent);
					this.map.resize();
					this.map.reposition();
				}

			},

			switchLocale: function() {

				var redirect;
				if (i18n.toolbar.buttons.switchLocale && i18n.toolbar.buttons.switchLocale == "English") {
					redirect = window.location.href.replace(/\?ln=fr/, "");
					window.location.href = redirect;
				} else {
					redirect = window.location.href + "?ln=fr";
					window.location.href = redirect;
				}

			},

			gup: function(name) { // from Netlobo.com

				name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
				var regexS = "[\\?&]" + name + "=([^&#]*)";
				var regex = new RegExp(regexS);
				regex.exec(window.location.href)
				if (results === null) {
					return "";
				} else {
					return results;
				}

			},

			signIn: function() {

				var idObject = {
					"serverInfos": [{
						"server": this.root,
						"tokenServiceUrl": this.root + "/arcgis/tokens/",
						"adminTokenServiceUrl": this.root + "/arcgis/admin/generateToken",
						"shortLivedTokenValidity": config.tokenExpiration,
						"currentVersion": 10.2,
						"hasServer": true
					}],
					"credentials": [{
						"userId": this.userid,
						"server": this.root,
						"token": this.token,
						"expires": this.expires,
						"validity": config.tokenExpiration,
						"ssl": false,
						"creationTime": (new Date()).getTime(),
						"scope": "server",
						"resources": [this.root + config.rinkwatchUrl]
					}]
				};
				// Log the user into their new account
				esri.id.initialize(idObject);
				this.checkUserTable();

			},

			logInUser: function() {

				this.def = new Deferred();
				// If no cookie, send request to check if user is logged in
				this.token = gup("token");
				// replace urlencoded %40 with @ sign if needed for email address
				this.userid = gup("user").replace(/%40/, "@");
				this.expires = Number(gup("expires"));
				this.id = gup("id");
				if (this.token !== null && this.token.length > 0 && this.userid !== null && this.userid.length > 0 && this.expires !== null && esri.id.credentials.length === 0) {
						this.signIn();
				} else {
					this.def.resolve("not loaded");
				}
				return this.def;

			},

			addUserToTable: function() {

				// Create users table if not already instantiated
				if (!this.userTable) {
					this.usersTable = new FeatureLayer(this.root + config.usersTable);
				}
				var d = new Date();
				var date = d.toLocaleDateString() + " " + d.toLocaleTimeString();
				var user = {
					"attributes": {
						"id": this.id,
						"username": this.userid,
						"email":this.userid,
						"date_joined": date
					}
				};
				this.usersTable.applyEdits([user], null, null, lang.hitch(this, function() {
					this.def.resolve("loaded user added");
				}));

			},

			checkUserTable: function() {

				var queryRoot = this.root+config.tables.url+"/";

				var userQueryTask = new QueryTask(queryRoot+config.tables.layers.user);
				var userQuerySettings = config.defaultQuerySettings.user;

				var userName = this.userid;

				var userQuery = new Query();
				userQuery.where = "username = '" + userName + "'";
				userQuery.outFields = ["id"];
				userQuery.orderByFields = ["id DESC"];
				userQueryTask.execute(userQuery, lang.hitch(this, function(fs) {
					if (fs.features && fs.features.length > 0) {
						this.def.resolve("loaded user check");
					} else {
						this.addUserToTable();
					}
				}));

			}

		});
	}
);
