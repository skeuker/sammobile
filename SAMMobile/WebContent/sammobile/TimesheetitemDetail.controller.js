var oDoneeffrtInput;

sap.ui.controller("sammobile.TimesheetitemDetail", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf sammobile.TimesheetitemDetail
*/
//	onInit: function() {
//
//	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf sammobile.TimesheetitemDetail
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf sammobile.TimesheetitemDetail
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf sammobile.TimesheetitemDetail
*/
//	onExit: function() {
//
//	}
	
	//Create TimesheetitemDetailContent
	createTimesheetitemDetailContent : function(){
		
		//format date from calendar UI control for ODATA filter
		var oCalendarDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "EEE MMM d yyyy"});
		
		//create list control
		var oTimesheetitemDetailList = new sap.m.List({inset : false, width: "100%", footerText : "My time for this work item"}); 
		
		//work request title 
		oTimesheetitemDetailList.addItem(new sap.m.StandardListItem({title: "Day of work", 
																	 description: {path : "Workday",
																		 		   formatter: function(oDate){ 
																		 			    if(oDate == null){return oDate;}
																		 				var nUTCTimeOffset = oDate.getTimezoneOffset();
																		 				var oDateLocalTime = new Date(oDate.getTime() - (nUTCTimeOffset*60*1000));
																		 				var sDate = oCalendarDateFormat.format(oDateLocalTime);
																		 				return sDate;
																		 		   }}})); 
		
		//work request title 
		oTimesheetitemDetailList.addItem(new sap.m.StandardListItem({title: "Work request description", description: "{Reqtitl}"})); 
		
		//input field for doneeffrt
		oDoneeffrtInput = new sap.m.Input({
			id : "DoneeffrtInput",
			type: sap.m.InputType.Number,
			liveChange : [this.setDoneeffrtProperty, this],
			value : { path: "Doneeffrt" }
		});
		
		//current time on workitem
		oTimesheetitemDetailList.addItem(new sap.m.InputListItem({
			label: "Hours worked?",
			content: new sap.m.VBox({
					 	items : oDoneeffrtInput,	
					 	alignItems : sap.m.FlexJustifyContent.End
			})}));
		
		//Create slider with 0.5 hour steps for alternate way of time entry
 		var oTimeSlider = new sap.m.Slider({
								min: 0,
								max: 10,
								value : { 
									path: "Doneeffrt",
									formatter: function(sValue) {
										return parseFloat(sValue);
									}
								},
								change: [this.setDoneeffrtProperty, this],
								step: 0.5,
								width: '100%'
						});
		
		//add time slider to list
		oTimesheetitemDetailList.addItem(new sap.m.InputListItem({
			content: [oTimeSlider]
		}));
		
		//work request ID
		oTimesheetitemDetailList.addItem(new sap.m.StandardListItem({title: "Work request ID", description: "{Wrkreqid}"})); 
		
		//keep track of TimesheetitemDetailList object reference
		this.timesheetitemDetailList = oTimesheetitemDetailList;
		
		//Place content into page and return
 		var oTimesheetitemDetailPage = new sap.m.Page({
 			id : "TimesheetitemDetailPage",
			title : "SAM Mobile: Time sheet item",
			showNavButton : true,
			navButtonType : sap.m.ButtonType.Back,
			navButtonTap : function(){
				var bus = sap.ui.getCore().getEventBus();
				bus.publish("nav", "back");},
			content: oTimesheetitemDetailList
		});
 		
 		//
 		var oTimesheetitemDetailFooterBar = new sap.m.Bar({
			translucent : false, 
			contentMiddle : [new sap.m.Button({text: "Save", press: [this.submitTimesheetitemUpdate, this]})]
		});
 		
 		//Set page footer
 		oTimesheetitemDetailPage.setFooter(oTimesheetitemDetailFooterBar);
 		
 		//return page 		
 		return oTimesheetitemDetailPage;
		
	},
	
	//Target hook for event based navigation
	onBeforeShow : function(oEvent) {
		
		//get binding context currently set for this controller's view
		this.getView().setBindingContext(oEvent.data.data.context);
		
		//set context for relative paths provided in detailList
		this.timesheetitemDetailList.bindElement(oEvent.data.data.context.sPath);
		
	},
	
	//submit timesheet item updates
	submitTimesheetitemUpdate : function(oEvent){
		
		//no update required where no change made	
		var oSAMModel = sap.ui.getCore().getModel();		
		if(!oSAMModel.hasPendingChanges()){
			
			//navigate back to the timesheet list view
			var bus = sap.ui.getCore().getEventBus();
			bus.publish("nav", "back"); 
			
			//no further processing
			return;
			
		};
		
		//send busy dialog
		sap.ui.controller("sammobile.App").getApp().setBusy(true);
		
		//Perform timesheet item update
		oSAMModel.submitChanges(sap.ui.controller("sammobile.TimesheetitemDetail").handleUpdateSuccess, 
								sap.ui.controller("sammobile.TimesheetitemDetail").handleUpdateError);
		
	},
	
	//update Doneeffrt input value and set model property
	setDoneeffrtProperty : function(oEvent){
		
		//Determine property path
		var oBindingContext = this.getView().getBindingContext();
		var oPropertyPath = oBindingContext + "/" + "Doneeffrt";
		
		//Format property value
		sNewDoneEffort = oEvent.getSource().getValue().toString();
			
		//Update Doneeffrt property in the Model
		var oSAMModel = sap.ui.getCore().getModel();
		oSAMModel.setProperty(oPropertyPath, sNewDoneEffort);	
		
	},
	
	//handle update error for ODATA model 'submitChanges' call
	handleUpdateError : function(oError){
		
		//Refresh model to update bindings
		var oSAMModel = sap.ui.getCore().getModel();
		oSAMModel.resetChanges();
		oSAMModel.refresh();
		
		//no longer busy
		sap.ui.controller("sammobile.App").getApp().setBusy(false);
		
		//issue message to screen
		sap.ui.controller("sammobile.App").showErrorMessage(oError);
			
	},
	
	//handle update success for ODATA model 'submitChanges' call
	handleUpdateSuccess : function(oData, response){
		
		//no longer busy
		sap.ui.controller("sammobile.App").getApp().setBusy(false);
		
		//navigate back to the timesheet list view
		var bus = sap.ui.getCore().getEventBus();
		bus.publish("nav", "back"); 
		
	},

});