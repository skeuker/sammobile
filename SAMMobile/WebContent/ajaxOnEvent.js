var oDialogAjaxError;

$(document).ready(function(){
	
	//enable global event handlers
	$.ajaxSetup({
		global: true
	});
	
	//register global ajax error handling function
	$(document).ajaxError(function(event, request, settings, oError) {
		
		//load messagetoast
		jQuery.sap.require("sap.m.MessageToast");
		
		//debug
		sap.m.MessageToast.show("now in ajax error handler"); 
		
		//get access to local storage 
		jQuery.sap.require("jquery.sap.storage");
		var oLocalStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		
		//issue technical error message with greater than normal duration where requested
		if(oLocalStorage.get("ErrorAnalysis") == "true"){
			
			//avoid second dialog when another is open
			if(oDialogAjaxError !== undefined &&
		       oDialogAjaxError.bOpenIndicator){
				return;
			}
			
			//debug
	     	sap.m.MessageToast.show("Error status is " + request.status); 
			
			//Skip 404 as it has proven not relevant
			if(request.status == 404) return;
			
			//create new dialog
			oDialogAjaxError = new sap.m.Dialog({
				title: "Error analysis, area: Ajax",
				content: [new sap.m.Text({text: "HTTP code " + request.status + " triggered by url: " + settings.url})],
				leftButton: new sap.m.Button({text: "Continue", type: sap.m.ButtonType.Reject, tap: function(){oDialogAjaxError.close(); oDialogAjaxError.bOpenIndicator = false;}}),
			});

			//send dialog 
			oDialogAjaxError.bOpenIndicator = true;
			oDialogAjaxError.open();
			
			//no further message handling
			return;
			
		};

		//switch on request status
		switch (request.status) {

		//no network connection
		case 0:
			sap.m.MessageToast.show("Your device encountered a connection error. Check your settings");
			break;

			//successfully connected, need for credentials where none provided
		case 200:

			//get SAP login status
			var LoginStatus = request.getResponseHeader("SAPLoginStatus");
			switch (LoginStatus) {

			//need to provide login details
			case "Logon":
				var bus = sap.ui.getCore().getEventBus();
				bus.publish("nav", "to", { id : "Logon", data : { context :  "None" }});
				break;

				//need to change expired password	
			case "Password":
				sap.m.MessageToast.show("Your password has expired. Log on to the backend to change");
				break;
			}
			break;

			//credentials provided are not valid	
		case 401:
			sap.m.MessageToast.show("Credentials are incorrect or you are not authorized. Check your input and retry"); 
			var bus = sap.ui.getCore().getEventBus();
			bus.publish("nav", "to", { id : "Logon", data : { context :  "None" }});
			break;

			//not found: do not report as UI5 library sometimes triggers
		case 404:
			break;

			//all other cases (e.g. http ok code 500)	
		default:
			sap.m.MessageToast.show("An error has occured. HTTP return code was: " + request.status + " with text: " + request.statusText);
		}

	});

});