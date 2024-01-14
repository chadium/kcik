# KCIK

An open source extension for the streaming platform kick.com!

Features:
- Change the color of the website.
- Hide streamers from the website.
- Show deleted chat messages.
- Send message history.
- Automatically reject hosts.
- Change playback speed.
- See stream title of following and recommended channels in sidebar.
- Seek clips with arrow keys.
- Space bar can pause and resume clips.
- Mute streams with middle mouse button and change volume with scroll wheel.
- Customize chat font size.
- Display current time instead of remaining time in vods and clips.
- Set your username color. The website only provides 14 colors but with the extension you will be able to pick any color. Anyone using the extension will see this color for your username in chat. Users without the extension will see the color you set on the platform.

The development of this extension is being live streamed on kick.com! As a thank you to all my subscribers, your names will be listed in the Credits tab of the extension.

Note: after installing or updating the extension, you will have to refresh every kick.com tab.


## Installation

You can download the extension for your Google Chrome compatible browser (Edge, Opera, etc) in the [Chrome Web Store](https://chrome.google.com/webstore/detail/kcik/gjhhdbbkhppoflbcoigffpphhmkffbcf).

A link for Firefox users will be available soon.

Or you can build it yourself by following the Build Instructions below.


## Build Instructions

To build it yourself, you have to install the dependencies. You can do so by running the following command:

```
npm install
```

In the root directory of this project you're going to find a `.env.example` file. Rename it to `.env` and modify if necessary. You must likely won't need to change a thing.

And then you can run the following command to build the extension:

```
npm run build
```

The extension files will be placed in `dist/chrome-user`. You can load this folder into your browser. This has been successfully done on Google Chrome and Mozilla Firefox.


## Development

To make it easy for you to test your changes, you can run `npm run watch` instead of `npm run build`. It will automatically build the extension for you as soon as you edit a file. Note that it does not detect any changes made in your `.env` file, so you still must re-run the command in that case.


## Contributing

The easiest way to contribute is by starring this project on GitHub!

https://github.com/chadium/kcik

If you would like to report a bug you can create an issue on GitHub:

https://github.com/chadium/kcik/issues
