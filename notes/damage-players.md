A message is sent from the server that indicates when a player is hit. It contains the id of the other player and the damage caused.

The `setHit` mutation in the game object is called in the `hits` message callback.

It also retrieves a system component where it sets a field to true. The name of this field is obfuscated but it represents when a player is it. It also has another field that contains the scene item of the name text. It is later used to update the scene object that represents the player name, it turns visible.