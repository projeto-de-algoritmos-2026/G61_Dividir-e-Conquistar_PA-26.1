// monster.js
import { world } from '../game.js';

export function createMonster(monsterType = "nullString", state = "paused") {
    return { monsterType, state }
}

world.registerComponent("monster")

console.log("Monster foi carregado")
