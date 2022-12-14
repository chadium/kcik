# Leaving pre end screen

The timer seems to be placed in the mounted method of the component that draws the whole ranking page.

It saves the setTimeout id in `delayedLeaveTimer`. The `leave` method, which is called when the leave button is pressed, clears the timeout. The leave method is also called in the timeout.

If I disable the timer, the players gets disconnected from the room after some time.

The `leave` method will

- call dispatch `game/exitGame`.
- call commit `app/WNnMwm` with false

By calling `app/WNnMwm` I can bring over the page whenever I want. It seems to just set `app.Wnmw` to true or false.

# Pre end screen

When the match ends some message is sent to the room which will then

remove some system

Call `game/setPreEndScreen` with true

Stops rendering canvas

Removed animation frame callbacks

Sets useMainLoop to false

Removes more components

Sets a animation callback and a timeout

In the animation callback it does a bunch of math and then calls execute on some object that contains the system manager and entity manager

The execute method of the system manager runs execute on all systems that are registered. There seem to be none at this point

In the entity manager it calls processDeferredRemoval. There are no entities to remove

Accesses disablePos in userData

The WMmNwnect field seems to have user position data

Will copy user data current pos to that field if disablePos is not turned on

At the end will call request animation frame on itself

In the timeout it will do something and then call game/Wnmw. This just seems to be where the game transitions to the ranking screen but there is no code that actually renders that screen

It sets Wnmw to true and plays sounds.

Preventing the timeout from being called does not prevent the ranking screen from appearing 
