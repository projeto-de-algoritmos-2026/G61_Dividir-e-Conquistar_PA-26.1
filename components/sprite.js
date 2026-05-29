// sprite.js
import { world } from '../game.js';

export function createSprite(color = "black", width = 0, height = 0) {
    return { color, width, height };
}

world.registerComponent("sprite")

console.log("Sprite foi carregado")