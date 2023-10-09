/* Proof of concept slime simulation using a flat array structure for the
 * trail map as opposed to a multidimensional matrix structure.
 * Theoretically improves performance, can be used if matrix approach hits
 * performance ceiling.
 */

// Canvas dimensions
const canvasWidth = 400
const canvasHeight = 400

// Collects trail deposits. Initialized as an zero N array.
let trailMap = Array(canvasWidth * canvasHeight).fill(0)
const trailMapDecay = 0.1

let agents = []
let agentCount = 8000
let particleSize = 1 // visual size of each agent's particle
let showSensors = false

/**
 * Evaluates N mod M, supports negative N (native JS % does not).
 * @param {number} n
 * @param {number} m
 * @returns {number}
 */
const mod = (n, m) => {
    return ((n % m) + m) % m
}

/**
 * Initial canvas setup.
 */
function setup() {
    createCanvas(canvasWidth, canvasHeight)
    background(0)

    for (let i = 0; i < agentCount; i++) {
        const newAgent = {
            x: random(0, canvasWidth),
            y: random(0, canvasHeight),
            angle: random(0, 2 * PI), // agent orientation/rotation angle
            stepSize: 1, // how far agent moves per step
            sensorOffset: 9, // sensor offset distance
            sensorAngle: PI / 4, // sensor angle from forward position
            sensors: {
                front: {
                    x: 0,
                    y: 0
                },
                left: {
                    x: 0,
                    y: 0
                },
                right: {
                    x: 0,
                    y: 0
                }
            },
            depositValue: 5 // chemoattractant deposition per step
        }
        agents.push(newAgent)
    }

}

/**
 * Diffuse trail around agent.
 * @param {any} trailMap
 */
const diffuse = (agent, trailMap) => {
    /* Centre cell is diffused using a 3x3 kernel. The remaining 8 cells are
     * diffused using an average between themselves and the centre cell
     */
    const x = parseInt(agent.x)
    const y = parseInt(agent.y)

    // y+1 row
    trailMap[mod(x - 1, canvasWidth) + mod(y + 1, canvasHeight) * canvasWidth] = (trailMap[mod(x - 1, canvasWidth) + mod(y + 1, canvasHeight) * canvasWidth] + trailMap[x + y * canvasWidth]) / 2
    trailMap[x + mod(y + 1, canvasHeight) * canvasWidth] = (trailMap[x + mod(y + 1, canvasHeight) * canvasWidth] + trailMap[x + y * canvasWidth]) / 2
    trailMap[mod(x + 1, canvasWidth) + mod(y + 1, canvasHeight) * canvasWidth] = (trailMap[mod(x + 1, canvasWidth) + mod(y + 1, canvasHeight) * canvasWidth] + trailMap[x + y * canvasWidth]) / 2

    // y row
    trailMap[mod(x - 1, canvasWidth) + y * canvasWidth] = (trailMap[mod(x - 1, canvasWidth) + y * canvasWidth] + trailMap[x + y * canvasWidth]) / 2
    trailMap[x + y * canvasWidth] = (trailMap[mod(x - 1, canvasWidth) + mod(y + 1, canvasHeight) * canvasWidth] + trailMap[x + mod(y + 1, canvasHeight) * canvasWidth] + trailMap[mod(x + 1, canvasWidth) + mod(y + 1, canvasHeight) * canvasWidth] + trailMap[mod(x - 1, canvasWidth) + y * canvasWidth] + trailMap[x + y * canvasWidth] + trailMap[mod(x + 1, canvasWidth) + y * canvasWidth] + trailMap[mod(x - 1, canvasWidth) + mod(y - 1, canvasHeight) * canvasWidth] + trailMap[x + mod(y - 1, canvasHeight) * canvasWidth] + trailMap[mod(x + 1, canvasWidth) + mod(y - 1, canvasHeight) * canvasWidth]) / 9
    trailMap[mod(x + 1, canvasWidth) + y * canvasWidth] = (trailMap[mod(x + 1, canvasWidth) + y * canvasWidth] + trailMap[x + y * canvasWidth]) / 2

    // y-1 row
    trailMap[mod(x - 1, canvasWidth) + mod(y - 1, canvasHeight) * canvasWidth] = (trailMap[mod(x - 1, canvasWidth) + mod(y - 1, canvasHeight) * canvasWidth] + trailMap[x + y * canvasWidth]) / 2
    trailMap[x + mod(y - 1, canvasHeight) * canvasWidth] = (trailMap[x + mod(y - 1, canvasHeight) * canvasWidth] + trailMap[x + y * canvasWidth]) / 2
    trailMap[mod(x + 1, canvasWidth) + mod(y - 1, canvasHeight) * canvasWidth] = (trailMap[mod(x + 1, canvasWidth) + mod(y - 1, canvasHeight) * canvasWidth] + trailMap[x + y * canvasWidth]) / 2
}

