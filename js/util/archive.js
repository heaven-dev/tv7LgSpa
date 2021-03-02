'use strict';

function getRecommendedPrograms(date, limit, offset, cb) {
    if (!isCacheExpired(cacheExpirationKey + recommendedProgramsKey)) {
        var recommended = getDataFromCache(recommendedProgramsKey);
        if (recommended) {
            console.log('**Return recommended data from cache.');
            cb(recommended);
        }
    }
    else {
        var url = getArchiveUrl() + recommendedProgramsMethod + '?' + dateParam + '=' + date + '&' + limitParam + '=' + limit
            + '&' + offsetParam + '=' + offset;

        console.log('Recommended URL: ', url);

        runQuery(url, function (data) {
            data = stringToJson(data);

            var rootProp = recommendedProgramsMethod.replace(get_, '');

            data = data[rootProp];

            if (!data || data.length <= 4) {
                getBroadcastRecommendationsPrograms(date, limit, offset, function (data) {
                    cb(data);
                });
            }
            else {
                data = filterResponse(data, recommendedProgramsMethod);

                if (data && data.length) {
                    cacheData(recommendedProgramsKey, jsonToString(data));
                }

                cb(data);
            }
        });
    }
}

function getBroadcastRecommendationsPrograms(date, limit, offset, cb) {
    if (!isCacheExpired(cacheExpirationKey + broadcastRecommendationsProgramsKey)) {
        var recommended = getDataFromCache(broadcastRecommendationsProgramsKey);
        if (recommended) {
            console.log('**Return broadcast recommendations data from cache.');
            cb(recommended);
        }
    }
    else {
        var url = getArchiveUrl() + broadcastRecommendationsProgramsMethod + '?' + dateParam + '=' + date + '&' + limitParam + '=' + limit
            + '&' + offsetParam + '=' + offset;

        console.log('Broadcast recommendations URL: ', url);

        runQuery(url, function (data) {
            data = stringToJson(data);

            var rootProp = broadcastRecommendationsProgramsMethod.replace(get_, '');

            data = data[rootProp];
            data = filterResponse(data, broadcastRecommendationsProgramsMethod);

            if (data && data.length) {
                cacheData(broadcastRecommendationsProgramsKey, jsonToString(data));
            }

            cb(data);
        });
    }
}

function getNewestPrograms(date, limit, offset, category, cb) {
    if (!isCacheExpired(cacheExpirationKey + newestProgramsKey)) {
        var newest = getDataFromCache(newestProgramsKey);
        if (newest) {
            console.log('**Return newest data from cache.');
            cb(newest);
        }
    }
    else {
        var url = getArchiveUrl() + newestProgramsMethod + '?' + dateParam + '=' + date + '&' + limitParam + '=' + limit
            + '&' + offsetParam + '=' + offset;

        if (category) {
            url += ('&' + categoryParam + '=' + category);
        }

        console.log('Newest URL: ', url);

        runQuery(url, function (data) {
            data = stringToJson(data);

            var rootProp = newestProgramsMethod.replace(get_, '');

            data = data[rootProp];
            data = filterResponse(data, newestProgramsMethod);

            if (data && data.length) {
                cacheData(newestProgramsKey, jsonToString(data));
            }

            cb(data);
        });
    }
}

function getMostViewedPrograms(archiveLanguage, cb) {
    if (!isCacheExpired(cacheExpirationKey + mostViewedProgramsKey)) {
        var mostViewed = getDataFromCache(mostViewedProgramsKey);
        if (mostViewed) {
            console.log('**Return most viewed data from cache.');
            cb(mostViewed);
        }
    }
    else {
        var url = getArchiveUrl() + mostViewedProgramsMethod + '?' + vodParam + '=' + archiveLanguage;

        console.log('Most viewed URL: ', url);

        runQuery(url, function (data) {
            data = stringToJson(data);

            data = data[mostViewedProgramsMethod];
            data = filterResponse(data, mostViewedProgramsMethod);

            if (data && data.length) {
                cacheData(mostViewedProgramsKey, jsonToString(data));
            }

            cb(data);
        });
    }
}

