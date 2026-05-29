// location.js

import { world } from "../game.js";

export function createLocation(type = "nullString") {
    return { type };
}

world.registerComponent("location")

console.log("Location foi carregado")