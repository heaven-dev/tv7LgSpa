'use strict';

var Guide = (function () {

    function Guide() { }

    var dates = [];
    var lastContentRowId = null;
    var rowImageWidth = 0;
    var rowItemHeight = 0;

    var animationOngoing = false;
    var bottomMargin = 0;
    var selectedDate = null;
    var selectedDateIndex = 0;
    var guideDateData = null;
    var contentRows = null;

    var ongoingProgramIndex = 0;

    Guide.prototype.initGuide = function () {
        showElementById('toolbarContainer');
        showElementById('sidebar');

        setLocaleText('toolbarText');
        setSelectedSidebarIcon(guideIconContainer, [tvIconContainer, archiveIconContainer, searchIconContainer, favoritesIconContainer, platformInfoIconContainer]);

        initGuideVariables();

        registerHandlebarsHelpers();

        addDates();

        var pageState = getPageState();
        if (pageState) {
            //console.log('**Restore series data from cache.');
            restorePageState(pageState);
        }
        else {
            addProgramGuide(dates[0].date, 0, true);
        }

        // add event listener for mousewheel
        contentRows = getElementById('contentRows');
        if (contentRows) {
            contentRows.addEventListener('mousewheel', guMouseWheelListener);
        }

        // add eventListener for keydown
        document.addEventListener('keydown', guKeyDownEventListener);
    }

    function removeEventListeners() {
        console.log('***Remove guide event listeners.');

        document.removeEventListener('keydown', guKeyDownEventListener);
        if (contentRows) {
            contentRows.removeEventListener('mousewheel', guMouseWheelListener);
        }
    }

    function guMouseWheelListener(e) {
        handleWheelEvent(e);
    }

    function guKeyDownEventListener(e) {
        e.preventDefault();
        e.stopPropagation();

        var keyCode = e.keyCode;
        var contentId = e.target.id;

        //console.log('Key code : ', keyCode, ' Target element: ', contentId);

        var row = '';
        var col = '';
        var split = contentId.split('_');

        if (split && split.length === 2) {
            if (split[0] === 'r') {
                row = split[0];
                col = parseInt(split[1]);
            }
            else if (split[1] === 'c') {
                row = parseInt(split[0]);
                col = split[1];
            }

            lastContentRowId = contentId;
        }

        if (keyCode === LEFT) {
            // LEFT arrow
            if (contentId === 'r_0' || col === 'c') {
                focusToElement(guideIconContainer);
            }
            else if (row === 'r') {
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
                focusToElement(lastContentRowId);
            }
            else if (row === 'r') {
                var newCol = col + 1;
                var newFocus = row + '_' + newCol;
                if (elementExist(newFocus)) {
                    focusToElement(newFocus);
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
        else if (keyCode === BLUE) {
            removeEventListeners();
            sideMenuSelection(searchPage);
        }
        else if (keyCode === OK) {
            // OK button
            if (isSideBarMenuActive(contentId)) {
                if (contentId !== guideIconContainer) {
                    removeEventListeners();
                }

                if (contentId === guideIconContainer) {
                    focusOutFromMenuEvent(getElementById(guideIconContainer));
                    focusToElement(lastContentRowId);
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
                else if (contentId === platformInfoIconContainer) {
                    sideMenuSelection(platformInfoPage);
                }
            }
            else {
                if (contentId.indexOf('r_') !== -1) {
                    bottomMargin = 0;
                    addProgramGuide(dates[col].date, col, false);
                }
                else if (contentId.indexOf('_c') !== -1) {
                    removeEventListeners();
                    toItemPage(row);
                }
            }
        }
        else if (keyCode === RETURN || keyCode === ESC) {
            // RETURN button
            if (isSideBarMenuActive(contentId)) {
                focusOutFromMenuEvent(getElementById(guideIconContainer));
                focusToElement(lastContentRowId);
            }
            else {
                removeEventListeners();
                toPreviousPage(archiveMainPage);
            }
        }
    }

    function wheelUp(row, col) {
        var selDateId = 'r_' + selectedDateIndex;

        if (isDateToday(selectedDate) && row <= ongoingProgramIndex) {
            focusToElement(selDateId);
        }
        else {
            var newRow = row - 1;
            var newFocus = newRow + '_' + col;
            if (elementExist(newFocus)) {
                if (!animationOngoing) {
                    animationOngoing = true;

                    rowMoveDownUp(row, false);
                    focusToElement(newFocus);
                }
            }
            else {
                focusToElement(selDateId);
            }
        }
    }

    function wheelDown(row, col) {
        var newRow = row + 1;
        var newFocus = newRow + '_' + col;
        if (elementExist(newFocus)) {
            if (isDateToday(selectedDate) && row < ongoingProgramIndex) {
                focusToElement(newFocus);
            }
            else {
                if (!animationOngoing) {
                    animationOngoing = true;

                    rowMoveDownUp(row, true);
                    focusToElement(newFocus);
                }
            }
        }
        else if (row === 'r') {
            downFromDatesRow();
        }
    }

    function downFromDatesRow() {
        if (isDateToday(selectedDate)) {
            var newRow = ongoingProgramIndex + '_c';
            focusToElement(newRow);
        }
        else {
            focusToElement('0_c');
        }
    }

    function handleWheelEvent(event) {
        var focusedId = document.activeElement.id;
        if (!focusedId) {
            return;
        }

        var isDown = event.deltaY > 0;

        if (isDown && focusedId.indexOf('r') !== -1) {
            downFromDatesRow();
            return;
        }

        var split = focusedId.split('_');
        if (!split || split.length !== 2) {
            return;
        }

        var row = parseInt(split[0]);
        var col = split[1];

        if (isDown) {
            wheelDown(row, col);
        }
        else {
            wheelUp(row, col);
        }
    }

    function rowMoveDownUp(row, down) {
        var element = getElementById('guideContainer');
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
        showElementById('guideBusyLoader');

        isConnectedToGateway(function (isConnected) {
            if (!isConnected) {
                hideElementById('guideBusyLoader');
                toPage(errorPage, null);
            }
            else {
                getProgramInfo(guideDateData[row].id, function (program) {
                    cacheValue(selectedArchiveProgramKey, jsonToString(program[0]));

                    savePageState(row);

                    hideElementById('guideBusyLoader');
                    toPage(programInfoPage, guidePage);
                });
            }
        });
    }

    function addDates() {
        createDates();
        addData(dates, 'datesTemplate', 'dateItems', false);

        focusToElement('r_0');
    }

    function addProgramGuide(date, col, firstLoad) {
        selectedDate = date;

        showElementById('guideBusyLoader');

        isConnectedToGateway(function (isConnected) {
            if (!isConnected) {
                hideElementById('guideBusyLoader');
                removeEventListeners();
                toPage(errorPage, null);
            }
            else {
                getGuideByDate(date, function (guideData) {
                    //console.log('Guide by date data: ', guideData);

                    guideDateData = guideData.data;

                    addData(guideData.data, 'guideTemplate', 'guideContainer', false);

                    selectDate(col);
                    selectedDateIndex = col;

                    var element = getElementById('guideContainer');
                    if (element && isDateToday(date)) {
                        ongoingProgramIndex = guideData.ongoingProgramIndex;
                        setTodayPosition(element, ongoingProgramIndex);
                        showElementById('ongoingProgram_' + ongoingProgramIndex);
                    }
                    else {
                        element.style.bottom = '0px';
                    }

                    if (element && !firstLoad) {
                        animateRows(element);
                    }

                    hideElementById('guideBusyLoader');
                });
            }
        });
    }

    function getPageState() {
        var value = getValueFromCache(guidePageStateKey);
        if (value) {
            return stringToJson(value);
        }
        return null;
    }

    function savePageState(row) {
        var pageState = {
            selectedDateIndex: selectedDateIndex,
            selectedDate: selectedDate,
            ongoingProgramIndex: ongoingProgramIndex,
            row: row,
            bottomMargin: bottomMargin,
            guideDateData: JSON.stringify(guideDateData)
        }

        cacheValue(guidePageStateKey, jsonToString(pageState));
    }

    function deletePageState() {
        removeValueFromCache(guidePageStateKey);
    }

    function restorePageState(ps) {
        if (ps) {
            showElementById('guideBusyLoader');

            bottomMargin = ps.bottomMargin;
            var element = getElementById('guideContainer');
            if (element) {
                element.style.bottom = bottomMargin + 'px';
            }

            guideDateData = stringToJson(ps.guideDateData);

            addData(guideDateData, 'guideTemplate', 'guideContainer', true);

            var focusRow = ps.row + '_c';
            focusToElement(focusRow);

            selectedDateIndex = ps.selectedDateIndex;
            selectDate(selectedDateIndex);

            selectedDate = ps.selectedDate;

            ongoingProgramIndex = ps.ongoingProgramIndex;

            if (selectedDateIndex === 0) {
                showElementById('ongoingProgram_' + ongoingProgramIndex);
            }

            deletePageState();

            hideElementById('guideBusyLoader');
        }
    }

    function setTodayPosition(element, programIndex) {
        bottomMargin = (calculateRowHeight() + 40) * (programIndex - 1);
        element.style.bottom = bottomMargin + 'px';
    }

    function animateRows(element) {
        element.classList.add('rowAnimationFadeIn');
        setTimeout(function () {
            element.classList.remove('rowAnimationFadeIn');
        }, 900);
    }

    function selectDate(col) {
        for (var i = 0; i < dates.length; i++) {
            var element = getElementById('r_' + i);
            if (element) {
                i === col ? element.classList.add('guDateItemSelected') : element.classList.remove('guDateItemSelected');
            }
        }
    }

    function isDateToday(date) {
        return date === getTodayDate();
    }

    function createDates() {
        dates.length = 0;
        var d = Date.now();

        for (var i = 0; i < 7; i++) {
            dates.push(getDatesByTime(d, i));

            var date = new Date(d);
            date.setDate(date.getDate() + 1);
            d = date.getTime();
        }
    }

    function getDatesByTime(time, index) {
        var d = new Date(time);

        var date = d.getFullYear() + '-' + prependZero(d.getMonth() + 1) + '-' + prependZero(d.getDate());
        var label = index > 0 ? d.getDate() + '.' + (d.getMonth() + 1) + '.' : getLocaleTextById('dateElem');

        return { date: date, label: label };
    }

    function calculateImageWidth() {
        var height = calculateRowHeight();
        return Math.round(height / 0.56);
    }

    function calculateRowHeight() {
        var height = getWindowHeight() - 350;
        return Math.round(height / 3.5);
    }

    function initGuideVariables() {
        dates = [];
        lastContentRowId = null;
        rowImageWidth = 0;
        rowItemHeight = 0;

        animationOngoing = false;
        bottomMargin = 0;
        selectedDate = null;
        selectedDateIndex = 0;
        guideDateData = null;
        contentRows = null;

        ongoingProgramIndex = 0;
    }

    function registerHandlebarsHelpers() {
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
    }

    Guide.prototype.dateItemClicked = function (item) {
        if (item) {
            //console.log('Item clicked: ', item.id);

            var split = item.id.split('_');
            if (!split || split.length !== 2) {
                return;
            }

            var col = parseInt(split[1]);

            bottomMargin = 0;
            addProgramGuide(dates[col].date, col, false);
        }
    }

    Guide.prototype.programItemClicked = function (item) {
        if (item) {
            removeEventListeners();

            var split = item.id.split('_');
            if (!split || split.length !== 2) {
                return;
            }

            var row = parseInt(split[0]);

            if (isDateToday(selectedDate) && row < ongoingProgramIndex) {
                return;
            }

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

    Guide.prototype.guRemoveEventListeners = function () {
        removeEventListeners();
    }

    return Guide;
}());

function guDateItemClicked(item) {
    var obj = new Guide();
    obj.dateItemClicked(item);

}

function guProgramItemClicked(item) {
    var obj = new Guide();
    obj.programItemClicked(item);
}

function guRemoveEventListeners() {
    var obj = new Guide();
    obj.guRemoveEventListeners();
}
