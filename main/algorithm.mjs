// Canvas dimensions.
export let canvasWidth, canvasHeight

export let trailMap, physicalMap
const trailMapDecay = 0.1

export let agents = []
const agentCount = 10000
const agentCollision = false // should agents collide with each other

/**
 * Changes variables canvasWidth and canvasHeight
 * @param {any} x
 * @param {any} y
 */
export const changeDimensions = (x, y) => {
    canvasWidth = x
    canvasHeight = y
}

/**
 * Evaluates N mod M, supports negative N (native JS % does not).
 * @param {number} n
 * @param {number} m
 * @returns {number}
 */
const mod = (n, m) => {
    return ((n % m) + m) % m
}

export const init = () => {
    // Collects trail deposits. Initialized as a zero NxM multidimensional array.
    trailMap = Array.from({ length: canvasHeight }, () => Array(canvasWidth).fill(0))

    // Tracks which pixels are taken up by a physical object. Initialized as a zero NxM multidimensional array.
    physicalMap = Array.from({ length: canvasHeight }, () => Array(canvasWidth).fill(0))

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
    let x = parseInt(agent.x)
    let y = parseInt(agent.y)

    // y+1 row
    trailMap[mod(x - 1, canvasWidth)][mod(y + 1, canvasHeight)] = (trailMap[mod(x - 1, canvasWidth)][mod(y + 1, canvasHeight)] + trailMap[x][y]) / 2
    trailMap[x][mod(y + 1, canvasHeight)] = (trailMap[x][mod(y + 1, canvasHeight)] + trailMap[x][y]) / 2
    trailMap[mod(x + 1, canvasWidth)][mod(y + 1, canvasHeight)] = (trailMap[mod(x + 1, canvasWidth)][mod(y + 1, canvasHeight)] + trailMap[x][y]) / 2

    // y row
    trailMap[mod(x - 1, canvasWidth)][y] = (trailMap[mod(x - 1, canvasWidth)][y] + trailMap[x][y]) / 2
    trailMap[x][y] = (trailMap[mod(x - 1, canvasWidth)][mod(y + 1, canvasHeight)] + trailMap[x][mod(y + 1, canvasHeight)] + trailMap[mod(x + 1, canvasWidth)][mod(y + 1, canvasHeight)] + trailMap[mod(x - 1, canvasWidth)][y] + trailMap[x][y] + trailMap[mod(x + 1, canvasWidth)][y] + trailMap[mod(x - 1, canvasWidth)][mod(y - 1, canvasHeight)] + trailMap[x][mod(y - 1, canvasHeight)] + trailMap[mod(x + 1, canvasWidth)][mod(y - 1, canvasHeight)]) / 9
    trailMap[mod(x + 1, canvasWidth)][y] = (trailMap[mod(x + 1, canvasWidth)][y] + trailMap[x][y]) / 2

    // y-1 row
    trailMap[mod(x - 1, canvasWidth)][mod(y - 1, canvasHeight)] = (trailMap[mod(x - 1, canvasWidth)][mod(y - 1, canvasHeight)] + trailMap[x][y]) / 2
    trailMap[x][mod(y - 1, canvasHeight)] = (trailMap[x][mod(y - 1, canvasHeight)] + trailMap[x][y]) / 2
    trailMap[mod(x + 1, canvasWidth)][mod(y - 1, canvasHeight)] = (trailMap[mod(x + 1, canvasWidth)][mod(y - 1, canvasHeight)] + trailMap[x][y]) / 2
}

/**
* Deposits value in trail map at agent's position.
* @param {any} agent
* @param {any} trailMap
*/
const deposit = (agent, trailMap) => {
    let x = parseInt(agent.x)
    let y = parseInt(agent.y)
    trailMap[x][y] += agent.depositValue
}

/**
* Takes an object with properties (x,y), adds/removes physical location entry of object in physicalMap depending on the value of type.
* @param {any} obj
* @param {any} physicalMap
* @param {string} type 'add' or 'remove'
*/
const locationDump = (obj, physicalMap, type) => {
    const x = parseInt(obj.x)
    const y = parseInt(obj.y)

    physicalMap[x][y] = type == 'add' ? 1 : 0
}

/**
* Moves agent by a specified amount.
* @param {any} agent
* @param {any} amount
*/
const moveAgent = (agent, amount) => {
    const future_x = mod(agent.x + amount[0], canvasWidth)
    const future_y = mod(agent.y + amount[1], canvasHeight)


    // Suggested agent's location is already filled.
    if (agentCollision && physicalMap[parseInt(future_x)][parseInt(future_y)] != 0) {
        agent.angle = random(0, 2 * PI)
        return
    }

    if (agentCollision) {
        locationDump(agent, physicalMap, 'remove')
    }
    agent.x = future_x
    agent.y = future_y
    if (agentCollision) {
        locationDump(agent, physicalMap, 'add')
    }
}

/**
* Decays all trail avalues by a fixed amount.
* @param {any} trailMap
*/
const decay = (trailMap) => {
    for (let i = 0; i < canvasWidth; i++) {
        for (let j = 0; j < canvasHeight; j++) {
            trailMap[i][j] = max(0, trailMap[i][j] - trailMapDecay)
        }
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
        y: parseInt(round(sin(agent.angle + agent.sensorAngle) * agent.sensorOffset) + agent.y)
    }

    agent.sensors.right = {
        x: parseInt(round(cos(agent.angle - agent.sensorAngle) * agent.sensorOffset) + agent.x),
        y: parseInt(round(sin(agent.angle - agent.sensorAngle) * agent.sensorOffset) + agent.y)
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

// Perform a step in the simulation algorithm.
export const simulationStep = () => {
    for (const agent of agents) {
        // Move agents
        moveAgent(agent, [agent.stepSize * cos(agent.angle), agent.stepSize * sin(agent.angle)])

        updateSensors(agent)
        // Check for boundaries, loop back on other side if boundaries exceeded
        adjustForBoundaries(agent)
        adjustForBoundaries(agent.sensors.front)
        adjustForBoundaries(agent.sensors.left)
        adjustForBoundaries(agent.sensors.right)

        let frontTrail = trailMap[agent.sensors.front.x][agent.sensors.front.y]
        let leftTrail = trailMap[agent.sensors.left.x][agent.sensors.left.y]
        let rightTrail = trailMap[agent.sensors.right.x][agent.sensors.right.y]

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
    }
    decay(trailMap)
}