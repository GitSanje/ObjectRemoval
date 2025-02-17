"use server"


import { revalidatePath } from "next/cache"
import path from "path"
import fs from "fs/promises";
import { ensureDirectory, fileExists } from "@/lib";
import { ApiResponse } from "@/components/helpers/Interfaces";

export async function uploadImage(data: FormData):Promise<ApiResponse> {
  return new Promise(async (resolve, reject) => {
    try {
      const file = data.get("file") as File;
      
      if (!file) {
        return reject(new Error("No file provided"));
      }

      const publicPath = path.join(process.cwd(), 'public/data/images');
      const filePath = path.join(publicPath, file.name);

      // Check if file already exists
      try {
        await fs.access(filePath);
        return resolve({ success: false, message: "File already exists" });
      } catch {
        // File does not exist, continue with upload
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        return reject(new Error("File must be an image"));
      }

      // 5MB limit
      if (file.size > 5 * 1024 * 1024) {
        return reject(new Error("File size must be less than 5MB"));
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Ensure directory exists
      await fs.mkdir(publicPath, { recursive: true });

      // Write file
      await fs.writeFile(filePath, buffer);

      // Revalidate path if using Next.js (assuming this function exists)
      if (typeof revalidatePath === "function") {
        revalidatePath("/");
      }

      resolve({ success: true, message: `/public/data/images/${file.name}` });
    } catch (e) {
      console.error(e);
      reject(new Error((e as Error).message));
    }
  });
}

  
  


  

export async function SendToInpaint(formData:FormData){
  
  try {
  
    const res = await fetch('http://localhost:8000/inpaint/',{
      method: "POST",
      body: formData,
    })
    const ouputDir= path.join(process.cwd(),'/public/data/outputs')
    await ensureDirectory(ouputDir)
    if(res.ok){

    const img = formData.get('image') as File 
    const fname = new Date().getTime()+ '_'+ img.name;
    const fullPath = path.join(ouputDir,fname)
    
    const imageBlob = await res.blob();
    const arrayBuffer =  Buffer.from(await imageBlob.arrayBuffer())

    fs.writeFile(fullPath,arrayBuffer )
    const imageUrl = `/data/outputs/${fname}`;


    return {
      success: true,
      message: "Successfully genereted inpaint of image!",
      imageUrl: imageUrl,

      
    }; 
    
    }
    
  } catch (error) {
    console.log(error);
    return { success: false, message: "Failed to generate image inpaint!" };
    
    
  }
}