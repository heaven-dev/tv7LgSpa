'use strict';

/**
 * Updated by gulp script during a build of the app.
 */
var selectedLocale = 'fi';

/**
 * Updated by gulp script during a build of the app.
 */
var appName = 'Taivas TV7';

/**
 * Updated by gulp script during a build of the app.
 */
var appVersion = '2.2.8';

var logoTaivas = 'images/logo_taivas.png';
var logoTaevas = 'images/logo_taevas.png';
var logoNebesa = 'images/logo_nebesa.png';
var logoHimlen = 'images/logo_himlen.png';

var archivePageImageTaivas = 'images/archive_page_image_taivas.png';
var archivePageImageTaevas = 'images/archive_page_image_taevas.png';
var archivePageImageNebesa = 'images/archive_page_image_nebesa.png';
var archivePageImageHimlen = 'images/archive_page_image_himlen.png';

var channelUrlFi = 'https://vod.tv7.fi:443/tv7-fi/_definst_/smil:tv7-fi.smil/playlist.m3u8';
var channelUrlEt = 'https://vod.tv7.fi:443/tv7-ee/_definst_/smil:tv7-ee.smil/playlist.m3u8';
var channelUrlRu = 'https://vod.tv7.fi:443/tv7-ru/_definst_/smil:tv7-ru.smil/playlist.m3u8';
var channelUrlSv = 'https://vod.tv7.fi:443/tv7-se/_definst_/smil:tv7-se.smil/playlist.m3u8';

var archiveUrlFi = 'https://www.tv7.fi/wp-json/tv7-api/v1/';
var archiveUrlEt = 'https://www.tv7.ee/wp-json/tv7-api/v1/';
var archiveUrlRu = 'https://www.nebesatv7.com/wp-json/tv7-api/v1/';
var archiveUrlSv = 'https://www.himlentv7.se/wp-json/tv7-api/v1/';

var archiveLanguageFi = 'FI1';
var archiveLanguageEt = 'ET1';
var archiveLanguageRu = 'RU1';
var archiveLanguageSv = 'SV1';

var localeFi = 'fi';
var localeEt = 'et';
var localeRu = 'ru';
var localeSv = 'sv';

/*
* UI texts and methods to update texts to the UI.
*/
var localeTextFi = [
    { id: 'toolbarText', text: 'Kun sisältö ratkaisee' },
    { id: 'nextProgramsText', text: 'Tulossa kanavalta' },
    { id: 'dateElem', text: 'Tänään' },
    { id: 'modalQuestionText', text: 'Sulje Taivas TV7 sovellus' },
    { id: 'exitYesButton', text: 'OK' },
    { id: 'exitCancelButton', text: 'Peruuta' },
    { id: 'comingProgramsText', text: 'Tulossa kanavalta' },
    { id: 'tvIconText', text: 'Netti-TV' },
    { id: 'archiveIconText', text: 'Arkisto' },
    { id: 'searchIconText', text: 'Haku' },
    { id: 'guideIconText', text: 'TV-opas' },
    { id: 'favoritesIconText', text: 'Suosikit' },
    { id: 'channelInfoIconText', text: 'Taivas TV7' },
    { id: 'platformInfoIconText', text: 'Tietoja' },
    { id: 'savedSearchTitle', text: 'Haku' },
    { id: 'searchText', text: 'Hae' },
    { id: 'searchResultText', text: 'Haku tulokset' },
    { id: 'clearText', text: 'Tyhjennä' },
    { id: 'recommendedProgramsText', text: 'Suosittelemme' },
    { id: 'mostViewedProgramsText', text: 'Katsotuimmat' },
    { id: 'newestProgramsText', text: 'Uusimmat' },
    { id: 'categoryText', text: 'Kategoria' },
    { id: 'categoriesText', text: 'Kategoriat' },
    { id: 'topicalSeriesText', text: 'Ajankohtaiset sarjat' },
    { id: 'categoryBackText', text: 'Takaisin' },
    { id: 'episodeText', text: 'Jakso' },
    { id: 'seriesText', text: 'Sarja' },
    { id: 'durationText', text: 'Kesto' },
    { id: 'firstBroadcastText', text: 'Ensiesitys' },
    { id: 'favoritesText', text: 'Suosikit' },
    { id: 'noFavoritesText', text: 'Ei lisättyjä suosikkeja' },
    { id: 'noHitsText', text: 'Ei hakuosumia' },
    { id: 'addedToFavoritesText', text: 'Lisätty suosikkeihin' },
    { id: 'removedFromFavoritesText', text: 'Poistettu suosikeista' },
    { id: 'aspectRatioText', text: 'Kuvasuhde' },
    { id: 'copyrightText', text: 'Copyright © Taivas TV7. Unauthorized publication of programs or subtitles is prohibited.' },
    { id: 'clearConfigurationText', text: 'Clear configuration' },
    { id: 'confirmationQuestionText', text: 'Clear configuration?' },
    { id: 'videoStatusConfiguationText', text: 'Video status' },
    { id: 'favoritesConfigurationText', text: 'Favorites' },
    { id: 'searchHistoryConfigurationText', text: 'Search history' },
    { id: 'confirmationOkButton', text: 'OK' },
    { id: 'confirmationCancelButton', text: 'Cancel' },
    { id: 'itemsText', text: 'items' }
];

