'use strict';

var SearchResult = (function () {

	function SearchResult() { }

	var searchData = [];
	var hitCount = 0;

	var rowImageWidth = 0;
	var rowItemHeight = 0;
	var rowIndex = 0;
	var lastContentRowId = '';
	var contentRows = null;

	var bottomMargin = 0;
	var animationOngoing = false;

	SearchResult.prototype.initSearchResult = function () {
		showElementById('toolbarContainer');
		showElementById('sidebar');

		setLocaleText('toolbarText');
		setSelectedSidebarIcon(searchIconContainer, [tvIconContainer, archiveIconContainer, guideIconContainer, favoritesIconContainer, platformInfoIconContainer]);

		setLocaleText('searchResultText');

		initSearchResultVariables();

		registerHandlebarsHelpers();

		var pageState = getPageState();
		if (pageState) {
			//console.log('**Restore search result data from cache.');
			restorePageState(pageState);
		}
		else {
			var queryString = getValueFromCache(searchTextKey);
			if (queryString) {
				//console.log('Query string: ', queryString);
				searchByString(queryString);
			}
		}

		// add event listener for mousewheel
		contentRows = getElementById('contentRows');
		if (contentRows) {
			contentRows.addEventListener('mousewheel', srMouseWheelListener);
		}

		// add eventListener for keydown
		document.addEventListener('keydown', srKeyDownEventListener);
	}

	function removeEventListeners() {
		console.log('***Remove search result event listeners.');

		document.removeEventListener('keydown', srKeyDownEventListener);
		if (contentRows) {
			contentRows.removeEventListener('mousewheel', srMouseWheelListener);
		}
	}

	function srMouseWheelListener(e) {
		handleWheelEvent(e);
	}

	function srKeyDownEventListener(e) {
		e.preventDefault();
		e.stopPropagation();

		var keyCode = e.keyCode;
		var contentId = e.target.id;

		//console.log('Key code : ', keyCode, ' Target element: ', contentId);

		var row = 0;
		var col = '';
		var split = contentId.split('_');

		if (split && split.length === 2 && split[1] === 'c') {
			row = parseInt(split[0]);
			col = split[1];

			lastContentRowId = contentId;
		}

		if (keyCode === LEFT) {
			// LEFT arrow
			if (!isSideBarMenuActive(contentId)) {
				focusToElement(searchIconContainer);
			}
		}
		else if (keyCode === RIGHT) {
			// RIGHT arrow				
			if (isSideBarMenuActive(contentId)) {
				if (hitCount > 0) {
					focusToElement(lastContentRowId);
				}
				else {
					focusToElement('searchResultText');
				}
			}
		}
		else if (keyCode === UP) {
			// UP arrow
			if (!isSideBarMenuActive(contentId)) {
				wheelUp(row, col);
			}
			else {
				menuMoveUp(contentId);
			}
		}
		else if (keyCode === DOWN) {
			// DOWN arrow
			if (!isSideBarMenuActive(contentId)) {
				wheelDown(row, col);
			}
			else {
				menuMoveDown(contentId);
			}
		}
		else if (keyCode === RED) {
			removeEventListeners();
			sideMenuSelection(tvMainPage);
		}
		else if (keyCode === GREEN) {
			removeEventListeners();
			sideMenuSelection(archiveMainPage);
		}
		else if (keyCode === YELLOW) {
			removeEventListeners();
			sideMenuSelection(guidePage);
		}
		else if (keyCode === BLUE) {
			removeEventListeners();
			sideMenuSelection(searchPage);
		}
		else if (keyCode === OK) {
			// OK button
			removeEventListeners();

			if (contentId === archiveIconContainer) {
				sideMenuSelection(archiveMainPage);
			}
			else if (contentId === tvIconContainer) {
				sideMenuSelection(tvMainPage);
			}
			else if (contentId === guideIconContainer) {
				sideMenuSelection(guidePage);
			}
			else if (contentId === searchIconContainer) {
				sideMenuSelection(searchPage);
			}
			else if (contentId === favoritesIconContainer) {
				sideMenuSelection(favoritesPage);
			}
			else if (contentId === platformInfoIconContainer) {
				sideMenuSelection(platformInfoPage);
			}
			else {
				toItemPage(row);
			}
		}
		else if (keyCode === RETURN || keyCode === ESC) {
			// RETURN button
			if (isSideBarMenuActive(contentId)) {
				focusOutFromMenuEvent(getElementById(searchIconContainer));
				if (hitCount > 0) {
					focusToElement(lastContentRowId);
				}
				else {
					focusToElement('searchResultText');
				}
			}
			else {
				removeEventListeners();
				toPage(searchPage, searchResultPage);
			}
		}
	}

	function wheelUp(row, col) {
		var newRow = row - 1;
		var newFocus = newRow + '_' + col;
		if (elementExist(newFocus) && !animationOngoing) {
			animationOngoing = true;

			rowMoveDownUp(row, false);
			focusToElement(newFocus);
		}
	}

	function wheelDown(row, col) {
		var newRow = row + 1;
		var newFocus = newRow + '_' + col;
		if (elementExist(newFocus) && !animationOngoing) {
			animationOngoing = true;

			rowMoveDownUp(row, true);
			focusToElement(newFocus);
		}
	}

	function handleWheelEvent(event) {
		var focusedId = document.activeElement.id;
		if (!focusedId) {
			return;
		}

		var split = focusedId.split('_');
		if (!split || split.length !== 2) {
			return;
		}

		var row = parseInt(split[0]);
		var col = split[1];

		if (event.deltaY > 0) {
			wheelDown(row, col);
		}
		else {
			wheelUp(row, col);
		}
	}

	function searchByString(queryString) {
		showElementById('searchResultBusyLoader');

		searchPrograms(queryString, function (data) {
			if (data) {
				//console.log('Search result: ', data);

				hitCount = 0;

				searchData = data['results'];
				if (searchData) {
					hitCount = searchData.length;
				}

				addData(searchData, 'searchResultTemplate', 'searchResultContainer', true);

				hideElementById('searchResultBusyLoader');

				if (hitCount > 0) {
					focusToElement('0_c');
				}
				else {
					focusToElement('searchResultText');
				}

				if (!hitCount || hitCount === 0) {
					showNoHitsText();
				}
			}
		});
	}

	function toItemPage(row) {
		if (searchData[row]) {
			var data = searchData[row];

			//console.log('Selected item: ', data);

			savePageState(row);

			if (data.series_id && data.series_id !== '' && data.series_id !== nullValue && data.type === 'series') {
				cacheData(selectedArchiveProgramKey, jsonToString(data));
				toPage(seriesPage, searchResultPage);
			}
			else {
				showElementById('searchResultBusyLoader');
				getProgramInfo(data.id, function (program) {
					cacheValue(selectedArchiveProgramKey, jsonToString(program[0]));

					hideElementById('searchResultBusyLoader');
					toPage(programInfoPage, searchResultPage);
				});
			}
		}
	}

	function rowMoveDownUp(row, down) {
		var element = getElementById('searchResultContainer');
		if (element) {
			var rowHeight = calculateRowHeight();
			var rowHeightAndMargin = rowHeight + 40;

			if (down) {
				if (row > 0) {
					bottomMargin += rowHeightAndMargin;
				}
			}
			else {
				if (row > 1) {
					bottomMargin -= rowHeightAndMargin;
				}
			}

			//console.log('Bottom margin value: ', bottomMargin);

			anime({
				targets: element,
				bottom: bottomMargin + 'px',
				duration: 180,
				easing: 'linear',
				complete: function () {
					animationOngoing = false;
				}
			});
		}
	}

	function getPageState() {
		var value = getValueFromCache(searchResultPageStateKey);
		if (value) {
			return stringToJson(value);
		}
		return null;
	}

	function savePageState(row) {
		var pageState = {
			row: row,
			bottomMargin: bottomMargin,
			searchData: JSON.stringify(searchData)
		}

		cacheValue(searchResultPageStateKey, jsonToString(pageState));
	}

	function deletePageState() {
		removeValueFromCache(searchResultPageStateKey);
	}

	function restorePageState(ps) {
		if (ps) {
			showElementById('searchResultBusyLoader');

			bottomMargin = ps.bottomMargin;
			var element = getElementById('searchResultContainer');
			if (element) {
				element.style.bottom = bottomMargin + 'px';
			}

			searchData = stringToJson(ps.searchData);
			addData(searchData, 'searchResultTemplate', 'searchResultContainer', true);

			hitCount = searchData.length;

			var focusRow = ps.row + '_c';
			focusToElement(focusRow);

			deletePageState();

			hideElementById('searchResultBusyLoader');

			if (!hitCount || hitCount === 0) {
				showNoHitsText();
			}
		}
	}

	function calculateImageWidth() {
		var height = calculateRowHeight();
		return Math.round(height / 0.56);
	}

	function calculateRowHeight() {
		var height = getWindowHeight() - 280;
		return Math.round(height / 3.5);
	}

	function showNoHitsText() {
		setLocaleText('noHitsText');
		showElementById('noHitsText');
	}

	function initSearchResultVariables() {
		searchData = [];
		hitCount = 0;

		rowImageWidth = 0;
		rowItemHeight = 0;
		rowIndex = 0;
		lastContentRowId = '';
		contentRows = null;

		bottomMargin = 0;
		animationOngoing = false;
	}

	function registerHandlebarsHelpers() {
		Handlebars.registerHelper('rowidindex', function (value, options) {
			return rowIndex++;
		});

		Handlebars.registerHelper('rowImageWidth', function () {
			if (rowImageWidth === 0) {
				rowImageWidth = calculateImageWidth();
			}
			return rowImageWidth;
		});

		Handlebars.registerHelper('rowItemHeight', function () {
			if (rowItemHeight === 0) {
				rowItemHeight = calculateRowHeight();
			}
			return rowItemHeight;
		});

		Handlebars.registerHelper('isSeries', function (value) {
			return value === 'series';
		});
	}

	SearchResult.prototype.itemClicked = function (item) {
		if (item) {
			//console.log('Item clicked: ', item.id);

			removeEventListeners();

			var split = item.id.split('_');
			if (!split || split.length !== 2) {
				return;
			}

			var row = parseInt(split[0]);

			var itemHeight = calculateRowHeight();
			if (row > 1) {
				bottomMargin = (itemHeight + 40) * (row - 1);
			}
			else {
				bottomMargin = 0;
			}

			toItemPage(row);
		}
	}

	SearchResult.prototype.srRemoveEventListeners = function () {
		removeEventListeners();
	}

	return SearchResult;
}());

function srItemClicked(item) {
	var obj = new SearchResult();
	obj.itemClicked(item);
}

function srRemoveEventListeners() {
	var obj = new SearchResult();
	obj.srRemoveEventListeners();
}
