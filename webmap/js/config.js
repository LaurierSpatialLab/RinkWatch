define([], function() {

		return {

			// The base URL for map layer(s) containing rinkwatch data:
			"rinkwatchUrl": "/arcgis/rest/services/rw/rw/MapServer",
			"rinkwatchPublicUrl": "/arcgis/rest/services/rw/rw_public/MapServer",

			"rinkwatchFeatures": "/arcgis/rest/services/rw/rw/FeatureServer/0",
			"rinkwatchPublicFeatures": "/arcgis/rest/services/rw/rw_public/FeatureServer/0",

			"usersTable": "/arcgis/rest/services/rw/rw/FeatureServer/1",
			"readingsTable": "/arcgis/rest/services/rw/rw/FeatureServer/2",
			"rinksTable": "/arcgis/rest/services/rw/rw/FeatureServer/3",

			"geomServiceUrl": "http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",

			// The url to the GP Task for downloading rink data:
			"exportTaskURL": "/arcgis/rest/services/rw/ExportCSV/GPServer/ExportCSV",

			// Root path where output files from the export GP task will be web-accessible:
			"exportTaskOutputPath": "/webmap/temp/",

			"esriUrl": "http://www.esri.ca/",
			"logInUrl": "http://rinkwatch.org/accounts/login/",


			"tokenPath": "/arcgis/tokens/generateToken",
			"tokenExpiration": 20160,
			"client": "requestip",

			// directory for all images
			"img": {
				"rw_logo": "images/rw_logo.png",
				"esriLogo": "images/esriLogo.png"
			},

			"extentSettings": {
				"xmax": -6300857.115602003,
				"xmin": -15693439.151281966,
				"ymax": 8795761.718829475,
				"ymin": 4236445.855676494,
				// "xmin": -20869143.21052644,
				// "ymin": 1898084.2863770053,
				// "xmax": -2083979.1391665232,
				// "ymax": 11535264.812569464,
				"spatialReference": {
					"wkid": 102100
				}
			},
			"basemapUrl": "http://services.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer",
			"referenceUrl": "http://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Reference_Overlay/MapServer",
			// The url to the GP Task for downloading rink data:
			//"exportTaskURL": "/arcgis/rest/services/KYM/ExportCSV/GPServer/ExportCSV",

			// Root path where output files from the export GP task will be web-accessible:
			//"exportTaskOutputPath": "/temp/",

			// Define the layers that will be used from the rinkwatchUrl:
			"rinkwatchLayers": [

				/*
				properties for each layer:

				name: [text alias], // Probably best to keep this to alphanumeric/underscore characters.  Case-sensitive.
				label: [text display name], // For display in UI elements.
				index: [layer index in the rinkwatchUrl service], // You need to have the service created, and this must correspond to the index number of the layer within the service.  This could potentially be automated, but hasn't been done yet.
				groupname: [the display name of a group that will be used to toggle layers on/off together],
				fcName: [name of the feature class in the source PostgreSQL geodatabase], // typically a lower-case name of a table
				fcLabel: [display appropriate name of the feature class], // For when the feature class's name needs to be displayed in UI elements.
				uniqueID: [the fieldname that represents unique identifiers for the feature class]
				regionFilters: [reference to one of the objects in defaultRegionFilters], // This allows the layer to be filtered based on the selected value in the company market region dropdown.
				querySettings: [reference to one of the objects in defaultQuerySettings], // This defines what fields to include in the query results, and how the popup should be configured when this layer is queried.
				queryIfVisible: [boolean] // For all non-school layers, if the layer is visible, it will be treated as an alternate query layer when no school results are returned.
				*/

				// The first layer listed in this array MUST be the rinks layer, and it MUST have a unique ID field (a.k.a., 'id')
				{
					"name": "rinkwatch",
					"label": "Ice Rinks",
					"index": 0,
					"fcName": "rinkwatch",
					"fcLabel": "Ice Rinks",
					"querySettings": "rinkwatch",
					"uniqueID": "id"
				}//,
				// All other layers will be considered background layers (superimposed over the basemap layer).
				// {
				// 	"name": "boards",
				// 	"label": "School Boards",
				// 	"index": 1,
				// 	"fcName": "school_boards",
				// 	"fcLabel": "School Boards",
				// 	"regionFilters": "prov",
				// 	"querySettings": "boards",
				// 	"queryIfVisible": true
				// },
				// If layers are given a common groupname, they will be linked together and listed as a single item in the layer switching tool.
				// The samples here are differently-styled layers that all use the same three underlying feature classes (hence the similarity of the fcName, fcLabel, regionFilters, and querySettings properties):
			// 	{
			// 		"name": "da0411",
			// 		"index": 2,
			// 		"label": "Dissemination Areas",
			// 		"groupname": "Total Population (aged 4-11)",
			// 		"fcName": "da_2012",
			// 		"fcLabel": "Dissemination Areas",
			// 		"regionFilters": "pr_abbrev",
			// 		"querySettings": "da"
			// 	},
			// 	{
			// 		"name": "csd0411",
			// 		"index": 3,
			// 		"label": "Census Sub-Divisions",
			// 		"groupname": "Total Population (aged 4-11)",
			// 		"fcName": "csd_2012",
			// 		"fcLabel": "Census Sub-Divisions",
			// 		"regionFilters": "pr_abbrev",
			// 		"querySettings": "csd"
			// 	},
			// 	{
			// 		"name": "pr0411",
			// 		"index": 4,
			// 		"label": "Provinces",
			// 		"groupname": "Total Population (aged 4-11)",
			// 		"fcName": "pr_2012",
			// 		"fcLabel": "Provinces",
			// 		"regionFilters": "pr_abbrev"
			// 	},
			// 	{
			// 		"name": "da1213",
			// 		"index": 5,
			// 		"label": "Dissemination Areas",
			// 		"groupname": "Total Population (aged 12-13)",
			// 		"fcName": "da_2012",
			// 		"fcLabel": "Dissemination Areas",
			// 		"regionFilters": "pr_abbrev",
			// 		"querySettings": "da"
			// 	},
			// 	{
			// 		"name": "csd1213",
			// 		"index": 6,
			// 		"label": "Census Sub-Divisions",
			// 		"groupname": "Total Population (aged 12-13)",
			// 		"fcName": "csd_2012",
			// 		"fcLabel": "Census Sub-Divisions",
			// 		"regionFilters": "pr_abbrev",
			// 		"querySettings": "csd"
			// 	},
			// 	{
			// 		"name": "pr1213",
			// 		"index": 7,
			// 		"label": "Provinces",
			// 		"groupname": "Total Population (aged 12-13)",
			// 		"fcName": "pr_2012",
			// 		"fcLabel": "Provinces",
			// 		"regionFilters": "pr_abbrev",
			// 		"querySettings": "pr"
			// 	},
			// 	{
			// 		"name": "da1417",
			// 		"index": 8,
			// 		"label": "Dissemination Areas",
			// 		"groupname": "Total Population (aged 14-17)",
			// 		"fcName": "da_2012",
			// 		"fcLabel": "Dissemination Areas",
			// 		"regionFilters": "pr_abbrev",
			// 		"querySettings": "da"
			// 	},
			// 	{
			// 		"name": "csd1417",
			// 		"index": 9,
			// 		"label": "Census Sub-Divisions",
			// 		"groupname": "Total Population (aged 14-17)",
			// 		"fcName": "csd_2012",
			// 		"fcLabel": "Census Sub-Divisions",
			// 		"regionFilters": "pr_abbrev",
			// 		"querySettings": "csd"
			// 	},
			// 	{
			// 		"name": "pr1417",
			// 		"index": 10,
			// 		"label": "Provinces",
			// 		"groupname": "Total Population (aged 14-17)",
			// 		"fcName": "pr_2012",
			// 		"fcLabel": "Provinces",
			// 		"regionFilters": "pr_abbrev",
			// 		"querySettings": "pr"
			// 	},
			// 	{
			// 		"name": "da1823",
			// 		"index": 11,
			// 		"label": "Dissemination Areas",
			// 		"groupname": "Total Population (aged 18-23)",
			// 		"fcName": "da_2012",
			// 		"fcLabel": "Dissemination Areas",
			// 		"regionFilters": "pr_abbrev",
			// 		"querySettings": "da"
			// 	},
			// 	{
			// 		"name": "csd1823",
			// 		"index": 12,
			// 		"label": "Census Sub-Divisions",
			// 		"groupname": "Total Population (aged 18-23)",
			// 		"fcName": "csd_2012",
			// 		"fcLabel": "Census Sub-Divisions",
			// 		"regionFilters": "pr_abbrev",
			// 		"querySettings": "csd"
			// 	},
			// 	{
			// 		"name": "pr1823",
			// 		"index": 13,
			// 		"label": "Provinces",
			// 		"groupname": "Total Population (aged 18-23)",
			// 		"fcName": "pr_2012",
			// 		"fcLabel": "Provinces",
			// 		"regionFilters": "pr_abbrev",
			// 		"querySettings": "pr"
			// 	}
			],
			// Each filter defines the SQL parameters that correspond to the values listed in the ecRegion select object (with the exception of "all"):
			// "defaultRegionFilters": {
			// 	"ec_region": {
			// 		"Pacific": "ec_region = 'Pacific'",
			// 		"Prairies": "ec_region = 'Prairies'",
			// 		"Ontario": "ec_region = 'Ontario'",
			// 		"National Capital": "ec_region = 'National Capitol'",
			// 		"Quebec": "ec_region = 'Quebec'",
			// 		"Atlantic": "ec_region = 'Atlantic'"
			// 	},
			// 	"prov": {
			// 		"Pacific": "prov in ('BC','YT')",
			// 		"Prairies": "prov in ('AB','SK','MB','NT','NU')",
			// 		"Ontario": "prov in ('ON')",
			// 		"National Capital": "prov in ('ON')",
			// 		"Quebec": "prov in ('QC')",
			// 		"Atlantic": "prov in ('PE','NB','NL','NS')"
			// 	},
			// 	"pr_abbrev": {
			// 		"Pacific": "pr_abbrev in ('BC','YT')",
			// 		"Prairies": "pr_abbrev in ('AB','SK','MB','NT','NU')",
			// 		"Ontario": "pr_abbrev in ('ON')",
			// 		"National Capital": "pr_abbrev in ('ON')",
			// 		"Quebec": "pr_abbrev in ('QC')",
			// 		"Atlantic": "pr_abbrev in ('PE','NB','NL','NS')"
			// 	}
			// },
			// Default market regions - these will be used to populate the ecRegion dropdown
			"numberSelect": [
			"1",
			"2",
			"3",
			"4",
			"5",
			"6",
			"7",
			"8",
			"9",
			"10",
			"11",
			"12",
			"13",
			"14"
			],
			"skateStatus": [
				{
					"value": "0"
				},
				{
					"value": "1"
				}
			],
			"skateIndex": [
				{
					"value": "null"
				},
				{
					"value": "0"
				},
				{
					"value": "1"
				},
				{
					"value": "2"
				},
				{
					"value": "3"
				},
				{
					"value": "4"
				}
			],
			"viewRinks": [
				{
					"value": "0"
				},
				{
					"value": "1"
				}
			],
			"readingDialog": {
				"0": "new",
				"1": "edit"
			},
			"rendererSettings": {
				// Default renderer settings for the rinkwatch layers
				"0": {
					"type": "simple",
					"description": "",
					"symbol" : {
						"angle": 0,
						"xoffset": 0,
						"yoffset": 0,
						"type": "esriPMS",
						"url": "./images/rinkIconGrey.png",
						"contentType": "image/png",
						"width": 15,
						"height": 15
					}
				},
				"1": {
					"type": "simple",
					"description": "",
					"symbol" : {
						"angle": 0,
						"xoffset": 0,
						"yoffset": 0,
						"type": "esriPMS",
						"url": "./images/rinkIconBlue.png",
						"contentType": "image/png",
						"width": 15,
						"height": 15
					}
				},
				"2": {
					"type": "simple",
					"description": "",
					"symbol" : {
						"angle": 0,
						"xoffset": 0,
						"yoffset": 0,
						"type": "esriPMS",
						"url": "./images/rinkIconRed.png",
						"contentType": "image/png",
						"width": 15,
						"height": 15
					}
				},
				"3": {
					"type": "simple",
					"description": "",
					"symbol" : {
						"angle": 0,
						"xoffset": 0,
						"yoffset": 0,
						"type": "esriPMS",
						"url": "./images/rinkIconGreen.png",
						"contentType": "image/png",
						"width": 18,
						"height": 18
					}
				}
			},
			"heatmapSettings": {
				"useLocalMaximum": true,
				"radius": 35,
				"gradient": {
					"0.55": "rgb(255,255,000)",
					"0.75": "rgb(000,255,000)",
					"0.95": "rgb(000,255,255)",
					"1.00": "rgb(000,000,255)"
				}
			},
			// 	"Prairies": {
			// 		"value": "Prairies",
			// 		"extent": {
			// 			"xmin": -15869550.064454138,
			// 			"ymin": 4190810.377921864,
			// 			"xmax": -6985732.889040176,
			// 			"ymax": 15810580.859899718,
			// 			"spatialReference": {
			// 				"wkid": 102100
			// 			}
			// 		}
			// 	},
			// 	"Ontario": {
			// 		"value": "Ontario",
			// 		"extent": {
			// 			"xmin": -10750103.65802685,
			// 			"ymin": 3498530.117771566,
			// 			"xmax": -8206279.356696861,
			// 			"ymax": 9219484.411625057,
			// 			"spatialReference": {
			// 				"wkid": 102100
			// 			}
			// 		}
			// 	},
			// 	"National Capital": {
			// 		"value": "National Capital",
			// 		"extent": {
			// 			"xmax": -7559927.845517592,
			// 			"xmin": -9432329.290390765,
			// 			"ymax": 6131702.651835341,
			// 			"ymin": 5045685.353959851,
			// 			"spatialReference": {
			// 				"wkid": 102100
			// 			}
			// 		}
			// 	},
			// 	"Quebec": {
			// 		"value": "Quebec",
			// 		"extent": {
			// 			"xmin": -9072158.01311064,
			// 			"ymin": 4065157.388573008,
			// 			"xmax": -6616389.16836515,
			// 			"ymax": 9245956.844589997,
			// 			"spatialReference": {
			// 				"wkid": 102100
			// 			}
			// 		}
			// 	},
			// 	"Atlantic": {
			// 		"value": "Atlantic",
			// 		"extent": {
			// 			"xmin": -7868733.439789613,
			// 			"ymin": 4301832.246007064,
			// 			"xmax": -5809214.149674372,
			// 			"ymax": 8982631.702024054,
			// 			"spatialReference": {
			// 				"wkid": 102100
			// 			}
			// 		}
			// 	}
			// },
			// Default summary reports - these will be used to populate the selReport dropdown.
			// "defaultReports": [
			// 	// The value of each option should take the form "data_view_layer.attribute", where data_view_layer is
			// 	// the name of one of the layers defined in the tables below, and
			// 	// the specified attribute will be used to group the calculated totals for the report.
			// 	{
			// 		"label": "Licensed Schools",
			// 		"value": "schools.licensed"
			// 	},
			// 	{
			// 		"label": "Schools with Software Installed",
			// 		"value": "schools.sw_access"
			// 	},
			// 	{
			// 		"label": "School Education Level",
			// 		"value": "schools.edu_level"
			// 	},
			// 	{
			// 		"label": "License Types",
			// 		"value": "license.lic_type"
			// 	},
			// 	{
			// 		"label": "License Product",
			// 		"value": "license.lic_product"
			// 	},
			// 	{
			// 		"label": "License Levels",
			// 		"value": "license.lic_level"
			// 	}
			// ],
			// Default query settings - update this to match the contents of the layers defined in rinkwatchLayers:
			"defaultQuerySettings": {
				"rinkwatch": {
					"fields": [
						"id",
						"rink_name",
						"rink_desc",
						"rinkimage",
						"objectid"
					],
					"popupSize": {
						"w":270,
						"h":300
					}
				},
				"user": {
					"fields": [
					"id"
					]
				},
				"reading": {
					"fields": [
					"reading_data",
					"reading_time"
					],
					"expression": "1 = 1"
				},
			// 	"boards":
			// 	{
			// 		"fields": ["objectid","name","board_type","language","prov","am","buid","licensed","board_id"],
			// 		"popupTitle":"${name}",
			// 		"popupTemplate":"<strong><span style=\"font-size:1.2em;\">School Board:</span></strong><br />"
			// 			+"<strong>Name</strong>: ${name}<br />"
			// 			+"<strong>Board Type</strong>: ${board_type}<br />"
			// 			+"<strong>Province</strong>: ${prov}<br />"
			// 			+"<strong>Language</strong>: ${language}<br />"
			// 			+"<strong>Licensed</strong>: ${licensed}<br />"
			// 			+"<strong>Account Manager</strong>: ${am}<br />",
			// 		"popupSize": {"w":300,"h":170}
			// 	},
			// 	"da":
			// 	{
			// 		"fields": ["dauid","pr_abbrev","da_age_csv_totpop2011","da_age_csv_age4_11","da_age_csv_age12_13","da_age_csv_age14_17","da_age_csv_age18_23","da_age_csv_medage"],
			// 		"popupTemplate":"<strong><span style=\"font-size:1.2em;\">Dissemintation Area</span></strong><br />"
			// 			+"<strong>Dissemination Area ID</strong>: ${dauid}<br />"
			// 			+"<strong>Province</strong>: ${pr_abbrev}<br />"
			// 			+"<strong>2011 Total Population</strong>: ${da_age_csv_totpop2011}<br />"
			// 			+"<strong>2011 Pop. aged 4 to 11</strong>: ${da_age_csv_age4_11}<br />"
			// 			+"<strong>2011 Pop. aged 12 to 13</strong>: ${da_age_csv_age12_13}<br />"
			// 			+"<strong>2011 Pop. aged 14 to 17</strong>: ${da_age_csv_age14_17}<br />"
			// 			+"<strong>2011 Pop. aged 18 to 23</strong>: ${da_age_csv_age18_23}<br />"
			// 			+"<strong>2011 Median Age</strong>: ${da_age_csv_medage}<br />",
			// 		"popupTitle": "Dissemination Area",
			// 		"popupSize": {w:250,h:175}
			// 	},
			// 	"csd": null, // This layer isn't being queried by the application yet...
			// 	"pr": null // This layer isn't being queried by the application yet...
			},
			// Define the alternative layer that will be queried if no schools are returned when a mouse is clicked on the map.
			// NOTE: The application is configured to always query the layer identified below.  Additional work will be needed to have the application query the currently visible background layer instead.
			// "alternateQueryLayer": 2,
			// Config for views that contain data that may be summarized
			"tables": {
				"url": "/arcgis/rest/services/rw/rw_public/MapServer",
				"layers": {
					"rink": "0",
					"user": "1",
					"reading": "2"
				}
			},

			"featuretables": {
				"url": "/arcgis/rest/services/rw/rw_public/FeatureServer",
				"layers": {
					"rinkxy": "0",
					"user": "1",
					"reading": "2",
					"rink": "3"
				}
			}//,
			// Controls the number of results displayed per page in the license details report dialog:
			// "reportDialogResultsPerPage": 100
		};
	}
);
