'use strict';
// event handler for 'play'/'pause'
const detectPlayPauseChange = () => {
    if (play_timer) {
        clearTimeout(play_timer);
        play_timer = null;
    }
}

// event handler for 'fullscreenchange'/'webkitfullscreenchange'
const detectFullscreenChange = () => {
    if (fullscreen_timer) {
        clearTimeout(fullscreen_timer);
        fullscreen_timer = null;
    }
}

const detectVolumechangeChange = () => {
    if (mute_timer) {
        clearTimeout(mute_timer);
        mute_timer = null;
    }
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
            play_timer = setTimeout(() => {
                if (pa.paused) pa.play();
                else pa.pause();
            }, short_timeout);
            event.preventDefault(); // prevent from scrolling down
            break;
        /***** enter/exit fullscreen *****/
        case 'KeyF':
            fullscreen_timer = setTimeout(() => {
                if (document.fullscreen) document.exitFullscreen();
                else pa.requestFullscreen();
            }, long_timeout);
            break;
        /***** mute/unmute *****/
        case 'KeyM':
            mute_timer = setTimeout(() => {
                pa.muted = !pa.muted;
            }, short_timeout);
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
                disablePA();
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

const disablePA = () => {
    if (pa) {
        pa.removeEventListener('play', detectPlayPauseChange, false);
        pa.removeEventListener('pause', detectPlayPauseChange, false);
        pa.removeEventListener('volumechange', detectVolumechangeChange, false);
        document.removeEventListener('fullscreenchange', detectFullscreenChange, false);
        document.removeEventListener('webkitfullscreenchange', detectFullscreenChange, false);
        pa.removeEventListener('progress', unstuck, false);

        if (/https:\/\/(www\.)?youtube\.com\/.*/.test(window.location.href)) {
            document.getElementsByTagName('ytd-player')[0].addEventListener('keydown', keyboardAction, false);
        }
        else pa.removeEventListener('keydown', keyboardAction, false);
    }
}

const enablePA = (target) => {
    pa = target;

    pa.addEventListener('play', detectPlayPauseChange, false);
    pa.addEventListener('pause', detectPlayPauseChange, false);
    pa.addEventListener('volumechange', detectVolumechangeChange, false);
    document.addEventListener('fullscreenchange', detectFullscreenChange, false);
    document.addEventListener('webkitfullscreenchange', detectFullscreenChange, false);
    pa.addEventListener('progress', unstuck, false);
    
    if (/https:\/\/(www\.)?youtube\.com\/.*/.test(window.location.href)) {
        document.getElementsByTagName('ytd-player')[0].addEventListener('keydown', keyboardAction, false);
    }
    else {
        pa.setAttribute('tabindex', '0'); // make pa be selectable
        pa.addEventListener('keydown', keyboardAction, false);
    }
    
    chrome.runtime.sendMessage({target: 'bg', msg: 'action', value: 'off' });
    setTimeout(() => {
        pa.focus();
        chrome.runtime.sendMessage({target: 'bg', msg: 'action', value: 'on'});
        console.log('PA has been enabled/updated');
    }, short_timeout);
}

let pa = null;

let time_offset = 0;
let speed_offset = 0;
let volume_offset = 0;

const short_timeout = 200;
const long_timeout = 300;
let play_timer = null;
let fullscreen_timer = null;
let mute_timer = null;

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
    volume_offset: 0.10
}, (storage) => {
    time_offset = storage.time_offset;
    speed_offset = storage.speed_offset;
    volume_offset = storage.volume_offset;
});

window.addEventListener('load', () => {
    window.addEventListener('click', checkClickedElement, true);
});