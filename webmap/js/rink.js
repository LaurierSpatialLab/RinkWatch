define(
	[

		"dojo/aspect",
		"dojo/dom",
		"dojo/dom-construct",
		"dojo/dom-style",
		"dojo/keys",
		"dojo/on",
		"dojo/query",
		"dojo/_base/array",
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/date/stamp",
		"dojo/i18n!./nls/text",

		"dijit/registry",
		"dijit/form/Button",
		"dijit/form/Select",
		"dijit/layout/ContentPane",

		"dojox/mobile/TextBox",
		"dojox/mobile/TextArea",

		"esri/graphic",
		"esri/SpatialReference",
		"esri/dijit/Popup",
		"esri/dijit/PopupMobile",
		"esri/layers/ArcGISDynamicMapServiceLayer",
		"esri/symbols/PictureMarkerSymbol",
		"esri/tasks/GeometryService",
		"esri/tasks/ProjectParameters",
		"esri/tasks/query",
		"esri/tasks/QueryTask",
		"esri/toolbars/draw",
		"esri/toolbars/edit",

		"./chart",
		"./config",

		"modules/BusyButton"

	], function(

		aspect,
		dom,
		domConstruct,
		domStyle,
		keys,
		on,
		$,
		array,
		declare,
		lang,
		stamp,
		i18n,

		registry,
		Button,
		Select,
		ContentPane,

		mTextBox,
		mTextArea,

		Graphic,
		SpatialReference,
		Popup,
		PopupMobile,
		ArcGISDynamicMapServiceLayer,
		PictureMarkerSymbol,
		GeometryService,
		ProjectParameters,
		Query,
		QueryTask,
		Draw,
		Edit,

		chart,
		config,

		BusyButton

	) {

		return declare(null, {

			constructor: function(rinkwatch) {

				this.rinkwatch = rinkwatch;
				this.createRinkPane();
				this.getUserInfo(this.rinkwatch.username);
				this.loadRinks();

				this.rinkPointSymbol = new PictureMarkerSymbol(config.rendererSettings[3].symbol);

				this.geomService = new GeometryService(config.geomServiceUrl);

				on(this.addRink, "click", lang.hitch(this, function() {
					this.draw.activate(Draw.POINT);
				}));
				on(this.editRink, "click", lang.hitch(this, function() {
					this.editRinkPopup();
					this.showEditRinkPopup();
				}));

				on(this.deleteRink, "click", lang.hitch(this, function() {
					this.deleteRinkPopup();
					this.showDeleteRinkPopup();
				}));

				on(this.curRink, "change", lang.hitch(this, this.getReadings));
				on(this.zoomToRink, "click", lang.hitch(this, this.centerAndZoom));

			},

			createRinkPane: function() {

				if (!this.rinkPane) {
					this.menuAccordion = registry.byId("menuAccordion");

					this.rinkPane = new ContentPane({
						"id": "rinkPane",
						"class": "claro",
						"title": i18n.rink.pane.title
					});

					// curRink Select
					domConstruct.create("label", {
						"for": "curRink",
						"innerHTML": i18n.rink.pane.curRink
					}, this.rinkPane.domNode);
					domConstruct.create("br", null, this.rinkPane.domNode);
					this.curRink = new Select({
						"id": "curRink",
						"forceWidth": true
					});
					this.rinkPane.addChild(this.curRink);
					domConstruct.create("br", null, this.rinkPane.domNode);
					domConstruct.create("br", null, this.rinkPane.domNode);

					// zoomToRink Button
					this.zoomToRink = new Button({
						"id": "zoomToRink",
						"label": i18n.rink.pane.zoomToRink
					});
					this.rinkPane.addChild(this.zoomToRink);
					domConstruct.create("br", null, this.rinkPane.domNode);
					domConstruct.create("br", null, this.rinkPane.domNode);

					// addRink Button
					this.addRink = new Button({
						"id": "addRink",
						"label": i18n.rink.pane.addRink
					});
					this.rinkPane.addChild(this.addRink);
					domConstruct.create("br", null, this.rinkPane.domNode);

					this.editRink = new Button({
						"id": "editRink",
						"label": i18n.rink.pane.editRink
					});
					this.rinkPane.addChild(this.editRink);

					this.deleteRink = new Button({
						"id": "deleteRink",
						"label": i18n.rink.pane.deleteRink
					});
					this.rinkPane.addChild(this.deleteRink);

					domConstruct.create("br", null, this.rinkPane.domNode);
					domConstruct.create("br", null, this.rinkPane.domNode);

					// rink stats spans
					domConstruct.create("span", {
						"innerHTML": "<b>" + i18n.rink.pane.stats.title + "</b>"
					}, this.rinkPane.domNode);
					domConstruct.create("br", null, this.rinkPane.domNode);

					domConstruct.create("label", {
						"for": "totalReadings",
						"innerHTML": i18n.rink.pane.stats.readings
					}, this.rinkPane.domNode);
					domConstruct.create("br", null, this.rinkPane.domNode);
					this.totalReadings = domConstruct.create("span", {
						"id": "totalReadings"
					}, this.rinkPane.domNode);
					domConstruct.create("br", null, this.rinkPane.domNode);

					domConstruct.create("label", {
						"for": "percentSkateable",
						"innerHTML": i18n.rink.pane.stats.skateable
					}, this.rinkPane.domNode);
					domConstruct.create("br", null, this.rinkPane.domNode);
					this.percentSkateable = domConstruct.create("span", {
						"id": "percentSkateable"
					}, this.rinkPane.domNode);
					domConstruct.create("br", null, this.rinkPane.domNode);

					domConstruct.create("label", {
						"for": "lastReading",
						"innerHTML": i18n.rink.pane.stats.lastReading
					}, this.rinkPane.domNode);
					domConstruct.create("br", null, this.rinkPane.domNode);
					this.lastReading = domConstruct.create("span", {
						"id": "lastReading"
					}, this.rinkPane.domNode);
					domConstruct.create("br", null, this.rinkPane.domNode);
					domConstruct.create("br", null, this.rinkPane.domNode);

					// rinkChart div
					domConstruct.create("div", {
						"id": "chartLegend"
					}, this.rinkPane.domNode);
					domConstruct.create("div", {
						"id": "rinkChart"
					}, this.rinkPane.domNode);

					this.menuAccordion.addChild(this.rinkPane);
					// this.menuAccordion.selectChild(this.rinkPane, true);
				}

			},

			loadRinks: function() {

				if (!this.rinkQueryTask) {
					this.rinkQueryTask = new QueryTask(this.rinkwatch.root + config.rinkwatchFeatures);
					this.createDrawToolbar();
				}

			},

			addToMap: function(geometry) {

				this.draw.deactivate();
				this.rinkPoint = new Graphic(geometry);
				this.rinkPoint.setSymbol(this.rinkPointSymbol);
				this.rinkwatch.map.graphics.add(this.rinkPoint);
				this.projectToLatLong(this.rinkPoint);
				this.createRinkPopup();
				this.showRinkPopup(this.rinkPoint);
			},

			createDrawToolbar: function() {

				this.draw = new Draw(this.rinkwatch.map);
				on(this.draw, "draw-end", lang.hitch(this, this.addToMap));

				aspect.after(this.draw, "activate", lang.hitch(this, function() {
					this.rinkwatch.queryOnClick = false;
					this.rinkwatch.rinkwatchMenu.hide();
					this.rinkwatch.map.graphics.clear();
					this.rinkwatch.map.infoWindow.hide();
					var onEsc = on(document, "keydown", lang.hitch(this, function(e) {
						if (e.keyCode === keys.ESCAPE) {
							onEsc.remove();
							if (!this.rinkwatch.queryOnClick) {
								this.rinkwatch.rinkwatchMenu.show();
								this.draw.deactivate();
							}
						}
					}));
					// Clear single points that can be selected when the clusterLayer is activated
					if (this.rinkwatch.visual.clusterLayer) {
						this.rinkwatch.visual.clusterLayer.clearSingles();
					}
				}));

				aspect.after(this.draw, "deactivate", lang.hitch(this, function() {
					this.rinkwatch.queryOnClick = true;
				}));

			},

			createRinkPopup: function() {
				if (!this.rinkPopup) {

					this._popupDiv = domConstruct.create("div");
					this.rinkPopup = new Popup(null, this._popupDiv);

					this.rinkPopup.setTitle(i18n.rink.dialog.title);
					this.rinkPopup.setMap(this.rinkwatch.map);

					// rinkName mTextBox
					domConstruct.create("label", {
						"for":"rinkName",
						innerHTML: "<b>" + i18n.rink.dialog.rinkName + "</b>"
					}, this.rinkPopup._contentPane);
					domConstruct.create("br", null, this.rinkPopup._contentPane);
					this.rinkName = new mTextBox({
						"id": "rinkName"
					});
					this.rinkName.placeAt(this.rinkPopup._contentPane);
					domConstruct.create("br", null, this.rinkPopup._contentPane);
					domConstruct.create("br", null, this.rinkPopup._contentPane);

					//rinkDesc mTextArea
					domConstruct.create("label", {
						"for":"rinkDesc",
						innerHTML: "<b>" + i18n.rink.dialog.rinkDesc + "</b>"
					}, this.rinkPopup._contentPane);
					this.rinkDesc = new mTextArea({
						"id": "rinkDesc",
						"rows": 5,
						"cols": 27
					});
					this.rinkDesc.placeAt(this.rinkPopup._contentPane);
					domConstruct.create("br", null, this.rinkPopup._contentPane);

					// textAttach form/mTextBox
					this.input = domConstruct.create("input", {
						"type": "hidden"
					}, this.frmAttach);
					this.frmAttach = domConstruct.create("form", {
						"enctype": "multipart/form-data",
						"method": "POST"
					}, this.rinkPopup._contentPane);
					this.lblAttach = domConstruct.create("label", {
						"for": "rinkTxtAttach",
						"innerHTML": i18n.rink.dialog.rinkPhoto
					}, this.frmAttach);
					domConstruct.create("br", null, this.frmAttach);
					this.rinkTxtAttach = new mTextBox({
						"id": "rinkTxtAttach",
						"type": "file",
						"name": "attachment",
						"accept": "image/*"
					}).placeAt(this.frmAttach);
					domConstruct.create("br", null, this.rinkPopup._contentPane);
					domConstruct.create("br", null, this.rinkPopup._contentPane);

					// rinkButtons ContentPane
					this.rinkButtons = new ContentPane({
						"id": "rinkButtons",
						"class": "claro"
					});

					// rinkCreate BusyButton
					this.rinkCreate = new BusyButton({
						"id": "rinkCreate",
						"label": i18n.rink.dialog.rinkCreate.label,
						"busyLabel": i18n.rink.dialog.rinkCreate.busyLabel
					});
					this.rinkButtons.addChild(this.rinkCreate);

					// rinkCancel Button
					this.rinkCancel = new Button ({
						"id": "rinkCancel",
						"label": i18n.rink.dialog.rinkCancel.label
					});
					this.rinkButtons.addChild(this.rinkCancel);

					this.rinkButtons.placeAt(this.rinkPopup._contentPane);

					on(this.rinkCreate, "click", lang.hitch(this, this.addNewRink));
					on(this.rinkCancel, "click", lang.hitch(this, function() {
						this.rinkPopup.hide();
					}));
					on(this.rinkPopup, "hide", lang.hitch(this, this.popupHide));
				}
			},

			editRinkPopup: function() {
				if (!this.rinkPopupEdit) {

					this._popupDiv = domConstruct.create("div");
					this.rinkPopupEdit = new Popup(null, this._popupDiv);

					this.getCurrentRink();

					this.rinkPopupEdit.setTitle(i18n.rink.dialog.edittitle);
					this.rinkPopupEdit.setMap(this.rinkwatch.map);
				if(this.currentRink.id > 0){
					// rinkName mTextBox
					domConstruct.create("label", {
						"for":"rinkNameEdit",
						innerHTML: "<b>" + i18n.rink.dialog.rinkName + "</b>"
					}, this.rinkPopupEdit._contentPane);
					domConstruct.create("br", null, this.rinkPopupEdit._contentPane);
					this.rinkNameEdit = new mTextBox({
						"id": "rinkNameEdit",
						"value": this.currentRink.name
					});
					this.rinkNameEdit.placeAt(this.rinkPopupEdit._contentPane);
					domConstruct.create("br", null, this.rinkPopupEdit._contentPane);
					domConstruct.create("br", null, this.rinkPopupEdit._contentPane);

					//rinkDesc mTextArea
					domConstruct.create("label", {
						"for":"rinkDescEdit",
						innerHTML: "<b>" + i18n.rink.dialog.rinkDesc + "</b>",
					}, this.rinkPopupEdit._contentPane);
					domConstruct.create("br", null, this.rinkPopupEdit._contentPane);

					this.rinkDescEdit = new mTextArea({
						"id": "rinkDescEdit",
						"rows": 5,
						"cols": 27,
						"value": this.currentRink.desc
					});
					this.rinkDescEdit.placeAt(this.rinkPopupEdit._contentPane);
					domConstruct.create("br", null, this.rinkPopupEdit._contentPane);

					// textAttach form/mTextBox
					this.input = domConstruct.create("input", {
						"type": "hidden"
					}, this.frmAttach);
					this.frmAttach = domConstruct.create("form", {
						"enctype": "multipart/form-data",
						"method": "POST"
					}, this.rinkPopupEdit._contentPane);
					this.lblAttach = domConstruct.create("label", {
						"for": "rinkTxtAttachEdit",
						"innerHTML": i18n.rink.dialog.rinkEditPhoto
					}, this.frmAttach);
					domConstruct.create("br", null, this.frmAttach);
					this.rinkTxtAttachEdit = new mTextBox({
						"id": "rinkTxtAttachEdit",
						"type": "file",
						"name": "attachment",
						"accept": "image/*"
					}).placeAt(this.frmAttach);
					domConstruct.create("br", null, this.rinkPopupEdit._contentPane);
					domConstruct.create("br", null, this.rinkPopupEdit._contentPane);

					// rinkButtons ContentPane
					this.rinkButtonsEdit = new ContentPane({
						"id": "rinkButtonsEdit",
						"class": "claro"
					});

					// rinkCreate BusyButton
					this.rinkEdit = new BusyButton({
						"id": "rinkEdit",
						"label": i18n.rink.dialog.rinkEdit.label,
						"busyLabel": i18n.rink.dialog.rinkEdit.busyLabel
					});
					this.rinkButtonsEdit.addChild(this.rinkEdit);

					// rinkCancel Button
					this.rinkCancelEdit = new Button ({
						"id": "rinkCancelEdit",
						"label": i18n.rink.dialog.rinkCancel.label
					});
					this.rinkButtonsEdit.addChild(this.rinkCancelEdit);

					this.rinkButtonsEdit.placeAt(this.rinkPopupEdit._contentPane);

					on(this.rinkEdit, "click", lang.hitch(this, this.editRinkInfo));
					on(this.rinkCancelEdit, "click", lang.hitch(this, function() {
						this.rinkPopupEdit.hide();
					}));
					on(this.rinkPopupEdit, "hide", lang.hitch(this, this.popupEditHide));
				}else{
					domConstruct.create("label", {
						"for":"noRinksMessage",
						innerHTML: "<b>" + i18n.rink.dialog.norinksmessage + "</b>"
					}, this.rinkPopupEdit._contentPane);

					this.rinkButtonsEdit = new ContentPane({
						"id": "rinkButtonsEdit",
						"class": "claro"
					});
					this.rinkCancelEdit = new Button ({
						"id": "rinkCancelEdit",
						"label": i18n.rink.dialog.rinkCancel.label
					});
					this.rinkButtonsEdit.addChild(this.rinkCancelEdit);

					this.rinkButtonsEdit.placeAt(this.rinkPopupEdit._contentPane);

					on(this.rinkCancelEdit, "click", lang.hitch(this, function() {
						this.rinkPopupEdit.hide();
					}));
					on(this.rinkPopupEdit, "hide", lang.hitch(this, this.popupEditHide));
				}
				}
			},

			deleteRinkPopup: function() {
				if (!this.rinkPopupDelete) {

					this._popupDiv = domConstruct.create("div");
					this.rinkPopupDelete = new Popup(null, this._popupDiv);

					this.getCurrentRink();

					this.rinkPopupDelete.setTitle(i18n.rink.dialog.deletetitle);
					this.rinkPopupDelete.setMap(this.rinkwatch.map);
				if(this.currentRink.id > 0){
					// rinkName mTextBox
					domConstruct.create("label", {
						"for":"rinkDelete",
						innerHTML: "<b>" + i18n.rink.dialog.areyousure + "</b>"
					}, this.rinkPopupDelete._contentPane);
					domConstruct.create("br", null, this.rinkPopupDelete._contentPane);
					domConstruct.create("br", null, this.rinkPopupDelete._contentPane);

					// rinkButtons ContentPane
					this.rinkButtonsDelete = new ContentPane({
						"id": "rinkButtonsDelete",
						"class": "claro"
					});

					this.rinkDelete = new BusyButton({
						"id": "rinkDelete",
						"label": i18n.rink.dialog.rinkDelete.label,
						"busyLabel": i18n.rink.dialog.rinkDelete.busyLabel
					});
					this.rinkButtonsDelete.addChild(this.rinkDelete);

					// rinkCancel Button
					this.rinkCancelDelete = new Button ({
						"id": "rinkCancelDelete",
						"label": i18n.rink.dialog.rinkCancel.label
					});
					this.rinkButtonsDelete.addChild(this.rinkCancelDelete);

					this.rinkButtonsDelete.placeAt(this.rinkPopupDelete._contentPane);

					on(this.rinkDelete, "click", lang.hitch(this, this.deleteRinkInfo));
					on(this.rinkCancelDelete, "click", lang.hitch(this, function() {
						this.rinkPopupDelete.hide();
					}));
					on(this.rinkPopupDelete, "hide", lang.hitch(this, this.popupDeleteHide));
				}else{
					domConstruct.create("label", {
						"for":"noRinksMessage",
						innerHTML: "<b>" + i18n.rink.dialog.norinksmessage + "</b>"
					}, this.rinkPopupDelete._contentPane);

					this.rinkButtonsDelete = new ContentPane({
						"id": "rinkButtonsDelete",
						"class": "claro"
					});

					this.rinkCancelDelete = new Button ({
						"id": "rinkCancelDelete",
						"label": i18n.rink.dialog.rinkCancel.label
					});
					this.rinkButtonsDelete.addChild(this.rinkCancelDelete);

					this.rinkButtonsDelete.placeAt(this.rinkPopupDelete._contentPane);

					on(this.rinkCancelDelete, "click", lang.hitch(this, function() {
						this.rinkPopupDelete.hide();
					}));
					on(this.rinkPopupDelete, "hide", lang.hitch(this, this.popupDeleteHide));
				}
				}
			},

			showRinkPopup: function(point) {
				this._cancelOnHide = true;
				domStyle.set($(".actionsPane")[1], {
					"display":"none"
				});
				this.rinkwatch.rinkwatchMenu.hide();
				this.rinkwatch.map.graphics.clear();
				this.rinkwatch.map.infoWindow.hide();
				this.rinkPopup.show(point.geometry);
			},
			showDeleteRinkPopup: function() {
				this._cancelOnHide = true;
				domStyle.set($(".actionsPane")[1], {
					"display":"none"
				});
				this.rinkwatch.rinkwatchMenu.hide();
				this.rinkwatch.map.graphics.clear();
				this.rinkwatch.map.infoWindow.hide();
				this.rinkPopupDelete.show();
			},
			showEditRinkPopup: function() {
				this._cancelOnHide = true;
				domStyle.set($(".actionsPane")[1], {
					"display":"none"
				});
				this.rinkwatch.rinkwatchMenu.hide();
				this.rinkwatch.map.graphics.clear();
				this.rinkwatch.map.infoWindow.hide();
				this.rinkPopupEdit.show();
				this.currentRink();
				this.rinkName.set("value", this.currentRink.name);
				this.rinkDesc.set("value", this.currentRink.desc);
				//this.rinkTxtAttach.set("value", "");
			},

			popupDeleteHide: function() {
				this.rinkwatch.map.graphics.clear();
				this.rinkwatch.rinkwatchMenu.show();
			},
			popupEditHide: function() {
				this.rinkwatch.map.graphics.clear();
				this.rinkwatch.rinkwatchMenu.show();
			},
			popupHide: function() {
				this.draw.deactivate();
				this.rinkwatch.map.graphics.clear();
				this.rinkwatch.rinkwatchMenu.show();
			},

			editRinkInfo: function(){
				//this.rinkCancel.setDisabled(true);
				//this.rinkEdit.makeReallyBusy();
				this.getCurrentRink();
				id = this.currentRink.id;
				name = this.rinkNameEdit.value;
				desc = this.rinkDescEdit.value;
				attachment = this.rinkTxtAttachEdit.value;

				// ******** THIS EDITS THE FEATURE TABLE ******** //
				var queryRoot = this.rinkwatch.root+config.featuretables.url+"/";
				var rinkQueryTask = new QueryTask(queryRoot+config.featuretables.layers.rink);
				console.log(rinkQueryTask)
				var rinkQuerySettings = config.defaultQuerySettings.rinks;
				var rinkQuery = new Query();
				rinkQuery.where = "id = " + id;
				rinkQuery.returnGeometry = false;
				rinkQuery.outFields = ["*"];
				rinkQueryTask.execute(rinkQuery, lang.hitch(this, function(fs) {
					objectid = fs.features[0].attributes.objectid;
				})).then(lang.hitch(this, function() {
					rinkData = {
						"attributes": {
							"id": id,
							"objectid": objectid,
							"rink_name": name,
							"rink_desc": desc
						}
					};
					this.rinkwatch.rinksTable.applyEdits(null, [rinkData], null,  lang.hitch(this, function() {
						this.editMapServerInfo();
						this.rinkPopupEdit.hide();
						this.rinkwatch.rinkwatchMenu.show();
					}));
				}));
			},

			deleteRinkInfo: function(){
				//this.rinkCancel.setDisabled(true);
				//this.rinkDelete.makeReallyBusy();
				this.getCurrentRink();
				id = this.currentRink.id;
				// ******** THIS EDITS THE FEATURE TABLE ******** //
				var queryRoot = this.rinkwatch.root+config.featuretables.url+"/";
				var rinkQueryTask = new QueryTask(queryRoot+config.featuretables.layers.rink);
				var rinkQuerySettings = config.defaultQuerySettings.rinks;
				var rinkQuery = new Query();
				rinkQuery.where = "id = " + id;
				rinkQuery.returnGeometry = false;
				rinkQuery.outFields = ["*"];
				rinkQueryTask.execute(rinkQuery, lang.hitch(this, function(fs) {
					objectid = fs.features[0].attributes.objectid;
				})).then(lang.hitch(this, function() {
					rinkData = {
						"attributes": {
							"id": id,
							"objectid": objectid,
							"rink_user_id" : 0000
						}
					};

					this.rinkwatch.rinksTable.applyEdits(null, [rinkData], null,  lang.hitch(this, function() {
						this.deleteMapServerInfo();
						this.rinkPopupDelete.hide();
						this.rinkwatch.rinkwatchMenu.show();
					}));
				}));
			},

			editMapServerInfo: function(){
				this.getCurrentRink();
				id = this.currentRink.id;
				name = this.rinkNameEdit.value;
				desc = this.rinkDescEdit.value;
				attachment = this.rinkTxtAttachEdit.value;

				//******** THIS EDITS THE MAPSERVER TABLE ******** //
				msqueryRoot = this.rinkwatch.root+config.tables.url+"/";
				msrinkQueryTask = new QueryTask(msqueryRoot+config.tables.layers.rink);
				msrinkQuerySettings = config.defaultQuerySettings.rinks;
				msrinkQuery = new Query();
				msrinkQuery.where = "id = " + id;
				msrinkQuery.returnGeometry = false;
				msrinkQuery.outFields = ["*"];
				msrinkQueryTask.execute(msrinkQuery, lang.hitch(this, function(fs) {
					objectid2 = fs.features[0].attributes.objectid;
				})).then(lang.hitch(this, function() {
					rinkData = {
						"attributes": {
							"id": id,
							"objectid": objectid2,
							"rink_name": name,
							"rink_desc": desc
						}
					};
					this.rinkwatch.rinksLayer.applyEdits(null, [rinkData], null,  lang.hitch(this, function() {
					}));
					if (attachment) {
						this.rinkwatch.rinksLayer.queryAttachmentInfos(objectid2, function(attachments) {
							if (attachments[0].id) {
								att_objectid = [attachments[0].id]
								this.rinkwatch.rinksLayer.deleteAttachments(objectid2, att_objectid);

							}
						});
						this.rinkwatch.rinksLayer.addAttachment(objectid2, this.frmAttach);
					}

				}));
				// readingqueryRoot = this.rinkwatch.root+config.tables.url+"/";
				// readingQueryTask = new QueryTask(readingqueryRoot+config.tables.layers.rink);
				// readingQuerySettings = config.defaultQuerySettings.rinks;
				// readingQuery = new Query();
				// readingQuery.where = "reading_rink_id = " + id;
				// readingQuery.returnGeometry = false;
				// readingQuery.outFields = ["*"];
				// readingQueryTask.execute(readingQuery, lang.hitch(this, function(fs) {
				// 	objectid2 = fs.features[0].attributes.objectid;
				// }));

				this.rinkwatch.map.graphics.clear();
				// this.rinkwatch.rinksLayer.setDefinitionExpression(false);
				if (this.rinkwatch.legend) this.rinkwatch.legend.refresh();
				// this.rinkwatch.map.setExtent(this.rinkwatch.map.extent);
				this.rinkEdit.cancel();
				this.rinkwatch.rinkwatchLayer.refresh();
				this.rinkPopupEdit.hide();
				this.rinkCancelEdit.setDisabled(false);
				this.setCurrentRink();
				this.rinkwatch.rinkwatchMenu.show();
			},

			deleteMapServerInfo: function(){
				this.getCurrentRink();
				id = this.currentRink.id;

				//******** THIS EDITS THE MAPSERVER TABLE ******** //
				msqueryRoot = this.rinkwatch.root+config.tables.url+"/";
				msrinkQueryTask = new QueryTask(msqueryRoot+config.tables.layers.rink);
				msrinkQuerySettings = config.defaultQuerySettings.rinks;
				msrinkQuery = new Query();
				msrinkQuery.where = "id = " + id;
				msrinkQuery.returnGeometry = false;
				msrinkQuery.outFields = ["*"];
				msrinkQueryTask.execute(msrinkQuery, lang.hitch(this, function(fs) {
					objectid2 = fs.features[0].attributes.objectid;
				})).then(lang.hitch(this, function() {
					rinkData = {
						"attributes": {
							"id": id,
							"objectid": objectid2,
							"rink_user_id" : 0000
						}
					};
					this.rinkwatch.rinksLayer.applyEdits(null, [rinkData], null,  lang.hitch(this, function() {
					}));

				}));

				readingqueryRoot = this.rinkwatch.root+config.tables.url+"/";
				readingQueryTask = new QueryTask(readingqueryRoot+"2");
				readingQuery = new Query();
				//readingQuery.where = config.defaultQuerySettings.reading.expression;
				readingQuery.outFields = ["*"];
				readingQuery.where = "reading_rink_id = " + id;
				readingQueryTask.execute(readingQuery, lang.hitch(this, function(fs) {
					if (fs.features.length > 0) {
						readingArray = [];
						array.forEach(fs.features, function(f) {
							readingArray.push(f.attributes.objectid);
						}, this);
					}
				})).then(lang.hitch(this, function() {
					//totalList=[];
					for(var x = 0; x < readingArray.length; x++){
					 	readingData = {
					 		"attributes": {
					 			"objectid": readingArray[x],
					 			"reading_rink_id": id,
					 			"flag": 2
					 		}
					 	};
					 	//**** SHOULD CREATE ONE BIG json LIST HERE AND SEND IT TO APPLYEDITS JUST ONCE****
					 	//**** THIS WORKS TO AS NOT MANY PEOPLE WILL ACTUALLY DELETE EVERYTHING****
						this.rinkwatch.readingsTable.applyEdits(null, [readingData], null,  lang.hitch(this, function() {
						}));
					};

				}));
				alert(i18n.rink.dialog.confirmDelete)

				this.rinkwatch.map.graphics.clear();
				// this.rinkwatch.rinksLayer.setDefinitionExpression(false);
				if (this.rinkwatch.legend) this.rinkwatch.legend.refresh();
				// this.rinkwatch.map.setExtent(this.rinkwatch.map.extent);
				this.rinkDelete.cancel();
				this.rinkwatch.rinkwatchLayer.refresh();
				this.rinkPopupDelete.hide();
				this.rinkCancelDelete.setDisabled(false);
				this.setCurrentRink();
				this.rinkwatch.rinkwatchMenu.show();
			},

			addNewRink: function() {

				this.rinkCancel.setDisabled(true);
				this.rinkCreate.makeReallyBusy();
				var name;
				if (!this.rinkName.value || this.rinkName.value.length < 2) {
					// this.
				} else {
					name = this.rinkName.value;
				}
				var desc = this.rinkDesc.value;
				var rinkDate = new Date();
				var date =  (rinkDate.getMonth() + 1) + "/" + rinkDate.getDate() + "/" + rinkDate.getFullYear()  + " 05:00:00";

				// stamp.toISOString(new Date(), {
				// 	selector: "date",
				// 	formatLength: "full"
				// });

				// this.locator.locationToAddress(webMercatorUtils.webMercatorToGeographic(this.rinkPoint.geometry), 100).then(lang.hitch(this, function() {
					// Wait until reverse geocoding is finished to populate things...
					// var location = this.rinkAddress;

					if ((!this.rinkPoint.attributes || this.rinkPoint.attributes.objectid === null) && name && name.length > 0) {

						// Return all records to find out the last id that was registered to a rink
						var rinkSettings = config.rinkwatchLayers[0];
						var queryTask = new QueryTask(this.rinkwatch.root+config.rinkwatchUrl+"/"+rinkSettings.index);
						var query = new Query();
						query.where = "1=1";
						query.returnGeometry = false;
						query.outFields = ["id"];
						query.orderByFields = ["id DESC"];

						queryTask.execute(query, lang.hitch(this, function(fs) {
							// Find the last id from the rinks tables, and set the id of the new rink
							// !!!! CHANGE 1 TO 0 IN REAL APP !!!
							this.rinkId = fs.features[0].attributes.id;
							this.rinkId++;
							// this.projectToLatLong(this.rinkPoint);
						})).then(lang.hitch(this, function() {
							this.rinkPoint.setAttributes({
								id: this.rinkId,
								rink_user_id: this.rinkUserId,
								rink_name: name,
								rink_desc: desc,
								rink_creation_date: date,
								rink_lat: this.projPoint.y,
								rink_long: this.projPoint.x
							});
							this.rinkwatch.rinksLayer.applyEdits([this.rinkPoint], null, null, lang.hitch(this, function() {
								if (this.rinkPoint.attributes.objectid) {
									// Add attachment to feature layer if the user has uploaded something
									if (this.rinkTxtAttach.value) {
										this.rinkwatch.rinksLayer.addAttachment(this.rinkPoint.attributes.objectid, this.frmAttach, function() {
											console.log("Attachment added.");
										});
									}
									this.rinkwatch.map.graphics.remove(this.rinkPoint);
									this.rinkData = {
										"attributes": {
											"id": this.rinkId,
											"rink_user_id": this.rinkUserId,
											"rink_name": name,
											"rink_desc": desc,
											"rink_creation_date": date,
											"rink_lat": this.projPoint.y,
											"rink_long": this.projPoint.x
										}
									};
									this.rinkwatch.rinksTable.applyEdits([this.rinkData], null, null, lang.hitch(this, function() {
										console.log("rink added");
									}));
									this.applyRinkPoint();
								} else if (console && console.info) console.info("Error: Could not get objectid for the rink.");
							}), lang.hitch(this, function(e) {
								console.log(e);
							}));
						}));
					} else {
						this.rinkCreate.cancel();
						this.rinkCancel.setDisabled(false);
						if (!name || name.length <= 0) {
							alert(i18n.rink.dialog.errorName);
						} else {
							if (!this.rinkPoint.attributes || this.rinkPoint.attributes.objectid===null || this.rinkPoint.attributes.objectid != this.marketAreaSelect.value) {
								alert(i18n.rink.dialog.errorRename);
								// if (confirm("You have saved a rink with that name already.\n\nDo you wish to overwrite it?")) {
								// 	// this.deleteMarketArea(this.marketAreasByName[name].objectid);
								// 	this.rinkPoint.setAttributes({
								// 		userid: this.rinkwatch.userid,
								// 		rink_name: name,
								// 		rink_desc: desc
								// 	});

								// 	this.rinkwatch.rinksLayer.applyEdits([this.rinkPoint], null, null, lang.hitch(this, function(addResult) {
								// 		if (this.rinkPoint.attributes.objectid) {
								// 			this.rinkwatch.map.graphics.remove(this.rinkPoint);
								// 			this.applyCollisionPoint();
								// 		} else if (console && console.info) console.info("Error: Could not get objectid for the new rink.");
								// 	}));
								// }
							} else if (this.rinkPoint.attributes && this.rinkPoint.attributes.objectid!==null && this.rinkPoint.attributes.objectid == this.marketAreaSelect.value) {
								var oldName = false;

								if (this.marketAreasByName[name] && this.marketAreasByName[name].objectid != this.rinkPoint.attributes.objectid && confirm("You have saved a market area with that name already.\n\nDo you wish to overwrite it?")) {
									this.deleteMarketArea(this.marketAreasByName[name].objectid);
									this.rinkPoint.attributes.objectid = null;
									oldName = this.rinkPoint.attributes.name;
								}

								this.rinkPoint.attributes.name = name;
								this.rinkPoint.attributes.description = description;

								// this.finishEditing();

								// update the currently opened market area

								this.rinkwatch.rinksLayer.applyEdits(null, [this.rinkPoint], null, lang.hitch(this, function(addResult, updateResult) {
									this.rinkwatch.map.graphics.remove(this.rinkPoint);

									// Need to upate the marketAreasById object:
									var mkt = this.marketAreasById[this.rinkPoint.attributes.objectid];
									mkt.name = name;
									mkt.description = desc;

									// Need to update the marketAreasByName object, since the old name is no longer appropriate:
									if (oldName!==false) delete this.marketAreasByName[oldName];

									this.marketAreasByName[name] = mkt;

									this.applyCollisionPoint();


								}));
							}
						}
					}
				alert("Please refresh the page to see your new rink/S'il vous plaît rafraîchir la page pour voir votre nouvelle patinoire");

				// }));

			},

			projectToLatLong: function(point) {

				var outSR = new SpatialReference(4326);
				var params = new ProjectParameters();
				params.geometries = [point.geometry];
				params.outSR = outSR;

				this.geomService.project(params, lang.hitch(this, function(projPoint) {
					this.projPoint = projPoint[0];
				}));

			},

			getUserInfo: function(username) {

				var queryRoot = this.rinkwatch.root+config.tables.url+"/";

				var userQueryTask = new QueryTask(queryRoot+config.tables.layers.user);
				var userQuerySettings = config.defaultQuerySettings.user;

				var userQuery = new Query();
				userQuery.where = "username = '" + username + "' OR email = '" + username + "'";
				userQuery.outFields = userQuerySettings.fields;
				userQueryTask.execute(userQuery, lang.hitch(this, function(fs) {
					if (fs.features.length > 0) {
						this.rinkUserId = fs.features[0].attributes.id;
					}
				})).then(lang.hitch(this, function() {

					var rinkSettings = config.rinkwatchLayers[0];
					var rinkQueryTask = new QueryTask(this.rinkwatch.root+config.rinkwatchUrl+"/"+rinkSettings.index);
					var rinkQuerySettings = config.defaultQuerySettings[rinkSettings.querySettings];

					var rinkQuery = new Query();
					rinkQuery.where = "rink_user_id = '" + this.rinkUserId + "'";
					rinkQuery.outFields = rinkQuerySettings.fields;
					rinkQuery.returnGeometry = true;
					rinkQueryTask.execute(rinkQuery, lang.hitch(this, function(fs) {
						this.populateRinks(fs);
						this.getReadings();
					}));
				}));

			},

			getCurrentRink: function() {

				array.some(this.curRink.options, function(option) {
					if(option.selected) {
						this.currentRink = {
							"name": option.label,
							"id": option.value,
							"desc": option.desc,
							"image": option.image,
							"objectid": option.objectid
						};
						return true;
					}
				}, this);
				// Initialize chart module
				if(!rinkwatch.chart && this.rinkwatch.readingArray) {
					rinkwatch.chart = new chart(this.rinkwatch);
				}
				this.createMyRinks();

			},

			populateRinks: function(fs) {

				if (fs.features.length > 0) {
					this.myRinks = fs.features;
					array.forEach(this.myRinks, function(f) {
						f.setSymbol(this.rinkPointSymbol);
						this.curRink.addOption({
							label: f.attributes.rink_name,
							objectid: f.attributes.objectid,
							value: f.attributes.id,
							desc: f.attributes.rink_desc,
							image: f.attributes.rinkimage
						});
					}, this);
				} else {
					// Setting in rinkwatch.getUserInfo otherwise
					this.curRink.addOption({
						label: i18n.rink.pane.noRinks,
						value: 0
					});
				}

			},

			getReadings: function() {

				this.getCurrentRink();

				var queryRoot = this.rinkwatch.root+config.tables.url+"/";

				var readingQueryTask = new QueryTask(queryRoot+config.tables.layers.reading);
				var readingQuerySettings = config.defaultQuerySettings.reading;

				var readingQuery = new Query();
				readingQuery.where = "reading_rink_id = '" + this.currentRink.id + "'";
				readingQuery.outFields = readingQuerySettings.fields;
				readingQuery.orderByFields = ["reading_time DESC"];
				readingQueryTask.execute(readingQuery, lang.hitch(this, function(fs) {
					if (fs.features.length > 0) {
						var skateCount = 0;
						var rDate = fs.features[0].attributes.reading_time;
						// Replace rirst two "-" with "/" so that Date object can be read in all browsers
						if (new Date(rDate).getTime() == rDate) {
							rDate = new Date(rDate);
						} else {
							rDate = new Date(rDate.replace(/-/, "/").replace(/-/, "/"));
						}
						var date =  (rDate.getUTCMonth() + 1) + "/" + rDate.getUTCDate() + "/" + rDate.getUTCFullYear();

						// stamp.toISOString(rDate, {
						// 	selector: "date",
						// 	formatLength: "full"
						// });
						this.lastReading.innerHTML = date;
						this.totalReadings.innerHTML = fs.features.length;
						array.forEach(fs.features, function(f) {
							if (f.attributes.reading_data == 1) {
								skateCount++;
							}
						}, this);
						this.percentSkateable.innerHTML = ((skateCount/fs.features.length) * 100).toFixed(2) + " %";
					} else {
						var na = i18n.rink.pane.stats.na;
						this.lastReading.innerHTML = na;
						this.totalReadings.innerHTML = na;
						this.percentSkateable.innerHTML = na;
					}

				}));

			},

			applyRinkPoint: function() {

				this.rinkwatch.rinksLayer.setDefinitionExpression("objectid = " + this.rinkPoint.attributes.objectid);
				// if (!this.marketAreasById[this.rinkPoint.attributes.objectid]) this.userMarketAreas.push(this.rinkPoint);
				// this.updateMarketAreaSelect(this.rinkPoint.attributes.objectid);
				if (this.rinkwatch.visual.clusterLayer) {
					if (this.rinkwatch.visual.clusterCheck) {
						this.rinkwatch.visual.createClusterLayer(true);
					} else {
						this.rinkwatch.visual.createClusterLayer(false);
					}
				}
				this.rinkwatch.rinkwatchLayer.refresh();
				this.rinkName.set("value", "");
				this.rinkDesc.set("value", "");
				this.rinkTxtAttach.set("value", "");
				this.rinkwatch.map.graphics.clear();
				this.rinkwatch.rinksLayer.setDefinitionExpression(false);
				if (this.rinkwatch.legend) this.rinkwatch.legend.refresh();
				this.rinkwatch.map.setExtent(this.rinkwatch.map.extent);
				this.rinkPopup.hide();
				this.rinkCreate.cancel();
				this.rinkCancel.setDisabled(false);
				this.setCurrentRink();
				this.rinkwatch.rinkwatchMenu.show();

			},

			setCurrentRink: function() {

				// Remove "No Rinks" option if there were no rinks before
				if (this.currentRink.id === 0) {
					this.curRink.removeOption({
						value: 0
					});
				}
				this.curRink.addOption({
					label: this.rinkPoint.attributes.rink_name,
					value: this.rinkPoint.attributes.id,
					desc: f.attributes.rink_desc,
					objectid: f.attributes.objectid,
					image: f.attributes.rinkimage
				});
				this.curRink.setValue(this.rinkPoint.attributes.id);

			},

			createMyRinks: function() {

				if (!this.myRinksLayer) {
					this.myRinksLayer = new ArcGISDynamicMapServiceLayer(this.rinkwatch.root+config.rinkwatchPublicUrl, {
						"id": "myRinksLayer",
						"visible": false
					});
					this.myRinksLayer.setImageFormat("png32");
					this.rinkwatch.setRendererSettings(this.myRinksLayer, 3);
				}
				if (this.currentRink) {
					this.myRinksDQ = "id = " + this.currentRink.id;
					this.rinkwatch.setLD(this.myRinksLayer, this.myRinksDQ);
					if (!this.rinkCheck && this.rinkwatch.filter.legendCheck) {
						this.addMyRinks();
					}
				}

			},

			addMyRinks: function() {

				this.rinkCheck = true;
				this.rinkwatch.map.addLayer(this.myRinksLayer, 5);
				// Check to make sure My Rink has not already been added to the legend
				if (this.rinkwatch.filter.legendLayers.length < 4) {
					this.rinkwatch.filter.legendLayers.push({
						"layer": this.myRinksLayer,
						"title": " "
					});
				}
				this.myRinksLayer.show();
				this.rinkwatch.createLegend();

			},

			centerAndZoom: function() {

				var rinkSettings = config.rinkwatchLayers[0];
				var rinkQueryTask = new QueryTask(this.rinkwatch.root+config.rinkwatchUrl+"/"+rinkSettings.index);
				var rinkQuerySettings = config.defaultQuerySettings[rinkSettings.querySettings];

				var rinkQuery = new Query();
				rinkQuery.where = "id = " + this.currentRink.id;
				rinkQuery.outFields = rinkQuerySettings.fields;
				rinkQuery.returnGeometry = true;
				rinkQueryTask.execute(rinkQuery, lang.hitch(this, function(fs) {
					if (fs) {
						this.rinkwatch.map.centerAndZoom(fs.features[0].geometry, 7);
					}
				}));

			}

		});
	}
);
