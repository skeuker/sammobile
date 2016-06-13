sap.ui.jsview("sammobile.Loading", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf sammobile.Loading
	*/ 
	getControllerName : function() {
		return "sammobile.Loading";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf sammobile.Loading
	*/ 
	createContent : function(oController) {
		
		//just a Loading busy indicator
 		return new sap.m.FlexBox({
				height: "100%",
				width : "100%",
				direction : sap.m.FlexDirection.Column,
				justifyContent: sap.m.FlexJustifyContent.Center,
				alignItems : sap.m.FlexAlignItems.Center, 
				items : [new sap.m.BusyIndicator({size: "60px"}),
				         new sap.m.Text({text: "Loading..."}) ]
		});
 		
	}

});