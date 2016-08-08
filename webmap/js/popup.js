define(
	[

		"dojo/query",
		"dojo/i18n!./nls/text",

		"dojox/charting/Chart2D",
		"dojox/charting/action2d/Highlight",
		"dojox/charting/action2d/Tooltip",
		"dojox/charting/plot2d/Columns",
		"dojox/charting/themes/Wetland",
		"dojox/image/LightboxNano"

	], function(

		$,
		i18n,

		Chart2D,
		Highlight,
		Tooltip,
		Columns,
		Wetland,
		LightboxNano

	) {

		return {

			/**
			 * Set the popupTemplate for the RinkWatch app
			 *
			 * @this {popup}
			 *
			 */
			popupTemplate: function(f) {

				var name = "<b>" + f.attributes.rink_name + "</b><HR>";
				var desc;
				if (!f.attributes.rink_desc || f.attributes.rink_desc.length < 2) {
					desc = "";
				} else {
					desc = i18n.popup.description + "<br />" + f.attributes.rink_desc + "<br /><br />";
				}
				// This switch reclassifies reading data for the infoTemplate.
				var reading;
				if (f.attributes.reading) {
					switch (f.attributes.reading[0].reading_data) {
						case 0:
							reading = i18n.popup.lastReading + i18n.skateStatus[0] + "<br /><br />";
							break;
						case 1:
							reading = i18n.popup.lastReading + i18n.skateStatus[1] + "<br /><br />";
							break;
						default:
							reading = "";
					}
				} else {
					reading = "";
				}
				// Create chart in popup
				// if (f.attributes.reading.length > 1) {

				// }
				// Set attachment for each infoTemplate to load if there is attachment - otherwise, leave blank
				var attachment = "<span class='attachSpan_" + f.attributes.objectid + "'></span>";
				var layer;
				if (rinkwatch.rinksPublicLayer) {
					layer = rinkwatch.rinksPublicLayer;
				} else {
					layer = rinkwatch.rinksLayer;
				}
				layer.queryAttachmentInfos(f.attributes.objectid, function(attachments) {
					var span = $(".contentPane .attachSpan_" + f.attributes.objectid)[0];
					var a = attachments[0];
					if (a && a !== "") {
						if (span) {
							span.innerHTML = i18n.popup.photo + "<br /><a id='popupLightbox'><img src='" + a.url + "' class='popupImage'></a>";
							// Create lightbox element for picture
							rinkwatch.popupLB = new LightboxNano({
								"href": a.url
							}, "popupLightbox");
						}
					} else if (f.attributes.rinkimage && f.attributes.rinkimage.length > 0) {
						var imageUrl = "http://www.rinkwatch.org/media/" + f.attributes.rinkimage;
						span.innerHTML = i18n.popup.photo + "<br /><a id='popupLightbox'><img src='" + imageUrl + "' class='popupImage'></a>";
						// Create lightbox element for picture
						rinkwatch.popupLB = new LightboxNano({
							"href": imageUrl
						}, "popupLightbox");
					} else {
						span.innerHTML = "";
					}
				});
				return name + desc + reading + attachment + "";

			}

		};

	}
);