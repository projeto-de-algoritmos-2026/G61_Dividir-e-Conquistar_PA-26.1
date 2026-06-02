// mapSystem.js

import { world } from "../game.js"

// === Configurações das salas ===

const ROOM_TYPES = [
    { type: "grass",     difficulty: 1 },
    { type: "lava",      difficulty: 2 },
    { type: "nightmare", difficulty: 3 },
];

const MONSTER_TYPES = [
    { type: "slime",    difficulty: 1 },
    { type: "goblin",   difficulty: 2 },
    { type: "demon",    difficulty: 3 },
];

const ITEM_TYPES = [
    { type: "sword",   ease: 3 }, // ordem crescente de facilidade
    { type: "potion",  ease: 2 },
    { type: "scroll",  ease: 1 },
];

const MIN_DOORS = 1;
const MAX_DOORS = 4;
const DIRECTIONS = ["north", "south", "east", "west"];

function generateRoom(luckLevel){
    // const { roomType, doorDirections, monsterType, itemType } = generateRoom(luckLevel);
    return ROOM_TYPES[0][0], DIRECTIONS[0], null, null
}

// ─── Grade de colisão ────────────────────────────────────────────────
const CTILE = 32   // tamanho de cada célula de colisão (px)
const CCOLS = 25   // ceil(800 / 32)
const CROWS = 20   // ceil(640 / 32)
const CWALL = 2    // espessura da parede em tiles (2×32 = 64px = 1 tile visual)

// Alinhado com getDoorRect do roomSystem (DOOR_SIZE=60, canvas 800×640):
// Portas N/S: x = 370–430  →  cols 11–13
// Portas L/O: y = 290–350  →  rows  9–10
const DOOR_COL_MIN = Math.floor(370 / CTILE)  // 11
const DOOR_COL_MAX = Math.floor(429 / CTILE)  // 13
const DOOR_ROW_MIN = Math.floor(290 / CTILE)  //  9
const DOOR_ROW_MAX = Math.floor(349 / CTILE)  // 10

function buildTileGrid(roomComp) {
    const grid = Array.from({ length: CROWS }, () => new Array(CCOLS).fill(0))

    // Preenche bordas com parede sólida
    for (let c = 0; c < CCOLS; c++) {
        for (let t = 0; t < CWALL; t++) {
            grid[t][c]              = 1   // parede norte
            grid[CROWS - 1 - t][c] = 1   // parede sul
        }
    }
    for (let r = 0; r < CROWS; r++) {
        for (let t = 0; t < CWALL; t++) {
            grid[r][t]              = 1   // parede oeste
            grid[r][CCOLS - 1 - t] = 1   // parede leste
        }
    }

    // Abre passagem (tile=0) onde a sala tem porta
    // O roomSystem detecta a transição — o tile grid só deixa o player passar
    if (roomComp?.north != null) {
        for (let c = DOOR_COL_MIN; c <= DOOR_COL_MAX; c++)
            for (let t = 0; t < CWALL; t++) grid[t][c] = 0
    }
    if (roomComp?.south != null) {
        for (let c = DOOR_COL_MIN; c <= DOOR_COL_MAX; c++)
            for (let t = 0; t < CWALL; t++) grid[CROWS - 1 - t][c] = 0
    }
    if (roomComp?.west != null) {
        for (let r = DOOR_ROW_MIN; r <= DOOR_ROW_MAX; r++)
            for (let t = 0; t < CWALL; t++) grid[r][t] = 0
    }
    if (roomComp?.east != null) {
        for (let r = DOOR_ROW_MIN; r <= DOOR_ROW_MAX; r++)
            for (let t = 0; t < CWALL; t++) grid[r][CCOLS - 1 - t] = 0
    }

    return grid
}

