// inventorySystem.js

import { world } from "../game.js"

const RENDERABLE = [
    "rusty sword"
]

function drawInventoryHUD(ctx, canvas, inventory, activeSlot = 0) {
    const SLOT_SIZE = 44;
    const SLOT_GAP  = 4;
    const PADDING   = 6;
    const slots     = inventory.slots; // vem direto do componente

    const totalW = slots * (SLOT_SIZE + SLOT_GAP) - SLOT_GAP + PADDING * 2;
    const totalH = SLOT_SIZE + PADDING * 2;

    // centraliza horizontalmente, cola no rodapé
    const x = Math.floor((canvas.width - totalW) / 2);
    const y = canvas.height - totalH - 12;

    // fundo do hotbar
    ctx.fillStyle = 'rgba(20, 20, 30, 0.82)';
    roundRect(ctx, x, y, totalW, totalH, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(80, 80, 100, 0.6)';
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, totalW, totalH, 6);
    ctx.stroke();

    // slots individuais
    for (let i = 0; i < slots; i++) {
        const sx = x + PADDING + i * (SLOT_SIZE + SLOT_GAP);
        const sy = y + PADDING;
        const isActive = i === activeSlot;

        // fundo do slot
        ctx.fillStyle = isActive
            ? 'rgba(255, 255, 255, 0.14)'
            : 'rgba(255, 255, 255, 0.05)';
        roundRect(ctx, sx, sy, SLOT_SIZE, SLOT_SIZE, 4);
        ctx.fill();

        // borda (mais grossa/brilhante no slot ativo)
        ctx.strokeStyle = isActive
            ? 'rgba(255, 255, 255, 0.85)'
            : 'rgba(100, 100, 130, 0.5)';
        ctx.lineWidth = isActive ? 2 : 1;
        roundRect(ctx, sx, sy, SLOT_SIZE, SLOT_SIZE, 4);
        ctx.stroke();

        // item no slot (se existir)
        const item = inventory.items?.[i];
        if (!item) continue;

        if (RENDERABLE.includes(item.itemName)) {
            const tilesetImage = world.getResource(item.itemName);
            if (!tilesetImage) continue;

            ctx.drawImage(tilesetImage, sx + 6, sy + 6, 32, 32);
        }

        // contador de stack
        if (item?.count > 1) {
            ctx.font = 'bold 11px monospace';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            ctx.fillText(item.count, sx + SLOT_SIZE - 3, sy + SLOT_SIZE - 3);
        }
    }
}

// helper: cantos arredondados (reutilize no seu projeto)
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y,     x + w, y + r,     r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x,     y + h, x,     y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x,     y,     x + r, y,         r);
    ctx.closePath();
}

world.registerSystem("inventorySystem", (deltaTime) => {
    // verifica se player já existe
    const players = world.query("player");
    if (players.length === 0) return;

    // se player existir, então adiciona inventário e mostra HUD de itens
    const playersWithInventory = world.query("player", "inventory")
    if (playersWithInventory.length === 0){
        world.addComponent(players[0], "inventory", {
            slots: 3,
            items: [null, null, null],  
            activeSlot: 0               
        })
    }

    const ctx    = world.getResource("ctx") //TODO: as vezes compensa colocar o hud em html
    const canvas = world.getResource("canvas");
    const keys =   world.getResource("keys")
    const keysJustPressed = world.getResource('keysJustPressed');

     for (const entityId of playersWithInventory) {
        const inv = world.getComponent(entityId, "inventory");

        // troca de slot com teclas 1-9 (ou quantos slots tiver)
        for (let k = 0; k < inv.slots; k++) {
            if (keys[String(k + 1)]) inv.activeSlot = k;
        }

        drawInventoryHUD(ctx, canvas, inv, inv.activeSlot);
    }

    // sistema de interação com itens (pickup/drop)

    const PICKUP_RANGE = 32; // pixels

    const playersWithPos = world.query("player", "position", "inventory");
    if (playersWithPos.length === 0) return;

    const playerEntity = players[0];
    const playerPos = world.getComponent(playerEntity, "position");
    const inv = world.getComponent(playerEntity, "inventory");

    // --- 1. Busca itens que estão no chão ---
    const allItems = world.query("item", "position");
    const itemsOnGround = allItems.filter(itemEntity => {
        const item = world.getComponent(itemEntity, "item");
        return item.onMap === true;
    });

    // console.log("allitems", allItems)

    // --- 2. Acha o item mais próximo dentro do alcance ---
    let nearestItem = null;
    let nearestDist = Infinity;

    for (const itemEntity of itemsOnGround) {
        const itemPos = world.getComponent(itemEntity, "position"); // ← getComponent recebe UMA entidade
        const dx = playerPos.x - itemPos.x;
        const dy = playerPos.y - itemPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy); // distância euclidiana

        if (dist < PICKUP_RANGE && dist < nearestDist) {
            nearestDist = dist;
            nearestItem = itemEntity;
        }
    }


    // --- 3. Mostrar indicador "E" e fazer pickup ---
    if (nearestItem !== null) {
        // aqui você pode acionar o brilho/sprite do item
        const itemData = world.getComponent(nearestItem, "item");
        // ex: world.addComponent(nearestItem, "highlight", { active: true });

        if (keys["e"]) { // keydown já normaliza pra lowercase no main.js
            // acha slot livre no inventário
            const freeSlot = inv.items.findIndex(slot => slot === null);
            if (freeSlot !== -1) {
                // guarda o item no inventário do player
                inv.items[freeSlot] = { ...itemData };
                // marca item como fora do mapa (mas entidade continua existindo)
                // world.addComponent(nearestItem, "item", {
                //     ...itemData,
                //     onMap: false  // ← dois pontos, não igual
                // });
                world.destroyEntity(nearestItem)
            }
        }
    }

    // console.log("inv.items[1]", inv.items[0])
    // console.log("inv.items[2]", inv.items[1])
    // console.log("inv.items[3]", inv.items[2])

    // --- 4. Drop: joga o item ativo 32px na frente do jogador ---
    if (inv.activeSlot !== -1 && keys["c"]) {
        const droppedItemData = inv.items[inv.activeSlot];

        if (droppedItemData) {
            // calcula posição na frente do jogador
            // assumindo que playerPos tem uma propriedade "facing" com a direção
            const facing = world.getComponent(playerEntity, "facing") ?? { dx: 1, dy: 0 };
            const dropX = playerPos.x + facing.dx * 32;
            const dropY = playerPos.y + facing.dy * 32;

            // cria nova entidade para o item no chão
            // (ou reusa a entidade original se você quiser rastrear)
            const droppedEntity = world.createEntity();
            world.addComponent(droppedEntity, "item", {
                ...droppedItemData,
                onMap: true  // ← agora está no mapa
            });
            world.addComponent(droppedEntity, "position", { x: dropX, y: dropY });

            // remove do inventário
            inv.items[inv.activeSlot] = null;
            inv.activeSlot = -1;
        }
    }
})