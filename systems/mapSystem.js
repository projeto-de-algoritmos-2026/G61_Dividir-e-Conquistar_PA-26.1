// mapSystem.js

import { world } from "./game.js"

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

world.registerSystem("mapSystem", (deltaTime) => {
    //se o jogo não tiver começado, os queries não vai funcionar

    //veja se já existe local
    const locations = world.query("Location")
    if (!locations) return; 

    //veja se precisa criar uma nova sala (query de situação da sala)
    const roomExists = locations.length > 0;
    if (roomExists) return;

    //pega a entidade player e verifica o nível de sorte
    const players = world.query("Player");
    if (players.length === 0) return;

    const playerId  = players[0];
    const playerData = world.getComponent(playerId, "Player"); //TODO: conferir se é assim que pega dados dos componentes das entidades
    const luckLevel  = playerData?.luck ?? 0;

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
    const { roomType, doorDirections, monsterType, itemType } = generateRoom(luckLevel);

    const TILE_SIZE = 64;
    const ROOM_COLS = 10;
    const ROOM_ROWS = 8;

    for (let row = 0; row < ROOM_ROWS; row++) {
        for (let col = 0; col < ROOM_COLS; col++) {
        }
    }

    console.log("Sala criada!")
})