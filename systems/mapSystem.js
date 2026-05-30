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
    const playerData = world.getComponent(playerId, "Player");
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

    const tilesetImage = world.getResource("tileset")
    
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

    let grama = 1

    if(grama){
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
    }

})