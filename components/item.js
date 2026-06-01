// item.js

import { world } from "../game.js";

export function createItem(itemName = "nullString", stackable = false, equippable = false, consumable = false, onMap = false) {
    return { itemName, stackable, equippable, consumable, onMap };
}

world.registerComponent("item")

console.log("Item foi carregado")