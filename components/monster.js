// monster.js
import { world } from '../game.js';

export function createMonster(monsterType = "nullString") {
    return { monsterType }
}

world.registerComponent("monster")

console.log("Monster foi carregado")
