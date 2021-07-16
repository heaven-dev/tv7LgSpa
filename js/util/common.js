'use strict';

function setSelectedSidebarIcon(selected, notSelected) {
	var elem = getElementById(selected);
	if (elem) {
		elem.classList.add('selectedIcon');
	}

	for (var i = 0; i < notSelected.length; i++) {
		elem = getElementById(notSelected[i]);
		if (elem) {
			elem.classList.remove('selectedIcon');
		}
	}
}

function focusInToMenuEvent(element) {
	var tvIconText = getElementById('tvIconText');
	if (tvIconText) {
		showElement(tvIconText);
		setLocaleText('tvIconText');
	}

	var archiveIconText = getElementById('archiveIconText');
	if (archiveIconText) {
		showElement(archiveIconText);
		setLocaleText('archiveIconText');
	}

	var guideIconText = getElementById('guideIconText');
	if (guideIconText) {
		showElement(guideIconText);
		setLocaleText('guideIconText');
	}

	var searchIconText = getElementById('searchIconText');
	if (searchIconText) {
		showElement(searchIconText);
		setLocaleText('searchIconText');
	}

	var favoritesIconText = getElementById('favoritesIconText');
	if (favoritesIconText) {
		showElement(favoritesIconText);
		setLocaleText('favoritesIconText');
	}

	var channelInfoIconText = getElementById('channelInfoIconText');
	if (channelInfoIconText) {
		showElement(channelInfoIconText);
		setLocaleText('channelInfoIconText');
	}

	var platformInfoIconText = getElementById('platformInfoIconText');
	if (platformInfoIconText) {

		if (getArchiveLanguage() === 'SV1') {
			var sideMenuTextIds = [
				'tvIconText',
				'archiveIconText',
				'guideIconText',
				'searchIconText',
				'favoritesIconText',
				'channelInfoIconText',
				'platformInfoIconText'
			];

			for (var i = 0; i < sideMenuTextIds.length; i++) {
				var elem = getElementById(sideMenuTextIds[i]);
				if (elem) {
					elem.style.marginRight = 40 + 'px';
				}
			}
		}

		showElement(platformInfoIconText);
		setLocaleText('platformInfoIconText');
	}
}

function focusOutFromMenuEvent() {
	var tvIconText = getElementById('tvIconText');
	if (tvIconText) {
		hideElement(tvIconText);
	}

	var archiveIconText = getElementById('archiveIconText');
	if (archiveIconText) {
		hideElement(archiveIconText);
	}

	var guideIconText = getElementById('guideIconText');
	if (guideIconText) {
		hideElement(guideIconText);
	}

	var searchIconText = getElementById('searchIconText');
	if (searchIconText) {
		hideElement(searchIconText);
	}

	var favoritesIconText = getElementById('favoritesIconText');
	if (favoritesIconText) {
		hideElement(favoritesIconText);
	}

	var channelInfoIconText = getElementById('channelInfoIconText');
	if (channelInfoIconText) {
		hideElement(channelInfoIconText);
	}

	var platformInfoIconText = getElementById('platformInfoIconText');
	if (platformInfoIconText) {
		hideElement(platformInfoIconText);
	}
}

function menuMoveUp(contentId) {
	if (contentId === platformInfoIconContainer) {
		focusToElement(channelInfoIconContainer);
	}
	else if (contentId === channelInfoIconContainer) {
		focusToElement(favoritesIconContainer);
	}
	else if (contentId === favoritesIconContainer) {
		focusToElement(searchIconContainer);
	}
	else if (contentId === searchIconContainer) {
		focusToElement(guideIconContainer);
	}
	else if (contentId === guideIconContainer) {
		focusToElement(archiveIconContainer);
	}
	else if (contentId === archiveIconContainer) {
		focusToElement(tvIconContainer);
	}
}

