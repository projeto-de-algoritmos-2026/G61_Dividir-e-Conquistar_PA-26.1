// position.js
import { world } from '../game.js';

export function createPosition(x = 0, y = 0) {
    return { x, y };
}

world.registerComponent("position")

console.log("Position foi carregado")