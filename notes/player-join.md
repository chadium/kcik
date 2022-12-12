When a new player joins the room receives a message which triggers a state change. This ends up calling a callback in the players object which will:

- receive an object with a lot of properties. Some of them are:
```js
  ["pos","posTime","rot","bullets","death","models","hits","achievements",
  "isAlive","spawnProtected","dash","isSit","isMove","spectator","deaths",
  "score","kills","hp","maxHp","level","wName","sessionId","name","shortId",
  "clan","role"]
```
- receives the player's session id
- Calls `chat/setMessage` to place a message in the chat that says "Player joined the game".
- Recreates the `players` object. Iterates over the old players object in the `room` object and recreates every single player object. Properties seem to be copied by reference.
- Calls `game/setPlayers` with the new players object.
- Calls a method in an obfuscated property which will
  - Call a method that will create scene object by cloning from an existing scene.
  - Copies all animations and plays standing animation
  - Copies position from player object. Literally calls a copy method in the scene object's position object. It just copies x y z.
  - ...
  - End up calling `setOtherPlayerCallbacks`