var oCalendar;
var calendarTotalHours;
var calendarConfirmTime;

sap.ui.controller("sammobile.Calendar", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf sammobile.Calendar
*/
	onInit: function() {
		
		//refresh calendar display
		this.refreshCalenderDisplay();
		
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf sammobile.Calendar
*/
	onBeforeRendering: function() {

	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf sammobile.Calendar
*/
	onAfterRendering: function() {

	},

	//create calendar content
	createCalendarContent : function(){
		
		//require Calendar js
    	jQuery.sap.require("sap.me.Calendar");
    	
    	//create new calendar control
		oCalendar = new sap.me.Calendar({
			monthsPerRow : 0, 
			weeksPerRow : 1, 
			monthsToDisplay : 1, 
			swipeToNavigate : true,
			currentDate : new Date().toString(), 
			enableMultiselection : false, 
			firstDayOffset : 0, 
			swipeToNavigate : true,
			design : sap.me.CalendarDesign.Approval, 
			tooltip : "Tap a day to log time",
			width : "100%", 
			
			//Tap on date in calendar to navigate 
			tapOnDate : [ function(oEvent) {
				oCalendar = oEvent.getSource();
				sSelectedDay = oEvent.getParameters().date;
				var bus = sap.ui.getCore().getEventBus();
				bus.publish("nav", "to", {
					id : "CalendarDay",
					data : { context :  sSelectedDay  }
				});
			}, this ],
			
			//Change month currently displayed
			changeCurrentDate : [ function(oEvent) {
				this.refreshCalenderDisplay();				
			}, this ]

		});
		
		//create calendar legend
		var oCalendarLegend = new sap.me.CalendarLegend({
			legendForType07 : "<plan",
			legendForType01 : "=plan",  
			legendForType06 : ">plan",
			design : sap.me.CalendarDesign.Approval, 
		});
		
		//create time confirmation button
		calendarConfirmTime = new sap.m.Button({text: "Confirm", press: [this.requestSubmitConfirmation, this]});
		
		//create total hours text field
		calendarTotalHours = new sap.m.Text({ text: "Hrs " });
		
		//put calendar and legend in vertical box
		var oCalendarVBox = new sap.m.VBox({items: [
		          oCalendar,
		          oCalendarLegend, 
		          this.select]});
		
		//build calendar page
 		var oCalendarPage = new sap.m.Page({
			title: "SAM Mobile: Time sheet",
			showNavButton : true,
			navButtonType : sap.m.ButtonType.Back,
			navButtonTap : function(){
				var bus = sap.ui.getCore().getEventBus();
				bus.publish("nav", "back"); 
			},
			content: oCalendarVBox
		});
 		
		//Footer bar to submit changes
		var oCalendarFooterBar = new sap.m.Bar({
			translucent : false, 
			contentLeft: [ calendarConfirmTime ],
			contentRight: [ calendarTotalHours ],
		});
 
 		oCalendarPage.setFooter(oCalendarFooterBar);
 		
 		//subscribe to back navigation from calendar day page to refresh calendar
		var bus = sap.ui.getCore().getEventBus();
		bus.subscribe("nav", "backFromCalendarDay", this.refreshCalenderDisplay, this);
		
		//return to caller
		return oCalendarPage;
		
	},
	
	//Get timesheet headers for selected month
	getTimesheetHeaders : function(sCurrentDate){
		
		//set calendar month date range for timesheet header filter
		var oDate = new Date(sCurrentDate);
		var nUTCTimeOffset = oDate.getTimezoneOffset();
		var y = oDate.getFullYear(), m = oDate.getMonth();
		var firstDayOfMonth = new Date(y, m, 1);
		var firstDayOfMonthLocalTime = new Date(firstDayOfMonth.getTime() - (nUTCTimeOffset*60*1000));
		var lastDayOfMonth = new Date(y, m + 1, 0);
		var lastDayOfMonthLocalTime = new Date(lastDayOfMonth.getTime() - (nUTCTimeOffset*60*1000));
		
		//build ODATA path for reading timesheet headers from backend
		var oBackendDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "yyyy-MM-ddThh:mm:ss"}); 
		var oBackendFirstDayOfMonth = oBackendDateFormat.format(firstDayOfMonthLocalTime); 
		var oBackendLastDayOfMonth = oBackendDateFormat.format(lastDayOfMonthLocalTime); 
		var sPath = "/TimesheetHeaderSet?$filter=(Workday ge datetime'" + oBackendFirstDayOfMonth + "' and Workday le datetime'" + oBackendLastDayOfMonth + "')";
		
		//read timesheet headers from backend
		var oSAMModel = sap.ui.getCore().getModel();
		oSAMModel.read(sPath, null, null, true, this.readTimesheetHeaderSuccessHandler, sap.ui.controller("sammobile.App").handleRequestFailed);
		
		//indicate that request was sent
		sap.ui.controller("sammobile.App").openBusyDialog();
		
	},
	
	//get calendar date format
	colourcodeCalendarDays : function(oCalendar){
		
		//Get calendar date format for date format conversion
		var oCalendarDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "EEE MMM d yyyy"});

		//toggle each calendar day to the appropriate calendar day even type
		for (var i=0;i<oCalendar.timesheetHeaders.length;i++)
		{ 
			//remove all previous event types
			oCalendar.toggleDatesType([oCalendarDateFormat.format(oCalendar.timesheetHeaders[i].Workday)], sap.me.CalendarEventType.Type00, false);
			oCalendar.toggleDatesType([oCalendarDateFormat.format(oCalendar.timesheetHeaders[i].Workday)], sap.me.CalendarEventType.Type01, false);
			oCalendar.toggleDatesType([oCalendarDateFormat.format(oCalendar.timesheetHeaders[i].Workday)], sap.me.CalendarEventType.Type04, false);
			oCalendar.toggleDatesType([oCalendarDateFormat.format(oCalendar.timesheetHeaders[i].Workday)], sap.me.CalendarEventType.Type06, false);
			oCalendar.toggleDatesType([oCalendarDateFormat.format(oCalendar.timesheetHeaders[i].Workday)], sap.me.CalendarEventType.Type07, false); 

			//set calendar day event type depending on degree of reaching time plan
			switch(oCalendar.timesheetHeaders[i].Planfulfil){
			case "Under":
				oCalendar.toggleDatesType([oCalendarDateFormat.format(oCalendar.timesheetHeaders[i].Workday)], sap.me.CalendarEventType.Type07, true); break;
			case "Reached": 
				oCalendar.toggleDatesType([oCalendarDateFormat.format(oCalendar.timesheetHeaders[i].Workday)], sap.me.CalendarEventType.Type01, true); break;
			case "Over": 
				oCalendar.toggleDatesType([oCalendarDateFormat.format(oCalendar.timesheetHeaders[i].Workday)], sap.me.CalendarEventType.Type06, true); break;
			};

		};

	},
	
	//refresh calendar display (e.g. when returning from calendar day view)
	refreshCalenderDisplay : function(){
		
		//get timesheet headers, success handler will colour code calendar days
		this.getTimesheetHeaders(oCalendar.getCurrentDate());	
		
	},
	
	//receive successfully read timesheet headers and reference in oCalendar variable
	readTimesheetHeaderSuccessHandler : function(oData){
		
		//keep track of read result for perusal in 'after rendering' event handler
		oCalendar.timesheetHeaders = oData.results;
		
		//calculate total hours for the month and overall status of confirmation
		var TotalHours = 0.0, bConfirmed = true;
		for (var i=0;i<oCalendar.timesheetHeaders.length;i++){ 
			TotalHours = TotalHours + parseFloat(oCalendar.timesheetHeaders[i].Doneeffrt); 
			if(oCalendar.timesheetHeaders[i].Confrmstatus == 'UnConfirmd' ||
			   oCalendar.timesheetHeaders[i].Confrmstatus == ''){
				bConfirmed = false;
			}; 
		};
		
		//update total hours text field
		calendarTotalHours.setText("Total: " + TotalHours + " Hrs ");
		
		//update confirmation button text and enabled status
		if(bConfirmed == true){
			calendarConfirmTime.setText("Confirmed");
			calendarConfirmTime.setEnabled(false);
		}else{
			calendarConfirmTime.setText("Confirm");
			calendarConfirmTime.setEnabled(true);
		};
		
		//colourcode calendar days depending on read result
		sap.ui.controller("sammobile.Calendar").colourcodeCalendarDays(oCalendar);
		
		//indicate that request was completed
		sap.ui.controller("sammobile.App").closeBusyDialog();
		
	},
	
	//confirm to submit time confirmation
	requestSubmitConfirmation : function(){
		
		//keep track of this as dialog event listener
		var oDialogListener = this;

		//create new dialog
		var oConfirmationDialog = 
			new sap.m.Dialog({
			title: "Confirmation dialog",
			content: [new sap.m.Text({
						text: "You chose to confirm time for this period. Do you want to proceed?"
						})], 
			leftButton: new sap.m.Button({
							text: "Cancel", 
							type: "Reject", 
							tap: function(oDialogEvent){
								
								//close dialog
								oConfirmationDialog.close();
								
							}
						}),
			rightButton: new sap.m.Button({
							text: "Ok", 
							type: "Accept", 
							tap: function(oDialogEvent){
								
								//start busy dialog
								sap.ui.controller("sammobile.App").openBusyDialog();
								
								//close dialog
								oConfirmationDialog.close();
								
							}								
						}),
						
			afterClose: function(oDialogEvent){
				
						//in case confirmation was accepted
						if(oDialogEvent.mParameters.origin.mProperties.type == "Accept"){
					
							//submit time confirmation in batch
							oDialogListener.submitConfirmTimeBatchOperation(oDialogListener, oDialogEvent);
				
						}
				}

		});
		
		//send dialog and return
		oConfirmationDialog.open();
		
	},
	
	//submit time confirmation batch operation
	submitConfirmTimeBatchOperation : function(oDialogListener, oDialogEvent){
		
		//Get model and service root
		var oSAMModel = sap.ui.getCore().getModel();
		var sRoot = oSAMModel.serviceUrl;
		
		//create one batch operation per timesheet header to be confirmed
		for (var i=0;i<oCalendar.timesheetHeaders.length;i++){ 

			//Set property value
			var oData = {};
			var oPropertyValue = "Confirmed";
			oData.Confrmstatus = oPropertyValue;
			
			//Determine property path
			var sFullPath = oCalendar.timesheetHeaders[i].__metadata.uri;
			var sResourcePath = sFullPath.match(/(?=\/TimesheetHeaderSet)([^])*?$/);
			
			//Create batch operation
			var oBatchChangeOperation = oSAMModel.createBatchOperation(sResourcePath[0], "PUT", oData);
			
			//add batch operation
			oSAMModel.addBatchChangeOperations([oBatchChangeOperation]);
			
			//keep track of the fact that batches are pending submission
			oSAMModel.hasPendingBatches = true;
			
		};
		
		//nothing to do where no changes made
		if(oSAMModel.hasPendingBatches !== true){
			sap.m.MessageToast.show("You have not made changes");
			return;
		};
		
		//Open busy dialog
		sap.ui.controller("sammobile.App").openBusyDialog();
		
		//Perform timesheet header (and item) update asynchronously
		oSAMModel.submitBatch(sap.ui.controller("sammobile.Calendar").handleBatchConfirmationSuccess, sap.ui.controller("sammobile.App").handleBatchUpdateError, true);
		
	},
	
	//handle batch confirmation success for ODATA model 'submitBatch' call
	handleBatchConfirmationSuccess : function(oData, oResponse, aErrorResponses){
		
		//indicate model has no more batches pending
		var oSAMModel = sap.ui.getCore().getModel();
		oSAMModel.hasPendingBatches = false;
		
		//Close busy dialog
		sap.ui.controller("sammobile.App").closeBusyDialog();
		
		//at least one batch gave errors, issue first error
		if(aErrorResponses.length > 0){
			try{
				
				//issue message where response body contains valid JSON
				var processingLog = jQuery.parseJSON(aErrorResponses[0].response.body);
				sap.m.MessageToast.show(processingLog.error.message.value);
			}
			catch(err){
				
				//issue error message where response body is not JSON
				sap.m.MessageToast.show(aErrorResponses[0].response.body);
				
			};
		};
		
		//get timesheet headers and compute new confirmation status
		sap.ui.controller("sammobile.Calendar").refreshCalenderDisplay();
		
	}

});