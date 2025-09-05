from fastapi import FastAPI,File, UploadFile
from fastapi.responses import FileResponse,StreamingResponse
import cv2
import torch
import numpy as np
#for segmentation /mask generation
from segment_anything import sam_model_registry, SamPredictor
# for inpainting
from simple_lama_inpainting import SimpleLama
from io import BytesIO
from PIL import Image
import os
#https://github.com/luca-medeiros/lang-segment-anything/tree/main
from lang_sam import LangSAM


app =FastAPI()

#uvicorn app:app --host 0.0.0.0 --port 8000 --reload
#uvicorn main:app --reload


sam_checkpoint = "../Inpaint-anything/pretrained_models/sam_vit_b_01ec64.pth"
model_type = "vit_b"


simple_lama = SimpleLama()
lang_sam = LangSAM()


EMBEDDING_DIR = "embeddings"
os.makedirs(EMBEDDING_DIR,exist_ok=True)


def inpaint(image_pil, mask):
    kernel_size = 5
    dilation_size = 50 
        
    kernel = np.ones((kernel_size,kernel_size),np.uint8) 
    dilation= np.ones((dilation_size, dilation_size), np.uint8)
    
    closed_mask=  cv2.morphologyEx(np.array(mask),cv2.MORPH_CLOSE, kernel)
    dilated_mask=  cv2.dilate(closed_mask,dilation)

    mask_pil = Image.fromarray(dilated_mask*255).convert('L')
    result_pil  = simple_lama(image_pil, mask_pil)
    return result_pil


@app.post("/upload/")
async def extract_embedding(file: UploadFile= File(...)):
    try:
        sam = sam_model_registry[model_type](checkpoint=sam_checkpoint)

        sam_predictor = SamPredictor(sam)
        image_bytes = await file.read()
        image = Image.open(BytesIO(image_bytes)).convert('RGB')
        
        image_np = np.array(image)
        sam_predictor.set_image(image_np)
        
        # Extract embeddings
        image_embedding  = sam_predictor.get_image_embedding().cpu().numpy()
        
        file_name = f"{file.filename.split('.')[0]}_embedding.npy"
        file_path = os.path.join(EMBEDDING_DIR, file_name)
        
        
        file_buff = BytesIO()
        np.save(file_buff, image_embedding)
        file_buff.seek(0)
        
        
        #return {"message": "Embedding saved", "path": f"/download/{file.filename.split('.')[0]}_embedding.npy"}
        
        return StreamingResponse(file_buff,
            media_type="application/octet-stream",
            #  headers={"Content-Disposition": f"attachment; filename={file_name}"}
            )
        
    except Exception as e:
        return {"error": str(e)}
    
@app.get("/download/{filename}")
async def download_embedding(filename: str):
    file_path = os.path.join(EMBEDDING_DIR, filename)
      
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="application/octet-stream",filename=filename)
    
    return {"error": "File not found"}

@app.post("/inpaint/")
async def Inpaint(
    image: UploadFile = File(...),
    mask: UploadFile = File(...)
):
    try:
        image_bytes = await image.read()
        mask_bytes = await mask.read()
        
        image_pil = Image.open(BytesIO(image_bytes)).convert("RGB")
        mask_pil = Image.open(BytesIO(mask_bytes)).convert("L")
        
        result_pil= inpaint(image_pil, mask_pil)
        # Convert PIL Image to bytes for response
        img_io = BytesIO()
        result_pil.save(img_io, format="png")
        img_io.seek(0)
        return StreamingResponse(img_io,media_type="image/png")
    except Exception as e:
        return {"error": str(e)}
    
@app.post("/inpaint_prompt/")
async def InpaintWithPrompt(
    image: UploadFile = File(...),
    prompt: UploadFile = File(...)
        ):
    try:
       
        image_bytes = await image.read()
        image_pil = Image.open(BytesIO(image_bytes)).convert('RGB')
        
        prompt_text = await prompt.read()
        prompt_text = prompt_text.decode('utf-8')
        results = lang_sam.predict([image_pil], [prompt_text])
        mask = []
        if(len(results[0]['masks']) > 1):
            mask.append(results[0]['masks'][1])
        else:
            mask.append(results[0]['masks'][0])
        
        # del lang_sam
        # torch.cuda.empty_cache()
        result_pil= inpaint(image_pil,  mask[0])
        
        # Convert PIL Image to bytes for response
    
        img_byte_arr = BytesIO()
        result_pil.save(img_byte_arr, format='png')
        img_byte_arr.seek(0)
        return StreamingResponse(img_byte_arr,media_type="image/png")
    except Exception as e:
        return {"error": str(e)}
    
        
    
    
     
    