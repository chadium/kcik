# gameplayStart

- Checks if a mystery variable is false
- Checks if HP is greater than 0
- Checks if esc menu is off
  - Checks if another mystery variable is true
    - Logs "gameplay start" to the console.
    - Calls `gameplayStart` in `crazysdk`. But it seems to be set to null.
  - Calls commit `app/setGameplay` with true

# gameplayStop

- Checks if `app.gameplay` is true
  - Compares two encrypted string calls
    - mystery
  - else
    - Checks if a mystery variable is true. This seems to be the same variable from `gameplayStart`
      - Logs "gameplay stop" to the console.
      - Calls `gameplayStop` in `crazysdk`. But it seems to be set to null.
    - Calls commit `app/setGameplay` with true
