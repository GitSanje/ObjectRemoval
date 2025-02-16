import { Tensor } from "onnxruntime-web";
import { generateMask, getImageBlob } from "./imgUtils";
import { SendToInpaint } from "@/actions";

export const getInpaintImage = async (
  image: HTMLImageElement |null,
  mask: Tensor,
  fname: string
) => {
  try {
    if(!image) return
    const mname = `${fname.split(".")[0]}_mask.png`;
    fname = `${fname.split(".")[0]}.png`;

    const formData = new FormData();
    const mask_blob = await generateMask(mask);
    const img_blob = await getImageBlob(image);
    if (!img_blob) return;
    formData.append("image", img_blob, fname);
    formData.append("mask", mask_blob, mname);

   const res =  await SendToInpaint(formData);
   return res


  } catch (error) {}
};
