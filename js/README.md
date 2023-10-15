# slime

Algorithm implementation in JavaScript using p5.js library. Due to performance requirements, this version isn't going to be used for the main algorithm demonstrations and experiments - JS with a browser overhead and no access to the GPU simply cannot process and render as many agents as we need. For that, we'll likely work with the Unity implementation as that has direct access to the GPU. Attempts at reworking the JS implementation to use shaders have been made, but ultimately abandoned due to the fact that browsers cannot seem to utilize the GPU properly. Even if that wasn't the case, dealing with the browser overhead and a generally non-powerful library is sub-optimal, so this turned out to mostly be a proof-of-concept prototype.

## Setup
Clone repository, install project dependencies (see `package.json`). In a console window, navigate to the folder containing the `index.html` file and run `http-server -c-1`. Go to `http://127.0.0.1:8080/` in browser to view simulation animation.

## Folder structure
`./main/`
- `index.html` - Browser insertion point for simulation animation.

- `algorithm.mjs` - Contains slime mould simulation algorithm based on the 2010 paper by Jeff Jones https://sci-hub.se/https://doi.org/10.1162/artl.2010.16.2.16202.

- `draw.mjs` - Runs algorithm and draw agents on canvas. Two visualization methods: display agents or display trail map values. Agent position is sampled at each algorithm step and displayed on canvas. Sampling the trail map at each algorithm step is far too performance intensive, so the map is sampled every X frames, defined by the user.


`./misc/`
- `flat_trailMap.js` - Proof of concept algorithm implementation using a flat array to store trail map. Theoretically improves computational performance compared to using a multidimensional array / matrix structure, so it can theoretically be used if one hits the performance ceiling using the matrix approach.