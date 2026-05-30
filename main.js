console.log("Jogo iniciou!")
import './components/index.js';
import './systems/index.js';
import { world } from "./game.js";

// === tilesets ====
const tilesetImg = new Image();
tilesetImg.src = 'resources\\ForestAventure.png';
tilesetImg.onload = () => {
    world.setResource('ForestAdventure', tilesetImg);
    requestAnimationFrame(gameLoop); // só inicia depois de carregar
};

const tilesetImg2 = new Image();
tilesetImg2.src = 'resources\\DarkDungeon.png';
tilesetImg2.onload = () => {
    world.setResource('DarkDungeon', tilesetImg2);
    requestAnimationFrame(gameLoop); // só inicia depois de carregar
};

// === canvas ===
const canvas = document.getElementById("canva")
const ctx = canvas.getContext("2d")

world.setResource('ctx', ctx);
world.setResource('canvas', canvas);

canvas.width = 800
canvas.height = 640


// === input ====
const keys = {}

window.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true
})

window.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false
})

world.setResource('keys', keys) 

// === gameloop ===
let lastTime = performance.now()

function gameLoop(currentTime) {

    const deltaTime =
        (currentTime - lastTime) / 1000

    lastTime = currentTime

    world.update(deltaTime)

    requestAnimationFrame(gameLoop)
}

requestAnimationFrame(gameLoop)