var localeTextEt = [
    { id: 'toolbarText', text: 'Kui sisu on oluline' },
    { id: 'nextProgramsText', text: 'Tulekul' },
    { id: 'dateElem', text: 'Täna' },
    { id: 'modalQuestionText', text: 'Sulge TV7 äpp' },
    { id: 'exitYesButton', text: 'OK' },
    { id: 'exitCancelButton', text: 'Tühista' },
    { id: 'comingProgramsText', text: 'Tulekul' },
    { id: 'tvIconText', text: 'Neti-TV' },
    { id: 'archiveIconText', text: 'Arhiiv' },
    { id: 'searchIconText', text: 'Otsing' },
    { id: 'guideIconText', text: 'Saatekava' },
    { id: 'favoritesIconText', text: 'Lemmikud' },
    { id: 'channelInfoIconText', text: 'Taevas TV7' },
    { id: 'platformInfoIconText', text: 'Infot' },
    { id: 'savedSearchTitle', text: 'Otsing' },
    { id: 'searchText', text: 'Otsi' },
    { id: 'searchResultText', text: 'Otsingu tulemused' },
    { id: 'clearText', text: 'Kustuta' },
    { id: 'recommendedProgramsText', text: 'Vaata arhiivist' },
    { id: 'mostViewedProgramsText', text: 'Vaadatuimad' },
    { id: 'newestProgramsText', text: 'Kõige uuemad' },
    { id: 'categoryText', text: 'Kategooria' },
    { id: 'categoriesText', text: 'Kategooriad' },
    { id: 'topicalSeriesText', text: 'Praegused sarjad' },
    { id: 'categoryBackText', text: 'Tagasi' },
    { id: 'episodeText', text: 'Osa' },
    { id: 'seriesText', text: 'Saatesari' },
    { id: 'durationText', text: 'Kestus' },
    { id: 'firstBroadcastText', text: 'Esimene saade' },
    { id: 'favoritesText', text: 'Lemmikud' },
    { id: 'noFavoritesText', text: 'Lemmikuid pole lisatud' },
    { id: 'noHitsText', text: 'Otsingutulemusi pole' },
    { id: 'addedToFavoritesText', text: 'Lisatud lemmikutesse' },
    { id: 'removedFromFavoritesText', text: 'Lemmikutest eemaldatud' },
    { id: 'aspectRatioText', text: 'Kuvasuhe' },
    { id: 'copyrightText', text: 'Copyright © Taevas TV7. Unauthorized publication of programs or subtitles is prohibited.' },
    { id: 'clearConfigurationText', text: 'Clear configuration' },
    { id: 'confirmationQuestionText', text: 'Clear configuration?' },
    { id: 'videoStatusConfiguationText', text: 'Video status' },
    { id: 'favoritesConfigurationText', text: 'Favorites' },
    { id: 'searchHistoryConfigurationText', text: 'Search history' },
    { id: 'confirmationOkButton', text: 'OK' },
    { id: 'confirmationCancelButton', text: 'Cancel' },
    { id: 'itemsText', text: 'items' }
];

