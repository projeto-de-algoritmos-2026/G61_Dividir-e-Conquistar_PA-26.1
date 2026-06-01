// itemSpawnSystem.js

import { world } from "../game.js";

const RENDERABLE = [
    "rusty sword"
]

world.registerSystem("itemSpawnSystem", (deltaTime) => {
    //verifica se já existe mapa
    const locations = world.query("player", "location")
    if (locations.length === 0) return;

    //decide se vai ter
    const items = world.query("item", "position")
    if(items.length === 0){
        const newItemId = world.createEntity()
        world.addComponent(newItemId, "item", {
            itemName: "rusty sword",
            stackable: false,
            equippable: true,
            consumable: false,
            onMap: true
        })

        world.addComponent(newItemId, "position", {
            x: 400,
            y: 64
        })
    }

    const ctx = world.getResource("ctx")
    let renderItems = world.query("item", "position")
    for(const itemId of renderItems){
        const item = world.getComponent(itemId, "item")
        const itemName = item.itemName

        const itemPosition = world.getComponent(itemId, "position")

        if(RENDERABLE.includes(itemName)){
            const tilesetImage = world.getResource(itemName)
            if (!tilesetImage) continue;

            let srcX = 0
            let srcY = 0
            let tileW = 16
            let tileH = 24
            let destX = itemPosition.x
            let destY = itemPosition.y

             ctx.drawImage(
                tilesetImage, // a imagem fonte
                srcX, srcY,   // posição do tile no tileset (em pixels)
                tileW, tileH, // tamanho do tile no tileset
                destX, destY, // onde desenhar no canvas
                64, 64  // tamanho final na tela
            )
        }
    }
})