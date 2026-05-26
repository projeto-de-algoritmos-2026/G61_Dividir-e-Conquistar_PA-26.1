console.log("Jogo iniciou!")
import { world } from "./game.js"

// === canvas ===
const canvas = document.getElementById("canva")
const ctx = canvas.getContext("2d")

canvas.width = 800
canvas.height = 600

// === input ====
const keys = {}

window.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true
})

window.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false
})

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