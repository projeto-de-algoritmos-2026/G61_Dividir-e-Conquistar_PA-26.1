// player.js

import { world } from "../game.js";

export function createPlayer(name = "nullString", luck = 50) {
    return { name, luck };
}

world.registerComponent("player")

console.log("Player foi carregado")