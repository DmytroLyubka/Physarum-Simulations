import * as algorithm from './algorithm.mjs'

// Canvas dimensions
const canvasWidth = 500
const canvasHeight = 500
const agentCollision = true
const trailMapDecay = 0.1

// Update variables in algorithm
algorithm.changeDimensions(canvasWidth, canvasHeight)
algorithm.changeAgentAcount(canvasWidth * canvasHeight * 0.1)
algorithm.setAgentCollision(agentCollision)
algorithm.setTrailMapDecay(trailMapDecay)

const particleSize = 1 // visual size of each agent's particle
const agentTails = false
const visualizationType = 'agents' // 'agents' or 'trailMap'
const agentVisualizationSampleRate = 1 // sample trail map for visualization every X frames
const trailMapVisualizationSampleRate = 50 // sample trail map for visualization every Y frames
const useGPU = true

let agentShader, colorShader // fragment shaders
let myFont // need to preload font in WEBGL mode
let bufferImage // used to create texture for embedding object locations, later sent to fragment shader for rendering

// Debugging settings
const showSensorsCPU = false
const showInfo = true

// Canvas objects
let mainCanvas, infoCanvas

/**
 * Instanced methods for working with main simulation visualization canvas.
 */
const mainCanvasSetup = (sketch) => {

    /**
     * Preload shaders if GPU is used for animations.
     */
    sketch.preload = () => {
        if (useGPU) {
            agentShader = sketch.loadShader('./shaders/agentShader.vert', './shaders/agentShader.frag')
        }
    }

    /**
     * Initializes main canvas.
     */
    sketch.setup = () => {
        if (useGPU) { // Enable WEBGL mode if GPU usage is enabled
            sketch.createCanvas(canvasWidth, canvasHeight, sketch.WEBGL)
            bufferImage = sketch.createImage(canvasWidth, canvasHeight)
            mainCanvas.shader(agentShader)
            agentShader.setUniform('sideLength', canvasWidth)
        }
        else {
            sketch.createCanvas(canvasWidth, canvasHeight)
        }
        sketch.background(0)

        algorithm.init()
    }

    /**
     * Refreshes canvas background and updates the algorithm state.
     */
    sketch.draw = () => {
        sketch.noStroke()
        update()
    }

}

/**
 * Instanced methods for working with info display canvas.
 */
const infoCanvasSetup = (sketch) => {

    /**
     * Preload fonts.
     */
    sketch.preload = () => {
        myFont = sketch.loadFont('./assets/Quicksand-Bold.ttf')
    }

    /**
     * Initializes info canvas.
     */
    sketch.setup = () => {
        const canvas = sketch.createCanvas(canvasWidth, 40)
        canvas.position(8, canvasHeight + 8) // need to add 8 to each position to line it up with main canvas for some reason
        sketch.background(0)
    }

    sketch.draw = () => {
        displayRuntimeInfo()
    }

}

/**
  *  Refreshes canvas background and updates runtime information.
  */
const displayRuntimeInfo = () => {
    const samples = visualizationType == 'agents' ? Math.floor(mainCanvas.frameCount / agentVisualizationSampleRate) : Math.floor(mainCanvas.frameCount / trailMapVisualizationSampleRate) + 1

    infoCanvas.fill(0, 0, 0, 255)
    infoCanvas.rect(0, 0, infoCanvas.width, infoCanvas.height)

    infoCanvas.fill(255, 255, 255, 255)
    infoCanvas.textFont(myFont)
    infoCanvas.textSize(14)
    infoCanvas.text(`FPS: ${Math.round(mainCanvas.frameRate())}\t\tSamples: ${samples}`, 10, 15)
    infoCanvas.text(`Algorithm steps: ${mainCanvas.frameCount}`, 10, 30)
}

/**
 * Draws agents on canvas (using CPU).
 */
const drawAgents = () => {
    // Refresh background with lowered opacity to create particle tails.
    mainCanvas.fill(0, 0, 0, agentTails ? 24 : 255)
    mainCanvas.rect(0, 0, canvasWidth, canvasHeight)

    for (const agent of algorithm.agents) {
        // Draw agents
        mainCanvas.fill(255, 255, 255, 255)
        mainCanvas.rect(agent.x, agent.y, particleSize)

        // Draw sensors (for debugging)
        if (showSensorsCPU) {
            mainCanvas.fill(255, 0, 0, 255)
            mainCanvas.rect(agent.sensors.front.x, agent.sensors.front.y, particleSize)
            mainCanvas.rect(agent.sensors.left.x, agent.sensors.left.y, particleSize)
            mainCanvas.rect(agent.sensors.right.x, agent.sensors.right.y, particleSize)
        }
    }
}

/**
 * Draws agents on canvas with shaders (via GPU).
 */
const shaderDrawAgents = () => {
    bufferImage.loadPixels() // load buffer image pixels

    /* Encode agent position into buffer image. Set R channel of each pixel to 1 or 0.
     *  1 -> pixel occupied by object,
     *  0 -> pixel unoccupied.
     */

    for (let x = 0; x < bufferImage.width; x++) {
        for (let y = 0; y < bufferImage.height; y++) {
            bufferImage.pixels[(x * 4) + 0 + (y * 4 * bufferImage.width)] = algorithm.physicalMap[x][y] * 256 // R channel

            /* A channel. Has a weird effect in the shader, somehow responsible for pixel fade-in
               of pixels over time EVEN when the alpha channel isn't sampled from the texture and
               we use a constant alpha value in gl_FragColor. There must be some sort of implicit
               time-dependent alpha sampling going on in the fragment shader?
             */
            bufferImage.pixels[(x * 4) + 3 + (y * 4 * bufferImage.width)] = 255
        }
    }

    bufferImage.updatePixels()
    agentShader.setUniform('tex', bufferImage) // pass buffer image to fragment shader
    mainCanvas.rect(0, 0, canvasWidth, canvasHeight)
}

/**
 * Draws trail map on canvas.
 */
const drawTrailMap = () => {
    // Refresh background
    mainCanvas.fill(0, 0, 0, 255)
    mainCanvas.rect(0, 0, canvasWidth, canvasHeight)

    let maxConcentration = 0
    for (const row of algorithm.trailMap) {
        maxConcentration = max(maxConcentration, max(row))
    }

    for (let i = 0; i < algorithm.trailMap.length; i++) {
        for (let j = 0; j < algorithm.trailMap[i].length; j++) {
            // Set visual trail particle strength to be relative to the maximum concentration
            const opacity = algorithm.trailMap[i][j] / maxConcentration * 255
            mainCanvas.fill(255, 255, 255, opacity)
            mainCanvas.rect(i, j, 1)
        }
    }
}

/**
 * Performs algorithm step and draws agents.
 */
const update = () => {
    algorithm.simulationStep()

    if (visualizationType == 'agents' && mainCanvas.frameCount % agentVisualizationSampleRate == 0) {
        if (useGPU) {
            shaderDrawAgents()
        }
        else {
            drawAgents()
        }
    }
    else if (visualizationType == 'trailMap' && mainCanvas.frameCount % trailMapVisualizationSampleRate == 1) {
        drawTrailMap()
    }
}

/**
 * Method to override browser's native window.setup method.
 */
const setup = () => {
    if (showInfo) {
        infoCanvas = new p5(infoCanvasSetup)
    }
    mainCanvas = new p5(mainCanvasSetup)
    remove() // remove default canvas that's created automatically
}


// Expose global canvas methods to browser (not done automatically for ES6 modules)
window.setup = setup