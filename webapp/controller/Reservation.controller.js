sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
    "sap/base/util/uid",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/model/xml/XMLModel",
    "sap/m/MessageToast",
    // "axios",
    // "qs"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, ODataModel, JSONModel, MessageBox, Fragment, uid, Filter, FilterOperator, Sorter, XMLModel, MessageToast
        // , axios, qs
    ) {
        "use strict";
        var history = {
            prevPaymentSelect: null
        };
        var today;
        return Controller.extend("chatbot.djchatbotai.controller.Reservation", {
            onInit: function () {
                this._wizard = this.byId("ShoppingCartWizard");
                this._oNavContainer = this.byId("navContainer");
                this._oDynamicPage = this.getPage();
                this.getView().setModel(new JSONModel({}), "flightModel");
                this.getView().setModel(new JSONModel({}), "routerModel");
                this.getView().setModel(new JSONModel({
                    selectedKey: "Male", 
                    selectItems: [
                        {"itemKey": "M", "itemText": "Male"},
                        {"itemKey": "F", "itemText": "Female"}]
                }), "genderCombo"); 
                this.getView().setModel(new JSONModel({
                    selectedKey: "Male", 
                    selectItems: [
                        {"itemKey": "M", "itemText": "Male"},
                        {"itemKey": "F", "itemText": "Female"}]
                }), "genderCombo2"); 
                this.getView().setModel(new JSONModel({
                    selectedKey: "Male", 
                    selectItems: [
                        {"itemKey": "M", "itemText": "Male"},
                        {"itemKey": "F", "itemText": "Female"}]
                }), "genderCombo3"); 
                this.getView().setModel(new JSONModel({
                    selectedKey: "Male", 
                    selectItems: [
                        {"itemKey": "M", "itemText": "Male"},
                        {"itemKey": "F", "itemText": "Female"}]
                }), "genderCombo4"); 
                this.getView().setModel(new JSONModel({}), "reserveModel");      
                this.getView().setModel(new JSONModel({}), "totalModel");      


                this.getView().setModel(new JSONModel({}), "reservationInfoModel");            //////       
                this.getView().setModel(new JSONModel({}), "passengerInfoModel");            //////       
                
                this.getOwnerComponent().getRouter().getRoute("Reservation").attachMatched(this._onRouteMatched, this);
            },

            _onRouteMatched: function(oEvent){
                var oArgs = oEvent.getParameter("arguments"),
                    oView = this.getView(),
                    oRouterModel = oView.getModel("routerModel");
                if (!oArgs["?query"]) return;
                if (oArgs['?query']) {
                    oRouterModel.setProperty("/sPath", oArgs['?query'].sPath);
                    oRouterModel.setProperty("/FlightId", oArgs['?query'].FlightId);
                    oRouterModel.setProperty("/LocationFrom", oArgs['?query'].LocationFrom);
                    oRouterModel.setProperty("/LocationFromName", oArgs['?query'].LocationFromName);
                    oRouterModel.setProperty("/LocationTo", oArgs['?query'].LocationTo);
                    oRouterModel.setProperty("/LocationToName", oArgs['?query'].LocationToName);
                    oRouterModel.setProperty("/Passenger", oArgs['?query'].Passenger);
                }

                this._getTotalReservation();
                this._getFlightInfo();
                this._setPassengerForm();

                this.getView().getModel("reserveModel").setProperty("/payment", "Credit Card");
                this.getView().getModel("reserveModel").setProperty("/card", {
                    name : "",
                    number : "",
                    securityCode : "",
                    expire : ""
                });
                this.getView().getModel("reserveModel").setProperty("/passenger", {
                    passportNo : "",
                    gender : "",
                    name : "",
                    country : "",
                    birth : "",
                    expire : ""
                });    
                this.getView().getModel("reserveModel").setProperty("/passenger2", {
                    passportNo : "",
                    gender : "",
                    name : "",
                    country : "",
                    birth : "",
                    expire : ""
                });    
                this.getView().getModel("reserveModel").setProperty("/passenger3", {
                    passportNo : "",
                    gender : "",
                    name : "",
                    country : "",
                    birth : "",
                    expire : ""
                });    
                this.getView().getModel("reserveModel").setProperty("/passenger4", {
                    passportNo : "",
                    gender : "",
                    name : "",
                    country : "",
                    birth : "",
                    expire : ""
                });    
                this.byId("rbg").setSelectedIndex(0);            
            },

            _getTotalReservation : function() {
                var dfd = $.Deferred();

                this.getOwnerComponent().getModel().read('/ZC_RESERVATION', {
                    success: function (oContent) {
                        this.getView().getModel("totalModel").setData(oContent?.results);
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

            _getFlightInfo : function() {
                var dfd = $.Deferred(),
                    oFlightModel = this.getView().getModel("flightModel"),
                    oRouterModel = this.getView().getModel("routerModel");

                this.getOwnerComponent().getModel().read('/ZC_FLIGHT_SCHD', {
                    filters : [ new Filter("FLIGHTID", FilterOperator.EQ, oRouterModel.getProperty("/FlightId")) ],
                    success: function (oContent) {
                        this.getView().getModel("flightModel").setData(oContent?.results[0]);

                        this.getView().getModel("reserveModel").setProperty("/total", oFlightModel.getData().PRICE * oRouterModel.getData().Passenger);
                        this.getView().getModel("reserveModel").setProperty("/reserve",oFlightModel.getData() );

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

            _setPassengerForm: function () {
                var oRouterModel = this.getView().getModel("routerModel"),
                    oForm1 = this.getView().byId("passengerForm1"),
                    oForm2 = this.getView().byId("passengerForm2"),
                    oForm3 = this.getView().byId("passengerForm3"),
                    oForm4 = this.getView().byId("passengerForm4"),
                    oRForm1 = this.getView().byId("prForm1"),
                    oRForm2 = this.getView().byId("prForm2"),
                    oRForm3 = this.getView().byId("prForm3"),
                    oRForm4 = this.getView().byId("prForm4");

                if(oRouterModel.getProperty("/Passenger") < 2){
                    oForm1.setVisible(true);
                    oForm2.setVisible(false);
                    oForm3.setVisible(false);
                    oForm4.setVisible(false);
                    oRForm1.setVisible(true);
                    oRForm2.setVisible(false);
                    oRForm3.setVisible(false);
                    oRForm4.setVisible(false);
                }else if(oRouterModel.getProperty("/Passenger") < 3){
                    oForm1.setVisible(true);
                    oForm2.setVisible(true);
                    oForm3.setVisible(false);
                    oForm4.setVisible(false);
                    oRForm1.setVisible(true);
                    oRForm2.setVisible(true);
                    oRForm3.setVisible(false);
                    oRForm4.setVisible(false);                    
                }else if(oRouterModel.getProperty("/Passenger") < 4){
                    oForm1.setVisible(true);
                    oForm2.setVisible(true);
                    oForm3.setVisible(true);
                    oForm4.setVisible(false);
                    oRForm1.setVisible(true);
                    oRForm2.setVisible(true);
                    oRForm3.setVisible(true);
                    oRForm4.setVisible(false);
                }else{
                    oForm1.setVisible(true);
                    oForm2.setVisible(true);
                    oForm3.setVisible(true);
                    oForm4.setVisible(true);   
                    oRForm1.setVisible(true);
                    oRForm2.setVisible(true);
                    oRForm3.setVisible(true);
                    oRForm4.setVisible(true);                
                }
            },

            getPage: function () {
                return this.byId("dynamicPage");
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

            onRbgSelect: function (oEvent) {
                var iIndex = oEvent.getParameter("selectedIndex"),
                    oView = this.getView(),
                    oReserve = oView.getModel("reserveModel"),
                    oPrice = oReserve.getData().reserve,
                    oPassenger = oView.getModel("routerModel").getData().Passenger;

                if (iIndex === 0){
                    oReserve.setProperty("/total", oPrice.PRICE * oPassenger);
                    oReserve.setProperty("/class", "Economy");
                }
                else if (iIndex === 1){
                    oReserve.setProperty("/total", oPrice.PRICE_B * oPassenger);
                    oReserve.setProperty("/class", "Business");
                }
                else if (iIndex === 2){
                    oReserve.setProperty("/total", oPrice.PRICE_F * oPassenger);  
                    oReserve.setProperty("/class", "First");
                }
            },   

            goToPaymentStep: function () {
                var selectedKey = this.getView().getModel("reserveModel").getProperty("/payment");
    
                switch (selectedKey) {
                    case "Bank Transfer":
                        this.byId("PaymentTypeStep").setNextStep(this.getView().byId("BankAccountStep"));
                        break;
                    case "Credit Card":
                    default:
                        this.byId("PaymentTypeStep").setNextStep(this.getView().byId("CreditCardStep"));
                        break;
                }
            },

            checkCreditCardStep: function () {
                var cardName = this.getView().getModel("reserveModel").getProperty("/card/name") || "";
                if (cardName.length < 3) {
                    this._wizard.invalidateStep(this.byId("CreditCardStep"));
                } else {
                    this._wizard.validateStep(this.byId("CreditCardStep"));
                }
            },

            checkPassengerStep: function () {
                var oPassenger = this.getView().getModel("reserveModel").getProperty("/passenger"),
                    vPassport  = oPassenger.passportNo || "",
                    vName      = oPassenger.name || "",
                    vCountry   = oPassenger.country || "",
                    vBirth     = oPassenger.birth || "",
                    vExpire    = oPassenger.expire || "";

                if (vPassport.length < 3 || vName.length < 3 || vCountry.length < 3 || vBirth.length < 3 || vExpire.length < 3) {
                    this._wizard.invalidateStep(this.byId("PassengerStep"));
                } else {
                    this._wizard.validateStep(this.byId("PassengerStep"));
                }
            },

            setPaymentMethod: function () {
                this.setDiscardableProperty({
                    message: "Are you sure you want to change the payment type ? This will discard your progress.",
                    discardStep: this.byId("PaymentTypeStep"),
                    modelPath: "/payment",
                    historyPath: "prevPaymentSelect"
                });
            },

            setDiscardableProperty: function (params) {
                if (this._wizard.getProgressStep() !== params.discardStep) {
                    MessageBox.warning(params.message, {
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        onClose: function (oAction) {
                            if (oAction === MessageBox.Action.YES) {
                                this._wizard.discardProgress(params.discardStep);
                                history[params.historyPath] = this.getView().getModel("reserveModel").getProperty(params.modelPath);
                            } else {
                                this.getView().getModel("reserveModel").setProperty(params.modelPath, history[params.historyPath]);
                            }
                        }.bind(this)
                    });
                } else {
                    history[params.historyPath] = this.getView().getModel("reserveModel").getProperty(params.modelPath);
                }
            },

            completedHandler: function () {
                this._setPassengerInfo();
                this._oNavContainer.to(this.byId("wizardBranchingReviewPage"));
            },  
            
            handleNavBackToPaymentType: function () {
                this._navBackToStep(this.byId("PaymentTypeStep"));
            },
    
            handleNavBackToCreditCard: function () {
                this._navBackToStep(this.byId("CreditCardStep"));
            },
    
            handleNavBackToPassenger: function () {
                this._navBackToStep(this.byId("PassengerStep"));
            },   

            _navBackToStep: function (step) {
                var fnAfterNavigate = function () {
                    this._wizard.goToStep(step);
                    this._oNavContainer.detachAfterNavigate(fnAfterNavigate);
                }.bind(this);
    
                this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
                this._oNavContainer.to(this._oDynamicPage);
            },
            
            onCancelButtonPress: function () {
                var oWizard = this.byId("ShoppingCartWizard"),
                    oFirstStep = oWizard.getSteps()[0];
                var oRouterModel = this.getView().getModel("routerModel");
                this.getView().byId("dynamicPage").setBusy(true);
                var oConfirm = MessageBox.confirm("Would you like to go to the Flight Schedule? Anything you write will be lost.", {
                    title: "Confirm",                                    
                    actions: [ sap.m.MessageBox.Action.OK,
                               sap.m.MessageBox.Action.CANCEL ],         
                    emphasizedAction: sap.m.MessageBox.Action.OK,      
                    onClose: function(sAction) {
                        if(sAction == "OK"){
                          
                          oWizard.discardProgress(oFirstStep);
                          // scroll to top
                          oWizard.goToStep(oFirstStep);
                          this.byId("rbg").setSelectedIndex(0);
                          this._oNavContainer.to(this.byId("dynamicPage"));
                          
                          this.getOwnerComponent().getRouter().navTo("CheckFlight", {                
                            "?query": {
                                locationFrom: oRouterModel.getProperty("/LocationFrom"),
                                locationFromName: oRouterModel.getProperty("/LocationFromName"),
                                locationTo: oRouterModel.getProperty("/LocationTo"),
                                locationToName: oRouterModel.getProperty("/LocationToName"),
                                Passenger: oRouterModel.getProperty("/Passenger")
                            }               
                          })
                          this.getView().byId("dynamicPage").setBusy(false); 
                        } else {
                            this.getView().byId("dynamicPage").setBusy(false); 
                        }
                    }.bind(this), 
                });
            },

            setToday: function(){
                var today1 = new Date();
                var dd = today1.getDate();
                var mm = today1.getMonth()+1; //January is 0!
                var yyyy = today1.getFullYear();
            
                if(dd<10) dd='0'+dd
                if(mm<10) mm='0'+mm    
                today = (yyyy+mm+dd);
            },

            setReserveID: function(){
                var oSeq = this.getView().getModel("totalModel").getData().length+1,
                    oNumber='',
                    oCount = 6 - oSeq.toString().length;

                for (let index = 0; index < oCount; index++) 
                    oNumber = oNumber + "0";        

                oNumber = "DJR" + oNumber + oSeq.toString();
                return oNumber;
            },

            _setPassengerInfo: function(){
                var oReserveModel = this.getView().getModel("reserveModel"),
           
                    oPassenger = oReserveModel.getProperty("/passenger"),
                    oPassenger2 = oReserveModel.getProperty("/passenger2"),
                    oPassenger3 = oReserveModel.getProperty("/passenger3"),
                    oPassenger4 = oReserveModel.getProperty("/passenger4"),
                    oPassengerInfoModel = this.getView().getModel("passengerInfoModel");

                var oReserveID = this.setReserveID();
                var passengerInfo = [{
                    "RESERVEID" : oReserveID,
                    "PASSPORTNO" : oPassenger.passportNo,
                    "GENDER" : this.getView().byId("genderFrom").getSelectedKey(),
                    "NAME" : oPassenger.name,
                    "COUNTRY" : oPassenger.country,
                    "BIRTH" : oPassenger.birth,
                    "EXPIRE" : oPassenger.expire                    
                }];

                if(oPassenger2.passportNo){
                    passengerInfo.push({
                        "RESERVEID" : oReserveID,
                        "PASSPORTNO" : oPassenger2.passportNo,
                        "GENDER" : this.getView().byId("genderFrom2").getSelectedKey(),
                        "NAME" : oPassenger2.name,
                        "COUNTRY" : oPassenger2.country,
                        "BIRTH" : oPassenger2.birth,
                        "EXPIRE" : oPassenger2.expire   
                    })
                }

                if(oPassenger3.passportNo){
                    passengerInfo.push({
                        "RESERVEID" : oReserveID,
                        "PASSPORTNO" : oPassenger3.passportNo,
                        "GENDER" : this.getView().byId("genderFrom3").getSelectedKey(),
                        "NAME" : oPassenger3.name,
                        "COUNTRY" : oPassenger3.country,
                        "BIRTH" : oPassenger3.birth,
                        "EXPIRE" : oPassenger3.expire   
                    })
                }

                if(oPassenger4.passportNo){
                    passengerInfo.push({
                        "RESERVEID" : oReserveID,
                        "PASSPORTNO" : oPassenger4.passportNo,
                        "GENDER" : this.getView().byId("genderFrom4").getSelectedKey(),
                        "NAME" : oPassenger4.name,
                        "COUNTRY" : oPassenger4.country,
                        "BIRTH" : oPassenger4.birth,
                        "EXPIRE" : oPassenger4.expire   
                    })
                }    
                oPassengerInfoModel.setData(passengerInfo);
            },

            onSubmitButtonPress: function () {
                var oWizard = this.byId("ShoppingCartWizard"),
                    oReserveModel = this.getView().getModel("reserveModel"),
                    oUserModel    = this.getOwnerComponent().getModel("userModel"),
                    oReserve   = oReserveModel.getProperty("/reserve"),
                    oCard      = oReserveModel.getProperty("/card"),
                    oReservationInfoModel = this.getView().getModel("reservationInfoModel"),
                    oPassengerInfoModel = this.getView().getModel("passengerInfoModel"),  
                    oFirstStep = oWizard.getSteps()[0];

                var oReserveID = this.setReserveID();
                // var oXhr = new ODataXhrService();

                // async function getBearerToken() {
                //     // const tokenEndpoint = destination.tokenServiceURL;
                //     // const clientId = destination.clientId;
                //     // const clientSecret = destination.clientSecret;
                //     const tokenEndpoint = "https://4c9a6826trial.authentication.ap21.hana.ondemand.com/oauth/token";
                //     const clientId = "sb-9730b285-0d9e-40b1-9e43-45e47e7b6b3d!b33773|abap-trial-service-broker!b18767";
                //     const clientSecret = "e5ff0674-1fe4-4938-88e8-00028574c4ce$trckMpJYWu2b7FAmsIYM-NCjvaK-Dm_nIMs_QkOprfA=";
                //     const response = await axios.post(tokenEndpoint, 
                //       qs.stringify({ 'grant_type': "client_credentials",  "client_id" : `${clientId}` , "client_secret":`${clientSecret}`}),
                //       {
                //         headers: {
                //           'Content-Type': 'application/x-www-form-urlencoded',
                //         }
                //       }
                //     );
                //     console.log("getBearerToken start",response.data.access_token)
                //     return response.data.access_token;
                // }


                $.ajax({
                    url: "/sap/opu/odata/sap/ZUI_C_TRAVEL_DJ_010/$metadata",
                    type: "GET",
                    beforSend: function (xhr) {
                        xhr.setRequestHeader("X-CSRF-Token", "Fetch");
                    },
                    complete: function (xhr) {
                        var _oToken = xhr.getResponseHeader("X-CSRF-Token");
                        console.log(_oToken);
                        $.ajax({
                            url: "/sap/opu/odata/sap/ZUI_C_TRAVEL_DJ_010/ZC_PASSENGER",
                            method: "POST",
                            data: JSON.stringify(passengerInfo),
                            contentType: "application/json",
                            beforeSend: function(xhr){
                                xhr.setRequestHeader("X-CSRF-Token", _oToken);
                            },
                            success: function (success){
                                console.log(success);
                            },
                            error: function(error){
                                console.log("error2",error)
                            }
                        })
                    },
                    error: function(error){
                        console.log("error1",error)
                    }
                })

                // var _getToken = getBearerToken();
                // 403 Error
                // $.ajax({
                //     url: "/sap/opu/odata/sap/ZUI_C_TRAVEL_DJ_010/ZC_PASSENGER",
                //     method: "POST",
                //     data: JSON.stringify(passengerInfo),
                //     beforeSend: function(xhr){
                //         var header = "Authorization";
                //         var token = `Bearer ${_getToken}`;
                //         xhr.setRequestHeader(header, token);
                //     },
                // }).then(function(e){
                //     console.log(passengerInfo);
                // }.bind(this)).catch(function(e){
                //     MessageToast.show("What Happens Now");
                // }.bind(this));

                // 405 Error
                // this.getOwnerComponent().getModel().update('/ZC_PASSENGER', passengerInfo, {
                //     success: function (oContent) {
                //         // dfd.resolve(oContent); 
                //         console.log(oContent);
                //     }.bind(this),
                //     error: function (oError) {
                //         // dfd.reject(oError);
                //         console.log(oError);
                //     }.bind(this)
                // });

                this.setToday();
                var oRouterModel = this.getView().getModel("routerModel");
                this.getView().byId("dynamicPage").setBusy(true);
                var oConfirm = MessageBox.confirm("Want to complete your flight booking?", {
                    title: "Confirm",                                
                    actions: [ sap.m.MessageBox.Action.OK,
                            sap.m.MessageBox.Action.CANCEL ],        
                    emphasizedAction: sap.m.MessageBox.Action.OK,    
                    onClose: function(sAction) {
                        if(sAction == "OK"){                
                        // var reservation_id = uid(); // uid required from "sap/base/util/uid"
                        // DB로 저장할 데이터
                        oReservationInfoModel.setData({
                            "reserveID"  : oReserveID,
                            "userID"     : oUserModel.getProperty("/userId"),
                            "password"   : oUserModel.getProperty("/password"),
                            "carrid"     : oReserve.carrid,
                            "connid"     : oReserve.connid,
                            "cityfrom"   : oReserve.cityfrom, 
                            "airpfrom"   : oReserve.airpfrom, 
                            "cityto"     : oReserve.cityto, 
                            "airpto"     : oReserve.airpto, 
                            "fldate"     : oReserve.fldate,
                            "deptime"    : oReserve.deptime,
                            "arrtime"    : oReserve.arrtime,
                            "passenger"  : oRouterModel.getProperty("/Passenger"),
                            "seatsClass" : oReserveModel.getProperty("/class"), 
                            "totalPrice" : oReserveModel.getProperty("/total"),
                            "currency"   : oReserve.currency,
                            "paidFlag"   : "true",
                            "cancelFlag" : "false",
                            "payment"    : oReserveModel.getProperty("/payment"),
                            "cardName"   : oCard.name,
                            "cardNumber" : oCard.number,
                            "cardSecureCode" : oCard.securityCode,
                            "cardExpire"     : oCard.expire,
                            "reserveDate"    : today
                        });    

                        oWizard.discardProgress(oFirstStep);
                        oWizard.goToStep(oFirstStep);
                        this.byId("rbg").setSelectedIndex(0);
                        this._oNavContainer.to(this.byId("dynamicPage"));
                        
                        this.getOwnerComponent().getRouter().navTo("CheckFlight", {                
                            "?query": {
                                locationFrom: oRouterModel.getProperty("/LocationFrom"),
                                locationFromName: oRouterModel.getProperty("/LocationFromName"),
                                locationTo: oRouterModel.getProperty("/LocationTo"),
                                locationToName: oRouterModel.getProperty("/LocationToName"),
                                Passenger: oRouterModel.getProperty("/Passenger")
                            }               
                        })
                        this.getView().byId("dynamicPage").setBusy(false); 
                        this.getView().setBusy(true);
                        this.getOwnerComponent().getRouter().navTo("ReviewReservation", {                
                            "?query": {
                                reserveID   : vReserveID,
                                createFlag  : "true"
                            }                
                        });  
                        this.getView().setBusy(false);
                      };
                    }.bind(this), 
                });               
            },
        });
    });
