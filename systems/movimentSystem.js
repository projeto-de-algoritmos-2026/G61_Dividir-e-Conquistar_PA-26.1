// movimentSystem.js

// movimentSystem.js
import { world } from "../game.js"

world.registerSystem("movimentSystem", (deltaTime) => {
    const keys = world.getResource("keys")
    if (!keys) return

    // === 1. Movimento do player (input direto, sem inércia) ===
    const players = world.query("player", "position")

    for (const entityId of players) {
        const player   = world.getComponent(entityId, "player")
        const position = world.getComponent(entityId, "position")
        if (!player || !position) continue
        if (player.knockbackTimer > 0) continue

        let dx = 0
        let dy = 0

        if (keys["arrowup"]    || keys["w"]) dy -= 1
        if (keys["arrowdown"]  || keys["s"]) dy += 1
        if (keys["arrowleft"]  || keys["a"]) dx -= 1
        if (keys["arrowright"] || keys["d"]) dx += 1

        // Normaliza diagonal (evita velocidade maior em 45°)
        if (dx !== 0 && dy !== 0) {
            const inv = 1 / Math.SQRT2  // ≈ 0.707
            dx *= inv
            dy *= inv
        }

        const speed = player.speed ?? 150
        position.x += dx * speed * deltaTime
        position.y += dy * speed * deltaTime
    }

    // === 2. Movimento genérico por velocidade (monstros e qualquer entidade futura) ===
    const moving = world.query("position", "velocity")

    for (const entityId of moving) {
        // Player não entra aqui — já foi tratado acima
        if (world.getComponent(entityId, "player")) continue

        const position = world.getComponent(entityId, "position")
        const velocity = world.getComponent(entityId, "velocity")
        if (!position || !velocity) continue

        position.x += velocity.x
        position.y += velocity.y
    }
})