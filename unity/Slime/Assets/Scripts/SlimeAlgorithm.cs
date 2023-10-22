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
	[Range(1, 2000)] public int width;

	/// <summary>
	/// Texture height.
	/// </summary>
	[Range(1, 2000)] public int height;

	/// <summary>
	/// Store maximum number of agents that can be processed in a single thread group dimension (65535).
	/// </summary>
	public bool bufferMaxAgentCount;

	/// <summary>
	/// Number of agents to simulate.
	/// </summary>
	[Range(1, 65535)] public int agentCount;

	/// <summary>
	/// How many pixels agents move at each algorithm step.
	/// </summary>
	[Range(0, 200)] public int moveSpeed;

	/// <summary>
	/// Number of algorithm steps to run at each frame.
	/// </summary>
	[Min(0)] public int algorithmStepsPerFrame;

	/// <summary>
	/// Angle at which agents rotate.
	/// </summary>
	[Range(0, 360)] public float agentRotationAngle;

	/// <summary>
	/// Distance between sensors and their agents.
	/// </summary>
	[Min(0)] public float sensorOffset;

	/// <summary>
	/// Angle of sensors relative to their agents.
	/// </summary>
	[Range(0, 360)] public float sensorAngle;

	/// <summary>
	/// Toggle trail map decay.
	/// </summary>
	public bool decay;

	/// <summary>
	/// Toggle trail map diffusion.
	/// </summary>
	public bool diffuse;

	/// <summary>
	/// Rate at which to decay trail map.
	/// Actual decay per algorithm step = decayRate * fixedDeltaTime (usually 0.02)
	/// </summary>
	[Min(0)] public float decayRate;

	/// <summary>
	/// Rate at which to diffuse trail map.
	/// Actual diffusion rate per algorithm step = diffuseRate * fixedDeltaTime (usually 0.02)
	/// E.g. final diffuse rate 50% -> equally weighted average between original and diffused trail values.
	/// </summary>
	[Min(0)] public float diffuseRate;

	/// <summary>
	/// Width of kernel used for trail map diffusion = 1 + 2 * kernelHalfWidth.
	/// Kernel dimensions will always be odd.
	/// </summary>
	[Min(0)] public int kernelHalfWidth;

	/// <summary>
	/// Chemoattractant value agents drop.
	/// </summary>
	[Min(0)] public int trailDeposit;

	/// <summary>
	/// Enable agent collision.
	/// </summary>
	public bool agentCollision;

	/// <summary>
	/// Initializes algorithm and compute shader parameters.
	/// </summary>
	void Init()
	{
		// Create trail map
		trailMap = new RenderTexture(width, height, 0) 
		{
			enableRandomWrite = true,
			filterMode = FilterMode.Bilinear
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
		Agent[] agents = new Agent[bufferMaxAgentCount ? 65535 : agentCount];
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

		// Set initial parameters in compute shader
		algorithmComputeShader.SetInt("width", width);
		algorithmComputeShader.SetInt("height", height);
		UpdateSettings();
	}

	/// <summary>
	/// Updates settings in compute shader to match editor values.
	/// </summary>
	private void UpdateSettings()
	{
		algorithmComputeShader.SetInt("width", width);
		algorithmComputeShader.SetInt("height", height);
		algorithmComputeShader.SetFloat("deltaTime", Time.fixedDeltaTime);
		algorithmComputeShader.SetFloat("time", Time.fixedTime);
		algorithmComputeShader.SetInt("agentCount", agentCount);
		algorithmComputeShader.SetFloat("moveSpeed", moveSpeed);
		algorithmComputeShader.SetFloat("agentRotationAngle", agentRotationAngle);
		algorithmComputeShader.SetFloat("sensorOffset", sensorOffset);
		algorithmComputeShader.SetFloat("sensorAngle", sensorAngle);
		algorithmComputeShader.SetFloat("decayRate", decay ? decayRate : 0);
		algorithmComputeShader.SetFloat("diffuseRate", diffuse ? diffuseRate : 0);
		algorithmComputeShader.SetInt("kernelHalfWidth", kernelHalfWidth);
		algorithmComputeShader.SetInt("trailDeposit", trailDeposit);
		algorithmComputeShader.SetBool("agentCollision", agentCollision);
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
	void FixedUpdate()
	{
		for (int i = 0; i < algorithmStepsPerFrame; i++) 
		{
			UpdateSettings();
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