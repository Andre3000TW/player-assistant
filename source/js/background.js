'use strict';
// receive msg('action') from pa/inject
chrome.runtime.onMessage.addListener((req, sender) => {
    if (!req.target || req.target != 'bg') return;

    if (req.msg == 'action') {
        if (req.value == 'on') {
            chrome.action.setPopup({popup: 'popup.html', tabId: sender.tab.id});
            chrome.action.setIcon({path: {"16": "../images/action_on.png"}, tabId: sender.tab.id});
        }
        else if (req.value == 'off') {
            chrome.action.setPopup({popup: '', tabId: sender.tab.id});
            chrome.action.setIcon({path: {"16": "../images/action_off.png"}, tabId: sender.tab.id})
        }
        else console.log('BG received an unknown action request.');
    }
    else console.log('BG received an unknown request.');
})