import { clamp, simpleMeanConvolute, getRandom } from './mathUtils.mjs'

// Canvas dimensions.
export let canvasWidth, canvasHeight

export let trailMap
let trailMapDecay 

export let agents = []
export let agentCount
let agentCollision = true // should agents collide with each other

/**
 * Changes variables canvasWidth and canvasHeight
 * @param {number} x
 * @param {number} y
 */
export const changeDimensions = (x, y) => {
    canvasWidth = x
    canvasHeight = y
}

/**
 * Changes agentCollision variable.
 * @param {bool} state
 */
export const setAgentCollision = (state) => {
    agentCollision = state
}

/**
 * Changes agentCount variable.
 * @param {number} agentCount
 */
export const changeAgentAcount = (inputAgentCount) => {
    agentCount = inputAgentCount
}

/**
 * Sets trailMapDecay variable.
 * @param {number} amount
 */
export const setTrailMapDecay = (amount) => {
    trailMapDecay = amount
}

export const init = () => {
    // Collects trail deposits. Initialized as a zero NxM multidimensional array.
    trailMap = Array.from({ length: canvasHeight }, () => Array(canvasWidth).fill(0))

    for (let i = 0; i < agentCount; i++) {
        const newAgent = {
            x: getRandom(0, canvasWidth),
            y: getRandom(0, canvasHeight),
            angle: getRandom(0, 2 * Math.PI), // agent orientation/rotation angle
            rotationAngle: Math.PI / 4, // angle by which agents should rotate
            stepSize: 1, // how far agent moves per step
            sensorOffset: 18, // sensor offset distance
            sensorAngle: Math.PI / 4, // sensor angle relative to central axis
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
            depositValue: 5 // trail deposition per step
        }
        agents.push(newAgent)
    }
}

/**
 * Deposits value in trail map at agent's position.
 * @param {any} agent
 * @param {any} trailMap
 */
const deposit = (position, value) => {
    let x = parseInt(position.x)
    let y = parseInt(position.y)
    trailMap[x][y] += value
}

/**
 * Moves agent to specified position
 * @param {*} agent
 * @param {*} newPosition
 */
const moveAgent = (agent, newPosition) => {
    agent.x = newPosition.x
    agent.y = newPosition.y
}

/**
 * Decays all trail avalues by a fixed amount.
 * @param {any} trailMap
 */
const decay = (decayRate) => {
    for (let i = 0; i < canvasWidth; i++) {
        for (let j = 0; j < canvasHeight; j++) {
            trailMap[i][j] = Math.max(0, trailMap[i][j] - decayRate)
        }
    }
}

/**
 * Updates position of agent's sensors.
 * @param {agent} agent
 */
const updateSensors = (agent) => {
    agent.sensors.front = {
        x: parseInt(Math.round(Math.cos(agent.angle) * agent.sensorOffset) + agent.x),
        y: parseInt(Math.round(Math.sin(agent.angle) * agent.sensorOffset) + agent.y)
    }

    agent.sensors.left = {
        x: parseInt(Math.round(Math.cos(agent.angle + agent.sensorAngle) * agent.sensorOffset) + agent.x),
        y: parseInt(Math.round(Math.sin(agent.angle + agent.sensorAngle) * agent.sensorOffset) + agent.y)
    }

    agent.sensors.right = {
        x: parseInt(Math.round(Math.cos(agent.angle - agent.sensorAngle) * agent.sensorOffset) + agent.x),
        y: parseInt(Math.round(Math.sin(agent.angle - agent.sensorAngle) * agent.sensorOffset) + agent.y)
    }
}

/**
 * Ensures that object with properties (x, y) is always visible on canvas.
 * @param {any} obj
 */
const adjustForBoundaries = (obj) => {
    // obj.x = mod(obj.x, canvasWidth)
    // obj.y = mod(obj.y, canvasHeight)
    obj.x = clamp(obj.x, 0, canvasWidth-1)
    obj.y = clamp(obj.y, 0, canvasHeight-1)
}

// Perform a step in the simulation algorithm.
export const simulationStep = () => {
    for (const agent of agents) {
        const frontTrail = trailMap[agent.sensors.front.x][agent.sensors.front.y]
        const leftTrail = trailMap[agent.sensors.left.x][agent.sensors.left.y]
        const rightTrail = trailMap[agent.sensors.right.x][agent.sensors.right.y]

        if (frontTrail > leftTrail && frontTrail > rightTrail) { // front is strongest
            // pass
        }
        /* Note: It doesn't really make sense to have this step be random? The fact that
         * the front sensor is detecting a weaker trail than the two off-centre
         * sensors does not imply that the left and right sensors have equal "weight",
         * it is very much possible that the left sensor has detected a higher trail value
         * while at the same time the front sensor has detected the lowest trail value (in
         * which case the agent should rotate left).
         * 
         * TODO: Make this step more deterministic, only have random rotation if left and right
         * sensors have the same trail value, both of which must be higher than the front sensor's.
         */
        else if (frontTrail < leftTrail && frontTrail < rightTrail) { // front is least strong
            agent.angle = getRandom(0, 1) > 0.5 ? agent.angle + agent.rotationAngle : agent.angle - agent.rotationAngle
        }
        else if (rightTrail < leftTrail) { // right is strongest, rotate right
            agent.angle += agent.rotationAngle
        }
        else if (leftTrail > rightTrail) { // left is strongest, rotate left
            agent.angle -= agent.rotationAngle
        }
        else { // all sensor trail values are equal
            // pass
        }

        const newPosition = {
            x: +(agent.x + Math.cos(agent.angle) * agent.stepSize).toFixed(2),
            y: +(agent.y + Math.sin(agent.angle) * agent.stepSize).toFixed(2)
        }

        let newPositionOccupied = false
        if (agentCollision) {
            for (const altAgent of agents) {
                if (altAgent.x == newPosition.x && altAgent.y == newPosition.y) {
                    newPositionOccupied = true
                }
            }
        }

        // Agent has hit boundary, choose random agent angle and don't deposit trail
        if ((newPosition.x < 0 || newPosition.x >= canvasWidth || newPosition.y < 0 || newPosition.y >= canvasHeight)
            || newPositionOccupied)
        {
            newPosition.x = clamp(newPosition.x, 0, canvasWidth-1)
            newPosition.y = clamp(newPosition.y, 0, canvasHeight-1)
            agent.angle = getRandom(0, 2 * Math.PI)
        }
        // No boundary hit, deposit trail
        else
        {
            deposit(newPosition, agent.depositValue)
        }

        moveAgent(agent, newPosition)

        updateSensors(agent)
        adjustForBoundaries(agent.sensors.front)
        adjustForBoundaries(agent.sensors.left)
        adjustForBoundaries(agent.sensors.right)
    }
    simpleMeanConvolute(trailMap)
    decay(trailMapDecay)
}