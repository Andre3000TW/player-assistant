'use strict';
// event handler for 'play'/'pause'
const detectPlayPauseChange = () => {
    if (is_intercepted['play'] === undefined) is_intercepted['play'] = true;
    else is_intercepted['play'] = undefined;
}

// event handler for 'fullscreenchange'/'webkitfullscreenchange'
const detectFullscreenChange = () => {
    if (is_intercepted['fullscreen'] === undefined) is_intercepted['fullscreen'] = true;
    else is_intercepted['fullscreen'] = undefined;
}

// event handler for 'progress'
const unstuck = () => {
    if (pa.buffered.length > 0 && pa.buffered.start(0) > pa.currentTime) {
        const temp = pa.currentTime;
        pa.currentTime = pa.buffered.start(0);
        pa.currentTime = temp;
    }
}

// event handler for 'keydown'
const keyboardAction = (event) => { // #functions = 8
    if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) {
        event.stopImmediatePropagation();
        return;
    }

    switch (event.code) {
        /***** time forward/rewind *****/
        case 'KeyD':
            pa.currentTime += time_offset;
            event.stopImmediatePropagation();
            break;
        case 'KeyA':
            pa.currentTime -= time_offset;
            event.stopImmediatePropagation();
            break;
        /***** playback speed fast/slow/default *****/
        case 'KeyE':
            pa.playbackRate = getValidValue('playbackrate', pa.playbackRate + speed_offset);
            event.stopImmediatePropagation();
            break;
        case 'KeyQ':
            pa.playbackRate = getValidValue('playbackrate', pa.playbackRate - speed_offset);
            event.stopImmediatePropagation();
            break;
        case 'KeyR':
            pa.playbackRate = 1;
            event.stopImmediatePropagation();
            break;
        /***** volume up/down *****/
        case 'KeyW':
            if (pa.muted) pa.muted = false;
            pa.volume = getValidValue('volume', Math.round((pa.volume + volume_offset) * 100) / 100);
            event.stopImmediatePropagation();
            break;
        case 'KeyS':
            if (pa.muted) pa.muted = false;
            pa.volume = getValidValue('volume', Math.round((pa.volume - volume_offset) * 100) / 100);
            event.stopImmediatePropagation();
            break;
        /***** play/pause *****/
        case 'Space':
            setTimeout(() => {
                if (is_intercepted['play']) is_intercepted['play'] = undefined;
                else {
                    is_intercepted['play'] = false;
                    if (pa.paused) pa.play();
                    else pa.pause();
                }
            }, timeout);
            event.preventDefault(); // prevent from scrolling down
            break;
        /***** enter/exit fullscreen *****/
        case 'KeyF':
            setTimeout(() => {
                if (is_intercepted['fullscreen']) is_intercepted['fullscreen'] = undefined;
                else {
                    is_intercepted['fullscreen'] = false;
                    if (document.fullscreen) document.exitFullscreen();
                    else pa.requestFullscreen();
                }
            }, timeout);
            break;
        /***** mute/unmute *****/
        case 'KeyM':
            pa.muted = !pa.muted;
            break;
        /***** start/end *****/
        case 'Home':
            pa.currentTime = 0;
            break;
        case 'End':
            pa.currentTime = pa.duration;
            break;
        default: break;
    }

    /***** jump *****/
    if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(event.key)) {
        pa.currentTime = pa.duration * 0.1 * parseInt(event.key);
    }
}

const getValidValue = (type, new_value) => {
    let max = 0, min = 0;

    if (type === 'playbackrate') min = 0, max = 16;
    else min = 0, max = 1; // 'volume'

    if (min <= new_value && new_value <= max) {
        return new_value;
    }
    else {
        if (new_value > max) return max;
        else return min;
    }
}

// event handler for 'click'
const checkClickedElement = (event) => {
    for (let elem of event.target.ownerDocument.elementsFromPoint(event.clientX, event.clientY)) {
        let video = null;

        if (elem.tagName == 'VIDEO') video = elem;
        else if (elem.getElementsByTagName('video').length == 1) video = elem.getElementsByTagName('video')[0];
        else ;

        if (video && isClickWithinVideo({x: event.clientX, y: event.clientY}, video.getBoundingClientRect())) {
            if (pa != video) { // enable/update pa
                initPA();
                enablePA(video);
            }
            else {
                pa.focus();
                console.log('Clicked element is within video scope.');
            }

            break;
        }
    }
}

