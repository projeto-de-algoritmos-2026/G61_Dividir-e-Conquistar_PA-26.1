// renderSystem.js

import { world } from "../game.js"

world.registerSystem("renderSystem", (deltaTime) => {
    const ctx = world.getResource("ctx")
    if (!ctx) return
    const entities = world.query("position", "sprite")

    for (const entityId of entities) {
        const position = world.getComponent(entityId, "position")
        const sprite = world.getComponent(entityId, "sprite")

        if (position && sprite) {
            // ctx.drawImage(sprite.image, position.x, position.y) 
            ctx.fillStyle = sprite.color || "black"
            ctx.fillRect(position.x, position.y, sprite.width || 0, sprite.height || 0)
        }
    }
})