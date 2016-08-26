sap.ui.controller("sammobile.Home", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf sammobile.HomeTiles
*/
//	onInit: function() {
//
//	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf sammobile.HomeTiles
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf sammobile.HomeTiles
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf sammobile.HomeTiles
*/
//	onExit: function() {
//
//	}

	//Do navigate to Calendar view
	doNavigateToTimelog : function(){
		
		//initialize SAM Model if required, involves logon to backend
		sap.ui.controller("sammobile.App").initSAMModel();
		
		//Navigate to target view Calendar
		var bus = sap.ui.getCore().getEventBus();
		bus.publish("nav", "to", {
			id : "Calendar",
			data : { context :  "None" }
		});		
		
	},
	
	//Do navigate to workitem list view
	doNavigateToFeedback : function(){
		
		//initialize SAM Model if required, involves logon to backend
		sap.ui.controller("sammobile.App").initSAMModel();
		
		//Navigate to target view WorkitemList
		var bus = sap.ui.getCore().getEventBus();
		bus.publish("nav", "to", {
			id : "WorkitemList",
			data : { context :  "None" }
		});		
		
	}	
	
});