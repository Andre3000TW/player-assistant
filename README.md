# Player Assistant
Player Assistant is a **Chrome extension** which acts as an auxiliary tool for **video watching**. Because not every video player provides the same keyboard shortcuts, the goal of Player Assistant is to integrate common shortcuts of these players, make every video player can have the same integrated features, and give users a better viewing experience.

# Installation
### Install through Chrome Web Store
[![install-on-chrome-web-store](./media/install-on-chrome-web-store.png)](https://chrome.google.com/webstore/detail/player-assistant/igdagoipdgdcidbkflnildofndcbnfff?hl=zh-TW&authuser=1)

# Usage
### Enable Player Assistant
Click the video to enable Player Assistant. Note that Player Assistant is activated only when the video is selected.
    
### Keyboard shortcuts
When Player Assistant is enabled and the video is selected(for normal websites), you can use following shortcuts for a specific action. Also note that some players icon wouldn't react to actions taken by Player Assistant, but that doesn't mean actions haven't been taken.
+ Shortcuts for **normal websites**
    | Shortcut                  | Action                                     |
    |---------------------------|--------------------------------------------|
    | <kbd>a</kbd>              | Skip backward(5 seconds in default)        |
    | <kbd>d</kbd>              | Skip forward(5 seconds in default)         |
    | <kbd>q</kbd>              | Decrease playback speed(0.25x in default)  |
    | <kbd>e</kbd>              | Increase playback speed(0.25x in default)  |
    | <kbd>r</kbd>              | Reset playback speed to 1.0x               |
    | <kbd>s</kbd>              | Decrease volume(10% in default)            |
    | <kbd>w</kbd>              | Increase volume(10% in default)            |
    | <kbd>space</kbd>          | Play/Pause                                 |
    | <kbd>f</kbd>              | Toggle fullscreen                          |
    | <kbd>m</kbd>              | Toggle mute                                |
    | <kbd>home</kbd>           | Go to beginning  of video                  |
    | <kbd>end</kbd>            | Go to end of video                         |
    | <kbd>0</kbd>-<kbd>9</kbd> | Go to 0% - 90% of video                    |

+ **Additional** shortcuts for **Netflix**\
*(Note: All of the original Netflix shortcuts are **still available**. You can still use <kbd>s</kbd> to skip intro.)*
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

# License
This project is under the [MIT License](./LICENSE).