const isClickWithinVideo = (click_coord, video_rect) => {
    if ((video_rect.left <= click_coord.x && click_coord.x <= video_rect.right) &&
        (video_rect.top  <= click_coord.y && click_coord.y <= video_rect.bottom)) {
        return true;
    }
    else return false;
}

const initPA = () => {
    is_intercepted['play'] = false;
    is_intercepted['fullscreen'] = false;

    if (pa) {
        pa.removeEventListener('play', detectPlayPauseChange, false);
        pa.removeEventListener('pause', detectPlayPauseChange, false);
        document.removeEventListener('fullscreenchange', detectFullscreenChange, false);
        document.removeEventListener('webkitfullscreenchange', detectFullscreenChange, false);
        pa.removeEventListener('progress', unstuck, false);
        pa.removeEventListener('keydown', keyboardAction, false);
    }
}

const enablePA = (target) => {
    console.log('PA has been enabled/updated');
    pa = target;

    pa.addEventListener('play', detectPlayPauseChange, false);
    pa.addEventListener('pause', detectPlayPauseChange, false);
    document.addEventListener('fullscreenchange', detectFullscreenChange, false);
    document.addEventListener('webkitfullscreenchange', detectFullscreenChange, false);
    pa.addEventListener('progress', unstuck, false);

    pa.setAttribute('tabindex', '0'); // make pa be selectable
    pa.addEventListener('keydown', keyboardAction, false);
    
    chrome.runtime.sendMessage({target: 'bg', msg: 'action', value: 'off' });
    setTimeout(() => {
        pa.focus();
        chrome.runtime.sendMessage({target: 'bg', msg: 'action', value: 'on'});
    }, timeout);
}

let pa = null;

let time_offset = 0;
let speed_offset = 0;
let volume_offset = 0;

const timeout = 200;
let is_intercepted = { 'play': false, 'fullscreen': false};

// receive msg('ask'/'change offset') from popup
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (!req.target || (req.target != 'pa' && req.target != 'content')) return;

    if (req.msg == 'ask') {
        sendResponse({
            cur_time: pa.currentTime,
            cur_speed: pa.playbackRate,
            cur_volume: pa.volume,
            duration: pa.duration,
            max_speed: 16,
            max_volume: 1,
        });
    }
    else if (req.msg == 'change offset') {
        if (req.for == 'time_btn') time_offset = req.value;
        else if (req.for == 'speed_btn') speed_offset = req.value;
        else volume_offset = req.value;
    }
    else console.log('PA received an unknown request.');
})

chrome.storage.local.get({ // init offset
    time_offset: 5,
    speed_offset: 0.25,
    volume_offset: 0.05
}, (storage) => {
    time_offset = storage.time_offset;
    speed_offset = storage.speed_offset;
    volume_offset = storage.volume_offset;
});

window.addEventListener('load', () => {
    let video_count = 0;
    let added_frames = [];

    window.addEventListener('click', checkClickedElement, true);
    video_count += window.document.getElementsByTagName('video').length;
    for (let i = 0; i < frames.length; i++) { // for frames
        try {
            frames[i].addEventListener('click', checkClickedElement, true);
            added_frames.push(frames[i]);
        }
        catch (exception) {
            console.log(exception.message);
        }
    }

    setTimeout(() => { // check if cross-origin
        let is_cross_origin = false;
        for (let i = 0; i < frames.length; i++) { // for frames
            try {
                video_count += frames[i].document.getElementsByTagName('video').length;
            }
            catch (exception) {
                is_cross_origin = true;
                console.log(exception.message);
            }
        }

        if (video_count == 0 && is_cross_origin) {
            chrome.runtime.sendMessage({target: 'bg', msg: 'action', value: 'failed'});
            // window.removeEventListener('click', checkClickedElement, true);
            // for (let iframe of added_frames) {
            //     iframe.removeEventListener('click', checkClickedElement, true);
            // }
        }
    }, 3000);
}, false)