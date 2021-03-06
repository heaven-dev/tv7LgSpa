'use strict';

var ChannelInfo = (function () {

    function ChannelInfo() { }

    var scrollTop = 0;
    var channelInfoTextContainer = null;

    ChannelInfo.prototype.initChannelInfo = function () {
        showElementById('toolbarContainer');
        showElementById('sidebar');

        setLocaleText('toolbarText');

        setSelectedSidebarIcon(channelInfoIconContainer,
            [
                tvIconContainer,
                archiveIconContainer,
                guideIconContainer,
                searchIconContainer,
                favoritesIconContainer,
                platformInfoIconContainer
            ]
        );

        initChannelInfoVariables();

        var selectedLocale = getSelectedLocale();
        if (selectedLocale) {
            if (selectedLocale === localeFi) {
                showElementById('localeFi');
            }
            else if (selectedLocale === localeEt) {
                showElementById('localeEt');
            }
            else if (selectedLocale === localeRu) {
                showElementById('localeRu');
            }
            else if (selectedLocale === localeSv) {
                showElementById('localeSv');
            }
        }

        focusToElement('channelInfoContentContainer');


        channelInfoTextContainer = getElementById('channelInfoTextContainer');
        if (channelInfoTextContainer) {
            channelInfoTextContainer.style.height = (getWindowHeight() - 130) + 'px';
            channelInfoTextContainer.addEventListener('mousewheel', ciMouseWheelListener);
        }

        // add eventListener for keydown
        document.addEventListener('keydown', ciKeyDownEventListener);
    }

    function removeEventListeners() {
        console.log('***Remove channel info event listeners.');
        document.removeEventListener('keydown', ciKeyDownEventListener);

        if (channelInfoTextContainer) {
            channelInfoTextContainer.removeEventListener('mousewheel', ciMouseWheelListener);
        }
    }

    function ciMouseWheelListener(e) {
        setTimeout(function () {
            if (channelInfoTextContainer) {
                scrollTop = channelInfoTextContainer.scrollTop;
            }
        });
    }

    function ciKeyDownEventListener(e) {
        e.preventDefault();
        e.stopPropagation();

        var keyCode = e.keyCode;
        var contentId = e.target.id;

        //console.log('Key code : ', keyCode, ' Target element: ', contentId);

        if (keyCode === LEFT) {
            // LEFT arrow
            if (contentId === 'channelInfoContentContainer') {
                focusToElement(channelInfoIconContainer);
            }
        }
        else if (keyCode === RIGHT) {
            // RIGHT arrow			
            if (isSideBarMenuActive(contentId)) {
                focusToElement('channelInfoContentContainer');
            }
        }
        else if (keyCode === UP) {
            // UP arrow
            if (isSideBarMenuActive(contentId)) {
                menuMoveUp(contentId);
            }
            else {
                moveUpDown(false);
            }
        }
        else if (keyCode === DOWN) {
            // DOWN arrow
            if (isSideBarMenuActive(contentId)) {
                menuMoveDown(contentId);
            }
            else {
                moveUpDown(true);
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
                if (contentId !== channelInfoIconContainer) {
                    removeEventListeners();
                }

                if (contentId === channelInfoIconContainer) {
                    focusOutFromMenuEvent(getElementById(channelInfoIconContainer));
                    focusToElement('channelInfoContentContainer');
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
                else if (contentId === platformInfoIconContainer) {
                    sideMenuSelection(platformInfoPage);
                }
            }
        }
        else if (keyCode === RETURN || keyCode === ESC) {
            // RETURN button
            if (isSideBarMenuActive(contentId)) {
                focusOutFromMenuEvent(getElementById(channelInfoIconContainer));
                focusToElement('channelInfoContentContainer');
            }
            else {
                removeEventListeners();
                toPreviousPage(archiveMainPage);
            }
        }
    }

    function moveUpDown(down) {
        if (channelInfoTextContainer) {
            if (down) {
                scrollTop += 50;
                var maxScroll = channelInfoTextContainer.scrollHeight - channelInfoTextContainer.offsetHeight;
                if (scrollTop > maxScroll) {
                    scrollTop = maxScroll;
                }
            }
            else {
                scrollTop -= 50;
                if (scrollTop < 0) {
                    scrollTop = 0;
                }
            }

            channelInfoTextContainer.scrollTop = scrollTop;
        }
    }

    function initChannelInfoVariables() {
        scrollTop = 0;
        channelInfoTextContainer = null;
    }

    ChannelInfo.prototype.ciRemoveEventListeners = function () {
        removeEventListeners();
    }

    return ChannelInfo;
}());

function ciRemoveEventListeners() {
    var obj = new ChannelInfo();
    obj.ciRemoveEventListeners();
}
