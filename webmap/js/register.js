define(
	[

		"dojo/dom-construct",
		"dojo/dom-attr",
		"dojo/keys",
		"dojo/on",
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/i18n!./nls/text",

		"dijit/Dialog",
		"dijit/registry",
		"dijit/form/Button",
		"dijit/form/Form",
		"dijit/form/ValidationTextBox",
		"dijit/layout/ContentPane",

		"dojox/mobile/TextBox",

		"esri/request",
		"esri/tasks/Geoprocessor",
		"esri/tasks/query",
		"esri/tasks/QueryTask",

		"./config",
		"./URL",

		"modules/BusyButton"

	], function(

		domConstruct,
		domAttr,
		keys,
		on,
		declare,
		lang,
		i18n,

		Dialog,
		registry,
		Button,
		Form,
		ValidationTextBox,
		ContentPane,

		mTextBox,

		esriRequest,
		Geoprocessor,
		Query,
		QueryTask,

		config,
		URL,

		BusyButton

	) {

		return declare(null, {

			constructor: function(rinkwatch) {

				this.rinkwatch = rinkwatch;

				// Create the register dialog
				if (!this.registerDialog) {
					this.createRegisterDialog();
				}

				this.registerBtn = registry.byId("registerBtn");
				on(this.registerBtn, "click", lang.hitch(this, this.showRegisterDialog));

				on(this.registerEmail, "keydown", lang.hitch(this, function(e) {
					if (e.keyCode === keys.ENTER) {
						this.registerUser();
					}
				}));
				on(this.registerSubmit, "click", lang.hitch(this, this.registerUser));
				on(this.registerCancel, "click", lang.hitch(this, function() {
					this.registerSubmit.cancel();
					this.registerDialog.hide();
				}));

			},

			/**
			 * Creates registration form and dialog for a new RinkWatch account
			 *
			 * @this {rinkwatch.register}
			 *
			 */
			createRegisterDialog: function() {

				this.registerDialog = new Dialog({
					"content": this.registerForm,
					"top": "auto",
					"left": "auto",
					"modal": true,
					"title": i18n.register.dialog.title
				});

				this.registerForm = new Form({
					"id": "registerForm",
					"encType": "multipart/form-data"
				});
				this.registerDialog.addChild(this.registerForm);

				// registerPane ContentPane
				this.registerPane = new ContentPane({
					"id": "registerPane",
					"class": "claro"
				});

				// registerPane Description
				domConstruct.create("span", {
					"innerHTML": i18n.register.dialog.description
					}, this.registerPane.domNode);
				domConstruct.create("br", null, this.registerPane.domNode);
				domConstruct.create("br", null, this.registerPane.domNode);

				// registerUsername
				domConstruct.create("label", {
					"for": "registerUserName",
					"innerHTML": i18n.register.dialog.userName.label
				}, this.registerPane.domNode);
				domConstruct.create("br", null, this.registerPane.domNode);
				this.registerUserName = new ValidationTextBox({
					"id": "registerUserName",
					"placeHolder": i18n.register.dialog.userName.placeHolder,
					"regExp": "\\S*",
					"required": true,
					"invalidMessage": i18n.register.dialog.userName.invalidMessage
				});
				this.registerPane.addChild(this.registerUserName);
				domConstruct.create("br", null, this.registerPane.domNode);

				// registerPassword
				domConstruct.create("label", {
					"for": "registerPassword",
					"innerHTML": i18n.register.dialog.password.label
				}, this.registerPane.domNode);
				domConstruct.create("br", null, this.registerPane.domNode);
				this.registerPassword = new ValidationTextBox({
					"id": "registerPassword",
					"placeHolder": i18n.register.dialog.password.placeHolder,
					"type": "password",
					"regExp": "\\S*",
					"required": true,
					"invalidMessage": i18n.register.dialog.password.invalidMessage
				});
				this.registerPane.addChild(this.registerPassword);
				domConstruct.create("br", null, this.registerPane.domNode);

				// confirmPassword
				domConstruct.create("label", {
					"for": "confirmPassword",
					"innerHTML": i18n.register.dialog.confirm.label
				}, this.registerPane.domNode);
				domConstruct.create("br", null, this.registerPane.domNode);
				this.confirmPassword = new ValidationTextBox({
					"id": "confirmPassword",
					"placeHolder": i18n.register.dialog.confirm.placeHolder,
					"type": "password",
					"regExp": "\\S*",
					"required": true,
					"intermediateChanges": false,
					"constraints": {
						"other": "registerPassword"
					},
					"validator": this.passwordConfirm,
					"invalidMessage": i18n.register.dialog.confirm.invalidMessage
				});
				this.registerPane.addChild(this.confirmPassword);
				domConstruct.create("br", null, this.registerPane.domNode);

				// registerName
				domConstruct.create("label", {
					"for": "registerName",
					"innerHTML": i18n.register.dialog.name.label
				}, this.registerPane.domNode);
				domConstruct.create("br", null, this.registerPane.domNode);
				this.registerName = new ValidationTextBox({
					"id": "registerName",
					"placeHolder": i18n.register.dialog.name.placeHolder,
					"regExp": "[A-z\\s]*",
					"required": true,
					"invalidMessage": i18n.register.dialog.name.invalidMessage
				});
				this.registerPane.addChild(this.registerName);
				domConstruct.create("br", null, this.registerPane.domNode);

				domConstruct.create("label", {
					"for": "registerEmail",
					"innerHTML": i18n.register.dialog.email.label
				}, this.registerPane.domNode);
				domConstruct.create("br", null, this.registerPane.domNode);
				this.registerEmail = new ValidationTextBox({
					"id": "registerEmail",
					"placeHolder": i18n.register.dialog.email.placeHolder,
					"regExp": "[A-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[A-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?",
					"required": true,
					"invalidMessage": i18n.register.dialog.email.invalidMessage
				});
				this.registerPane.addChild(this.registerEmail);
				domConstruct.create("br", null, this.registerPane.domNode);
				domConstruct.create("br", null, this.registerPane.domNode);
				this.registerPane.placeAt(this.registerForm.containerNode, "first");

				// registerButtons ContentPane
				this.registerButtons = new ContentPane({
					"id": "registerButtons",
					"class": "claro"
				});

				// registerSubmit BusyButton
				this.registerSubmit = new BusyButton({
					"id": "registerSubmit",
					"label": i18n.register.dialog.busy.label,
					"busyLabel": i18n.register.dialog.busy.label.busyLabel
				});
				this.registerButtons.addChild(this.registerSubmit);

				// registerCancel Button
				this.registerCancel = new Button ({
					"id": "registerCancel",
					"label": i18n.register.dialog.cancel.label
				});
				this.registerButtons.addChild(this.registerCancel);

				this.registerButtons.placeAt(this.registerForm.containerNode);
				this.registerDialog.addChild(this.registerForm);

			},

			/**
			 * Initialize registration form and dialog for a new RinkWatch account
			 *
			 * @this {rinkwatch.register}
			 *
			 */
			showRegisterDialog: function() {

				this.resetRegisterForm();
				this.registerForm.startup();
				this.registerDialog.show();

			},

			/**
			 * Clear all fields in the registration form
			 *
			 * @this {rinkwatch.register}
			 *
			 */
			resetRegisterForm: function() {

				this.registerUserName.reset();
				this.registerPassword.reset();
				this.confirmPassword.reset();
				this.registerName.reset();
				this.registerEmail.reset();

			},

			/**
			 * Confirm Passwords are the same in register form
			 *
			 * @this {rinkwatch.register}
			 *
			 * @param {string} value - the password to be checked
			 * @param {object} constraints - the constraints of the ValidationTextBox object
			 *
			 */
			passwordConfirm: function(value, constraints) {

				var isValid = false;

				if(constraints && constraints.other) {
					var otherInput =  registry.byId(constraints.other);
					if(otherInput) {
						var otherValue = otherInput.value;
						isValid = (value == otherValue);
					}
				}
				return isValid;

			},

			/**
			 * Check that all forms are validly filled out
			 *
			 * @this {rinkwatch.register}
			 *
			 */
			formIsValid: function() {

					if(this.registerUserName.isValid() && this.registerPassword.isValid() && this.confirmPassword.isValid() && this.registerName.isValid() && this.registerEmail.isValid()) {
						return true;
					} else {
						return false;
					}

			},

			/**
			 * Submit registration form to server
			 *
			 * @this {rinkwatch.register}
			 *
			 */
			registerUser: function() {

				if(this.formIsValid()) {

					this.registerSubmit.makeReallyBusy();

					var fullName = this.registerName.value;
					var userName = this.registerUserName.value;
					var email = this.registerEmail.value;
					var password = this.registerPassword.value;

					var queryObject = {
						"fullname": fullName,
						"username": userName,
						"email": email,
						"password": password
					};

					var gp = new Geoprocessor(URL.toFullURL(config.createUserGP));
					gp.execute(queryObject);

					on(gp, "execute-complete", lang.hitch(this, function (results, messages) {
						this.registerSubmit.cancel();
						if (results.results[0].value == "success") {
							console.log("success");
							this.showVerifyDialog();
						} else {
							console.log("error");
						}
					}));

					on(gp, "error", function() {
						console.log("error");
					});

				} else {
					if (!this.validCheck) {
						this.createValidDialog();
					}
					var title = i18n.register.invalid.title;
					var content = "<h4>" + i18n.register.invalid.content + "</h4>" + "<ol>";

					if(!this.registerUserName.isValid()) {
						content += "<li>" + i18n.register.invalid.userName + "</li>";
					}

					if(!this.registerPassword.isValid() || !this.confirmPassword.isValid()) {
						content += "<li>" + i18n.register.invalid.password + "</li>";
					}

					if(!this.registerName.isValid()) {
						content += "<li>" + i18n.register.invalid.fullName + "</li>";
					}

					if(!this.registerEmail.isValid()) {
						content += "<li>" + i18n.register.invalid.email + "</li>";
					}
					content += "</ol>";

					domAttr.set(this.validCheck, "title", title);
					domAttr.set(this.validPane, "content", content);
					this.validCheck.show();

				}

			},

			/**
			 * Display the verify user dialog
			 *
			 * @this {rinkwatch.register}
			 *
			 */
			showVerifyDialog: function() {

				if (!this.verifyDialog) {
					this.createVerifyDialog();
				}

				this.registerDialog.hide();
				this.verifyDialog.show();

			},

			/**
			 * Create the verify user dialog
			 *
			 * @this {rinkwatch.register}
			 *
			 */
			createVerifyDialog: function() {

				// verifyDialog Dialog
				this.verifyDialog = new Dialog({
					"id": "verifyDialog",
					"top": "auto",
					"left": "auto",
					"title": i18n.register.verify.dialog.title
				});

				// verifyPane ContentPane
				this.verifyPane = new ContentPane({
					"id": "verifyPane",
					"class": "claro",
					"hidden": "true"
				});

				// dialog description
				domConstruct.create("span", {
					"innerHTML": i18n.register.verify.dialog.desc
				}, this.verifyPane.domNode);
				domConstruct.create("br", null, this.verifyPane.domNode);
				domConstruct.create("br", null, this.verifyPane.domNode);

				// verifyToken mTextBox
				domConstruct.create("label", {
					"for": "verifyToken",
					"innerHTML": i18n.register.verify.dialog.code
				}, this.verifyPane.domNode);
				domConstruct.create("br", null, this.verifyPane.domNode);
				this.verifyToken = new mTextBox({
					"id": "verifyToken"
				});
				this.verifyPane.addChild(this.verifyToken);
				domConstruct.create("br", null, this.verifyPane.domNode);

				// verifyButtons ContentPane
				this.verifyButtons = new ContentPane({
					"id": "verifyButtons",
					"class": "claro",
					"hidden": "true"
				});

				// verifyBtn BusyButton
				this.verifyBtn = new BusyButton({
					"id": "verifyBtn",
					"label": i18n.register.verify.dialog.verifyBtn.label,
					"busyLabel": i18n.register.verify.dialog.verifyBtn.busy
				});
				this.verifyButtons.addChild(this.verifyBtn);

				this.verifyDialog.addChild(this.verifyPane);
				this.verifyDialog.addChild(this.verifyButtons);

				on(this.verifyToken, "keydown", lang.hitch(this, function(e) {
					if (e.keyCode === keys.ENTER) {
						this.verifyUser();
					}
				}));

				on(this.verifyBtn, "click", lang.hitch(this, this.verifyUser));

			},

			/**
			 * Verify the new RinkWatch account
			 *
			 * @this {rinkwatch.register}
			 *
			 */
			verifyUser: function() {

				this.verifyBtn.makeReallyBusy();

				var userName = this.registerUserName.value;
				var password = this.registerPassword.value;
				var token = this.verifyToken.value;

				var queryObject = {
					"username": userName,
					"password": password,
					"verification": token
				};

				var gp = new Geoprocessor(URL.toFullURL(config.verifyUserGP));
				gp.execute(queryObject);

				on(gp, "execute-complete", lang.hitch(this, function (results) {
					console.log(results);
					this.checkVerifyStatus(results);
				}));

			},

			/**
			 * Check the status of the verification of registration
			 *
			 * @this {rinkwatch.register}
			 *
			 * @param {object} results - the returned results from the Verify geoprocessing service
			 *
			 */
			checkVerifyStatus: function(results) {

				var title;
				var content;
				var temp;
				if (results.results[0].value == "success") {
					this.verifyBtn.cancel();
					this.verifyDialog.hide();
					// Add the user to the usersTable
					// this.addUserToTable();
					// Sign the user in with their new account
					this.signIn();

				// Check if the user name is already taken, or if the an invalid verification token is provided
				} else {
					if (!this.validCheck) {
						this.createValidDialog();
					}
					if (results.results[0].value == "invalidtoken") {
						title = i18n.register.verify.titleCode;
						content = i18n.register.verify.contentCode + "<br />";

						domAttr.set(this.validCheck, "title", title);
						domAttr.set(this.validPane, "content", content);
						this.verifyBtn.cancel();
						this.verifyToken.focus();
						this.validCheck.show();

						temp = on(this.validCheck, "hide", lang.hitch(this, function() {
							temp.remove();
							this.verifyToken.reset();
							this.verifyToken.focus();
						}));
					} else {
						title = i18n.register.verify.titleName;
						content = i18n.register.verify.contentName + "<br />";

						domAttr.set(this.validCheck, "title", title);
						domAttr.set(this.validPane, "content", content);
						this.verifyBtn.cancel();
						this.validCheck.show();

						temp = on(this.validCheck, "hide", lang.hitch(this, function() {
							temp.remove();
							this.verifyToken.reset();
							this.verifyDialog.hide();
						}));
					}
				}

			},

			/**
			 * Create the validCheck dialog
			 *
			 * @this {rinkwatch.register}
			 *
			 */
			createValidDialog: function() {

				this.validCheck = new Dialog({
					"id": "validCheck",
					"top": "auto",
					"left": "auto"
				});

				this.validPane = new ContentPane({
					"id": "validPane",
					"class": "claro",
					"hidden": true
				});

				this.validButtons = new ContentPane({
					"id": "validButtons",
					"class": "claro",
					"hidden": true
				});

				this.validBtn = new Button({
					"id": "validBtn",
					"label": i18n.register.verify.validBtn
				});
				this.validButtons.addChild(this.validBtn);

				this.validCheck.addChild(this.validPane);
				this.validCheck.addChild(this.validButtons);

				on(this.validBtn, "click", lang.hitch(this, function() {
					this.validCheck.hide();
				}));

			},

			/**
			 * Sign a user in with their created account
			 *
			 * @this {rinkwatch.register}
			 *
			 */
			signIn: function() {

				var userName = this.registerUserName.value;
				var password = this.registerPassword.value;
				var client = config.client;
				var tokenUrl = config.tokenPath;

				this.tokenRequest = esriRequest({
					"url": this.rinkwatch.root+tokenUrl,
					"content": {
						"f": "json",
						"username": userName,
						"password": password,
						"client": client,
						"referer": this.rinkwatch.root,
						"expiration": config.tokenExpiration
					},
					"handleAs": "json"
				}, {
					"usePost": true
				});

				this.tokenRequest.then(lang.hitch(this, function(data) {
					this.token = data.token;
					this.expires = data.expires;

					var idObject = {
						"serverInfos": [{
							"server": this.rinkwatch.root,
							"tokenServiceUrl": this.rinkwatch.root + "/arcgis/tokens/",
							"adminTokenServiceUrl": this.rinkwatch.root + "/arcgis/admin/generateToken",
							"shortLivedTokenValidity": config.tokenExpiration,
							"currentVersion": 10.2,
							"hasServer": true
						}],
						"credentials": [{
							"userId": userName,
							"server": this.rinkwatch.root,
							"token": this.token,
							"expires": this.expires,
							"validity": config.tokenExpiration,
							"ssl": false,
							"creationTime": (new Date()).getTime(),
							"scope": "server",
							"resources": [this.rinkwatch.root + config.rinkwatchUrl]
						}]
					};

					// Log the user into their new account
					esri.id.initialize(idObject);
					this.rinkwatch.hasAccount = true;
					this.rinkwatch.setLayers();
					this.checkUserTable();
					// this.rinkwatch.modifyInterface();

				}));

			},

			addUserToTable: function() {

				var queryRoot = this.rinkwatch.root+config.tables.url+"/";

				var userQueryTask = new QueryTask(queryRoot+config.tables.layers.user);
				var userQuerySettings = config.defaultQuerySettings.user;

				var userQuery = new Query();
				userQuery.where = "1 = 1";
				userQuery.outFields = ["id"];
				userQuery.orderByFields = ["id DESC"];
				userQueryTask.execute(userQuery, lang.hitch(this, function(fs) {
					this.userId = fs.features[0].attributes.id;
					this.userId++;
				})).then(lang.hitch(this, function() {
					// var fullName = this.registerName.value;
					var userName = this.registerUserName.value;
					var email = this.registerEmail.value;
					// var password = this.registerPassword.value;
					var user = {
						"attributes": {
							"id": this.userId,
							"username": userName,
							"email": email
							// "date_joined": new Date(),
						}
					};
					this.rinkwatch.usersTable.applyEdits([user], null, null, lang.hitch(this, function() {
						// Sign the user in with their new account
						this.rinkwatch.modifyInterface();
					}));
				}));

			},

			checkUserTable: function() {

				var queryRoot = this.rinkwatch.root+config.tables.url+"/";

				var userQueryTask = new QueryTask(queryRoot+config.tables.layers.user);
				var userQuerySettings = config.defaultQuerySettings.user;

				var userName = this.registerUserName.value;
				var email = this.registerEmail.value;

				var userQuery = new Query();
				userQuery.where = "username = '" + userName + "'' OR email = '" + email + "'";
				userQuery.outFields = ["id"];
				userQuery.orderByFields = ["id DESC"];
				userQueryTask.execute(userQuery, lang.hitch(this, function(fs) {
					if (fs.features && fs.features.length > 0) {
						this.addUserToTable();
					} else {
						this.rinkwatch.modifyInterface();
					}
				}));

			}

		});
	}
);