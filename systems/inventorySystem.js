// inventorySystem.js

import { world } from "../game.js"

const RENDERABLE = [
    "rusty sword",
    "weapon duel sword",
    "weapon lavish sword"
]


function drawInventoryHUD(ctx, canvas, inventory, activeSlot = 0) {
    const SLOT_SIZE = 44;
    const SLOT_GAP  = 4;
    const PADDING   = 6;
    const slots     = inventory.slots;

    const totalW = slots * (SLOT_SIZE + SLOT_GAP) - SLOT_GAP + PADDING * 2;
    const totalH = SLOT_SIZE + PADDING * 2;

    const x = Math.floor((canvas.width - totalW) / 2);
    const y = canvas.height - totalH - 12;

    ctx.fillStyle = 'rgba(20, 20, 30, 0.82)';
    roundRect(ctx, x, y, totalW, totalH, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(80, 80, 100, 0.6)';
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, totalW, totalH, 6);
    ctx.stroke();

    for (let i = 0; i < slots; i++) {
        const sx = x + PADDING + i * (SLOT_SIZE + SLOT_GAP);
        const sy = y + PADDING;
        const isActive = i === activeSlot;

        ctx.fillStyle = isActive
            ? 'rgba(255, 255, 255, 0.14)'
            : 'rgba(255, 255, 255, 0.05)';
        roundRect(ctx, sx, sy, SLOT_SIZE, SLOT_SIZE, 4);
        ctx.fill();

        ctx.strokeStyle = isActive
            ? 'rgba(255, 255, 255, 0.85)'
            : 'rgba(100, 100, 130, 0.5)';
        ctx.lineWidth = isActive ? 2 : 1;
        roundRect(ctx, sx, sy, SLOT_SIZE, SLOT_SIZE, 4);
        ctx.stroke();

        const item = inventory.items?.[i];
        if (!item) continue;

        if (RENDERABLE.includes(item.itemName)) {
            const tilesetImage = world.getResource(item.itemName);
            if (!tilesetImage) continue;
            ctx.drawImage(tilesetImage, sx + 6, sy + 6, 32, 32);
        }

        if (item?.count > 1) {
            ctx.font = 'bold 11px monospace';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            ctx.fillText(item.count, sx + SLOT_SIZE - 3, sy + SLOT_SIZE - 3);
        }
    }
}

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
    const players = world.query("player");
    if (players.length === 0) return;

    const playersWithInventory = world.query("player", "inventory")
    if (playersWithInventory.length === 0){
        world.addComponent(players[0], "inventory", {
            slots: 3,
            items: [null, null, null],
            activeSlot: 0
        })
    }

    const ctx    = world.getResource("ctx");
    const canvas = world.getResource("canvas");
    const keys   = world.getResource("keys");
    const keysJustPressed = world.getResource('keysJustPressed');

    for (const entityId of playersWithInventory) {
        const inv = world.getComponent(entityId, "inventory");

        for (let k = 0; k < inv.slots; k++) {
            if (keys[String(k + 1)]) inv.activeSlot = k;
        }

        drawInventoryHUD(ctx, canvas, inv, inv.activeSlot);
    }

    const PICKUP_RANGE = 32;

    const playersWithPos = world.query("player", "position", "inventory");
    if (playersWithPos.length === 0) return;

    const playerEntity = players[0];
    const playerPos = world.getComponent(playerEntity, "position");
    const playerLocation = world.getComponent(playerEntity, "location")
    const inv = world.getComponent(playerEntity, "inventory");

    // --- 1. Itens no chão = entidades com "item" E "position" ---
    const itemsOnGround = world.query("item", "position");

    const itemsOnSameRoom = itemsOnGround.filter( itemID => {
        const itemLocation = world.getComponent(itemID, "location")
        return itemLocation && itemLocation.roomId === playerLocation.roomId;
    })

    // --- 2. Acha o item mais próximo dentro do alcance ---
    let nearestItem = null;
    let nearestDist = Infinity;

    for (const itemEntity of itemsOnSameRoom) {
        const itemPos = world.getComponent(itemEntity, "position");
        const dx = playerPos.x - itemPos.x;
        const dy = playerPos.y - itemPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < PICKUP_RANGE && dist < nearestDist) {
            nearestDist = dist;
            nearestItem = itemEntity;
        }
    }

    // --- 3. Pickup: remove position do item e guarda no inventário ---
    if (nearestItem !== null) {
        const itemData = world.getComponent(nearestItem, "item");
        const itemPos = world.getComponent(nearestItem, "position");

        // contorno
        ctx.strokeStyle = "#ffff00";
        ctx.lineWidth = 2;
        ctx.strokeRect(
            itemPos.x - 2,
            itemPos.y - 2,
            32, // item desenhado em 64x64
            32
        );

        // letra E
        ctx.font = "bold 20px monospace";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(
            "E",
            itemPos.x + 32,
            itemPos.y - 8
        );

        if (keys["e"]) {
            const freeSlot = inv.items.findIndex(slot => slot === null);
            if (freeSlot !== -1) {
                inv.items[freeSlot] = { entityId: nearestItem, ...itemData };
                world.removeComponent(nearestItem, "position"); // sai do chão
                world.removeComponent(nearestItem, "location"); // sai do chão
            }
        }
    }

    // --- 4. Drop: devolve position ao item e remove do inventário ---
    if (inv.activeSlot !== -1 && keys["c"]) {
        const slotData = inv.items[inv.activeSlot];

        if (slotData) {
            const facing = world.getComponent(playerEntity, "facing") ?? { dx: 1, dy: 0 };
            const dropX = playerPos.x + facing.dx * 32;
            const dropY = playerPos.y + facing.dy * 32;

            // devolve position à entidade original do item
            world.addComponent(slotData.entityId, "position", { x: dropX, y: dropY });
            world.addComponent(slotData.entityId, "location", { type: "nullString", roomId: playerLocation.roomId}); // sai do chão

            inv.items[inv.activeSlot] = null;
            inv.activeSlot = -1;
        }
    }
})