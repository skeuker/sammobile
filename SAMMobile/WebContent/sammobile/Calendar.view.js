sap.ui.jsview("sammobile.Calendar", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf sammobile.Calendar
	*/ 
	getControllerName : function() {
		return "sammobile.Calendar";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf sammobile.Calendar
	*/ 
	createContent : function(oController) {
		
		//create page content
		return oController.createCalendarContent();
	    
	}

});