function getParentCategories(cb) {
    var parentCategories = getDataFromCache(parentCategoriesKey);
    if (parentCategories && parentCategories.length) {
        console.log('**Return parent categories data from cache.');
        cb(parentCategories);
    }
    else {
        var url = getArchiveUrl() + parentCategoriesMethod;

        console.log('Parent categories URL: ', url);

        runQuery(url, function (data) {
            data = stringToJson(data);

            var rootProp = parentCategoriesMethod.replace(get_, '');

            data = data[rootProp];

            if (data && data.length) {
                cacheData(parentCategoriesKey, jsonToString(data));
            }

            cb(data);
        });
    }
}

function getSubCategories(cb) {
    var subCategories = getDataFromCache(subCategoriesKey);
    if (subCategories && subCategories.length) {
        console.log('**Return sub categories data from cache.');
        cb(subCategories);
    }
    else {
        var url = getArchiveUrl() + subCategoriesMethod;

        console.log('Sub categories URL: ', url);

        runQuery(url, function (data) {
            data = stringToJson(data);

            var rootProp = subCategoriesMethod.replace(get_, '');

            data = data[rootProp];

            if (data && data.length) {
                cacheData(subCategoriesKey, jsonToString(data));
            }

            cb(data);
        });
    }
}

function getCategoryPrograms(categoryId, limit, offset, cb) {
    var url = getArchiveUrl() + categoryProgramsMethod + '?' + categoryIdParam + '=' + categoryId + '&' + limitParam + '=' + limit
        + '&' + offsetParam + '=' + offset;

    console.log('Category programs URL: ', url);

    runQuery(url, function (data) {
        data = stringToJson(data);

        var rootProp = categoryProgramsMethod.replace(get_, '');

        data = data[rootProp];

        data = filterResponse(data, categoryProgramsMethod);

        cb(data);
    });
}

function getProgramInfo(programId, cb) {
    var url = getArchiveUrl() + programInfoMethod + '?' + programIdParam + '=' + programId;

    console.log('Program info URL: ', url);

    runQuery(url, function (data) {
        data = stringToJson(data);

        var rootProp = programInfoMethod.replace(get_, '');

        data = data[rootProp];

        data = filterResponse(data, programInfoMethod);

        cb(data);
    });
}

function getSeriesInfo(seriesId, cb) {
    var url = getArchiveUrl() + seriesInfoMethod + '?' + seriesIdParam + '=' + seriesId;

    console.log('Series info URL: ', url);

    runQuery(url, function (data) {
        data = stringToJson(data);

        var rootProp = seriesInfoMethod.replace(get_, '');

        data = data[rootProp];

        cb(data);
    });
}

function getSeriesPrograms(seriesId, limit, offset, cb) {
    var url = getArchiveUrl() + seriesProgramsMethod + '?' + seriesIdParam + '=' + seriesId + '&' + limitParam + '=' + limit
        + '&' + offsetParam + '=' + offset;

    console.log('Series programs URL: ', url);

    runQuery(url, function (data) {
        data = stringToJson(data);

        var rootProp = seriesProgramsMethod.replace(get_, '');

        data = data[rootProp];

        data = filterResponse(data, seriesProgramsMethod);

        cb(data);
    });
}

function getTranslation(id, lang, cb) {
    var url = getArchiveUrl() + translationMethod + '?' + programIdParam + '=' + id;

    console.log('Translations URL: ', url);

    runQuery(url, function (data) {
        data = stringToJson(data);

        var rootProp = translationMethod.replace(get_, '');

        data = data[rootProp];

        var tLang = null;
        for (var i = 0; i < data.length; i++) {
            if (data[i].lang_id && data[i].lang_id === lang) {
                tLang = data[i];
                break;
            }
        }

        cb(tLang);
    });
}

function searchPrograms(queryString, cb) {
    var url = searchUrl + '?' + vodParam + '=' + getArchiveLanguage() + '&' + queryParam + '=' + queryString;

    console.log('Search data URL: ', url);

    runQuery(url, function (data) {
        if (data) {
            data = stringToJson(data);

            var hitCount = data['hit_count'];
            data = filterResponse(data['results'], searchMethod);

            cb({ hit_count: hitCount, results: data });
        }
    });
}

function runQuery(url, cb) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            cb(xhttp.responseText);
        }
    };
    xhttp.open('GET', url, true);
    xhttp.send();
}

