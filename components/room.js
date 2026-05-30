// room.js

import { world } from "../game.js";

export function createRoom(id = null, north = null, south = null, east = null, west = null) {
    return { id, north, south, east, west };
}

world.registerComponent("room")

console.log("Room foi carregado")