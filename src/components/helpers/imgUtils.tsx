import { saveImage } from "@/lib";
import { Tensor } from "onnxruntime-web";



export function extractImgData(url:URL, w?:number, h?:number):Promise<Uint8ClampedArray>{
  return new Promise ((resolve, reject) => {
    const image = new Image()
    image.src = url.href
    const width = w ? w : image.naturalWidth
    const height = h ? h : image.naturalHeight
    image.onload = async() => {

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx  = canvas.getContext('2d')
    if (!ctx) {
      return reject(new Error("Failed to get canvas context"));
    }
    ctx?.drawImage(image,0,0,width,height)    
    const imageData = ctx?.getImageData(0,0,width,height)
   
    resolve(imageData.data)

    }

    image.onerror = () => {
      reject(new Error("Failed to load image"));
    };

  })
}




export function generateMask(mask: Tensor): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const [_, __, height, width] = mask.dims;
      const maskarr = new Uint8ClampedArray(height * width * 4).fill(0);

      for (let index = 0; index < mask.data.length; index++) {
        const isMasked = (mask.data[index] as number) > 0;
        if (isMasked) {
          maskarr[4 * index + 0] = 255; // Red
          maskarr[4 * index + 1] = 255; // Green
          maskarr[4 * index + 2] = 255; // Blue
          maskarr[4 * index + 3] = 255; // Opaque

         } 
         else{
           // Non-masked area (Black)
        maskarr[4 * index + 0] = 0;   // Red
        maskarr[4 * index + 1] = 0;   // Green
        maskarr[4 * index + 2] = 0;   // Blue
        maskarr[4 * index + 3] = 255; // Opaque

         }
       
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return reject(new Error("Failed to create canvas context"));

      canvas.width = width;
      canvas.height = height;

      const imgData = new ImageData(maskarr, width, height);
      ctx.putImageData(imgData, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create Blob"));
      }, "image/png");
    } catch (error) {
      reject(error);
    }
  });
}

export async function saveMaskImage(mask: Tensor, fname:string){

  try {
    const  fullname = `${fname.split('.')[0]}_mask.png`
    const maskBlob = await generateMask(mask);
    const formData = new FormData();
    formData.append("image", maskBlob, fullname);
    const res=  await saveImage(formData)
    if(res.success){
      return { success: true, message: "Image saved successfully!", path: `/data/masks/$fullname}` }
    }


    
  } catch (error) {
    return { success: false, message: "Failed to save image" };
  }
}



export async function getImageBlob(imageElement: HTMLImageElement): Promise<Blob | null>{

  return new Promise ((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      resolve(null);
      return;
    }

    ctx.drawImage(imageElement,0,0);

    canvas.toBlob((blob) => {
      resolve(blob)
    },'image/png');




  })
}