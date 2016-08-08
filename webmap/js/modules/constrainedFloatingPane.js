define(
	[

		"dojo/_base/declare",
		"dojo/dnd/move",

		"dojox/layout/FloatingPane"

	], function(

		declare,
		move,

		FloatingPane

	) {

		return declare("modules/constrainedFloatingPane", [FloatingPane], {

			postCreate: function() {

				this.inherited(arguments);
				this.moveable = new move.parentConstrainedMoveable(this.domNode, {
					handle: this.focusNode,
					area: "content",
					within: true
				});

			}

		});

	}
);