world.registerSystem("mapSystem", (deltaTime) => {
    //se o jogo não tiver começado, os queries não vai funcionar
    
    //veja se já existe local
    const locations = world.query("location")
    if (!locations) return; 
    
    //veja se precisa criar uma nova sala (query de situação da sala)
    // const roomExists = locations.length > 0; // nova forma de ver se precisa criar sala
    // if (roomExists) return;
    
    //pega a entidade player e verifica o nível de sorte
    const players = world.query("player");
    if (players.length === 0) return;

    const playerId  = players[0];
    const playerData = world.getComponent(playerId, "player");
    const luckLevel  = playerData?.luck ?? 0;

    const ctx = world.getResource("ctx")
    //Cria uma sala aleatório que tenha uma porta de acordo com o nível de sorte
        //entidades do tipo floor ou do tipo wall
        // decida quantas portas vai ter (e coloque)
            //se tiver com sorte, mirar no terceiro quartil de quantidade de portas no kthselection
        // decida em qual direção tá a porta (e coloque)
            //só aleatório
        // decida qual tipo de sala vai ser (e coloque)
            //sala de grama, de lava e de pesadelo
            //se tiver com sorte, mirar no primeiro quartil de tipos de sala em ordem crescente de dificuldade pelo no kthselection
        // decida quantos monstros tem que ter (e coloque)
            //se tiver com sorte, mirar no primeiro quartil de tipos de monstro em ordem crescente de dificuldade pelo no kthselection
        // decida se vai ter itens (e coloque)
            // se tiver com sorte, mirar no primeiro quartil de tipos de itens em ordem crescente de facilidade pelo no kthselection

    // Gera os dados da nova sala com base na sorte
    // const { roomType, doorDirections, monsterType, itemType } = generateRoom(luckLevel);

    const TILE_SIZE = 32;
    const ROOM_COLS = 600;
    const ROOM_ROWS = 800;
    
    // configuração de parede superior
    // let srcX = 16 * 3
    // let srcY = 16 * 12
    // let tileW = 16
    // let tileH = 16
    
    //configuração de parede lateral
    // let srcX = 16 * 4
    // let srcY = 16 * 10
    // let tileW = 16
    // let tileH = 16
    
    ctx.imageSmoothingEnabled = false;

    // precisa existir mapa
    const maps = world.query("map");
    if (maps.length === 0) return;

    const mapEntity = maps[0];

    let grama = 0

    const mapData = world.getComponent(mapEntity, "map")

    // Reconstrói o tileGrid toda vez que a sala muda
    const lastRoom = world.getResource("lastTileGridRoom")
    if (mapData.currentRoom !== -1 && mapData.currentRoom !== lastRoom) {
        const roomComp = world.getComponent(mapData.currentRoom, "room")
        world.setResource("tileGrid",          buildTileGrid(roomComp))
        world.setResource("collisionTileSize", CTILE)
        world.setResource("lastTileGridRoom",  mapData.currentRoom)
        console.log("[mapSystem] tileGrid gerado para sala", mapData.currentRoom)
    }

    
    if(mapData.currentRoom === -1)
    return;

    const roomLocation = world.getComponent(mapData.currentRoom, "location")

    if(!roomLocation)
    return;

    if(roomLocation.type == "nullString") return
    if(roomLocation.type == "grass") grama = 1

    // console.log("current room:", mapData.currentRoom)

    if(grama){
        const tilesetImage = world.getResource("ForestAdventure")

        // configuração de grama
        let srcX = 16 * 3
        let srcY = 0
        let tileW = 16
        let tileH = 16
        
        // desenha chão
        for (let row = 0; row < ROOM_ROWS; row = row + TILE_SIZE) {
            for (let col = 0; col < ROOM_COLS; col = col + TILE_SIZE) {

                let destX = row
                let destY = col

                ctx.drawImage(
                tilesetImage, // a imagem fonte
                srcX, srcY,   // posição do tile no tileset (em pixels)
                tileW, tileH, // tamanho do tile no tileset
                destX, destY, // onde desenhar no canvas
                64, 64  // tamanho final na tela
                )
            }
        }
    
        // configuração de flor
        srcX = 16 *6
        srcY = 16 * 12
        
        // desenha flores
        for (let row = 0; row < ROOM_ROWS; row = row + 128) {
            for (let col = 0; col < ROOM_COLS; col = col + 128) {

                let destX = row
                let destY = col

                ctx.drawImage(
                tilesetImage, // a imagem fonte
                srcX, srcY,   // posição do tile no tileset (em pixels)
                tileW, tileH, // tamanho do tile no tileset
                destX, destY, // onde desenhar no canvas
                64, 64  // tamanho final na tela
                )
            }
        }
    } else {
        const tilesetImage = world.getResource("DarkDungeon")

        // // configuração de dungeon
        let srcX = 16 * 3
        let srcY = 16 * 8
        let tileW = 16
        let tileH = 16
        
        // desenha chão
        for (let row = 0; row < ROOM_ROWS; row = row + 64) {
            for (let col = 0; col < ROOM_COLS; col = col + 64) {

                let destX = row
                let destY = col

                ctx.drawImage(
                tilesetImage, // a imagem fonte
                srcX, srcY,   // posição do tile no tileset (em pixels)
                tileW, tileH, // tamanho do tile no tileset
                destX, destY, // onde desenhar no canvas
                64, 64  // tamanho final na tela
                )
            }
        }

        // configuração de rachadura
        srcX = 16 * 1
        srcY = 16 * 8
        
        // desenha rachadura
        for (let row = 0; row < ROOM_ROWS; row = row + 256) {
            for (let col = 0; col < ROOM_COLS; col = col + 256) {

                let destX = row
                let destY = col

                ctx.drawImage(
                tilesetImage, // a imagem fonte
                srcX, srcY,   // posição do tile no tileset (em pixels)
                tileW, tileH, // tamanho do tile no tileset
                destX, destY, // onde desenhar no canvas
                64, 64  // tamanho final na tela
                )
            }
        }
    }

})