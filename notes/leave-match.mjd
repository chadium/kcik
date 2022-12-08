# Leaving matches

Quite a lot of things happen.

It starts in the `game/exitGame` dispatch.

- Calls app/gameplayStop
- Pushes home to the router object
- Calls app/WNnwMm with true
- Calls setPreEndScreen with false
- Calls app/WNnMwm with false
- Calls sounds/playSound with quickTransition
- Calls sounds/stopAmbient with lobby
- Calls setDeaths with 0
- Calls setKills with 0
- Calls setScore with 0
- Calls setHP with 100
- Calls setTeamPoints for first team and second team
- Calls user/getProfile if user is logged in
- Calls mWnwM.leaveGame
- Calls setRoom with null
- Calls setSpectator with false
- Calls setClientFromRegion with the value of selectedRegion


## mWnwM.leaveGame
- Calls room.leave
- Ends with a call to mWnwM.dispose.

## mWnwM.dispose
- It calls room.wMWmNn
    - Which seems to clear events:
```
                  this.onJoin.clear(),
                    this.onStateChange.clear(),
                    this.onError.clear(),
                    this.onLeave.clear(),
                    (this.onMessageHandlers.events = {});
```
- Calls room.wMWm