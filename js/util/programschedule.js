'use strict';

function getGuideByDate(date, cb) {
    var url = getArchiveUrl() + guideMethod + '?' + dateParam + '=' + date;
    
    console.log('Guide by date URL: ', url);

    runGuideByDateQuery(url, function(data) {
        data = stringToJson(data);

        var rootProp = guideMethod.replace(get_, '');

        data = data[rootProp];

        var currentTime = Date.now();

        var ongoingProgramIndex = 0;
        for(var i = 0; i < data.length; i++) {
            var item = data[i];

            var time = Number(item.time);
            var endTime = Number(item.end_time);

            item.time = time;
            item.endTime = endTime;
            item.duration = endTime - time;

            item.localStartTime = getLocalTimeByUtcTime(time);
            item.localEndTime = getLocalTimeByUtcTime(endTime);

            item.startEndLocal = item.localStartTime + ' - ' + item.localEndTime;

            item.localStartDate = getLocalDateByUtcTime(time);
            item.localEndDate = getLocalDateByUtcTime(endTime);

            item.duration_time = getTimeStampByDuration(item.duration);
            item.broadcast_date_time = getDateTimeByTimeInMs(time);

            var nameDesc = item.series;
            var name = item.name;
            if (nameDesc && nameDesc.length && name && name.length) {
                nameDesc += (' | ' + name);
            }

            if (!nameDesc || nameDesc.length === 0) {
                nameDesc = name;
            }

            item.name_desc = nameDesc;

            if (item.is_visible_on_vod && item.visible_on_vod_since) {
                item.is_visible_on_vod = isPastTime(parseInt(item.visible_on_vod_since)) ? '2' : '0';
            }
            else {
                item.is_visible_on_vod = '-1';
            }
            
            var s = new Date(time).getTime();
            var e = new Date(endTime).getTime();

            if ((currentTime >= s && currentTime <= e) || e < currentTime) {
                ongoingProgramIndex = i;
            }
        }

        cb({ongoingProgramIndex: ongoingProgramIndex, data: data});
    });
}

function runGuideByDateQuery(url, cb) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            cb(xhttp.responseText);
        }
    };
    xhttp.open('GET', url, true);
    xhttp.send();
}

function getProgramByIndex(data, index) {
    console.log('getProgramByIndex(): data.length: ', data.length, ' index: ', index);

    var p = {};

    if (data) {
        var current = getUtcTimeStamp();

        var ongoingIndex = getOngoingProgramIndex(data);
        console.log('Ongoing program index: ', ongoingIndex);

        p = data[ongoingIndex + index];
        if (p) {
            var start = p.time;

            p.isStartDateToday = isStartDateToday(start);

            if (index === 0) {
                // calculate status bar percent
                
                p.passed = current - new Date(start).getTime();
                p.passedPercent = validatePercentValue(Math.round(p.passed / p.duration * 100));
            }
        }
    }

    return p;
}

function isInIndex(data, index) {
    index = getOngoingProgramIndex(data) + index;
    var p = data[index];
    return p ? true : false;
}

function isOngoingProgram(data, index) {
    var currentUtcTime = getUtcTimeStamp();
    index = getOngoingProgramIndex(data) + index;

    var p = data[index];

    if (p) {
        var s = new Date(p.time).getTime();
        var e = new Date(p.endTime).getTime();
    
        if (currentUtcTime >= s && currentUtcTime <= e) {
            return true;
        }
    }
    return false;
}

function getOngoingAndComingPrograms(data, count) {
    var retData = [];

    var current = getUtcTimeStamp();
    var index = getOngoingProgramIndex(data);

    for(var i = index; i < data.length; i++) {
        // If count is null => take all
        if (count != null && retData.length === count) {
            break;
        }

        var p = data[i];

        if (p) {
            var start = p.time;

            p.isStartDateToday = isStartDateToday(start);

            if (i === index) {
                // calculate status bar percent
                
                p.passed = current - new Date(start).getTime();
                p.passedPercent = validatePercentValue(Math.round(p.passed / p.duration * 100));
            }

            retData.push(p);
        }
    }
    return retData;
}

function validatePercentValue(value) {
    if (value < 0) {
        value = 0;
    }

    if (value > 100) {
        value = 100;
    }

    return value;
}

function getOngoingProgramIndex(data) {
    var index = 0;

    var currentUtcTime = getUtcTimeStamp();
    for(var i = 0; data && i < data.length; i++) {
        var p = data[i];

        if (p) {
            var s = new Date(p.time).getTime();
            var e = new Date(p.endTime).getTime();

            if ((currentUtcTime >= s && currentUtcTime <= e) || e < currentUtcTime) {
                index = i;
            }
        }
    }

    return index;
}

function getGuideData(data, startIndex, count) {
    var retData = [];

    var index = getOngoingProgramIndex(data) + startIndex;

    var p = null;
    for(var i = index; i < data.length; i++) {
        if (retData.length === count) {
            break;
        }

        p = data[i];

        if (p) {
            p.isStartDateToday = isStartDateToday(p.time);

            retData.push(p);
        }
    }
    return retData;
}

function getUtcTimeStamp() {
    return new Date().getTime();
}

function getLocalDateByUtcTime(time) {
    if (time > 0) {
        var d = getLocalDateByUtcTimestamp(time);
        return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear();
    }
    return '';
}

function getLocalTimeByUtcTime(time) {
    if (time > 0) {
        var d = getLocalDateByUtcTimestamp(time);

        return prependZero(d.getHours()) + ':' + prependZero(d.getMinutes());
    }
    return '';
}

function isStartDateToday(time) {
    if (time) {
        var d = getLocalDateByUtcTimestamp(time);
        var t = new Date();
        return t.getDate() === d.getDate() && t.getMonth() === d.getMonth() && t.getFullYear() === d.getFullYear();
    }
    return false;
}

function getLocalDateTime() {
    var d = new Date();

    return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear() + '  ' 
        + prependZero(d.getHours()) + ':' + prependZero(d.getMinutes());
}
