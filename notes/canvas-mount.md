# Canvas mount

I happen to start the client with no internet connection and I notice a bunch of stack traces and erros in the console. One of them is a call that happens on Vue mount. I checked what it was and it turns out it's the code that draws the player character in the lobby. The player character was missing so there might be more clues as to how they get this info.

The vue element has only one data field: initUserPlayer. It is set to false by default.

I just so happen to find the method that does all the initialization and sets up global variables. It calls init and startAnimationLoop.

In the `init` function, a resize event listener is attached to the window.