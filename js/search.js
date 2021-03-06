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

    Search.prototype.initSearch = function () {
        showElementById('toolbarContainer');
        showElementById('sidebar');

        setLocaleText('toolbarText');
        setSelectedSidebarIcon(searchIconContainer, [tvIconContainer, archiveIconContainer, guideIconContainer, favoritesIconContainer, platformInfoIconContainer]);

        initSearchVariables();

        registerHandlebarsHelpers();

        var keyboard = getKeyboard();
        keyboardLetters = keyboard.letter;
        keyboardNumberSpecial = keyboard.special;

        textRowData = { search: getLocaleTextById('searchText'), clear: getLocaleTextById('clearText') };

        updateLetterRows();

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
        console.log('***Remove search event listeners.');
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
            else {
                if (contentId === searchKey || contentId === clearKey) {
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
                removeEventListeners();
                toPage(archiveMainPage);
            }
        }
    }

    function restorePageState(pageState) {
        if (pageState) {
            pageState = stringToJson(pageState);

            var elem = getElementById('searchTextField');
            if (elem) {
                elem.value = pageState.searchText;
            }

            removeValueFromCache(searchPageStateKey);
        }
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
                else if (key === 'search' && value && value.length > 0) {
                    //console.log('Search text: ', value);

                    removeEventListeners();

                    var pageState = {
                        searchText: value
                    };

                    cacheValue(searchPageStateKey, jsonToString(pageState));
                    toPage(searchResultPage, searchPage);
                }
            }
            else {
                var value = element.innerHTML;
                if (value === '&amp;') {
                    value = '&';
                }
                else if (value === '&lt;') {
                    value = '<';
                }
                else if (value === '&gt;') {
                    value = '>';
                }
                value = searchTextField.value + value;
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

    function initSearchVariables() {
        iconBtnIndex = 0;
        keyboardType = 1;
        keyboardLetters = null;
        keyboardNumberSpecial = null;
        textRowData = null;

        keyWidthAndHeight = 0;
        keyFontSize = 0;
        iconWidth = 0;
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

    Search.prototype.seRemoveEventListeners = function () {
        removeEventListeners();
    }

    return Search;
}());

function seKeyItemClicked(item) {
    var obj = new Search();
    obj.keyItemClicked(item);
}

function seRemoveEventListeners() {
    var obj = new Search();
    obj.seRemoveEventListeners();
}
