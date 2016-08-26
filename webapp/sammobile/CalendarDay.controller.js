var oTimesheetItemList;
var oCalendarDayPage;
var oTimeEntryDialog;
var oTimeSlider;
var oTotalHours;
var sWorkday;

sap.ui.controller("sammobile.CalendarDay", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf sammobile.CalendarDay
*/
	onInit: function() {

		
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf sammobile.CalendarDay
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf sammobile.CalendarDay
*/
	//adjust page title after rendering 
	onAfterRendering: function() {
		
		//set page title to selected day
		$("#CalendarDayPage-title").text(sWorkday);
		
	},

	//create page content for CalendarDay
	createCalendarDayContent : function(){
		
		//create timesheet item list row template
		var oObjectListItemTemplate = new sap.m.ObjectListItem({
			  type : sap.m.ListType.Active,
		      title : { path: "Reqtitl" },
		      number :  { path: "Doneeffrt" },
		      numberUnit : "Hr",
		      attributes : [ new sap.m.ObjectAttribute({ 
		    	  				text : {path: "Wrkreqid",
		    	  					    formatter: function(sWrkreqid){
		    	  					    	return "Work request " + sWrkreqid;
		    	  					   }
		    	  			} } ) ],
		      press : [this.listitemTriggered, this]//[this.showTimeEntryDialog, this]
		    });
		
		//create list for model content using list template
		oTimesheetItemList = new sap.m.List("TimesheetItemList", {footerText : "My workitems for time capture"}); 
		
		//keep track of list item template, list and totals UI control
		this.timesheetItemListTemplate = oObjectListItemTemplate; 
		this.timesheetItemList = oTimesheetItemList;
		
		//create total hours text field
		oTotalHours = new sap.m.Text("TotalHours", { text: { path: "Doneeffrt" } });
		
		//new CalenderDay page listing
		oCalendarDayPage = new sap.m.Page({
			  	id: "CalendarDayPage",
			  	title: "SAM Mobile: Time log",
				showNavButton : true,
				navButtonType : sap.m.ButtonType.Back,
				navButtonTap : function(){
					var bus = sap.ui.getCore().getEventBus();
					bus.publish("nav", "backFromCalendarDay"); 
			},
			content: this.timesheetItemList
		});
		
 		//Footer bar to submit changes
		var oCalendarDayFooterBar = new sap.m.Bar({
			translucent : false, 
			contentRight: [ oTotalHours ]
		});
 		
 		oCalendarDayPage.setFooter(oCalendarDayFooterBar);
 		
 		//return to caller
 		return oCalendarDayPage;
		
	},
	
	//React to timesheetitem list click
	listitemTriggered : function(oEvent) {

		// Navigate to timesheet item detail
		var bus = sap.ui.getCore().getEventBus();
		bus.publish("nav", "to", {
			id : "TimesheetitemDetail",
			data : {
				context : oEvent.oSource.getBindingContext()
			}
		});

	},	

    //Target hook for event based navigation
	onBeforeShow : function(oEvent) {
		
		//nothing to do where no date provided
		sWorkday = oEvent.data.data.context; 
		if(sWorkday == undefined){ return; };

		//format date from calendar UI control for ODATA filter
		var oCalendarDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "EEE MMM d yyyy"});
		var oDate = oCalendarDateFormat.parse(sWorkday); 
		var nUTCTimeOffset = oDate.getTimezoneOffset();
		var oDateLocalTime = new Date(oDate.getTime() - (nUTCTimeOffset*60*1000));

		//build filter to select timesheet items by workday
		var oWorkdayFilter = new sap.ui.model.odata.Filter("Workday", [{operator: "EQ", value1: oDateLocalTime }]);
		
		//bind timesheet items
		this.timesheetItemList.bindItems({ path: "/TimesheetItemSet", template: this.timesheetItemListTemplate, filters: [oWorkdayFilter] });
		
		//set total hours text field property
		this.refreshTotalsDisplay();
		
	},
	
	//refresh totals display
	refreshTotalsDisplay : function(){
		
		//format date from calendar UI control for ODATA filter
		var oCalendarDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "EEE MMM d yyyy"});
		var oDate = oCalendarDateFormat.parse(sWorkday);
		var nUTCTimeOffset = oDate.getTimezoneOffset();
		var oDateLocalTime = new Date(oDate.getTime() - (nUTCTimeOffset*60*1000));

		//format date from calendar UI control for ODATA timesheet entity key
		var oBackendDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "yyyy-MM-ddThh:mm:ss"});
		var sBackendDate = oBackendDateFormat.format(oDateLocalTime, false);

		//set total hours text field property
		var oSAMModel = sap.ui.getCore().getModel();
		var sPath = "/TimesheetHeaderSet(Devresrc='Anonymous',Workday=datetime'" + sBackendDate + "')";
		oSAMModel.read(sPath, null, null, true, this.readTimesheetHeaderSuccessHandler, this.handleRequestFailed);
	
	},
	
	//receive successfully read timesheet header and reference in oCalendarDay variable
	readTimesheetHeaderSuccessHandler : function(oData){
		
		//keep track of read result for display in page footer
		oCalendarDayPage.timesheetHeader = oData;
		
		//Set total hours text
		oTotalHours.setText("Total: " + oCalendarDayPage.timesheetHeader.Doneeffrt + " Hrs ");
		
		//Total hours display visible after update
    	oTotalHours.setVisible(true);
		
	},
	
	//Show time entry helper dialog
	showTimeEntryDialog : function(oEvent){
		
		//Get binding context for slider element binding
		var oBindingContext = oEvent.oSource.getBindingContext();
		var sTimesheetItemPath = oBindingContext.sPath + "/Doneeffrt";
		
		//Create slider with 0.5 hour steps
		oTimeSlider = new sap.m.Slider({
			  min: 0,
			  max: 10,
			  value : { 
				  path: sTimesheetItemPath,
				  formatter: function(sValue) {
			          return parseFloat(sValue);
				  },
			  },
			  step: 0.5,
			  width: '100%',
			  change : this.updateTimesheetItem,
			  liveChange: this.setTimeEntryDialogTitle
			});
		
		//Keep track of path for which time is entered
		oTimeSlider.path = sTimesheetItemPath;
		
		//Create time entry dialog
		oTimeEntryDialog = new sap.m.Dialog({
			content : [oTimeSlider],
			stretch : false,
			leftButton: new sap.m.Button({
			    icon: "sap-icon://accept",
			    press: function () { sap.ui.controller("sammobile.CalendarDay").submitTimesheetItemUpdate(); }
			  }),
		});
		
		//set time entry dialog title to current slider value
		var oSAMModel = sap.ui.getCore().getModel();
		var sCurrentDoneEffort = oSAMModel.getProperty(oTimeSlider.path);
		oTimeEntryDialog.setTitle("Selected time is: " + sCurrentDoneEffort + " Hrs");
		
		//Open time entry dialog
		oTimeEntryDialog.open();
		
	},
	 
	//update timesheet item
	updateTimesheetItem : function(oEvent){
		
		//Set property change in application model
		var oSAMModel = sap.ui.getCore().getModel();
		sNewDoneEffort = oTimeSlider.getValue().toString();
		oSAMModel.setProperty(oTimeSlider.path, sNewDoneEffort );
		
	},
	
	//submit timesheet item updates
	submitTimesheetItemUpdate : function(oEvent){
		
		//no update required where no change made	
		var oSAMModel = sap.ui.getCore().getModel();		
		if(!oSAMModel.hasPendingChanges()){
			
			//Close time entry dialog
			oTimeEntryDialog.close();
			
			//no further processing
			return;
			
		};
		
		//send busy dialog
		sap.ui.controller("sammobile.App").getApp().setBusy(true);
		
		//close time entry dialog
    	oTimeEntryDialog.close();
		
		//Perform timesheet item update
		oSAMModel.submitChanges(sap.ui.controller("sammobile.CalendarDay").handleUpdateSuccess, 
								sap.ui.controller("sammobile.CalendarDay").handleUpdateError);
		
	},
	
	//handle update error for ODATA model 'submitChanges' call
	handleUpdateError : function(oError){
		
		//no longer busy
		sap.ui.controller("sammobile.App").getApp().setBusy(false);
		
		//issue message to screen
		sap.ui.controller("sammobile.App").showErrorMessage(oError);
		
	},
	
	//handle update success for ODATA model 'submitChanges' call
	handleUpdateSuccess : function(oData, response){
		
		//no longer busy
		sap.ui.controller("sammobile.App").getApp().setBusy(false);
		
    	//hide total hours display to prepare for refresh
		oTotalHours.setVisible(false);
		
		//refresh total hours text field property
		sap.ui.controller("sammobile.CalendarDay").refreshTotalsDisplay();
		
	},
	
	//failed to read total hours from backend
	handleRequestFailed : function(oError){
		
		//no longer busy
		sap.ui.controller("sammobile.App").getApp().setBusy(false);
		
		//issue message to screen
		sap.ui.controller("sammobile.App").showErrorMessage(oError);
		
	},
	
	setTimeEntryDialogTitle : function(){
	
		//set time entry dialog title to current slider value
		oTimeEntryDialog.setTitle("Selected time is now: " + oTimeSlider.getValue().toString() + " Hrs");
		
	}
});