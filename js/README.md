# slime

## Setup
Clone repository, install project dependencies (see `package.json`). In a console window, navigate to the folder containing the `index.html` file and run `http-server -c-1`. Go to `http://127.0.0.1:8080/` in browser to view simulation animation.

- `./main/index.html`: Browser insertion point for simulation animation.

- `./main/algorithm.mjs`: Slime mould simulation algorithm based on the 2010 paper by Jeff Jones https://sci-hub.se/https://doi.org/10.1162/artl.2010.16.2.16202.

- `./main/draw.mjs`: Runs algorithm and draw agents on canvas. Two visualization methods: display agents or display trail map values. Agent position is sampled at each algorithm step and displayed on canvas.