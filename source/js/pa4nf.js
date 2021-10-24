'use strict';
// for locationchange event
history.pushState = (f => function pushState() {
    const ret = f.apply(this, arguments);
    window.dispatchEvent(new Event('locationchange'));
    return ret;
})(history.pushState);

history.replaceState = (f => function replaceState() {
    const ret = f.apply(this, arguments);
    window.dispatchEvent(new Event('locationchange'));
    return ret;
})(history.replaceState);

window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('locationchange'));
}, false);

// event handler for 'locationchange'
const init = () => {
    window.postMessage({ target: 'inject', msg: 'action', value: 'off' }, "*");
    if (!/https:\/\/(www\.)?netflix\.com\/watch\/.*/.test(window.location.href)) return; // not in the watch page

    let interval_id = setInterval(() => {
        video = document.getElementsByTagName('video')[0];
        if (video !== undefined) {
            window.postMessage({ target: 'inject', msg: 'action', value: 'on' }, "*");
            clearInterval(interval_id);
        }
    }, interval);
}

// event handler for 'keydown'
const keyboardAction = (event) => { // #functions = 7
    try {
        if (!/https:\/\/(www\.)?netflix\.com\/watch\/.*/.test(window.location.href)) return;
        else if (getSessionID() == -1) return;
        else if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) return;
        else;

        pa = vp.getVideoPlayerBySessionId(vp.getAllPlayerSessionIds()[getSessionID()]);
        video = document.getElementsByTagName('video')[0];

        switch (event.code) {
            /***** time forward/rewind *****/
            case 'KeyD':
                pa.seek(pa.getCurrentTime() + time_offset);
                break;
            case 'KeyA':
                pa.seek(pa.getCurrentTime() - time_offset);
                break;
            /***** playback speed fast/slow/default *****/
            case 'KeyE':
                video.playbackRate = getValidValue('playbackrate', video.playbackRate + speed_offset);
                break;
            case 'KeyQ':
                video.playbackRate = getValidValue('playbackrate', video.playbackRate - speed_offset);
                break;
            case 'KeyR':
                video.playbackRate = 1;
                break;
            /***** volume up/down *****/
            case 'KeyW':
                pa.setVolume(getValidValue('volume', Math.round((pa.getVolume() + volume_offset) * 100) / 100));
                break;
            case 'KeyS':
                if (document.getElementsByClassName('skip-credits').length != 0) break; // skip intro

                pa.setVolume(getValidValue('volume', Math.round((pa.getVolume() - volume_offset) * 100) / 100));
                break;
            /***** next episode *****/
            case 'KeyN':
                try {
                    const next_btn = document.querySelector('[data-uia="control-next"]') || document.querySelector('[data-uia="next-episode-seamless-button"]');
                    next_btn.click();
                }
                catch (exception) {
                    console.log('No next episode or button has not been loaded.');
                }
                break;
            /***** switch text track *****/
            case 'KeyC':
                const lang_set = ['繁體中文', '英文'];
                const cur_lang = pa.getTextTrack().displayName;
                for (let index in pa.getTextTrackList()) {
                    let tmp_track = pa.getTextTrackList()[index];
                    let tmp_lang = tmp_track.displayName;
                    if (tmp_lang != cur_lang && lang_set.includes(tmp_lang)) {
                        pa.setTextTrack(tmp_track);
                        break;
                    }
                }
                break;
            /***** start/end *****/
            case 'Home':
                pa.seek(0);
                break;
            case 'End':
                pa.seek(pa.getDuration());
                break;
            default: break;
        }

        /***** jump *****/
        if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(event.key)) {
            pa.seek(pa.getDuration() * 0.1 * parseInt(event.key));
        }
    }
    catch (exception) { }
}

const getSessionID = () => {
    for (let index in vp.getAllPlayerSessionIds()) {
        if (vp.getAllPlayerSessionIds()[index].split('-')[0] == 'watch') {
            return index;
        }
    }

    return -1;
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

let vp = netflix.appContext.state.playerApp.getAPI().videoPlayer;
let pa = null;
let video = null;

let time_offset = 0;
let speed_offset = 0;
let volume_offset = 0;

const interval = 100;

// receive msg('init'/'ask'/'change offset') from inject
window.addEventListener("message", (event) => {
    if (!event.data.target || event.data.target != 'pa4nf') return;

    if (event.data.msg == "init") {
        let storage = event.data.value;
        time_offset = storage.time_offset * 1000;
        speed_offset = storage.speed_offset;
        volume_offset = storage.volume_offset;
    }
    else if (event.data.msg == "ask") {
        pa = vp.getVideoPlayerBySessionId(vp.getAllPlayerSessionIds()[getSessionID()]);
        video = document.getElementsByTagName('video')[0];

        window.postMessage({
            target: 'inject',
            msg: 'ask',
            value: {
                cur_time: pa.getCurrentTime() / 1000,
                cur_speed: video.playbackRate,
                cur_volume: pa.getVolume(),
                duration: pa.getDuration() / 1000,
                max_speed: 16,
                max_volume: 1,
            }
        }, "*");
    }
    else if (event.data.msg == 'change offset') {
        if (event.data.for == 'time_btn') time_offset = event.data.value * 1000;
        else if (event.data.for == 'speed_btn') speed_offset = event.data.value;
        else volume_offset = event.data.value;
    }
    else console.log('PA4NF received an unknown request.');
}, false);

window.postMessage({ target: 'inject', msg: 'init' }, "*"); // init offset
window.addEventListener('keydown', keyboardAction, false);
window.addEventListener('locationchange', init, false);

init();