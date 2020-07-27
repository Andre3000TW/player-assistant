'use strict';
document.addEventListener("DOMContentLoaded", () => { // init pb & btn
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (!/https:\/\/(www\.)netflix\.com\/.*/.test(tabs[0].url)) { // not netflix
            chrome.tabs.sendMessage(tabs[0].id, {target: 'pa', msg: 'ask'}, (res) => {
                initProgressBar(res);
            });
        }
        else {
            chrome.tabs.sendMessage(tabs[0].id, {target: 'inject', msg: 'ask'});
            chrome.runtime.onMessage.addListener((req) => {
                if (!req.target || req.target != 'popup') return;

                if (req.msg == 'ask') initProgressBar(req.value);
                else console.log('POPUP received an unknown request.');
            });
        }
    });

    initButton();
});

// functions 4 pb
const initProgressBar = (info) => {
    const time_pb = document.getElementById('time_pb');
    const speed_pb = document.getElementById('speed_pb');
    const volume_pb = document.getElementById('volume_pb');
    // set value
    const time_percentage = Math.round((info.cur_time / info.duration) * 100);
    const speed_percentage = Math.round((info.cur_speed / info.max_speed) * 100);
    const volume_percentage = Math.round((info.cur_volume / info.max_volume) * 100);
    time_pb.setAttribute('value', time_percentage);
    speed_pb.setAttribute('value', speed_percentage);
    volume_pb.setAttribute('value', volume_percentage);
    // set data-label
    time_pb.setAttribute('data-label', getValidValue('time', info.cur_time));
    speed_pb.setAttribute('data-label', getValidValue('speed', info.cur_speed));
    volume_pb.setAttribute('data-label', getValidValue('volume', info.cur_volume));
}

const getValidValue = (type, value) => { // for progree bar
    if (type == 'time') {
        value = parseFloat(value);
        return new Date(value * 1000).toISOString().substr(11, 8);
    }
    else if (type == 'speed') {
        return value + 'x';
    }
    else { // type == 'volume'
        value = parseFloat(value);
        value = Math.round(value * 100);
        value = value.toString() + '%';
        return value;
    }
}

// functions 4 button
const initButton = () => {
    const time_btn = document.getElementById('time_btn');
    const speed_btn = document.getElementById('speed_btn');
    const volume_btn = document.getElementById('volume_btn');
    // get back saved/default value
    chrome.storage.local.get({
        time_offset: 5,
        speed_offset: 0.25,
        volume_offset: 0.10
    }, (storage) => {
        time_btn.innerHTML = storage.time_offset;
        speed_btn.innerHTML = storage.speed_offset;
        volume_btn.innerHTML = storage.volume_offset * 100;
    });
    // adding listener
    time_btn.addEventListener('keyup', onEnter);
    speed_btn.addEventListener('keyup', onEnter);
    volume_btn.addEventListener('keyup', onEnter);
}

const onEnter = (event) => {
    if (event.key == 'Enter') {
        let type = event.target.id;
        let value = parseFloat(event.target.innerHTML);

        if (isValidOffset(type, value)) {
            if (type == 'time_btn') chrome.storage.local.set({time_offset: value});
            else if (type == 'speed_btn') chrome.storage.local.set({speed_offset: value});
            else {
                value /= 100;
                chrome.storage.local.set({volume_offset: value});
            }

            chrome.tabs.query({}, (tabs) => {
                for (let i = 0; i < tabs.length; ++i) {
                    chrome.tabs.sendMessage(tabs[i].id, {
                        target: 'content',
                        msg: 'change offset',
                        for: type,
                        value: value
                    });
                }
            });

            event.target.style.background = 'yellow';
            setTimeout(() => {
                event.target.style.background = '';
            }, 500);
        }
    }    
}

const isValidOffset = (type, value) => { // for changing offset
    if (Number.isNaN(value) || value.toString().length > 5) return false;

    if (type == 'time_btn') {
        if (value <= 0 || value >= 99999) return false;
    }
    else if (type == 'speed_btn') {
        if (value <= 0 || value >= 16) return false;
    }
    else {
        if (value <= 1 || value >= 100) return false;
    }

    return true;
}