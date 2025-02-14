"use server";
import fs, { mkdir, stat } from "fs/promises";

/* @ts-ignore */
import npyjs from "npyjs";
import { Tensor } from "onnxruntime-web";
import path, { join } from "path";
/* @ts-ignore */
import * as ort from "onnxruntime-node";
import { uploadImage } from "@/actions";

export const fileExists = async (pathToFileOrDir: string): Promise<boolean> => {
  try {
    pathToFileOrDir = path.join(process.cwd(), pathToFileOrDir);
    await fs.stat(pathToFileOrDir);
    return true; // File or directory exists
  } catch (error) {
    return false; // File or directory does not exist
  }
};

export async function ensureDirectory(dirPath: string) {
  if (!(await fileExists(dirPath))) {
    const res = await mkdir(dirPath, { recursive: true });
    if (res) {
      console.log("====================================");
      console.log(`Successfully created ${dirPath}`);
      console.log("====================================");
    }
  }
}

export async function saveEmbedding(tensorJson: any, filename: string) {
  // ensureDirectory(filename)
  filename = path.join(process.cwd(), filename);
  await fs.writeFile(filename, JSON.stringify(tensorJson));
  console.log("Successfully saved the tensor data as JSON file", filename);
}

export const loadJsonToTensor = async (
  jsonPath: string
): Promise<ort.Tensor> => {
  const jsonEmbPath = path.join(process.cwd(), jsonPath);
  const jsonData = await fs.readFile(jsonEmbPath, "utf-8");

  const tensorData = JSON.parse(jsonData);

  // Validate the required properties
  if (!tensorData.data || !tensorData.shape || !tensorData.type) {
    throw new Error(
      "Invalid tensor JSON format. Must contain data, shape, and type properties."
    );
  }
  let typedData;
  switch (tensorData.type.toLowerCase()) {
    case "float32":
      typedData = new Float32Array(Object.values(tensorData.data));
      break;
    case "float64":
      typedData = new Float64Array(tensorData.data);
      break;
    case "int32":
      typedData = new Int32Array(tensorData.data);
      break;
    case "int64":
      typedData = new BigInt64Array(tensorData.data.map(BigInt));
      break;
    case "uint8":
      typedData = new Uint8Array(tensorData.data);
      break;
    case "int8":
      typedData = new Int8Array(tensorData.data);
      break;
    default:
      throw new Error(`Unsupported data type: ${tensorData.type}`);
  }

  return {
    data: typedData,
    shape: tensorData.shape,
  };
};

export const saveImage = async (formData: FormData) => {
  try {
    const image = formData.get("image") as File | null;
    console.log(formData, image);

    if (!image) {
      throw new Error("No image provided.");
    }

    // Convert the file into a buffer
    const buffer = Buffer.from(await image.arrayBuffer());

    // Define the directory where the image should be saved
    const uploadDir = path.join(process.cwd(), "public", "data", "masks");

    // Define the full file path
    const filePath = path.join(uploadDir, image.name);
    await ensureDirectory("public/data/masks");
    // Write the file to the specified folder
    fs.writeFile(filePath, buffer);
    return {
      success: true,
      message: "Image saved successfully!",
      path: `/data/masks/${image.name}`,
    };
  } catch (error) {
    console.error("Error saving image:", error);
    return { success: false, message: "Failed to save image" };
  }
};

export const getImageEmbedding = async (formData: FormData) => {
  try {

    await uploadImage(formData)
    
    const uploadRes = await fetch("http://localhost:8000/upload/", {
      method: "POST",
      body: formData,
    });

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok || !uploadData.path) {
      throw new Error(uploadData.error || "Failed to upload image");
    }
    const embeddingPath = uploadData.path;
    const filename = embeddingPath.split("/").pop();
    const downloadRes = await fetch(
      `http://localhost:8000/download/${filename}`
    );

    const fullPath = path.join(
      process.cwd(),
      `/public/data/embeddings/${filename}`
    );
    const buffer = await downloadRes.arrayBuffer();

    await fs.writeFile(fullPath, Buffer.from(buffer));

    return { success: true, message: "Extracted embbeding!" };
  } catch (error) {
    return { success: false, message: error };
  }
};
