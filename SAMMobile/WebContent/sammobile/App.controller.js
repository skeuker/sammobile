var oSAMMobileApp;
var oDialogAppError;

sap.ui.controller("sammobile.App", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf sammobile.App 
*/
	onInit: function() {
		
		// subscribe to event bus
        var bus = sap.ui.getCore().getEventBus();
        bus.subscribe("nav", "to", this.navToHandler, this);
        bus.subscribe("nav", "back", this.navBackHandler, this);
        bus.subscribe("nav", "backFromCalendarDay", this.navBackHandler, this);
        
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf sammobile.App
*/
	onBeforeRendering: function() {

	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf sammobile.App
*/
	onAfterRendering: function() {

		
	},
	
	//get SAM Mobile App
	getApp : function(){
		
		//return reference to mobile app object
		return oSAMMobileApp;
		
	},
	
	//return SAM Mobile App logon status
	isLoggedOn : function(){
		
		//return logged on app attribute
		return oSAMMobileApp.isLoggedOn;
		
	},
	
	//Create AppView content
	createAppContent : function() {
		
		//Variable declaration
		var sJSViewId = "Loading";
		var sJSViewName = "sammobile.Loading";
		
		//get access to local storage 
		jQuery.sap.require("jquery.sap.storage");
		var oLocalStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		
		//build service url for SAM oDATA gateway service model
		var sServiceUrl = sap.ui.controller("sammobile.App").buildServiceUrl();
		
		//Send 'Logon' view where credentials or connection settings not available
		if(!oLocalStorage.get("Username") || !oLocalStorage.get("Password") || !sServiceUrl){
			sJSViewName = "sammobile.Logon";
			sJSViewId = "Logon";
		};
		
		//create new mobile application object instance
		oSAMMobileApp = new sap.m.App({
							id : "SAMMobileApp", 
							height : '100%', 
							width : '100%',
			 				visible : true }); 
		
		//Add identified view as page to the mobile app
		oSAMMobileApp.addPage(sap.ui.jsview(sJSViewId, sJSViewName));
		
		//Keep track of mobile app object for navigation event handlers
		this.app = oSAMMobileApp;
		
		//Return mobile app (representing the navigation container)
		return oSAMMobileApp;
		
	},

	//Handler of navigation requests as subscribed to in the onInit method
	navToHandler : function(navChannelID, navEventID, data){
		
		//To make sure close all open dialogs and pop-overs
		if(sap.m.InstanceManager.hasOpenDialog()){
	        sap.m.InstanceManager.closeAllDialogs();
	    };
	    if (sap.m.InstanceManager.hasOpenPopover()) {
	        sap.m.InstanceManager.closeAllPopovers();
	    };
		
		//for logon page as navigation target ensure rerendering
		if (this.app.getPage(data.id) !== null && data.id == "Logon") {
			var oLogonPage = this.app.getPage("Logon");
            oLogonPage.invalidate();
        };
        
        //for calendar day page as navigation target ensure rerendering
		if (this.app.getPage(data.id) !== null && data.id == "CalendarDay") {
			var oCalendarDayPage = this.app.getPage("CalendarDay");
            oCalendarDayPage.invalidate();
        };
        
		//lazy load of the requested page where applicable
		if (this.app.getPage(data.id) === null) {
            this.app.addPage(sap.ui.jsview(data.id, "sammobile." + data.id));
        };
		
		//navigate to requested page with or without binding context
		this.app.to(data.id, data);  
		
	},
	
	//Handler of navigation requests as subscribed to in the onInit method
	navBackHandler : function(navChannelID, navEventID, data){
		
		//Get model
		var oSAMModel = sap.ui.getCore().getModel();
		
		//Dialog to confirm navigation without save
		if(oSAMModel !== undefined){

			if(oSAMModel.hasPendingChanges() || oSAMModel.hasPendingBatches){

				//keep track of this as dialog event listener
				var oDialogListener = this;

				//create new dialog
				var oDialog = new sap.m.Dialog({
					title: "Confirmation dialog",
					content: [new sap.m.Text({text: "Leave without saving?"})],
					leftButton: new sap.m.Button({text: "Cancel", type: "Reject", tap: function(){oDialog.close();}}),
					rightButton: new sap.m.Button({text: "Ok", type: "Accept", tap: function(){oDialogListener.doNavigateBackWithoutSaving(oDialog, oDialogListener);}}),
				});

				//send dialog and return
				oDialog.open();
				return;

			};

		};
		
		//Check that back navigation target makes sense (no navigation back to loading view or logon view when logged on)
		var oPreviousPage = this.app.getPreviousPage();
		if(oPreviousPage.sId == "Loading" || (oPreviousPage.sId == "Logon" && this.getApp().isLoggedOn)) return;
		
		//navigate back
		this.app.back();
		
	},
	
	//navigate back without saving
	doNavigateBackWithoutSaving : function(oDialog, oListener){
		
		//Reset changes in Model that were registered with setProperty
		var oSAMModel = sap.ui.getCore().getModel();
		oSAMModel.resetChanges();
		
		//Reset changes in Model that were registered wit addBatchOperation
		oSAMModel.hasPendingBatches = false;
		oSAMModel.clearBatch();
		
		//Refresh model to update UI with current status
		oSAMModel.refresh();
		
		//close confirmation dialog
		oDialog.close();
		
		//navigate back
		oListener.app.back();
		
	},
	
	initSAMModel: function() {
		
		//no need to initialize when already available
		var oSAMModel = sap.ui.getCore().getModel();
		if(oSAMModel !== undefined){
			return oSAMModel;
		};
		
		//get access to local storage 
		jQuery.sap.require("jquery.sap.storage");
		var oLocalStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);

		//build service url for SAM oDATA gateway service model
		var sServiceUrl = this.buildServiceUrl();

		//create map to indicate 'sap-client' header attribute
		var mRequestHeader = {};
		if(oLocalStorage.get("AppServerClient")){
			mRequestHeader["sap-client"] = oLocalStorage.get("AppServerClient");
		};
		
		//create 'X-Requested-With' header to cater for SAP systems where XCSRF token handling switched off
		mRequestHeader["X-Requested-With"] = "za.co.blueware.SAMMobile";
		
		//set authorization into request header 
		var sAuthToken = oLocalStorage.get("AuthToken");
		mRequestHeader["Authorization"] = sAuthToken;
		
		//create object with ODATA model constructor parameters
		var oConstructorParams = {};
		oConstructorParams["json"] = true;
		oConstructorParams["headers"] = mRequestHeader;
		oConstructorParams["tokenhandling"] = true;
		
		//create Model referring to the SAM oData gateway service model
		oSAMModel = new sap.ui.model.odata.ODataModel(sServiceUrl, oConstructorParams);
	    
	    //set default binding to one way to allow create/ update into backend
	    oSAMModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
	    
	    //set model for access from application
        sap.ui.getCore().setModel(oSAMModel);	
        
        //refresh xsrf token, mainly to initiate communication for SSO  
        oSAMModel.setTokenHandlingEnabled(true);
        oSAMModel.refreshSecurityToken(null, sap.ui.controller("sammobile.App").showErrorMessage, false);
        
        //register busy dialog open and close function for request sending
    	oSAMModel.attachRequestSent(null, function(){
    		oSAMMobileApp.setBusy(true);
    	});
    	oSAMModel.attachRequestCompleted(null, function(){
    		oSAMMobileApp.setBusy(false);
    	});
    	oSAMModel.attachRequestFailed(null, function(){
    		oSAMMobileApp.setBusy(false);
    	});
    	
    	//feedback to caller
    	return oSAMModel;
		
	},
	
	//handle SAM Model security token refresh failure
	handleTokenRefreshFailed : function(oError){
		
		//issue message to screen
		sap.ui.controller("sammobile.App").showErrorMessage(oError);
		
	},
	
	//handle SAM Model backend request failure
	handleRequestFailed : function(oError){
		
		//Close busy dialog
		oSAMMobileApp.setBusy(false);
		
		//issue message to screen
		sap.ui.controller("sammobile.App").showErrorMessage(oError);
		
	},
	
	//handle update error for ODATA model 'submitChanges' call
	handleUpdateError : function(oError){
		
		//Close busy dialog
		oSAMMobileApp.setBusy(false);
		
		//issue message to screen
		sap.ui.controller("sammobile.App").showErrorMessage(oError);
		
	},
	
	//handle update success for ODATA model 'submitChanges' call
	handleUpdateSuccess : function(oData, response){
		
		//Refresh model to update UI with current status
		var oSAMModel = sap.ui.getCore().getModel();
		oSAMModel.refresh();
		
		//successfully updated
		sap.m.MessageToast.show("Your changes have been saved");
		
	},
	
	//handle batch update error for ODATA model 'submitBatch' call
	handleBatchUpdateError : function(oError){
		
		//Close busy dialog
		oSAMMobileApp.setBusy(false);
		
		//keep track of the fact that no batches are pending
		var oSAMModel = sap.ui.getCore().getModel();
		oSAMModel.hasPendingBatches = false;
		
		//issue message to screen
		sap.ui.controller("sammobile.App").showErrorMessage(oError);
		
	},
	
	//handle batch update success for ODATA model 'submitBatch' call
	handleBatchUpdateSuccess : function(oData, oResponse, aErrorResponses){
		
		//indicate model has no more batches pending
		var oSAMModel = sap.ui.getCore().getModel();
		oSAMModel.hasPendingBatches = false;
		
		//Refresh model to update UI with current status
		oSAMModel.refresh();
		
		//Close busy dialog
		oSAMMobileApp.setBusy(false);
		
		//all batches successfully updated
		if(aErrorResponses.length == 0){
			sap.m.MessageToast.show("Your changes have been saved");
		};
		
		//at least one batch gave errors, issue first error
		if(aErrorResponses.length > 0){
			try{
				var processingLog = jQuery.parseJSON(aErrorResponses[0].response.body);
				sap.m.MessageToast.show(processingLog.error.message.value);
			}
			catch(err){
				sap.m.MessageToast.show(oError.response.body);
			};
		};
		
		//Refresh model to update UI with current status after batch change
		oSAMModel = sap.ui.getCore().getModel();
		oSAMModel.hasPendingBatches = false;
		oSAMModel.refresh();
		
	},
	
	// Navigate to settings dialog
	makeAppSettings : function(){

		//Navigate to settings view
		var bus = sap.ui.getCore().getEventBus();
		bus.publish("nav", "to", {
			id : "Settings",
			data : { context :  "None" }
		});

	},
	
	//build service url
	buildServiceUrl : function(){
		
		//get access to local storage 
		jQuery.sap.require("jquery.sap.storage");
		var oLocalStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);

		//app settings not yet available 
		if(!oLocalStorage.get("AppServerProtocol") ||
		   !oLocalStorage.get("AppServerPort") ||
		   !oLocalStorage.get("AppServer") ){
			return;
		};

		//build service Url from application settings
		if(oLocalStorage.get("AppServer") !== "proxy"){
			var sServiceUrl = oLocalStorage.get("AppServerProtocol") + '://' 
			+ oLocalStorage.get("AppServer") + ':' 
			+ oLocalStorage.get("AppServerPort") 
			+ "/sap/opu/odata/blw/sam_ui5_srv/";
		}else{
			sServiceUrl = oLocalStorage.get("AppServer") 
			+ "/sap/opu/odata/blw/sam_ui5_srv/";
		};

		//feedback to caller
		return sServiceUrl;
		
	},
	
	//check whether valid credentials exist
	checkCredentials : function(sServiceUrl){
		
		//get access to local storage 
		jQuery.sap.require("jquery.sap.storage");
		var oLocalStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		
		//No further processing where applicable
		if(!oLocalStorage.get("Username") || !oLocalStorage.get("Password") || !sServiceUrl){
			return;
		};
		
		//Set connection timeout to configured value or default
		var nConnectionTimeout = oLocalStorage.get("ConnectionTimeout") * 1000;
		if(nConnectionTimeout == "" || nConnectionTimeout == 0 || nConnectionTimeout == undefined){
			nConnectionTimeout = 5000;
		};
		
		//define request header map for ajax call
		var mRequestHeader = {};
		
		//create map to indicate 'sap-client' request header attribute
		if(oLocalStorage.get("AppServerClient")){
			mRequestHeader["sap-client"] = oLocalStorage.get("AppServerClient");
		};
		
		//Build authorization token based on stored username and password
		jQuery.sap.registerModulePath('base64', 'base64');
		jQuery.sap.require("base64");
		var sCredentials  = oLocalStorage.get("Username") + ':' + oLocalStorage.get("Password");   
		var sCredentialsHash = B64.encode(sCredentials);
		var sAuthenticationToken = "Basic " + sCredentialsHash;
		
		//add authentication information
		mRequestHeader["Authorization"] = sAuthenticationToken;
		
		//request json
		mRequestHeader["Accept"] = "application/json";

		//Logon through ajax call, device will send SSO cookie if available
		$.ajax({

			//synchronous post to logon using credentials previously supplied
			type : "GET",
			async : true,
			cache : false,
			url : sServiceUrl,
			timeout : nConnectionTimeout,
			
			//set Request header
			headers : mRequestHeader,
			
			//special handling for 401, unauthorized, to override error handling
			statusCode: { 401: function(){ 
				
				    //user is not logged in
				    oSAMMobileApp.isLoggedOn = false;

					//navigate to logon view
					var bus = sap.ui.getCore().getEventBus();
					bus.publish("nav", "to", {
						id : "Logon",
						data : { context :  "None" }
					});
					
				} 
			},
			
			//valid credentials for existing connection exist
			success : function(data){  
				
				//application is logged in
			    oSAMMobileApp.isLoggedOn = true;
			    
			    //close busy dialog
				sap.ui.controller("sammobile.App").getApp().setBusy(false);
				
				//Build authorization token based on stored username and password
				jQuery.sap.registerModulePath('base64', 'base64');
				jQuery.sap.require("base64");
				var sCredentials  = oLocalStorage.get("Username") + ':' + oLocalStorage.get("Password");   
				var sCredentialsHash = B64.encode(sCredentials);
				var sAuthenticationToken = "Basic " + sCredentialsHash;
				
				//Keep track of authorization token for future logon without logon dialog
				oLocalStorage.put("AuthToken", sAuthenticationToken);
				
				//navigate to home view
				var bus = sap.ui.getCore().getEventBus();
				bus.publish("nav", "to", {
					id : "Home",
					data : { context :  "None" }
				});
				
			},

			//no valid credentials or invalid connection
			error : function(xhr, status, error){ 
				
				//application is not logged on
			    oSAMMobileApp.isLoggedOn = false;

				//navigate to logon view
				var bus = sap.ui.getCore().getEventBus();
				bus.publish("nav", "to", {
					id : "Logon",
					data : { context :  "None" }
				});

			}

		});

	},
	
	//Static handler to start busy dialog
	openBusyDialog : function(){
		
		oSAMMobileApp.setBusy(true);
		
	},
	
	//Static handler to close busy dialog
	closeBusyDialog : function(){
		
		oSAMMobileApp.setBusy(false);
		
	},
	
    //check credentials triggered from loading controller (desktop) or onCordovaDeviceReady (mobile)
    doCheckCredentials : function(){
    	
		//build service url for SAM oDATA gateway service model
		var sServiceUrl = sap.ui.controller("sammobile.App").buildServiceUrl();
		
		//check existing credentials and redirect to logon view if applicable
		sap.ui.controller("sammobile.App").checkCredentials(sServiceUrl);
		
    },
    
    //show the MessageToast control to output message to screen
    showErrorMessage : function(oError){
    	
    	//variable declaration
    	var sMessageText;
    	
    	//get access to local storage 
		jQuery.sap.require("jquery.sap.storage");
		var oLocalStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		
    	//Determine message text depending on available information
    	try{
    		var processingLog = jQuery.parseJSON(oError.response.body);
    		sMessageText = processingLog.error.message.value;
    	}
    	catch(err){

    		//message text where response body not parseable 
    		try{ 

    			//depending whether status text available
    			if(oError.response.statusText){
    				
    				//set specific application or connection error message text
    				sMessageText = oError.message + ", " + "HTTP return code: "
    							 + oError.response.statusCode + " with text: " 
    							 + oError.response.statusText;
    				
    			}else if(oError.message !== "HTTP request failed"){
    				
    				//adopt message text from error object
    				sMessageText = "Application reports an error: " + oError.message;
    				
    			}else{

    				//set message text where all else failed
    				sMessageText = "Unspecified error: " + oError;

    			};
    		}
    		catch(err){

    			//set message text where all else failed
    			sMessageText = "Unspecified error: " + oError;

    		};

    	};
    	
		//Deliver message in dialog to interrupt and resume processing
		if(oLocalStorage.get("ErrorAnalysis") == "true"){
			
			//avoid second dialog when another is open
			if(oDialogAppError !== undefined &&
			   oDialogAppError.bOpenIndicator){
				return;
			}
			
			//create new dialog
			oDialogAppError = new sap.m.Dialog({
				title: "Error analysis, area: App",
				content: [new sap.m.Text({text: sMessageText})],
				leftButton: new sap.m.Button({text: "Continue", type: sap.m.ButtonType.Reject, tap: function(){oDialogAppError.close(); oDialogAppError.bOpenIndicator = false;}}),
			});

			//send dialog
			oDialogAppError.bOpenIndicator = true;
			oDialogAppError.open();
			
		}else{
			
			//Deliver message in message toast otherwise
			sap.m.MessageToast.show(sMessageText);
			
		};

    }

});