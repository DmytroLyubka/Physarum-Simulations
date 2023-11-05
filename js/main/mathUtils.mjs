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
 * @returns 
 */
export const clamp = (n, min, max) => {
    return Math.min(Math.max(n, min), max - 1)
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
 * @param {any} matrix
 * @returns
 */
export const simpleMeanConvolute = (matrix) => {
    const matrixHeight = matrix.length
    const matrixWidth = matrix[0].length

    const weights = [[1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9]]

    let output = Array.from({ length: matrixHeight }, () => Array(matrixWidth).fill(0))

    let finalValue
    for (let x = 0; x < matrixWidth; x++) {
        for (let y = 0; y < matrixHeight; y++) {
            const left_x = mod(x - 1, matrixWidth)
            const middle_x = mod(x, matrixWidth)
            const right_x = mod(x + 1, matrixWidth)

            const top_y = mod(y + 1, matrixHeight)
            const middle_y = mod(y, matrixHeight)
            const bottom_y = mod(y - 1, matrixHeight)

            const top_row = [
                matrix[left_x][top_y],
                matrix[middle_x][top_y],
                matrix[right_x][top_y]
            ]

            const middle_row = [
                matrix[left_x][middle_y],
                matrix[middle_x][middle_y],
                matrix[right_x][middle_y]
            ]

            const bottom_row = [
                matrix[left_x][bottom_y],
                matrix[middle_x][bottom_y],
                matrix[right_x][bottom_y]
            ]

            const kernelImage = [top_row, middle_row, bottom_row]

            finalValue = 0;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    finalValue += kernelImage[i][j] * weights[i][j]
                }
            }
            output[x][y] = +(finalValue.toFixed(2))
        }
    }
    return output
}