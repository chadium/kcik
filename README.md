# KCIK

This is a browser extension for the streaming platform [kick.com](https://kick.com).

Features:
- set username color. For example, type `!color hot pink` in any chatroom.
- set chat font size.

The development of this extension is being exclusively live streamed on kick.com! All of you who support me will be credited in the extension! Thank you!

[![Setting username color](https://lh3.googleusercontent.com/9zqfmqYps_Nn_Qmpif2kNNK9KitxHEuJ6h-zkh5HKI5ks2-1KMII0jTC0CUvXtKDqpjFEUd9eY4YZTD0BcldybqIBDw=w640-h400-e365-rj-sc0x00ffffff)]


## Installation

You can download the extension for your browser in the [Chrome Web Store](https://chrome.google.com/webstore/detail/kcik/gjhhdbbkhppoflbcoigffpphhmkffbcf).

Or you can build it yourself by following the Build Instructions below.


## Build Instructions

To build it yourself, you have to install the dependencies. You can do so by running the following command:

```
npm install
```

In the root directory of this project you're going to find a `.env.example` file. Rename it to `.env` and modify if necessary. If you're unsure, feel free to leave it as is.

And then you can run the following command to build the extension:

```
npm run build
```

The extension files will be placed in `dist/chrome-user`. You can load this folder into your browser for development.


## Development

To make it easy for you to test your changes, you can run `npm run watch` instead of `npm run build`. It will automatically build the extension for you as soon as you edit a file. Note that it does not detect any changes made in your `.env` file, so you still must re-run the command in that case.


## Contributing

The easiest way to contribute is by starring this project on GitHub!

https://github.com/chadium/kcik

Found a bug or want to contribute code? Feel free to create an issue or send a pull request on GitHub:

https://github.com/chadium/kcik/issues
