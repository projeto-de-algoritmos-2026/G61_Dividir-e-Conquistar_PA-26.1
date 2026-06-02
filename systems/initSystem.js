// initSystem.js

import { world } from "../game.js"


// ── Sala inicial ──────────────────────────────────────────────
const initialRoom = world.createEntity()
world.addComponent(initialRoom, "room", {
    id: 0,
    north: null,
    south: 1,   // porta ao sul para a próxima sala
    east:  null,
    west:  null,
})


//criar entidade main menu
const menuEntity = world.createEntity()

world.addComponent(menuEntity, "position", {
    x: 0,
    y: 0,
})

world.addComponent(menuEntity, "menuItem", {
    label: "Iniciar",
    selected: false,
})




world.registerSystem("initSystem", (deltaTime) => {

    const menuItems = world.query("menuItem", "position")
    if(menuItems.length === 0) return

    const ctx    = world.getResource("ctx")
    const canvas = world.getResource("canvas")
    const keys   = world.getResource("keys")
    if (!ctx || !canvas || !keys) return

    const players = world.query("player")
    if(players.length === 0){
        // Limpa o canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    
        // Fundo
        ctx.fillStyle = "#0a0a0a"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    
        // Título
        ctx.fillStyle = "#c8a96e"
        ctx.font = "bold 48px serif"
        ctx.textAlign = "center"
        ctx.fillText("A Maldição do Oráculo", canvas.width / 2, canvas.height / 3)
    
        // Subtítulo
        ctx.fillStyle = "#666"
        ctx.font = "16px serif"
        ctx.fillText(
            "Uma profecia não pode ser desfeita — apenas cumprida.",
            canvas.width / 2,
            canvas.height / 3 + 44
        )
    }

    for (const entityId of menuItems) {
        const item     = world.getComponent(entityId, "menuItem")
        const position = world.getComponent(entityId, "position")
        if (!item || !position) continue
 
        // Seleção: marca o item como selecionado (extensível para múltiplos itens futuramente)
        item.selected = true
 
        // Posição do texto "Iniciar" no canvas
        position.x = canvas.width  / 2
        position.y = canvas.height / 2 + 20
 
        // Pulso de opacidade
        const pulse = Math.abs(Math.sin(performance.now() / 600))
        ctx.fillStyle = `rgba(200, 200, 255, ${0.5 + pulse * 0.5})`
        ctx.font = "bold 28px serif"
        ctx.textAlign = "center"
        ctx.fillText(
            item.selected ? `▶  ${item.label}` : item.label,
            position.x,
            position.y
        )
 
        // Instrução de input
        ctx.fillStyle = "#444"
        ctx.font = "14px monospace"
        ctx.fillText("pressione  Z  para confirmar", canvas.width / 2, canvas.height / 2 + 60)
 
        // ── Verifica input Z para selecionar ──────────────────────────────
        if (item.selected && keys["z"]) {
            keys["z"] = false // consome o input, evita múltiplos disparos
 
            // Destrói a entidade de menu
            world.destroyEntity(menuEntity)
 
            // ── Cria o player ──────────────────────────────────────────────
            const player = world.createEntity()
 
            world.addComponent(player, "player", { //TODO: componentes diferntes
                name:         "Player 1",
                luck:          50,
                speed:         150,
                hp:            100,
                knockbackVx:   0,
                knockbackVy:   0,
                knockbackTimer: 0,
            })
 
            world.addComponent(player, "position", {
                x: canvas.width  / 2 - 16,
                y: canvas.height / 2 - 16,
            })
 
            world.addComponent(player, "sprite", {
                color:  "#4a90e2",
                width:  32,
                height: 32,
            })            
            
            world.addComponent(player, "collider", {
                width:   28,
                height:  28,
                offsetX: 2,   // centraliza hitbox levemente dentro do sprite 32x32
                offsetY: 2,
            })
 
            world.addComponent(player, "location", {
                type: "nullString",
                roomId: -1
            })
            
            console.log("Player criado, id:", player)
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            //cria a entidade mapa
            const mapEntity = world.createEntity()

            world.addComponent(mapEntity, "map", {
                map: new Map(),
                currentRoom: -1
            })
        }
    }
})

console.log("initSystem carregado!")