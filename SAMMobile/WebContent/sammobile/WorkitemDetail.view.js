sap.ui.jsview("sammobile.WorkitemDetail", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf sammobile.WorkitemDetail
	*/ 
	getControllerName : function() {
		return "sammobile.WorkitemDetail";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf sammobile.WorkitemDetail 
	*/ 
	createContent : function(oController) {
		
		//Place content into page and return
 		var oWorkitemDetailPage = new sap.m.Page({
 			id : "WorkitemDetailPage",
			title : "SAM Mobile: Workitem",
			showNavButton : true,
			navButtonType : sap.m.ButtonType.Back,
			navButtonTap : function(){
				var bus = sap.ui.getCore().getEventBus();
				bus.publish("nav", "back"); 
			},
			content: oController.createWorkitemDetailContent()
		});
 		
 		var oWorkitemDetailFooterBar = new sap.m.Bar({
			translucent : false, 
			contentLeft : [new sap.m.Button({text: "Save", press: [oController.submitWorkitemChanges, oController]})]
		});
 		
 		oWorkitemDetailPage.setFooter(oWorkitemDetailFooterBar);
 		
 		return oWorkitemDetailPage;
 		
 	},
	
	//Target hook for event based navigation
	onBeforeShow : function(oEvent) {
		
		//call onBeforeShow method in related controller
		this.getController().onBeforeShow(oEvent);
		
    },

});