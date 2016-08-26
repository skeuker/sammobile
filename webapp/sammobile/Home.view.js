sap.ui.jsview("sammobile.Home", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf sammobile.HomeTiles
	*/ 
	getControllerName : function() {
		return "sammobile.Home";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf sammobile.HomeTiles
	*/ 
	createContent : function(oController) {
		
		//Create home tiles page
		var oHomePage =  new sap.m.Page({
			title: "SAM Mobile: Home",
			enableScrolling : false, 
			content: [new sap.m.TileContainer({
						editable : false,
						tiles : [ new sap.m.StandardTile("TimelogTile", { 
									title : "Time sheet",
									icon : "sap-icon://appointment", 
									info : "Actual time",
									press : oController.doNavigateToTimelog	
								 }),
								 new sap.m.StandardTile("FeebackTile", { 
								   title : "Feedback",
								   icon : "sap-icon://activity-individual",
								   info : "Capacity plan",
								   press : oController.doNavigateToFeedback	
						})
			]})] 
		});
		
		//Footer bar with settings
		var oHomePageFooterBar = new sap.m.Bar({
			translucent : false, 
			contentLeft : [new sap.m.Button({text: "Settings", press: [sap.ui.controller("sammobile.App").makeAppSettings, oController]})]
		});

		//include footer bar in home tiles page
		oHomePage.setFooter(oHomePageFooterBar);

		//return home tiles page to view
		return oHomePage;
		
	}

});