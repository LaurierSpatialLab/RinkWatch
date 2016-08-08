define(
	[

		"dojo/aspect",
		"dojo/dom",
		"dojo/dom-attr",
		"dojo/dom-construct",
		"dojo/dom-style",
		"dojo/on",
		"dojo/query",
		"dojo/_base/declare",
		"dojo/_base/array",
		"dojo/_base/lang",
		"dojo/i18n!./nls/text",

		"dijit/registry",
		"dijit/form/ToggleButton",
		"dijit/layout/ContentPane",

		"dojox/mobile/CheckBox",

		"esri/InfoTemplate",
		"esri/renderers/ClassBreaksRenderer",
		"esri/symbols/PictureMarkerSymbol",
		"esri/symbols/SimpleMarkerSymbol",
		"esri/tasks/query",
		"esri/tasks/QueryTask",

		"./config",
		"./popup",

		"modules/ClusterLayer",
		"modules/HeatmapLayer",
		"modules/TOC",

		"dojo/NodeList-traverse"

	], function(

		aspect,
		dom,
		domAttr,
		domConstruct,
		domStyle,
		on,
		$,
		declare,
		array,
		lang,
		i18n,

		registry,
		ToggleButton,
		ContentPane,

		mCheckBox,

		InfoTemplate,
		ClassBreaksRenderer,
		PictureMarkerSymbol,
		SimpleMarkerSymbol,
		Query,
		QueryTask,

		config,
		popup,

		ClusterLayer,
		HeatmapLayer,
		TOC

	) {

		return declare(null, {

			constructor: function(rinkwatch) {

				this.rinkwatch = rinkwatch;
				this.createVisualPane();

				on(this.toggleCluster, "click", lang.hitch(this, this.setCluster));
				on(this.toggleHeatmap, "click", lang.hitch(this, this.setHeatmap));
				on(this.heatLocal, "change", lang.hitch(this, this.setMaximum));

				on(this.rinkwatch.map, "extent-change", lang.hitch(this, function() {
					if (this.heatCheck) this.getFeatures();
				}));

			},

			createVisualPane: function() {
				if(!this.visualPane) {

					this.menuAccordion = registry.byId("menuAccordion");

					// this.visualParentPane = new ContentPane({
					// 	"class": "parentPane",
					// 	"title": i18n.visual.title
					// });

					this.visualPane = new ContentPane({
						"id": "visualPane",
						"title": i18n.visual.title
					});

					// toggleCluster ToggleButton
					domConstruct.create("label", {
						"for": "toggleCluster",
						"innerHTML": i18n.visual.clustering.label
					}, this.visualPane.domNode);
					domConstruct.create("br", null, this.visualPane.domNode);
					this.toggleCluster = new ToggleButton({
						"id": "toggleCluster",
						"label": i18n.visual.clustering.on,
						"checked": false,
						"iconClass": "dijitCheckBoxIcon"
					});
					this.visualPane.addChild(this.toggleCluster);
					domConstruct.create("br", null, this.visualPane.domNode);

					// toggleHeatmap ToggleButton
					domConstruct.create("label", {
						"for": "toggleHeatmap",
						"innerHTML": i18n.visual.heatmap.label
					}, this.visualPane.domNode);
					domConstruct.create("br", null, this.visualPane.domNode);
					this.toggleHeatmap = new ToggleButton({
						"id": "toggleHeatmap",
						"label": i18n.visual.heatmap.on,
						"checked": false,
						"iconClass": "dijitCheckBoxIcon"
					});
					this.visualPane.addChild(this.toggleHeatmap);
					domConstruct.create("br", null, this.visualPane.domNode);
					domConstruct.create("br", null, this.visualPane.domNode);

					// heatLocal mCheckBox
					domConstruct.create("label", {
						"for": "heatLocal",
						"innerHTML": i18n.visual.heatmap.heatLocal
					}, this.visualPane.domNode);
					this.heatLocal = new mCheckBox({
						"id": "heatLocal",
						"label": i18n.visual.heatmap.on,
						"checked": true,
						"disabled": true
					});
					this.visualPane.addChild(this.heatLocal);
					domConstruct.create("br", null, this.visualPane.domNode);

					// this.visualParentPane.addChild(this.visualPane);

					// this.esriLogo = domConstruct.create("a", {
					// 	"class": "esriLogo",
					// 	"href": config.esriUrl,
					// 	"target": "_blank"
					// }, this.visualParentPane.domNode);

					// domConstruct.create("img", {
					// 	"src": config.img.esriLogo,
					// 	"width": 183,
					// 	"height": 34
					// }, this.esriLogo);

					this.menuAccordion.addChild(this.visualPane);

					// aspect.after(this.visualParentPane, "resize", lang.hitch(this, function() {
					// 	this.rinkwatch.moveLogo(this.visualParentPane, this.visualPane);
					// }));

				}
			},

			/**
			 * Create a HeatmapLayer and add it to the map
			 *
			 * @this {rinkwatch.visual}
			 *
			 */
			createHeatLayer: function() {

				if(!this.heatLayer) {
					this.heatLayer = new HeatmapLayer({
						"config": config.heatmapSettings,
						"map": this.rinkwatch.map,
						"opacity": 0.60,
						"legend": {
								"position": "br",
								"title": i18n.visual.heatmap.title
						}
					}, "heatLayer");
				}
				this.rinkwatch.map.addLayer(this.heatLayer);
				this.getFeatures();
				this.heatCheck = true;
				this.heatLocal.set("disabled", false);

			},

			/**
			 * Delete the HeatmapLayer and remove it from the map
			 *
			 * @this {rinkwatch.visual}
			 *
			 */
			removeHeatLayer: function() {

				this.rinkwatch.map.removeLayer(this.heatLayer);
				this.heatCheck = false;
				this.heatLocal.set("disabled", true);

			},

			/**
			 * Get the features within the current extent from a feature layer for the HeatmapLayer
			 *
			 * @this {rinkwatch.visual}
			 *
			 */
			getFeatures: function() {

				var q = new Query();
				q.geometry = this.rinkwatch.map.extent;
				// If wanting to change filter in the future, modify query settings
				if (this.rinkwatch.filter.skateableFilter.checked) {
					q.where = this.rinkwatch.filter.skateableDQ;
				} else if (this.rinkwatch.filter.notSkateableFilter.checked && !this.rinkwatch.filter.skateableFilter.checked && !this.rinkwatch.filter.noReadingFilter.checked) {
					q.where = "1 = 0";
				} else {
					q.where = this.rinkwatch.filter.allDQ;
				}
				// Set spatial reference of output
				q.outSpatialReference = this.rinkwatch.map.spatialReference;
				this.rinkwatch.rinksLayer.queryFeatures(q, lang.hitch(this, function(featureSet) {
						var data = [];
						// Check if query returns any results
						if (featureSet && featureSet.features && featureSet.features.length > 0) {
								data = featureSet.features;
						}
						// Set heatmap data
						this.heatLayer.setData(data);
				}));

			},

			/**
			 * Set how the map should display the heatmap
			 *
			 * @this {rinkwatch.visual}
			 *
			 */
			setHeatmap: function() {

				if(!this.heatCheck) {
					this.createHeatLayer();
					domAttr.set(this.toggleHeatmap, "label", i18n.visual.heatmap.off);

				} else {
					this.removeHeatLayer();
					domAttr.set(this.toggleHeatmap, "label", i18n.visual.heatmap.on);
				}

			},

			/**
			 * Set if the heatmap should use a local or global maximum
			 *
			 * @this {rinkwatch.visual}
			 *
			 */
			setMaximum: function() {

				if (this.heatLayer.config.useLocalMaximum) {
						this.heatLayer.config.useLocalMaximum = false;
						this.getFeatures();

				} else {
						this.heatLayer.config.useLocalMaximum = true;
						this.getFeatures();
				}

			},

			/**
			 * Collect data and use it to create a ClusterLayer and add it to the map
			 *
			 * @this {rinkwatch.visual}
			 *
			 * @param {boolean} flag - flag dictating whether the ClusterLayer object should be displayed after it is updated/created
			 *
			 */
			createClusterLayer: function(flag) {

				// Location of RinkWatch map service layer
				var clusterTask = new QueryTask(this.rinkwatch.root+config.rinkwatchPublicUrl+"/0");
				var q = new Query();
				q.returnGeometry = true;
				q.where = this.rinkwatch.filter.allDQ;
				q.outFields = ["*"];
				q.outSpatialReference = this.rinkwatch.map.spatialReference;

				// Set up infoTemplate
				var rinkwatchSettings = config.rinkwatchLayers[0];
				var querySettings = config.defaultQuerySettings[rinkwatchSettings.querySettings];
				var rinkwatchTemplate = new InfoTemplate(i18n.popup.title, popup.popupTemplate);

				on(clusterTask, "complete", lang.hitch(this, function(fSet) {
					var clusterInfo = {};
					clusterInfo.data = array.map(fSet.featureSet.features, function(f) {
						var x = f.geometry.x;
						var y = f.geometry.y;
						var attributes = f.attributes;
						return {
							"x": x,
							"y": y,
							"attributes": attributes
						};
					});

					// Store old cluster layer before replacing it so that it can be referenced and removed from the map
					var oldCluster = this.clusterLayer;

					// Create ClusterLayer object
					this.clusterLayer = new ClusterLayer({
						"data": clusterInfo.data,
						"distance": 80,
						"id": "clusterLayer",
						"labelColor": "#fff",
						"labelOffset": 10,
						"resolution": this.rinkwatch.map.extent.getWidth() / this.rinkwatch.map.width,
						"singleColor": "#888",
						"maxSingles": 2000,
						"singleTemplate": rinkwatchTemplate
					});

					// Set symbology for cluster layer
					var defaultSym = new SimpleMarkerSymbol().setSize(3);
					var renderer = new ClassBreaksRenderer(defaultSym, "clusterCount");
					var blackRink = new PictureMarkerSymbol("./images/rinkIconBlackBig.png", 32, 37).setOffset(-4,9);
					var blueRink = new PictureMarkerSymbol("./images/rinkIconBlueBig.png", 47, 54).setOffset(-6,6);
					var greenRink = new PictureMarkerSymbol("./images/rinkIconGreenBig.png", 60, 69).setOffset(-7,4);
					var redRink = new PictureMarkerSymbol("./images/rinkIconRedBig.png", 73, 84).setOffset(-9,1);

					// Add classes and symbology to renderer
					renderer.addBreak(1, 10, blackRink);
					renderer.addBreak(10, 25, blueRink);
					renderer.addBreak(26, 50, greenRink);
					renderer.addBreak(51, 4000, redRink);

					this.clusterLayer.setRenderer(renderer);

					// Remove old ClusterLayer if it exists before replacing it with updated layer
					if (oldCluster) this.rinkwatch.map.removeLayer(oldCluster);

					aspect.after(this.clusterLayer, "show", lang.hitch(this, function() {
						dom.byId("legendLabel").style.display = "none";
					}));
					aspect.after(this.clusterLayer, "hide", lang.hitch(this, function() {
						dom.byId("legendLabel").style.display = "inline";
					}));

					// Determine if ClusterLayer should be added to the map once creation/update is complete
					if (flag) {
						// Hide the rinkwatch map service layers
						this.rinkwatch.rinkwatchLayer.hide();
						this.rinkwatch.filter.skateableLayer.hide();
						this.rinkwatch.filter.notSkateableLayer.hide();
						this.rinkwatch.map.addLayer(this.clusterLayer);
						this.clusterCheck = true;
						this.clusterLayer.show();
					} else {
						this.rinkwatch.map.addLayer(this.clusterLayer);
						this.clusterCheck = false;
						this.clusterLayer.hide();
					}

					on(clusterTask, "error", function(err) {
						console.log(err.details);
					});
				}));
				clusterTask.execute(q);

			},

			/**
			 * Set how the map should display the clusterLayer
			 *
			 * @this {rinkwatch.visual}
			 *
			 */
			setCluster: function() {

				// Create flag to check for if filters are changed - if so, recreate ClusterLayer object
				if (!this.filterCheck) {
					this.filterCheck = this.rinkwatch.filter.allDQ;
				}
				// Create cluster layer if it does not already exist
				if(!this.clusterLayer || this.filterCheck !== this.rinkwatch.filter.allDQ) {
					this.filterCheck = this.rinkwatch.filter.allDQ;
					this.createClusterLayer(true);
					domAttr.set(this.toggleCluster, "label", i18n.visual.clustering.off);
					this.clusterCheck = true;

					// Create the TOC legend object associated with the cluster layer once the cluster has been added to the map
					var createTOCLegend = on(this.rinkwatch.map, "layer-add-result", lang.hitch(this, function() {
						createTOCLegend.remove();
						this.updateLegend();
					}));

				// Hide the cluster layer and show the RinkWatch map service layers
				} else if (this.clusterCheck) {
					this.clusterLayer.hide();
					domAttr.set(this.toggleCluster, "label", i18n.visual.clustering.on);
					this.clusterCheck = false;
					this.rinkwatch.filter.checkActiveLayers();
					this.updateLegend();

				// Hide the RinkWatch map service layer and show the cluster layer
				} else {
					this.rinkwatch.rinkwatchLayer.hide();
					this.rinkwatch.filter.skateableLayer.hide();
					this.rinkwatch.filter.notSkateableLayer.hide();
					this.clusterLayer.show();
					domAttr.set(this.toggleCluster, "label", i18n.visual.clustering.off);
					this.clusterCheck = true;
					this.updateLegend();
				}

			},

			/**
			 * Update the legend to display the correct information given the toggled layers
			 *
			 * @this {rinkwatch.visual}
			 *
			 */
			updateLegend: function() {

				if (!this.toc && this.clusterCheck) {
					this.toc = new TOC({
						map: this.rinkwatch.map,
						layerInfos: [{
							layer: this.clusterLayer,
							title: ""
						}]
					}, "map_toc");
					this.toc.startup();

					// Remove "No Legend" label and "All other features" class from the legend
					domStyle.set(dom.byId("map_legend"), "display", "none");
					domStyle.set(dom.byId("TOCNode_clusterLayer_legend0"), "display", "none");

					// Relabel Legend elements to more accurately describe RinkWatch data
					domAttr.set($("#TOCNode_clusterLayer_legend1").children().children().children()[2], "innerHTML", i18n.visual.clustering.legend[0]);
					domAttr.set($("#TOCNode_clusterLayer_legend2").children().children().children()[2], "innerHTML", i18n.visual.clustering.legend[1]);
					domAttr.set($("#TOCNode_clusterLayer_legend3").children().children().children()[2], "innerHTML", i18n.visual.clustering.legend[2]);
					domAttr.set($("#TOCNode_clusterLayer_legend4").children().children().children()[2], "innerHTML", i18n.visual.clustering.legend[3]);

				} else if (this.clusterCheck) {
					domStyle.set(dom.byId("map_legend"), "display", "none");
					domStyle.set(dom.byId("map_toc"), "display", "block");

				}	else {
					domStyle.set(dom.byId("map_toc"), "display", "none");
					domStyle.set(dom.byId("map_legend"), "display", "block");
				}

			}
		});
	}
);