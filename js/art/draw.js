function setup() {
    let canvasSize = 850
    createCanvas(canvasSize, canvasSize)
    background(0, 0, 40)
    stroke(255, 255, 255)
    noLoop()
    angleMode(DEGREES)
}

const iterMax = 11
const angle = 15

function branch(iters) {
    line(0, 0, 0, -50)
    translate(0, -50)
    iters++

    if (iters < iterMax)
    {

        push()
        rotate(angle)
        branch(iters)
        pop()

        push()
        rotate(-angle)
        branch(iters)
        pop()
    }
}

function draw() {
    let iters = 0

    translate(width/2, height/1.2)
    push()
    branch(iters)
    pop()
}