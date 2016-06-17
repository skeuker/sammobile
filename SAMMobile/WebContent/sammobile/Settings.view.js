var oSettingsList;
var oLocalStorage;

sap.ui.jsview("sammobile.Settings", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf sammobile.Settings
	*/ 
	getControllerName : function() {
		return "sammobile.Settings";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf sammobile.Settings
	*/ 
	createContent : function(oController) {
		
		//Create settings view content
		return oController.createSettingsViewContent(oController);
		
	}
	
});