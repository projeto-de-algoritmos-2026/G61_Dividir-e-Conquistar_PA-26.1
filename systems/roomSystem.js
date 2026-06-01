// roomSystem.js

import { world } from "../game.js";
import { kthselection } from "../utils/kthselection.js";

const roomTypes = [
    { difficulty: 10, type: "grass" },
    { difficulty: 50, type: "lava" },
    { difficulty: 100, type: "boss" }
];

// Dimensões das portas (retângulos nas bordas)
const DOOR_SIZE = 60;
const DOOR_THICKNESS = 16;

function getDoorRect(direction, canvasWidth, canvasHeight) {
    const half = DOOR_SIZE / 2;
    switch (direction) {
        case "north": return { x: canvasWidth / 2 - half, y: 0,                          w: DOOR_SIZE, h: DOOR_THICKNESS };
        case "south": return { x: canvasWidth / 2 - half, y: canvasHeight - DOOR_THICKNESS, w: DOOR_SIZE, h: DOOR_THICKNESS };
        case "west":  return { x: 0,                      y: canvasHeight / 2 - half,    w: DOOR_THICKNESS, h: DOOR_SIZE };
        case "east":  return { x: canvasWidth - DOOR_THICKNESS, y: canvasHeight / 2 - half, w: DOOR_THICKNESS, h: DOOR_SIZE };
    }
}

function createRoom(world, playerId) {
    const newRoom = world.createEntity();

    const playerData = world.getComponent(playerId, "player");
    const luckLevel = playerData?.luck ?? 0;
    const luckMax = playerData?.luckMax ?? 100;

    world.addComponent(newRoom, "room", {
        north: null,
        south: null,
        east: null,
        west: null
    });

    world.addComponent(newRoom, "location", {
        type: generateRoomType(luckLevel, luckMax)
    });

    const roomComponent = world.getComponent(newRoom, "room");
    rollDoors(roomComponent);

    return newRoom;
}

// Direção oposta — para ligar a porta de volta na sala nova
const opposite = {
    north: "south",
    south: "north",
    east:  "west",
    west:  "east"
};

function generateRoomType(luckLevel, luckMax) {
    const luckRatio = luckLevel / luckMax;

    const k = Math.floor(
        (1 - luckRatio) * (roomTypes.length - 1)
    );

    const difficulties = roomTypes.map(
        room => room.difficulty
    );

    const selectedDifficulty = kthselection(
        difficulties,
        k
    );

    const roomType = roomTypes.find(
        room => room.difficulty === selectedDifficulty
    );

    return roomType.type;
}

function rollDoors(roomComponent) {
    const directions = [
        "north",
        "south",
        "east",
        "west"
    ];

    let doorCount = 0;

    for (const direction of directions) {
        if (Math.random() < 0.5) {
            roomComponent[direction] = -1;
            doorCount++;
        }
    }

    // garante pelo menos uma porta
    if (doorCount === 0) {
        const randomDirection =
            directions[
                Math.floor(
                    Math.random() * directions.length
                )
            ];

        roomComponent[randomDirection] = -1;
    }
}

world.registerSystem("roomSystem", (deltaTime) => {
    // precisa existir player
    const players = world.query("player");
    if (players.length === 0) return;

    // precisa existir mapa
    const maps = world.query("map");
    if (maps.length === 0) return;

    const playerId = players[0];
     const playerLocation = world.getComponent(playerId, "location")

    const mapEntity = maps[0];
    const mapData = world.getComponent(mapEntity, "map"); // ← linha faltando
    if (!mapData) return;

    // ainda não existe sala atual
    if (mapData.currentRoom === -1) {
        const newRoom =
            world.createEntity();

        const playerData =
        world.getComponent(
            playerId,
            "player"
        );

        const luckLevel = playerData?.luck ?? 0;

        const luckMax = playerData?.luckMax ?? 100;

        world.addComponent(
            newRoom,
            "room",
            {
                north: null,
                south: null,
                east: null,
                west: null
            }
        );

        world.addComponent(
            newRoom,
            "location",
            {
                type:  generateRoomType(luckLevel,luckMax)
            }
        );

        const roomComponent = world.getComponent(newRoom, "room")

        rollDoors(
            roomComponent
        );

        mapData.map.set(newRoom, true);

        mapData.currentRoom =newRoom;
        playerLocation.roomId =newRoom;
    }

    
    // desenhar portas
    const currentRoomId = mapData.currentRoom;
    const roomComponent = world.getComponent(currentRoomId, "room");
    const location = world.getComponent(currentRoomId, "location");

    const ctx = world.getResource("ctx");
    const canvas = world.getResource("canvas");
    const playerPos = world.getComponent(playerId, "position");

    if (!ctx || !canvas || !playerPos) return;

    const directions = ["north", "south", "east", "west"];
    for (const direction of directions) {
        if (roomComponent[direction] === null) continue; // porta inexistente

        const rect = getDoorRect(direction, canvas.width, canvas.height);
        ctx.fillStyle = "#8B4513";
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }

    // TODO:
    // detectar colisão com portas
for (const direction of directions) {
        if (roomComponent[direction] === null) continue;

        const rect = getDoorRect(direction, canvas.width, canvas.height);

        const playerInDoor =
            playerPos.x < rect.x + rect.w &&
            playerPos.x > rect.x - 16   && // margem de tolerância
            playerPos.y < rect.y + rect.h &&
            playerPos.y > rect.y - 16;

        if (!playerInDoor) continue;

        // Cria sala nova se a porta ainda não foi ligada
        if (roomComponent[direction] === -1) {
            const newRoom = createRoom(world, playerId);

            // Liga as duas salas entre si
            roomComponent[direction] = newRoom;
            const newRoomComponent = world.getComponent(newRoom, "room");
            newRoomComponent[opposite[direction]] = currentRoomId;

            mapData.map.set(newRoom, true);
            playerLocation.roomId = newRoom
        }

        // Reposiciona o jogador no lado oposto da porta nova
        mapData.currentRoom = roomComponent[direction];
        playerLocation.roomId = mapData.currentRoom;
        

        const arrivedFrom = opposite[direction];
        const arrivalRect = getDoorRect(arrivedFrom, canvas.width, canvas.height);

        // Coloca o jogador logo à frente da porta de chegada
        if (arrivedFrom === "north") { playerPos.x = arrivalRect.x + DOOR_SIZE / 2; playerPos.y = arrivalRect.y + DOOR_THICKNESS + 20; }
        if (arrivedFrom === "south") { playerPos.x = arrivalRect.x + DOOR_SIZE / 2; playerPos.y = arrivalRect.y - 20; }
        if (arrivedFrom === "west")  { playerPos.x = arrivalRect.x + DOOR_THICKNESS + 20; playerPos.y = arrivalRect.y + DOOR_SIZE / 2; }
        if (arrivedFrom === "east")  { playerPos.x = arrivalRect.x - 20;             playerPos.y = arrivalRect.y + DOOR_SIZE / 2; }

        break; // só processa uma porta por frame
    }
});