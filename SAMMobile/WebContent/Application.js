jQuery.sap.declare("Application");
jQuery.sap.require("sap.m.App"); //"sap.ui.app.Application"

sap.m.App.extend("Application", { //sap.ui.app.Application.extend

    init : function() {
    	
    	//require message toast for message handling
    	jQuery.sap.require("sap.m.MessageToast");
    	
        //create app view and put to html root element
		sap.ui.jsview("sammobile.App").placeAt("content");
    	
    },
    
    //event handler: model request failed
    handleRequestFailed : function (oEvent){
    	
    	//issue message to screen
		sap.m.MessageToast.show(oEvent.getParameters("message"));
		
    },
    
});