'use strict';

var runOnBrowser = false;

// Platform version not to override native video. Example string value: '4.0'
var videoNotOverrideNative = [];

var videoUrlPart = 'https://vod.tv7.fi:443/vod/_definst_/mp4:_LINK_PATH_/playlist.m3u8';
var subtitlesUrlPart = 'https://vod.tv7.fi:4430/vod/'
var searchUrl = 'https://edom.tv7.fi:8443/search1.2/SearchServlet';

var _self = '_self';
var _LINK_PATH_ = '_LINK_PATH_';

var landingPage = 'landing.html';
var tvMainPage = 'tvmain.html';
var archiveMainPage = 'archivemain.html';
var archivePlayerPage = 'archiveplayer.html';
var categoryProgramsPage = 'categoryprograms.html';
var favoritesPage = 'favorites.html';
var guidePage = 'guide.html';
var platformInfoPage = 'platforminfo.html';
var programInfoPage = 'programinfo.html';
var searchPage = 'search.html';
var searchResultPage = 'searchresult.html';
var seriesPage = 'series.html';
var tvPlayerPage = 'tvplayer.html';

var get_ = 'get_';

var recommendedProgramsMethod = 'get_tv7_vod_recommendations';
var broadcastRecommendationsProgramsMethod = 'get_tv7_broadcast_recommendations';
var newestProgramsMethod = 'get_tv7_vod_new';
var mostViewedProgramsMethod = 'get_tv7_vod_previousweek_stats';
var parentCategoriesMethod = 'get_tv7_parent_categories';
var subCategoriesMethod = 'get_tv7_sub_categories';
var programInfoMethod = 'get_tv7_program_info';
var categoryProgramsMethod = 'get_tv7_category_programs';
var seriesInfoMethod = 'get_tv7_series_info';
var seriesProgramsMethod = 'get_tv7_series_programs';
var translationMethod = 'get_tv7_translation';
var guideMethod = 'get_tv7_tv_guide_date';
var searchMethod = 'searchMethod';

var defaultRowCol = '0_0';
var categoryDefaultRowCol = '3_0';
var categoryRowNumber = 3;
var searchKey = 'searchKey';
var clearKey = 'clearKey';
var nullValue = 'null';

// keycodes
var LEFT = 37;
var UP = 38;
var RIGHT = 39;
var DOWN = 40;
var OK = 13;
var RETURN = 461;
var ESC = 27;
var RED = 403;
var GREEN = 404;
var YELLOW = 405;
var BLUE = 406;
var REWIND = 412;
var FORWARD = 417;
var PLAY = 415;
var PAUSE = 19;
var STOP = 413;

var playButton = 'playButton';
var upDownIcon = 'upDownIcon';
var exitYesButton = 'exitYesButton';
var exitCancelButton = 'exitCancelButton';
var tvIconContainer = 'tvIconContainer';
var archiveIconContainer = 'archiveIconContainer';
var guideIconContainer = 'guideIconContainer';
var searchIconContainer = 'searchIconContainer';
var favoritesIconContainer = 'favoritesIconContainer';
var platformInfoIconContainer = 'platformInfoIconContainer';
var mainActiveElementId = 'mainActiveElementId';
var backIconContainer = 'backIconContainer';
var playIconContainer = 'playIconContainer';
var favoriteIconContainer = 'favoriteIconContainer';
var seriesIconContainer = 'seriesIconContainer';
var contentContainer = 'contentContainer';
var backgroundImage = 'backgroundImage';

var streamType = 'application/x-mpegURL';

var dateParam = 'date';
var limitParam = 'limit';
var offsetParam = 'offset';
var categoryParam = 'category';
var programIdParam = 'program_id';
var seriesIdParam = 'series_id';
var categoryIdParam = 'category_id';
var vodParam = 'vod';
var queryParam = 'query';

var keyboardNormal = 1;
var keyboardCapital = 2;
var keyboardSpecial = 3;

var pnidParam = 'pnid';
var audioIndexParam = 'audioindex';
var programIdParam = 'program_id';

var tvBrand = 'lg';

var programScheduleDataKey = 'programScheduleDataKey';
var sdkVersionKey = 'sdkVersionKey';
var platformInfoKey = 'platformInfoKey';

var originPageKey = 'originPageKey';
var recommendedProgramsKey = 'recommendedProgramsKey';
var broadcastRecommendationsProgramsKey = 'broadcastRecommendationsProgramsKey';
var mostViewedProgramsKey = 'mostViewedProgramsKey';
var newestProgramsKey = 'newestProgramsKey';
var parentCategoriesKey = 'parentCategoriesKey';
var subCategoriesKey = 'subCategoriesKey';
var cacheExpirationKey = 'cacheExpirationKey';
var selectedArchiveProgramKey = 'selectedArchiveProgramKey';
var archivePageStateKey = 'archivePageStateKey';
var searchResultPageStateKey = 'searchResultPageStateKey';
var favoritesPageStateKey = 'favoritesPageStateKey';
var categoriesPageStateKey = 'categoriesPageStateKey';
var seriesPageStateKey = 'seriesPageStateKey';
var guidePageStateKey = 'guidePageStateKey';
var selectedCategoryKey = 'selectedCategoryKey';
var searchTextKey = 'searchTextKey';
var favoritesDataKey = 'favoritesDataKey';
var visiblePageKey = 'visiblePageKey';

var archiveCacheExpTimeMs = 1800000;

var mainPageUpdateInterval = 10000;
var tvPlayerControlsUpdateInterval = 10000;
var archivePlayerControlsVisibleTimeout = 6000;

var programListMinSize = 22;
