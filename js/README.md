# slime

Algorithm implementation in JavaScript using p5.js library.

## Setup
Clone repository, install project dependencies (see `package.json`). In a console window, navigate to the folder containing the `index.html` file and run `http-server -c-1`. Go to `http://127.0.0.1:8080/` in browser to view simulation animation.

## Folder structure
`./main/`
- `index.html` - Browser insertion point for simulation animation.

- `algorithm.mjs` - Contains slime mould simulation algorithm based on the 2010 paper by Jeff Jones https://sci-hub.se/https://doi.org/10.1162/artl.2010.16.2.16202.

- `draw.mjs` - Runs algorithm and draw agents on canvas. Two visualization methods: display agents or display trail map values. Agent position is sampled at each algorithm step and displayed on canvas. Sampling the trail map at each algorithm step is far too performance intensive, so the map is sampled every X frames, defined by the user.


`./misc/`
- `flat_trailMap.js` - Proof of concept algorithm implementation using a flat array to store trail map. Theoretically improves computational performance compared to using a multidimensional array / matrix structure, so it can theoretically be used if one hits the performance ceiling using the matrix approach.