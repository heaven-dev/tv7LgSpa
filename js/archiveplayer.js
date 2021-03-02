'use strict';

var ArchivePlayer = (function () {

    function ArchivePlayer() { }

    var player = null;
    var videoDuration = null;
    var videoCurrentTime = null;
    var videoDurationLabel = null;
    var videoCurrenTimeLabel = null;

    var selectedProgram = null;
    var controlsVisible = false;

    var seeking = false;
    var seekingStep = 10;

    var timeout = null;

    var iconAnimationDuration = 1400;

    ArchivePlayer.prototype.initArchivePlayer = function () {
        hideElementById('toolbarContainer');
        hideElementById('sidebar');

        var elem = getElementById('archivePlayer');
        if (elem) {
            elem.style.height = getWindowHeight() + 'px';
        }

        initArchivePlayerVariables();

        selectedProgram = stringToJson(getValueFromCache(selectedArchiveProgramKey));

        var archiveLanguage = getArchiveLanguage();
        var videoUrl = getVideoUrl(archiveLanguage);
        var langTag = getLanguageTag(archiveLanguage);

        var options = {
            preload: 'auto',
            autoplay: true,
            muted: false,
            fluid: true,
            html5: {
                hls: {
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
                options.html5.hls.overrideNative = false;
                options.html5.nativeAudioTracks = true;
                options.html5.nativeVideoTracks = true;
            }
        }

        getTranslation(selectedProgram.id, langTag, function (data) {
            createTrackElement(data);

            player = videojs('videoPlayer', options, function onPlayerReady() {
                player.src({ type: streamType, src: videoUrl });

                player.ready(function () {
                    videojs.log('Player is ready!');

                    this.play();
                });

                this.on('timeupdate', function () {
                    if (controlsVisible && player) {
                        if (!videoDuration) {
                            videoDuration = player.duration();
                        }

                        updateControls(player.currentTime());
                    }
                });

                this.on('ended', function () {
                    videojs.log('Video end!');

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
                    videojs.log('Error loading video!');
                });
            });
        });


        // add eventListener for keydown
        document.addEventListener('keydown', apKeyDownEventListener);
    }

    function removeEventListeners() {
        console.log('***Remove archive player event listeners.');
        document.removeEventListener('keydown', apKeyDownEventListener);
    }

    function apKeyDownEventListener(e) {
        e.preventDefault();
        e.stopPropagation();

        var keyCode = e.keyCode;

        if (keyCode === UP) {
            // UP arrow
        }
        else if (keyCode === DOWN) {
            // DOWN arrow
        }
        else if (keyCode === LEFT || keyCode === REWIND) {
            // LEFT arrow
            if (controlsVisible) {
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
        else if (keyCode === RIGHT || keyCode === FORWARD) {
            // RIGHT arrow
            if (controlsVisible) {
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
        else if (keyCode === PAUSE || keyCode === STOP) {
            if (!player.paused()) {
                stopTimeout();
                updateControls(videoCurrentTime);

                showControls();
                addProgramDetails();
                pausePlayer();
            }
        }
        else if (keyCode === PLAY) {
            if (player.paused()) {
                if (seeking) {
                    player.currentTime(videoCurrentTime);
                }

                playPlayer();
                hideControls();
            }
        }
        else if (keyCode === OK) {
            // OK button
            if (controlsVisible) {
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
            else {
                addTimeout();
                updateControls(videoCurrentTime);

                showControls();
                addProgramDetails();
            }
        }
        else if (keyCode === RETURN || keyCode === ESC) {
            // RETURN button
            if (controlsVisible) {
                stopTimeout();
                hideControls();

                currentTime();

                playPlayer();
            }
            else {
                disposePlayer();
                toPreviousPage(programInfoPage);
            }
        }
    }

    function pausePlayer() {
        if (player && !player.paused()) {
            player.pause();

            showElementById('pauseIconContainer');
            showPlayPauseIcon('pauseIconContainer');
        }
    }

    function playPlayer() {
        if (player && player.paused()) {
            player.play();

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

        controlsVisible = true;
        updateControls(videoCurrentTime);
    }

    function hideControls() {
        hideElementById('controls');

        controlsVisible = false;
        seeking = false;

        updateControls(0);
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
        videoCurrenTimeLabel = getTimeStampByDuration(currentTime * 1000);

        var timeAndDurationLabel = videoCurrenTimeLabel + ' / ' + videoDurationLabel;
        addToElement('durationCurrentTime', timeAndDurationLabel);

        var percent = currentTime / videoDuration * 100;
        var element = getElementById('statusBar');
        if (element) {
            element.style.width = percent + '%';
        }
    }

    function addTimeout() {
        timeout = setTimeout(function () {
            if (controlsVisible) {
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

    function initArchivePlayerVariables() {
        player = null;
        videoDuration = null;
        videoCurrentTime = null;
        videoDurationLabel = null;
        videoCurrenTimeLabel = null;

        selectedProgram = null;
        controlsVisible = false;

        seeking = false;
        seekingStep = 10;

        timeout = null;

        iconAnimationDuration = 1400;
    }

    return ArchivePlayer;
}());
