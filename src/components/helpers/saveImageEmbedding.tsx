"use client"
import { saveEmbedding } from "@/lib";
import { InferenceSession, Tensor } from "onnxruntime-web";

const ImageEmbedding = async (url: URL, model: InferenceSession): Promise<void> => {
    return new Promise((resolve, reject) => {
      const IMAGE_SIZE = 1024;
      const img = new Image();
      img.src = url.href;
  
      img.onload = async () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = IMAGE_SIZE;
          canvas.height = IMAGE_SIZE;
  
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            return reject(new Error("Failed to get 2D context"));
          }
  
          ctx.drawImage(img, 0, 0, IMAGE_SIZE, IMAGE_SIZE);
  
          const imageData = ctx.getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE);
          const { data } = imageData;
          const float32Array = convertToChannelFirst(data, IMAGE_SIZE, IMAGE_SIZE);
  
          const imgTensor = new Tensor("float32", float32Array, [
            1,
            3,
            IMAGE_SIZE,
            IMAGE_SIZE,
          ]);
  
          const feeds = { input_image: imgTensor };
          const results = await model.run(feeds);
  
          const embedding = results?.image_embedding;
          if (!embedding) {
            return reject(new Error("Model did not return an embedding."));
          }
  
          const tensorJson = {
            shape: embedding.dims,
            type: embedding.type,
            data: embedding.data,
          };
  
          await saveEmbedding(
            tensorJson,
            `public/data/images/${getImgName(url)}_onnx_embedding.json`
          );
  
          resolve(); // Mark the promise as resolved
        } catch (error) {
          reject(error); // Catch and reject errors
        }
      };
  
      img.onerror = () => reject(new Error(`Failed to load image: ${url.href}`));
    });
  };
  

// const convertToChannelFirst = (
//   imageData: Uint8ClampedArray,
//   width: number,
//   height: number
// ): Float32Array => {
//   const channels = 3; // RGB
//   const float32Array = new Float32Array(channels * height * width);

//   for (let i = 0; i < height * width; i++) {
//     float32Array[i] = imageData[i * 4] / 255;
//     float32Array[i + height * width] = imageData[i * 4 + 1] / 255;
//     float32Array[i + 2 * height * width] = imageData[i * 4 + 2] / 255;
//   }

//   return float32Array;
// };

const convertToChannelFirst = (
    imageData: Uint8ClampedArray,
    width: number,
    height: number
  ): Float32Array => {
    const channels = 3; // RGB
    const float32Array = new Float32Array(channels * height * width);
  
    for (let i = 0; i < width * height; i++) {
      const pixelIndex = i * 4; // RGBA (4 channels per pixel)
      const rowIndex = i % width;
      const colIndex = Math.floor(i / width);
  
      float32Array[colIndex * width + rowIndex] = imageData[pixelIndex] / 255; // Red
      float32Array[height * width + colIndex * width + rowIndex] = imageData[pixelIndex + 1] / 255; // Green
      float32Array[2 * height * width + colIndex * width + rowIndex] = imageData[pixelIndex + 2] / 255; // Blue
    }
  
    return float32Array;
  };
  
const getImgName = (url: URL): string => {
  const base = url.pathname;
  const img_name = base.split("/").pop()?.split(".")[0]!;
  return img_name;
};

export { ImageEmbedding, getImgName };
