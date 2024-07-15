sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/Dialog",      
    "sap/m/Input"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, ODataModel, JSONModel, Filter, FilterOperator, MessageBox, Fragment, MessageToast, Dialog, Input) {
        "use strict";
        var dupFlag = false;
        return Controller.extend("chatbot.djchatbotai.controller.CheckFlight", {
            onInit: function () {
                this.getView().setModel(new JSONModel({}), "scheduleModel");
                this.getView().setModel(new JSONModel({}), "routerModel");
                this.getOwnerComponent().getRouter().getRoute("CheckFlight").attachMatched(this._onRouteMatched, this);
            },

            _onRouteMatched: function(oEvent){
                var oArgs = oEvent.getParameter("arguments"),
                    oView = this.getView(),
                    oRouterModel = oView.getModel("routerModel");
                
                if (!oArgs["?query"]) return;
                if (oArgs['?query']) {
                    oRouterModel.setProperty("/LocationFrom", oArgs['?query'].locationFrom);
                    oRouterModel.setProperty("/LocationFromName", oArgs['?query'].locationFromName);
                    oRouterModel.setProperty("/LocationTo", oArgs['?query'].locationTo);
                    oRouterModel.setProperty("/LocationToName", oArgs['?query'].locationToName);
                    oRouterModel.setProperty("/Passenger", oArgs['?query'].Passenger);
                }
                
                this._getSchedule();
                this._getUser();
                this._getReservation();
                this._getPassenger();
                
                // aFilter.push(new Filter("AIRPFROM", FilterOperator.EQ, oRouterModel.getProperty("/LocationFrom")));
                // aFilter.push(new Filter("AIRPTO", FilterOperator.EQ, oRouterModel.getProperty("/LocationTo")));
                // var aFilter = [];
                // var oTable = this.getView().byId("schduleTable");
                // var oBinding = oTable.getBinding("rows");
                // oBinding.filter(aFilter);    
                // this.getView().getModel("scheduleModel").setProperty("/tableL", oBinding.iLength); 
                // this.getOwnerComponent().getModel("filterModel").setProperty("/tableL", oBinding.iLength);

                this.getOwnerComponent().getModel("filterModel").setProperty("/LocationFrom", oRouterModel.getProperty("/LocationFrom"));
                this.getOwnerComponent().getModel("filterModel").setProperty("/LocationTo", oRouterModel.getProperty("/LocationTo"));
                // Validation 메세지 초기화
                sap.ui.getCore().getMessageManager().removeAllMessages();
            },

            _getSchedule : function() {
                var dfd = $.Deferred(),
                    aFilter = [],
                    oRouterModel = this.getView().getModel("routerModel");

                var oTable = this.getView().byId("schduleTable"),
                    oBinding = oTable.getBinding("rows");

                aFilter.push(new Filter("AIRPFROM", FilterOperator.EQ, oRouterModel.getProperty("/LocationFrom")));
                aFilter.push(new Filter("AIRPTO", FilterOperator.EQ, oRouterModel.getProperty("/LocationTo")));                

                this.getOwnerComponent().getModel().read('/ZC_FLIGHT_SCHD', {
                    success: function (oContent) {
                        oBinding.filter(aFilter);    
                        this.getView().getModel("scheduleModel").setProperty("/", oContent);
                        this.getView().getModel("scheduleModel").setProperty("/tableL", oBinding.iLength);
                        dfd.resolve(oContent); 
                        console.log(oContent);
                    }.bind(this),
                    error: function (oError) {
                        dfd.reject(oError);
                        console.log(oError);
                    }.bind(this)
                });

                return dfd.promise();
            },

            _getUser : function() {
                var dfd = $.Deferred();

                this.getOwnerComponent().getModel().read('/ZC_USER_INFO', {
                    filters : [ new Filter("USERID", FilterOperator.EQ, 'M000003') ],
                    success: function (oContent) {
                        dfd.resolve(oContent); 
                        // this.getOwnerComponent().getModel("userModel").setData(oContent[results][0]); // results가 없을시 생성, 트리구조에서 좋음
                        // this.getOwnerComponent().getModel("userModel").setProperty("/", oContent?.results[0]); // ? 을 붙이면 undefine이어도 에러가 뜨지 않는다
                        this.getOwnerComponent().getModel("userModel").setData(oContent?.results[0]);
                        console.log(oContent);
                    }.bind(this),
                    error: function (oError) {
                        dfd.reject(oError);
                        console.log(oError);
                    }.bind(this)
                });

                return dfd.promise();
            },

            _getReservation : function() {
                var dfd = $.Deferred();

                this.getOwnerComponent().getModel().read('/ZC_RESERVATION', {
                    filters : [ new Filter("USERID", FilterOperator.EQ, 'M000003') ],
                    success: function (oContent) {
                        this.getOwnerComponent().getModel("reservationModel").setData(oContent?.results);
                        dfd.resolve(oContent); 
                        console.log(oContent);
                    }.bind(this),
                    error: function (oError) {
                        dfd.reject(oError);
                        console.log(oError);
                    }.bind(this)
                });

                return dfd.promise();
            },

            _getPassenger : function() {
                var dfd = $.Deferred();

                this.getOwnerComponent().getModel().read('/ZC_PASSENGER', {
                    success: function (oContent) {
                        this.getOwnerComponent().getModel("passengerModel").setData(oContent?.results);
                        dfd.resolve(oContent); 
                        console.log(oContent);
                    }.bind(this),
                    error: function (oError) {
                        dfd.reject(oError);
                        console.log(oError);
                    }.bind(this)
                });

                return dfd.promise();
            },

            formatDate: function(oDate) {
                var sReturnValue = "";
                var vMonth, vDay;

                if (oDate) {
                    if (oDate.getMonth()+1<10){
                        vMonth = "0"+(oDate.getMonth()+1);
                    }else{
                        vMonth = oDate.getMonth()+1;
                    }

                    if (oDate.getDate()<10){
                        vDay = "0"+oDate.getDate();
                    }else{
                        vDay = oDate.getDate();
                    }

                   sReturnValue = oDate.getFullYear() + "-" + vMonth + "-" + vDay;
                }
                return sReturnValue;
            },

            formatTime: function(oTime) {
                var sReturnValue = "";
                if (oTime) {
                //    sReturnValue = oTime.slice(0, 2) + ":" + oTime.slice(2, 4);
                }
                return sReturnValue;
            },    

            onPressOpenPopover: function (oEvent) {
                var oView = this.getView(),
                    oSourceControl = oEvent.getSource();
    
                if (!this._pPopover) {
                    this._pPopover = Fragment.load({
                        id: oView.getId(),
                        name: "chatbot.djchatbotai.view.Card" // manifest의 Routing viewPath 를 참고
                    }).then(function (oPopover) {
                        oView.addDependent(oPopover);
                        return oPopover;
                    });
                }
    
                this._pPopover.then(function (oPopover) {
                    oPopover.openBy(oSourceControl);
                });
            },

            onNavigationBackPress: function(oEvent){
                var oConfirm = MessageBox.confirm("Would you like to go to the Main screen?", {
                    title: "Confirm",                                    // default                                      // default
                    actions: [ sap.m.MessageBox.Action.OK,
                               sap.m.MessageBox.Action.CANCEL ],         // default
                    emphasizedAction: sap.m.MessageBox.Action.OK,        // default
                    onClose: function(sAction) {
                        if(sAction == "OK")
                          this.getOwnerComponent().getRouter().navTo("RouteMain");
                    }.bind(this), 
                });
            },
            
            onDialogPress: function(oEvent){
                var oView = this.getView();

                if (!this.oReserveDialog) {
                    this.oReserveDialog = Fragment.load({
                        id: oView.getId(),
                        name: "chatbot.djchatbotai.view.ReserveDialog",
                        controller: this
                    }).then(function (oDialog){
                        oDialog.setModel(oView.getModel());
                        return oDialog;
                    });
                }

                this.oReserveDialog.then(function(oDialog){
                    oDialog.open();
                }.bind(this));                
            },

            onDialogSearch: function(){
                var vReservationNumber = this.getView().byId("reserveInput").getProperty("value").toUpperCase();
                var vPassword = this.getView().byId("passwordInput").getProperty("value").toUpperCase();
                var resultR;

                var oReserveTable = this.getOwnerComponent().getModel("reservationModel");
                var indexR = $.inArray(vReservationNumber, $.map(oReserveTable.getProperty("/"), function(n){
                    return n.RESERVEID
                }));

                this.getView().byId("reserveInput").setValue("");
                this.getView().byId("passwordInput").setValue("");

                if(indexR !== -1){
                    resultR = oReserveTable.getProperty("/"+indexR);
                    if(resultR.PASSWORD === vPassword){
                        switch (resultR.STATUSFLAG) {
                            case "S":
                                MessageToast.show("The reservation has already been completed.");                                 
                                break;
                            case "C":
                                MessageToast.show("The reservation has already been canceled.");                                 
                                break;
                            case "P":
                            case "N":
                                this.getOwnerComponent().getRouter().navTo("ReviewReservation", {                
                                    "?query": {
                                        reserveID   : vReservationNumber
                                    }                
                                });                                    
                                break;
                        }
                        return;
                    }
                }         
                MessageToast.show("Please confirm your password or reservation number.");           
            },

            onDialogClose: function(oEvent){
                // oEvent.getSource().destroy();
                this.getView().byId("reserveInput").setValue("");
                this.getView().byId("passwordInput").setValue("");
                oEvent.getSource().getParent().close();
            },

            onFilterSearch: function(oEvent){
                var ofilterModel = this.getOwnerComponent().getModel("filterModel");
                var aFilter = [];
                var oTable = this.getView().byId("schduleTable");

                var oDestination = ofilterModel.getProperty("/Destination"),
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

                aFilter.push(new Filter("AIRPFROM", FilterOperator.EQ, oLocationFrom));
                aFilter.push(new Filter("AIRPTO", FilterOperator.EQ, oLocationTo));
                var oBinding = oTable.getBinding("rows");
                oBinding.filter(aFilter);   

                this.getView().getModel("scheduleModel").setProperty("/tableL", oBinding.iLength); 
                this.getView().getModel("routerModel").setProperty("/LocationFromName", resultF.Country); 
                this.getView().getModel("routerModel").setProperty("/LocationToName", resultT.Country); 
                this.getView().getModel("routerModel").setProperty("/Passenger", ofilterModel.getData().DefaultP); 
                // this.getView().getModel("routerModel").setProperty("/Passenger", oPassenger); 

            },

            onCellClick: function(oEvent) {
                var oRecord = oEvent.getParameter('row'),
                    oData = this.getView().getModel('scheduleModel').getProperty(oRecord.oBindingContexts.scheduleModel.sPath),
                    oRouterModel = this.getView().getModel("routerModel");
                dupFlag = false;
                this.checkReserve(oData.FLDATE);
                var path_num = oRecord.oBindingContexts.scheduleModel.sPath.split("/")[2];     

                if(dupFlag){
                    var oConfirm = MessageBox.confirm("A reservation already exists for that date. Do you want to proceed?", {
                        title: "Confirm",                                    // default                                      // default
                        actions: [ sap.m.MessageBox.Action.OK,
                                   sap.m.MessageBox.Action.CANCEL ],         // default
                        emphasizedAction: sap.m.MessageBox.Action.OK,        // default
                        onClose: function(sAction) {
                            if(sAction == "OK")
                                this.getOwnerComponent().getRouter().navTo("Reservation", {                
                                    "?query": {
                                        sPath           : path_num,
                                        FlightId        : oData.FLIGHTID,
                                        LocationFrom    : oData.AIRPFROM,
                                        LocationFromName: oData.CITYFROM,
                                        LocationTo      : oData.AIRPTO,
                                        LocationToName  : oData.CITYTO,
                                        Passenger       : oRouterModel.getProperty("/Passenger")
                                    }                
                            });    
                        }.bind(this), 
                    });       
                }else{
                    this.getOwnerComponent().getRouter().navTo("Reservation", {                
                        "?query": {
                            sPath           : path_num,
                            FlightId        : oData.FLIGHTID,
                            LocationFrom    : oData.AIRPFROM,
                            LocationFromName: oData.CITYFROM,
                            LocationTo      : oData.AIRPTO,
                            LocationToName  : oData.CITYTO,
                            Passenger       : oRouterModel.getProperty("/Passenger")
                        }                
                    });                    
                }
            },

            checkReserve: function(sDate){
                // DB 예약 테이블 조회하여 동일 항공편 예약 이력이 있는지 확인
                var resultR;
                var oReserveModel = this.getOwnerComponent().getModel("reservationModel");
                var resv = [];
                var indexR = null;
                var _bCheck = false;
                oReserveModel.getProperty("/").forEach((item, index) => {
                    var _sDate = new Date(sDate).toString();
                    if(new Date(item?.FLDATE).toString() == _sDate){
                        _bCheck = true;
                        resv.push(index);
                        indexR = index;
                    } 
                })

                if(!_bCheck) return;
                resv.forEach((idx, n) => {
                    resultR = oReserveModel.getProperty("/"+idx);
                    if(resultR.STATUSFLAG === "N" || resultR.STATUSFLAG === "P"){
                        console.log(idx);
                        dupFlag = true;
                        return;
                    }
                })
            }

        });
    });
