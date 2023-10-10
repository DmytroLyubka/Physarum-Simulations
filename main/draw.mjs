import * as algorithm from './algorithm.mjs'

// Canvas dimensions
const canvasWidth = 300
const canvasHeight = 300
const agentCollision = false
const trailMapDecay = 0.1

// Update variables in algorithm
algorithm.changeDimensions(canvasWidth, canvasHeight)
algorithm.changeAgentAcount(canvasWidth * canvasHeight * 0.15)
algorithm.setAgentCollision(agentCollision)
algorithm.setTrailMapDecay(trailMapDecay)

const particleSize = 1 // visual size of each agent's particle

const visualizationType = 'agent' // 'agent' or 'trailMap'
const trailMapVisualizationSampleRate = 100 // sample trail map for visualization every X frames

// Debugging settings
const showSensors = false
const showFps = true

/**
 * Display FPS.
 */
const displayFps = () => {
    if (showFps) {
        const samples = visualizationType == 'agent' ? frameCount : floor(frameCount  /trailMapVisualizationSampleRate) + 1 
        fill(0, 0, 0, 255)
        rect(0, canvasHeight, canvasWidth, canvasHeight + 40)

        fill(255, 255, 255, 255)
        text(`FPS: ${round(frameRate())}\t\tSamples: ${samples}`, 10, canvasHeight + 15)
        text(`Algorithm steps: ${frameCount}`, 10, canvasHeight + 30)
    }
}

/**
 * Initial canvas setup.
 */
function setup() {
    createCanvas(canvasWidth, showFps ? canvasHeight + 40 : canvasHeight)
    background(0)

    algorithm.init()
}

/**
 * Draws agents on canvas.
 */
const drawAgents = () => {
    // Refresh background with lowered opacity to create particle tails.
    fill(0, 0, 0, 24)
    rect(0, 0, canvasWidth, canvasHeight)

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
 * Draws trail map on canvas.
 */
const drawTrailMap = () => {
    // Refresh background
    fill(0, 0, 0, 255)
    rect(0, 0, canvasWidth, canvasHeight)

    let maxConcentration = 0
    for (const row of algorithm.trailMap) {
        maxConcentration = max(maxConcentration, max(row))
    }

    for (let i = 0; i < algorithm.trailMap.length; i++) {
        for (let j = 0; j < algorithm.trailMap[i].length; j++) {
            // Set visual trail particle strength to be relative to the maximum concentration
            const opacity = algorithm.trailMap[i][j] / maxConcentration * 255
            fill(255, 255, 255, opacity)
            rect(i, j, 1)
        }
    }
}

/**
 * Performs algorithm step and draws agents.
 */
const update = () => {
    algorithm.simulationStep()

    if (visualizationType == 'agent') {
        drawAgents()
    }
    else if (visualizationType == 'trailMap' && frameCount % trailMapVisualizationSampleRate == 1) {
        drawTrailMap()
    }
}

/**
 * Refreshes canvas background and updates the algorithm state.
 */
function draw() {
    noStroke()

    displayFps()

    update()
}

// Expose methods to browser (not done automatically for ES6 modules)
window.setup = setup
window.draw = draw