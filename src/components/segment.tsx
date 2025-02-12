"use client"
import React, { useContext, useEffect, useState } from "react";
import { InferenceSession, Tensor } from "onnxruntime-web";

const ort = require("onnxruntime-web");

/* @ts-ignore */
import npyjs from "npyjs";
import { handleImageScale } from "./helpers/scaleHelper";
import { modelScaleProps } from "./helpers/Interfaces";
import AppContext from "./hooks/createContext";
import { modelData } from "./helpers/onnxModelAPI";
import { onnxMaskToImage } from "./helpers/maskUtils";
import Stage from "./Stage";


// Define image, embedding and model paths
const IMAGE_PATH = "data/dogs.jpg";
const IMAGE_EMBEDDING = "data/dogs_embedding.npy";
const MODEL_DIR = "data/model/sam_onnx_quantized_example.onnx";


const Segment = () => {

      // The ONNX model expects the input to be rescaled to 1024. 
  // The modelScale state variable keeps track of the scale values.
  const [modelScale, setModelScale] = useState<modelScaleProps | null>(null);
  const [model, setModel] = useState<InferenceSession | null>(null); // ONNX model
  const [tensor, setTensor] = useState<Tensor | null>(null); // Image embedding tensor
  const [imagetensor,setImgTenser] = useState<Tensor | null>(null); 

  const {
    clicks: [clicks],
    image: [, setImage],
    maskImg: [, setMaskImg],
  } = useContext(AppContext)!;

  
  // Initialize the ONNX model. load the image, and load the SAM
  // pre-computed image embedding
  useEffect(() => {
    // Initialize the ONNX model
    const initModel = async () => {
      try {
        if (MODEL_DIR === undefined) return;
        const URL: string = MODEL_DIR;
        const model = await InferenceSession.create(URL);
        setModel(model);
      } catch (e) {
        console.log(e);
      }
    };
    initModel();
// Load the image
const url = new URL(IMAGE_PATH, location.origin);
loadImage(url);


Promise.resolve(loadNpyTensor(IMAGE_EMBEDDING, "float32")).then(
    (embedding) => setTensor(embedding)
  );
  },[])
    const loadImage = async(url: URL) => {
        try {
          if (
            model === null ||
            clicks === null ||
            tensor === null ||
            modelScale === null
          )
            return;
            const img = new Image()

            img.src = url.href;
            
            img.onload = async () => {
                const { height, width, samScale } = handleImageScale(img);
                setModelScale({
                    height: height,  // original image height
                    width: width,  // original image width
                    samScale: samScale, // scaling factor for image which has been resized to longest side 1024
                  });

                img.width = width; 
                img.height = height; 
                setImage(img);

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");

                if(ctx){
                  ctx.drawImage(img,0,0,width,height);
                  const imageData = ctx.getImageData(0,0,width,height)

                  const { data } = imageData;

                  const float32Array  = new Float32Array(width*height*3);

                  for (let i = 0; i < width * height; i++) {
                    float32Array[i] = data[i * 4] / 255; 
                    float32Array[i + width * height] = data[i * 4 + 1] / 255;
                    float32Array[i + 2 * width * height] = data[i * 4 + 2] / 255;

                  }

                  const imgtensor = new Tensor("float32", float32Array,[1,3,width,height])
                  setImgTenser(imgtensor)
                  const feeds = { input: imgtensor! };
                  const results = await model.run(feeds);
                  const embedding = results?.output.data;
                  console.log("Extracted results data:", results,embedding,model,img);
                  saveEmbeddingToFile(embedding as Float32Array, "dogs_embedding.json");
      
               
                 
          
                }
               
            }

        
            
            
        } catch (error) {
            console.log(error);
        }

    }

    function saveEmbeddingToFile(data: Float32Array, filename: string) {
      const jsonData = JSON.stringify(Array.from(data));
      const blob = new Blob([jsonData], { type: "application/json" });
    
      // Create a downloadable link
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
     // Decode a Numpy file into a tensor. 
     const loadNpyTensor = async( tensorFile: string, dType:string)=> {
        let npLoader = new npyjs();
        const npArray = await npLoader.load(tensorFile);
        const tensor = new ort.Tensor(dType, npArray.data, npArray.shape);
       return tensor;
     }

     // Run the ONNX model every time clicks has changed
  // useEffect(() => {
  //   runONNX();
  // }, [clicks]);

  
  const runONNX = async () => {
    try {
        if (
            model === null ||
            clicks === null ||
            tensor === null ||
            modelScale === null
          )
            return;

            else{
            // Preapre the model input in the correct format for SAM. 
            // The modelData function is from onnxModelAPI.tsx.
              // The modelData function is from onnxModelAPI.tsx.
            const feeds = modelData({
                clicks,
                tensor,
                modelScale,
            });
            if (feeds === undefined) return;
            // Run the SAM ONNX model with the feeds returned from modelData()
            const results = await model.run(feeds);

            const output = results[model.outputNames[0]];
            // The predicted mask returned from the ONNX model is an array which is 
        // rendered as an HTML image using onnxMaskToImage() from maskUtils.tsx.
            setMaskImg(onnxMaskToImage(output.data, output.dims[2], output.dims[3]));
            }



        
    } catch (error) {
        console.log(error);
    }
  }

  return (
    <div>
      <Stage />
    </div>
  )
}

export default Segment
