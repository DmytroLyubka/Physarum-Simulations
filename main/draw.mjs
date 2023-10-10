import * as algorithm from './algorithm.mjs'

// Canvas dimensions
const canvasWidth = 500
const canvasHeight = 500

algorithm.changeDimensions(canvasWidth, canvasHeight)
const particleSize = 1 // visual size of each agent's particle


// Debugging settings
const showSensors = false
const showFps = false

/**
 * Display FPS.
 */
const displayFps = () => {
    if (showFps) {
        fill(0, 0, 0, 255)
        rect(0, canvasHeight, canvasWidth, canvasHeight + 20)

        fill(255, 255, 255, 255)
        text(`FPS: ${round(frameRate())}`, 10, canvasHeight + 15)
    }
}

function setup() {
    createCanvas(canvasWidth, showFps ? canvasHeight + 20 : canvasHeight)
    background(0)

    algorithm.init()
}

/**
 * Performs algorithm step and draws agents.
 */
const update = () => {
    algorithm.simulationStep()

    for (const agent of algorithm.agents) {
        // Draw agents
        fill(255, 255, 255, 128)
        rect(agent.x, agent.y, particleSize)

        // Draw sensors (for debugging)
        if (showSensors) {
            fill(255, 0, 0, 255)
            rect(agent.sensors.front.x, agent.sensors.front.y, particleSize)
            rect(agent.sensors.left.x, agent.sensors.left.y, particleSize)
            rect(agent.sensors.right.x, agent.sensors.right.y, particleSize)
        }
    }
}

/**
 * Refreshes canvas background and updates the algorithm state.
 */
function draw() {
    noStroke()

    // Refresh background with lowered opacity to create particle tails.
    fill(0, 0, 0, 24)
    rect(0, 0, canvasWidth, canvasHeight)

    displayFps()

    update()
}

// Expose methods to browser (not done automatically for ES6 modules)
window.setup = setup
window.draw = draw