var localeTextRu = [
    { id: 'toolbarText', text: 'Когда содержание имеет значение' },
    { id: 'nextProgramsText', text: 'Скоро на телеканале' },
    { id: 'dateElem', text: 'Сегодня' },
    { id: 'modalQuestionText', text: 'Закрыть приложение ТВ7' },
    { id: 'exitYesButton', text: 'OK' },
    { id: 'exitCancelButton', text: 'Отмена' },
    { id: 'comingProgramsText', text: 'Скоро на телеканале' },
    { id: 'tvIconText', text: 'Веб-ТВ' },
    { id: 'archiveIconText', text: 'Видеоархив' },
    { id: 'searchIconText', text: 'Поиск' },
    { id: 'guideIconText', text: 'Телепрограмму' },
    { id: 'favoritesIconText', text: 'Избранные' },
    { id: 'channelInfoIconText', text: 'Небеса ТВ7' },
    { id: 'platformInfoIconText', text: 'Информация' },
    { id: 'savedSearchTitle', text: 'Поиск' },
    { id: 'searchText', text: 'Найти' },
    { id: 'searchResultText', text: 'Результаты поиска' },
    { id: 'clearText', text: 'стере́ть' },
    { id: 'recommendedProgramsText', text: 'Рекомендуемые' },
    { id: 'mostViewedProgramsText', text: 'Самые популярные' },
    { id: 'newestProgramsText', text: 'Новые' },
    { id: 'categoryText', text: 'Категория' },
    { id: 'categoriesText', text: 'Категории' },
    { id: 'topicalSeriesText', text: 'Текущая серия' },
    { id: 'categoryBackText', text: 'Обратно' },
    { id: 'episodeText', text: 'Выпуск' },
    { id: 'seriesText', text: 'Серия' },
    { id: 'durationText', text: 'Продолжительность' },
    { id: 'firstBroadcastText', text: 'Первая трансляция' },
    { id: 'favoritesText', text: 'Избранные' },
    { id: 'noFavoritesText', text: 'Список Избранных пуст' },
    { id: 'noHitsText', text: 'Ничего не найдено' },
    { id: 'addedToFavoritesText', text: 'Добавлено в Избранные' },
    { id: 'removedFromFavoritesText', text: 'Удалено из Избранных' },
    { id: 'aspectRatioText', text: 'Соотношение сторон' },
    { id: 'copyrightText', text: 'Copyright © Небеса ТВ7. Unauthorized publication of programs or subtitles is prohibited.' },
    { id: 'clearConfigurationText', text: 'Clear configuration' },
    { id: 'confirmationQuestionText', text: 'Clear configuration?' },
    { id: 'videoStatusConfiguationText', text: 'Video status' },
    { id: 'favoritesConfigurationText', text: 'Favorites' },
    { id: 'searchHistoryConfigurationText', text: 'Search history' },
    { id: 'confirmationOkButton', text: 'OK' },
    { id: 'confirmationCancelButton', text: 'Cancel' },
    { id: 'itemsText', text: 'items' }
];

