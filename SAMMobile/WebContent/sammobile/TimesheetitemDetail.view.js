sap.ui.jsview("sammobile.TimesheetitemDetail", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf sammobile.TimesheetitemDetail
	*/ 
	getControllerName : function() {
		return "sammobile.TimesheetitemDetail";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf sammobile.TimesheetitemDetail
	*/ 
	createContent : function(oController) {
		
		return oController.createTimesheetitemDetailContent();

	},
	
	//Target hook for event based navigation
	onBeforeShow : function(oEvent) {
		
		//call onBeforeShow method in related controller
		this.getController().onBeforeShow(oEvent);
		
    },

});