'use strict';
let tabs_status = {};

// receive msg('action') from pa/inject
chrome.runtime.onMessage.addListener((req, sender) => {
    if (!req.target || req.target != 'bg') return;

    if (req.msg == 'action') {
        if (req.value == 'on') {
            tabs_status[sender.tab.id] = 'on';
            chrome.browserAction.setPopup({popup: 'popup.html'});
            chrome.browserAction.setIcon({path: {"16": "images/action_on.png"}, tabId: sender.tab.id});
        }
        else if (req.value == 'off') {
            tabs_status[sender.tab.id] = 'off';
            chrome.browserAction.setPopup({popup: ''});
            chrome.browserAction.setIcon({path: {"16": "images/action_off.png"}, tabId: sender.tab.id})
        }
        else if (req.value == 'failed') {
            tabs_status[sender.tab.id] = 'failed';
            chrome.browserAction.setPopup({popup: ''});
            chrome.browserAction.setIcon({path: {"16": "images/action_failed.png"}, tabId: sender.tab.id})
        }
    }
    else console.log('BG received an unknown request.');
})

chrome.tabs.onActivated.addListener((info) => {
    if (tabs_status[info.tabId] == 'on') chrome.browserAction.setPopup({popup: 'popup.html'});
    else chrome.browserAction.setPopup({popup: ''});
});