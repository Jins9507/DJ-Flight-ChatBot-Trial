sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/m/MessageToast"    
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, ODataModel, JSONModel, Filter, FilterOperator, MessageToast) {
        "use strict";

        return Controller.extend("chatbot.djchatbotai.controller.Main", {
            onInit: function () {
                this.getView().setModel(new JSONModel({}), "scheduleModel");
                // this.getOwnerComponent().getModel().read('/ZC_TRAVEL_DJ_010', {
                this.getOwnerComponent().getModel().read('/ZC_FLIGHT_SCHD', {
                    success: function (oContent) {
                        this.getView().getModel("scheduleModel").setProperty("/", oContent);
                        console.log(oContent);
                    }.bind(this),
                    error: function (oError) {
                        console.log(oError);
                    }.bind(this)
                });
            },

            onSearchFilter: function(oEvent){
                // var oScheduleModel = this.getView().getModel("scheduleModel").getProperty("/").results,
                var ofilterModel = new JSONModel(this.getOwnerComponent().getModel("filterModel").getData()),
                    oDestination = ofilterModel.getProperty("/Destination"),
                    oLocationFrom = ofilterModel.getProperty("/LocationFrom"),
                    oLocationTo = ofilterModel.getProperty("/LocationTo"),
                    oPassenger = ofilterModel.getProperty("/Passenger"),
                    indexF = $.inArray(oLocationFrom, $.map(oDestination, function(n){
                        return n.AirportID
                    })),
                    resultF = ofilterModel.getProperty("/Destination/"+indexF),
                    indexT = $.inArray(oLocationTo, $.map(oDestination, function(n){
                        return n.AirportID
                    })),
                    resultT = ofilterModel.getProperty("/Destination/"+indexT);

                if( oPassenger == 0 ){
                    var msg = 'Please Check the Passenger';
                    MessageToast.show(msg);
                    return;
                }

                var aFilter = [];

                aFilter.push(new Filter("AIRPFROM", FilterOperator.EQ, oLocationFrom));
                aFilter.push(new Filter("AIRPTO", FilterOperator.EQ, oLocationTo));
                // aFilter.push(new Filter({
                //     filters: [
                //         // new Filter({
                //         //     path: 'seatocc',
                //         //     operator: FilterOperator.GE,
                //         //     value1: 200
                //         //     }),
                //         // new Filter({
                //         //     path: 'seatocc_b',
                //         //     operator: FilterOperator.GE,
                //         //     value1: oPassenger
                //         //     }),
                //         // new Filter({
                //         //     path: 'seatocc_f',
                //         //     operator: FilterOperator.GE,
                //         //     value1: oPassenger
                //         //     })   
                //     //   new Filter("seatocc", FilterOperator.GE, parseInt(oPassenger)),
                //     //   new Filter("seatocc_b", FilterOperator.GE, parseInt(oPassenger)),
                //     //   new Filter("seatocc_f", FilterOperator.GE, parseInt(oPassenger))
                //     ],
                //     and: false // true = AND, false = OR
                //   }));

                var oList= this.byId("validationTable"); 
                var oBinding = oList.getBinding("rows"); 
                oBinding.filter(aFilter);    

                if( oBinding.iLength <= 0 ){
                    var msg = 'There are no flights matching the conditions.';
                    MessageToast.show(msg);
                }else{
                    this.getOwnerComponent().getRouter().navTo("CheckFlight", {                
                        "?query": {
                            locationFrom: oLocationFrom,
                            locationFromName: resultF.Country,
                            locationTo: oLocationTo,
                            locationToName: resultT.Country,
                            Passenger: oPassenger
                        }                
                    });
                }
            }

        });
    });