var localeTextSv = [
    { id: 'toolbarText', text: 'När innehållet avgör' },
    { id: 'nextProgramsText', text: 'Kommande program på kanalen' },
    { id: 'dateElem', text: 'I dag' },
    { id: 'modalQuestionText', text: 'Stäng Himlen TV7-appen' },
    { id: 'exitYesButton', text: 'OK' },
    { id: 'exitCancelButton', text: 'Avbryt' },
    { id: 'comingProgramsText', text: 'Kommande program på kanalen' },
    { id: 'tvIconText', text: 'TV-kanal' },
    { id: 'archiveIconText', text: 'Play-arkiv' },
    { id: 'searchIconText', text: 'Sök' },
    { id: 'guideIconText', text: 'Tablå' },
    { id: 'favoritesIconText', text: 'Favoriter' },
    { id: 'channelInfoIconText', text: 'Himlen TV7' },
    { id: 'platformInfoIconText', text: 'Information' },
    { id: 'savedSearchTitle', text: 'Sök' },
    { id: 'searchText', text: 'Sök' },
    { id: 'searchResultText', text: 'Sökresultat' },
    { id: 'clearText', text: 'Radera' },
    { id: 'recommendedProgramsText', text: 'Rekommenderat i arkivet' },
    { id: 'mostViewedProgramsText', text: 'Populärast just nu' },
    { id: 'newestProgramsText', text: 'Senaste' },
    { id: 'categoryText', text: 'Kategori' },
    { id: 'categoriesText', text: 'Kategorier' },
    { id: 'topicalSeriesText', text: 'Aktuella serier' },
    { id: 'categoryBackText', text: 'Tillbaka' },
    { id: 'episodeText', text: 'Avsnitt' },
    { id: 'seriesText', text: 'Programserie' },
    { id: 'durationText', text: 'Längd' },
    { id: 'firstBroadcastText', text: 'Första sändningen' },
    { id: 'favoritesText', text: 'Favoriter' },
    { id: 'noFavoritesText', text: 'Inga favoriter valda' },
    { id: 'noHitsText', text: 'Inga sökträffar' },
    { id: 'addedToFavoritesText', text: 'Tillagd bland favoriter' },
    { id: 'removedFromFavoritesText', text: 'Borttagen från favoriter' },
    { id: 'aspectRatioText', text: 'Bildförhållande' },
    { id: 'copyrightText', text: 'Copyright © Himlen TV7. Unauthorized publication of programs or subtitles is prohibited.' },
    { id: 'clearConfigurationText', text: 'Clear configuration' },
    { id: 'confirmationQuestionText', text: 'Clear configuration?' },
    { id: 'videoStatusConfiguationText', text: 'Video status' },
    { id: 'favoritesConfigurationText', text: 'Favorites' },
    { id: 'searchHistoryConfigurationText', text: 'Search history' },
    { id: 'confirmationOkButton', text: 'OK' },
    { id: 'confirmationCancelButton', text: 'Cancel' },
    { id: 'itemsText', text: 'items' }
];

var keyboardLetters = {
    1: [
        { n: 'q', c: 'Q' },
        { n: 'w', c: 'W' },
        { n: 'e', c: 'E' },
        { n: 'r', c: 'R' },
        { n: 't', c: 'T' },
        { n: 'y', c: 'Y' },
        { n: 'u', c: 'U' },
        { n: 'i', c: 'I' },
        { n: 'o', c: 'O' },
        { n: 'p', c: 'P' },
        { n: 'å', c: 'Å' }
    ],
    2: [
        { n: 'a', c: 'A' },
        { n: 's', c: 'S' },
        { n: 'd', c: 'D' },
        { n: 'f', c: 'F' },
        { n: 'g', c: 'G' },
        { n: 'h', c: 'H' },
        { n: 'j', c: 'J' },
        { n: 'k', c: 'K' },
        { n: 'l', c: 'L' },
        { n: 'ö', c: 'Ö' },
        { n: 'ä', c: 'Ä' }
    ],
    3: [
        { n: 'z', c: 'Z' },
        { n: 'x', c: 'X' },
        { n: 'c', c: 'C' },
        { n: 'v', c: 'V' },
        { n: 'b', c: 'B' },
        { n: 'n', c: 'N' },
        { n: 'm', c: 'M' }
    ],
};

var keyboardNumberSpecial = {
    1: [
        { n: '1' },
        { n: '2' },
        { n: '3' },
        { n: '4' },
        { n: '5' },
        { n: '6' },
        { n: '7' },
        { n: '8' },
        { n: '9' },
        { n: '0' },
        { n: ',' },
    ],
    2: [
        { n: '.' },
        { n: ';' },
        { n: ':' },
        { n: '!' },
        { n: '=' },
        { n: '/' },
        { n: '(' },
        { n: ')' },
        { n: '[' },
        { n: ']' },
        { n: '-' }
    ],
    3: [
        { n: '_' },
        { n: '*' },
        { n: '>' },
        { n: '<' },
        { n: '#' },
        { n: '?' },
        { n: '+' },
        { n: '&' },
    ]
};

