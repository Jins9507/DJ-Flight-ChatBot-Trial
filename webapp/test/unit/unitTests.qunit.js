/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"chatbot/dj_chatbot_ai/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
