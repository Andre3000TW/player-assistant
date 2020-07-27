'use strict';
// create and append script tag
let script = document.createElement('script');
script.type = 'text/javascript';
script.src = chrome.extension.getURL('js/pa4nf.js');
document.body.appendChild(script);

// forward msg('init'/'ask'/'change offset') from pa4nf to pa4nf/popup/bg
window.addEventListener("message", (event) => {
    if (!event.data.target || (event.data.target != 'inject' && event.data.target != 'content')) return;

    if (event.data.msg == "init") {
        chrome.storage.local.get({ // get back saved/default value
            time_offset: 5,
            speed_offset: 0.25,
            volume_offset: 0.10
        }, (storage) => {
            window.postMessage({
                target: 'pa4nf',
                msg: 'init',
                value: {
                    time_offset: storage.time_offset,
                    speed_offset: storage.speed_offset,
                    volume_offset: storage.volume_offset
                }
            }, "*");
        });            
    }
    else if (event.data.msg == 'ask') {
        chrome.runtime.sendMessage({
            target: 'popup',
            msg: event.data.msg,
            value: event.data.value
        });
    }
    else if (event.data.msg == 'action') {
        chrome.runtime.sendMessage({
            target: 'bg',
            msg: event.data.msg,
            value: event.data.value
        });
    }
    else console.log('INJECT received an unknown request.');
}, false);

// forward msg('ask'/'change offset') from popup to pa4nf
chrome.runtime.onMessage.addListener((req) => {
    if (!req.target || (req.target != 'inject' && req.target != 'content')) return;

    if (req.msg == 'ask' || req.msg == 'change offset') {
        window.postMessage({target: 'pa4nf', msg: req.msg, for: req.for, value: req.value}, "*");
    }
    else console.log('INJECT received an unknown request.');
})