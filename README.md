# slime

Slime mould (Physarum polycephalum) algorithm simulations for Final Year Mathematics Project.

## Implementations
The algorithm has been implemented using two different technology stacks:
- JavaScript, using the p5.js library. GLSL shader option to provide better performance (it didn't, really).
- Unity, using compute shaders for higher performance by utilizing GPU. Results look much more promising than JS.

## General credits
- The algorithm is based on the 2010 paper by Jeff Jones.
  * https://sci-hub.se/https://doi.org/10.1162/artl.2010.16.2.16202.

- The Unity implementation was inspired by Sage Jenson's blog post about simulating Physarum on a GPU, and Sebastian Lague's algorithm implementation in Unity.
  * https://cargocollective.com/sagejenson/physarum
  * https://www.youtube.com/watch?v=X-iSQQgOd1A

- The JS implementation was inspired by Julien Verneuil's blog posts on Physarum simulations.
  * https://www.onirom.fr/slime.html
  * https://github.com/grz0zrg/Computer-Graphics
