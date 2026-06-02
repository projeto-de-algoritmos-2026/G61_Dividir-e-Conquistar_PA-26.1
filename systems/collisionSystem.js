// collisionSystem.js
import { world } from "../game.js"

// ─────────────────────────────────────────────────────────────
// Helpers AABB
// ─────────────────────────────────────────────────────────────

function getAABB(entityId) {
    const pos = world.getComponent(entityId, "position")
    const col = world.getComponent(entityId, "collider")
    if (!pos || !col) return null
    return {
        x: pos.x + (col.offsetX ?? 0),
        y: pos.y + (col.offsetY ?? 0),
        w: col.width,
        h: col.height,
    }
}

function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y
}

// Retorna o menor vetor para empurrar 'a' para fora de 'b'
function getMTV(a, b) {
    const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
    const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)
    if (ox <= 0 || oy <= 0) return null
    return ox < oy
        ? { x: a.x < b.x ? -ox : ox, y: 0 }
        : { x: 0, y: a.y < b.y ? -oy : oy }
}

// ─────────────────────────────────────────────────────────────
// Colisão vs grade de tiles
// ─────────────────────────────────────────────────────────────

function resolveVsTiles(entityId, grid, tileSize) {
    const pos = world.getComponent(entityId, "position")
    const col = world.getComponent(entityId, "collider")
    if (!pos || !col || !grid) return

    const offX = col.offsetX ?? 0
    const offY = col.offsetY ?? 0

    // Tiles que o AABB sobrepõe
    const minC = Math.floor((pos.x + offX) / tileSize)
    const maxC = Math.floor((pos.x + offX + col.width  - 1) / tileSize)
    const minR = Math.floor((pos.y + offY) / tileSize)
    const maxR = Math.floor((pos.y + offY + col.height - 1) / tileSize)

    for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
            if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) continue
            if (grid[r][c] !== 1) continue   // só paredes sólidas (tile=1)

            const tileBox = { x: c * tileSize, y: r * tileSize, w: tileSize, h: tileSize }

            // Re-lê posição após cada push para acumular correções corretamente
            const cur = {
                x: pos.x + offX, y: pos.y + offY,
                w: col.width,    h: col.height,
            }
            const mtv = getMTV(cur, tileBox)
            if (mtv) {
                pos.x += mtv.x
                pos.y += mtv.y
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────
// Sistema
// ─────────────────────────────────────────────────────────────

world.registerSystem("collisionSystem", (deltaTime) => {
    const grid     = world.getResource("tileGrid")
    const tileSize = world.getResource("collisionTileSize") ?? 32

    // Debug: verifica se grid foi inicializado
    if (!grid) {
        return;
    }

    const players  = world.query("player",  "position", "collider")
    const monsters = world.query("monster", "position", "collider")

    // ── 1. Player vs paredes ──────────────────────────────────
    for (const id of players) {
        resolveVsTiles(id, grid, tileSize)
    }

    // ── 2. Monstros vs paredes ────────────────────────────────
    for (const id of monsters) {
        resolveVsTiles(id, grid, tileSize)
    }

    // ── 3. Player vs monstros (knockback + sinal de dano) ─────
    for (const playerId of players) {
        const playerData = world.getComponent(playerId, "player")
        const playerPos  = world.getComponent(playerId, "position")
        if (!playerData || !playerPos) continue

        // Knockback ativo: move, decai, e mantém i-frames
        if (playerData.knockbackTimer > 0) {
            playerData.knockbackTimer -= deltaTime
            playerPos.x += playerData.knockbackVx * deltaTime
            playerPos.y += playerData.knockbackVy * deltaTime
            playerData.knockbackVx *= 0.92   // atrito do knockback
            playerData.knockbackVy *= 0.92
            resolveVsTiles(playerId, grid, tileSize) // não atravessa parede durante knockback
            continue  // i-frames: ignora novas colisões com monstros
        }

        const playerAABB = getAABB(playerId)
        if (!playerAABB) continue

        for (const monsterId of monsters) {
            const monsterAABB = getAABB(monsterId)
            if (!monsterAABB || !overlaps(playerAABB, monsterAABB)) continue

            // Direção: centro do monstro → centro do player
            const dx = (playerAABB.x + playerAABB.w / 2) - (monsterAABB.x + monsterAABB.w / 2)
            const dy = (playerAABB.y + playerAABB.h / 2) - (monsterAABB.y + monsterAABB.h / 2)
            const dist = Math.hypot(dx, dy) || 1

            playerData.knockbackVx    = (dx / dist) * 800
            playerData.knockbackVy    = (dy / dist) * 800
            playerData.knockbackTimer = 0.35   // 350ms de knockback + i-frames

            // TODO: combatSystem lerá este resource para aplicar dano ao HP
            // Padrão: collisionSystem detecta o hit → combatSystem processa o resultado
            world.setResource("playerHit", { monsterId, timestamp: performance.now() })

            // Pequeno recuo no monstro
            const monsterPos = world.getComponent(monsterId, "position")
            if (monsterPos) {
                monsterPos.x -= (dx / dist) * 12
                monsterPos.y -= (dy / dist) * 12
            }
            break  // um knockback por vez
        }
    }

    // ── 4. Monstro vs monstro (separação) ────────────────────
    for (let i = 0; i < monsters.length; i++) {
        for (let j = i + 1; j < monsters.length; j++) {
            const aabbA = getAABB(monsters[i])
            const aabbB = getAABB(monsters[j])
            if (!aabbA || !aabbB || !overlaps(aabbA, aabbB)) continue

            const mtv = getMTV(aabbA, aabbB)
            if (!mtv) continue

            const posA = world.getComponent(monsters[i], "position")
            const posB = world.getComponent(monsters[j], "position")
            posA.x += mtv.x / 2
            posA.y += mtv.y / 2
            posB.x -= mtv.x / 2
            posB.y -= mtv.y / 2
        }
    }
})

console.log("collisionSystem carregado!")