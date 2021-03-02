'use strict';

var SeriesPrograms = (function () {

	function SeriesPrograms() { }

	var selectedProgram = null;
	var limit = 16;
	var offset = 0;
	var seriesData = [];
	var seriesId = null;
	var loadingData = false;
	var animationOngoing = false;

	var rowImageWidth = 0;
	var rowItemHeight = 0;
	var rowIndex = 0;
	var lastContentRowId = '';
	var contentRows = null;

	var detailsFontSize = 0;

	var bottomMargin = 0;

	SeriesPrograms.prototype.initSeriesPrograms = function () {
		showElementById('toolbarContainer');
		showElementById('sidebar');

		setLocaleText('toolbarText');
		setSelectedSidebarIcon(archiveIconContainer, [tvIconContainer, guideIconContainer, searchIconContainer, favoritesIconContainer, platformInfoIconContainer]);

		setLocaleText('seriesText');

		initSeriesProgramsVariables();

		registerHandlebarsHelpers();

		selectedProgram = stringToJson(getValueFromCache(selectedArchiveProgramKey));
		if (selectedProgram) {
			//console.log('Selected program: ', selectedProgram);

			checkSeriesId();

			var pageState = getPageState();
			if (pageState) {
				//console.log('**Restore series data from cache.');
				restorePageState(pageState);
			}
			else {
				getSeriesData('0_c', true);
			}
		}

		// add event listener for mousewheel
		contentRows = getElementById('contentRows');
		if (contentRows) {
			contentRows.addEventListener('mousewheel', siMouseWheelListener);
		}

		// add eventListener for keydown
		document.addEventListener('keydown', siKeyDownEventListener);
	}

	function removeEventListeners() {
		console.log('***Remove series programs event listeners.');

		document.removeEventListener('keydown', siKeyDownEventListener);
		if (contentRows) {
			contentRows.removeEventListener('mousewheel', siMouseWheelListener);
		}
	}

	function siMouseWheelListener(event) {
		handleWheelEvent(event);
	}

	function siKeyDownEventListener(e) {
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
				focusToElement(archiveIconContainer);
			}
		}
		else if (keyCode === RIGHT) {
			// RIGHT arrow				
			if (isSideBarMenuActive(contentId)) {
				focusToElement(lastContentRowId);
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
				focusOutFromMenuEvent(getElementById(archiveIconContainer));
				focusToElement(lastContentRowId);
			}
			else {
				removeEventListeners();
				toPreviousPage(categoryProgramsPage);
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
		if (elementExist(newFocus) && !loadingData && !animationOngoing) {
			animationOngoing = true;

			rowMoveDownUp(row, true);
			focusToElement(newFocus);

			if (row > 0 && offset > 0 && row + limit / 2 === seriesData.length) {
				getSeriesData(newFocus, false);
			}
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
		var element = getElementById('seriesProgramsContainer');
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

	function checkSeriesId() {
		if (selectedProgram.sid && selectedProgram.sid !== '') {
			seriesId = selectedProgram.sid;
		}
		else if (selectedProgram.series_id && selectedProgram.series_id !== '') {
			seriesId = selectedProgram.series_id;
		}
	}

	function getSeriesData(focusElement, firstLoad) {
		loadingData = true;
		showElementById('seriesBusyLoader');

		getSeriesPrograms(seriesId, limit, offset, function (data) {
			seriesData = seriesData.concat(data);

			//console.log('Series data: ', seriesData);

			if (data) {
				if (data.length < limit) {
					limit = -1;
					offset = -1;
				}
				else {
					offset = offset + data.length;
				}

				if (firstLoad) {
					setTitleText();
				}
			}

			addData(data, 'seriesTemplate', 'seriesProgramsContainer', true);

			hideElementById('seriesBusyLoader');

			focusToElement(focusElement);

			loadingData = false;
		});
	}

	function toItemPage(row) {
		if (seriesData && seriesData[row]) {
			showElementById('seriesBusyLoader');

			getProgramInfo(seriesData[row].id, function (program) {
				cacheValue(selectedArchiveProgramKey, jsonToString(program[0]));

				savePageState(row);

				hideElementById('seriesBusyLoader');
				toPage(programInfoPage, seriesPage);
			});
		}
	}

	function getPageState() {
		var value = getValueFromCache(seriesPageStateKey);
		if (value) {
			return stringToJson(value);
		}
		return null;
	}

	function savePageState(row) {
		var pageState = {
			row: row,
			bottomMargin: bottomMargin,
			seriesData: JSON.stringify(seriesData),
			limit: limit,
			offset: offset
		}

		cacheValue(seriesPageStateKey, jsonToString(pageState));
	}

	function deletePageState() {
		removeValueFromCache(seriesPageStateKey);
	}

	function restorePageState(ps) {
		if (ps) {
			showElementById('seriesBusyLoader');

			bottomMargin = ps.bottomMargin;
			var element = getElementById('seriesProgramsContainer');
			if (element) {
				element.style.bottom = bottomMargin + 'px';
			}

			seriesData = stringToJson(ps.seriesData);

			setTitleText();

			addData(seriesData, 'seriesTemplate', 'seriesProgramsContainer', true);

			var focusRow = ps.row + '_c';
			focusToElement(focusRow);

			limit = ps.limit;
			offset = ps.offset;

			deletePageState();

			hideElementById('seriesBusyLoader');
		}
	}

	function setTitleText() {
		if (seriesData[0] && seriesData[0].series_name) {
			var seriesName = getLocaleTextById('seriesText') + ': ' + seriesData[0].series_name;
			addToElement('seriesText', seriesName);
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

	function initSeriesProgramsVariables() {
		selectedProgram = null;
		limit = 16;
		offset = 0;
		seriesData = [];
		seriesId = null;
		loadingData = false;
		animationOngoing = false;

		rowImageWidth = 0;
		rowItemHeight = 0;
		rowIndex = 0;
		lastContentRowId = '';
		contentRows = null;

		detailsFontSize = 0;

		bottomMargin = 0;
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

		Handlebars.registerHelper('detailsFontSize', function () {
			if (detailsFontSize === 0) {

				if (rowItemHeight === 0) {
					rowItemHeight = calculateRowHeight();
				}

				detailsFontSize = parseInt(13 / 100 * rowItemHeight);
			}
			return detailsFontSize;
		});
	}

	SeriesPrograms.prototype.itemClicked = function (item) {
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

	SeriesPrograms.prototype.siRemoveEventListeners = function () {
		removeEventListeners();
	}

	return SeriesPrograms;
}());

function siItemClicked(item) {
	var obj = new SeriesPrograms();
	obj.itemClicked(item);
}

function siRemoveEventListeners() {
	var obj = new SeriesPrograms();
	obj.siRemoveEventListeners();
}
