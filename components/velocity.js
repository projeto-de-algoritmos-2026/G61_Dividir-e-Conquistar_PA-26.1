// velocity.js
import { world } from '../game.js';

export function createVelocity(x = 0, y = 0) {
    return { x, y }
}

world.registerComponent("velocity")

console.log("Velocity foi carregado")