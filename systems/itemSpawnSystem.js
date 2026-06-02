// itemSpawnSystem.js

import { world } from "../game.js";
import { kthselection } from "../utils/kthselection.js";

const RENDERABLE = [
    "rusty sword",
    "weapon duel sword",
    "weapon lavish sword"
]

const ITEM_TYPES = [
    {name: "rusty sword", ease: 1},
    {name: "weapon duel sword", ease: 15},
    {name: "weapon lavish sword", ease: 30}
]

function generateItemType(luckLevel, luckMax) {
    const luckRatio =
        luckMax > 0
            ? luckLevel / luckMax
            : 0;

    const k = Math.floor(
        luckRatio * ITEM_TYPES.length
    );

    const clampedK = Math.min(
        k,
        ITEM_TYPES.length - 1
    );

    const eases = ITEM_TYPES.map(
        item => item.ease
    );

    const selectedEase =
        kthselection(
            eases,
            clampedK
        );

    const item = ITEM_TYPES.find(
        item =>
            item.ease === selectedEase
    );

    return item.name;
}

function generateMonsterType(luckLevel, luckMax) {
    const luckRatio =
        luckMax > 0
            ? luckLevel / luckMax
            : 0;

    const k = Math.floor(
        (1 - luckRatio) * MONSTER_TYPES.length
    );

    const clampedK = Math.min(
        k,
        MONSTER_TYPES.length - 1
    );

    const difficulties = MONSTER_TYPES.map(
        monster => monster.difficulty
    );

    const selectedDifficulty = kthselection(
        difficulties,
        clampedK
    );

    const monsterType = MONSTER_TYPES.find(
        monster =>
            monster.difficulty === selectedDifficulty
    );

    return monsterType.type;
}

let lastRoom = []

world.registerSystem("itemSpawnSystem", (deltaTime) => {
    //verifica se já existe mapa
    const locations = world.query("player", "location")
    if (locations.length === 0) return;

    const players = world.query("player");
    if (players.length === 0) return;
    const playerData = world.getComponent(players[0], "player");

    // precisa existir mapa
    const maps = world.query("map");
    if (maps.length === 0) return;

    const mapEntity = maps[0];
    const mapData = world.getComponent(mapEntity, "map");
    if (!mapData) return;

    //decide se vai ter
    const items = world.query("item", "position")

    if(!lastRoom.includes(mapData.currentRoom)){ //decidir com base em nova sala
        lastRoom.push(mapData.currentRoom)
        // if(Math.random() < 0.5) return

        const luckLevel = playerData?.luck ?? 0;
        const luckMax = playerData?.luckMax ?? 100;
        const itemType = generateItemType(luckLevel, luckMax)
        console.log(itemType)

        const newItemId = world.createEntity() //três tipos diferentes dependente de sorte

        world.addComponent(newItemId, "item", {
            itemName: itemType,
            stackable: false,
            equippable: true,
            consumable: false,
            onMap: true
        })

        world.addComponent(newItemId, "position", {
            x: Math.floor(Math.random() * (778 - 32 + 1)) + 32,
            y: Math.floor(Math.random() * (612 - 32 + 1)) + 32
        })

        world.addComponent(newItemId, "location", {
            roomId: mapData.currentRoom
        })
    }

    const ctx = world.getResource("ctx")
    let renderItems = world.query("item", "position")

    for(const itemId of renderItems){
        const item = world.getComponent(itemId, "item")
        const itemName = item.itemName
        const itemLocation = world.getComponent(itemId, "location")
        const itemPosition = world.getComponent(itemId, "position")

         if(itemLocation.roomId != mapData.currentRoom ) continue;

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