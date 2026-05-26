// renderSystem.js

import { world } from "./game.js"

world.registerSystem("renderSystem", (deltaTime) => {
    const ctx = world.getResource("ctx")
    if (!ctx) return
    const entities = world.query("Position", "Sprite")

    for (const entityId of entities) {
        const position = world.getComponent(entityId, "Position")
        const sprite = world.getComponent(entityId, "Sprite")

        if (position && sprite) {
            // ctx.drawImage(sprite.image, position.x, position.y) 
            ctx.fillStyle = sprite.color || "black"
            ctx.fillRect(position.x, position.y, sprite.width || 0, sprite.height || 0)
        }
    }
})