/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "chatbot/djchatbotai/model/models"
    ],
    function (UIComponent, Device, models) {
        "use strict";

        return UIComponent.extend("chatbot.djchatbotai.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
                this.renderRecastChatbot();
            },
            renderRecastChatbot: function() {
                if (!document.getElementById("cai-webchat")) {
                    var s = document.createElement("script");
                       s.setAttribute("id", "cai-webchat");
                      s.setAttribute("src", "https://cdn.cai.tools.sap/webchat/webchat.js");
                          document.body.appendChild(s);
                    }
                    s.setAttribute("channelId", "440b62c7-fd7e-41fe-b4f3-cf215b968837");
                    s.setAttribute("token", "f4bc2ed118e277508421b841b627431f");
            }
        });
    }
);