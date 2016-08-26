/**
 * Registering and handling device events not otherwise catered for by SAP UI5
 */

//handle pressing of the device's back button
function onBackKeyDown(){
	
	//navigate back to previous view in call stack
	var bus = sap.ui.getCore().getEventBus();
    bus.publish("nav", "back");
	
}

//handle pressing of the device's menu button
function onMenuButtonDown(){
	
	//No further action if application is not logged on
	if(!sap.ui.controller("sammobile.App").isLoggedOn()){ 
		return; 
	}
	
	//navigate to the home view for logged on app
	var bus = sap.ui.getCore().getEventBus();
	bus.publish("nav", "to", {
		id : "Home",
		data : { context :  "None" }
	});
    
}

//registering the back and menu button press event on device ready
function onDeviceReady(){ 
	
	//add hardware key event listeners
    document.addEventListener("backbutton", onBackKeyDown, false);
    document.addEventListener("menubutton", onMenuButtonDown, false);
    window.StatusBar.overlaysWebView(false);
    window.StatusBar.styleDefault();
    window.StatusBar.show();
    
}

//called from onLoad event in body of index.html
function init(){
	
	//add event listener for cordova deviceready event
	document.addEventListener("deviceready", onDeviceReady, false);
	
};