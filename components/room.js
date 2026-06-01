// room.js

import { world } from "../game.js";

export function createRoom(north = null, south = null, east = null, west = null) {
    return { north, south, east, west };
}

world.registerComponent("room")

console.log("Room foi carregado")