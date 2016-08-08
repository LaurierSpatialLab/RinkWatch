define(
	[

		"dojo/aspect",
		"dojo/dom",
		"dojo/dom-construct",
		"dojo/dom-style",
		"dojo/json",
		"dojo/number",
		"dojo/on",
		"dojo/query",
		"dojo/_base/array",
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/date/locale",
		"dojo/i18n!./nls/text",

		"dojox/charting/Chart2D",
		"dojox/charting/SimpleTheme",
		"dojox/charting/action2d/Highlight",
		"dojox/charting/action2d/Tooltip",
		"dojox/charting/action2d/Magnify",
		"dojox/charting/plot2d/Columns",
		"dojox/charting/plot2d/Scatter",
		"dojox/charting/widget/Legend",

		"esri/tasks/query",
		"esri/tasks/QueryTask",

		"./config"

	], function(

		aspect,
		dom,
		domConstruct,
		domStyle,
		JSON,
		number,
		on,
		$,
		array,
		declare,
		lang,
		locale,
		i18n,

		Chart2D,
		SimpleTheme,
		Highlight,
		Tooltip,
		Magnify,
		Columns,
		Scatter,
		Legend,

		Query,
		QueryTask,

		config

	) {

		return declare(null, {


			constructor: function(rinkwatch) {

				this.rinkwatch = rinkwatch;

				this.getChartReadings();

			},

			createRinkChart: function() {

				this.myTheme = new SimpleTheme({
					markers: {
						CIRCLE: "m-3,0 c0,-4 6,-4 6,0 m-6,0 c0,4 6,4 6,0",
						SQUARE: "m-3,0 c0,-4 6,-4 6,0 m-6,0 c0,4 6,4 6,0" // Trick theme into using circle for square :)
					}
				});

				this.rinkChart = new Chart2D("rinkChart", {
					margins: {
						l: -9,
						r: 2,
						t: 2,
						b: 10
					},
					animate: {
						duration: 1000
					}
				}).setTheme(this.myTheme);

				this.rinkChart.addPlot("default", {
					type: "Scatter",
					gap: 0,
					styleFunc: function(item) {
						if (item.y > 1) {
							return {
								stroke: {
									color: "blue"
								},
								fill: "blue"
							};
						} else if (item.y == 1) {
							return {
								stroke: {
									color: "red"
								},
								fill: "red"
							};
						}
						return {};
					}
				});

				// this.rinkChart.setTheme(CubanShirts);
				this.rinkChart.addAxis("x", {
					labelFunc: function(o, value) {
						var dt = new Date();
						dt.setTime(value);
						var d = (dt.getUTCMonth() + 1) + "/" + dt.getUTCDate() + "/" + dt.getUTCFullYear();
						return d;
					},
					fixUpper: "minor",
					fixLower: "minor",
					maxLabelSize: 100,
					min: this.rinkwatch.filter.startDateBox.value.getTime(),
					max: this.rinkwatch.filter.endDateBox.value.getTime() + 5
				});

				this.rinkChart.addAxis("y", {
					labelFunc: function(o, value) {
						return " ";
					},
					// type : "Invisible",
					vertical: true,
					fixLower: "minor",
					fixUpper: "minor",
					min: 0,
					max: 2.2
					// maxLabelSize: 50
				});

				this.rinkChart.addSeries(i18n.skateStatus[0], this.notSkateableChartData);
				this.rinkChart.addSeries(i18n.skateStatus[1], this.skateableChartData);
				var tip = new Tooltip(this.rinkChart, "default");
				var hightlight = new Highlight(this.rinkChart, "default");
				var mag = new Magnify(this.rinkChart, "default");
				this.rinkChart.render();
				if (this.rinkwatch.reading.readingFlag) {
					this.rinkChart.resize();
					this.rinkwatch.reading.readingFlag = false;
				}
				this.chartDestroy = false;
				// if (!this.chartLegend) {
					this.chartLegend = new Legend({
						chartRef: this.rinkChart
					}, "chartLegend");
				// }

				aspect.after(this.rinkwatch.rink.rinkPane, "resize", lang.hitch(this, function() {
					if ((this.rinkChart && this.skateableChartData && this.skateableChartData.length > 0) || (this.rinkChart && this.notSkateableChartData && this.notSkateableChartData.length > 0)) {
						this.rinkChart.resize();
					}
				}));

			},

			getChartReadings: function() {

				this.notSkateableChartData = [];
				this.skateableChartData = [];
				var startDate = this.rinkwatch.filter.startDateBox.value;
				var endDate = this.rinkwatch.filter.endDateBox.value;
				array.forEach(this.rinkwatch.readingArray[this.rinkwatch.rink.currentRink.id], function(r) {
					var rDate = r.attributes.reading_time;
					// Replace first two "-" with "/" so that Date object can be read in all browsers
					if (new Date(rDate).getTime() == rDate) {
						rDate = new Date(rDate);
					} else {
						rDate = new Date(rDate.replace(/-/, "/").replace(/-/, "/"));
					}
					if ((rDate.getTime() <= endDate.getTime()) && (rDate.getTime() >= startDate.getTime())) {
						// Add 1 to reading_data for chart classification scheme
						var readingData = r.attributes.reading_data + 1;
						var tooltip = (rDate.getUTCMonth() + 1) + "/" + rDate.getUTCDate() + "/" + rDate.getUTCFullYear();
						var reading = JSON.parse('{"x":' + rDate.getTime() + ', "y":' + readingData + ', "tooltip":"' + tooltip + '"}', true);
						if (readingData == 2) {
							this.skateableChartData.push(reading);
						} else if (readingData == 1) {
							this.notSkateableChartData.push(reading);
						}
						// this.chartData.push(reading);
					}
				}, this);
				if (this.skateableChartData.length === 0 && this.notSkateableChartData.length === 0) {
					domConstruct.empty("rinkChart");
					if (dom.byId("chartLegend")) {
						domConstruct.empty("chartLegend");
					}
					// domStyle.set("chartLegend", "display", "none");
					if (this.rinkChart && !this.chartDestroy) {
						this.rinkChart.destroy();
						this.chartLegend.destroyRecursive(true);
						this.chartDestroy = true;
					}
					domConstruct.create("br", null, "rinkChart");
					dom.byId("rinkChart").innerHTML = i18n.chart.noData;
					domConstruct.create("br", null, "rinkChart");
					domConstruct.create("br", null, "rinkChart");
				} else if (!this.rinkChart && !this.chartFlag) {
					domConstruct.empty("rinkChart");
					this.chartFlag = true;
					this.createRinkChart();
					on(this.rinkwatch.filter.startDateBox, "change", lang.hitch(this, this.getChartReadings));
					on(this.rinkwatch.filter.endDateBox, "change", lang.hitch(this, this.getChartReadings));
					on(this.rinkwatch.rink.curRink, "change", lang.hitch(this, this.getChartReadings));
				} else {
					domConstruct.empty("rinkChart");
					if (dom.byId("chartLegend")) {
						domConstruct.empty("chartLegend");
					}
					// domStyle.set("chartLegend", "display", "inline-block");
					if (this.rinkChart && !this.chartDestroy) {
						this.rinkChart.destroy();
						this.chartLegend.destroyRecursive(true);
						this.chartDestroy = true;
					}
					this.createRinkChart();
				}

			}

		});
	}
);