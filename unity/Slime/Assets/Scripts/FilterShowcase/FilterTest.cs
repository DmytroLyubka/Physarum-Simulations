using System.Collections;
using UnityEngine;

public class FilterTest : MonoBehaviour
{
	public ComputeShader filterShader;
	private Texture2D image;
	
	private RenderTexture imageTexture;
	private RenderTexture filteredTexture;
	
	
	void Init()
	{
		filterShader.SetFloat("diffuseRate", 15);
		filterShader.SetInt("kernelHalfWidth", 2);
		filterShader.SetFloat("deltaTime", Time.fixedDeltaTime);
	}

    [System.Obsolete]
    IEnumerator load_image()
	{
		string path = System.IO.Path.GetFullPath("Assets/Scripts/FilterShowcase/sign_small.jpg");
		WWW www = new WWW("file://" + path);
		yield return www;
	
		www.LoadImageIntoTexture(image);
		Graphics.Blit(image, imageTexture);
	}

	// Start is called before the first frame update.
	void Start()
	{
		image = new Texture2D(867, 1758);
		imageTexture = new RenderTexture(867, 1758, 0) 
		{
			enableRandomWrite = true,
			filterMode = FilterMode.Bilinear
		};
		imageTexture.Create();
		
		filteredTexture = new RenderTexture(867, 1758, 0) 
		{
			enableRandomWrite = true,
			filterMode = FilterMode.Bilinear
		};
		filteredTexture.Create();
		
		StartCoroutine("load_image");
		
		// Set render output to trail map
		transform.GetComponentInChildren<MeshRenderer>().material.mainTexture = filteredTexture;
		
		filterShader.SetTexture(0, "imageTexture", imageTexture);
		filterShader.SetTexture(0, "filteredTexture", filteredTexture);
		filterShader.SetInt("width", imageTexture.width);
		filterShader.SetInt("height", imageTexture.height);
		
		Init();
	}


	int counter = 0;
	// Update is called once per frame.
	void FixedUpdate()
	{
		// if (counter < 200) 
		if (true)
		{
			Dispatch(filterShader, imageTexture.width, imageTexture.height, 1, kernelIndex: 0);
			Graphics.Blit(filteredTexture, imageTexture);
			counter++;	
		}
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
}