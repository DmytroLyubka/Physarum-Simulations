const canvasSize = 850
const vectorFieldResolution = 1
const drawVectorField = true
const particleCount = 5000

let particles = []
let deadCount = 0
const particleLifetime = 50
let particleLife = 0
const maxIterations = 50
let iterationCount = 1

function setup() {
    createCanvas(canvasSize, canvasSize)
    background(0)
    angleMode(DEGREES)

    generateParticles()
    console.log(`Iteration Count: ${iterationCount}`)
}

function generateParticles()
{
    for (let i = 0; i < particleCount; i++)
    {
        const newParticle = {
            x: random(0, width),
            y: random(0, height),
            angle: 0,
            thickness: random(1, 1),
            dead: false     
        }
        particles[i] = newParticle
    }
}

function draw() {
    noStroke()
    for (const particle of particles)
    {
        if (particle.dead)
        {
            continue
        }
        fill(255, 255, 255, 5)
        rect(particle.x, particle.y, particle.thickness)

        particle.angle = 360 * noise(particle.x * 0.01, particle.y * 0.01)

        particle.x = particle.x + cos(particle.angle)
        particle.y = particle.y + sin(particle.angle)

        if (particle.x < 0 || particle.x > width || particle.y < 0 || particle.y > height)
        {
            deadCount++
            particle.dead = true
            continue
        }
    }

    particleLife++

    if ((deadCount == particleCount || particleLife > particleLifetime) && iterationCount < maxIterations)
    {
        particleLife = 0
        deadCount = 0
        iterationCount++
        console.log(`Iteration Count: ${iterationCount}`)
        generateParticles()
    }
}