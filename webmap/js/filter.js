define(
	[

		"dojo/dom-attr",
		"dojo/dom-construct",
		"dojo/dom-style",
		"dojo/keys",
		"dojo/on",
		"dojo/_base/array",
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/date/stamp",
		"dojo/i18n!./nls/text",

		"dijit/registry",
		"dijit/form/Button",
		"dijit/form/DateTextBox",
		"dijit/form/Select",
		"dijit/layout/ContentPane",

		"dojox/mobile/CheckBox",

		"esri/layers/ArcGISDynamicMapServiceLayer",
		"esri/symbols/PictureMarkerSymbol",
		"esri/tasks/query",
		"esri/tasks/QueryTask",

		"./config",
		"./chart"

	], function(

		domAttr,
		domConstruct,
		domStyle,
		keys,
		on,
		array,
		declare,
		lang,
		stamp,
		i18n,

		registry,
		Button,
		DateTextBox,
		Select,
		ContentPane,

		mCheckBox,

		ArcGISDynamicMapServiceLayer,
		PictureMarkerSymbol,
		Query,
		QueryTask,

		config,
		chart

	) {

		return declare(null, {

			constructor: function(rinkwatch) {

				this.rinkwatch = rinkwatch;
				if (!this.legendPane) {
					this.createLegendPane();
				}
				// on(this.viewRinks, "change", lang.hitch(this, this.setRinkDisplay));
				on(this.startDateBox, "change", lang.hitch(this, function() {
					this.endDateBox.constraints.min = this.startDateBox.value;
					this.setRinkDisplay();
				}));
				on(this.endDateBox, "change", lang.hitch(this, this.setRinkDisplay));
				on(this.skateableFilter, "change", lang.hitch(this, this.checkActiveLayers));
				on(this.notSkateableFilter, "change", lang.hitch(this, this.checkActiveLayers));
				on(this.noReadingFilter, "change", lang.hitch(this, this.checkActiveLayers));

			},

			createLegendPane: function() {

				// legendPane ContentPane
				this.legendPane = new ContentPane({
					"id": "legendPane",
					"class": "claro",
					"title": i18n.menu.legend
				});

				// legendLabel span
				domConstruct.create("span", {
					"id": "legendLabel",
					"innerHTML": "<b>" + i18n.legend.title + "</b>"
				}, this.legendPane.domNode);
				domConstruct.create("br", null, this.legendPane.domNode);

				// map_legend div
				domConstruct.create("div", {
					"id": "map_legend"
				}, this.legendPane.domNode);

				// map_toc div
				domConstruct.create("div", {
					"id": "map_toc"
				}, this.legendPane.domNode);
				domConstruct.create("br", null, this.legendPane.domNode);

				// skateableFilter mCheckBox
				domConstruct.create("label", {
					"for": "skateableFilter",
					"innerHTML": i18n.filter.skateableFilter,
				}, this.legendPane.domNode);
				this.skateableFilter = new mCheckBox({
					"id": "skateableFilter",
					"checked": true
				});
				this.legendPane.addChild(this.skateableFilter);
				domConstruct.create("br", null, this.legendPane.domNode);

				// notSkateableFilter mCheckBox
				domConstruct.create("label", {
					"for": "notSkateableFilter",
					"innerHTML": i18n.filter.notSkateableFilter,
				}, this.legendPane.domNode);
				this.notSkateableFilter = new mCheckBox({
					"id": "notSkateableFilter",
					"checked": true
				});
				this.legendPane.addChild(this.notSkateableFilter);
				domConstruct.create("br", null, this.legendPane.domNode);

				// notReadingFilter mCheckBox
				domConstruct.create("label", {
					"for": "noReadingFilter",
					"innerHTML": i18n.filter.noReadingFilter,
				}, this.legendPane.domNode);
				this.noReadingFilter = new mCheckBox({
					"id": "noReadingFilter",
					"checked": false
				});
				this.legendPane.addChild(this.noReadingFilter);
				domConstruct.create("br", null, this.legendPane.domNode);
				domConstruct.create("br", null, this.legendPane.domNode);

				// startDateBox/endDateBox DateTextBox
				this.endDate = new Date();
				// 86400000 ms in a day...
				this.startDate = new Date(this.endDate - (91 * 86400000));
				domConstruct.create("label", {
					"for": "startDateBox",
					"innerHTML": i18n.filter.startDateBox
				}, this.legendPane.domNode);
				domConstruct.create("br", null, this.legendPane.domNode);
				this.startDateBox = new DateTextBox({
					"id": "startDateBox",
					"required": false,
					"dayWidth": "abbr",
					"value": this.startDate,
					"constraints": {
						"max": this.endDate
					}
				});
				this.legendPane.addChild(this.startDateBox);
				domConstruct.create("br", null, this.legendPane.domNode);

				domConstruct.create("label", {
					"for": "endDateBox",
					"innerHTML": i18n.filter.endDateBox
				}, this.legendPane.domNode);
				domConstruct.create("br", null, this.legendPane.domNode);
				this.endDateBox = new DateTextBox({
					"id": "endDateBox",
					"required": false,
					"dayWidth": "abbr",
					"value": this.endDate,
					"constraints": {
						"max": this.endDate,
						"min": this.startDate
					}
				});
				this.legendPane.addChild(this.endDateBox);

				this.rinkwatch.menuAccordion.addChild(this.legendPane);

			},

			setRinkDisplay: function() {

				if(!rinkwatch.chart && this.rinkwatch.readingArray && this.rinkwatch.rink) {
					if (this,rinkwatch.rink.currentRink) {
						rinkwatch.chart = new chart(this.rinkwatch);
					}
				}
				this.curStart = this.startDateBox.value;
				this.curEnd = this.endDateBox.value;
				this.skateableDQ = "id = ";
				this.notSkateableDQ = "id = ";
				this.noReadingDQ = "(id <> ";

				// Create layers if they do not exist already
				if (!this.skateableLayer) {
					this.createSkateableLayers();
				}
				array.forEach(this.rinkwatch.readingArray, function(rs) {
					if (rs) {
						array.some(rs, function(r) {
							var rDate = r.attributes.reading_time;
							// Replace first two "-" with "/" so that Date object can be created in all browsers
							if (new Date(rDate).getTime() == rDate) {
								rDate = new Date(rDate);
							} else {
								rDate = new Date(rDate.replace(/-/, "/").replace(/-/, "/"));
							}
							if (rDate <= this.curEnd && rDate >= this.curStart) {
								if (r.attributes.reading_data === 1) {
									this.skateableDQ += r.attributes.reading_rink_id + " OR id = ";
									this.noReadingDQ += r.attributes.reading_rink_id + " OR id <> ";
								} else {
									this.notSkateableDQ += r.attributes.reading_rink_id + " OR id = ";
									this.noReadingDQ += r.attributes.reading_rink_id + " OR id <> ";
								}
								// Break array.some loop if most recent reading is returned
								return true;
							}
						}, this);
					}
				}, this);
				var DQend;
				if (this.rinkwatch.rink && this.rinkwatch.rink.currentRink) {
					DQend = this.rinkwatch.rink.currentRink.id;
				} else {
					DQend = "0";
				}
				// Add 0 to the end of each query to complete query.where strings (there are no rinks with id = 0, so won't affect output)
				this.skateableDQ += DQend;
				this.notSkateableDQ += DQend;
				this.noReadingDQ += DQend;
				this.noReadingDQ += ") AND rink_user_id > 0" //This last part makes sure it gets all flagged deletions and doesn't show them.
				// for all rinks beings diplayed - used for mouseCount and infoTemplates
				this.allDQ = this.skateableDQ + " OR " + this.notSkateableDQ + " OR " + this.noReadingDQ;

				this.rinkwatch.setLD(this.skateableLayer, this.skateableDQ);
				this.rinkwatch.setLD(this.notSkateableLayer, this.notSkateableDQ);
				this.rinkwatch.setLD(this.rinkwatch.rinkwatchLayer, this.noReadingDQ);

				this.checkActiveLayers();

			},

			createSkateableLayers: function() {

				this.notSkateableLayer = new ArcGISDynamicMapServiceLayer(this.rinkwatch.root+config.rinkwatchPublicUrl, {
					"id": "notSkateableLayer",
					"visible": false
				});
				this.notSkateableLayer.setImageFormat("png32");
				this.rinkwatch.setRendererSettings(this.notSkateableLayer, 2);
				this.rinkwatch.map.addLayer(this.notSkateableLayer, 3);

				this.skateableLayer = new ArcGISDynamicMapServiceLayer(this.rinkwatch.root+config.rinkwatchPublicUrl, {
					"id": "skateableLayer",
					"visible": false
				});
				this.skateableLayer.setImageFormat("png32");
				this.rinkwatch.setRendererSettings(this.skateableLayer, 1);
				this.rinkwatch.map.addLayer(this.skateableLayer, 4);

				this.legendLayers = [];

				this.legendLayers.push({
					"layer": this.rinkwatch.rinkwatchLayer,
					"title": " "
				});

				this.legendLayers.push({
					"layer": this.notSkateableLayer,
					"title": " "
				});
				this.legendLayers.push({
					"layer": this.skateableLayer,
					"title": " "
				});
				this.legendCheck = true;

				// Add myRinksLayer to map if user is logged in
				if (this.rinkwatch.rink) {
					if (this.rinkwatch.rink.myRinksLayer) {
						this.rinkwatch.rink.addMyRinks();
					} else {
						this.rinkwatch.rink.createMyRinks();
					}
				} else {
					this.rinkwatch.createLegend();
				}

			},

			// No fun to understand the logic here...
			checkActiveLayers: function() {

				this.allDQ = "";
				if (this.skateableFilter.checked) {
					if (!this.rinkwatch.visual.clusterCheck || this.rinkwatch.visual.clusterCheck === false) {
						this.skateableLayer.show();
					}
					this.allDQ += this.skateableDQ;
				} else {
					this.skateableLayer.hide();
				}
				if (this.notSkateableFilter.checked) {
					if (!this.rinkwatch.visual.clusterCheck || this.rinkwatch.visual.clusterCheck === false) {
						this.notSkateableLayer.show();
					}
					if (this.skateableFilter.checked) {
						this.allDQ += " OR ";
					}
					this.allDQ += this.notSkateableDQ;
				} else {
					this.notSkateableLayer.hide();
				}
				if (this.noReadingFilter.checked) {
					if (!this.rinkwatch.visual.clusterCheck || this.rinkwatch.visual.clusterCheck === false) {
						this.rinkwatch.rinkwatchLayer.show();
					}
					if (this.skateableFilter.checked || this.notSkateableFilter.checked) {
						this.allDQ += " OR ";
					}
					this.allDQ += this.noReadingDQ;
				} else {
					this.rinkwatch.rinkwatchLayer.hide();
				}
				// Check if all boxes are unchecked, and clusterLayer/heatLayer is toggled - if so, set allDQ so that no rinks display
				if ((!this.skateableFilter.checked && !this.notSkateableFilter.checked && !this.noReadingFilter.checked && this.rinkwatch.visual.clusterCheck === true) || (!this.skateableFilter.checked && !this.notSkateableFilter.checked && !this.noReadingFilter.checked && this.rinkwatch.visual.heatCheck === true)) {
					this.allDQ = "1 = 0";
				}
				// Reset clusters if clusterLayer is toggled on
				if (this.rinkwatch.visual.clusterCheck && this.rinkwatch.visual.clusterCheck === true) {
					this.rinkwatch.visual.setCluster();
				}
				if (this.rinkwatch.visual.heatCheck && this.rinkwatch.visual.heatCheck === true) {
					this.rinkwatch.visual.getFeatures();
				}

			}

		});

	}

);
