using UnityEngine;

public class SlimeAlgorithm : MonoBehaviour
{
	public ComputeShader algorithmComputeShader;
	
	/// <summary>
	/// Stores raw agent positions over time.
	/// </summary>
	private RenderTexture trailMap;
	
	/// <summary>
	/// Stores processed (decayed, diffused, etc.) trail map values over time.
	/// </summary>
	private RenderTexture processedTrailMap;
	
	/// <summary>
	/// Holds agent objects to be used by compute shaders.
	/// </summary>
	public ComputeBuffer agentBuffer;
	
	/// <summary>
	/// Texture width.
	/// </summary>
	public int width;
	
	/// <summary>
	/// Texture height.
	/// </summary>
	public int height;
	
	/// <summary>
	/// Number of agents to simulate.
	/// </summary>
	public int agentCount;
	
	/// <summary>
	/// How many pixels agents move at each algorithm step.
	/// </summary>
	public int moveSpeed;
	
	/// <summary>
	/// Number of algorithm steps to run at each frame.
	/// </summary>
	public int algorithmStepsPerFrame;
	
	/// <summary>
	/// Speed at which to decay trail map.
	/// </summary>
	public float decaySpeed;

	/// <summary>
	/// Initializes algorithm and compute shader parameters.
	/// </summary>
	void Init()
	{
		// Create trail map
		trailMap = new RenderTexture(width, height, 0) 
		{
			enableRandomWrite = true,
			filterMode = FilterMode.Point
		};
		trailMap.Create();
		
		// Create processed trail map
		processedTrailMap = new RenderTexture(width, height, 0) 
		{
			enableRandomWrite = true,
			filterMode = FilterMode.Bilinear
		};
		processedTrailMap.Create();
		
		// Assign textures in compute shader
		algorithmComputeShader.SetTexture(0, "trailMap", trailMap);
		algorithmComputeShader.SetTexture(1, "trailMap", trailMap);
		algorithmComputeShader.SetTexture(1, "processedTrailMap", processedTrailMap);
		
		// Create agents with random position and angles
		Agent[] agents = new Agent[agentCount];
		for (int i = 0; i < agents.Length; i++) 
		{
			Agent agent = new Agent() 
			{
				position = new Vector2(Random.value * width, Random.value * height),
				angle = Random.value * 2 * Mathf.PI
			};
			agents[i] = agent;
		}
		
		// Create compute buffer to carry agents to compute shader
		int agentSize = System.Runtime.InteropServices.Marshal.SizeOf(typeof(Agent));
		agentBuffer = new ComputeBuffer(agents.Length, agentSize);
		agentBuffer.SetData(agents);
		algorithmComputeShader.SetBuffer(0, "agents", agentBuffer);

		// Set parameters in compute shader
		algorithmComputeShader.SetInt("agentCount", agentCount);
		algorithmComputeShader.SetInt("width", width);
		algorithmComputeShader.SetInt("height", height);
		algorithmComputeShader.SetFloat("deltaTime", Time.fixedDeltaTime);
		algorithmComputeShader.SetFloat("moveSpeed", moveSpeed);
		algorithmComputeShader.SetFloat("decaySpeed", decaySpeed);
	}
	
	/// <summary>
	/// Executes algorithm step.
	/// </summary>
	private void AlgorithmStep() 
	{
		Dispatch(algorithmComputeShader, agentCount, 1, 1, kernelIndex: 0);
		Dispatch(algorithmComputeShader, width, height, 1, kernelIndex: 1);
		
		Graphics.Blit(processedTrailMap, trailMap);
	}

	// Start is called before the first frame update.
	void Start()
	{
		// Initialize algorithm
		Init();
		
		// Set render output to trail map
		transform.GetComponentInChildren<MeshRenderer>().material.mainTexture = processedTrailMap;
	}

	// Update is called once per frame.
	void Update()
	{
		for (int i = 0; i < algorithmStepsPerFrame; i++) 
		{
			AlgorithmStep();
		}
	}
	
	void OnDestroy() 
	{
		// Release agent buffer when scene ends (just in case)
		agentBuffer.Release();
	}

	/// <summary>
	/// Dispatches compute shader using an appropriate number of thread groups in each dimensions.
	/// Credits: SebLague
	/// </summary>
	void Dispatch(ComputeShader shader, int threadsX, int threadsY, int threadsZ, int kernelIndex)
	{
		uint x, y, z;
		shader.GetKernelThreadGroupSizes(kernelIndex, out x, out y, out z);
		Vector3Int threadGroupSizes = new Vector3Int((int)x, (int)y, (int)z);
		
		// Calculates appropriate number of thread groups to use in each dimension.
		int numGroupsX = Mathf.CeilToInt(threadsX / (float)threadGroupSizes.x);
		int numGroupsY = Mathf.CeilToInt(threadsY / (float)threadGroupSizes.y);
		int numGroupsZ = Mathf.CeilToInt(threadsZ / (float)threadGroupSizes.z);
		
		shader.Dispatch(kernelIndex, numGroupsX, numGroupsY, numGroupsZ);
	}
	
	/// <summary>
	/// Agent structure.
	/// </summary>
	private struct Agent 
	{
		public Vector2 position;
		public float angle;
	}
}