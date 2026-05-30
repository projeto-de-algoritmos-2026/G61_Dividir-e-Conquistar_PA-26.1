// map.js

import { world } from "../game.js";

export function createMap(mapArray = []) {
    return { mapArray };
}

world.registerComponent("map")

console.log("Map foi carregado")