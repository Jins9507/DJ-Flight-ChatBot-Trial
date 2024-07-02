sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageBox",
        "sap/ui/core/Fragment",
        "sap/m/MessageToast",
    ],
    function(BaseController, JSONModel, MessageBox, Fragment, MessageToast) {
      "use strict";
  
      return BaseController.extend("chatbot.djchatbotai.controller.ReviewReservation", {
        onInit: function() {
          this.getView().setModel(new JSONModel({}), "routerModel");
          this.getOwnerComponent().getRouter().getRoute("ReviewReservation").attachMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function(oEvent){
          var oArgs = oEvent.getParameter("arguments"),
              oView = this.getView(),
              oRouterModel = oView.getModel("routerModel");

          if (!oArgs["?query"]) return;
          if (oArgs['?query']) {
              oRouterModel.setProperty("/reserveID", oArgs['?query'].reserveID);  
              oRouterModel.setProperty("/createFlag", oArgs['?query'].createFlag);
          }

          var oUserModel = this.getOwnerComponent().getModel("mockUser");
          var oReserveTable = this.getOwnerComponent().getModel("reservationTable"); // DB read 대용
          var indexR = $.inArray(oRouterModel.getProperty("/reserveID"), $.map(oReserveTable.getProperty("/reservation"), function(n){
              return n.reserveID
          }));
          var resultR = oReserveTable.getProperty("/reservation/"+indexR);
          this.getView().setModel(new JSONModel(resultR), "reserveModel");
      },
        
      formatDate: function(oDate) {
        var sReturnValue = "";
        if (oDate) {
           sReturnValue = oDate.slice(0, 4) + "-" + oDate.slice(4, 6) + "-" + oDate.slice(6, 8);
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
                name: "dj.djchatbot.view.PasswordCheckDialog",
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

          var vReservationNumber = this.getView().byId("reserveInput").getProperty("value");
          var vPassword = this.getView().byId("passwordInput").getProperty("value");
          var oReserve = this.getView().getModel("reserveModel");

          if(oReserve.getProperty("/reserveID") === vReservationNumber && oReserve.getProperty("/password") === vPassword){
            // completeFlag = true, cancelFlag = true 로 업데이트
            // 조회시 동일하게 되게 놔두고 cnacelFlag로만 '취소됨' 상태 추가? or
            // complete,cancel = false 만 조회되게 할까
            // 업뎃 시 항공편 seat 수량 plus
            oReserve.setProperty("/cancelFlag", "true");
            oReserve.setProperty("/completeFlag", "true");
            this.getView().getModel("routerModel").setProperty("/createFlag", "false");
            //////// DB Update 필요

            MessageToast.show(oReserve.getProperty("/reserveID") + " canceled successfully."); 
            this.getView().byId("reserveInput").setValue("");
            this.getView().byId("passwordInput").setValue("");
            oEvent.getSource().getParent().close();

          }else{
              this.getView().byId("reserveInput").setValue("");
              this.getView().byId("passwordInput").setValue("");
              MessageToast.show("Please confirm your password or reservation number."); 
          }              
      },

      onDialogClose: function(oEvent){
          // oEvent.getSource().destroy();
          this.getView().byId("reserveInput").setValue("");
          this.getView().byId("passwordInput").setValue("");
          oEvent.getSource().getParent().close();
      },


      });
    }
  );
  