'use strict';

var PlatformInfo = (function () {

    function PlatformInfo() { }

    var clearMenuItems = [];
    var clearMenuVisible = false;
    var clearMenuItemMaxCount = 12;
    var selectedClearMenuId = null;

    var clearMenuContainer = null;

    PlatformInfo.prototype.initPlatformInfo = function () {
        showElementById('toolbarContainer');
        showElementById('sidebar');

        setLocaleText('toolbarText');
        setLocaleText('copyrightText');

        setSelectedSidebarIcon(platformInfoIconContainer,
            [
                tvIconContainer,
                archiveIconContainer,
                guideIconContainer,
                searchIconContainer,
                favoritesIconContainer,
                channelInfoIconContainer
            ]
        );

        initPlatformInfoVariables();

        setFontSizes(calculateTableFontSize());

        addToElement('appName', getAppName());
        addToElement('appVersion', getAppVersion());

        var platformInfo = getValueFromCache(platformInfoKey);
        if (platformInfo) {
            platformInfo = stringToJson(platformInfo);

            addToElement('sdkVersion', platformInfo.sdkVersion);
            addToElement('platformVersion', platformInfo.platformVersion);
            addToElement('modelName', platformInfo.modelName);
        }

        focusToElement(clearIconContainer);

        // add eventListener for keydown
        document.addEventListener('keydown', pliKeyDownEventListener);
    }

    function removeEventListeners() {
        console.log('***Remove platform info event listeners.');
        document.removeEventListener('keydown', pliKeyDownEventListener);
    }

    function pliKeyDownEventListener(e) {
        e.preventDefault();
        e.stopPropagation();

        var keyCode = e.keyCode;
        var contentId = e.target.id;

        var row = null;
        var col = null;
        var split = contentId.split('_');
        if (split.length > 1) {
            row = parseInt(split[0]);
            col = split[1];
        }

        //console.log('Key code : ', keyCode, ' Target element: ', contentId);

        if (keyCode === LEFT) {
            // LEFT arrow
            if (contentId === clearIconContainer) {
                focusToElement(platformInfoIconContainer);
            }
            else if (contentId === 'confirmationCancelButton') {
                focusToElement('confirmationOkButton');
            }
        }
        else if (keyCode === RIGHT) {
            // RIGHT arrow			
            if (isSideBarMenuActive(contentId)) {
                focusToElement(clearIconContainer);
            }
            else if (contentId === 'confirmationOkButton') {
                focusToElement('confirmationCancelButton');
            }
        }
        else if (keyCode === UP) {
            // UP arrow
            if (isSideBarMenuActive(contentId)) {
                menuMoveUp(contentId);
            }
            else if (col === 'cm') {
                var newRow = row - 1;
                var newFocus = newRow + '_cm';
                if (elementExist(newFocus)) {
                    focusToElement(newFocus);
                }
            }
        }
        else if (keyCode === DOWN) {
            // DOWN arrow
            if (isSideBarMenuActive(contentId)) {
                menuMoveDown(contentId);
            }
            else if (col === 'cm') {
                var newRow = row + 1;
                var newFocus = newRow + '_cm';
                if (elementExist(newFocus)) {
                    focusToElement(newFocus);
                }
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
            if (isSideBarMenuActive(contentId)) {
                if (contentId !== platformInfoIconContainer) {
                    removeEventListeners();
                }

                if (contentId === platformInfoIconContainer) {
                    focusOutFromMenuEvent(getElementById(platformInfoIconContainer));
                    focusToElement(clearIconContainer);
                }
                else if (contentId === guideIconContainer) {
                    sideMenuSelection(guidePage);
                }
                else if (contentId === archiveIconContainer) {
                    sideMenuSelection(archiveMainPage);
                }
                else if (contentId === tvIconContainer) {
                    sideMenuSelection(tvMainPage);
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
            }
            else if (col === 'cm') {
                showConfirmationButtons(row, col);
            }
            else if (contentId === 'confirmationOkButton') {
                handleOkButtonSelection();
            }
            else if (contentId === 'confirmationCancelButton') {
                hideClearMenu();
            }
            else if (!clearMenuVisible) {
                showClearMenu();
            }
            else if (clearMenuVisible) {
                hideClearMenu();
            }
        }
        else if (keyCode === RETURN || keyCode === ESC) {
            // RETURN button
            if (isSideBarMenuActive(contentId)) {
                focusOutFromMenuEvent(getElementById(platformInfoIconContainer));
                focusToElement(clearIconContainer);
            }
            else if (clearMenuVisible) {
                hideClearMenu();
            }
            else {
                removeEventListeners();
                toPreviousPage(archiveMainPage);
            }
        }
    }

    function createMenuTexts() {
        var itemsText = getLocaleTextById('itemsText');

        var itemCount = stringToJson(getSavedValue(videoStatusDataKey));
        if (!itemCount) {
            itemCount = [];
        }

        clearMenuItems.push(getLocaleTextById('videoStatusConfiguationText') + ' | ' + itemCount.length + ' ' + itemsText);

        itemCount = stringToJson(getSavedValue(favoritesDataKey + getArchiveLanguage()));
        if (!itemCount) {
            itemCount = [];
        }

        clearMenuItems.push(getLocaleTextById('favoritesConfigurationText') + ' | ' + itemCount.length + ' ' + itemsText);

        itemCount = stringToJson(getSavedValue(savedSearchDataKey + getSelectedLocale()));
        if (!itemCount) {
            itemCount = [];
        }

        clearMenuItems.push(getLocaleTextById('searchHistoryConfigurationText') + ' | ' + itemCount.length + ' ' + itemsText);
    }

    function removeMenuTexts() {
        if (clearMenuItems) {
            clearMenuItems = [];
        }
    }

    function showClearMenu() {
        showElementById('clearMenuContainer');

        createMenuTexts();

        setTimeout(function () {
            setLocaleText('deleteConfigurationsText');

            addData(clearMenuItems, 'clearConfigurationRowTemplate', 'clearMenuItemsContainer');

            var height = getWindowHeight();
            height -= 280;
            height /= clearMenuItemMaxCount;
            height = height;

            //console.log('Item height: ', height);

            var elems = getElementsByClass(getElementById('clearMenuContainer'), 'pliClearMenuItems');
            if (elems) {
                for (var i = 0; i < elems.length; i++) {
                    var e = elems[i];
                    if (e) {
                        e.style.height = height + 'px';
                        e.style.lineHeight = height + 'px';
                        e.style.fontSize = Math.ceil(0.70 * height) + 'px';
                    }
                }
            }

            focusToElement('0_cm');

            addClearMenuMouseWheelEventListener();
        });

        clearMenuVisible = true;
    }

    function hideClearMenu() {
        hideElementById('clearMenuContainer');
        hideElementById('clearDataConfirmationContainer');
        focusToElement('clearIconContainer');

        removeMenuTexts();

        removeClearMenuMouseWheelEventListener();

        clearMenuVisible = false;
    }

    function showConfirmationButtons(row, col) {
        showElementById('clearDataConfirmationContainer');

        selectedClearMenuId = row + '_' + col;

        setTimeout(function () {
            setLocaleText('confirmationQuestionText');
            setLocaleText('confirmationOkButton');
            setLocaleText('confirmationCancelButton');

            focusToElement('confirmationOkButton');
        });
    }

    function handleOkButtonSelection() {
        if (selectedClearMenuId === '0_cm') {
            removeSavedValue(videoStatusDataKey);
        }
        else if (selectedClearMenuId === '1_cm') {
            removeSavedValue(favoritesDataKey + getArchiveLanguage());
        }
        else if (selectedClearMenuId === '2_cm') {
            removeSavedValue(savedSearchDataKey + getSelectedLocale());
        }

        hideClearMenu();
    }

    function addClearMenuMouseWheelEventListener() {
        clearMenuContainer = getElementById('clearMenuContainer');
        if (clearMenuContainer) {
            clearMenuContainer.addEventListener('mousewheel', pliMouseWheelListener);
        }
    }

    function removeClearMenuMouseWheelEventListener() {
        if (clearMenuContainer) {
            clearMenuContainer.removeEventListener('mousewheel', pliMouseWheelListener);
        }
    }

    function pliMouseWheelListener(e) {
        if (!e) {
            return;
        }

        var focusedId = document.activeElement.id;
        if (!focusedId) {
            return;
        }

        var split = focusedId.split('_');
        if (!split || split.length !== 2) {
            return;
        }

        var row = parseInt(split[0]);

        if (e.deltaY > 0) {
            row++;
        }
        else {
            row--;
        }

        var newFocus = row + '_cm';
        if (elementExist(newFocus)) {
            focusToElement(newFocus)
        }
    }

    function calculateTableFontSize() {
        return Math.ceil(50 / 100 * ((getWindowWidth() / 2.4) / 11));
    }

    function setFontSizes(tableFontSize) {
        var platformInfoTable = getElementById('platformInfoTable');
        if (platformInfoTable) {
            var tableElements = getElementsByClass(platformInfoTable, 'pliPlatformInfoTableText');
            for (var i = 0; i < tableElements.length; i++) {
                var e = tableElements[i];
                if (e) {
                    e.style.fontSize = tableFontSize + 'px';
                }
            }
        }

        var copyrightText = getElementById('copyrightText');
        if (copyrightText) {
            copyrightText.style.fontSize = (tableFontSize - 4) + 'px';
        }
    }

    function initPlatformInfoVariables() {
        clearMenuItems = [];
        clearMenuVisible = false;
        clearMenuItemMaxCount = 12;
        selectedClearMenuId = null;
        clearMenuContainer = null;
    }

    PlatformInfo.prototype.pliRemoveEventListeners = function () {
        removeEventListeners();
    }

    PlatformInfo.prototype.pliClearMenuIconClicked = function () {
        if (!clearMenuVisible) {
            showClearMenu();
        }
    }

    PlatformInfo.prototype.clearMenuItemClicked = function (item) {
        if (item) {
            //console.log('Item clicked: ', item);

            var row = null;
            var col = null;
            var split = item.id.split('_');
            if (split.length > 1) {
                row = parseInt(split[0]);
                col = split[1];
            }

            showConfirmationButtons(row, col);
        }
    }

    PlatformInfo.prototype.clearMenuButtonClicked = function (item) {
        if (item) {
            //console.log('Item clicked: ', item);

            var id = item.id;
            if (!id) {
                return;
            }

            if (id === 'confirmationOkButton') {
                handleOkButtonSelection();
            }
            else if (id === 'confirmationCancelButton') {
                hideClearMenu();
            }
        }
    }

    return PlatformInfo;
}());

function pliRemoveEventListeners() {
    var obj = new PlatformInfo();
    obj.pliRemoveEventListeners();
}

function pliClearMenuIconClicked() {
    var obj = new PlatformInfo();
    obj.pliClearMenuIconClicked();
}

function pliClearMenuItemClicked(item) {
    var obj = new PlatformInfo();
    obj.clearMenuItemClicked(item);
}

function pliClearMenuButtonClicked(item) {
    var obj = new PlatformInfo();
    obj.clearMenuButtonClicked(item);
}
