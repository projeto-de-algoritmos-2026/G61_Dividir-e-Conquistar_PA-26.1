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

    //verifica se precisa criar monstro
    const monsters = world.query("monster")
    if(monsters.length > 0) return;
    console.log("monsters", monsters.length)

    //escolhe o tipo e a quantidade de monstros

    //criar entidades monstro
    const monsterId = world.createEntity()

    world.addComponent(monsterId, "monster", {
        type: "slime",
    })


    world.addComponent(monsterId, "position", {
        x: 400,
        y: 300,
    })
    
    world.addComponent(monsterId, "sprite", {
        color: "green", 
        width: 32, 
        height: 32
    })

    // console.log("Um monstro foi criado!")

    //fazer o tipo da entidade andar
})