function menuMoveDown(contentId) {
	if (contentId === tvIconContainer) {
		focusToElement(archiveIconContainer);
	}
	else if (contentId === archiveIconContainer) {
		focusToElement(guideIconContainer);
	}
	else if (contentId === guideIconContainer) {
		focusToElement(searchIconContainer);
	}
	else if (contentId === searchIconContainer) {
		focusToElement(favoritesIconContainer);
	}
	else if (contentId === favoritesIconContainer) {
		focusToElement(channelInfoIconContainer);
	}
	else if (contentId === channelInfoIconContainer) {
		focusToElement(platformInfoIconContainer);
	}
}

function sidebarMenuClicked(event, item) {
	if (event && item) {
		var id = item.id;

		removePageEventListeners();

		if (id === tvIconContainer) {
			sideMenuSelection(tvMainPage);
		}
		else if (id === archiveIconContainer) {
			sideMenuSelection(archiveMainPage);
		}
		else if (id === guideIconContainer) {
			sideMenuSelection(guidePage);
		}
		else if (id === searchIconContainer) {
			sideMenuSelection(searchPage);
		}
		else if (id === favoritesIconContainer) {
			sideMenuSelection(favoritesPage);
		}
		else if (id === channelInfoIconContainer) {
			sideMenuSelection(channelInfoPage);
		}
		else if (id === platformInfoIconContainer) {
			sideMenuSelection(platformInfoPage);
		}

		event.preventDefault();
	}
}

function removePageEventListeners() {
	var page = getValueFromCache(visiblePageKey);
	if (page) {
		if (page === tvMainPage) {
			tmRemoveEventListeners();
		}
		else if (page === archiveMainPage) {
			amRemoveEventListeners();
		}
		else if (page === categoryProgramsPage) {
			cpRemoveEventListeners();
		}
		else if (page === favoritesPage) {
			faRemoveEventListeners();
		}
		else if (page === guidePage) {
			guRemoveEventListeners();
		}
		else if (page === channelInfoPage) {
			ciRemoveEventListeners();
		}
		else if (page === platformInfoPage) {
			pliRemoveEventListeners();
		}
		else if (page === programInfoPage) {
			piRemoveEventListeners();
		}
		else if (page === seriesInfoPage) {
			seiRemoveEventListeners();
		}
		else if (page === searchPage) {
			seRemoveEventListeners();
		}
		else if (page === searchResultPage) {
			srRemoveEventListeners();
		}
		else if (page === seriesPage) {
			siRemoveEventListeners();
		}
	}
}

function showExitModal() {
	var modal = getElementById('exitModal');
	if (modal) {
		setLocaleText('modalQuestionText');
		setLocaleText('exitYesButton');
		setLocaleText('exitCancelButton');

		var width = getWindowWidth();
		var height = getWindowHeight();

		modal.style.width = width + 'px';
		modal.style.height = height + 'px';

		showElement(modal);

		var exitYesButton = getElementById('exitYesButton');
		if (exitYesButton) {
			exitYesButton.focus();
		}
	}
}

function hideExitModal() {
	var modal = getElementById('exitModal');
	if (modal) {
		modal.style.display = 'none';
	}
}

function exitButtonClicked(item) {
	var page = getValueFromCache(visiblePageKey);
	if (page) {
		if (page === tvMainPage) {
			tmExitButtonClicked(item);
		}
		else if (page === archiveMainPage) {
			amExitButtonClicked(item);
		}
	}
}

function getElementByClass(element, className) {
	return element.querySelector('.' + className);
}

function getElementsByClass(element, className) {
	return element.querySelectorAll('.' + className);
}

function getElementById(id) {
	return document.getElementById(id);
}

function getWindowWidth() {
	return window.document.documentElement.clientWidth;
}

function getWindowHeight() {
	return window.document.documentElement.clientHeight;
}

function getDateByTimeInMs(time) {
	if (time) {
		var d = new Date(time);
		return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear();
	}
	else {
		return '-';
	}
}

function getDateTimeByTimeInMs(time) {
	if (time) {
		var d = new Date(time);
		return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear()
			+ '  ' + prependZero(d.getHours()) + ':' + prependZero(d.getMinutes());
	}
	else {
		return '-';
	}
}

