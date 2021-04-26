'use strict';

var ArchivePlayer = (function () {

    function ArchivePlayer() { }

    var player = null;
    var videoDuration = null;
    var videoCurrentTime = null;
    var videoDurationLabel = null;
    var videoCurrentTimeLabel = null;

    var selectedProgram = null;
    var videoStatus = null;
    var controlsVisible = 0;

    var seeking = false;
    var seekingStep = 10;
    var paused = false;

    var timeout = null;
    var errorInterval = null;
    var streamPosition = 0;
    var streamStopCounter = 0;
    var newestPrograms = null;
    var programItemWidth = 0;
    var programItemHeight = 0;
    var animationOngoing = false;
    var rightMargin = 0;
    var archiveLanguage = null;
    var videoUrl = null;
    var playerOptions = null;

    var iconAnimationDuration = 1400;

    ArchivePlayer.prototype.initArchivePlayer = function () {
        hideElementById('toolbarContainer');
        hideElementById('sidebar');

        var elem = getElementById('archivePlayer');
        if (elem) {
            elem.style.height = getWindowHeight() + 'px';
        }

        initArchivePlayerVariables();
        registerHandlebarsHelpers();

        playerOptions = {
            preload: 'auto',
            autoplay: true,
            muted: false,
            playsinline: true,
            html5: {
                vhs: {
                    overrideNative: true
                },
                nativeAudioTracks: false,
                nativeVideoTracks: false
            },
            bandwidth: 50000000
        };

        // If versions defined in the constants.js we don't override native to those versions
        var sdkVersion = sessionStorage.getItem(sdkVersionKey);
        if (sdkVersion) {
            if (videoNotOverrideNative.indexOf(sdkVersion) !== -1) {
                playerOptions.html5.vhs.overrideNative = false;
                playerOptions.html5.nativeAudioTracks = true;
                playerOptions.html5.nativeVideoTracks = true;
            }
        }

        selectedProgram = stringToJson(getValueFromCache(selectedArchiveProgramKey));
        archiveLanguage = getArchiveLanguage();
        videoUrl = getVideoUrl(archiveLanguage);

        preparePlayer();

        readNewestPrograms();

        // add eventListener for keydown
        document.addEventListener('keydown', apKeyDownEventListener);

        addErrorInterval();
    }

    function preparePlayer() {
        createVideoElement();

        videoStatus = getVideoStatus();

        var langTag = getLanguageTag(archiveLanguage);

        getTranslation(selectedProgram.id, langTag, function (data) {
            if (data !== null) {
                if (data.lang) {
                    createTrackElement(data.lang);
                }

                //console.log('Player options: ', playerOptions);
                //console.log('Video URL: ', videoUrl);

                player = videojs('videoPlayer', playerOptions, function onPlayerReady() {
                    player.src({ type: streamType, src: videoUrl });

                    player.ready(function () {
                        videojs.log('Player is ready!');
                    });

                    this.on('loadedmetadata', function () {
                        videojs.log('Video loadedmetadata!');

                        if (videoStatus && videoStatus.p < 100) {
                            player.currentTime(videoStatus.c);
                        }
                    });

                    this.on('timeupdate', function () {
                        if (controlsVisible === 1 && player) {
                            if (!videoDuration) {
                                videoDuration = player.duration();
                            }

                            updateControls(player.currentTime());
                        }
                    });

                    this.on('ended', function () {
                        videojs.log('Video end!');
                        saveVideoStatus();

                        disposePlayer();
                        toPreviousPage(programInfoPage);
                    });

                    this.on('pause', function () {
                        videojs.log('Video paused!');
                    });

                    this.on('play', function () {
                        videojs.log('Video play!');
                    });

                    this.on('error', function () {
                        if (player) {
                            var error = player.error();
                            if (error && error.code === 4 || error && error.code === 1) {
                                saveVideoStatus();

                                disposePlayer();

                                cacheValue(errorTextKey, videoCouldNotBeLoadedText);
                                toPage(errorPage, null);
                            }
                        }
                    });
                });
            }
            else {
                removeEventListeners();
                toPage(errorPage, null);
            }
        });
    }

    function createVideoElement() {
        var videoElem = document.createElement('video');
        if (videoElem) {
            videoElem.setAttribute('id', 'videoPlayer');
            videoElem.setAttribute('class', 'video-js vjs-16-9');

            var container = getElementById('videoPlayerContainer');
            if (container) {
                container.appendChild(videoElem);
            }
        }
    }

    function removeEventListeners() {
        console.log('***Remove archive player event listeners.');
        document.removeEventListener('keydown', apKeyDownEventListener);
    }

    function apKeyDownEventListener(e) {
        e.preventDefault();
        e.stopPropagation();

        var keyCode = e.keyCode;
        var contentId = e.target.id;

        var row = null;
        var col = null;

        if (controlsVisible === 2) {
            var split = contentId.split('_');
            if (split.length > 1) {
                row = parseInt(split[0]);
                col = parseInt(split[1]);
            }
        }

        if (keyCode === UP) {
            // UP arrow
            if (controlsVisible === 2) {
                hideOtherVideos();

                if (!paused) {
                    addTimeout();
                }
            }
        }
        else if (keyCode === DOWN) {
            // DOWN arrow
            if (controlsVisible === 1 && newestPrograms && newestPrograms.length > 0) {
                stopTimeout();
                showOtherVideos();
            }
        }
        else if (keyCode === LEFT) {
            // LEFT arrow
            if (controlsVisible === 1) {
                if (!seeking && player) {
                    stopTimeout();

                    pausePlayer();
                    currentTime();

                    seeking = true;
                }

                videoCurrentTime -= seekingStep;
                if (videoCurrentTime < 0) {
                    videoCurrentTime = 0;
                }

                updateControls(videoCurrentTime);
            }
            else if (controlsVisible === 2) {
                var newCol = col - 1;
                var newFocus = row + '_' + newCol;
                if (elementExist(newFocus) && !animationOngoing) {
                    animationOngoing = true;

                    rowMoveLeftRight(row, newCol, false);
                    focusToElement(newFocus);
                }
            }
        }
        else if (keyCode === REWIND) {
            // REWIND
            if (controlsVisible === 0) {
                addTimeout();
                updateControls(videoCurrentTime);

                showControls();
                addProgramDetails();
            }
            else if (controlsVisible === 1) {
                if (!seeking && player) {
                    stopTimeout();

                    pausePlayer();
                    currentTime();

                    seeking = true;
                }

                videoCurrentTime -= seekingStep;
                if (videoCurrentTime < 0) {
                    videoCurrentTime = 0;
                }

                updateControls(videoCurrentTime);
            }
        }
        else if (keyCode === RIGHT) {
            // RIGHT arrow
            if (controlsVisible === 1) {
                if (!seeking && player) {
                    stopTimeout();

                    pausePlayer();
                    currentTime();

                    seeking = true;
                }

                videoCurrentTime += seekingStep;
                if (videoCurrentTime > videoDuration) {
                    videoCurrentTime = videoDuration;
                }

                updateControls(videoCurrentTime);
            }
            else if (controlsVisible === 2) {
                var newCol = col + 1;
                var newFocus = row + '_' + newCol;
                if (elementExist(newFocus) && !animationOngoing) {
                    animationOngoing = true;

                    rowMoveLeftRight(row, newCol, true);
                    focusToElement(newFocus);
                }
            }
        }
        else if (keyCode === FORWARD) {
            // FORWARD
            if (controlsVisible === 0) {
                addTimeout();
                updateControls(videoCurrentTime);

                showControls();
                addProgramDetails();
            }
            else if (controlsVisible === 1) {
                if (!seeking && player) {
                    stopTimeout();

                    pausePlayer();
                    currentTime();

                    seeking = true;
                }

                videoCurrentTime += seekingStep;
                if (videoCurrentTime > videoDuration) {
                    videoCurrentTime = videoDuration;
                }

                updateControls(videoCurrentTime);
            }
        }
        else if (keyCode === PAUSE) {
            if (!player.paused()) {
                stopTimeout();
                updateControls(videoCurrentTime);

                if (controlsVisible === 2) {
                    hideOtherVideos();
                }

                showControls();
                addProgramDetails();
                pausePlayer();
            }
        }
        else if (keyCode === STOP) {
            saveVideoStatus();
            disposePlayer();

            toPreviousPage(programInfoPage);
        }
        else if (keyCode === PLAY) {
            if (player.paused()) {
                if (seeking) {
                    player.currentTime(videoCurrentTime);
                }

                playPlayer();

                if (controlsVisible === 2) {
                    hideOtherVideos();
                }

                hideControls();
            }
        }
        else if (keyCode === OK) {
            // OK button
            if (controlsVisible === 1) {
                stopTimeout();

                if (seeking) {
                    hideControls();

                    player.currentTime(videoCurrentTime);
                    playPlayer();
                }
                else {
                    if (player.paused()) {
                        playPlayer();
                        hideControls();
                    }
                    else {
                        pausePlayer();
                    }
                }
            }
            else if (controlsVisible === 2) {
                startOtherVideo(col);
            }
            else if (controlsVisible === 0) {
                addTimeout();
                updateControls(videoCurrentTime);

                showControls();
                addProgramDetails();
            }
        }
        else if (keyCode === RETURN || keyCode === ESC) {
            // RETURN button
            if (controlsVisible === 1) {
                stopTimeout();
                hideControls();

                currentTime();

                playPlayer();
            }
            else if (controlsVisible === 2) {
                hideOtherVideos();
                hideControls();

                if (player.paused()) {
                    playPlayer();
                }
            }
            else if (controlsVisible === 0) {
                saveVideoStatus();
                disposePlayer();

                toPreviousPage(programInfoPage);
            }
        }
    }

    function startOtherVideo(col) {
        if (newestPrograms && newestPrograms[col]) {
            saveVideoStatus();

            selectedProgram = newestPrograms[col];
            cacheValue(selectedArchiveProgramKey, jsonToString(selectedProgram));

            videoUrl = getVideoUrl(archiveLanguage);

            deletePageStates();
            removeOriginPage();

            hideOtherVideos();
            hideControls();

            videoDuration = null;
            videoCurrentTime = null;
            videoDurationLabel = null;
            videoCurrentTimeLabel = null;

            paused = false;
            seeking = false;
            controlsVisible = 0;

            addToElement('nameDesc', '');
            addToElement('caption', '');
            addToElement('episodeNumber', '');

            if (player) {
                player.dispose();
                player = null;
            }

            preparePlayer();
        }
    }

    function rowMoveLeftRight(row, col, right) {
        rightMargin = calculateRightMargin(col, right, rightMargin);

        var element = getElementById('videosContainer');
        if (element) {
            //console.log('Right margin value: ', rightMargin);

            anime({
                targets: element,
                right: rightMargin + 'px',
                duration: 180,
                easing: 'easeInOutCirc',
                complete: function () {
                    animationOngoing = false;
                }
            });
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

    function resetRightMargin() {
        rightMargin = 0;

        var element = getElementById('videosContainer');
        if (element) {
            element.style.right = 0 + 'px';
        }
    }

    function pausePlayer() {
        if (player && !player.paused()) {
            player.pause();
            paused = true;

            showElementById('pauseIconContainer');
            showPlayPauseIcon('pauseIconContainer');
        }
    }

    function playPlayer() {
        if (player && player.paused()) {
            player.play();
            paused = false;

            showElementById('playIconContainer');
            showPlayPauseIcon('playIconContainer');
        }
    }

    function showPlayPauseIcon(elementId) {
        var elem = getElementById(elementId);
        if (elem) {
            elem.classList.add('apPlayPauseIconFadeOut');

            setTimeout(function () {
                hideElementById(elementId);
                elem.classList.remove('apPlayPauseIconFadeOut');
            }, iconAnimationDuration)
        }
    }

    function getVideoStatus() {
        var videoItem = null;

        var vs = getSavedValue(videoStatusDataKey);
        if (vs) {
            vs = stringToJson(vs);

            var id = selectedProgram.id;

            for (var i = 0; i < vs.length; i++) {
                if (vs[i].id === id) {
                    videoItem = vs[i];
                    break;
                }
            }
        }

        //console.log('Video status - program id: ', id, ' Item: ', videoItem);

        return videoItem;
    }

    function saveVideoStatus() {
        var vs = getSavedValue(videoStatusDataKey);
        if (vs) {
            vs = stringToJson(vs);
        }
        else {
            vs = [];
        }

        var id = selectedProgram.id;

        for (var i = 0; i < vs.length; i++) {
            if (vs[i].id === id) {
                vs.splice(i, 1);
                break;
            }
        }

        var p = 0;
        var c = player.currentTime();
        if (c > 0) {
            var d = player.duration();

            if (d - c <= 60) {
                p = 100;
            }
            else {
                p = Math.round(c / d * 100);
                if (p < 0) {
                    p = 0;
                }
                if (p > 100) {
                    p = 100;
                }
            }

            vs.unshift({ id: id, c: Math.round(c), p: p });
            saveValue(videoStatusDataKey, jsonToString(vs));
        }
    }

    function currentTime() {
        videoCurrentTime = player.currentTime();
    }

    /*
    Archive video URL:
    - https://vod.tv7.fi:443/vod/_definst_/mp4:" + link_path + "/playlist.m3u8
    - query string:
      - pnid = program id
      - vod = app id (samsung, lg, android) + channel id (FI1, ET1, SV1, RU1), for example lg-FI1 or samsung-ET1
      - audioindex is 0, nebesa channel videos audioindex is always 1
    */
    function getVideoUrl(archiveLanguage) {
        var url = videoUrlPart.replace(_LINK_PATH_, getPath())
            + '?' + pnidParam + '=' + selectedProgram.id
            + '&' + vodParam + '=' + tvBrand + '-' + archiveLanguage
            + '&' + audioIndexParam + '=' + (archiveLanguage === 'RU1' ? '1' : '0');

        //console.log('Video URL: ', url);

        return url;
    }

    function getPath() {
        var path = null;
        if (selectedProgram.link_path && selectedProgram.link_path.length) {
            path = selectedProgram.link_path;
        }
        else if (selectedProgram.path && selectedProgram.path.length) {
            path = selectedProgram.path;
        }

        return path;
    }

    function disposePlayer() {
        removeEventListeners();
        stopErrorInterval();

        if (player) {
            player.dispose();
            player = null;
        }
    }

    function showControls() {
        setTimeout(function () {
            showElementById('controls');
        }, 200);

        currentTime();

        controlsVisible = 1;
        updateControls(videoCurrentTime);
    }

    function hideControls() {
        hideElementById('controls');

        controlsVisible = 0;
        seeking = false;

        updateControls(0);
    }

    function showOtherVideos() {
        resetRightMargin();

        hideElementById('controls');
        showElementById('otherVideos');
        focusToElement(defaultRowCol);

        controlsVisible = 2;
    }

    function hideOtherVideos() {
        resetRightMargin();
        hideElementById('otherVideos');
        showElementById('controls');

        controlsVisible = 1;
    }

    function addProgramDetails() {
        if (selectedProgram) {
            if (selectedProgram.name_desc) {
                addToElement('nameDesc', selectedProgram.name_desc);
            }

            if (selectedProgram.caption) {
                addToElement('caption', selectedProgram.caption);
            }

            if (selectedProgram.episode_number) {
                addToElement('episodeNumber', getLocaleTextById('episodeText') + ': ' + selectedProgram.episode_number);
            }
        }
    }

    function updateControls(currentTime) {
        videoDurationLabel = getTimeStampByDuration(videoDuration * 1000);
        videoCurrentTimeLabel = getTimeStampByDuration(currentTime * 1000);

        var timeAndDurationLabel = videoCurrentTimeLabel + ' / ' + videoDurationLabel;
        addToElement('durationCurrentTime', timeAndDurationLabel);

        var percent = currentTime / videoDuration * 100;
        var element = getElementById('statusBar');
        if (element) {
            element.style.width = percent + '%';
        }
    }

    function addTimeout() {
        timeout = setTimeout(function () {
            if (controlsVisible === 1) {
                hideControls();
            }
        }, archivePlayerControlsVisibleTimeout);
    }

    function stopTimeout() {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
    }

    function addErrorInterval() {
        errorInterval = setInterval(function () {
            if (player && !paused) {
                var currentTime = player.currentTime();
                //console.log('Stream currentTime: ', currentTime);

                if (currentTime <= streamPosition) {
                    // stream stopped
                    if (streamStopCounter === 9) {
                        saveVideoStatus();

                        disposePlayer();

                        cacheValue(errorTextKey, errorReadingVideoStreamText);
                        toPage(errorPage, null);
                    }

                    streamStopCounter++;
                }
                else {
                    streamStopCounter = 0;
                }

                streamPosition = currentTime;
            }
        }, streamErrorInterval);
    }

    function stopErrorInterval() {
        if (errorInterval) {
            clearInterval(errorInterval);
            errorInterval = null;
        }
    }

    function getLanguageTag(archiveLanguage) {
        var langTag = 'fi';
        if (archiveLanguage === 'ET1') {
            langTag = 'et';
        }
        else if (archiveLanguage === 'SV1') {
            langTag = 'sv';
        }
        else if (archiveLanguage === 'RU1') {
            langTag = 'ru';
        }

        return langTag;
    }

    function createTrackElement(data) {
        var videoPlayer = getElementById('videoPlayer');
        if (videoPlayer && data && data.is_subtitle === '1') {

            var track = document.createElement('track');
            if (track) {
                track.setAttribute('kind', 'subtitles');
                track.setAttribute('src', subtitlesUrlPart + data.path);
                track.setAttribute('label', data.language);
                track.setAttribute('srclang', data.lang_id);
                track.setAttribute('default', null);

                videoPlayer.appendChild(track);
            }
        }
    }

    function readNewestPrograms(date, limit, offset, category) {
        getNewestPrograms(date, limit, offset, category, function (data) {
            if (data !== null) {
                newestPrograms = data;
                //console.log('readNewestPrograms(): response: ', newestPrograms);

                if (newestPrograms.length > 0) {
                    addData(newestPrograms, 'newestProgramsTemplate', 'videosContainer');
                }
                else {
                    hideElementById('arrowDownContainer');
                }
            }
            else {
                removeEventListeners();
                toPage(errorPage, null);
            }
        });
    }

    function otherVideoFocus(index) {
        showElementById('playIconContainer_' + index);
    }

    function otherVideoFocusOut(index) {
        hideElementById('playIconContainer_' + index);
    }

    function calculateItemWidth() {
        var width = getWindowWidth() - 40;
        return Math.round(width / 3.2);
    }

    function calculateRowHeight() {
        var height = getWindowHeight() - 180;
        return Math.round(height / 2.5);
    }

    function initArchivePlayerVariables() {
        player = null;
        videoDuration = null;
        videoCurrentTime = null;
        videoDurationLabel = null;
        videoCurrentTimeLabel = null;

        selectedProgram = null;
        videoStatus = null;
        controlsVisible = 0;

        seeking = false;
        seekingStep = 10;
        paused = false;

        timeout = null;
        errorInterval = null;
        streamPosition = 0;
        streamStopCounter = 0;

        newestPrograms = null;
        programItemWidth = 0;
        programItemHeight = 0;
        animationOngoing = false;
        rightMargin = 0;
        archiveLanguage = null;
        videoUrl = null;
        playerOptions = null;

        iconAnimationDuration = 1400;
    }

    function registerHandlebarsHelpers() {
        Handlebars.registerHelper('rowItemWidth', function () {
            if (programItemWidth === 0) {
                programItemWidth = calculateItemWidth();
            }
            return programItemWidth - 20;
        });

        Handlebars.registerHelper('rowItemHeight', function () {
            if (programItemHeight === 0) {
                programItemHeight = calculateRowHeight();
            }
            return programItemHeight - 20;
        });
    }

    ArchivePlayer.prototype.otherVideoClicked = function (item) {
        var col = Number(item.id.split('_')[1]);
        startOtherVideo(col)
    }

    ArchivePlayer.prototype.otherVideoFocus = function (index) {
        otherVideoFocus(index);
    }

    ArchivePlayer.prototype.otherVideoFocusOut = function (index) {
        otherVideoFocusOut(index);
    }

    return ArchivePlayer;
}());


function apOtherVideoClicked(item) {
    var obj = new ArchivePlayer();
    obj.otherVideoClicked(item);
}

function apOtherVideoFocus(index) {
    var obj = new ArchivePlayer();
    obj.otherVideoFocus(index);
}

function apOtherVideoFocusOut(index) {
    var obj = new ArchivePlayer();
    obj.otherVideoFocusOut(index);
}
