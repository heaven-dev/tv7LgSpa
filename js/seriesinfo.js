'use strict';

var SeriesInfo = (function () {

    function SeriesInfo() { }

    var selectedSeries = null;

    var programFavoritesIndex = -1;
    var favoritesData = [];
    var favoriteSelectedIcon = 'images/favorites.svg';
    var favoriteNotSelectedIcon = 'images/favorites_not_selected.svg';
    var textAnimationDuration = 1400;
    var contentHeight = 0;

    SeriesInfo.prototype.initSeriesInfo = function () {
        showElementById('toolbarContainer');
        showElementById('sidebar');

        setLocaleText('toolbarText');
        setLocaleText('addedToFavoritesText');
        setLocaleText('removedFromFavoritesText');

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

        initProgramInfoVariables();

        var height = getWindowHeight();

        var backgroundImage = getElementById('backgroundImage');
        var gradient = getElementById('gradient');
        if (backgroundImage && gradient) {
            backgroundImage.style.height = (height - 110) + 'px';
            gradient.style.height = (height - 110) + 'px';
        }

        selectedSeries = stringToJson(getValueFromCache(selectedArchiveSeriesKey));
        if (selectedSeries) {
            //console.log('Series data: ', selectedSeries);

            focusToElement(seriesIconContainer);

            favoritesData = getSavedValue(favoritesDataKey + getArchiveLanguage());
            if (favoritesData) {
                favoritesData = stringToJson(favoritesData);

                programFavoritesIndex = isProgramInFavorites();
            }
            else {
                favoritesData = [];
            }

            if (programFavoritesIndex !== -1) {
                setFavoriteIcon(favoriteSelectedIcon);
            }

            contentHeight = height - 110;

            addSeriesDetails();
        }

        // add eventListener for keydown
        document.addEventListener('keydown', seiKeyDownEventListener);
    }

    function removeEventListeners() {
        console.log('***Remove series info event listeners.');
        document.removeEventListener('keydown', seiKeyDownEventListener);
    }

    function seiKeyDownEventListener(e) {
        e.preventDefault();
        e.stopPropagation();

        var keyCode = e.keyCode;
        var contentId = e.target.id;

        //console.log('Key code : ', keyCode, ' Target element: ', contentId);

        if (keyCode === LEFT) {
            // LEFT arrow
            if (contentId === seriesIconContainer || contentId === backgroundImage) {
                focusToElement(archiveIconContainer);
            }
            else if (contentId === favoriteIconContainer) {
                focusToElement(seriesIconContainer);
            }
        }
        else if (keyCode === RIGHT) {
            // RIGHT arrow				
            if (isSideBarMenuActive(contentId)) {
                focusToElement(seriesIconContainer);
            }
            else {
                focusToElement(favoriteIconContainer);
            }
        }
        else if (keyCode === UP) {
            // UP arrow
            menuMoveUp(contentId);
        }
        else if (keyCode === DOWN) {
            // DOWN arrow
            menuMoveDown(contentId);
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
            if (contentId !== favoriteIconContainer) {
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
            else if (contentId === searchIconContainer) {
                sideMenuSelection(searchPage);
            }
            else if (contentId === favoritesIconContainer) {
                sideMenuSelection(favoritesPage);
            }
            else if (contentId === channelInfoIconContainer) {
                sideMenuSelection(channelInfoPage);
            }
            else if (contentId === favoriteIconContainer) {
                handleFavoritesSelection();
            }
            else if (contentId === platformInfoIconContainer) {
                sideMenuSelection(platformInfoPage);
            }
            else if (contentId === seriesIconContainer) {
                toSeriesProgramsPage();
            }
        }
        else if (keyCode === RETURN || keyCode === ESC) {
            // RETURN button
            if (isSideBarMenuActive(contentId)) {
                focusOutFromMenuEvent(getElementById(archiveIconContainer));
                focusToElement(seriesIconContainer);
            }
            else {
                removeEventListeners();
                toPreviousPage(archiveMainPage);
            }
        }
    }

    function addSeriesDetails() {
        if (selectedSeries) {
            if (selectedSeries.image_path && selectedSeries.image_path.length > 0) {
                addValueToAttribute('backgroundImage', 'src', selectedSeries.image_path);
            }
            else {
                addValueToAttribute('backgroundImage', 'src', 'images/tv7logo.png');
            }

            if (selectedSeries.name) {
                addToElement('seriesName', selectedSeries.name);
            }

            if (selectedSeries.caption && selectedSeries.caption !== '' && selectedSeries.caption !== nullValue) {
                addToElement('caption', selectedSeries.caption);
            }

            if (selectedSeries.description && selectedSeries.description !== '' && selectedSeries.description !== nullValue) {
                addToElement('description', selectedSeries.description);
            }
        }
    }

    function setFavoriteIcon(icon) {
        var favoriteIcon = getElementById('favoriteIcon');
        if (favoriteIcon && icon) {
            favoriteIcon.setAttribute('src', icon);
        }
    }

    function isProgramInFavorites() {
        var index = -1;
        var sid = selectedSeries.sid;

        if (favoritesData) {
            for (var i = 0; i < favoritesData.length; i++) {
                var item = favoritesData[i];
                if (item && item.sid === sid && item.is_series) {
                    index = i;
                    break;
                }
            }
        }

        return index;
    }

    function addProgramToFavorites() {
        programFavoritesIndex = isProgramInFavorites();

        if (programFavoritesIndex === -1) {
            favoritesData.push(selectedSeries);

            programFavoritesIndex = favoritesData.length - 1;
            saveValue(favoritesDataKey + getArchiveLanguage(), jsonToString(favoritesData));
            setFavoriteIcon(favoriteSelectedIcon);

            handleTextAnimation('addedToFavoritesText');
        }
    }

    function removeProgramToFavorites() {
        programFavoritesIndex = isProgramInFavorites();
        if (programFavoritesIndex !== -1) {
            favoritesData.splice(programFavoritesIndex, 1);

            programFavoritesIndex = -1;
            saveValue(favoritesDataKey + getArchiveLanguage(), jsonToString(favoritesData));
            setFavoriteIcon(favoriteNotSelectedIcon);

            handleTextAnimation('removedFromFavoritesText');
        }
    }

    function handleTextAnimation(element) {
        var addedToFavoritesText = getElementById(element);
        if (addedToFavoritesText) {
            addedToFavoritesText.style.display = 'block';
            setTimeout(function () {
                addedToFavoritesText.style.display = 'none';
            }, textAnimationDuration)
        }
    }

    function toSeriesProgramsPage() {
        cacheValue(selectedArchiveProgramKey, jsonToString(selectedSeries));
        toPage(seriesPage, seriesInfoPage);
    }

    function handleFavoritesSelection() {
        if (programFavoritesIndex === -1) {
            addProgramToFavorites();
        }
        else {
            removeProgramToFavorites();
        }
    }

    function initProgramInfoVariables() {
        selectedSeries = null;

        programFavoritesIndex = -1;
        favoritesData = [];
        favoriteSelectedIcon = 'images/favorites.svg';
        favoriteNotSelectedIcon = 'images/favorites_not_selected.svg';
        textAnimationDuration = 1400;
        contentHeight = 0;
    }

    SeriesInfo.prototype.favoritesItemClicked = function () {
        //console.log('Favorites item clicked.');
        handleFavoritesSelection();
    }

    SeriesInfo.prototype.seriesItemClicked = function () {
        removeEventListeners();
        toSeriesProgramsPage();
    }

    SeriesInfo.prototype.seiRemoveEventListeners = function () {
        removeEventListeners();
    }

    return SeriesInfo;
}());

function seiFavoritesItemClicked() {
    var obj = new SeriesInfo();
    obj.favoritesItemClicked();

}

function seiSeriesItemClicked() {
    var obj = new SeriesInfo();
    obj.seriesItemClicked();
}

function seiRemoveEventListeners() {
    var obj = new SeriesInfo();
    obj.seiRemoveEventListeners();
}
