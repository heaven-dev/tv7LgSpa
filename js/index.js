'use strict';

/*
 * Open main view.
 */
window.onload = function () {
	init();
}

function init() {
	initSidebar();
	initToolbar();

	loadPageTemplate(landingPage, function (tpl) {
		initLandingPage();

		// read device info
		readSystemInfo(function () {

			// get today and tomorrow guide
			getGuideByDate(getTodayDate(), function (gd) {
				var guide = gd.data;

				getGuideByDate(getTomorrowDate(), function (gd) {
					guide = guide.concat(gd.data);

					cacheValue(programScheduleDataKey, JSON.stringify(guide));

					toPage(tvMainPage);
				});
			});
		});
	});
}

function readSystemInfo(cb) {
	if (!runOnBrowser && webOS) {
		webOS.deviceInfo(function (device) {
			if (device) {
				var sdkVersion = device.sdkVersion;
				var platformVersion = device.version;
				var modelName = device.modelName;

				var json = {
					'sdkVersion': sdkVersion,
					'platformVersion': platformVersion,
					'modelName': modelName
				}

				cacheValue(platformInfoKey, jsonToString(json));

				var split = sdkVersion.split('.');

				if (split && isDigit(split[0]) && isDigit(split[1])) {
					// Version of SDK format; '2.0' or '3.0' ...
					var value = parseInt(split[0]) + '.' + parseInt(split[1]);
					sessionStorage.setItem(sdkVersionKey, value);
				}
			}
			cb();
		});
	}
	else {
		cb();
	}
}

function isDigit(value) {
	return value && /^\d+$/.test(value);
}

function initSidebar() {
	var sidebarHeight = getWindowHeight() - 90;
	var sidebar = getElementById('sidebar');
	if (sidebar) {
		sidebar.style.height = sidebarHeight + 'px';
	}
}

function initToolbar() {
	setLocaleText('toolbarText');

	var logo = getChannelLogo();
	if (logo) {
		var elem = getElementById('toolbarLogo');
		if (elem) {
			elem.setAttribute('src', logo);
		}
	}
}

function initLandingPage() {
	var logo = getChannelLogo();
	if (logo) {
		var elem = getElementById('landingPageLogo');
		if (elem) {
			elem.setAttribute('src', logo);
		}
	}
}
