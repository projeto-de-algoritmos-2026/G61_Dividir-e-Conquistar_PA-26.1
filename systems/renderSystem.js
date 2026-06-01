// renderSystem.js

import { world } from "../game.js"

world.registerSystem("renderSystem", (deltaTime) => {
    const ctx = world.getResource("ctx")
    const canvas = world.getResource("canvas")
    if (!ctx) return
    const entities = world.query("position", "sprite")
    const maps = world.query("map");
    if (maps.length === 0) return;

    const mapEntity = maps[0];
    const mapData = world.getComponent(mapEntity, "map")
    const currentRoom = mapData.currentRoom

    // ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const entityId of entities) {
        const position = world.getComponent(entityId, "position")
        const sprite = world.getComponent(entityId, "sprite")
        const location = world.getComponent(entityId, "location")

        if(location.roomId != currentRoom ) continue;


        if (position && sprite) {
            // ctx.drawImage(sprite.image, position.x, position.y) 
            ctx.fillStyle = sprite.color || "black"
            ctx.fillRect(position.x, position.y, sprite.width || 0, sprite.height || 0)
        }
    }
})