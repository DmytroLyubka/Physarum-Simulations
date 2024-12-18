const canvasSize = 850
const particleCount = 5000
let particles = []
let deadCount = 0
const particleLifetime = 50
let particleLife = 0
const maxIterations = 50
let iterationCount = 1

function setup() {
    createCanvas(canvasSize, canvasSize)
    background(255)
    angleMode(DEGREES)
    generateParticles()
}

/**
 * Generates randomly distributed particles on the canvas.
 */
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
        fill(0, 0, 0, 10)
        rect(particle.x, particle.y, particle.thickness)
        particle.angle = 360 * noise(particle.x * 0.01, particle.y * 0.01) // Perlin-influenced random angle
        particle.x = particle.x + cos(particle.angle)
        particle.y = particle.y + sin(particle.angle)

        // Particle hit boundary, kill particle
        if (particle.x < 0 || particle.x > width || particle.y < 0 || particle.y > height)
        {
            deadCount++
            particle.dead = true
            continue
        }
    }
    particleLife++ // tracks particle life length

    // Re-generate particles if they all died or lived too long
    if ((deadCount == particleCount || particleLife > particleLifetime) && iterationCount < maxIterations)
    {
        particleLife = 0
        deadCount = 0
        iterationCount++
        generateParticles()
    }
}