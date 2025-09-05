"use client";
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
import { fileExists, loadJsonToTensor } from "@/lib";
import path from "path";
import { getImgName, ImageEmbedding } from "./helpers/saveImageEmbedding";
import { LoadingSpinner } from "./ui/loading-sppiner";

// Define image, embedding and model paths
// const IMAGE_PATH = "data/dogs.jpg";
// const IMAGE_EMBEDDING = "data/dogs_embedding.npy";
const MODEL_DIR = "data/model/sam_onnx_quantized_example.onnx";


const Segment = ({
 fname
}:{
  fname: string,


}) => {
  // The ONNX model expects the input to be rescaled to 1024.
  // The modelScale state variable keeps track of the scale values.

  const [model, setModel] = useState<InferenceSession | null>(null); // ONNX model
  const [tensor, setTensor] = useState<Tensor | null>(null); // Image embedding tensor
  const [loading, setLoading] = useState(false);

  const IMAGE_PATH= `/data/images/${fname}`
  const IMAGE_EMBEDDING= `/data/embeddings/${fname.split('.')[0]}_embedding.npy`

  

  

  const {
    clicks: [clicks],
    image: [image, setImage],
    maskImg: [, setMaskImg],
    maskoutput:[maskoutput,setMaskOutput],
    modelScale: [modelScale, setModelScale] 
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
        (e);
      }
    };
    initModel();

    // const loadembedding = async (url: URL) => {
    //   const embedPath = `public/data/images/${getImgName(
    //     url
    //   )}_onnx_embedding.json`;
    //   setLoading(true);
    //   if (!(await fileExists(embedPath))) {
    //    // Start loading
    
    //     try {
    //       const img_encoder_model = await InferenceSession.create(IMAGE_ENCODER_DIR);
    //       await ImageEmbedding(url, img_encoder_model);
    
    //       if (!(await fileExists(embedPath))) {
    //         throw new Error(`Failed to generate embedding: ${embedPath} does not exist after generation.`);
    //       }
    //     } catch (error) {
    //       console.error("Error while generating embedding:", error);
    //     } finally {
    //        // Stop loading when done
    //     }

    //   }
    //   const embeddingData = await loadJsonToTensor(embedPath);
    //   const tensor = new ort.Tensor(
    //     "float32",
    //     embeddingData.data,
    //     embeddingData.shape
    //   );
     
    //   setTensor(tensor);
    //   setLoading(false);
    // };

    // Load the image
    const url = new URL(IMAGE_PATH, location.origin);
 
    // loadembedding(url);
    loadImage(url);

    Promise.resolve(loadNpyTensor(IMAGE_EMBEDDING, "float32")).then(
        (embedding) => setTensor(embedding)
      );
  }, []);

  const loadImage = async (url: URL) => {
    try {
      // if(image && modelScale){
      //   return
      // }
      const img = new Image();
      img.src = url.href ;

      img.onload = async () => {
        const { height, width, samScale } = handleImageScale(img);
        
        
        setModelScale({
          height: height, // original image height
          width: width, // original image width
          samScale: samScale, // scaling factor for image which has been resized to longest side 1024
        });

        img.width = width;
        img.height = height;
        setImage(img);
     
      };
    } catch (error) {
      (error);
    }
  };

  // Decode a Numpy file into a tensor.
  const loadNpyTensor = async (tensorFile: string, dType: string) => {
    let npLoader = new npyjs();
    const npArray = await npLoader.load(tensorFile);
    const tensor = new ort.Tensor(dType, npArray.data, npArray.shape);

    return tensor;
  };



  // Run the ONNX model every time clicks has changed
  useEffect(() => {
    runONNX();
  }, [clicks]);
  console.log(clicks);
  

  const runONNX = async () => {
    try {
      if (
        model === null ||
        clicks === null ||
        tensor === null ||
        modelScale === null
      )
        return;
      else {
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
     
        setMaskOutput(output)
        setMaskImg(
          onnxMaskToImage(output.data, output.dims[2], output.dims[3])
        );
      }
    } catch (error) {
      (error);
    }
  };

  return (
    <div>
      {
        loading ? <LoadingSpinner/> :  <Stage />
      }
     
    </div>
  );
};

export default Segment;
