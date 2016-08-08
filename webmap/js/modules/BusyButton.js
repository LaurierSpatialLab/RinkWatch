define(
	[

		"dojo/_base/declare",

		"dojox/form/BusyButton"

	], function(

		declare,

		dojoBusyButton

	) {

	return declare("modules/BusyButton", [dojoBusyButton], {

		makeReallyBusy: function() {
			// sets state from idle to busy
			this.isBusy = true;
			this.set("disabled", true);
			this.setLabel(this.busyLabel, this.timeout);
		},

		// Redefining this. It will NOT call inherited() and it will do NOTHING.
		makeBusy: function() {
		}

	});

	}
);