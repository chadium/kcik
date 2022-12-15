# How are matches created

It turns out that the whole UI is coded in Vue.js and the code for creating and joining matches are located in Vuex dispatches. I was hoping to find this code in a separate function isolated from the framework but it is well tied in.

The name of the dispatch method is "enterGame" it can be found in the app.js file, next to other dispatch methods like enterSpectator, closeEscInterface, unmute, etc.

The "game/enterGame" dispatch is called when clicking on the big Create buton of the create match dialog box. All the match options are stored in Vuex state.

The whole file is minified and obfuscated. Luckily, dispatch method name are kept intact.

The "game/enterGame" dispatch will eventually call "game/connectRoom". 

## game/enterGame

- ...
- At the end it places `setTimeout` with 1500 that will call `app/WNnwmM` with true and `app/WNnwMm` with false
- Places a `setTimeout` for 9000 that will call `app/WNnwmM` with false
- Places a `setTimeout` for 1510 that will call `setSearchingRoom` with false


## game/connectRoom

This is a huge one. There is a lot of code. It looks like most of the connection code is here.

It seems to call "setSpectator" with false.

It loops through all the weapons and creates an object with the value true if they were enabled in the settings.

It creates an object with userToken, privacy, map and spectator. Apparently there seems to be a feature that would allow you to join in spectator mode.

It checks for the "create" field. If it is set to true then it's going to populate that object with more fields from the settings and also with the previously created weapons object.

Match types seem to be known as mods. This includes "MapEditorRoom".

Apparently there is a dev map.

It sets TeamDeathmatchRoom to true, Pool to true and something else.

It ends up calling a promise that resolves to the Room object.

Later it builds the URL id for the match and pushes it to the Vue router.

It adds the id to the joined rooms object that is the `joinedRooms` field in the game object.

It calls the `setRoom` commit method.

It sets the `room` field in the game object. So I should just need to pay attention whenever this field is updated.

It calls "subscribeToChat" most likely so it gets chat messages. Intredasting.


## game/subscribeToChat

This seems to connect to chat. It accesses the `room` field of the game object. It seems to call the `onMessage` method. ~~It passes it an object that seems to receive every message.~~ Oh it asks for specific types of messages. There is an object that lists every type of message, including chat messages:

{
    "metadata": 0,
    "initMap": 1,
    "messages": 2,
    "WmMwnN": 3,
    "WmwNM": 4,
    "Wnmw": 5,
    "AFK": 6,
    "WmwNMn": 7,
    "coins": 8,
    "Wmwn": 9,
    "WmwnM": 10,
    "wNM": 11,
    "wNMs": 12,
    "pong": 13,
    "yellowFlagPlaces": 14,
    "testPosition": 15,
    "playerState": 16,
    "mapJson": 17,
    "importMapDone": 18
}


## chat/setMessage

Looks like this commit method is used to add a message to chat.

## Interesting tidbits

- The "setSearchingRoom" method is called. This sets the field searchingRoom to true. Seems to be used to make the loading screen show.