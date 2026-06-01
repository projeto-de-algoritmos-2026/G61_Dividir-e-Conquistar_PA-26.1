// inventory.js

import { world } from "../game.js";

export function createInventory(slots = 1, activeslot = -1, items = {}) {
    return { slots, activeslot, items };
}

world.registerComponent("inventory")

console.log("Inventory foi carregado")