'use strict';

var ArchiveMain = (function () {

	function ArchiveMain() { }

	var dynamicRowsMap = {};
	var dynamicRowData = {};
	var fourDaysGuide = [];

	var modalVisible = false;

	var recommendedMargin = 0;
	var mostViewedMargin = 0;
	var newestMargin = 0;
	var categoriesMargin = 0;
	var seriesMargin = 0;
	var dynamicRowOneMargin = 0;
	var dynamicRowTwoMargin = 0;
	var dynamicRowThreeMargin = 0;
	var dynamicRowFourMargin = 0;
	var dynamicRowFiveMargin = 0;
	var bottomMargin = 0;
	var animationOngoing = false;

	var rowItemWidth = 0;
	var rowItemHeight = 0;

	var rowFocusWas = null;
	var colFocusWas = [null, null, null, null, null, null, null, null, null, null];

	var recommended = null;
	var mostViewed = null;
	var newest = null;
	var categories = null;
	var series = null;
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
		setLocaleText('topicalSeriesText');

		initArchiveMainVariables();

		setRowHeightValues();

		registerHandlebarsHelpers();

		removeOriginPage();

		pageState = getPageState();

		restoreBottomMargin(pageState);

		showBusyLoaders();

		// get data
		readRecommendedPrograms(getDateByDateIndex(dateIndexToday), 30, 0, pageState);
		readMostViewedPrograms(getArchiveLanguage(), pageState);
		readNewestPrograms(getDateByDateIndex(dateIndexToday), 30, 0, null, pageState);

		if (pageState && pageState.subCategoryId) {
			readSubCategories(pageState, true);
		}
		else {
			readParentCategories(pageState, true);
		}

		readSeries(pageState);

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
					else if (row === seriesRowNumber) {
						toSeriesInfoPage(row, col);
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

		colFocusWas[row] = parseInt(col);

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
				easing: 'easeInOutCirc',
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
		else if (row === 4) {
			rowElement = 'series';
			margin = calculateRightMargin(col, right, seriesMargin);
			seriesMargin = margin;
		}
		else if (row === 5) {
			rowElement = 'dynamicRowOne';
			margin = calculateRightMargin(col, right, dynamicRowOneMargin);
			dynamicRowOneMargin = margin;
		}
		else if (row === 6) {
			rowElement = 'dynamicRowTwo';
			margin = calculateRightMargin(col, right, dynamicRowTwoMargin);
			dynamicRowTwoMargin = margin;
		}
		else if (row === 7) {
			rowElement = 'dynamicRowThree';
			margin = calculateRightMargin(col, right, dynamicRowThreeMargin);
			dynamicRowThreeMargin = margin;
		}
		else if (row === 8) {
			rowElement = 'dynamicRowFour';
			margin = calculateRightMargin(col, right, dynamicRowFourMargin);
			dynamicRowFourMargin = margin;
		}
		else if (row === 9) {
			rowElement = 'dynamicRowFive';
			margin = calculateRightMargin(col, right, dynamicRowFiveMargin);
			dynamicRowFiveMargin = margin;
		}

		if (move) {
			var element = getElementById(rowElement);
			if (element) {
				//console.log('Right margin value: ', margin);

				anime({
					targets: element,
					right: margin + 'px',
					duration: 180,
					easing: 'easeInOutCirc',
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
		else if (row === 5) {
			return dynamicRowData[0][col];
		}
		else if (row === 6) {
			return dynamicRowData[1][col];
		}
		else if (row === 7) {
			return dynamicRowData[2][col];
		}
		else if (row === 8) {
			return dynamicRowData[3][col];
		}
		else if (row === 9) {
			return dynamicRowData[4][col];
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
		else if (row === 4) {
			margin = seriesMargin;
		}
		else if (row === 5) {
			margin = dynamicRowOneMargin;
		}
		else if (row === 6) {
			margin = dynamicRowTwoMargin;
		}
		else if (row === 7) {
			margin = dynamicRowThreeMargin;
		}
		else if (row === 8) {
			margin = dynamicRowFourMargin;
		}
		else if (row === 9) {
			margin = dynamicRowFiveMargin;
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

		//console.log('Saved page state: ', ps);

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
					else if (row === 4) {
						seriesMargin = marginValue;
					}
					else if (row === 5) {
						dynamicRowOneMargin = marginValue;
					}
					else if (row === 6) {
						dynamicRowTwoMargin = marginValue;
					}
					else if (row === 7) {
						dynamicRowThreeMargin = marginValue;
					}
					else if (row === 8) {
						dynamicRowFourMargin = marginValue;
					}
					else if (row === 9) {
						dynamicRowFiveMargin = marginValue;
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
		showElementById('seriesBusyLoader');
		showElementById('dynamicRowOneBusyLoader');
		showElementById('dynamicRowTwoBusyLoader');
		showElementById('dynamicRowThreeBusyLoader');
		showElementById('dynamicRowFourBusyLoader');
		showElementById('dynamicRowFiveBusyLoader');
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

			element = getElementById('seriesContainer');
			if (element) {
				element.style.height = rowHeight + 'px';
			}

			element = getElementById('dynamicRowOneContainer');
			if (element) {
				element.style.height = rowHeight + 'px';
			}

			element = getElementById('dynamicRowTwoContainer');
			if (element) {
				element.style.height = rowHeight + 'px';
			}

			element = getElementById('dynamicRowThreeContainer');
			if (element) {
				element.style.height = rowHeight + 'px';
			}

			element = getElementById('dynamicRowFourContainer');
			if (element) {
				element.style.height = rowHeight + 'px';
			}

			element = getElementById('dynamicRowFiveContainer');
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

	function toSeriesInfoPage(row, col) {
		if (series && series[col]) {
			var sid = series[col].sid;

			savePageState(row, col);

			showElementById('commonBusyLoader');

			getSeriesInfo(sid, function (series) {
				if (series != null) {
					series = series[0];

					series = addSeriesProperties(series, sid);

					//console.log('Selected series: ', series);

					cacheValue(selectedArchiveSeriesKey, jsonToString(series));

					hideElementById('commonBusyLoader');
					toPage(seriesInfoPage, archiveMainPage);
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

	function readSeries(pageState) {
		var seriesData = getValueFromCache(seriesDataKey);
		if (!seriesData) {
			getGuide(getDateByDateIndex(dateIndexDayBeforeYesterday), function (data) {
				fourDaysGuide = data;
				getGuide(getDateByDateIndex(dateIndexYesterday), function (data) {
					fourDaysGuide = fourDaysGuide.concat(data);

					fourDaysGuide = fourDaysGuide.concat(stringToJson(getValueFromCache(programScheduleDataKey)));
					series = removeDuplicatesSeries();

					cacheValue(seriesDataKey, jsonToString(series));
					handleSeries(series, pageState);
				});
			});
		}
		else {
			console.log('**Return series data from cache.');

			series = stringToJson(seriesData);
			handleSeries(series, pageState);
		}
	}

	function handleSeries(series, pageState) {
		if (series) {
			//console.log('Series data: ', series);

			console.log('Series data length: ', series.length);

			addData(series, 'seriesTemplate', 'seriesContainer');

			restoreRightMargin(pageState, 'series', 4);

			hideElementById('seriesBusyLoader');
			changeRowBackgroundColor('seriesContainer', '#ffffff');

			readDynamicRows(pageState);
		}
	}

	function readDynamicRows(pageState) {
		var dynamicData = getValueFromCache(dynamicRowDataKey);
		if (!dynamicData) {
			var guide = removeDuplicatesProgram();

			for (var i = 0; i < guide.length; i++) {
				var g = guide[i];
				if (!g) {
					continue;
				}

				addToMap(g);
			}

			//console.log('Map item: ', dynamicRowsMap);

			var ids = shuffleIds(getCategoryIdsFromMap(4, 54));
			if (ids.length < 5) {
				ids = ids.concat(shuffleIds(getCategoryIdsFromMap(3, 3)));
			}

			//console.log('Ids: ', ids);

			for (var i = 0; i < ids.length; i++) {
				var key = ids[i];
				if (!key) {
					continue;
				}

				var data = null;
				if (dynamicRowsMap[key] && dynamicRowsMap[key].length) {
					data = dynamicRowsMap[key];
				}

				if (i === 0 && data) {
					dynamicRowData[i] = data;
				}
				else if (i === 1 && data) {
					dynamicRowData[i] = data;
				}
				else if (i === 2 && data) {
					dynamicRowData[i] = data;
				}
				else if (i === 3 && data) {
					dynamicRowData[i] = data;
				}
				else if (i === 4 && data) {
					dynamicRowData[i] = data;
				}
			}

			cacheValue(dynamicRowDataKey, jsonToString(dynamicRowData));

			dynamicRowsMap = {};
			fourDaysGuide = [];
		}
		else {
			console.log('**Return dynamic rows data from cache.');
			dynamicRowData = stringToJson(dynamicData);
		}

		//console.log('Dynamic rows data: ', dynamicRowData);

		if (dynamicRowData) {
			prepareElement(dynamicRowData[0], pageState, 'dynamicRowOneText', 'dynamicRowOneTemplate', 'dynamicRowOneContainer',
				'dynamicRowOne', 5, 'dynamicRowOneBusyLoader');

			prepareElement(dynamicRowData[1], pageState, 'dynamicRowTwoText', 'dynamicRowTwoTemplate', 'dynamicRowTwoContainer',
				'dynamicRowTwo', 6, 'dynamicRowTwoBusyLoader');

			prepareElement(dynamicRowData[2], pageState, 'dynamicRowThreeText', 'dynamicRowThreeTemplate', 'dynamicRowThreeContainer',
				'dynamicRowThree', 7, 'dynamicRowThreeBusyLoader');

			prepareElement(dynamicRowData[3], pageState, 'dynamicRowFourText', 'dynamicRowFourTemplate', 'dynamicRowFourContainer',
				'dynamicRowFour', 8, 'dynamicRowFourBusyLoader');

			prepareElement(dynamicRowData[4], pageState, 'dynamicRowFiveText', 'dynamicRowFiveTemplate', 'dynamicRowFiveContainer',
				'dynamicRowFive', 9, 'dynamicRowFiveBusyLoader');
		}
	}

	function prepareElement(data, pageState, textId, templateId, containerId, rowId, rowNumber, busyLoaderId) {
		if (data) {
			addToElement(textId, data[0].category);
			addData(data, templateId, containerId);

			restoreRightMargin(pageState, rowId, rowNumber);

			hideElementById(busyLoaderId);
			changeRowBackgroundColor(containerId, '#ffffff');
		}
		else {
			hideElementById(textId);
			hideElementById(containerId);
		}
	}

	function getGuide(date, cb) {
		getGuideByDate(date, function (gd) {
			if (gd !== null) {
				cb(gd.data);
			}
			else {
				hideElementById('seriesBusyLoader');
				removeEventListeners(true);

				toPage(errorPage, null);
			}
		});
	}

	function shuffleIds(ids) {
		for (var i = ids.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var tmp = ids[i];
			ids[i] = ids[j];
			ids[j] = tmp;
		}
		return ids;
	}

	function getCategoryIdsFromMap(minProgramsInRow, maxProgramsInRow) {
		var ids = [];
		for (var d in dynamicRowsMap) {
			//console.log('Key: ', d, ' Value: ', dynamicRowsMap[d]);

			var arrLen = dynamicRowsMap[d].length;
			if (arrLen >= minProgramsInRow && arrLen <= maxProgramsInRow) {
				ids.push(d);
			}

		}

		//console.log('Ids: ', ids);
		return ids;
	}

	function addToMap(item) {
		if (dynamicRowsMap && item && item.cid) {
			var cid = item.cid;

			var array = dynamicRowsMap[cid];
			if (!array) {
				array = [];
				array.push(item);
			}
			else {
				array.push(item);
			}

			dynamicRowsMap[cid] = array;
		}
	}

	function removeDuplicatesSeries() {
		var seen = [];
		var retVal = [];
		for (var i = 0; i < fourDaysGuide.length; i++) {
			var g = fourDaysGuide[i];
			if (!g) {
				continue;
			}

			var sid = g.sid;
			var episode_number = g.episode_number;
			var is_visible_on_vod = g.is_visible_on_vod;
			var series = g.series;
			var image_path = g.image_path;
			var name_desc = g.name_desc;
			var localStartDate = g.localStartDate;
			var duration_time = g.duration_time;

			if (!validateValue(sid) || !validateValue(episode_number) || !validateValue(is_visible_on_vod)) {
				continue;
			}

			if (Number(episode_number) > 1 && is_visible_on_vod !== '-1' && seen.indexOf(sid) === -1) {
				retVal.push(
					{
						sid: sid,
						series: series,
						image_path: image_path,
						name_desc: name_desc,
						localStartDate: localStartDate,
						duration_time: duration_time
					});
				seen.push(sid);
			}
		}

		return retVal;
	}

	function removeDuplicatesProgram() {
		var seen = [];
		var retVal = [];
		for (var i = 0; i < fourDaysGuide.length; i++) {
			var g = fourDaysGuide[i];
			if (!g) {
				continue;
			}

			var id = g.id;
			var cid = g.cid;
			var category = g.category;
			var is_visible_on_vod = g.is_visible_on_vod;
			var image_path = g.image_path;
			var broadcast_date_time = g.broadcast_date_time;
			var duration_time = g.duration_time;
			var name_desc = g.name_desc;

			if (!validateValue(id) || !validateValue(cid)
				|| !validateValue(category) || !validateValue(is_visible_on_vod)) {
				continue;
			}

			if ((is_visible_on_vod === '1' || is_visible_on_vod === '2') && seen.indexOf(id) === -1) {
				retVal.push(
					{
						id: id,
						cid: cid,
						category: category,
						image_path: image_path,
						broadcast_date_time: broadcast_date_time,
						duration_time: duration_time,
						name_desc: name_desc
					});
				seen.push(id);
			}
		}

		return retVal;
	}

	function validateValue(value) {
		return value && value !== '' && value !== nullValue;
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
		dynamicRowsMap = {};
		dynamicRowData = {};
		fourDaysGuide = [];

		modalVisible = false;

		recommendedMargin = 0;
		mostViewedMargin = 0;
		newestMargin = 0;
		categoriesMargin = 0;
		bottomMargin = 0;
		seriesMargin = 0;
		dynamicRowOneMargin = 0;
		dynamicRowTwoMargin = 0;
		animationOngoing = false;

		rowItemWidth = 0;
		rowItemHeight = 0;

		rowFocusWas = null;
		colFocusWas = [null, null, null, null];

		recommended = null;
		mostViewed = null;
		newest = null;
		categories = null;
		series = null;
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
			else if (value === 'series') {
				itemCount = series.length;
			}
			else if (value === 'dynamicRowOne') {
				itemCount = dynamicRowData[0].length;
			}
			else if (value === 'dynamicRowTwo') {
				itemCount = dynamicRowData[1].length;
			}
			else if (value === 'dynamicRowThree') {
				itemCount = dynamicRowData[2].length;
			}
			else if (value === 'dynamicRowFour') {
				itemCount = dynamicRowData[3].length;
			}
			else if (value === 'dynamicRowFive') {
				itemCount = dynamicRowData[4].length;
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
				categoryLogo = getArchivePageImage();
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

			var height = calculateRowHeight() + 60;

			if (row === 2 || row === 3) {
				bottomMargin = height;
			}
			else if (row === 4 || row === 5 || row === 6 || row === 7 || row === 8 || row === 9) {
				bottomMargin = height * (row - 1);
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
				else if (row === 4) {
					seriesMargin = newRightMargin;
				}
				else if (row === 5) {
					dynamicRowOneMargin = newRightMargin;
				}
				else if (row === 6) {
					dynamicRowTwoMargin = newRightMargin;
				}
				else if (row === 7) {
					dynamicRowThreeMargin = newRightMargin;
				}
				else if (row === 8) {
					dynamicRowFourMargin = newRightMargin;
				}
				else if (row === 9) {
					dynamicRowFiveMargin = newRightMargin;
				}

				rowMoveLeftRight(row, col, true, false);

				savePageState(row, col);

				if (row === 4) {
					toSeriesInfoPage(row, col);
				}
				else {
					toProgramInfoPage(row, col);
				}
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
