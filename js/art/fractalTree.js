const initialLength = 100
const initialAngle = 45
const initialBranchCount = 4

function setup() {
    let canvasSize = 850
    createCanvas(canvasSize, canvasSize)
    background(0)
    stroke(255)
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
    translate(width/2, height/2) // move fractal to centre of screen

    for (let i = 0; i < initialBranchCount; i++)
    {
        push() // save settings before creating initial branch
        const angleIdx = 360 / initialBranchCount * i
        const branchRotation = random(angleIdx - 60, angleIdx + 60)
        rotate(branchRotation)
        branch(initialLength, initialAngle)
        pop() // restore settings after generating initial branch
    }
}