'use strict';
// event handler for 'fullscreenchange'/'webkitfullscreenchange'
const detectFullscreenChange = () => {
    if (fullscreen_timer) {
        clearTimeout(fullscreen_timer);
        fullscreen_timer = null;
    }
}

// event handler for 'volumechange'
const detectVolumeChange = () => {
    if (mute_timer) {
        clearTimeout(mute_timer);
        mute_timer = null;
    }
}

// event handler for 'play/pause'
const detectPlayPuaseChange = () => {
    if (play_pause_timer) {
        clearTimeout(play_pause_timer);
        play_pause_timer = null;
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
    if (is_last_mouse_pos_not_within_video || isEditing(event.target) ||
        event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) return;
    
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
            if (pa.muted) pa.muted = false; // unmute when adjusting volume

            pa.volume = getValidValue('volume', Math.round((pa.volume + volume_offset) * 100) / 100);
            event.stopImmediatePropagation();
            break;
        case 'KeyS':
            if (pa.muted) pa.muted = false; // unmute when adjusting volume

            pa.volume = getValidValue('volume', Math.round((pa.volume - volume_offset) * 100) / 100);
            event.stopImmediatePropagation();
            break;
        /***** enter/exit fullscreen *****/
        case 'KeyF':
            fullscreen_timer = setTimeout(() => {
                if (document.fullscreen) document.exitFullscreen();
                else pa.requestFullscreen();
            }, timeout);
            break;
        /***** mute/unmute *****/
        case 'KeyM':
            mute_timer = setTimeout(() => {
                pa.muted = !pa.muted;
            }, timeout);
            break;
        /***** play/pause *****/
        case 'Space':
            play_pause_timer = setTimeout(() => {
                if (pa.paused) pa.play();
                else pa.pause();
            }, timeout);
            event.preventDefault(); // prevent from scrolling down
            break;
        /***** start/end *****/
        case 'Home':
            pa.currentTime = 0;
            event.preventDefault(); // prevent from scrolling to the top
            event.stopImmediatePropagation();
            break;
        case 'End':
            pa.currentTime = pa.duration;
            event.preventDefault(); // prevent from scrolling to the bottom
            event.stopImmediatePropagation();
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

    if (type == 'playbackrate') min = 0, max = 16;
    else min = 0, max = 1; // 'volume'

    if (min <= new_value && new_value <= max) {
        return new_value;
    }
    else {
        if (new_value > max) return max;
        else return min;
    }
}

const isEditing = (target) => {
    if (target.nodeName == 'INPUT' || target.contentEditable == 'true') {
        return true;
    }
    else return false;
}

// event handler for 'click'
const checkClickedElement = (event) => {
    for (let elem of event.target.ownerDocument.elementsFromPoint(event.clientX, event.clientY)) {
        let video = null;

        if (elem.tagName == 'VIDEO') video = elem;
        else if (elem.getElementsByTagName('video').length == 1) video = elem.getElementsByTagName('video')[0];
        else ;

        if (video && isClickWithinVideo({x: event.clientX, y: event.clientY}, video.getBoundingClientRect())) {
            is_last_mouse_pos_not_within_video = false;
            if (pa != video) { // enable/update pa
                disablePA();
                enablePA(video);
            }
            else console.log('Clicked element is within video scope.');
            break;
        }
        else is_last_mouse_pos_not_within_video = true;
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
        window.removeEventListener('keydown', keyboardAction, true);
        document.removeEventListener('fullscreenchange', detectFullscreenChange, true);
        document.removeEventListener('webkitfullscreenchange', detectFullscreenChange, true);
        pa.removeEventListener('volumechange', detectVolumeChange, true);
        pa.removeEventListener('play', detectPlayPuaseChange, true);
        pa.removeEventListener('pause', detectPlayPuaseChange, true);
        pa.removeEventListener('progress', unstuck, true);

        chrome.runtime.sendMessage({ target: 'bg', msg: 'action', value: 'off' });
    }
}

const enablePA = (video) => {
    pa = video;

    window.addEventListener('keydown', keyboardAction, true);
    document.addEventListener('fullscreenchange', detectFullscreenChange, true);
    document.addEventListener('webkitfullscreenchange', detectFullscreenChange, true);
    pa.addEventListener('volumechange', detectVolumeChange, true);
    pa.addEventListener('play', detectPlayPuaseChange, true);
    pa.addEventListener('pause', detectPlayPuaseChange, true);
    pa.addEventListener('progress', unstuck, true);
    
    setTimeout(() => {
        chrome.runtime.sendMessage({target: 'bg', msg: 'action', value: 'on'});
        console.log('PA has been enabled/updated');
    }, timeout);
}

let pa = null;

let is_last_mouse_pos_not_within_video = true;

let time_offset = 0;
let speed_offset = 0;
let volume_offset = 0;

const timeout = 300;
let fullscreen_timer = null;
let mute_timer = null;
let play_pause_timer = null;

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