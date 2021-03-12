'use strict';

var CategoryPrograms = (function () {

	function CategoryPrograms() { }

	var selectedCategory = null;
	var limit = 16;
	var offset = 0;
	var categoryProgramData = [];
	var loadingData = false;
	var animationOngoing = false;
	var lastContentRowId = '';
	var contentRows = null;

	var rowImageWidth = 0;
	var rowItemHeight = 0;
	var rowIndex = 0;

	var bottomMargin = 0;

	CategoryPrograms.prototype.initCategoryPrograms = function () {
		showElementById('toolbarContainer');
		showElementById('sidebar');

		initCategoryProgramVariables();

		setLocaleText('toolbarText');
		setSelectedSidebarIcon(archiveIconContainer, [tvIconContainer, guideIconContainer, searchIconContainer, favoritesIconContainer, platformInfoIconContainer]);

		registerHandlebarsHelpers();

		selectedCategory = stringToJson(getValueFromCache(selectedCategoryKey));
		if (selectedCategory) {
			updateProperties();

			//console.log('Selected category: ', selectedCategory);

			addToElement('categoryText', getLocaleTextById('categoryText') + ': ' + selectedCategory.name);

			var pageState = getPageState();
			if (pageState) {
				//console.log('**Restore categories data from cache.');
				restorePageState(pageState);
			}
			else {
				getCategoryProgramsData('0_c');
			}
		}

		// add event listener for mousewheel
		contentRows = getElementById('contentRows');
		if (contentRows) {
			contentRows.addEventListener('mousewheel', cpMouseWheelListener);
		}

		// add eventListener for keydown
		document.addEventListener('keydown', cpKeyDownEventListener);
	}

	function removeEventListeners() {
		console.log('***Remove category programs event listeners.');

		document.removeEventListener('keydown', cpKeyDownEventListener);
		if (contentRows) {
			contentRows.removeEventListener('mousewheel', cpMouseWheelListener);
		}
	}

	function cpMouseWheelListener(e) {
		handleWheelEvent(e);
	}

	function cpKeyDownEventListener(e) {
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
				toPreviousPage(archiveMainPage);
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

			if (row > 0 && offset > 0 && row + limit / 2 === categoryProgramData.length) {
				getCategoryProgramsData(newFocus);
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
		var element = getElementById('categoryProgramsContainer');
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

	function toItemPage(row) {
		if (categoryProgramData && categoryProgramData[row]) {
			savePageState(row);

			if (categoryProgramData[row].sid) {
				cacheValue(selectedArchiveProgramKey, jsonToString(categoryProgramData[row]));
				toPage(seriesPage, categoryProgramsPage);
			}
			else {
				showElementById('categoryProgramsBusyLoader');

				getProgramInfo(categoryProgramData[row].id, function (program) {
					if (program !== null) {
						cacheValue(selectedArchiveProgramKey, jsonToString(program[0]));

						hideElementById('categoryProgramsBusyLoader');

						toPage(programInfoPage, categoryProgramsPage);
					}
					else {
						hideElementById('categoryProgramsBusyLoader');
						toPage(errorPage, null);
					}
				});

			}
		}
	}

	function updateProperties() {
		if (selectedCategory.parent_id) {
			selectedCategory.id = selectedCategory.category_id;

			if (selectedCategory.category_name !== selectedCategory.parent_name) {
				selectedCategory.name = selectedCategory.parent_name + ' | ' + selectedCategory.category_name;
			}
			else {
				selectedCategory.name = selectedCategory.category_name;
			}
		}
	}

	function getCategoryProgramsData(focusElement) {
		loadingData = true;
		showElementById('categoryProgramsBusyLoader');

		getCategoryPrograms(selectedCategory.id, limit, offset, function (data) {
			if (data !== null) {
				categoryProgramData = categoryProgramData.concat(data);

				//console.log('Category programs data: ', categoryProgramData);

				if (data) {
					if (data.length < limit) {
						limit = -1;
						offset = -1;
					}
					else {
						offset = offset + data.length;
					}
				}

				addData(data, 'categoryProgramsTemplate', 'categoryProgramsContainer', true);

				hideElementById('categoryProgramsBusyLoader');

				focusToElement(focusElement);

				loadingData = false;
			}
			else {
				removeEventListeners();
				hideElementById('categoryProgramsBusyLoader');

				toPage(errorPage, null);
			}
		});
	}

	function getPageState() {
		var value = getValueFromCache(categoriesPageStateKey);
		if (value) {
			return stringToJson(value);
		}
		return null;
	}

	function savePageState(row) {
		var pageState = {
			row: row,
			bottomMargin: bottomMargin,
			categoryProgramData: JSON.stringify(categoryProgramData),
			limit: limit,
			offset: offset
		}

		cacheValue(categoriesPageStateKey, jsonToString(pageState));
	}

	function deletePageState() {
		removeValueFromCache(categoriesPageStateKey);
	}

	function restorePageState(ps) {
		if (ps) {
			showElementById('categoryProgramsBusyLoader');

			bottomMargin = ps.bottomMargin;
			var element = getElementById('categoryProgramsContainer');
			if (element) {
				element.style.bottom = bottomMargin + 'px';
			}

			categoryProgramData = stringToJson(ps.categoryProgramData);
			addData(categoryProgramData, 'categoryProgramsTemplate', 'categoryProgramsContainer', true);

			var focusRow = ps.row + '_c';
			focusToElement(focusRow);

			limit = ps.limit;
			offset = ps.offset;

			deletePageState();

			hideElementById('categoryProgramsBusyLoader');
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

	function initCategoryProgramVariables() {
		selectedCategory = null;
		limit = 16;
		offset = 0;
		categoryProgramData = [];
		loadingData = false;
		animationOngoing = false;
		lastContentRowId = '';
		contentRows = null;

		rowImageWidth = 0;
		rowItemHeight = 0;
		rowIndex = 0;

		bottomMargin = 0;
	}

	function registerHandlebarsHelpers() {
		Handlebars.registerHelper('rowidindex', function () {
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

		Handlebars.registerHelper('isSeries', function (sid) {
			return sid && sid !== '' && sid !== nullValue;
		});
	}

	CategoryPrograms.prototype.itemClicked = function (item) {
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

	CategoryPrograms.prototype.cpRemoveEventListeners = function () {
		removeEventListeners();
	}

	return CategoryPrograms;
}());

function cpItemClicked(item) {
	var obj = new CategoryPrograms();
	obj.itemClicked(item);
}

function cpRemoveEventListeners() {
	var obj = new CategoryPrograms();
	obj.cpRemoveEventListeners();
}
