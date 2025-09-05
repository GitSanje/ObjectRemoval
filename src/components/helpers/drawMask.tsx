'use client'
import { useRef, useState, useEffect, ChangeEvent, useContext } from "react";
import { Button } from "../ui/button";
import { convertToChannelFirst } from "./imgUtils";
import { Tensor } from "onnxruntime-web";
import AppContext from "../hooks/createContext";
import { toast } from "sonner";


export default function DrawMask({imageProp}:{
  imageProp?: HTMLImageElement
}) {


  
  const [image, setImage] = useState<ArrayBuffer | string | null>(imageProp?.src as string);
  const [brushSize, setBrushSize] = useState<number>(5);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef<boolean>(false);
  const lastPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [scale, setScale] = useState<number>(1);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isErasing, setIsErasing] = useState<boolean>(false); 

  const {

    maskoutput: [maskoutput,setMaskOutput],
  } = useContext(AppContext)!;




  // Handle image upload
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target?.files) return;
    const file = e.target?.files[0]!;
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const updateDimensions = () => {
    if (!image) return;

    const img = new Image();
    img.src =  image as string;

    img.onload = () => {
      const maxWidth = window.innerWidth * 0.9; // 90% of window width
      const maxHeight = window.innerHeight * 0.8; // 80% of window height

      const imageAspectRatio = img.width / img.height;
      let newWidth = img.width;
      let newHeight = img.height;

      
      // Scale down if image is larger than viewport
      if (newWidth > maxWidth || newHeight > maxHeight) {
     
        if (maxWidth / maxHeight < imageAspectRatio) {
          newWidth = maxWidth;
          newHeight = maxWidth / imageAspectRatio;
        } else {
          newHeight = maxHeight;
          newWidth = maxHeight * imageAspectRatio;
          
        }

        // Log the new calculated dimensions
      
      } else {
        console.log("Image fits within the viewport, no scaling needed.");
      }

      // Calculate the scale factor
      const newScale = newWidth / img.width;
     
      // Set the scale state (if you're using React state)
      setScale(newScale);

      setDimensions({
        width: Math.round(newWidth),
        height: Math.round(newHeight),
      });

      // Update both canvases
      const imgCtx = imgCanvasRef.current?.getContext("2d") as CanvasRenderingContext2D | null;
      const drawCtx = canvasRef.current?.getContext("2d") as CanvasRenderingContext2D | null;

      // Set physical canvas dimensions to original image size
      imgCanvasRef.current!.width = img.width;
      imgCanvasRef.current!.height = img.height;
      canvasRef.current!.width = img.width;
      canvasRef.current!.height = img.height;

      // Draw background image
      imgCtx?.clearRect(0, 0, img.width, img.height);
      imgCtx?.drawImage(img, 0, 0);

      // Clear drawing canvas
      drawCtx?.clearRect(0, 0, img.width, img.height);
    };
  };

  useEffect(() => {
    const handleResize = () => updateDimensions();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [image,imageProp]);

  useEffect(() => {
    updateDimensions();
  }, [image,imageProp]);

  // Drawing functions
  const getScaledCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    return {
      x: (e.clientX - (rect?.left ?? 0)) / scale,
      y: (e.clientY - (rect?.top ?? 0)) / scale,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const coords = getScaledCoords(e);
    lastPos.current = coords;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const coords = getScaledCoords(e);
    const ctx = canvasRef.current?.getContext("2d");

    if (isErasing) {
        //coords.x - brushSize / 2 gives the x-coordinate of the center of the brush
        ctx?.clearRect(coords.x - brushSize / 2, coords.y - brushSize / 2, brushSize, brushSize);
      } else {
        ctx!.strokeStyle = "red";
        ctx!.lineWidth = brushSize;
        ctx!.lineCap = "round";
  
        ctx!.beginPath();
        ctx!.moveTo(lastPos.current.x, lastPos.current.y);
        ctx!.lineTo(coords.x, coords.y);
        ctx!.stroke();
      }
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  // Save drawn mask
  const saveImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    const imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i] > 0  ? 255: 0;     
        const g = imageData.data[i + 1]  >0  ? 255: 0; 
        const b = imageData.data[i + 2]  >0  ? 255: 0; 
        imageData.data[i] = r;       // Red
        imageData.data[i + 1] = g;   // Green
        imageData.data[i + 2] = b;
        imageData.data[i + 3] = 255;
    }

    
    ctx.putImageData(imageData, 0, 0);

    const dataURL = canvas?.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL ?? "";
    link.download = "mask.png";
    link.click();
  };

  const handleFinish = async () => {

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d') 

    if (!canvas || !ctx) return;
    const imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
    const float32Array =   convertToChannelFirst(imageData.data,imageData.width,imageData.height);

     const imgTensor = new Tensor("float32", float32Array, [1, 3,imageData.height,imageData.width]);

     setMaskOutput(imgTensor)
     toast.success("Successfully generated the mask, Now inpaint it!")
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-5 bg-gray-100 min-h-screen">
     { imageProp ?  '' : <input type="file" onChange={handleImageUpload} accept="image/*" className="mb-2" />} 

      <div className="relative" style={{ width: dimensions.width, height: dimensions.height }}>
        <canvas
          ref={imgCanvasRef}
          className="absolute top-0 left-0"
          style={{
            width: dimensions.width,
            height: dimensions.height,
          }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0"
          style={{
            width: dimensions.width,
            height: dimensions.height,
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>

      <div className="flex space-x-4">
        <label className="flex items-center">
          Brush Size:
          <input
            type="range"
            min="1"
            max="100"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="ml-2"
          />
        </label>
        <button
          onClick={() => setIsErasing(!isErasing)}
          className={`px-4 py-2 rounded ${isErasing ? 'bg-red-500' : 'bg-blue-500'} text-white hover:bg-opacity-80`}
        >
          {isErasing ? "Switch to Drawing" : "Switch to Erasing"}
        </button>

        { imageProp ? 
        <Button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={handleFinish}>
          Finish
        </Button>: 
         <button onClick={saveImage} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Save Mask
        </button> }
        
      </div>
    </div>
  );
}
