// monsterSystem.js

import { world } from "../game.js"
import { kthselection } from "../utils/kthselection.js";

const MONSTER_TYPES = [
    { type: "slime",    difficulty: 1 },
    { type: "goblin",   difficulty: 2 },
    { type: "demon",    difficulty: 3 },
];

const lastRoom = []

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

world.registerSystem("monsterSystem", (deltaTime) => {
    // verifica se já existe um player
    const players = world.query("player");
    if (players.length === 0) return;

    const playerData = world.getComponent(players[0], "player");

    // precisa existir mapa
    const maps = world.query("map");
    if (maps.length === 0) return;

    const mapEntity = maps[0];
    const mapData = world.getComponent(mapEntity, "map");
    if (!mapData) return;

    //fazer o tipo da entidade andar
    const monsters = world.query("monster")
    for(let monster of monsters){
        const playerPosition = world.getComponent(players[0], "position")
        const monsterType = world.getComponent(monster, "monster")
        const monsterPosition = world.getComponent(monster, "position")
        const monsterVelocity = world.getComponent(monster, "velocity");

        if (monsterType.type == "slime") {
            
            const acceleration = 0.0025;
            const friction = 0.90;
            const jumpDistance = 32;

            if (monsterType.state === "paused") {

                monsterType.timer--;

                if (monsterType.timer <= 0) {

                    const dx = playerPosition.x - monsterPosition.x;
                    const dy = playerPosition.y - monsterPosition.y;
                    const dist = Math.hypot(dx, dy);

                    if (dist > 0) {
                        monsterType.dirX = dx / dist;
                        monsterType.dirY = dy / dist;
                    }

                    monsterType.traveled = 0;
                    monsterType.state = "jumping";
                }
            }

            else if (monsterType.state === "jumping") {

                monsterVelocity.x += monsterType.dirX * acceleration;
                monsterVelocity.y += monsterType.dirY * acceleration;

                monsterType.traveled += Math.hypot(
                    monsterVelocity.x,
                    monsterVelocity.y
                );

                if (monsterType.traveled >= jumpDistance) {
                    monsterType.state = "stopping";
                }
            }

            else if (monsterType.state === "stopping") {

                monsterVelocity.x *= friction;
                monsterVelocity.y *= friction;

                const speed = Math.hypot(
                    monsterVelocity.x,
                    monsterVelocity.y
                );

                if (speed < 0.1) {
                    monsterVelocity.x = 0;
                    monsterVelocity.y = 0;

                    monsterType.state = "paused";
                    monsterType.timer = 45; // pausa antes do próximo salto
                }
            }
        } else {
            let accelerate = 0.025
            if(monsterType.type == "goblin"){
                accelerate = 0.020
            } else if (monsterType.type == "demon"){
                accelerate = 0.030
            }

            const dx = playerPosition.x - monsterPosition.x;
            const dy = playerPosition.y - monsterPosition.y;

            const dist = Math.hypot(dx, dy);

            if (dist > 0) {
                const dirX = dx / dist;
                const dirY = dy / dist;

                const acceleration = accelerate;
                const maxSpeed = 2;

                // acelera em direção ao jogador
                monsterVelocity.x += dirX * acceleration;
                monsterVelocity.y += dirY * acceleration;

                // limita velocidade máxima
                const speed = Math.hypot(
                    monsterVelocity.x,
                    monsterVelocity.y
                );

                if (speed > maxSpeed) {
                    monsterVelocity.x =
                        (monsterVelocity.x / speed) * maxSpeed;
                    monsterVelocity.y =
                        (monsterVelocity.y / speed) * maxSpeed;
                }
            }

            // atrito (desaceleração gradual)
            monsterVelocity.x *= 0.95;
            monsterVelocity.y *= 0.95;

        }
    }

     //verifica se precisa criar monstro através de sala nova
     
    if(!lastRoom.includes(mapData.currentRoom)){
        lastRoom.push(mapData.currentRoom)
        if(Math.random() < 0.5) return

        //criar entidades monstro //três tipos dependendo da sorte
        //escolhe o tipo e a quantidade de monstros
        const luckLevel = playerData?.luck ?? 0;
        const luckMax = playerData?.luckMax ?? 100;
        const choosenType = generateMonsterType(luckLevel, luckMax)

        console.log("monstro escolhido", choosenType)

        let monsterColor = "black";

        if(choosenType == "slime"){
            monsterColor = "green"
        } else if (choosenType == "goblin") {
            monsterColor = "#808000"
        } else if (choosenType == "demon"){
            monsterColor = "red"
        }

        const monsterId = world.createEntity()

        world.addComponent(monsterId, "monster", {
            type: choosenType,
            state: "paused",
            timer: 60,
            dirX: 0,
            dirY: 0,
            traveled: 0
        })

        world.addComponent(monsterId, "position", {
            x: Math.floor(Math.random() * (778 - 32 + 1)) + 32,
            y: Math.floor(Math.random() * (612 - 32 + 1)) + 32
        })
        
        world.addComponent(monsterId, "sprite", {
            color: monsterColor, 
            width: 32, 
            height: 32
        })

        world.addComponent(monsterId, "velocity", {
            x: 0,
            y: 0
        })

        world.addComponent(monsterId, "collider", {
            width: 28,
            height: 28,
            offsetX: 2,
            offsetY: 2,
        })

        world.addComponent(monsterId, "location", {
            type: "nullString",
            roomId: mapData.currentRoom
        })

        console.log("Um monstro foi criado!")
    }
})