var keyboardLettersEt = {
    1: [
        { n: 'q', c: 'Q' },
        { n: 'w', c: 'W' },
        { n: 'e', c: 'E' },
        { n: 'r', c: 'R' },
        { n: 't', c: 'T' },
        { n: 'y', c: 'Y' },
        { n: 'u', c: 'U' },
        { n: 'i', c: 'I' },
        { n: 'o', c: 'O' },
        { n: 'p', c: 'P' },
        { n: 'ü', c: 'Ü' },
        { n: 'õ', c: 'Õ' }
    ],
    2: [
        { n: 'a', c: 'A' },
        { n: 's', c: 'S' },
        { n: 'd', c: 'D' },
        { n: 'f', c: 'F' },
        { n: 'g', c: 'G' },
        { n: 'h', c: 'H' },
        { n: 'j', c: 'J' },
        { n: 'k', c: 'K' },
        { n: 'l', c: 'L' },
        { n: 'ö', c: 'Ö' },
        { n: 'ä', c: 'Ä' }
    ],
    3: [
        { n: 'z', c: 'Z' },
        { n: 'x', c: 'X' },
        { n: 'c', c: 'C' },
        { n: 'v', c: 'V' },
        { n: 'b', c: 'B' },
        { n: 'n', c: 'N' },
        { n: 'm', c: 'M' }
    ],
};

var keyboardNumberSpecialEt = {
    1: [
        { n: '1' },
        { n: '2' },
        { n: '3' },
        { n: '4' },
        { n: '5' },
        { n: '6' },
        { n: '7' },
        { n: '8' },
        { n: '9' },
        { n: '0' },
        { n: ',' },
    ],
    2: [
        { n: '.' },
        { n: ';' },
        { n: ':' },
        { n: '!' },
        { n: '=' },
        { n: '/' },
        { n: '(' },
        { n: ')' },
        { n: '[' },
        { n: ']' },
        { n: '-' }
    ],
    3: [
        { n: '_' },
        { n: '*' },
        { n: '>' },
        { n: '<' },
        { n: '#' },
        { n: '?' },
        { n: '+' },
        { n: '&' },
    ]
};

var keyboardLettersRu = {
    1: [
        { n: 'ё', c: 'Ё' },
        { n: 'ъ', c: 'Ъ' },
        { n: 'я', c: 'Я' },
        { n: 'ш', c: 'Ш' },
        { n: 'е', c: 'Е' },
        { n: 'р', c: 'Р' },
        { n: 'т', c: 'Т' },
        { n: 'ы', c: 'Ы' },
        { n: 'у', c: 'У' },
        { n: 'и', c: 'И' },
        { n: 'о', c: 'О' },
        { n: 'п', c: 'П' },
        { n: 'ю', c: 'Ю' },
    ],
    2: [
        { n: 'щ', c: 'Щ' },
        { n: 'э', c: 'Э' },
        { n: 'а', c: 'А' },
        { n: 'с', c: 'С' },
        { n: 'д', c: 'Д' },
        { n: 'ф', c: 'Ф' },
        { n: 'г', c: 'Г' },
        { n: 'ч', c: 'Ч' },
        { n: 'й', c: 'Й' },
        { n: 'к', c: 'К' },
        { n: 'л', c: 'Л' },
        { n: 'ь', c: 'Ь' }
    ],
    3: [
        { n: 'ж', c: 'Ж' },
        { n: 'з', c: 'З' },
        { n: 'х', c: 'Х' },
        { n: 'ц', c: 'Ц' },
        { n: 'в', c: 'В' },
        { n: 'б', c: 'Б' },
        { n: 'н', c: 'Н' },
        { n: 'м', c: 'М' }
    ],
};

