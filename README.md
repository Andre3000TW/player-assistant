# Player Assistant
Player Assistant is a **Chrome extension** which acts as an auxiliary tool for **video watching**. Because not every video player provides the same keyboard shortcuts, the goal of Player Assistant is to integrate common shortcuts of these players, make every video player can have the same integrated features, and give users a better viewing experience.

# Installation
1. Go to `chrome://extensions`
2. Enable the **Developer mode**
3. Click **Load unpacked** button
4. Navigate to the directory of Player Assitant
5. You are all done!

# Usage
### Enable Player Assistant
There are 3 cases for enabling Player Assistant.
+ **Normal websites:** Click the video to enable Player Assistant. Note that in this case, Player Assistant is activated only when the video is selected. Also, Player Assitant do NOT work on [Youtube](https://www.youtube.com).
+ **Netflix:** Go to any of the videos on Netflix and Player Assistant will be enabled automatically.
+ **Cross-origin videos:** When the extension icon changes to [![action_failed](./src/images/action_failed.png?raw=true)](#pin-the-extension), which means that this page **may** contain cross-origin videos. And because of the **[same-origin policy](https://en.wikipedia.org/wiki/Same-origin_policy)**, Player Assistant can NOT be enabled by this extension. However, you can still follow the steps below to enable it. But note that in this case, you can NOT change offsets by the [popup window](#popup-window).
    + Press <kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>c</kbd> and then click the video.
    + Paste the code in **[pa4cross-origin](./pa4cross-origin.js)** to `Chrome DevTools Console` and press <kbd>enter</kbd>. Or save it as a snippet on `Chrome DevTools Sources` so you won't need to copy it every time you want to enable Player Assistant.
    + You will see *"PA has been enabled."* on the console then you are all done.
    
### Keyboard shortcuts
When Player Assistant is enabled and the video is selected(for normal websites), you can use following shortcuts for a specific action. Also note that some players icon wouldn't react to actions taken by Player Assistant, but that doesn't mean actions haven't been taken.
+ Shortcuts for **normal websites**
    | Shortcut                  | Action                                    |
    |---------------------------|-------------------------------------------|
    | <kbd>a</kbd>              | Skip backward(5 seconds in default)       |
    | <kbd>d</kbd>              | Skip forward(5 seconds in default)        |
    | <kbd>q</kbd>              | Decrease playback speed(0.25x in default) |
    | <kbd>e</kbd>              | Increase playback speed(0.25x in default) |
    | <kbd>r</kbd>              | Reset playback speed to 1.0x              |
    | <kbd>s</kbd>              | Decrease volume(5% in default)            |
    | <kbd>w</kbd>              | Increase volume(5% in default)            |
    | <kbd>space</kbd>          | Play/Pause                                |
    | <kbd>f</kbd>              | Toggle fullscreen                         |
    | <kbd>m</kbd>              | Toggle mute                               |
    | <kbd>home</kbd>           | Go to beginning  of video                 |
    | <kbd>end</kbd>            | Go to end of video                        |
    | <kbd>0</kbd>-<kbd>9</kbd> | Go to 0% - 90% of video                   |

+ **Additional** shortcuts for **Netflix**\
*(Note: All of the original Netflix shortcuts are **still available**. You can still use <kbd>s</kbd> to skip intro or recap.)*
    | Shortcut                  | Action                                                  |
    | --------------------------|---------------------------------------------------------|
    | <kbd>n</kbd>              | Play next episode(if available)                         |
    | <kbd>c</kbd>              | Toggle caption between 'Traditional Chinese' and 'English'(if available) |
    
    

### Popup window
+ When Player Assistant is enabled, you can hover over the progress bars **for the current time/speed/volume**.
    <kbd>![bars](./media/github_bars.gif?raw=true)</kbd>
+ When Player Assistant is enabled, you can click the rightmost buttons, enter the value, and press <kbd>enter</kbd> to **edit time/speed/volume offset**. If the edit is valid, you will see the background color of the button change to yellow for a second, that means the offset has been changed successfully and it will immediately affect every website that Player Assistant is currently enabled.
    <kbd>![buttons](./media/github_buttons.gif?raw=true)</kbd>

### Pin the extension
Pin the extension on Chrome to check the current status by the icon.

| Icon                                               | Description                                                             |
|----------------------------------------------------|-------------------------------------------------------------------------|
|![action_on](./media/github_on.png?raw=true)        |Indicates that Player Assistant has been enabled on the current page     |
|![action_off](./media/github_off.png?raw=true)      |Indicates that Player Assistant has NOT been enabled on the current page |
|![action_failed](./media/github_failed.png?raw=true)|Indicates that the current page contains **cross-origin** resources(which may be video) |

# License
This project is under the [MIT License](./LICENSE).
