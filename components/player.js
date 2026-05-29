// player.js

import { world } from "../game.js";

export function createPlayer(name = "nullString") {
    return { name };
}

world.registerComponent("player")

console.log("Player foi carregado")