/**
 * Deposits value in trail map at agent's position.
 * @param {any} agent
 * @param {any} trailMap
 */
const deposit = (agent, trailMap) => {
    let x = parseInt(agent.x)
    let y = parseInt(agent.y)
    trailMap[x + y * canvasWidth] += agent.depositValue
}

/**
 * Decays all trail avalues by a fixed amount.
 * @param {any} trailMap
 */
const decay = (trailMap) => {
    for (let i = 0; i < trailMap.length; i++) {
        trailMap[i] = max(0, trailMap[i] - trailMapDecay)
    }
}

/**
 * Updates position of agent's sensors.
 * @param {agent} agent
 */
const updateSensors = (agent) => {
    agent.sensors.front = {
        x: parseInt(round(cos(agent.angle) * agent.sensorOffset) + agent.x),
        y: parseInt(round(sin(agent.angle) * agent.sensorOffset) + agent.y)
    }

    agent.sensors.left = {
        x: parseInt(round(cos(agent.angle + agent.sensorAngle) * agent.sensorOffset) + agent.x),
        y: parseInt(round(sin(agent.angle + agent.sensorAngle) * agent.sensorOffset) + agent.y),
    }

    agent.sensors.right = {
        x: parseInt(round(cos(agent.angle - agent.sensorAngle) * agent.sensorOffset) + agent.x),
        y: parseInt(round(sin(agent.angle - agent.sensorAngle) * agent.sensorOffset) + agent.y),
    }
}

/**
 * Ensures that object with properties (x, y) is always visible on canvas.
 * @param {any} obj
 */
const adjustForBoundaries = (obj) => {
    obj.x = mod(obj.x, canvasWidth)
    obj.y = mod(obj.y, canvasHeight)
}

/**
 * Updates canvas on each frame
 */
function update() {
    for (const agent of agents) {
        // Move agents
        agent.x += agent.stepSize * cos(agent.angle)
        agent.y += agent.stepSize * sin(agent.angle)

        // Move sensors
        updateSensors(agent)

        // Check for boundaries, loop back on other side if boundaries exceeded
        adjustForBoundaries(agent)
        adjustForBoundaries(agent.sensors.front)
        adjustForBoundaries(agent.sensors.left)
        adjustForBoundaries(agent.sensors.right)


        let frontTrail = trailMap[agent.sensors.front.x + agent.sensors.front.y * canvasWidth]
        let leftTrail = trailMap[agent.sensors.left.x + agent.sensors.left.y * canvasWidth]
        let rightTrail = trailMap[agent.sensors.right.x + agent.sensors.right.y * canvasWidth]

        if (frontTrail > leftTrail && frontTrail > rightTrail) { // front is strongest
            // pass
        }
        /* Note: It doesn't really make sense to have this step be random? The fact that
         * the front sensor is detecting a weaker chemoattractant than the two off-centre
         * sensors does not imply that the left and right sensors have equal "weight",
         * it is very much possible that the left sensor has detected a higher trail value
         * while at the same time the front sensor has detected the lowest trail value (in
         * which case the agent should rotate left).
         * 
         * TODO: Make this step more deterministic, only have random rotation if left and right
         * sensors have the same trail value, both of which must be higher than the front sensor's.
         */
        else if (frontTrail < leftTrail && frontTrail < rightTrail) { // front is least strong
            agent.angle += random(PI / 2, -PI / 2)
        }
        else if (rightTrail < leftTrail) { // right is strongest, rotate right
            agent.angle += PI / 2
        }
        else if (leftTrail > rightTrail) { // left is strongest, rotate left
            agent.angle -= PI / 2
        }
        else { // all sensor trail values are equal
            // pass
        }

        // Diffuse trail map before depositing a new chemoattractant value
        diffuse(agent, trailMap)
        deposit(agent, trailMap)

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
    decay(trailMap)

}

function draw() {
    noStroke()

    // Refresh background with lowered opacity to create particle tails.
    background(0, 25);

    update()
}