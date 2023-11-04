const initialLength = 200
const initialAngle = 65

function setup() {
    let canvasSize = 850
    createCanvas(canvasSize, canvasSize)
    background(0)
    stroke(255, 255, 255)
    noLoop()
    angleMode(DEGREES)
}

/**
 * Recursive function to generate fractal tree.
 * @param {*} length 
 * @param {*} angle 
 */
function branch(length, angle) {
    line(0, 0, 0, -length)
    translate(0, -length)
    length *= 0.7 // removes 30% of branch length on each iteration
    angle = random(angle - 25, angle + 25) // slightly randomizes branch angle

    if (length > 2)
    {
        push() // saves sketch settings before generating next branch
        rotate(angle)
        branch(length, angle)
        pop() // restores sketch settings after branch has been generated

        push()
        rotate(-angle)
        branch(length, angle)
        pop()
    }
}

function draw() {
    translate(width/2, height/1.2) // move fractal to centre of screen
    branch(initialLength, initialAngle)
}