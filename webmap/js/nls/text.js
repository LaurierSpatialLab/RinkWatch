define({

	"root": ({

		"language": "English",

		"title": "RinkWatch",

		"signIn": {
			"idManager": "Please sign in to RinkWatch."
		},

		"legend": {
			"title": "Rink Data",
			"layers": {
				"0": "All Rinks",
				"1": "Skateable Rinks",
				"2": "Not Skateable Rinks",
				"3": "My Rink"
			}
		},

		"mouseOver": " Rink(s)",
		"status": "Loading...",

		"menu": {
			"title": "RinkWatch Menu",
			"legend": "Legend"
		},
		"toolbar": {
			"buttons": {
				"userTools": "Tools",
				"newReading": "New Skating Info",
				"menuBtn": "&#9776; Menu",
				"menuBtnSmall": "&#9776;",
				"menuBtnTitle": "Show/Hide Menu",
				"extentBtn": "Previous Zoom",
				"extentBtnTitle": "Revert to Previous Zoom",
				"basemapBtn": " Basemap",
				"basemapBtnTitle": "Basemap",
				"switchLocale": "Français",
				"readingDropDown": "Skating Info"
			},
			"userLog": {
				"signIn": "Sign in",
				"signOut": "Sign out",
				"register": "Register",
				"editReading": "Edit Skating Info",
				"downloadData": "Download My Rink Data"
			},
			"geocoder": {
				"placeholder": "Search location/address",
				"template": "Search Results"
			}
		},

		"chart": {
			"noData": "No Data"
		},

		"reading": {
			"skateStatus": "Skateable? ",
			"skateIndex": "Rate Your Ice: ",
			"maxChar": "Maximum Characters",
			"readingDesc": "Description (Optional): ",
			"readingCalendar": "Date: ",
			"addPhoto": "Add a Photo: ",
			"saveReading": "Save",
			"saveReadingBusy": "Saving info...",
			"saveEdits": "Update",
			"saveEditsBusy": "Updating info...",
			"cancelReading": "Cancel",
			"editSelect": "Select Reading:",
			"noReadings": "You have not yet recorded any skating info for this rink. Click the 'New Skating Info' button in the toolbar to record info on how skateable your rink is.",
			"noRinks": "You have not yet added any rinks to the map. Click the 'Add A New Rink' button from the 'My Rinks' section of the menu to get started!",
			"existingReading1": "You have already recorded skating info for the following dates:",
			"existingReading2": "If you wish to change this skating info, select 'Edit Skating Info' in the user drop down menu.",
			"sameDates": "You can only record one skating reading per day. Please adjust your skating info so that there is only one reading per day.",
			"numberSelect": "How many days you would like to enter skating info for?",
			"readingSaved": "Skating info submitted.",
			"readingUpdated": "Skating info updated."
		},

		"filter": {
			"viewRinksLabel": "View Rinks:",
			"viewRinks": {
				"0": "All Rinks",
				"1": "Skateable/Not Skateable"
			},
			"skateableFilter": "Skateable Rinks  ",
			"notSkateableFilter": "Not Skateable Rinks  ",
			"noReadingFilter": "All Rinks  ",
			"timeFilter": "Use Time Frame ",
			"startDateBox": "Most Recent Readings From",
			"endDateBox": "To "
		},

		"skateStatus": {
			"0": "Not Skateable",
			"1": "Skateable"
		},

		"skateIndex": {
			"null": "-- Ice Quality --",
			"0": "Barely skateable.",
			"1": "Just OK. We could skate all day, but the ice wasn’t very hard, or was very rough.",
			"2": "Good. A typical mid-winter skating day.",
			"3": "Very good. One of the better days we’ve had this winter!",
			"4": "Fantastic! The ice could not have been better!"
		},

		"register": {
			"dialog": {
				"title" : "Register as a RinkWatch User",
				"description": "Please provide the following info to register a new RinkWatch account. With this account, you will be able to log skateability info about your rink, and view it using RinkWatch.",
				"userName": {
					"label": "User Name:",
					"placeHolder": "Your User Name",
					"invalidMessage": "This is not a valid username."
				},
				"password": {
					"label": "Password:",
					"placeHolder": "Your Password",
					"invalidMessage": "This is not a valid password."
				},
				"confirm": {
					"label": "Confirm Password:",
					"placeHolder": "Confirm Password",
					"invalidMessage": "This does not match your password."
				},
				"name": {
					"label": "Full Name:",
					"placeHolder": "Your Full Name",
					"invalidMessage": "This is not a valid name."
				},
				"email": {
					"label": "Email:",
					"placeHolder": "Your Email Address",
					"invalidMessage": "This is not a valid email address."
				},
				"busy": {
					"label": "Submit",
					"busyLabel": "Submitting data..."
				},
				"cancel": {
					"label": "Cancel"
				}
			},
			"invalid": {
				"title": "Please Complete the Form!",
				"content": "The following fields are not valid:",
				"userName": "User Name",
				"password": "Password",
				"fullName": "Full Name",
				"email": "Email"
			},
			"verify": {
				"dialog": {
					"title": "Verify Your RinkWatch Account",
					"desc": "A verification code has been sent to the email address you provided for your RinkWatch account registration. Please open the email and enter the verification code into the box below:",
					"code": "Verification Code:",
					"verifyBtn": {
						"label": "Verify",
						"busy": "Verifying Account..."
					}
				},
				"titleCode": "Invalid Verification Code!",
				"contentCode": "The verification code you provided was incorrect. Please re-enter the verification code which was sent to your email address.",
				"titleName": "User Name Already Taken!",
				"contentName": "The user name you have requested has already been taken. Please restart the registration process with a new user name.",
				"validBtn": "OK"
			}
		},

		"visual": {
			"title": "Visual Effects",
			"heatmap": {
				"label": "Coldmap",
				"on": "Turn Coldmap On",
				"off": "Turn Coldmap Off",
				"title": "Rink Skateability",
				"heatLocal": "Only Use Data on Screen "
			},
			"clustering": {
				"label": "Clustering",
				"off": "Turn Clustering Off",
				"on": "Turn Clustering On",
				"legend": {
					"title": "Rink Clusters",
					"0": " 1 - 9 Rinks",
					"1": " 10 - 24 Rinks",
					"2": " 25 - 50 Rinks",
					"3": " More than 50 Rinks"
				}
			}
		},

		"popup": {
			"title": " Rink Info",
			"name": "Name: ",
			"description": "Rink Description:",
			"lastReading": "Last Reading: ",
			"photo": "Photo: "
		},
		"rink": {
			"dialog": {
				"title": "New Rink Info",
				"edittitle": "Edit Rink Info",
				"deletetitle": "Delete",
				"areyousure": "Are you sure you want to delete your rink?",
				"norinksmessage": "You currently have no rinks.",
				"confirmDelete": "Your data has been deleted.  You may have to refresh your page for the page to update.",
				"rinkName": "Name Your Rink:",
				"rinkDesc": "Give A Brief Description Of Your Rink:",
				"rinkPhoto": "Add a Photo: ",
				"rinkEditPhoto": "Add a new photo: ",
				"errorName": "Please specify a name to identify your rink.",
				"errorRename": "There is already a rink saved with that name. Please rename your rink.",
				"refreshMsg": "Please refresh your page to see your new rink!",
				"rinkCreate": {
					"label": "Create",
					"busyLabel": "Creating Rink..."
				},
				"rinkEdit": {
					"label": "Edit",
					"busyLabel": "Editing Rink..."
				},
				"rinkDelete": {
					"label": "Delete",
					"busyLabel": "Deleting Rink..."
				},
				"rinkCancel": {
					"label": "Cancel"
				}
			},
			"pane": {
				"title": "My Rinks",
				"curRink": "Current Rink:",
				"zoomToRink": "Zoom To Rink",
				"noRinks": "-- No Rinks --",
				"addRink": "Add a New Rink",
				"editRink": "Edit Your Rink",
				"deleteRink": "Delete Your Rink",
				"stats": {
					"title": "Rink Stats",
					"readings": "Number of Readings: ",
					"skateable": "% Skateable: ",
					"lastReading": "Last Reading: ",
					"na": "N/A"
				}
			},
			"confirm": {
				"0": "No",
				"1": "Yes",
				"title": "Confirm New Rink",
				"content": "Are you sure you wish to add a new rink to your account?"
			}
		}

	}),

	"fr": true

});
