// map.js

import { world } from "../game.js";

export function createMap(map = new Map(), currentRoom = -1) {
    return { map, currentRoom };
}

world.registerComponent("map")

console.log("Map foi carregado")