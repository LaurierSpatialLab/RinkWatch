define(
	[

		"dojo/dom",
		"dojo/_base/lang",
		"dojo/request/iframe",

		"esri/domUtils",
		"esri/tasks/Geoprocessor",

		"./config"

	], function(

		dom,
		lang,
		iframe,

		domUtils,
		Geoprocessor,

		config

	) {

		return {

			/**
			 * Downloads all of the user's rink date into a csv file
			 *
			 * @this {report}
			 *
			 */
			downloadRinkReport: function(params) {

				var gpTask = new Geoprocessor(config.exportTaskURL);

				domUtils.show(dom.byId("status"));
				gpTask.submitJob(params, lang.hitch(this, function(s) {
					gpTask.getResultData(s.jobId, "output", lang.hitch(this, function(r) {
						domUtils.hide(dom.byId("status"));
						if (!this._downloadIframe) {
							this._downloadIframe = iframe.create("_downloadIframe");
						}
						iframe.setSrc(this._downloadIframe, config.exportTaskOutputPath + r.value, true);
					}));
				}));

			}

		};
	}
);