function isPastTime(time) {
	time = new Date(time);
	var now = new Date().getTime();
	return now > time;
}

function getDateByDateIndex(dateIndex) {
	var d = new Date();

	if (dateIndex != 0) {
		d.setDate(d.getDate() + dateIndex);
	}

	return d.getFullYear() + '-' + prependZero((d.getMonth() + 1)) + '-' + prependZero(d.getDate());
}

function getLocalDateByUtcTimestamp(time) {
	return new Date(time);
}

function prependZero(value) {
	return value < 10 ? '0' + value : value;
}

function addData(data, template, container, append) {
	var template = Handlebars.compile(getElementById(template).innerHTML);
	var html = template(data);

	var element = getElementById(container);
	if (element) {
		if (append) {
			element.insertAdjacentHTML('beforeend', html);
		}
		else {
			element.innerHTML = html;
		}
	}
}

function removeData(elementId) {
	var element = getElementById(elementId);
	if (element) {
		element.innerHTML = '';
	}
}

function stringToJson(data) {
	return JSON.parse(data);
}

function jsonToString(data) {
	return JSON.stringify(data);
}

function addToElement(elementId, value) {
	var element = getElementById(elementId);
	if (element) {
		element.innerHTML = value;
	}
}

function addValueToAttribute(elementId, attribute, value) {
	var element = getElementById(elementId);
	if (element && attribute && value) {
		element.setAttribute(attribute, value);
	}
}

function focusToElement(id) {
	if (id) {
		var elem = getElementById(id);
		if (elem) {
			elem.focus();
		}
	}
}

function showElement(element) {
	if (element) {
		element.style.display = 'block';
	}
}

function hideElement(element) {
	if (element) {
		element.style.display = 'none';
	}
}

function showElementById(elementId) {
	if (elementId) {
		showElement(getElementById(elementId));
	}
}

function hideElementById(elementId) {
	if (elementId) {
		hideElement(getElementById(elementId));
	}
}

function getTimeStampByDuration(duration) {
	if (duration) {
		var h, m, s;
		h = prependZero(Math.floor(duration / 1000 / 60 / 60));
		m = prependZero(Math.floor((duration / 1000 / 60 / 60 - h) * 60));
		s = prependZero(Math.floor(((duration / 1000 / 60 / 60 - h) * 60 - m) * 60));
		return h + ':' + m + ':' + s;
	}
	else {
		return '00:00:00';
	}
}

function elementExist(element) {
	var elem = getElementById(element);
	return elem ? true : false;
}

function isSideBarMenuActive(contentId) {
	return contentId === tvIconContainer || contentId === archiveIconContainer || contentId === guideIconContainer
		|| contentId === searchIconContainer || contentId === favoritesIconContainer || contentId === channelInfoIconContainer
		|| contentId === platformInfoIconContainer;
}

function cacheValue(key, value) {
	sessionStorage.setItem(key, value);
}

function getValueFromCache(key) {
	return sessionStorage.getItem(key);
}

function removeValueFromCache(key) {
	sessionStorage.removeItem(key);
}

function saveValue(key, value) {
	localStorage.setItem(key, value);
}

function getSavedValue(key) {
	return localStorage.getItem(key);
}

function removeSavedValue(key) {
	localStorage.removeItem(key);
}

function getOriginPage() {
	var page = null;

	var value = getValueFromCache(originPageKey);
	if (value) {
		value = stringToJson(value);
		if (value && value.length > 0) {
			page = value.shift();
			cacheValue(originPageKey, jsonToString(value));
		}
	}

	return page;
}

function setOriginPage(page) {
	var value = getValueFromCache(originPageKey);
	value = value ? stringToJson(value) : [];
	value.unshift(page);
	cacheValue(originPageKey, jsonToString(value));
}

function removeOriginPage() {
	removeValueFromCache(originPageKey);
}

