/**
 * Evaluates N mod M, supports negative N (native JS % does not).
 * @param {number} n
 * @param {number} m
 * @returns {number}
 */
export const mod = (n, m) => {
    return ((n % m) + m) % m
}

/**
 * Clamps number in a specified range.
 * @param {number} n 
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
export const clamp = (n, min, max) => {
    return Math.min(Math.max(n, min), max)
}

/**
 * Generates random float between min and max.
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export const getRandom = (min, max) => {
    return Math.random() * (max - min) + min
}

/**
 * Performs simple mean filtering on a matrix using a 3x3 kernel convolution.
 * @param {number[][]} matrix
 * @returns {number[][]}
 */
export const simpleMeanConvolute = (matrix) => {
    const matrixHeight = matrix.length
    const matrixWidth = matrix[0].length

    let output = Array.from({ length: matrixHeight }, () => Array(matrixWidth).fill(0))

    for (let x = 0; x < matrixWidth; x++) {
        for (let y = 0; y < matrixHeight; y++) {
            let diffusedValue = 0
            
            for (let idx = -1; idx <= 1; idx++) {
                for (let idy = -1; idy <= 1; idy++) {
                    const kernelX = x + idx
                    const kernelY = y + idy

                    if (kernelX < 0 || kernelX >= matrixWidth || kernelY < 0 || kernelY >= matrixHeight) {
                        continue // outside matrix bounds, treat as a halo region
                    }
                    else {
                        diffusedValue += matrix[kernelX][kernelY]
                    }
                }
            }
            diffusedValue /= 9
            output[x][y] = diffusedValue
        }
    }
    return output
}