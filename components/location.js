// location.js

import { world } from "../game.js";

export function createLocation(type = "nullString", roomId = -1) {
    return { type, roomId };
}

world.registerComponent("location")

console.log("Location foi carregado")