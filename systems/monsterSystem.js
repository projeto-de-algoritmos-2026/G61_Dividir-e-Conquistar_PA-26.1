// monsterSystem.js

import { world } from "../game.js"

const MONSTER_TYPES = [
    { type: "slime",    difficulty: 1 },
    { type: "goblin",   difficulty: 2 },
    { type: "demon",    difficulty: 3 },
];

world.registerSystem("monsterSystem", (deltaTime) => {
    // verifica se já existe um player
    const players = world.query("player");
    if (players.length === 0) return;

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

                monsterPosition.x += monsterVelocity.x;
                monsterPosition.y += monsterVelocity.y;

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

                monsterPosition.x += monsterVelocity.x;
                monsterPosition.y += monsterVelocity.y;

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
            const dx = playerPosition.x - monsterPosition.x;
            const dy = playerPosition.y - monsterPosition.y;

            const dist = Math.hypot(dx, dy);

            if (dist > 0) {
                const dirX = dx / dist;
                const dirY = dy / dist;

                const acceleration = 0.1;
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

            // aplica movimento
            monsterPosition.x += monsterVelocity.x;
            monsterPosition.y += monsterVelocity.y;
        }
    }

    //verifica se precisa criar monstro
    if(monsters.length > 0) return;
    console.log("monsters", monsters.length)

    //escolhe o tipo e a quantidade de monstros

    //criar entidades monstro
    const monsterId = world.createEntity()

    world.addComponent(monsterId, "monster", {
        type: "slime",
        state: "paused",
        timer: 60,
        dirX: 0,
        dirY: 0,
        traveled: 0
    })


    world.addComponent(monsterId, "position", {
        x: 32,
        y: 32,
    })
    
    world.addComponent(monsterId, "sprite", {
        color: "green", 
        width: 32, 
        height: 32
    })

    world.addComponent(monsterId, "velocity", {
        x: 0,
        y: 0
    })

    console.log("Um monstro foi criado!")
})