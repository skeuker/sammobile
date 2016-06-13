sap.ui.controller("sammobile.WorkitemList", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf sammobile.WorkitemList
*/
	onInit: function() {
		
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf sammobile.WorkitemList
*/
	onBeforeRendering: function() {

	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf sammobile.WorkitemList
*/
	onAfterRendering: function() {


	},

	// Create list of workitems
	createWorkitemList : function() {
		
		//For formatting of estimated completion date
		var oDateTimeFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern : "d MMM, y"});
		
		//create workitem list row template
		var oObjectListItemTemplate = new sap.m.ObjectListItem({
			  type : sap.m.ListType.Active,
		      title : {path: "Workitem_Wrkreq/Reqtitl" },
		      number :  { path: "Openeffrt" },
		      numberUnit : "Hr",
		      attributes : [ new sap.m.ObjectAttribute({ 
		    	  				text : {
		    	  					path: "Wrkreqid",
		    	  					formatter: function(sWrkreqid){
		    	  						return "Work request " + sWrkreqid;
		    	  					}
		    	  			 }}),
		                     new sap.m.ObjectAttribute({ 
		                    	 text : {
		                    	 	path: "Workitem_Wrkreq/Edatcom",
		                    	 	formatter: function(sDate){
		                    	 		if(sDate !== null && sDate !== undefined){
		            						return "Estimated completion " + oDateTimeFormat.format(sDate);
		            					}else{
		            						return "Not scheduled";
		            					}
		                    	 	}
		                    	}}) ],
		      press : function(oEvent){ sap.ui.controller("sammobile.WorkitemList").listItemTriggered(oEvent); }
		    });

		//create list for model content using list template
		var oWorkitemList = new sap.m.List({footerText : "My workitems for progress feedback"});
	
		//Aggregation binding ensuring that work request navigation is expanded
		oWorkitemList.bindItems({ path: "/WorkitemSet", 
						  template: oObjectListItemTemplate, 
						  parameters: {expand: "Workitem_Wrkreq"}});
		
		//return workitem list control to view
		return oWorkitemList;
		
	},
	

	//React to workitem list click
	listItemTriggered : function(oEvent) {

		// The EventBus is used to let the Root Controller know that a navigation should take place.
		// The bindingContext is attached to the data object here to be used in the Root Controller's event handler.
		var bus = sap.ui.getCore().getEventBus();
		bus.publish("nav", "to", {
			id : "WorkitemDetail",
			data : {
				context :  oEvent.oSource.getBindingContext()
			}
		});

	},	
	
});