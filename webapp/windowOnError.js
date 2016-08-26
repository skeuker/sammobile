var oDialogJSError;

$(document).ready(function(){
	
	//global java script error handler
	$(window).on("error", function(error, url, linenumber) {
		
		//load messagetoast
		jQuery.sap.require("sap.m.MessageToast");
		
		//Check error for known non-fatal errors
		var oRegExp = new RegExp("cancelTimeout");
	    var bKnownJSError1 = oRegExp.test(error);
	    var oRegExp = new RegExp("object Object");
	    var bKnownJSError2 = oRegExp.test(error.toString());
	    
	    //Exclude known errors that do not compromise the app
		if(bKnownJSError1 || bKnownJSError2) return;
		
		//Determine message text depending on available information
    	try{
    		var sMessageText = error.originalEvent.message;
    	}
    	catch(err){
    		var sMessageText = "Unexpected JavaScript error: " + error + " (" + url + ", " + linenumber + ")";	
    	};
    	 
    	//Use default if original event message text was not available
    	if(!sMessageText){
    		sMessageText = "Unexpected JavaScript error: " + error + " (" + url + ", " + linenumber + ")";
    	}

		//Get access to local storage for retrieval of Error analysis setting
		jQuery.sap.require("jquery.sap.storage");
		var oLocalStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);

		//Deliver message in dialog to interrupt and resume processing
		if(oLocalStorage.get("ErrorAnalysis") == "true"){

			//avoid second dialog when another is open
			if(oDialogJSError !== undefined &&
			   oDialogJSError.bOpenIndicator){
				return;
			}
			
			//create new dialog
			oDialogJSError = new sap.m.Dialog({
				title: "Error analysis, area: JavaScript",
				content: [new sap.m.Text({text: sMessageText})],
				leftButton: new sap.m.Button({text: "Continue", type: sap.m.ButtonType.Reject, tap: function(){oDialogJSError.close(); oDialogJSError.bOpenIndicator = false;}}),
			});

			//send dialog 
			oDialogJSError.bOpenIndicator = true;
			oDialogJSError.open();

		}else{

			//Deliver message in message toast otherwise
			sap.m.MessageToast.show(sMessageText, { duration : 10000, width: "20em"});

		};

	});

});
