'use strict';

var Search = (function () {

    function Search() { }

    var iconBtnIndex = 0;
    var keyboardType = 1;
    var keyboardLetters = null;
    var keyboardNumberSpecial = null;
    var textRowData = null;

    var keyWidthAndHeight = 0;
    var keyFontSize = 0;
    var iconWidth = 0;

    var savedSearchOverlayVisible = false;
    var savedSearches = [];
    var savedSearchItemMaxCount = 12;

    var savedSearchContainer = null;

    Search.prototype.initSearch = function () {
        showElementById('toolbarContainer');
        showElementById('sidebar');

        setLocaleText('toolbarText');
        setSelectedSidebarIcon(searchIconContainer,
            [
                tvIconContainer,
                archiveIconContainer,
                guideIconContainer,
                favoritesIconContainer,
                channelInfoIconContainer,
                platformInfoIconContainer
            ]
        );

        initSearchVariables();

        registerHandlebarsHelpers();

        var keyboard = getKeyboard();
        keyboardLetters = keyboard.letter;
        keyboardNumberSpecial = keyboard.special;

        textRowData = { search: getLocaleTextById('searchText'), clear: getLocaleTextById('clearText') };

        updateLetterRows();

        var sKey = getSavedValue(getSavedSearchDataKey());
        if (sKey) {
            var elem = getElementById(savedSearchKey);
            if (elem) {
                elem.style.display = 'block';
            }
        }

        focusToElement(defaultRowCol);

        var pageState = getValueFromCache(searchPageStateKey);
        if (pageState) {
            restorePageState(pageState);
        }

        removeOriginPage();


        // add eventListener for keydown
        document.addEventListener('keydown', seKeyDownEventListener);
    }

    function removeEventListeners() {
        console.log('***Remove event listeners.');
        document.removeEventListener('keydown', seKeyDownEventListener);
    }

    function seKeyDownEventListener(e) {
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

        if (keyCode === LEFT) {
            // LEFT arrow
            if (col === 0) {
                focusToElement(searchIconContainer);
            }
            else if (contentId === clearKey) {
                if (elementExist(searchKey)) {
                    focusToElement(searchKey);
                }
            }
            else if (contentId === savedSearchKey) {
                if (elementExist(clearKey)) {
                    focusToElement(clearKey);
                }
            }
            else {
                var newCol = col - 1;
                var newFocus = row + '_' + newCol;
                if (elementExist(newFocus)) {
                    focusToElement(newFocus);
                }
            }
        }
        else if (keyCode === RIGHT) {
            // RIGHT arrow			
            if (isSideBarMenuActive(contentId)) {
                focusToElement(defaultRowCol);
            }
            else if (contentId === searchKey) {
                if (elementExist(clearKey)) {
                    focusToElement(clearKey);
                }
            }
            else if (contentId === clearKey) {
                if (elementExist(savedSearchKey)) {
                    focusToElement(savedSearchKey);
                }
            }
            else {
                var newCol = col + 1;
                var newFocus = row + '_' + newCol;
                if (elementExist(newFocus)) {
                    focusToElement(newFocus);
                }
            }
        }
        else if (keyCode === UP) {
            // UP arrow
            if (isSideBarMenuActive(contentId)) {
                menuMoveUp(contentId);
            }
            else if (savedSearchOverlayVisible) {
                var newRow = row - 1;
                var newFocus = newRow + '_ss';
                if (elementExist(newFocus)) {
                    focusToElement(newFocus);
                }
            }
            else {
                if (contentId === searchKey || contentId === clearKey || contentId === savedSearchKey) {
                    var newFocus = '2_0';
                    if (elementExist(newFocus)) {
                        focusToElement(newFocus);
                    }
                }
                else {
                    var newRow = row - 1;
                    var newFocus = newRow + '_' + col;
                    if (elementExist(newFocus)) {
                        focusToElement(newFocus);
                    }
                }
            }
        }
        else if (keyCode === DOWN) {
            // DOWN arrow
            if (isSideBarMenuActive(contentId)) {
                menuMoveDown(contentId);
            }
            else if (savedSearchOverlayVisible) {
                var newRow = row + 1;
                var newFocus = newRow + '_ss';
                if (elementExist(newFocus)) {
                    focusToElement(newFocus);
                }
            }
            else {
                if (row === 2) {
                    if (elementExist(searchKey)) {
                        focusToElement(searchKey);
                    }
                }
                else {
                    var newRow = row + 1;
                    var newFocus = newRow + '_' + col;
                    if (elementExist(newFocus)) {
                        focusToElement(newFocus);
                    }
                    else {
                        newFocus = newRow + '_' + (--col);
                        focusToElement(newFocus);
                    }
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
        else if (keyCode === OK) {
            // OK button
            if (contentId === searchIconContainer) {
                focusOutFromMenuEvent(getElementById(searchIconContainer));
                focusToElement(defaultRowCol);
            }
            else if (contentId === archiveIconContainer) {
                removeEventListeners();
                sideMenuSelection(archiveMainPage);
            }
            else if (contentId === tvIconContainer) {
                removeEventListeners();
                sideMenuSelection(tvMainPage);
            }
            else if (contentId === guideIconContainer) {
                removeEventListeners();
                sideMenuSelection(guidePage);
            }
            else if (contentId === favoritesIconContainer) {
                removeEventListeners();
                sideMenuSelection(favoritesPage);
            }
            else if (contentId === channelInfoIconContainer) {
                removeEventListeners();
                sideMenuSelection(channelInfoPage);
            }
            else if (contentId === platformInfoIconContainer) {
                removeEventListeners();
                sideMenuSelection(platformInfoPage);
            }
            else {
                itemSelected(e.target);
            }
        }
        else if (keyCode === RETURN || keyCode === ESC) {
            // RETURN button
            if (isSideBarMenuActive(contentId)) {
                focusOutFromMenuEvent(getElementById(searchIconContainer));
                focusToElement(defaultRowCol);
            }
            else {
                if (savedSearchOverlayVisible) {
                    showHideSavedSearch();
                }
                else {
                    removeEventListeners();
                    toPage(archiveMainPage);
                }
            }
        }
    }

    function restorePageState(pageState) {
        if (pageState) {
            pageState = stringToJson(pageState);

            var elem = getElementById('searchTextField');
            if (elem) {
                elem.value = validateChars(pageState.searchText);
            }

            removeValueFromCache(searchPageStateKey);
        }
    }

    function validateChars(value) {
        value = value.replace(/&amp;/g, '&');
        value = value.replace(/&lt;/g, '<');
        value = value.replace(/&gt;/g, '>');
        return value;
    }

    function itemSelected(element) {
        var searchTextField = getElementById('searchTextField');
        if (element && searchTextField) {
            //console.log('Selected item: ', element);

            var key = element.getAttribute('key');
            if (key) {
                var value = searchTextField.value;
                if (key === 'space') {
                    value += ' ';
                }
                else if (key === 'backSpace') {
                    if (value && value.length > 0) {
                        value = value.slice(0, -1);
                    }
                }
                else if (key === 'capslock') {
                    keyboardType = keyboardType === keyboardCapital ? keyboardNormal : keyboardCapital;
                    updateLetterRows();
                    focusToElement(defaultRowCol);
                }
                else if (key === 'specialChars') {
                    keyboardType = keyboardSpecial;
                    updateNbrSpecialRows();
                    focusToElement(defaultRowCol);
                }
                else if (key === 'letterChars') {
                    keyboardType = keyboardNormal;
                    updateLetterRows();
                    focusToElement(defaultRowCol);
                }
                else if (key === 'clear') {
                    value = '';
                }
                else if (key === 'search') {
                    if (value && value.length > 0) {
                        //console.log('Search text: ', value);
                        search(value);
                    }
                    else {
                        searchTextField.style.backgroundColor = '#fadbd8';
                    }
                }
                else if (key === 'savedSearchItem') {
                    //console.log('Saved search text: ', element.innerHTML);
                    search(element.innerHTML);
                }
                else if (key === 'savedSearch') {
                    showHideSavedSearch();
                }
            }
            else {
                var value = validateChars(element.innerHTML);
                value = searchTextField.value + value;
                searchTextField.style.backgroundColor = '#fafafa';
            }

            searchTextField.value = value;
        }
    }

    function stringEndsWith(value, target) {
        return value.substring(value.length - target.length) == target;
    }

    function updateLetterRows() {
        removeRows();

        iconBtnIndex = 0;

        addData(keyboardLetters['1'], 'letterRow1Template', 'row1');
        addData(keyboardLetters['2'], 'letterRow2Template', 'row2');
        addData(keyboardLetters['3'], 'letterRow3Template', 'row3');
        addData(textRowData, 'clearSearchRowTemplate', 'row4');
    }

    function updateNbrSpecialRows() {
        removeRows();

        iconBtnIndex = 0;

        addData(keyboardNumberSpecial['1'], 'nbrSpecialRow1Template', 'row1');
        addData(keyboardNumberSpecial['2'], 'nbrSpecialRow2Template', 'row2');
        addData(keyboardNumberSpecial['3'], 'nbrSpecialRow3Template', 'row3');
        addData(textRowData, 'clearSearchRowTemplate', 'row4');
    }

    function removeRows() {
        removeData('row1');
        removeData('row2');
        removeData('row3');
        removeData('row4');
    }

    function calculateKeyWidthAndHeight() {
        var width = parseInt((getWindowWidth() / 2.4) / 11);
        return width;
    }

    function search(searchText) {
        searchText = validateChars(searchText);
        
        removeEventListeners();

        var pageState = {
            searchText: searchText
        };

        if (savedSearchOverlayVisible) {
            showHideSavedSearch();
        }

        saveSearchValue(searchText);

        cacheValue(searchPageStateKey, jsonToString(pageState));
        toPage(searchResultPage, searchPage);
    }

    function saveSearchValue(searchText) {
        searchText = validateChars(searchText);

        var savedSearchData = getSavedValue(getSavedSearchDataKey());
        if (savedSearchData) {
            savedSearchData = stringToJson(savedSearchData);

            var idx = savedSearchData.indexOf(searchText);
            if (idx !== -1) {
                savedSearchData.splice(idx, 1);
            }

            savedSearchData.unshift(searchText);

            if (savedSearchData.length > savedSearchItemMaxCount) {
                savedSearchData.pop();
            }

            saveValue(getSavedSearchDataKey(), jsonToString(savedSearchData));
        }
        else {
            savedSearchData = [];
            savedSearchData.push(searchText);
            saveValue(getSavedSearchDataKey(), jsonToString(savedSearchData));
        }
    }

    function showHideSavedSearch() {
        var sContainer = getElementById('savedSearchContainer');
        var sBackground = getElementById('savedSearchBackground');
        if (sContainer && sBackground) {
            if (savedSearchOverlayVisible) {
                sContainer.style.display = 'none';
                sBackground.style.display = 'none';

                focusToElement('savedSearchKey');
                removeSavedSearchMouseWheelEventListener();
            }
            else {
                var savedSearchData = getSavedValue(getSavedSearchDataKey());
                if (savedSearchData) {
                    savedSearches = stringToJson(savedSearchData);
                    addData(savedSearches, 'savedSearchRowTemplate', 'savedSearchRows');
                }

                var height = getWindowHeight();

                sContainer.style.display = 'block';
                sBackground.style.display = 'block';
                sBackground.style.height = (height - 90) + 'px';

                setTimeout(function () {
                    setLocaleText('savedSearchTitle');

                    height -= 280;
                    height /= savedSearchItemMaxCount;
                    height = height;

                    //console.log('Item height: ', height);

                    var elems = getElementsByClass(sContainer, 'seSavedSearchItem');
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

                    focusToElement('0_ss');

                    addSavedSearchMouseWheelEventListener();
                });
            }

            savedSearchOverlayVisible = !savedSearchOverlayVisible;
        }
    }

    function addSavedSearchMouseWheelEventListener() {
        savedSearchContainer = getElementById('savedSearchContainer');
        if (savedSearchContainer) {
            savedSearchContainer.addEventListener('mousewheel', seMouseWheelListener);
        }
    }

    function removeSavedSearchMouseWheelEventListener() {
        if (savedSearchContainer) {
            savedSearchContainer.removeEventListener('mousewheel', seMouseWheelListener);
        }
    }

    function seMouseWheelListener(e) {
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
            var newFocus = row + '_ss';
            if (elementExist(newFocus)) {
                focusToElement(newFocus)
            }
        }
        else {
            row--;
            var newFocus = row + '_ss';
            if (elementExist(newFocus)) {
                focusToElement(newFocus)
            }
        }
    }

    function getSavedSearchDataKey() {
        return savedSearchDataKey + getSelectedLocale();
    }

    function initSearchVariables() {
        iconBtnIndex = 0;
        keyboardType = 1;
        keyboardLetters = null;
        keyboardNumberSpecial = null;
        textRowData = null;

        keyWidthAndHeight = 0;
        keyFontSize = 0;
        iconWidth = 0;

        savedSearchOverlayVisible = false;
        savedSearches = [];
        savedSearchItemMaxCount = 12;

        savedSearchContainer = null;
    }

    function registerHandlebarsHelpers() {
        Handlebars.registerHelper('incIdx', function (value) {
            value = parseInt(value);
            if (iconBtnIndex === 0) {
                iconBtnIndex = ++value;
            }
            else {
                iconBtnIndex++;
            }
            return iconBtnIndex;
        });

        Handlebars.registerHelper('isLowerCase', function () {
            return keyboardType === keyboardNormal;
        });

        Handlebars.registerHelper('keyWidthAndHeight', function () {
            if (keyWidthAndHeight === 0) {
                keyWidthAndHeight = calculateKeyWidthAndHeight();
            }
            return keyWidthAndHeight;
        });

        Handlebars.registerHelper('keyFontSize', function () {
            if (keyFontSize === 0) {
                keyFontSize = calculateKeyWidthAndHeight();
                keyFontSize = parseInt(70 / 100 * keyFontSize);
            }
            return keyFontSize;
        });

        Handlebars.registerHelper('iconWidth', function () {
            if (iconWidth === 0) {
                iconWidth = calculateKeyWidthAndHeight();
                iconWidth = parseInt(70 / 100 * iconWidth);
            }
            return iconWidth;
        });
    }

    Search.prototype.keyItemClicked = function (item) {
        if (item) {
            //console.log('Item clicked: ', item);

            itemSelected(item);
        }
    }

    Search.prototype.savedSearchBgClicked = function () {
        showHideSavedSearch();
    }

    Search.prototype.seRemoveEventListeners = function () {
        removeEventListeners();
    }

    return Search;
}());

function seKeyItemClicked(item) {
    var obj = new Search();
    obj.keyItemClicked(item);
}

function seSavedSearchBgClicked() {
    var obj = new Search();
    obj.savedSearchBgClicked();
}

function seRemoveEventListeners() {
    var obj = new Search();
    obj.seRemoveEventListeners();
}
