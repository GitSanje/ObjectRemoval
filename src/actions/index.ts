"use server"



// import { put } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import path from "path"
import fs from "fs/promises";
import { ensureDirectory, fileExists } from "@/lib";

   
export async function uploadImage(data: FormData) {
  try {
    const file = data.get("file") as File
    const publicPath = path.join(process.cwd(), 'public/data/images');
    if( await fileExists(publicPath+"/"+file.name)){
        return 
    }
    if (!file) {
      throw new Error("No file provided")
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image")
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size must be less than 5MB")
    }

     const bytes = await file.arrayBuffer();
     const buffer = Buffer.from(bytes);

     
     const filePath = path.join(publicPath, `${file.name}`);
     await fs.writeFile(filePath, buffer);
    // const blob = await put(file.name, file, {
    //   access: "public",
    //   addRandomSuffix: true,
    // })

    revalidatePath("/")
    return {success:true, url: `public/data/images/${path.basename(filePath)}` };
  } catch (e) {
    console.error(e)
    return { error: (e as Error).message }
  }
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
    const fullPath = path.join(ouputDir,img.name)
    
    const imageBlob = await res.blob();
    const arrayBuffer =  Buffer.from(await imageBlob.arrayBuffer())

    fs.writeFile(fullPath,arrayBuffer )
    const imageUrl = `/data/outputs/${img.name}`;


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