"use server"
import fs, { mkdir } from "fs/promises";

/* @ts-ignore */
import npyjs from "npyjs";
import { Tensor } from "onnxruntime-web";
import path from "path";
/* @ts-ignore */
import * as ort from 'onnxruntime-node';


export const fileExists = async (pathToFileOrDir: string): Promise<boolean> => {
    try {
       pathToFileOrDir = path.join(process.cwd(), pathToFileOrDir)
      await fs.stat(pathToFileOrDir);
      return true; // File or directory exists
    } catch (error) {
      return false; // File or directory does not exist
    }
  };
  
  export async function ensureDirectory(dirPath: string) {
    if (!(await fileExists(dirPath))) {
      const res = await mkdir(dirPath, { recursive: true });
      if(res){
        console.log('====================================');
        console.log(`Successfully created ${dirPath}`);
        console.log('====================================');
      }
       
    }
  }


export async function saveEmbedding(tensorJson:any, filename:string) {
  // ensureDirectory(filename)
  filename = path.join(process.cwd(), filename)
  await fs.writeFile(filename, JSON.stringify(tensorJson))
  console.log("Successfully saved the tensor data as JSON file", filename);
}


export  const loadJsonToTensor = async (jsonPath: string): Promise<ort.Tensor> => {
   
  const jsonEmbPath = path.join(process.cwd(), jsonPath)
  const jsonData = await fs.readFile(jsonEmbPath,'utf-8');

  const tensorData = JSON.parse(jsonData);

    // Validate the required properties
    if (!tensorData.data || !tensorData.shape || !tensorData.type) {
        throw new Error('Invalid tensor JSON format. Must contain data, shape, and type properties.');
    }
    let typedData;
    switch (tensorData.type.toLowerCase()) {
        case 'float32':
            typedData = new Float32Array(Object.values(tensorData.data));
            break;
        case 'float64':
            typedData = new Float64Array(tensorData.data);
            break;
        case 'int32':
            typedData = new Int32Array(tensorData.data);
            break;
        case 'int64':
            typedData = new BigInt64Array(tensorData.data.map(BigInt));
            break;
        case 'uint8':
            typedData = new Uint8Array(tensorData.data);
            break;
        case 'int8':
            typedData = new Int8Array(tensorData.data);
            break;
        default:
            throw new Error(`Unsupported data type: ${tensorData.type}`);
    }

    return {
      data: typedData,
      shape: tensorData.shape
    }


}
