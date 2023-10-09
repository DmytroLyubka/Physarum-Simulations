# slime

Slime mould (Physarum polycephalum) simulations for Final Year Mathematics Project.

## Setup
Clone repository, install project dependencies (see `package.json`). Navigate to the `./slime` folder in a console window (make sure you're in the same location as the `index.html` file and run `http-server -c-1`. Go to `http://127.0.0.1:8080/` in browser to view simulation.

## Repository structure
`./index.html` - Browser insertion point of simulation script.

`./slime.js` - Main simulation script. Uses a multidimensional array / matrix structure to store trail map.

`./flat_trailMap.js` - Copy of main simulation script (as of 10/10/2023) but uses a flat array to store trail map. Theoretically improves computational performance, so this version can be used if we reach the performance ceiling with the matrix approach.

`./Slime` - Visual Studio solution for debugging.