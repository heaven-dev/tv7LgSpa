'use strict';

var ArchiveMain = (function () {

	function ArchiveMain() { }

	var modalVisible = false;

	var recommendedMargin = 0;
	var mostViewedMargin = 0;
	var newestMargin = 0;
	var categoriesMargin = 0;
	var bottomMargin = 0;
	var animationOngoing = false;

	var rowItemWidth = 0;
	var rowItemHeight = 0;

	var rowFocusWas = null;
	var colFocusWas = [null, null, null, null];

	var recommended = null;
	var mostViewed = null;
	var newest = null;
	var categories = null;
	var categoryLogo = null;

	var lastParentCategoryId = null;
	var subCategoriesVisible = false;
	var contentContainer = null;

	var pageState = null;

	ArchiveMain.prototype.initArchiveMain = function () {
		showElementById('toolbarContainer');
		showElementById('sidebar');

		setLocaleText('toolbarText');
		setSelectedSidebarIcon(archiveIconContainer,
			[
				tvIconContainer,
				guideIconContainer,
				searchIconContainer,
				favoritesIconContainer,
				channelInfoIconContainer,
				platformInfoIconContainer
			]
		);

		setLocaleText('recommendedProgramsText');
		setLocaleText('mostViewedProgramsText');
		setLocaleText('newestProgramsText');
		setLocaleText('categoriesText');

		initArchiveMainVariables();

		setRowHeightValues();

		registerHandlebarsHelpers();

		removeOriginPage();

		pageState = getPageState();

		restoreBottomMargin(pageState);

		showBusyLoaders();

		// get data
		readRecommendedPrograms(getTodayDate(), 30, 0, pageState);
		readMostViewedPrograms(getArchiveLanguage(), pageState);
		readNewestPrograms(getTodayDate(), 30, 0, null, pageState);

		if (pageState && pageState.subCategoryId) {
			readSubCategories(pageState, true);
		}
		else {
			readParentCategories(pageState, true);
		}

		// add event listener for mousewheel
		contentContainer = getElementById('contentContainer');
		if (contentContainer) {
			contentContainer.addEventListener('mousewheel', amMouseWheelListener);
		}

		// add eventListener for keydown
		amAddKeydownEvenListener();
	}

	function amAddKeydownEvenListener() {
		document.addEventListener('keydown', amKeyDownEventListener);
	}

	function removeEventListeners(removeMouseWheelListener) {
		console.log('***Remove archive main event listeners.');

		document.removeEventListener('keydown', amKeyDownEventListener);
		if (contentContainer && removeMouseWheelListener) {
			contentContainer.removeEventListener('mousewheel', amMouseWheelListener);
		}
	}

	function amMouseWheelListener(e) {
		handleWheelEvent(e);
	}

	function amKeyDownEventListener(e) {
		e.preventDefault();
		e.stopPropagation();

		var keyCode = e.keyCode;
		var contentId = e.target.id;

		//console.log('Key code : ', keyCode, ' Target element: ', contentId);

		var row = null;
		var col = null;
		var split = contentId.split('_');
		if (split.length > 1) {
			row = parseInt(split[0]);
			col = parseInt(split[1]);
		}

		colFocusWas[row] = contentId.split('_')[1];

		if (keyCode === LEFT) {
			// LEFT arrow
			if (modalVisible) {
				if (contentId === exitCancelButton) {
					focusToElement(exitYesButton);
				}
			}
			else {
				if (col === 0) {
					rowFocusWas = contentId;
					focusToElement(archiveIconContainer);
				}
				else {
					var newCol = col - 1;
					var newFocus = row + '_' + newCol;
					if (elementExist(newFocus) && !animationOngoing) {
						animationOngoing = true;

						rowMoveLeftRight(row, newCol, false, true);
						focusToElement(newFocus);
					}
				}
			}
		}
		else if (keyCode === RIGHT) {
			// RIGHT arrow
			if (modalVisible) {
				if (contentId === exitYesButton) {
					focusToElement(exitCancelButton);
				}
			}
			else {
				if (isSideBarMenuActive(contentId)) {
					if (rowFocusWas) {
						focusToElement(rowFocusWas);
					}
					else {
						focusToElement(defaultRowCol);
					}
				}
				else {
					var newCol = col + 1;
					var newFocus = row + '_' + newCol;
					if (elementExist(newFocus) && !animationOngoing) {
						animationOngoing = true;

						rowMoveLeftRight(row, newCol, true, true);
						focusToElement(newFocus);
					}
				}
			}
		}
		else if (keyCode === UP) {
			// UP arrow
			if (!modalVisible) {
				if (isSideBarMenuActive(contentId)) {
					menuMoveUp(contentId);
				}
				else {
					wheelUp(row);
				}
			}
		}
		else if (keyCode === DOWN) {
			// DOWN arrow
			if (!modalVisible) {
				if (isSideBarMenuActive(contentId)) {
					menuMoveDown(contentId);
				}
				else {
					wheelDown(row);
				}
			}
		}
		else if (keyCode === RED) {
			removeEventListeners(true);
			sideMenuSelection(tvMainPage);
		}
		else if (keyCode === YELLOW) {
			removeEventListeners(true);
			sideMenuSelection(guidePage);
		}
		else if (keyCode === BLUE) {
			removeEventListeners(true);
			sideMenuSelection(searchPage);
		}
		else if (keyCode === OK) {
			// OK button
			if (!modalVisible) {
				if (contentId !== archiveIconContainer) {
					removeEventListeners(true);
				}

				if (contentId === archiveIconContainer) {
					focusOutFromMenuEvent(getElementById(tvIconContainer));
					focusToElement(rowFocusWas);
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
				else if (contentId === channelInfoIconContainer) {
					sideMenuSelection(channelInfoPage);
				}
				else if (contentId === platformInfoIconContainer) {
					sideMenuSelection(platformInfoPage);
				}
				else {
					if (row === categoryRowNumber) {
						handleCategorySelection(row, col, pageState);
					}
					else {
						toProgramInfoPage(row, col);
					}
				}
			}
			else {
				var page = getValueFromCache(visiblePageKey);
				if (page && page === archiveMainPage) {
					hideExitModal();
					modalVisible = false;

					if (document.activeElement.id === exitYesButton) {
						// yes selected => exit from application
						exitApplication();
					}
					else {
						// cancel selected => to main view
						focusToElement(rowFocusWas);
					}
				}
			}
		}
		else if (keyCode === RETURN || keyCode === ESC) {
			// RETURN button
			if (!modalVisible) {
				if (isSideBarMenuActive(contentId)) {
					focusOutFromMenuEvent(getElementById(archiveIconContainer));
					focusToElement(rowFocusWas);
				}
				else {
					rowFocusWas = contentId;
					showExitModal();
					modalVisible = true;
				}
			}
			else {
				// to archive main view
				var page = getValueFromCache(visiblePageKey);
				if (page && page === archiveMainPage) {
					hideExitModal();
					modalVisible = false;

					focusToElement(rowFocusWas);
				}
			}
		}
	}

	function wheelUp(row) {
		var newRow = row - 1;
		var newFocus = newRow + '_' + (colFocusWas[newRow] ? colFocusWas[newRow] : 0);
		if (elementExist(newFocus) && !animationOngoing) {
			animationOngoing = true;

			rowMoveUpDown(newRow, false);
			focusToElement(newFocus);
		}
	}

	function wheelDown(row) {
		var newRow = row + 1;
		var newFocus = newRow + '_' + (colFocusWas[newRow] || 0);
		if (elementExist(newFocus) && !animationOngoing) {
			animationOngoing = true;

			rowMoveUpDown(newRow, true);
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

	function rowMoveUpDown(row, down) {
		var rowHeight = calculateRowHeight();
		var rowAndTitleHeight = rowHeight + 60;

		var element = getElementById('contentRows');
		if (element) {
			if (down) {
				if (row > 1) {
					bottomMargin += rowAndTitleHeight;
				}
			}
			else {
				if (row > 0) {
					bottomMargin -= rowAndTitleHeight;
				}
			}

			//console.log('Bottom margin value: ', bottomMargin);

			element.style.bottom = bottomMargin + 'px';
			animationOngoing = false;

			/*
			anime({
				targets: element,
				bottom: bottomMargin + 'px',
				duration: 180,
				easing: 'linear',
				complete: function() {
					animationOngoing = false;
				}
			});
			*/
		}
	}

	function rowMoveLeftRight(row, col, right, move) {
		var rowElement = null;
		var margin = 0;

		if (row === 0) {
			rowElement = 'recommendedPrograms';
			margin = calculateRightMargin(col, right, recommendedMargin);
			recommendedMargin = margin;
		}
		else if (row === 1) {
			rowElement = 'mostViewedPrograms';
			margin = calculateRightMargin(col, right, mostViewedMargin);
			mostViewedMargin = margin;
		}
		else if (row === 2) {
			rowElement = 'newestPrograms';
			margin = calculateRightMargin(col, right, newestMargin);
			newestMargin = margin;
		}
		else if (row === 3) {
			rowElement = 'categories';
			margin = calculateRightMargin(col, right, categoriesMargin);
			categoriesMargin = margin;
		}

		if (move) {
			var element = getElementById(rowElement);
			if (element) {
				//console.log('Right margin value: ', margin);

				anime({
					targets: element,
					right: margin + 'px',
					duration: 180,
					easing: 'linear',
					complete: function () {
						animationOngoing = false;
					}
				});
			}
		}
	}

	function calculateRightMargin(col, right, margin) {
		var itemWidth = calculateItemWidth();
		var itemWidthWithMargin = itemWidth + 10;

		if (col > 1) {
			if (col === 2 && right) {
				margin -= Math.round(itemWidth / 10);
			}

			margin = right ? margin + itemWidthWithMargin : margin - itemWidthWithMargin;
		}
		else {
			margin = 0;
		}

		return margin;
	}

	function handleCategorySelection(row, col, pageState) {
		if (subCategoriesVisible) {
			if (categories) {
				showElementById('categoriesBusyLoader');

				if (col === categories.length) {
					readParentCategories(pageState, false, function (data) {
						categoriesMargin = 0;

						restoreCategoriesTitleText();

						hideElementById('categoriesBusyLoader');

						removeEventListeners(false);
						amAddKeydownEvenListener();
					});
				}
				else {
					savePageState(row, col);
					hideElementById('contentRows');
					hideElementById('categoriesBusyLoader');

					toCategoryProgramsPage(categories[col]);
				}
			}
		}
		else {
			var parentCategoryName = null;
			if (categories && categories[col]) {
				lastParentCategoryId = categories[col].id;
				parentCategoryName = categories[col].name;
			}

			showElementById('categoriesBusyLoader');

			readSubCategories(pageState, false, function (data) {
				if (data && data.length === 1) {
					savePageState(row, col);
					hideElementById('contentRows');
					hideElementById('categoriesBusyLoader');

					toCategoryProgramsPage(data[0]);
				}
				else {
					categoriesMargin = 0;

					changeCategoriesTitleText(parentCategoryName);

					hideElementById('categoriesBusyLoader');

					focusToElement(categoryDefaultRowCol);

					removeEventListeners(false);
					amAddKeydownEvenListener();
				}
			});
		}
	}

	function exitApplication() {
		removeEventListeners(true);
		window.close();
	}

	function getProgramDataByRowAndCol(row, col) {
		if (row === 0) {
			return recommended[col];
		}
		else if (row === 1) {
			return mostViewed[col];
		}
		else if (row === 2) {
			return newest[col];
		}
	}

	function savePageState(row, col) {
		var margin = 0;
		var subCategoryId = null;

		if (row === 0) {
			margin = recommendedMargin;
		}
		else if (row === 1) {
			margin = mostViewedMargin;
		}
		else if (row === 2) {
			margin = newestMargin;
		}
		else if (row === 3) {
			margin = categoriesMargin;
			if (subCategoriesVisible && categories && categories[col]) {
				subCategoryId = categories[col].category_id;
			}
		}

		var ps = {
			row: row,
			col: col,
			focusElementId: row + '_' + col,
			focusRow: row,
			focusCol: col,
			rightMargin: margin,
			bottomMargin: bottomMargin,
			subCategoryId: subCategoryId,
			lastParentCategoryId: lastParentCategoryId
		};

		cacheValue(archivePageStateKey, jsonToString(ps));
	}

	function getPageState() {
		return stringToJson(getValueFromCache(archivePageStateKey));
	}

	function restoreRightMargin(pageState, elementId, row) {
		if (pageState) {
			var marginValue = pageState['rightMargin'];
			var elem = getElementById(elementId);
			if (elem) {
				var focusRow = pageState['focusRow'];

				if (focusRow === row) {
					elem.style.right = marginValue + 'px';

					if (row === 0) {
						recommendedMargin = marginValue;
					}
					else if (row === 1) {
						mostViewedMargin = marginValue;
					}
					else if (row === 2) {
						newestMargin = marginValue;
					}
					else if (row === 3) {
						categoriesMargin = marginValue;
					}

					var focusElementId = pageState['focusElementId']
					if (focusElementId) {
						focusToElement(focusElementId);
					}
				}
			}
		}
	}

	function restoreBottomMargin(pageState) {
		if (pageState) {
			var value = pageState.bottomMargin;
			var elem = getElementById('contentRows');
			if (value && elem) {
				elem.style.bottom = value + 'px';
				bottomMargin = value;
			}
		}
	}

	function showBusyLoaders() {
		showElementById('recommendedBusyLoader');
		showElementById('mostViewedBusyLoader');
		showElementById('newestBusyLoader');
		showElementById('categoriesBusyLoader');
	}

	function changeRowBackgroundColor(elementId, color) {
		var element = getElementById(elementId);
		if (element) {
			element.style.backgroundColor = color;
		}
	}

	function calculateItemWidth() {
		var width = getWindowWidth() - 80 - 40;
		return Math.round(width / 3.2);
	}

	function calculateRowHeight() {
		var height = getWindowHeight() - 90 - 180;
		return Math.round(height / 2.5);
	}

	function setRowHeightValues() {
		var rowHeight = calculateRowHeight();
		if (rowHeight) {
			var element = getElementById('recommendedProgramsContainer');
			if (element) {
				element.style.height = rowHeight + 'px';
			}

			element = getElementById('mostViewedProgramsContainer');
			if (element) {
				element.style.height = rowHeight + 'px';
			}

			element = getElementById('newestProgramsContainer');
			if (element) {
				element.style.height = rowHeight + 'px';
			}

			element = getElementById('categoriesContainer');
			if (element) {
				element.style.height = rowHeight + 'px';
			}
		}
	}

	function toCategoryProgramsPage(category) {
		if (category) {
			cacheValue(selectedCategoryKey, jsonToString(category));
			toPage(categoryProgramsPage, archiveMainPage);
		}
	}

	function toProgramInfoPage(row, col) {
		var data = getProgramDataByRowAndCol(row, col);
		if (data) {
			savePageState(row, col);

			showElementById('commonBusyLoader');

			getProgramInfo(data.id, function (program) {
				if (program !== null) {
					cacheValue(selectedArchiveProgramKey, jsonToString(program[0]));

					hideElementById('commonBusyLoader');
					toPage(programInfoPage, archiveMainPage);
				}
				else {
					hideElementById('commonBusyLoader');
					toPage(errorPage, null);
				}
			});
		}
	}

	function readRecommendedPrograms(date, limit, offset, pageState) {
		getRecommendedPrograms(date, limit, offset, function (data) {
			if (data !== null) {
				recommended = data;

				//console.log('readRecommendedPrograms(): response: ', recommended);

				addData(recommended, 'recommendedTemplate', 'recommendedProgramsContainer');

				restoreRightMargin(pageState, 'recommendedPrograms', 0);

				hideElementById('recommendedBusyLoader');
				changeRowBackgroundColor('recommendedProgramsContainer', '#ffffff');

				if (!pageState) {
					focusToElement(defaultRowCol);
				}
			}
			else {
				removeEventListeners(true);
				hideElementById('recommendedBusyLoader');

				toPage(errorPage, null);
			}
		});
	}

	function readMostViewedPrograms(archiveLanguage, pageState) {
		getMostViewedPrograms(archiveLanguage, function (data) {
			if (data !== null) {
				mostViewed = data;

				//console.log('readMostViewedPrograms(): response: ', mostViewed);

				addData(mostViewed, 'mostViewedTemplate', 'mostViewedProgramsContainer');

				restoreRightMargin(pageState, 'mostViewedPrograms', 1);

				hideElementById('mostViewedBusyLoader');
				changeRowBackgroundColor('mostViewedProgramsContainer', '#ffffff');
			}
			else {
				removeEventListeners(true);
				hideElementById('mostViewedBusyLoader');

				toPage(errorPage, null);
			}
		});
	}

	function readNewestPrograms(date, limit, offset, category, pageState) {
		getNewestPrograms(date, limit, offset, category, function (data) {
			if (data !== null) {
				newest = data;

				//console.log('readNewestPrograms(): response: ', newest);

				addData(newest, 'newestTemplate', 'newestProgramsContainer');

				restoreRightMargin(pageState, 'newestPrograms', 2);

				hideElementById('newestBusyLoader');
				changeRowBackgroundColor('newestProgramsContainer', '#ffffff');
			}
			else {
				removeEventListeners(true);
				hideElementById('newestBusyLoader');

				toPage(errorPage, null);
			}
		});
	}

	function readParentCategories(pageState, pageLoad, cb) {
		getParentCategories(function (data) {
			if (data !== null) {
				categories = data;

				//console.log('readParentCategories(): response: ', categories);

				addData(categories, 'categoriesTemplate', 'categoriesContainer');

				if (pageLoad) {
					restoreRightMargin(pageState, 'categories', 3);

					hideElementById('categoriesBusyLoader');
					changeRowBackgroundColor('categoriesContainer', '#ffffff');
				}
				else {
					focusToElement(categoryDefaultRowCol);
				}

				subCategoriesVisible = false;

				if (cb) {
					cb(categories);
				}
			}
			else {
				removeEventListeners(true);
				hideElementById('categoriesBusyLoader');

				toPage(errorPage, null);
			}
		});
	}

	function readSubCategories(pageState, pageLoad, cb) {
		getSubCategories(function (data) {
			if (data !== null) {
				if (!lastParentCategoryId && pageState) {
					lastParentCategoryId = pageState.lastParentCategoryId;
				}

				lastParentCategoryId = !lastParentCategoryId ? pageState.lastParentCategoryId : lastParentCategoryId;

				categories = filterSubCategories(data, lastParentCategoryId);

				//console.log('readSubCategories(): filtered response: ', categories);

				addData(categories, 'categoriesTemplate', 'categoriesContainer');
				setLocaleText('categoryBackText');

				if (pageLoad) {
					restoreRightMargin(pageState, 'categories', 3);

					hideElementById('categoriesBusyLoader');
					changeRowBackgroundColor('categoriesContainer', '#ffffff');

					changeCategoriesTitleText(categories[0].parent_name);
				}
				else {
					if (cb) {
						cb(categories);
					}
				}

				subCategoriesVisible = true;
			}
			else {
				removeEventListeners(true);
				hideElementById('categoriesBusyLoader');

				toPage(errorPage, null);
			}
		});
	}

	function changeCategoriesTitleText(text) {
		if (text) {
			addToElement('categoriesText', text);
		}
	}

	function restoreCategoriesTitleText() {
		var categoriesText = getLocaleTextById('categoriesText');
		if (categoriesText) {
			addToElement('categoriesText', categoriesText);
		}
	}

	function initArchiveMainVariables() {
		modalVisible = false;

		recommendedMargin = 0;
		mostViewedMargin = 0;
		newestMargin = 0;
		categoriesMargin = 0;
		bottomMargin = 0;
		animationOngoing = false;

		rowItemWidth = 0;
		rowItemHeight = 0;

		rowFocusWas = null;
		colFocusWas = [null, null, null, null];

		recommended = null;
		mostViewed = null;
		newest = null;
		categories = null;
		categoryLogo = null;

		lastParentCategoryId = null;
		subCategoriesVisible = false;
		contentContainer = null;
	}

	function registerHandlebarsHelpers() {
		Handlebars.registerHelper('incIdx', function (value) {
			return parseInt(value) + 1;
		});

		Handlebars.registerHelper('rowWidth', function (value) {
			var itemCount = 0;
			var itemWidth = calculateItemWidth() + 20;
			if (value === 'recommended') {
				itemCount = recommended.length;
			}
			else if (value === 'mostViewed') {
				itemCount = mostViewed.length;
			}
			else if (value === 'newest') {
				itemCount = newest.length;
			}
			else if (value === 'categories') {
				itemCount = categories.length + 1;
			}

			return itemWidth * itemCount;
		});

		Handlebars.registerHelper('rowItemWidth', function (value) {
			if (rowItemWidth === 0) {
				rowItemWidth = calculateItemWidth();
			}
			return rowItemWidth + value;
		});

		Handlebars.registerHelper('rowItemHeight', function (value) {
			if (rowItemHeight === 0) {
				rowItemHeight = calculateRowHeight();
			}
			return rowItemHeight + value;
		});

		Handlebars.registerHelper('categoryLogo', function () {
			if (categoryLogo === null) {
				categoryLogo = getCategoryLogo();
			}
			return categoryLogo;
		});
	}

	ArchiveMain.prototype.itemClicked = function (item) {
		if (item) {
			//console.log('Item clicked: ', item.id);

			removeEventListeners(true);

			var split = item.id.split('_');
			if (!split || split.length !== 2) {
				return;
			}

			var row = parseInt(split[0]);
			var col = parseInt(split[1]);

			var itemWidth = calculateItemWidth();
			var newRightMargin = (itemWidth + 10) * (col - 2);

			if (col > 2) {
				newRightMargin -= Math.round(itemWidth / 10);
			}

			if (row === 2 || row === 3) {
				bottomMargin = calculateRowHeight() + 60;
			}
			else {
				bottomMargin = 0;
			}

			if (row !== 3) {
				if (row === 0) {
					recommendedMargin = newRightMargin;
				}
				else if (row === 1) {
					mostViewedMargin = newRightMargin;
				}
				else if (row === 2) {
					newestMargin = newRightMargin;
				}

				rowMoveLeftRight(row, col, true, false);

				savePageState(row, col);
				toProgramInfoPage(row, col);
			}
			else {
				categoriesMargin = newRightMargin;
				rowMoveLeftRight(row, col, true, false);
				rowMoveUpDown(3, true);

				handleCategorySelection(row, col, getPageState());
			}
		}
	}

	ArchiveMain.prototype.amRemoveEventListeners = function (removeMouseWheelListener) {
		removeEventListeners(removeMouseWheelListener);
	}

	ArchiveMain.prototype.exitButtonClicked = function (item) {
		if (!item) {
			return;
		}

		if (item.id === exitYesButton) {
			exitApplication();
		}
		else {
			hideExitModal();
			modalVisible = false;
			focusToElement(rowFocusWas);
		}
	}

	return ArchiveMain;

}());

function amItemClicked(item) {
	var obj = new ArchiveMain();
	obj.itemClicked(item);
}

function amRemoveEventListeners() {
	var obj = new ArchiveMain();
	obj.amRemoveEventListeners(true);
}

function amExitButtonClicked(item) {
	var obj = new ArchiveMain();
	obj.exitButtonClicked(item);
}
