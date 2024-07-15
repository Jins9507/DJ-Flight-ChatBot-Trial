sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageBox",
        "sap/ui/core/Fragment",
        "sap/m/MessageToast",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
    ],
    function(BaseController, JSONModel, MessageBox, Fragment, MessageToast, Filter, FilterOperator) {
      "use strict";
  
      return BaseController.extend("chatbot.djchatbotai.controller.ReviewReservation", {
        onInit: function() {
          var oPage = this.getView().byId("ReviewReservationPage");
              oPage.setBusy(true);
          this.getView().setModel(new JSONModel({}), "routerModel");
          this.getView().setModel(new JSONModel({}), "cancelFlightModel");
          this.getOwnerComponent().getRouter().getRoute("ReviewReservation").attachMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function(oEvent){
          var oArgs = oEvent.getParameter("arguments"),
              oView = this.getView(),
              oRouterModel = oView.getModel("routerModel");

          if (!oArgs["?query"]) return;
          if (oArgs['?query']) oRouterModel.setProperty("/reserveID", oArgs['?query'].reserveID); 
          
          this._getUser();
          this._getReservation(oRouterModel.getProperty("/reserveID"));
          this._getPassenger(oRouterModel.getProperty("/reserveID"));
          // this._setPassengerForm();

      },
      _getUser : function() {
        var dfd = $.Deferred();

        this.getOwnerComponent().getModel().read('/ZC_USER_INFO', {
            filters : [ new Filter("USERID", FilterOperator.EQ, 'M000003') ],
            success: function (oContent) {
                dfd.resolve(oContent);
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

      _getReservation : function(pReserveID) {
          var dfd = $.Deferred();
          this.getOwnerComponent().getModel().read('/ZC_RESERVATION', {
              filters : [ new Filter("RESERVEID", FilterOperator.EQ, pReserveID) ],
              success: function (oContent) {
                  this.getOwnerComponent().getModel("reservationModel").setData(oContent?.results);
                  var oReserveTable = this.getOwnerComponent().getModel("reservationModel").getData()[0];
                  this.getView().setModel(new JSONModel(oReserveTable), "reserveModel");
                  this._getFlight();
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

      _getPassenger : function(pReserveID) {
          var dfd = $.Deferred();
          var oPage = this.getView().byId("ReviewReservationPage");
          this.getOwnerComponent().getModel().read('/ZC_PASSENGER', {
              filters : [ new Filter("RESERVEID", FilterOperator.EQ, pReserveID) ],
              success: function (oContent) {
                  this.getOwnerComponent().getModel("passengerModel").setData(oContent?.results);
                  this._setPassengerForm();
                  dfd.resolve(oContent); 
                  oPage.setBusy(false);
                  console.log(oContent);
              }.bind(this),
              error: function (oError) {
                  dfd.reject(oError);
                  console.log(oError);
              }.bind(this)
          });

          return dfd.promise();
      },

      _getFlight : function(pReserveID) {
            var dfd = $.Deferred();
            var oReserve = this.getView().getModel("reserveModel");

            this.getOwnerComponent().getModel().read('/ZC_FLIGHT_SCHD', {
            filters : [ new Filter("FLIGHTID", FilterOperator.EQ, oReserve.getData().FLIGHTID) ],
            success: function (oContent) {
                dfd.resolve(oContent); 
                this.getView().getModel("cancelFlightModel").setData(oContent?.results[0]);
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
        var oPassengerModel = this.getOwnerComponent().getModel("passengerModel"),
            oForm1 = this.getView().byId("pForm1"),
            oForm2 = this.getView().byId("pForm2"),
            oForm3 = this.getView().byId("pForm3"),
            oForm4 = this.getView().byId("pForm4");

        if(oPassengerModel.getData().length < 2){
            oForm1.setVisible(true);
            oForm2.setVisible(false);
            oForm3.setVisible(false);
            oForm4.setVisible(false);
        }else if(oPassengerModel.getData().length < 3){
            oForm1.setVisible(true);
            oForm2.setVisible(true);
            oForm3.setVisible(false);
            oForm4.setVisible(false);
        }else if(oPassengerModel.getData().length < 4){
            oForm1.setVisible(true);
            oForm2.setVisible(true);
            oForm3.setVisible(true);
            oForm4.setVisible(false);
        }else{
            oForm1.setVisible(true);
            oForm2.setVisible(true);
            oForm3.setVisible(true);
            oForm4.setVisible(true);                   
        }
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
            sReturnValue = oTime.slice(0, 2) + ":" + oTime.slice(2, 4);
          }
          return sReturnValue;
      },    

      onCancelButtonPress: function(){
        var oConfirm = MessageBox.confirm("Are you sure you want to cancel the reservation?", {
          title: "Confirm",                                    
          actions: [ sap.m.MessageBox.Action.OK,
                    sap.m.MessageBox.Action.CANCEL ],         
          emphasizedAction: sap.m.MessageBox.Action.OK,        
          onClose: function(sAction) {
              if(sAction == "OK")
                this.onDialogPress();
          }.bind(this), 
        });        
      },

      onBackButtonPress: function(){
        window.history.go(-1);
        // this.getOwnerComponent().getRouter().navTo("mainPage");
      },

      onDialogPress: function(oEvent){
        var oView = this.getView();

        if (!this.oReserveDialog) {
            this.oReserveDialog = Fragment.load({
                id: oView.getId(),
                name: "chatbot.djchatbotai.view.PasswordCheckDialog",
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

      onDialogCancel: function(oEvent){
          // 번호와 비밀번호 일치 하면 삭제 플레그 수정
          var vReservationNumber = this.getView().byId("reserveInput").getProperty("value").toUpperCase();
          var vPassword = this.getView().byId("passwordInput").getProperty("value").toUpperCase();
          var oReserve = this.getView().getModel("reserveModel");
          var oFlight = this.getView().getModel("cancelFlightModel");

          this.getView().byId("reserveInput").setValue("");
          this.getView().byId("passwordInput").setValue("");

          if(oReserve.getProperty("/RESERVEID") === vReservationNumber && oReserve.getProperty("/PASSWORD") === vPassword){
            // 취소 상태 업데이트
            oReserve.setProperty("/STATUSFLAG", "C"); // Update
            // 항공편 좌석 업데이트 Seats + Passenger 
            oFlight.getData(); // Update

            MessageToast.show(oReserve.getProperty("/RESERVEID") + " canceled successfully."); 
            oEvent.getSource().getParent().close();
          }else{
              MessageToast.show("Please confirm your password or reservation number."); 
          }              
      },

      onDialogClose: function(oEvent){
          // oEvent.getSource().destroy();
          this.getView().byId("reserveInput").setValue("");
          this.getView().byId("passwordInput").setValue("");
          oEvent.getSource().getParent().close();
      }

      });
    }
  );
  