function cacheData(key, data) {
    cacheValue(key, data);
    cacheValue(cacheExpirationKey + key, new Date().getTime());
}

function getDataFromCache(key) {
    return stringToJson(getValueFromCache(key));
}

function filterResponse(data, method) {
    if (data) {
        var result = [];

        for (var i = 0; i < data.length; i++) {
            var resultItem = {};
            var sourceItem = data[i];

            resultItem.id = sourceItem.id;
            resultItem.image_path = checkPropertyValue(sourceItem.image_path);
            resultItem.link_path = checkPropertyValue(sourceItem.link_path);
            resultItem.episode_number = checkPropertyValue(sourceItem.episode_number);

            resultItem.sid = checkPropertyValue(sourceItem.sid);
            resultItem.series_id = checkPropertyValue(sourceItem.series_id);
            resultItem.series_name = checkPropertyValue(sourceItem.series_name);

            var firstBroadcast = parseInt(sourceItem.first_broadcast ? sourceItem.first_broadcast : sourceItem.start_date);
            resultItem.broadcast_date_time = getDateTimeByTimeInMs(firstBroadcast);
            resultItem.broadcast_date = getDateByTimeInMs(firstBroadcast);
            resultItem.duration_time = getTimeStampByDuration(sourceItem.duration);

            resultItem.name_desc = '';
            var seriesName = checkPropertyValue(sourceItem.series_name);
            if (!seriesName) {
                seriesName = checkPropertyValue(sourceItem.sname);
            }

            if (seriesName) {
                resultItem.name_desc = seriesName;
            }

            var name = checkPropertyValue(sourceItem.name);
            if (seriesName && name && seriesName !== name) {
                resultItem.name_desc += (' | ' + name);
            }

            if (resultItem.name_desc === '') {
                resultItem.name_desc = name;
            }

            resultItem.caption = checkPropertyValue(sourceItem.caption);

            if (method === broadcastRecommendationsProgramsMethod || method === programInfoMethod) {
                if (sourceItem.is_visible_on_vod) {
                    resultItem.is_visible_on_vod = checkPropertyValue(sourceItem.is_visible_on_vod);

                    var visibleOnVodSince = checkPropertyValue(sourceItem.visible_on_vod_since);
                    if (visibleOnVodSince && visibleOnVodSince.length) {
                        visibleOnVodSince = parseInt(visibleOnVodSince);

                        resultItem.is_visible_on_vod = isPastTime(visibleOnVodSince) ? '1' : '0';
                    }
                }
                else {
                    if (!sourceItem.visible_on_vod_since) {
                        resultItem.is_visible_on_vod = '-1';
                    }
                }

                if (sourceItem.visible_on_vod_since && sourceItem.duration) {
                    var startTime = parseInt(sourceItem.visible_on_vod_since) - parseInt(sourceItem.duration);
                    resultItem.broadcast_date_time = getDateTimeByTimeInMs(startTime);
                }
            }
            else {
                resultItem.is_visible_on_vod = '1';
            }

            if (method === seriesProgramsMethod) {
                resultItem.title_episode_number = getLocaleTextById('episodeText') + ': ' + resultItem.episode_number;
                resultItem.title_duration_time = getLocaleTextById('durationText') + ': ' + resultItem.duration_time;
                resultItem.title_broadcast_date_time = getLocaleTextById('firstBroadcastText') + ': ' + resultItem.broadcast_date_time;
            }

            if (method === searchMethod) {
                resultItem.type = checkPropertyValue(sourceItem.type);
            }

            if (method === programInfoMethod) {
                resultItem.path = checkPropertyValue(sourceItem.path);
                resultItem.aspect_ratio = checkPropertyValue(sourceItem.aspect_ratio);
            }

            result.push(resultItem);
        }
    }
    return result;
}

function checkPropertyValue(property) {
    return property && property !== '' && property !== nullValue ? property : null;
}

function isCacheExpired(key) {
    var cacheTime = getValueFromCache(key);
    if (cacheTime) {
        return new Date().getTime() - cacheTime > archiveCacheExpTimeMs;
    }
    else {
        return true;
    }
}

function filterSubCategories(data, parentId) {
    var filtered = [];
    if (data && parentId) {
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            if (item.parent_id === parentId) {
                filtered.push(item);
            }
        }
    }

    return filtered;
}
