// collider.js
import { world } from '../game.js';

export function createCollider(width = 32, height = 32, offsetX = 0, offsetY = 0) {
    return { width, height, offsetX, offsetY };
}

world.registerComponent("collider")

console.log("Collider foi carregado")