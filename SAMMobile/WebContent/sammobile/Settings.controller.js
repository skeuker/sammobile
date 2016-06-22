var bCredentialsChangeMessageTracker;

sap.ui.controller("sammobile.Settings", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf sammobile.Settings
*/
  	onInit: function() {
  		
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf sammobile.Settings
*/
//	onBeforeRendering: function() {
//
//	},


/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf sammobile.Settings
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf sammobile.Settings
*/
//	onExit: function() {
//
//	}
	
	//Create settings view content
	createSettingsViewContent : function(oController) {

		//get access to local storage 
		jQuery.sap.require("jquery.sap.storage");
		var oLocalStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);

		//Construct list of settings
		var oSettingsList = new sap.m.List({footerText : "My backend connection settings", width: "100%"}); 
		
		//Construct input field with application setting: Username
		var oUsernameInputField = new sap.m.Input("UsernameSetting", {
			type: sap.m.InputType.Text, 
			width : "175px",
			placeholder : "Username"});
		oUsernameInputField.attachLiveChange(oUsernameInputField, function(oEvent){
			oLocalStorage.put("Username", oUsernameInputField.getValue());
			
			//deliver credentials change message once only
			if(this.getCredentialsChangeMessageTracker() !== false){
				sap.m.MessageToast.show("For your new credentials to take effect restart the application");
				this.setCredentialsChangeMessageTracker(false); 
			}
			
		}, oController);
		oUsernameInputField.setValue(oLocalStorage.get("Username"));

		//Construct input field with application setting: Password
		var oPasswordInputField = new sap.m.Input("PasswordSetting", {
			type: sap.m.InputType.Password, 
			width : "175px",
			placeholder : "Password"});
		oPasswordInputField.attachLiveChange(oPasswordInputField, function(oEvent){
			oLocalStorage.put("Password", oPasswordInputField.getValue());
			
			//deliver credentials change message once only
			if(this.getCredentialsChangeMessageTracker() !== false){
				sap.m.MessageToast.show("For your new credentials to take effect restart the application");
				this.setCredentialsChangeMessageTracker(false);
			}
			
		}, oController);
		oPasswordInputField.setValue(oLocalStorage.get("Password"));
		
		//Construct input field with application setting: server
		var oServerInputField = new sap.m.Input("AppServer", {
			type: sap.m.InputType.Text, 
			width : "180px",
			placeholder : "Fully qualified host name"});
		oServerInputField.attachLiveChange(oServerInputField, function(oEvent){
			oLocalStorage.put("AppServer", oServerInputField.getValue());
		});
		oServerInputField.setValue(oLocalStorage.get("AppServer"));

		//Construct input field with application setting: port
		var oServerPortInputField = new sap.m.Input("AppServerPort", {
			type: sap.m.InputType.Number, 
			width : "175px",
			placeholder : "Port number"});
		oServerPortInputField.attachLiveChange(oServerPortInputField, function(oEvent){
			oLocalStorage.put("AppServerPort", oServerPortInputField.getValue());
		});
		oServerPortInputField.setValue(oLocalStorage.get("AppServerPort"));

		//Construct input field with application setting: protocol
		var oAppServerProtocolComboBox = new sap.m.ComboBox("AppServerProtocol", {
            items: [ new sap.ui.core.Item({text: "https", key: "https"}), 
                     new sap.ui.core.Item({text: "http", key: "http"}) ],
			selectionChange:function(oEvent){oLocalStorage.put("AppServerProtocol", oAppServerProtocolComboBox.getValue());}
        });
		oAppServerProtocolComboBox.setValue(oLocalStorage.get("AppServerProtocol"));

		//Construct input field with application setting: client
		var oServerClientInputField = new sap.m.Input("AppServerClient", {
			type: sap.m.InputType.Number, 
			width : "175px",
			placeholder : "Client number"});
		oServerClientInputField.attachLiveChange(oServerClientInputField, function(oEvent){
			oLocalStorage.put("AppServerClient", oServerClientInputField.getValue());
		});
		oServerClientInputField.setValue(oLocalStorage.get("AppServerClient"));

		//Construct input field with application setting: connection timeout
		var oConnectionTimeoutInputField = new sap.m.Input("ConnectionTimeout", {
			type: sap.m.InputType.Number, 
			width : "175px",
			placeholder : "Number of Seconds"});
		oConnectionTimeoutInputField.attachLiveChange(oConnectionTimeoutInputField, function(oEvent){
			oLocalStorage.put("ConnectionTimeout", oConnectionTimeoutInputField.getValue());
		});
		oConnectionTimeoutInputField.setValue(oLocalStorage.get("ConnectionTimeout"));
		
		//Construct input field with application setting: product
		var oProductComboBox = new sap.m.ComboBox("Product", {
            items: [ new sap.ui.core.Item({text: "mbsa", key: "mbsa"}), 
                     new sap.ui.core.Item({text: "blw", key: "blw"}) ],
			selectionChange:function(oEvent){oLocalStorage.put("Product", oProductComboBox.getValue());}
        });
		oProductComboBox.setValue(oLocalStorage.get("Product"));

		//Construct check box with application setting: Error analysis
		var oErrorAnalysisCheckbox = new sap.m.CheckBox("ErrorAnalysis");
		if(oLocalStorage.get("ErrorAnalysis") == "true"){ 
			oErrorAnalysisCheckbox.setSelected(true);
		}else{
			oErrorAnalysisCheckbox.setSelected(false);
		}
		oErrorAnalysisCheckbox.attachSelect(oErrorAnalysisCheckbox, function(oEvent){
			if(oErrorAnalysisCheckbox.getSelected() == true){
				oLocalStorage.put("ErrorAnalysis", "true");
			}else{
				oLocalStorage.put("ErrorAnalysis", "false");
			}
		});
		
		//Username and password only once logon was done
		if(oLocalStorage.get("Username")){ 

			//Setting: Username for logon
			oSettingsList.addItem(new sap.m.InputListItem({
				label: "Username",
				content: new sap.m.VBox({
					items : [ oUsernameInputField ],
					alignItems : sap.m.FlexJustifyContent.End
				})}));

			//Setting: Password for logon
			oSettingsList.addItem(new sap.m.InputListItem({
				label: "Password",
				content: new sap.m.VBox({
					items : [ oPasswordInputField ],
					alignItems : sap.m.FlexJustifyContent.End
				})}));

		}

		//Setting: Application server name
		oSettingsList.addItem(new sap.m.InputListItem({
			label: "App server",
			content: new sap.m.VBox({
				items : [ oServerInputField ],
				alignItems : sap.m.FlexJustifyContent.End
			})}));

		//Setting: Application server port
		oSettingsList.addItem(new sap.m.InputListItem({
			label: "Port number",
			content: new sap.m.VBox({
				items : [ oServerPortInputField ],
				alignItems : sap.m.FlexJustifyContent.End
			})}));

		//Setting: Application server protocol
		oSettingsList.addItem(new sap.m.InputListItem({
			label: "Protocol",
			content: new sap.m.VBox({
				items : [ oAppServerProtocolComboBox ],
				alignItems : sap.m.FlexJustifyContent.End
			})}));

		//Setting: Application server client number
		oSettingsList.addItem(new sap.m.InputListItem({
			label: "SAP Client",
			content: new sap.m.VBox({
				items : [ oServerClientInputField ],
				alignItems : sap.m.FlexJustifyContent.End
			})}));

		//Setting: Connection timeout in seconds
		oSettingsList.addItem(new sap.m.InputListItem({
			label: "Timeout",
			content: new sap.m.VBox({
				items : [ oConnectionTimeoutInputField ],
				alignItems : sap.m.FlexJustifyContent.End
			})}));
			
		//Setting: Namespace
		var oProductListItem = new sap.m.InputListItem({
			label: "Product",
			visible: false,
			content: new sap.m.VBox({
				items : [ oProductComboBox ],
				alignItems : sap.m.FlexJustifyContent.End
			})});
		oSettingsList.addItem(oProductListItem);

		//Setting: Error Analysis indicator
		oSettingsList.addItem(new sap.m.InputListItem({
			label: "Error analysis",
			content: new sap.m.VBox({
				items : [ oErrorAnalysisCheckbox ],
				alignItems : sap.m.FlexJustifyContent.End
			})}));	

		//Construct page with list of settings
		var oSettingsPage = new sap.m.Page({
			title: "SAM Mobile: Settings",
			showNavButton : true,
			navButtonType : sap.m.ButtonType.Back,
			navButtonTap : function(){
				var bus = sap.ui.getCore().getEventBus();
				bus.publish("nav", "back");
			},
			content: oSettingsList
		});
		
		//legacy options button
		var oSettingsPageFooterBar;
		oSettingsPageFooterBar = new sap.m.Bar({
			translucent : true, 
			contentLeft : [new sap.m.Button({text: "Legacy settings", press: function(){oProductListItem.setVisible(true);}})]
		});
		
		//delete credentials button
		if(oLocalStorage.get("Username")){ 
			oSettingsPageFooterBar.addContentRight( 
				new sap.m.Button({text: "Delete credentials", press: function(){
					oLocalStorage.put("Username", "");
					oUsernameInputField.setValue("");
					oLocalStorage.put("Password", "");
					oPasswordInputField.setValue("");
					oLocalStorage.put("AuthToken", "");
				}}));
		}
		
		//set footer bar
		oSettingsPage.setFooter(oSettingsPageFooterBar);	
		
		//return page
		return oSettingsPage;
		
	},
	
	//get bCredentialsChangeMessageTracker attribute
	getCredentialsChangeMessageTracker : function(bIndicator){
		return bCredentialsChangeMessageTracker;
	},
	
	//set bCredentialsChangeMessageTracker attribute
	setCredentialsChangeMessageTracker : function(bIndicator){
		bCredentialsChangeMessageTracker = bIndicator;
	}
	
});