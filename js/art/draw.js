const initialLength = 100
const initialAngle = 45

function setup() {
    let canvasSize = 850
    createCanvas(canvasSize, canvasSize)
    background(0)
    stroke(255, 255, 255)
    noLoop()
    angleMode(DEGREES)
}

const iterMax = 11

function branch(length, angle) {
    line(0, 0, 0, -length)
    translate(0, -length)
    length *= 0.65
    angle = random(angle - 15, angle + 15)

    if (length > 2)
    {
        push()
        rotate(angle)
        branch(length, angle)
        pop()

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