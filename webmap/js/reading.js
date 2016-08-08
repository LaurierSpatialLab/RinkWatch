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
		"dojo/i18n!./nls/text",

		"dijit/Dialog",
		"dijit/Menu",
		"dijit/MenuItem",
		"dijit/registry",
		"dijit/form/Button",
		"dijit/form/DateTextBox",
		"dijit/form/DropDownButton",
		"dijit/form/Select",
		"dijit/layout/ContentPane",

		"dojox/mobile/TextArea",

		"esri/tasks/query",
		"esri/tasks/QueryTask",

		"./config",

		"modules/BusyButton"

	], function(

		domAttr,
		domConstruct,
		domStyle,
		keys,
		on,
		array,
		declare,
		lang,
		i18n,

		Dialog,
		Menu,
		MenuItem,
		registry,
		Button,
		DateTextBox,
		DropDownButton,
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

				this.readingMenu = new Menu();

				this.readingDropDownBtn = new DropDownButton({
					"label": i18n.toolbar.buttons.readingDropDown,
					"id": "readingDropDownBtn",
					"baseClass": "reading",
					"iconClass": "plusIcon",
					"style": "padding: 3px 0px 0px 0px;",
					"dropDown": this.readingMenu
				});

				this.readingBtn = new MenuItem({
					"label": i18n.toolbar.buttons.newReading,
					"iconClass": "plusIconBlue",
					"id": "readingBtn"
				});
				this.readingMenu.addChild(this.readingBtn);

				this.readingBtnSmall = new Button({
					"id": "readingBtnSmall",
					"iconClass": "plusIcon",
					"title": i18n.toolbar.buttons.newReading,
					"style": "padding: 3px 0px 0px 0px;"
				});

				// Need to make sure this constraint works...
				var date = new Date();
				this.curDate = new Date((date.getUTCMonth() + 1) + "/" + date.getUTCDate() + "/" + date.getUTCFullYear());

				registry.byId("toolbar").addChild(this.readingDropDownBtn, "first");
				// registry.byId("toolbar").addChild(this.readingBtnSmall, "first");

				this.rinkwatch.resizeButtons();

				// Create editDialog
				this.createReadingDialog(config.readingDialog[1]);

				on(this.readingBtn, "click", lang.hitch(this, this.selectNumberDialog));
				on(this.readingBtnSmall, "click", lang.hitch(this, this.selectNumberDialog));
				on(this.editReadingBtn, "click", lang.hitch(this, this.populateEditDialog));
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
							this.readingDialog = new Dialog({
								"title": i18n.toolbar.buttons.newReading,
								"id": "readingDialog"
							});
						}

						// Destroy all previous content of the readingDialog
						this.readingDialog.destroyDescendants();

						this.selectDialog.hide();

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

						var ocr = on(this.cancelReading, "click", lang.hitch(this, function() {
							ocr.remove();
							this.readingDialog.hide();
						}));
						var orh = on(this.readingDialog, "hide", lang.hitch(this, function() {
							orh.remove();
							this.saveReading.cancel();
						}));
						on(this.saveReading, "click", lang.hitch(this, this.checkReadingDates));

						// Create all readingPanes required for specified number of readings
						array.some(config.numberSelect, function(i) {
							if (i <= this.numberSelect.value) {

								new ContentPane({
									"id": "readingPane" + i,
									"class": "claro",
									"style": "padding-top: 0px; padding-bottom: 0px;"
								});

								// Determine how many days to subtract from date
								var daysBack = this.numberSelect.value - i;
								// readingCalendar DateTextBox
								domConstruct.create("label", {
									"for": "readingCalendar" + i,
									"innerHTML": i18n.reading.readingCalendar
								}, registry.byId("readingPane" + i).domNode);
								domConstruct.create("br", null, registry.byId("readingPane" + i).domNode);
								new DateTextBox({
									"id": "readingCalendar" + i,
									"required": false,
									"dayWidth": "abbr",
									"value": new Date(
										this.curDate.getUTCFullYear(),
										this.curDate.getUTCMonth(),
										(this.curDate.getUTCDate() - daysBack)
									),
									"constraints": {
										"max": this.curDate
									}
								});
								registry.byId("readingPane" + i).addChild(registry.byId("readingCalendar" + i));
								domConstruct.create("br", null, registry.byId("readingPane" + i).domNode);

								// skateStatus Select
								domConstruct.create("label", {
									"for": "skateStatus" + i,
									"innerHTML": i18n.reading.skateStatus
								}, registry.byId("readingPane" + i).domNode);
								domConstruct.create("br", null, registry.byId("readingPane" + i).domNode);
								new Select({
									"id": "skateStatus" + i,
									"forceWidth": true
								});
								registry.byId("readingPane" + i).addChild(registry.byId("skateStatus" + i));
								domConstruct.create("br", null, registry.byId("readingPane" + i).domNode);
								array.forEach(config.skateStatus, function(f) {
									registry.byId("skateStatus" + i).addOption({
										label: i18n.skateStatus[f.value],
										value: f.value
									});
								});

								// skateIndex Select
								domConstruct.create("label", {
									"for": "skateIndex" + i,
									"innerHTML": i18n.reading.skateIndex
								}, registry.byId("readingPane" + i).domNode);
								domConstruct.create("br", null, registry.byId("readingPane" + i).domNode);
								new Select({
									"id": "skateIndex" + i,
									"forceWidth": true
								});
								registry.byId("readingPane" + i).addChild(registry.byId("skateIndex" + i));
								domConstruct.create("br", null, registry.byId("readingPane" + i).domNode);
								array.forEach(config.skateIndex, function(f) {
									registry.byId("skateIndex" + i).addOption({
										label: i18n.skateIndex[f.value],
										value: f.value
									});
								});

								// readingDesc mTextArea
								domConstruct.create("label", {
									"for": "readingDesc" + i,
									"innerHTML": i18n.reading.readingDesc
								}, registry.byId("readingPane" + i).domNode);
								domConstruct.create("br", null, registry.byId("readingPane" + i).domNode);
								new mTextArea({
									"id": "readingDesc" + i,
									"maxlength": 80,
									"rows": 3,
									"cols": 27
								});
								registry.byId("readingPane" + i).addChild(registry.byId("readingDesc" + i));
								domConstruct.create("br", null, registry.byId("readingPane" + i).domNode);

								domConstruct.create("font", {
									"size": 1,
									"innerHTML": "(" + i18n.reading.maxChar + ": " + registry.byId("readingDesc" + i).maxlength + ")"
								}, registry.byId("readingPane" + i).domNode);
								domConstruct.create("br", null, registry.byId("readingPane" + i).domNode);
								domConstruct.create("HR", null, registry.byId("readingPane" + i).domNode);

								on(registry.byId("skateStatus" + i), "change", lang.hitch(this, function() {
									this.setSkateIndex(registry.byId("skateStatus" + i), registry.byId("skateIndex" + i));
								}));

								this.readingDialog.addChild(registry.byId("readingPane" + i));
							} else {
								return true;
							}

						}, this);

						this.readingDialog.addChild(this.readingButtons);
						this.readingDialog.startup();
						this.showReadingDialog();

					break;

					// Create dialog for editing reaadings (very similar)
					case "edit":

						if (!this.editDialog) {

							// Add editReadingBtn MenuItem to userLog Menu
							this.editReadingBtn = new MenuItem({
								"id": "editReadingBtn",
								"iconClass": "editIcon",
								"label": i18n.toolbar.userLog.editReading
							});
							// this.rinkwatch.userLog.addChild(this.editReadingBtn, "first");
							this.readingMenu.addChild(this.editReadingBtn);


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
								"innerHTML": "(" + i18n.reading.maxChar + ": " + this.editDesc.maxlength + ")"
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
					if (!registry.byId("noRinkDialog")) {
						this.createSimpleDialog("noRink", i18n.reading.noRinks, this.rinkwatch.rink.currentRink.name);
					}
					registry.byId("noRinkDialog").show();
				} else {
					this.readingDialog.show();
				}

			},

			clearReadingDialog: function() {

				this.readingDialog.reset();

				// this.skateStatus.set("value", "0");
				// this.skateIndex.set("value", "0");
				// this.skateIndex.set("disabled", true);
				// this.readingCalendar.set("value", this.curDate);
				// this.readingDesc.set("value", "");

			},

			populateEditDialog: function() {
				if (this.rinkwatch.rink.curRink.value === 0) {
					if (!registry.byId("noRinkDialog")) {
						this.createSimpleDialog("noRink", i18n.reading.noRinks, this.rinkwatch.rink.currentRink.name);
					}
					registry.byId("noRinkDialog").show();
				} else {
					// Remove all prior options before repopulating the reading select
					this.editSelect.removeOption(this.editSelect.getOptions());
					this.curOID = [];
					//alert(this.rinkwatch.rink.currentRink.id)
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
						if (!registry.byId("noReadingDialog")) {
							this.createSimpleDialog("noReading", i18n.reading.noReadings, this.rinkwatch.rink.currentRink.name);
						}
						registry.byId("noReadingDialog").show();
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
						// Need to check for 0 as well, as this represents barely skateable
						if (r.attributes.skateable || r.attributes.skateable === 0) {
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
					index.set("value", "null");
				}

			},

			saveNewReading: function() {

				this.cancelReading.setDisabled(true);
				this.saveReading.makeReallyBusy();

				var readings = [];
				var reading;

				array.some(config.numberSelect, function(i) {
					// Create array of readings to add to readings_sde table
					if (i <= this.numberSelect.value) {
						var status = Number(registry.byId("skateStatus" + i).value);
						var index;
						if (!registry.byId("skateIndex" + i).disabled) {
							if (registry.byId("skateIndex" + i).value === "null") {
								index = null;
							} else {
								index = Number(registry.byId("skateIndex" + i).value);
							}
						} else {
							index = null;
						}
						var desc;
						if (registry.byId("readingDesc" + i).value && registry.byId("readingDesc" + i).value.length > 0) {
							desc = registry.byId("readingDesc" + i).value;
						} else {
							desc = "";
						}
						var date = (registry.byId("readingCalendar" + i).value.getUTCMonth() + 1) + "/" + registry.byId("readingCalendar" + i).value.getUTCDate() + "/" + registry.byId("readingCalendar" + i).value.getUTCFullYear() + " 05:00:00";
						var reading = {
							"attributes": {
								"reading_rink_id": this.rinkwatch.rink.currentRink.id,
								"reading_data": status,
								"reading_time": date,
								"skateable": index,
								"reading_text": desc,
								"flag":0
							}
						};
						readings.push(reading);
					} else {
						return true;
					}
				}, this);

				// Sort array so that values are entered in order
				readings.sort(function(a,b) {
					a = new Date(a.attributes.reading_time);
					b = new Date(b.attributes.reading_time);
					return a<b?-1:a>b?1:0;
				});

				this.rinkwatch.readingsTable.applyEdits(readings, null, null, lang.hitch(this, function(r) {
					// Add objectid to reading before saving
					array.forEach(readings, function(reading, i) {
						reading.attributes.objectid = r[i].objectId;
						// add to readingArray so that when editing readings from current session, no problems persist
						if (this.rinkwatch.readingArray[this.rinkwatch.rink.currentRink.id]) {
							this.rinkwatch.readingArray[this.rinkwatch.rink.currentRink.id].unshift(reading);
						} else {
							// if rink was created during the current session, no entry will be made in the reading array - create new element in array for rink with reading data
							this.rinkwatch.readingArray[this.rinkwatch.rink.currentRink.id] = [reading];
						}
					}, this);
					// Sort array once new readings have been entered
					this.rinkwatch.readingArray[this.rinkwatch.rink.currentRink.id].sort(function(a, b) {
						a = new Date(a.attributes.reading_time);
						b = new Date(b.attributes.reading_time);
						return b-a;
					});
					this.applyReadings();
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
						"reading_text": desc,
						"flag":0
					}
				};
				this.rinkwatch.readingsTable.applyEdits(null, [reading], null, lang.hitch(this, function() {
					// add to readingArray so that when editing readings from current session, no problems persist
					this.replaceReading(reading);
					this.applyEditedReading();
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

			applyReadings: function() {

				this.selectDialog.reset();
				this.rinkwatch.rink.getReadings();
				this.readingDialog.hide();
				this.saveReading.cancel();
				this.cancelReading.setDisabled(false);
				this.rinkwatch.filter.setRinkDisplay();
				this.readingFlag = true;
				this.rinkwatch.chart.getChartReadings();
				if (!registry.byId("submittedDialog")) {
					this.createSimpleDialog("submitted", i18n.reading.readingSaved, this.rinkwatch.rink.currentRink.name);
				}
				registry.byId("submittedDialog").show();

			},

			applyEditedReading: function() {

				this.rinkwatch.rink.getReadings();
				this.editDialog.hide();
				this.saveEdits.cancel();
				this.cancelEdits.setDisabled(false);
				this.rinkwatch.filter.setRinkDisplay();
				this.readingFlag = true;
				this.rinkwatch.chart.getChartReadings();
				if (!registry.byId("updatedDialog")) {
					this.createSimpleDialog("updated", i18n.reading.readingUpdated, this.rinkwatch.rink.currentRink.name);
				}
				registry.byId("updatedDialog").show();

			},

			selectNumberDialog: function() {

				if (!this.selectDialog) {
					this.selectDialog = new Dialog({
						"title": i18n.toolbar.buttons.newReading,
						"id": "selectDialog"
					});

					this.selectPane = new ContentPane({
						"id": "selectPane",
						"class": "claro"
					});

					// numberSelect Select
					domConstruct.create("label", {
						"for": "numberSelect",
						"innerHTML": i18n.reading.numberSelect
					}, this.selectPane.domNode);
					domConstruct.create("br", null, this.selectPane.domNode);
					domConstruct.create("br", null, this.selectPane.domNode);
					this.numberSelect = new Select({
						"id": "numberSelect"
					});
					this.selectPane.addChild(this.numberSelect);
					domConstruct.create("br", null, this.selectPane.domNode);
					array.forEach(config.numberSelect, function(i) {
						this.numberSelect.addOption({
							label: i,
							value: Number(i)
						});
					}, this);

					domConstruct.create("br", null, this.selectPane.domNode);
					domConstruct.create("label", {
						"for": "lastSelect",
						"innerHTML": i18n.rink.pane.stats.lastReading
					}, this.selectPane.domNode);
					this.lastSelect = domConstruct.create("span", {
						"id": "lastSelect"
					}, this.selectPane.domNode);
					domConstruct.create("br", null, this.selectPane.domNode);
					domConstruct.create("br", null, this.selectPane.domNode);

					this.selectButtons = new ContentPane({
						"id": "selectButtons",
						"class": "claro"
					});

					// selectOK BusyButton
					this.selectOK = new Button({
						"id": "selectOK",
						"label": i18n.register.verify.validBtn
					});
					this.selectButtons.addChild(this.selectOK);


					// selectCancel Button
					this.selectCancel = new Button({
						"id": "selectCancel",
						"label": i18n.reading.cancelReading
					});
					this.selectButtons.addChild(this.selectCancel);

					this.selectDialog.addChild(this.selectPane);
					this.selectDialog.addChild(this.selectButtons);
					this.selectDialog.startup();

					on(this.selectOK, "click", lang.hitch(this, function() {
						this.createReadingDialog(config.readingDialog[0]);
					}));
					on(this.selectCancel, "click", lang.hitch(this, function() {
						this.selectDialog.hide();
					}));

				}
				this.lastSelect.innerHTML = this.rinkwatch.rink.lastReading.innerHTML;
				this.selectDialog.reset();
				this.selectDialog.show();

			},

			checkReadingDates: function() {

				// Start query string
				var dateWhere = "(reading_time = timestamp '";
				var allDates = [];
				var dupes = [];
				var date1;
				var date2;
				array.some(config.numberSelect, function(i) {
					if (i <= this.numberSelect.value) {
						// Need to include two dates (for different time zones that may have been mistakenly stored)
						date1 = (registry.byId("readingCalendar" + i).value.getUTCMonth() + 1) + "/" + registry.byId("readingCalendar" + i).value.getUTCDate() + "/" + registry.byId("readingCalendar" + i).value.getUTCFullYear();
						date2 = (registry.byId("readingCalendar" + i).value.getUTCMonth() + 1) + "/" + registry.byId("readingCalendar" + i).value.getUTCDate() + "/" + registry.byId("readingCalendar" + i).value.getUTCFullYear() + " 05:00:00";
						allDates.push(date1);
						dateWhere += date1 + "' OR reading_time = timestamp '" + date2 + "' OR reading_time = timestamp '";
					} else {
						return true;
					}
				}, this);
				dateWhere += "0000/01/01')";

				// Check that there are no duplicate readings in the readings prompt
				array.forEach(allDates, function(item, i) {
					if((allDates.lastIndexOf(item) != i) && (dupes.indexOf(item) == -1)) {
						dupes.push(item);
					}
				});
				if (dupes.length > 0) {
					if (!registry.byId("dupeDialog")) {
						this.createSimpleDialog("dupe", i18n.reading.sameDates, this.rinkwatch.rink.currentRink.name);
					}
					registry.byId("dupeDialog").show();
				} else {
					var queryRoot = this.rinkwatch.root+config.tables.url+"/";

					var checkQueryTask = new QueryTask(queryRoot+config.tables.layers.reading);

					var checkQuery = new Query();
					checkQuery.where = "reading_rink_id = " + this.rinkwatch.rink.currentRink.id + " AND " + dateWhere;
					checkQuery.outFields = ["*"];
					checkQueryTask.execute(checkQuery, lang.hitch(this, function(fs) {
						if (fs.features && fs.features.length > 0) {
							var duplicates = i18n.reading.existingReading1 + "<br />";
							var date;
							var features = fs.features.sort(function(a,b) {
								a = a.attributes.reading_time;
								b = b.attributes.reading_time;
								return a-b;
							});
							array.forEach(features, function(f) {
								date = new Date(f.attributes.reading_time);
								date = (date.getUTCMonth() + 1) + "/" + date.getUTCDate() + "/" + date.getUTCFullYear();
								duplicates += "<br />" + date;
							});
							duplicates += "<br /><br />" + i18n.reading.existingReading2;

							if (!registry.byId("checkDialog")) {
								this.createSimpleDialog("check", duplicates, this.rinkwatch.rink.currentRink.name);
							} else {
								registry.byId("checkPane").set("content", duplicates);
							}
							registry.byId("checkDialog").show();
						} else {
							// Add new readings to table
							this.saveNewReading();
						}
					}));
				}

			},

			createSimpleDialog: function(name, content, title) {

				new Dialog({
					"id": name + "Dialog",
					"title": title
				});

				new ContentPane({
					"id": name + "Pane",
					"class": "simplePane",
					"content": content
				});

				new ContentPane({
					"id": name + "Buttons",
					"class": "buttons"
				});

				new Button({
					"id": name + "OK",
					"label": i18n.register.verify.validBtn //OK
				});

				domStyle.set(registry.byId(name + "OK").domNode, "width", "60px");
				domStyle.set(registry.byId(name + "OK").domNode.firstChild, "display", "block");
				registry.byId(name + "Buttons").addChild(registry.byId(name + "OK"));
				registry.byId(name + "Dialog").addChild(registry.byId(name + "Pane"));
				registry.byId(name + "Dialog").addChild(registry.byId(name + "Buttons"));

				on(registry.byId(name + "OK"), "click", function() {
					registry.byId(name + "Dialog").hide();
				});
				registry.byId(name + "Dialog").startup();

			}

		});

	}

);
