import { Tensor } from "onnxruntime-web";
import { extractImgData } from "./imgUtils";

async function arrayToImageMask(url: URL, mask: Tensor) {
  try {
    const data = await extractImgData(url);
    
     const [_, __, height, width] = mask.dims;
     console.log(mask.dims,data.length,mask.data.length);
     
    if (height * width !== mask.data.length) {
      throw new Error("Mask dimensions do not match expected size.");
    }
     
    const maskarr = new Uint8ClampedArray(data.length).fill(0);
    for (let index = 0; index < mask.data.length; index++) {
      const isMasked = (mask.data[index] as number) > 0;
      if (isMasked) {
        // Copy RGB values from original image
        maskarr[4 * index + 0] = data[4 * index + 0]; // Red
        maskarr[4 * index + 1] = data[4 * index + 1]; // Green
        maskarr[4 * index + 2] = data[4 * index + 2]; // Blue
        maskarr[4 * index + 3] = 255; // Fully opaque
      } else {
        // Make the background transparent
        maskarr[4 * index + 3] = 0; // Fully transparent
      }
    }
    const imgData = new ImageData(maskarr, mask.dims[3],mask.dims[2] );

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = imgData.width;
    canvas.height = imgData.height;
    ctx?.putImageData(imgData, 0, 0);

    const image = new Image();
    image.src = canvas.toDataURL();
    return image;
  } catch (error) {
    console.log(error);
  }
}

export { arrayToImageMask };
