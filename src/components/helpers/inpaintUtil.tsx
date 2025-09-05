import { Tensor } from "onnxruntime-web";
import { generateMask, getImageBlob } from "./imgUtils";
import { SendToInpaint } from "@/actions";

export const getInpaintImage = async (
  image: HTMLImageElement |null,

  fname: string,
  mask?: Tensor,
  prompt?:string
) => {
  try {
    console.log(prompt,'from client');
    
    if(!image) return
    const mname = `${fname.split(".")[0]}_mask.png`;
    fname = `${fname.split(".")[0]}.png`;

    const formData = new FormData();
    const img_blob = await getImageBlob(image);
    if (!img_blob) return;
    formData.append("image", img_blob, fname);
    if(prompt){
      const promptBlob = new Blob([prompt], { type: 'text/plain' });
      formData.append("prompt",promptBlob, 'prompt.txt');
    }else{
      const mask_blob = await generateMask(mask!);
      formData.append("mask", mask_blob, mname);
    }
   

   const res =  await SendToInpaint(formData);
   return res


  } catch (error) {}
};
