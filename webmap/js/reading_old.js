define(
	[

		"dojo/dom-construct",
		"dojo/keys",
		"dojo/on",
		"dojo/_base/array",
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/i18n!./nls/text",

		"dijit/Dialog",
		"dijit/MenuItem",
		"dijit/registry",
		"dijit/form/Button",
		"dijit/form/DateTextBox",
		"dijit/form/Select",
		"dijit/layout/ContentPane",

		"dojox/mobile/TextArea",

		"esri/tasks/query",
		"esri/tasks/QueryTask",

		"./config",

		"modules/BusyButton"

	], function(

		domConstruct,
		keys,
		on,
		array,
		declare,
		lang,
		i18n,

		Dialog,
		MenuItem,
		registry,
		Button,
		DateTextBox,
		Select,
		ContentPane,

		mTextArea,

		Query,
		QueryTask,

		config,

		BusyButton

	) {

		return declare(null, {

			constructor: function(rinkwatch) {

				this.rinkwatch = rinkwatch;

				this.createReadingDialog(config.readingDialog[0]);
				this.createReadingDialog(config.readingDialog[1]);

				on(this.readingBtn, "click", lang.hitch(this, this.showReadingDialog));
				on(this.readingBtnSmall, "click", lang.hitch(this, this.showReadingDialog));
				on(this.editReadingBtn, "click", lang.hitch(this, this.populateEditDialog));
				on(this.cancelReading, "click", lang.hitch(this, function() {
					this.saveReading.cancel();
					this.readingDialog.hide();
				}));
				on(this.saveReading, "click", lang.hitch(this, this.saveNewReading));
				on(this.skateStatus, "change", lang.hitch(this, function() {
					this.setSkateIndex(this.skateStatus, this.skateIndex);
				}));
				on(this.editStatus, "change", lang.hitch(this, function() {
					this.setSkateIndex(this.editStatus, this.editIndex);
				}));
				on(this.editSelect, "change", lang.hitch(this, this.setEditAttributes));
					on(this.saveEdits, "click", lang.hitch(this, this.saveEditedReading));
				on(this.cancelEdits, "click", lang.hitch(this, function() {
					this.saveEdits.cancel();
					this.editDialog.hide();
				}));

			},

			/**
			 * Create the contents of the readingPane, and add them to the DOM
			 *
			 * @this {rinkwatch}
			 *
			 */
			createReadingDialog: function(type) {

				switch(type) {

					case undefined:
					case null:
					case "new":

						if (!this.readingDialog) {

							this.readingBtn = new Button({
								"label": i18n.toolbar.buttons.newReading,
								"id": "readingBtn",
								"iconClass": "plusIcon",
								"style": "padding: 3px 0px 0px 0px;"
							});

							this.readingBtnSmall = new Button({
								"id": "readingBtnSmall",
								"iconClass": "plusIcon",
								"title": i18n.toolbar.buttons.newReading,
								"style": "padding: 3px 0px 0px 0px;"
							});

							registry.byId("toolbar").addChild(this.readingBtn, "first");
							registry.byId("toolbar").addChild(this.readingBtnSmall, "first");

							this.rinkwatch.resizeButtons();

							this.readingDialog = new Dialog({
								"title": i18n.toolbar.buttons.newReading,
								"id": "readingDialog"
							});

							this.readingPane = new ContentPane({
								"id": "readingPane",
								"class": "claro"
							});

							// readingCalendar DateTextBox
							this.curDate = new Date();
							domConstruct.create("label", {
								"for": "readingCalendar",
								"innerHTML": i18n.reading.readingCalendar
							}, this.readingPane.domNode);
							domConstruct.create("br", null, this.readingPane.domNode);
							this.readingCalendar = new DateTextBox({
								"id": "readingCalendar",
								"required": false,
								"dayWidth": "abbr",
								"value": this.curDate,
								"constraints": {
									"max": this.curDate
								}
							});
							this.readingPane.addChild(this.readingCalendar);
							domConstruct.create("br", null, this.readingPane.domNode);

							// skateStatus Select
							domConstruct.create("label", {
								"for": "skateStatus",
								"innerHTML": i18n.reading.skateStatus
							}, this.readingPane.domNode);
							domConstruct.create("br", null, this.readingPane.domNode);
							this.skateStatus = new Select({
								"id": "skateStatus",
								"forceWidth": true
							});
							this.readingPane.addChild(this.skateStatus);
							domConstruct.create("br", null, this.readingPane.domNode);
							array.forEach(config.skateStatus, function(f) {
								this.skateStatus.addOption({
									label: i18n.skateStatus[f.value],
									value: f.value
								});
							}, this);


							// skateIndex Select
							domConstruct.create("label", {
								"for": "skateIndex",
								"innerHTML": i18n.reading.skateIndex
							}, this.readingPane.domNode);
							domConstruct.create("br", null, this.readingPane.domNode);
							this.skateIndex = new Select({
								"id": "skateIndex",
								"forceWidth": true
							});
							this.readingPane.addChild(this.skateIndex);
							domConstruct.create("br", null, this.readingPane.domNode);
							array.forEach(config.skateIndex, function(f) {
								this.skateIndex.addOption({
									label: i18n.skateIndex[f.value],
									value: f.value
								});
							}, this);


							// readingDesc mTextArea
							domConstruct.create("label", {
								"for": "readingDesc",
								"innerHTML": i18n.reading.readingDesc
							}, this.readingPane.domNode);
							domConstruct.create("br", null, this.readingPane.domNode);
							this.readingDesc = new mTextArea({
								"id": "readingDesc",
								"maxlength": 80,
								"rows": 3,
								"cols": 27
							});
							this.readingPane.addChild(this.readingDesc);
							domConstruct.create("br", null, this.readingPane.domNode);

							domConstruct.create("font", {
								"size": 1,
								"innerHTML": "(" + i18n.reading.maxChar + ": " + this.readingDesc.maxlength + ")"
							}, this.readingPane.domNode);
							domConstruct.create("br", null, this.readingPane.domNode);

							this.readingButtons = new ContentPane({
								"id": "readingButtons",
								"class": "claro"
							});


							// saveReading BusyButton
							this.saveReading = new BusyButton({
								"id": "saveReading",
								"label": i18n.reading.saveReading,
								"busyLabel": i18n.reading.saveReadingBusy
							});
							this.readingButtons.addChild(this.saveReading);


							// cancelReading Button
							this.cancelReading = new Button ({
								"id": "cancelReading",
								"label": i18n.reading.cancelReading
							});
							this.readingButtons.addChild(this.cancelReading);

							this.readingDialog.addChild(this.readingPane);
							this.readingDialog.addChild(this.readingButtons);
							this.readingDialog.startup();

						}
					break;

					// Create dialog for editing reaadings (very similar)
					case "edit":

						if (!this.editDialog) {

							// Add editReadingBtn MenuItem to userLog Menu
							this.editReadingBtn = new MenuItem({
								"id": "editReadingBtn",
								"label": i18n.toolbar.userLog.editReading
							});
							this.rinkwatch.userLog.addChild(this.editReadingBtn, "first");


							// editDialog Dialog
							this.editDialog = new Dialog({
								"id": "editDialog",
								"title": i18n.toolbar.userLog.editReading
							});


							// editPane ContentPane
							this.editPane = new ContentPane({
								"id": "editPane",
								"class": "claro"
							});


							// editSelect Select
							domConstruct.create("label", {
								"for": "editSelect",
								"innerHTML": i18n.reading.editSelect
							}, this.editPane.domNode);
							domConstruct.create("br", null, this.editPane.domNode);
							this.editSelect = new Select({
								"id": "editSelect",
								"forceWidth": true
							});
							this.editPane.addChild(this.editSelect);
							domConstruct.create("br", null, this.editPane.domNode);


							// editStatus Select
							domConstruct.create("label", {
								"for": "editStatus",
								"innerHTML": i18n.reading.skateStatus
							}, this.editPane.domNode);
							domConstruct.create("br", null, this.editPane.domNode);
							this.editStatus = new Select({
								"id": "editStatus",
								"forceWidth": true
							});
							this.editPane.addChild(this.editStatus);
							domConstruct.create("br", null, this.editPane.domNode);
							array.forEach(config.skateStatus, function(f) {
								this.editStatus.addOption({
									label: i18n.skateStatus[f.value],
									value: f.value
								});
							}, this);


							// editIndex Select
							domConstruct.create("label", {
								"for": "editIndex",
								"innerHTML": i18n.reading.skateIndex
							}, this.editPane.domNode);
							domConstruct.create("br", null, this.editPane.domNode);
							this.editIndex = new Select({
								"id": "editIndex",
								"forceWidth": true
							});
							this.editPane.addChild(this.editIndex);
							domConstruct.create("br", null, this.editPane.domNode);
							array.forEach(config.skateIndex, function(f) {
								this.editIndex.addOption({
									label: i18n.skateIndex[f.value],
									value: f.value
								});
							}, this);


							// editCalendar DateTextBox
							domConstruct.create("label", {
								"for": "editCalendar",
								"innerHTML": i18n.reading.readingCalendar
							}, this.editPane.domNode);
							domConstruct.create("br", null, this.editPane.domNode);
							this.editCalendar = new DateTextBox({
								"id": "editCalendar",
								"required": false,
								"dayWidth": "abbr",
								"value": this.curDate,
								"constraints": {
									"max": this.curDate
								}
							});
							this.editPane.addChild(this.editCalendar);
							domConstruct.create("br", null, this.editPane.domNode);


							// editDesc mTextArea
							domConstruct.create("label", {
								"for": "editDesc",
								"innerHTML": i18n.reading.readingDesc
							}, this.editPane.domNode);
							domConstruct.create("br", null, this.editPane.domNode);
							this.editDesc = new mTextArea({
								"id": "editDesc",
								"maxlength": 80,
								"rows": 3,
								"cols": 27
							});
							this.editPane.addChild(this.editDesc);
							domConstruct.create("br", null, this.editPane.domNode);

							domConstruct.create("font", {
								"size": 1,
								"innerHTML": "(" + i18n.reading.maxChar + ": " + this.readingDesc.maxlength + ")"
							}, this.editPane.domNode);
							domConstruct.create("br", null, this.editPane.domNode);

							this.editButtons = new ContentPane({
								"id": "editButtons",
								"class": "claro"
							});


							// saveEdits BusyButton
							this.saveEdits = new BusyButton({
								"id": "saveEdits",
								"label": i18n.reading.saveEdits,
								"busyLabel": i18n.reading.saveEditsBusy
							});
							this.editButtons.addChild(this.saveEdits);


							// cancelEdits Button
							this.cancelEdits = new Button ({
								"id": "cancelEdits",
								"label": i18n.reading.cancelReading
							});
							this.editButtons.addChild(this.cancelEdits);

							this.editDialog.addChild(this.editPane);
							this.editDialog.addChild(this.editButtons);
							this.editDialog.startup();

						}
					break;
				}

			},

			showReadingDialog: function() {

				this.clearReadingDialog();
				if (this.rinkwatch.rink.curRink.value === 0) {
					alert(i18n.reading.noRinks);
				} else {
					this.readingDialog.show();
				}

			},

			clearReadingDialog: function() {

				this.skateStatus.set("value", "0");
				this.skateIndex.set("value", "0");
				this.skateIndex.set("disabled", true);
				this.readingCalendar.set("value", this.curDate);
				this.readingDesc.set("value", "");

			},

			populateEditDialog: function() {

				if (this.rinkwatch.rink.curRink.value === 0) {
					alert(i18n.reading.noRinks);
				} else {
					// Remove all prior options before repopulating the reading select
					this.editSelect.removeOption(this.editSelect.getOptions());
					this.curOID = [];
					if (this.rinkwatch.readingArray[this.rinkwatch.rink.currentRink.id] && this.rinkwatch.readingArray[this.rinkwatch.rink.currentRink.id].length > 0) {
						array.forEach(this.rinkwatch.readingArray[this.rinkwatch.rink.currentRink.id], function(r) {
							var rDate = r.attributes.reading_time;
							// Replace rirst two "-" with "/" so that Date object can be created in all browsers
							if (new Date(rDate).getTime() == rDate) {
								rDate = new Date(rDate);
							} else {
								rDate = new Date(rDate.replace(/-/, "/").replace(/-/, "/"));
							}
							var date = (rDate.getUTCMonth() + 1) + "/" + rDate.getUTCDate() + "/" + rDate.getUTCFullYear();

							this.editSelect.addOption({
								label: date,
								value: r.attributes.objectid
							});
							// save the current objectid of the reading being edited
							// this.curOID[r.attributes.id] = r.attributes.objectid;
						}, this);

						// set the edit dialog with attributes from selected reading
						this.setEditAttributes();
						this.editDialog.show();
					} else {
						alert(i18n.reading.noReadings);
					}
				}

			},

			setEditAttributes: function() {

				array.some(this.rinkwatch.readingArray[this.rinkwatch.rink.currentRink.id], function(r) {
					if (this.editSelect.value == r.attributes.objectid) {
						var rDate = r.attributes.reading_time;
						// Replace first two "-" with "/" so that Date object can be created in all browsers
						if (new Date(rDate).getTime() == rDate) {
							rDate = new Date(rDate);
						} else {
							rDate = new Date(rDate.replace(/-/, "/").replace(/-/, "/"));
						}
						this.editStatus.set("value", r.attributes.reading_data);
						this.setSkateIndex(this.editStatus, this.editIndex);
						if (r.attributes.skateable) {
							this.editIndex.set("value", r.attributes.skateable);
						}
						this.editCalendar.set("value", rDate);
						if (r.attributes.reading_text && r.attributes.reading_text.length > 0) {
							this.editDesc.set("innerHTML", r.attributes.reading_text);
							this.editDesc.set("value", r.attributes.reading_text);
						} else {
							this.editDesc.set("innerHTML", "");
							this.editDesc.set("value", "");
						}
						return true;
					}
				}, this);

			},

			setSkateIndex: function(status, index) {

				if (status.value == 1) {
					index.set("disabled", false);
				} else {
					index.set("disabled", true);
					index.set("value", 0);
				}

			},

			saveNewReading: function() {

				this.cancelReading.setDisabled(true);
				this.saveReading.makeReallyBusy();
				var status = Number(this.skateStatus.value);
				var index;
				if (!this.skateIndex.disabled) {
					index = Number(this.skateIndex.value);
				} else {
					index = null;
				}
				var desc;
				if (this.readingDesc.value && this.readingDesc.value.length > 0) {
					desc = this.readingDesc.value;
				} else {
					desc = "";
				}
				var date = (this.readingCalendar.value.getUTCMonth() + 1) + "/" + this.readingCalendar.value.getUTCDate() + "/" + this.readingCalendar.value.getUTCFullYear() + " 05:00:00";

				var queryRoot = this.rinkwatch.root+config.tables.url+"/";

				var idQueryTask = new QueryTask(queryRoot+config.tables.layers.reading);

				var idQuery = new Query();
				idQuery.where = "reading_rink_id = " + this.rinkwatch.rink.currentRink.id + " AND reading_time = timestamp '" + date + "'";
				idQuery.outFields = ["*"];
				idQueryTask.execute(idQuery, lang.hitch(this, function(fs) {
					if (fs.features && fs.features.length > 0) {
						alert(i18n.reading.existingReading);
						this.cancelReading.setDisabled(false);
						this.saveReading.cancel();
						return;
					} else {
						var reading = {
							"attributes": {
						//		"id": this.readingId,
								"reading_rink_id": this.rinkwatch.rink.currentRink.id,
								"reading_data": status,
								"reading_time": date,
								"skateable": index,
								"reading_text": desc
							}
						};
						this.rinkwatch.readingsTable.applyEdits([reading], null, null, lang.hitch(this, function(r) {
							// if (this.rinkPoint.attributes.objectid) {
								// add to readingArray so that when editing readings from current session, no problems persist
								// add objectid to reading object
								reading.attributes.objectid = r[0].objectId;
								if (this.rinkwatch.readingArray[this.rinkwatch.rink.currentRink.id]) {
									this.rinkwatch.readingArray[this.rinkwatch.rink.currentRink.id].unshift(reading);
								} else {
									// if rink was created during the current session, no entry will be made in the reading array - create new element in array for rink with reading data
									this.rinkwatch.readingArray[this.rinkwatch.rink.currentRink.id] = [reading];
								}
								this.applyReading();
						// } else if (console && console.info) console.info("Error: Could not get objectid for the skating info.");
						}));
					}
				}));

			},

			saveEditedReading: function() {

				this.cancelEdits.setDisabled(true);
				this.saveEdits.makeReallyBusy();
				var status = Number(this.editStatus.value);
				var index;
				if (!this.editIndex.disabled) {
					index = Number(this.editIndex.value);
				} else {
					index = null;
				}
				var desc;
				if (this.editDesc.value && this.editDesc.value.length > 0) {
					desc = this.editDesc.value;
				} else {
					desc = "";
				}
				var date = (this.editCalendar.value.getUTCMonth() + 1) + "/" + this.editCalendar.value.getUTCDate() + "/" + this.editCalendar.value.getUTCFullYear() + " 05:00:00";

				var reading = {
					"attributes": {
						"objectid": this.editSelect.value,
						"reading_rink_id": this.rinkwatch.rink.currentRink.id,
						"reading_data": status,
						"reading_time": date,
						"skateable": index,
						"reading_text": desc
					}
				};
				this.rinkwatch.readingsTable.applyEdits(null, [reading], null, lang.hitch(this, function() {
					// if (this.rinkPoint.attributes.objectid) {
						// add to readingArray so that when editing readings from current session, no problems persist
						this.replaceReading(reading);
						this.applyEditedReading();
						// this.rinkwatch.readingArray[this.rinkwatch.rink.currentRink.id].unshift(reading);
					// } else if (console && console.info) console.info("Error: Could not get objectid for the skating info.");
				}));

			},

			replaceReading: function(reading) {

				array.some(this.rinkwatch.readingArray[this.rinkwatch.rink.currentRink.id], function(r, i) {
					if (r.attributes.objectid == reading.attributes.objectid) {
						this.rinkwatch.readingArray[this.rinkwatch.rink.currentRink.id][i].attributes = reading.attributes;
						return true;
					}
				}, this);

			},

			applyReading: function() {

				this.rinkwatch.rink.getReadings();
				this.readingDialog.hide();
				this.saveReading.cancel();
				this.cancelReading.setDisabled(false);
				this.rinkwatch.filter.setRinkDisplay();
				this.readingFlag = true;
				// this.rinkwatch.chart.getChartReadings();

			},

			applyEditedReading: function() {

				this.rinkwatch.rink.getReadings();
				this.editDialog.hide();
				this.saveEdits.cancel();
				this.cancelEdits.setDisabled(false);
				this.rinkwatch.filter.setRinkDisplay();
				this.readingFlag = true;
				// this.rinkwatch.chart.getChartReadings();

			}

		});

	}

);