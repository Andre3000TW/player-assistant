'use strict';
if (document.getElementsByTagName('video').length > 0) {
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
                break;
            case 'KeyA':
                pa.currentTime -= time_offset;
                break;
            /***** playback speed fast/slow/default *****/
            case 'KeyE':
                pa.playbackRate = getValidValue('playbackrate', pa.playbackRate + speed_offset);
                break;
            case 'KeyQ':
                pa.playbackRate = getValidValue('playbackrate', pa.playbackRate - speed_offset);
                break;
            case 'KeyR':
                pa.playbackRate = 1;
                break;
            /***** volume up/down *****/
            case 'KeyW':
                if (pa.muted) pa.muted = false;
                pa.volume = getValidValue('volume', Math.round((pa.volume + volume_offset) * 100) / 100);
                break;
            case 'KeyS':
                if (pa.muted) pa.muted = false;
                pa.volume = getValidValue('volume', Math.round((pa.volume - volume_offset) * 100) / 100);
                event.stopImmediatePropagation();
                break;
            /***** play/pause *****/
            case 'Space':
                status = pa.paused;
                setTimeout(() => {
                    if (status == pa.paused) {
                        if (pa.paused) pa.play();
                        else pa.pause();
                    }
                }, timeout);
                break;
            /***** enter/exit fullscreen *****/
            case 'KeyF':
                status = document.fullscreen;
                setTimeout(() => {
                    if (status == document.fullscreen) {
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

    const videos = document.getElementsByTagName('video');

    let pa = videos[0];
    let win = pa.ownerDocument.defaultView;

    let time_offset = 5;
    let speed_offset = 0.25;
    let volume_offset = 0.05;

    let status = null;
    let timeout = 200;

    win.addEventListener('click', (event) => {
        event.preventDefault();
    }, false);
    win.addEventListener('keydown', keyboardAction, false);

    if (videos.length == 1) console.log('PA has been enabled.');
    else console.log('PA has been enabled, but multiple videos were found.');
}
else console.log('Please change to another JS context.');