function toPage(toPage, fromPage) {
	if (fromPage) {
		setOriginPage(fromPage);
	}

	console.log('*****toPage: ', toPage, ' fromPage: ', fromPage);

	loadPageTemplate(toPage, function (tpl) {
		cacheValue(visiblePageKey, toPage);

		var obj = null;
		if (toPage === tvMainPage) {
			obj = new TvMain();
			obj.initTvMain();
		}
		else if (toPage === archiveMainPage) {
			obj = new ArchiveMain();
			obj.initArchiveMain();
		}
		else if (toPage === archivePlayerPage) {
			obj = new ArchivePlayer();
			obj.initArchivePlayer();
		}
		else if (toPage === categoryProgramsPage) {
			obj = new CategoryPrograms();
			obj.initCategoryPrograms();
		}
		else if (toPage === favoritesPage) {
			obj = new Favorites();
			obj.initFavorites();
		}
		else if (toPage === channelInfoPage) {
			obj = new ChannelInfo();
			obj.initChannelInfo();
		}
		else if (toPage === guidePage) {
			obj = new Guide();
			obj.initGuide();
		}
		else if (toPage === platformInfoPage) {
			obj = new PlatformInfo();
			obj.initPlatformInfo();
		}
		else if (toPage === seriesInfoPage) {
			obj = new SeriesInfo();
			obj.initSeriesInfo();
		}
		else if (toPage === programInfoPage) {
			obj = new ProgramInfo();
			obj.initProgramInfo();
		}
		else if (toPage === searchPage) {
			obj = new Search();
			obj.initSearch();
		}
		else if (toPage === searchResultPage) {
			obj = new SearchResult();
			obj.initSearchResult();
		}
		else if (toPage === seriesPage) {
			obj = new SeriesPrograms();
			obj.initSeriesPrograms();
		}
		else if (toPage === tvPlayerPage) {
			obj = new TvPlayer();
			obj.initTvPlayer();
		}
		else if (toPage === errorPage) {
			obj = new Error();
			obj.initError();
		}
	});
}

function toPreviousPage(alternativePage) {
	var page = getOriginPage();
	if (!page) {
		page = alternativePage;
	}

	toPage(page);
}

function sideMenuSelection(page) {
	focusOutFromMenuEvent();
	deletePageStates();
	removeOriginPage();
	toPage(page);
}

function isConnectedToGateway(cb) {
	if (!runOnBrowser) {
		webOS.service.request('luna://com.palm.connectionmanager', {
			method: 'getStatus',
			onSuccess: function (response) {
				if (response) {
					var connected = response.isInternetConnectionAvailable;
					if (!connected) {
						cacheValue(errorTextKey, noNetworkConnectionText);
					}
					cb(connected);
				}
				else {
					cb(true);
				}
			},
			onFailure: function (error) {
				cb(true);
			}
		});
	}
	else {
		var result = false;
		if (navigator) {
			result = navigator.onLine;
		}

		cb(result);
	}
}

function addSeriesProperties(series, sid) {
	series.sid = sid;
	series.name_desc = series.name;
	series.is_series = true;
	return series;
}

function deletePageStates() {
	removeValueFromCache(archivePageStateKey);
	removeValueFromCache(searchResultPageStateKey);
	removeValueFromCache(categoriesPageStateKey);
	removeValueFromCache(seriesPageStateKey);
	removeValueFromCache(guidePageStateKey);
	removeValueFromCache(searchPageStateKey);
	removeValueFromCache(favoritesPageStateKey);
}

function loadPageTemplate(htmlName, cb) {
	var url = 'html/' + htmlName;

	console.log('Load html page template: ', url);

	var xhttp = new XMLHttpRequest();
	xhttp.onload = function (e) {
		//console.log('Template: ', this.responseText);

		var elem = getElementById('appContent');
		if (elem) {
			elem.innerHTML = this.responseText;
		}

		cb(this.responseText);
	};

	xhttp.open('GET', url, true);
	xhttp.send();
}
