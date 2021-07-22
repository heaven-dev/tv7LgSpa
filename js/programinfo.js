'use strict';

var ProgramInfo = (function () {

    function ProgramInfo() { }

    var selectedProgram = null;
    var showPlayBtn = false;
    var showFavoriteBtn = false;
    var comingProgram = false;

    var programFavoritesIndex = -1;
    var favoritesData = [];
    var favoriteSelectedIcon = 'images/favorites.svg';
    var favoriteNotSelectedIcon = 'images/favorites_not_selected.svg';
    var textAnimationDuration = 1400;

    ProgramInfo.prototype.initProgramInfo = function () {
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

        selectedProgram = stringToJson(getValueFromCache(selectedArchiveProgramKey));
        if (selectedProgram) {
            //console.log('Program data: ', selectedProgram);

            showFavoriteBtn = true;

            if (selectedProgram.is_visible_on_vod === '0') {
                showPlayBtn = false;
                comingProgram = true;
            }
            else if (selectedProgram.is_visible_on_vod === '1') {
                showPlayBtn = true;
                comingProgram = false;
            }
            else if (selectedProgram.is_visible_on_vod === '2') {
                showPlayBtn = true;
                comingProgram = true;
            }
            else if (selectedProgram.is_visible_on_vod === '-1') {
                showPlayBtn = false;
                comingProgram = false;
                showFavoriteBtn = false;

                hideElementById('isInArchiveIconContainer');
            }

            if (showPlayBtn) {
                showElementById(playIconContainer);
            }

            if (showFavoriteBtn) {
                showElementById(favoriteIconContainer);
            }

            if (showPlayBtn) {
                focusToElement(playIconContainer);
            }
            else if (showFavoriteBtn) {
                focusToElement(favoriteIconContainer);
            }
            else {
                focusToElement(backgroundImage);
            }

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

            var videoStatus = getSavedValue(videoStatusDataKey);
            if (videoStatus) {
                videoStatus = stringToJson(videoStatus);
                //console.log('Video statuses: ', videoStatus);

                var id = selectedProgram.id;

                var videoItem = null;
                for (var i = 0; i < videoStatus.length; i++) {
                    if (videoStatus[i].id === id) {
                        videoItem = videoStatus[i];
                        break;
                    }
                }

                if (videoItem) {
                    //console.log('Video status: ', videoItem);

                    var elem = getElementById('videoStatusBar');
                    if (elem) {
                        elem.style.width = videoItem.p + '%';
                    }
                }
            }

            addProgramDetails();
        }


        // add eventListener for keydown
        document.addEventListener('keydown', piKeyDownEventListener);
    }

    function removeEventListeners() {
        console.log('***Remove program info event listeners.');
        document.removeEventListener('keydown', piKeyDownEventListener);
    }

    function piKeyDownEventListener(e) {
        e.preventDefault();
        e.stopPropagation();

        var keyCode = e.keyCode;
        var contentId = e.target.id;

        //console.log('Key code : ', keyCode, ' Target element: ', contentId);

        if (keyCode === LEFT) {
            // LEFT arrow
            if (contentId === playIconContainer || contentId === backgroundImage) {
                focusToElement(archiveIconContainer);
            }
            else if (contentId === favoriteIconContainer) {
                if (showPlayBtn) {
                    focusToElement(playIconContainer);
                }
                else {
                    focusToElement(archiveIconContainer);
                }
            }
        }
        else if (keyCode === RIGHT) {
            // RIGHT arrow				
            if (isSideBarMenuActive(contentId)) {
                if (showPlayBtn) {
                    focusToElement(playIconContainer);
                }
                else if (showFavoriteBtn) {
                    focusToElement(favoriteIconContainer);
                }
                else {
                    focusToElement(backgroundImage);
                }
            }
            else {
                if (contentId === playIconContainer) {
                    focusToElement(favoriteIconContainer);
                }
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
                if (programFavoritesIndex === -1) {
                    addProgramToFavorites();
                }
                else {
                    removeProgramToFavorites();
                }
            }
            else if (contentId === platformInfoIconContainer) {
                sideMenuSelection(platformInfoPage);
            }
            else if (contentId === playIconContainer) {
                toPage(archivePlayerPage, programInfoPage);
            }
        }
        else if (keyCode === RETURN || keyCode === ESC) {
            // RETURN button
            if (isSideBarMenuActive(contentId)) {
                focusOutFromMenuEvent(getElementById(archiveIconContainer));
                if (showPlayBtn) {
                    focusToElement(playIconContainer);
                }
                else if (showFavoriteBtn) {
                    focusToElement(favoriteIconContainer);
                }
                else {
                    focusToElement(backgroundImage);
                }
            }
            else {
                removeEventListeners();
                toPreviousPage(archiveMainPage);
            }
        }
    }

    function addProgramDetails() {
        if (selectedProgram) {
            if (selectedProgram.image_path && selectedProgram.image_path.length > 0) {
                addValueToAttribute('backgroundImage', 'src', selectedProgram.image_path);
            }
            else {
                addValueToAttribute('backgroundImage', 'src', 'images/tv7logo.png');
            }

            if (selectedProgram.name_desc) {
                addToElement('nameDesc', selectedProgram.name_desc);
            }

            if (selectedProgram.caption) {
                addToElement('caption', selectedProgram.caption);
            }

            if (selectedProgram.episode_number && selectedProgram.episode_number !== '0') {
                addToElement('episodeNumber', getLocaleTextById('episodeText') + ': ' + selectedProgram.episode_number);
            }

            if (selectedProgram.duration_time) {
                addToElement('duration', getLocaleTextById('durationText') + ': ' + selectedProgram.duration_time);
            }

            if (selectedProgram.broadcast_date_time) {
                var title = comingProgram ? getLocaleTextById('comingProgramsText') : getLocaleTextById('firstBroadcastText');
                addToElement('firstBroadcast', title + ': ' + selectedProgram.broadcast_date_time);
            }

            if (showPlayBtn && selectedProgram.aspect_ratio && selectedProgram.aspect_ratio !== '16:9') {
                addToElement('aspectRatioText', getLocaleTextById('aspectRatioText') + ' ' + selectedProgram.aspect_ratio);
                showElementById('aspectRatioText');
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
        var programId = selectedProgram.id;

        if (favoritesData) {
            for (var i = 0; i < favoritesData.length; i++) {
                var item = favoritesData[i];
                if (item && item.id === programId) {
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
            favoritesData.push(selectedProgram);

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

    function initProgramInfoVariables() {
        selectedProgram = null;
        showPlayBtn = false;
        showFavoriteBtn = false;
        comingProgram = false;

        programFavoritesIndex = -1;
        favoritesData = [];
        favoriteSelectedIcon = 'images/favorites.svg';
        favoriteNotSelectedIcon = 'images/favorites_not_selected.svg';
        textAnimationDuration = 1400;
    }

    ProgramInfo.prototype.playVideoItemClicked = function () {
        //console.log('Play video item clicked.');
        removeEventListeners();
        toPage(archivePlayerPage, programInfoPage);
    }

    ProgramInfo.prototype.favoritesItemClicked = function () {
        //console.log('Favorites item clicked.');

        if (programFavoritesIndex === -1) {
            addProgramToFavorites();
        }
        else {
            removeProgramToFavorites();
        }
    }

    ProgramInfo.prototype.piRemoveEventListeners = function () {
        removeEventListeners();
    }

    return ProgramInfo;
}());


function piFavoritesItemClicked() {
    var obj = new ProgramInfo();
    obj.favoritesItemClicked();

}

function piPlayVideoItemClicked() {
    var obj = new ProgramInfo();
    obj.playVideoItemClicked();
}

function piRemoveEventListeners() {
    var obj = new ProgramInfo();
    obj.piRemoveEventListeners();
}