var keyboardNumberSpecialRu = {
    1: [
        { n: '1' },
        { n: '2' },
        { n: '3' },
        { n: '4' },
        { n: '5' },
        { n: '6' },
        { n: '7' },
        { n: '8' },
        { n: '9' },
        { n: '0' },
        { n: ',' },
    ],
    2: [
        { n: '.' },
        { n: ';' },
        { n: ':' },
        { n: '!' },
        { n: '=' },
        { n: '/' },
        { n: '(' },
        { n: ')' },
        { n: '[' },
        { n: ']' },
        { n: '-' }
    ],
    3: [
        { n: '_' },
        { n: '*' },
        { n: '>' },
        { n: '<' },
        { n: '#' },
        { n: '?' },
        { n: '+' },
        { n: '&' },
    ]
};

function getSelectedLocale() {
    return selectedLocale;
}

function getLocaleTextById(id) {
    var text = '';
    var localeTexts = getSelectedLocaleTexts();

    if (id) {
        for (var i = 0; i < localeTexts.length; i++) {
            var locale = localeTexts[i];
            if (locale && locale.id === id) {
                text = locale.text;
                break;
            }
        }
    }
    return text;
}

function getElementById(id) {
    return document.getElementById(id);
}

function setLocaleText(id) {
    if (!id) {
        return;
    }

    var localeText = getLocaleTextById(id);
    if (!localeText) {
        return;
    }

    var elem = getElementById(id);
    if (!elem) {
        return;
    }

    elem.innerHTML = localeText;
}

function getSelectedLocaleTexts() {
    if (selectedLocale === 'fi') {
        return localeTextFi;
    }
    else if (selectedLocale === 'et') {
        return localeTextEt;
    }
    else if (selectedLocale === 'ru') {
        return localeTextRu;
    }
    else if (selectedLocale === 'sv') {
        return localeTextSv;
    }
}

function getKeyboard() {
    if (selectedLocale === 'fi' || selectedLocale === 'sv') {
        return { letter: keyboardLetters, special: keyboardNumberSpecial };
    }
    else if (selectedLocale === 'et') {
        return { letter: keyboardLettersEt, special: keyboardNumberSpecialEt };
    }
    else if (selectedLocale === 'ru') {
        return { letter: keyboardLettersRu, special: keyboardNumberSpecialRu };
    }
}

function getChannelLogo() {
    if (selectedLocale === 'fi') {
        return logoTaivas;
    }
    else if (selectedLocale === 'et') {
        return logoTaevas;
    }
    else if (selectedLocale === 'ru') {
        return logoNebesa;
    }
    else if (selectedLocale === 'sv') {
        return logoHimlen;
    }
}

function getArchivePageImage() {
    if (selectedLocale === 'fi') {
        return archivePageImageTaivas;
    }
    else if (selectedLocale === 'et') {
        return archivePageImageTaevas;
    }
    else if (selectedLocale === 'ru') {
        return archivePageImageNebesa;
    }
    else if (selectedLocale === 'sv') {
        return archivePageImageHimlen;
    }
}

function getChannelUrl() {
    if (selectedLocale === 'fi') {
        return channelUrlFi;
    }
    else if (selectedLocale === 'et') {
        return channelUrlEt;
    }
    else if (selectedLocale === 'ru') {
        return channelUrlRu;
    }
    else if (selectedLocale === 'sv') {
        return channelUrlSv;
    }
}

function getArchiveUrl() {
    if (selectedLocale === 'fi') {
        return archiveUrlFi;
    }
    else if (selectedLocale === 'et') {
        return archiveUrlEt;
    }
    else if (selectedLocale === 'ru') {
        return archiveUrlRu;
    }
    else if (selectedLocale === 'sv') {
        return archiveUrlSv;
    }
}

function getArchiveLanguage() {
    if (selectedLocale === 'fi') {
        return archiveLanguageFi;
    }
    else if (selectedLocale === 'et') {
        return archiveLanguageEt;
    }
    else if (selectedLocale === 'ru') {
        return archiveLanguageRu;
    }
    else if (selectedLocale === 'sv') {
        return archiveLanguageSv;
    }
}

function getAppName() {
    return appName;
}

function getAppVersion() {
    return appVersion;
}
