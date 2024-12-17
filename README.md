# Physarum-Simulations

*Physarum polycephalum* pattern-forming algorithm implementations in JS and Unity.

## Implementations
- `./unity`: Unity implementation using C# and compute shaders.
- `./js`: Initial prototype JavaScript implementation using p5.

## Images
![Visualation technique examples](./images/visualisationExamples.png)

![Example of system evolution](./images/visualisation_example_1.png)

![Extended algorithm example 1](./images/extended_algorithm_example_1.png)

![Pattern types](./images/pattern_types.png)

![Pattern evolution 2](./images/evolution_2.png)

![Pattern evolution 3](./images/evolution_3.png)

![Pattern evolution 4](./images/evolution_4.png)

![3 point Steiner tree](./images/steiner_3.png)

![4 point Steiner tree](./images/steiner_4.png)

<p align="center">
  <img src="./images/steiner_simulation_1.png" alt="Comparing simulated Steiner tree 1 to accurate graph" width="45%" />
  <img src="./images/steiner_simulation_2.png" alt="Comparing simulated Steiner tree 2 to accurate graph" width="45%" />
</p>

![Voronoi diagram approximation](./images/voronoi_simulation_1.png)

![Traversing RA-SA parameter space with agent collision](./images/raVsSa.png)

![Traversing RA-SA parameter space without agent collision](./images/raVsSa_withoutCollision.png)

![Hexagonal pattern formation without agent collision](./images/hexagonalPattern_noCollision.png)

![Square pattern formation with agent collision](./images/squarePattern.png)

![Traversing SO-Population size parameter space](./images/soVsPopulationSize.png)

<p align="center">
  <img src="./images/mass_preservation_difference.png" alt="Effect of disabling mass presevation condition" width="45%" />
  <img src="./images/biology_approximation.png" alt="Comparing biological and simulated Physarum" width="45%" />
</p>

## References
- [Original algorithm article (Jeff Jones, 2010)](https://direct.mit.edu/artl/article/16/2/127/2650/Characteristics-of-Pattern-Formation-and-Evolution)
- [GPU-powered *Physarum* simulation blog bost (Sage Jenson, 2019)](https://cargocollective.com/sagejenson/physarum)
- [Slime mould simulations in Unity (Sebastian Lague, 2021)](https://www.youtube.com/watch?v=X-iSQQgOd1A)
- [*Physarum* artwork using p5.js (Julien Verneuil, 2021)](https://www.onirom.fr/slime.html)
- [PCG hash](https://www.pcg-random.org/index.html)
- [Nakagaki, T., Kobayashi, R., Nishiura, Y. & Ueda, T. Obtaining multiple separate food sources: behavioural intelligence in the Physarum plasmodium.](https://pmc.ncbi.nlm.nih.gov/articles/PMC1691859/)
- [Shirakawa, T. & Gunji, Y.-P. Computation of Voronoi diagram and collisionfree path using the plasmodium of Physarum polycephalum](https://www.researchgate.net/publication/220475098_Computation_of_Voronoi_Diagram_and_Collision-free_Path_using_the_Plasmodium_of_Physarum_polycephalum)

