'use strict';

var PlatformInfo = (function () {

    function PlatformInfo() { }

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

        var elem = getElementById('appName');
        if (elem) {
            elem.innerHTML = getAppName();
        }

        elem = getElementById('appVersion');
        if (elem) {
            elem.innerHTML = getAppVersion();
        }

        var platformInfo = getValueFromCache(platformInfoKey);
        if (platformInfo) {
            platformInfo = stringToJson(platformInfo);

            elem = getElementById('sdkVersion');
            if (elem) {
                elem.innerHTML = platformInfo.sdkVersion;
            }

            elem = getElementById('platformVersion');
            if (elem) {
                elem.innerHTML = platformInfo.platformVersion;
            }

            elem = getElementById('modelName');
            if (elem) {
                elem.innerHTML = platformInfo.modelName;
            }
        }

        focusToElement('contentContainer');


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

        //console.log('Key code : ', keyCode, ' Target element: ', contentId);

        if (keyCode === LEFT) {
            // LEFT arrow
            if (contentId === 'contentContainer') {
                focusToElement(platformInfoIconContainer);
            }
        }
        else if (keyCode === RIGHT) {
            // RIGHT arrow			
            if (isSideBarMenuActive(contentId)) {
                focusToElement('contentContainer');
            }
        }
        else if (keyCode === UP) {
            // UP arrow
            if (isSideBarMenuActive(contentId)) {
                menuMoveUp(contentId);
            }
        }
        else if (keyCode === DOWN) {
            // DOWN arrow
            if (isSideBarMenuActive(contentId)) {
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
            if (isSideBarMenuActive(contentId)) {
                if (contentId !== platformInfoIconContainer) {
                    removeEventListeners();
                }

                if (contentId === platformInfoIconContainer) {
                    focusOutFromMenuEvent(getElementById(platformInfoIconContainer));
                    focusToElement('contentContainer');
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
        }
        else if (keyCode === RETURN || keyCode === ESC) {
            // RETURN button
            if (isSideBarMenuActive(contentId)) {
                focusOutFromMenuEvent(getElementById(platformInfoIconContainer));
                focusToElement('contentContainer');
            }
            else {
                removeEventListeners();
                toPreviousPage(archiveMainPage);
            }
        }
    }

    PlatformInfo.prototype.pliRemoveEventListeners = function () {
        removeEventListeners();
    }

    return PlatformInfo;
}());

function pliRemoveEventListeners() {
    var obj = new PlatformInfo();
    obj.pliRemoveEventListeners();
}
