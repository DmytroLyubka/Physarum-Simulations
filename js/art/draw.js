function setup() {
    let canvasSize = 850
    createCanvas(canvasSize, canvasSize)
    background(0)
    stroke(255, 255, 255)
    noLoop()
    angleMode(DEGREES)
}

const iterMax = 11
const angle = 15

function branch(length) {
    line(0, 0, 0, -length)
    translate(0, -length)
    length *= 0.65

    if (length > 2)
    {
        push()
        rotate(angle)
        branch(length)
        pop()

        push()
        rotate(-angle)
        branch(length)
        pop()
    }
}

function draw() {
    let length = 100

    translate(width/2, height/1.2) // move fractal to centre of screen
    branch(length)
}