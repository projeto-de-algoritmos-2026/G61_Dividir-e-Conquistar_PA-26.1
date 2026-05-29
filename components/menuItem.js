// menuItem.js
import { world } from '../game.js';

export function createMenuItem(label = "menuitem", selected = false) {
    return { label, selected }
}

world.registerComponent("menuItem")

console.log("MenuItem foi carregado")
