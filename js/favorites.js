'use strict';

var Favorites = (function () {

	function Favorites() { }

	var favoritesData = [];

	var rowImageWidth = 0;
	var rowItemHeight = 0;
	var rowIndex = 0;
	var lastContentRowId = '';
	var contentRows = null;

	var bottomMargin = 0;
	var animationOngoing = false;

	Favorites.prototype.initFavorites = function () {
		showElementById('toolbarContainer');
		showElementById('sidebar');

		setLocaleText('toolbarText');
		setSelectedSidebarIcon(favoritesIconContainer,
			[
				tvIconContainer,
				archiveIconContainer,
				guideIconContainer,
				searchIconContainer,
				channelInfoIconContainer,
				platformInfoIconContainer
			]
		);

		setLocaleText('favoritesText');

		initFavoriteVariables();

		registerHandlebarsHelpers();

		var pageState = getPageState();
		if (pageState) {
			//console.log('**Restore favorites data from cache.');
			restorePageState(pageState);
		}
		else {
			favoritesData = getSavedValue(favoritesDataKey + getArchiveLanguage());
			if (favoritesData) {
				favoritesData = stringToJson(favoritesData);
				addDataToPage();
			}
			else {
				showNoFavoritesText();
			}
		}

		// add event listener for mousewheel
		contentRows = getElementById('contentRows');
		if (contentRows) {
			contentRows.addEventListener('mousewheel', faMouseWheelListener);
		}

		// add eventListener for keydown
		document.addEventListener('keydown', faKeyDownEventListener);
	}

	function removeEventListeners() {
		console.log('***Remove favorites event listeners.');

		document.removeEventListener('keydown', faKeyDownEventListener);
		if (contentRows) {
			contentRows.removeEventListener('mousewheel', faMouseWheelListener);
		}
	}

	function faMouseWheelListener(e) {
		handleWheelEvent(e);
	}

	function faKeyDownEventListener(e) {
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

		e.preventDefault();

		if (keyCode === LEFT) {
			// LEFT arrow
			if (!isSideBarMenuActive(contentId)) {
				focusToElement(favoritesIconContainer);
			}
		}
		else if (keyCode === RIGHT) {
			// RIGHT arrow				
			if (isSideBarMenuActive(contentId)) {
				if (favoritesData && favoritesData.length > 0) {
					focusToElement(lastContentRowId);
				}
				else {
					focusToElement('favoritesText');
				}
			}
		}
		else if (keyCode === UP) {
			// UP arrow
			if (!isSideBarMenuActive(contentId)) {
				var newRow = row - 1;
				var newFocus = newRow + '_' + col;
				if (elementExist(newFocus) && !animationOngoing) {
					animationOngoing = true;

					rowMoveDownUp(row, false);
					focusToElement(newFocus);
				}
			}
			else {
				menuMoveUp(contentId);
			}
		}
		else if (keyCode === DOWN) {
			// DOWN arrow
			if (!isSideBarMenuActive(contentId)) {
				var newRow = row + 1;
				var newFocus = newRow + '_' + col;
				if (elementExist(newFocus) && !animationOngoing) {
					animationOngoing = true;

					rowMoveDownUp(row, true);
					focusToElement(newFocus);
				}
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
			if (contentId !== favoritesIconContainer) {
				removeEventListeners();
			}

			if (contentId === archiveIconContainer) {
				sideMenuSelection(archiveMainPage);
			}
			else if (contentId === tvIconContainer) {
				sideMenuSelection(tvMainPage);
			}
			else if (contentId === guideIconContainer) {
				sideMenuSelection(guidePage);
			}
			else if (contentId === channelInfoIconContainer) {
				sideMenuSelection(channelInfoPage);
			}
			else if (contentId === searchIconContainer) {
				sideMenuSelection(searchPage);
			}
			else if (contentId === favoritesIconContainer) {
				focusOutFromMenuEvent(getElementById(favoritesIconContainer));

				if (favoritesData && favoritesData.length > 0) {
					focusToElement(lastContentRowId);
				}
				else {
					focusToElement('favoritesText');
				}
			}
			else if (contentId === platformInfoIconContainer) {
				sideMenuSelection(platformInfoPage);
			}
			else {
				toInfoPage(row);
			}
		}
		else if (keyCode === RETURN || keyCode === ESC) {
			// RETURN button
			if (isSideBarMenuActive(contentId)) {
				focusOutFromMenuEvent(getElementById(favoritesIconContainer));
				if (favoritesData && favoritesData.length > 0) {
					focusToElement(lastContentRowId);
				}
				else {
					focusToElement('favoritesText');
				}
			}
			else {
				removeEventListeners();
				toPage(archiveMainPage, favoritesPage);
			}
		}
	}

	function toInfoPage(row) {
		if (favoritesData && favoritesData[row]) {
			showElementById('favoritesBusyLoader');

			savePageState(row);

			var id = favoritesData[row].id;
			var is_series = favoritesData[row].is_series;
			var sid = favoritesData[row].sid;

			if (is_series) {
				getSeriesInfo(sid, function (series) {
					if (series !== null) {
						series = series[0];

						series = addSeriesProperties(series, sid);

						cacheValue(selectedArchiveSeriesKey, jsonToString(series));

						hideElementById('favoritesBusyLoader');

						toPage(seriesInfoPage, favoritesPage);
					}
					else {
						hideElementById('favoritesBusyLoader');
						toPage(errorPage, null);
					}
				});
			}
			else {
				getProgramInfo(id, function (program) {
					if (program !== null) {
						program = program[0];

						cacheValue(selectedArchiveProgramKey, jsonToString(program));

						hideElementById('favoritesBusyLoader');
						toPage(programInfoPage, favoritesPage);
					}
					else {
						hideElementById('favoritesBusyLoader');
						toPage(errorPage, null);
					}
				});
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

	function rowMoveDownUp(row, down) {
		var element = getElementById('favoritesContainer');
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
		var value = getValueFromCache(favoritesPageStateKey);
		if (value) {
			return stringToJson(value);
		}
		return null;
	}

	function savePageState(row) {
		var pageState = {
			row: row,
			favoritesCount: favoritesData.length,
			bottomMargin: bottomMargin
		}

		cacheValue(favoritesPageStateKey, jsonToString(pageState));
	}

	function deletePageState() {
		removeValueFromCache(favoritesPageStateKey);
	}

	function restorePageState(ps) {
		if (ps) {
			showElementById('favoritesBusyLoader');

			var savedFavoritesCount = 0;
			favoritesData = getSavedValue(favoritesDataKey + getArchiveLanguage());
			if (favoritesData) {
				favoritesData = stringToJson(favoritesData);
				savedFavoritesCount = favoritesData.length;
			}

			var sameCount = savedFavoritesCount === parseInt(ps.favoritesCount);

			bottomMargin = sameCount ? ps.bottomMargin : 0;
			var element = getElementById('favoritesContainer');
			if (element) {
				element.style.bottom = bottomMargin + 'px';
			}

			addData(favoritesData, 'favoritesTemplate', 'favoritesContainer', true);

			var focusRow = sameCount ? ps.row + '_c' : '0_c';
			focusToElement(focusRow);

			deletePageState();

			if (!favoritesData || favoritesData.length === 0) {
				showNoFavoritesText();
			}

			hideElementById('favoritesBusyLoader');
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

	function addDataToPage() {
		showElementById('favoritesBusyLoader');

		addData(favoritesData, 'favoritesTemplate', 'favoritesContainer', true);

		hideElementById('favoritesBusyLoader');

		//console.log('Favorites data: ', favoritesData);

		if (favoritesData && favoritesData.length > 0) {
			focusToElement('0_c');
		}
		else {
			showNoFavoritesText();
		}
	}

	function showNoFavoritesText() {
		setLocaleText('noFavoritesText');
		showElementById('noFavoritesText');

		focusToElement('favoritesText');
	}

	function initFavoriteVariables() {
		favoritesData = [];

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
			return value === true;
		});
	}

	Favorites.prototype.itemClicked = function (item) {
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

			toInfoPage(row);
		}
	}

	Favorites.prototype.faRemoveEventListeners = function () {
		removeEventListeners();
	}

	return Favorites;
}());

function faItemClicked(item) {
	var obj = new Favorites();
	obj.itemClicked(item);
}

function faRemoveEventListeners() {
	var obj = new Favorites();
	obj.faRemoveEventListeners();
}
