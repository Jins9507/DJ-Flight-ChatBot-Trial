sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/m/MessageToast"    
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Filter, FilterOperator, MessageToast) {
        "use strict";

        return Controller.extend("chatbot.djchatbotai.controller.Main", {
            onInit: function () {
                this.getView().setModel(new JSONModel({}), "scheduleModel");
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("RouteMain").attachPatternMatched(this._onMainMatched, this);
            },

            _onMainMatched: function (){
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
                    // oPassenger = ofilterModel.getProperty("/Passenger"),
                    indexF = $.inArray(oLocationFrom, $.map(oDestination, function(n){
                        return n.AirportID
                    })),
                    resultF = ofilterModel.getProperty("/Destination/"+indexF),
                    indexT = $.inArray(oLocationTo, $.map(oDestination, function(n){
                        return n.AirportID
                    })),
                    resultT = ofilterModel.getProperty("/Destination/"+indexT);

                // if( oPassenger == 0 ){
                //     var msg = 'Please Check the Passenger';
                //     MessageToast.show(msg);
                //     return;
                // }

                var aFilter = [];

                aFilter.push(new Filter("AIRPFROM", FilterOperator.EQ, oLocationFrom));
                aFilter.push(new Filter("AIRPTO", FilterOperator.EQ, oLocationTo));

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
                            Passenger: ofilterModel.getData().DefaultP
                            // Passenger: oPassenger
                        }                
                    });
                }
            }

        });
    });
