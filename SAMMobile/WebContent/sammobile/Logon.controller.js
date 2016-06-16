var oUsernameControl;
var oPasswordControl;

sap.ui.controller("sammobile.Logon", {

	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 * @memberOf sammobile.Logon
	 */
	onInit: function() {

	},

	/**
	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	 * (NOT before the first rendering! onInit() is used for that one!).
	 * @memberOf sammobile.Logon
	 */
	onBeforeRendering: function() {
		
	},

	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * @memberOf sammobile.Logon
	 */
	onAfterRendering: function() {
		
	},
	
	//create LogonPage content
	createLogonPageContent : function(){
		
		//get access to local storage 
		jQuery.sap.require("jquery.sap.storage");
		var oLocalStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);

		//Username and password input fields
		oUsernameControl = new sap.m.Input("Username", {placeholder : "Username",  width : "200px"});
		oPasswordControl = new sap.m.Input("Password", {placeholder : "Password",  width : "200px", type : sap.m.InputType.Password });
		
		//Set Username and Password if already available (in case where logon fails due to connectivity issues)
		oUsernameControl.setValue(oLocalStorage.get("Username"));
		oPasswordControl.setValue(oLocalStorage.get("Password"));

		//Logon button
		var oLogonButtonControl = new sap.m.Button({text:"Logon", width : "200px", type : sap.m.ButtonType.Default, press: this.doLogon});

		//Create page content with login controls
		var oLogonPage = new sap.m.Page({
			title: "SAM Mobile: Logon",
			showHeader : true,
			content: [ new sap.m.FlexBox({
				width : "100%",
				height : "100%",
				direction : sap.m.FlexDirection.Column,
				alignItems : sap.m.FlexAlignItems.Center, 
				justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
				items : [ oUsernameControl, oPasswordControl, oLogonButtonControl ]
			}) ]
		});
		
		//Footer bar with settings
		var oLogonPageFooterBar = new sap.m.Bar({
			translucent : true, 
			contentLeft : [new sap.m.Button({text: "Settings", press: sap.ui.controller("sammobile.App").makeAppSettings})]
		});

		oLogonPage.setFooter(oLogonPageFooterBar);

		return oLogonPage;

	},
		
	//do logon to backend
	doLogon : function(oEvent){

		//get access to local storage 
		jQuery.sap.require("jquery.sap.storage");
		var oLocalStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		
		//app settings not available 
		if(oLocalStorage.get("AppServer") == undefined || 
		   oLocalStorage.get("AppServerPort") == undefined || 
		   oLocalStorage.get("AppServerProtocol") == undefined){
			sap.m.MessageToast.show("To log on maintain connection details in settings dialog"); 
			return;
		}

		//user name or password not provided
		if(oUsernameControl.getValue() == "" || oPasswordControl.getValue() == ""){
			sap.m.MessageToast.show("To log on enter user name and password");
			return;
		}
		
		//send busy dialog
		sap.ui.controller("sammobile.App").getApp().setBusy(true);
		
		//build ODATA service url
		var sServiceUrl = sap.ui.controller("sammobile.App").buildServiceUrl();
		
		//define request header map for ajax call
		var mRequestHeader = {};
		
		//create map to indicate 'sap-client' request header attribute
		if(oLocalStorage.get("AppServerClient")){
			mRequestHeader["sap-client"] = oLocalStorage.get("AppServerClient");
		}
		
		//Build authorization token based on form input
		jQuery.sap.registerModulePath('base64', 'base64');
		jQuery.sap.require("base64");
		var sCredentials  = oUsernameControl.getValue() + ':' + oPasswordControl.getValue();   
		var sCredentialsHash = B64.encode(sCredentials);
		var sAuthenticationToken = "Basic " + sCredentialsHash;
		
		//add authentication information to request header
		mRequestHeader["Authorization"] = sAuthenticationToken;
		
		//Set connection timeout to configured value or default
		var nConnectionTimeout = oLocalStorage.get("ConnectionTimeout") * 1000;
		if(nConnectionTimeout == "" || nConnectionTimeout == 0 || nConnectionTimeout == undefined){
			nConnectionTimeout = 5000;
		}

		//Logon through ajax call
		$.ajax({

			//synchronous post to logon 
			type : "GET",
			async : true,
			cache : false,
			url : sServiceUrl, 
			timeout : nConnectionTimeout,

			//set XSRF fetch instruction header
			headers : mRequestHeader,
			
			//successfully logged on
			success : function(data){  
				
				//Keep track of login status
				sap.ui.controller("sammobile.App").getApp().isLoggedOn = true;
				
				//close busy dialog
				sap.ui.controller("sammobile.App").getApp().setBusy(false);
				
				//set password in local storage for future logon
				oLocalStorage.put("Username", oUsernameControl.getValue());
				oLocalStorage.put("Password", oPasswordControl.getValue());
				
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

			//failed to log on
			error : function(xhr, status, error){ 
				
				//Keep track of login status
				sap.ui.controller("sammobile.App").getApp().isLoggedOn = false;
				
				//close busy dialog, rest of error handling happens in ajaxError.js
				sap.ui.controller("sammobile.App").getApp().setBusy(false);
				
			}
			
		});
		
	},
	
	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * @memberOf sammobile.Logon
	 */
	onExit: function() {

	}

});