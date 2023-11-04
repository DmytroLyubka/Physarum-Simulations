function setup() {
    let canvasSize = 850
    createCanvas(canvasSize, canvasSize)
    background(0)
    stroke(255)
    angleMode(DEGREES)

    strokeWeight(0.5)
    for (let x = 0; x < width/10; x++)
    {
        for (let y = 0; y < height/10; y++)
        {
            const idx = x * 10
            const idy = y * 10
            angle = 360 * noise(idx * 0.01, idy * 0.01)
            line(idx, idy, idx + 15*cos(angle), idy + 15*sin(angle))
        }
    }
}

function draw() {
}