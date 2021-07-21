'use strict';

var TvMain = (function () {

	function TvMain() { }

	var modalVisible = false;
	var interval = null;
	var programStartTime = null;
	var guideIndex = 0;
	var guideData = null;
	var guideDataCount = 10;
	var programsCount = 11;
	var guideRowHeight = 0;

	TvMain.prototype.initTvMain = function () {
		showElementById('toolbarContainer');
		showElementById('sidebar');

		setLocaleText('toolbarText');
		setSelectedSidebarIcon(tvIconContainer,
			[
				archiveIconContainer,
				guideIconContainer,
				searchIconContainer,
				favoritesIconContainer,
				channelInfoIconContainer,
				platformInfoIconContainer
			]
		);

		setLocaleText('liveText');
		setLocaleText('nextProgramsText');

		initTvMainVariables();

		removeOriginPage();

		var tvMainContentContainer = getElementById('tvMainContentContainer');
		if (tvMainContentContainer) {
			tvMainContentContainer.style.height = (getWindowHeight() - 90 - 20) + 'px';
		}

		var guideContainer = getElementById('guideContainer');
		if (guideContainer) {
			guideRowHeight = (guideContainer.offsetHeight - 32) / guideDataCount;
		}

		guideData = getValueFromCache(programScheduleDataKey);
		if (guideData) {
			guideData = JSON.parse(guideData);
			//console.log('Program count: ', guideData.length);
		}

		updatePage();

		focusToElement(playButton);

		// add eventListener for keydown
		document.addEventListener('keydown', tmKeyDownEventListener);

		addInterval();
	}

	function removeEventListeners() {
		console.log('***Remove TV main event listeners.');
		document.removeEventListener('keydown', tmKeyDownEventListener);
	}

	function tmKeyDownEventListener(e) {
		e.preventDefault();
		e.stopPropagation();

		var keyCode = e.keyCode;
		var contentId = e.target.id;

		//console.log('Key code : ', keyCode);

		if (keyCode === LEFT) {
			// LEFT arrow
			if (modalVisible) {
				if (contentId === exitCancelButton) {
					focusToElement(exitYesButton);
				}
			}
			else {
				if (contentId === upDownIcon) {
					focusToElement(playButton);
				}
				else if (contentId === playButton) {
					focusToElement(tvIconContainer)
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
					focusToElement(playButton);
				}
				else if (contentId === playButton) {
					focusToElement(upDownIcon);
				}
			}
		}
		else if (keyCode === UP) {
			// UP arrow
			if (!modalVisible) {
				if (contentId === upDownIcon && guideIndex > 0 && !isOngoingProgram(guideData, guideIndex)) {
					guideIndex--;
					updateGuide(getGuideData(guideData, guideIndex, guideDataCount));
				}
				else {
					menuMoveUp(contentId);
				}
			}
		}
		else if (keyCode === DOWN) {
			// DOWN arrow
			if (!modalVisible) {
				if (contentId === upDownIcon && isInIndex(guideData, guideIndex + guideDataCount)) {
					guideIndex++;
					updateGuide(getGuideData(guideData, guideIndex, guideDataCount));
				}
				else {
					menuMoveDown(contentId);
				}
			}
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
			if (!modalVisible) {
				if (contentId !== tvIconContainer) {
					removeEventListeners();
				}

				if (contentId === playButton) {
					// open video page
					toPlayerPage();
				}
				else if (contentId === tvIconContainer) {
					focusOutFromMenuEvent(getElementById(tvIconContainer));
					focusToElement(playButton);
				}
				else if (contentId === archiveIconContainer) {
					sideMenuSelection(archiveMainPage);
					stopInterval();
				}
				else if (contentId === guideIconContainer) {
					sideMenuSelection(guidePage);
					stopInterval();
				}
				else if (contentId === searchIconContainer) {
					sideMenuSelection(searchPage);
					stopInterval();
				}
				else if (contentId === favoritesIconContainer) {
					sideMenuSelection(favoritesPage);
					stopInterval();
				}
				else if (contentId === channelInfoIconContainer) {
					sideMenuSelection(channelInfoPage);
					stopInterval();
				}
				else if (contentId === platformInfoIconContainer) {
					sideMenuSelection(platformInfoPage);
					stopInterval();
				}
			}
			else {
				var page = getValueFromCache(visiblePageKey);
				if (page && page === tvMainPage) {
					hideExitModal();
					modalVisible = false;

					if (contentId === exitYesButton) {
						// yes selected => exit from application
						exitApplication();
					}
					else {
						// cancel selected => to main view
						focusToElement(playButton);
					}
				}
			}
		}
		else if (keyCode === RETURN || keyCode === ESC) {
			// RETURN button
			if (!modalVisible) {
				if (isSideBarMenuActive(contentId)) {
					focusOutFromMenuEvent(getElementById(tvIconContainer));
					focusToElement(playButton);
				}
				else {
					showExitModal();
					modalVisible = true;
				}
			}
			else {
				// to tv main view
				var page = getValueFromCache(visiblePageKey);
				if (page && page === tvMainPage) {
					hideExitModal();
					modalVisible = false;

					focusToElement(playButton);
				}
			}
		}
	}

	function exitApplication() {
		removeEventListeners();
		stopInterval();
		window.close();
	}

	function toPlayerPage() {
		toPage(tvPlayerPage, tvMainPage);

		stopInterval();
	}

	function addInterval() {
		// Update content at specific interval
		interval = setInterval(function () {
			refreshData();
			updatePage(true);
		}, mainPageUpdateInterval);
	}

	function refreshData() {
		if (!guideData) {
			return;
		}

		var count = guideData.length - getOngoingProgramIndex(guideData);
		if (count <= programListMinSize) {
			// get today and tomorrow guide and update the page
			getGuideByDate(getDateByDateIndex(dateIndexToday), function (gToday) {
				if (gToday !== null) {
					gToday = gToday.data;

					getGuideByDate(getDateByDateIndex(dateIndexTomorrow), function (gTomorrow) {
						if (gTomorrow !== null) {
							guideData = gToday.concat(gTomorrow.data);

							cacheValue(programScheduleDataKey, JSON.stringify(guideData));

							updatePage(true);
						}
						else {
							removeEventListeners();
							stopInterval();

							toPage(errorPage, null);
						}
					});
				}
				else {
					removeEventListeners();
					stopInterval();

					toPage(errorPage, null);
				}
			});
		}
	}

	function stopInterval() {
		if (interval) {
			clearInterval(interval);
			interval = null;
		}
	}

	function updatePage(fromTimer) {
		//console.log('Update page.');

		var programs = getOngoingAndComingPrograms(guideData, programsCount);

		//console.log('Programs data: ', programs);

		if (programs && programs.length === programsCount) {
			var program = programs[0];

			//console.log('Program: ', program);

			var startTime = program.time;

			//console.log('startTime: ', startTime, ' programStartTime: ', programStartTime);

			if (startTime === programStartTime) {
				// update only status bar
				//console.log('Update only status bar.');

				elem = getElementById('statusBar');
				if (elem) {
					elem.style.width = program.passedPercent + '%';
				}
			}
			else {
				// update images, texts guide, and status bar
				//console.log('Update images, texts and status bar.');

				var elem = getElementById('contentImage');
				if (elem) {
					if (program.image_path && program.image_path.length > 0) {
						elem.src = program.image_path;
					}
					else {
						elem.src = 'images/tv7logo.png';
					}

					showElement(elem);
				}

				elem = getElementById('statusBar');
				if (elem) {
					elem.style.width = program.passedPercent + '%';
				}

				var descText = program.localStartTime;
				if (program.series) {
					descText += (' ' + program.series);

					if (program.name) {
						descText += (' | ' + program.name);
					}
				}
				else {
					descText += (' ' + program.name);
				}

				addToElement('descText', descText);

				// Next programs
				var row = 1;
				var col = 1
				for (var i = 1; i < programsCount; i++) {
					var elemIdImg = 'nextProgramsImg';
					var elemIdDesc = 'nextProgramsDesc';

					if (i === 6) {
						row = 2;
						col = 1;
					}

					elemIdImg += String(row) + String(col);
					elemIdDesc += String(row) + String(col);

					elem = getElementById(elemIdImg);
					if (elem) {
						if (programs[i].image_path && programs[i].image_path.length > 0) {
							elem.src = programs[i].image_path;
						}
						else {
							elem.src = 'images/tv7logo.png';
						}
					}

					if (programs[i].series) {
						addToElement(elemIdDesc, programs[i].localStartTime + ' ' + programs[i].series);
					}
					else {
						addToElement(elemIdDesc, programs[i].localStartTime + ' ' + programs[i].name);
					}

					col++;
				}

				if (!fromTimer) {
					updateGuide(getGuideData(guideData, guideIndex, guideDataCount));
				}
				else {
					if (guideIndex === 0) {
						updateGuide(getGuideData(guideData, guideIndex, guideDataCount));
					}
					else {
						guideIndex--;
					}
				}

				// cache new program start utc time
				programStartTime = program.time;
			}
		}
	}

	function updateGuide(data) {
		//console.log('updateGuide(): ', data);

		if (data && data.length === guideDataCount) {
			//console.log('tvGuideData: height of tvGuideData: ', guideRowHeight);

			var elements = getElementsByClass(document, 'guideRow');
			if (elements) {
				for (var i = 0; i < elements.length; i++) {
					var e = elements.item(i);
					e.style.maxHeight = guideRowHeight + 'px';
					e.style.lineHeight = guideRowHeight + 'px';
					e.style.fontSize = (guideRowHeight - 4) + 'px';
				}

				// date row text
				var row = data[0];
				if (row) {
					addToElement('dateElem', row.isStartDateToday ? getLocaleTextById('dateElem') : row.localStartDate);
				}

				// other rows
				for (var i = 1; i <= guideDataCount; i++) {
					row = data[i - 1];
					if (row) {
						var time = 'time' + i;
						var nameTitle = 'nameTitle' + i;
						var nameDesc = 'nameDesc' + i;
						var nameDescCol = 'nameDescCol' + i;

						addToElement(time, row.localStartTime);
						if (row.series) {
							addToElement(nameTitle, row.series);
							addToElement(nameDesc, row.name && row.name.length > 0 ? ' | ' + row.name : '');
						}
						else {
							addToElement(nameTitle, row.name);
							addToElement(nameDesc, '');
						}

						// calculate and set name desc element width
						var timeElemWidth = time.clientWidth;
						if (timeElemWidth) {
							var nameDescColElem = getElementById(nameDescCol);
							if (nameDescColElem) {
								nameDescColElem.style.width = 'calc(100% - ' + (timeElemWidth + 32) + 'px)';
							}
						}
					}
				}
			}
		}
	}

	function initTvMainVariables() {
		modalVisible = false;
		interval = null;
		programStartTime = null;
		guideIndex = 0;
		guideData = null;
		guideDataCount = 10;
		programsCount = 11;
		guideRowHeight = 0;
	}

	TvMain.prototype.playIconClicked = function () {
		//console.log('Play icon clicked.');

		removeEventListeners();
		toPlayerPage();
	}

	TvMain.prototype.tmRemoveEventListeners = function () {
		removeEventListeners();
	}

	TvMain.prototype.exitButtonClicked = function (item) {
		if (!item) {
			return;
		}

		if (item.id === exitYesButton) {
			exitApplication();
		}
		else {
			hideExitModal();
			modalVisible = false;
			focusToElement(playButton);
		}
	}

	return TvMain;

}());

function tmPlayIconClicked() {
	var obj = new TvMain();
	obj.playIconClicked();
}

function tmRemoveEventListeners() {
	var obj = new TvMain();
	obj.tmRemoveEventListeners();
}

function tmExitButtonClicked(item) {
	var obj = new TvMain();
	obj.exitButtonClicked(item);
}
