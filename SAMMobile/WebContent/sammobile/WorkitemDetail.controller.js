var oDetailList;
var oBindingContext;

sap.ui.controller("sammobile.WorkitemDetail", {
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf sammobile.WorkitemDetail
*/
	onInit: function() {

	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf sammobile.WorkitemDetail
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf sammobile.WorkitemDetail
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf sammobile.WorkitemDetail
*/
	onExit: function() {

	},
	
	//Create workitem detail page content
	createWorkitemDetailContent : function(){
		
		//create list control
		oDetailList = new sap.m.List({inset : false, width: "100%", footerText : "My workitem progress feedback"}); 
		
		//work request ID
		oDetailList.addItem(new sap.m.StandardListItem({title: "Work request ID", description: "{Wrkreqid}"})); 
		
		//work request title 
		oDetailList.addItem(new sap.m.StandardListItem({title: "Work request description", description: "{Workitem_Wrkreq/Reqtitl}"})); 
		
		//open effort estimate
		oDetailList.addItem(new sap.m.InputListItem({
			label: "Open effort?",
			content: new sap.m.VBox({
					 items : new sap.m.Input({
						id : "OpenEffortEstimateInput",
						type: sap.m.InputType.Number,
						liveChange : [this.setWorkitemProperty, this],
						value : { path: "Openeffrt" }
					}),	
					alignItems : sap.m.FlexJustifyContent.End
			})}));
		
		//Create UI control for revised estimated completion date
		var oDateTimeInput = new sap.m.DateTimeInput("RevedatcomInput",{
			id : "RevedatcomDateInput",
			placeholder: "Enter a date",
			valueFormat: "dd/MM/YYYY",
			displayFormat : "d MMM, y",
			change : [this.setWorkitemProperty, this],
			type: sap.m.DateTimeInputType.Date
		});
		
		//...and add revised DateTimeInput control to the list
		oDetailList.addItem(new sap.m.InputListItem({
			label: "Completion date?",
			content: new sap.m.VBox({
				items : oDateTimeInput,
				alignItems : sap.m.FlexJustifyContent.End
			})
		}));
		
		//development completion indicator 
		oDetailList.addItem(new sap.m.InputListItem({
			label : "Completed?",
			content: new sap.m.VBox({
				items : new sap.m.CheckBox({
					id : "DevcompindCheckbox",
					textDirection : "RTL",
					select : [this.setWorkitemProperty, this],
					selected : { path: "Devcompind",
						         formatter : function(sValue) {
						 			if(sValue == "X"){
										return true;
									}else{
										return false;
									} 
						 		  }
								}
				}),
				alignItems : sap.m.FlexJustifyContent.End
				}),
			}));
		
		//work request scheduled estimated completion date
		var oDateTimeFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern : "d MMM, y"});
		oDetailList.addItem(new sap.m.StandardListItem({
			title: "Scheduled completion date", 
			description: { path: "Workitem_Wrkreq/Edatcom",
				formatter : function(sValue) {
					if(sValue !== null && sValue !== undefined){
						return oDateTimeFormat.format(sValue);
					}else{
						return "Not scheduled";
					}
				}
			}

		})); 
		
		//Effort estimate 
		oDetailList.addItem(new sap.m.StandardListItem({title: "Planned implementation time", 
			description: {path : "Workitem_Wrkreq/Effestim",
				formatter: function(sValue) {
					return sValue + " hours";
				}
			}})); 

		//Done effort  
		oDetailList.addItem(new sap.m.StandardListItem({title: "Actual implementation time", 
			description: {path : "Workitem_Wrkreq/Doneeffrt",
				formatter: function(sValue) {
					return sValue + " hours";
				}
			}})); 
		
		//keep track of detailList object reference
		this.detailList = oDetailList;
		this.detailList.revedatcomInput = oDateTimeInput;
		
		//return to caller
		return oDetailList;
		
	},
	
	//Target hook for event based navigation
	onBeforeShow : function(oEvent) {
		
		//For formatting of estimated completion date
		var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "yyyymmdd"}); 
		
		//get binding context currently set for this controller's view
		this.getView().setBindingContext(oEvent.data.data.context);
		var oSAMModel = sap.ui.getCore().getModel();
		
		//Bind dateValue control property to revised estimated completion date model property where applicable
		if(oSAMModel.getProperty(oEvent.data.data.context.sPath + "/Revedatcom") !== null){
			
		//Bind dateValue control property for revised estimated completion date
			this.detailList.revedatcomInput.bindProperty("dateValue", 
					{ path: "Revedatcom",
					  formatter : function(sDate){
						  var oJSDate = new Date(sDate);
						  return oJSDate;
					  }
					}
			);
		}
		
		//Bind dateValue control property to estimated completion date 
		else{
			
			//Bind dateValue control property for revised estimated completion date
			this.detailList.revedatcomInput.bindProperty("dateValue", 
					{ path: "Workitem_Wrkreq/Edatcom",
					  formatter : function(sDate){
						  var oJSDate = new Date(sDate);
						  return oJSDate;
					  }
					}
			);			
			
		};
		
		//set context for relative paths provided in detailList
		this.detailList.bindElement(oEvent.data.data.context.sPath, {expand: "Workitem_Wrkreq"});
		
		//keep track of binding path
		this.ODATAPath = oEvent.data.data.context.sPath;
		
    },
	
    //back navigation triggered
	backTriggered: function() {
        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "back");
	}, 

	//set workitem property
	setWorkitemProperty : function(oEvent){
		
		//Identify control that is triggering this update
		var sTriggerControl = oEvent.getParameter("id");
		
		//Input field for open effort estimate
		if(sTriggerControl == "OpenEffortEstimateInput"){

			//get open effort input value
			var oOpeneffrtInput = oEvent.getSource();
			var oPropertyValue = oOpeneffrtInput.getValue();
			var oPropertyName = "Openeffrt";			
			
		};	
		
		//Check box for development completion selected/ unselected
		if(sTriggerControl == "DevcompindCheckbox"){

			//get check box status
			oPropertyValue = oEvent.getParameter("selected");
			
			//map true/false to abap_boolean
			oPropertyName = "Devcompind";
			if(oPropertyValue == true){
				oPropertyValue = "X";
			} else {
				oPropertyValue = " ";
			};
			
		};
		
		//Date input control for revised estimated completion date
		if(sTriggerControl == "RevedatcomInput"){

			//get datevalue in dateinput control
			var oDateInputListItem = oEvent.getSource();
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "dd/MM/yyyy"}); 
			var oDate = oDateFormat.parse(oDateInputListItem.getValue()); 
			var nUTCTimeOffset = oDate.getTimezoneOffset();
			var oDateLocalTime = new Date(oDate.getTime() - (nUTCTimeOffset*60*1000));
			oPropertyValue = oDateLocalTime;
			oPropertyName = "Revedatcom";
			
		};
		
		//Set workitem property
		var oSAMModel = sap.ui.getCore().getModel();
		
		//Determine property path
		oBindingContext = this.getView().getBindingContext();
		var oPropertyPath = oBindingContext + "/" + oPropertyName;
			
		//Keep track of property change
		oSAMModel.setProperty(oPropertyPath, oPropertyValue, oBindingContext);
		
	},

	//submit workitem changes
	submitWorkitemChanges : function(oEvent){
		
		//Get model
		var oSAMModel = sap.ui.getCore().getModel();
		
		//nothing to do where no changes made
		if(!oSAMModel.hasPendingChanges()){
			sap.m.MessageToast.show("You have not made changes");
			return;
		};
		
		//Set application to busy
		sap.ui.controller("sammobile.App").getApp().setBusy(true);
		
		//Perform workitem update
		oSAMModel.submitChanges(this.handleUpdateSuccess, this.handleUpdateError);

	},
	
	//handle update error
	getODATAPath : function(){
		return this.ODATAPath;
	},
	
	//handle update error for ODATA model 'submitChanges' call
	handleUpdateError : function(oError){
		
		//Refresh model to update bindings
		var oSAMModel = sap.ui.getCore().getModel();
		oSAMModel.resetChanges();
		oSAMModel.refresh();
		
		//Set detail list to no longer busy
		sap.ui.controller("sammobile.App").getApp().setBusy(false);
		
		//issue message to screen
		sap.ui.controller("sammobile.App").showErrorMessage(oError);
		
	},
	
	//handle update success for ODATA model 'submitChanges' call
	handleUpdateSuccess : function(oData, response){
		
		//Set detail list to no longer busy
		sap.ui.controller("sammobile.App").getApp().setBusy(false);
		
	},
	
});