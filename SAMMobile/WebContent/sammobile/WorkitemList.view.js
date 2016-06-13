sap.ui.jsview("sammobile.WorkitemList", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf sammobile.WorkitemList
	*/ 
	getControllerName : function() {
		return "sammobile.WorkitemList";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf sammobile.WorkitemList
	*/ 
	createContent : function(oController) {

		return new sap.m.Page({
			id : "WorkitemListPage",
			title : "SAM Mobile: Feedback",
			navButtonType : sap.m.ButtonType.Back,
			showNavButton : true,
			navButtonType : sap.m.ButtonType.Back,
			navButtonTap : function(){
				var bus = sap.ui.getCore().getEventBus();
				bus.publish("nav", "back"); 
			},
			content: oController.createWorkitemList()
		});

	}

});