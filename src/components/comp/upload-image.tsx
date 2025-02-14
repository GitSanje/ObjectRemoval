"use client";
import { useState, useCallback, useTransition, useEffect, useContext } from "react";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
// import Image from "next/image";
import { Upload, X } from "lucide-react";
import { Progress } from "@radix-ui/react-progress";
import { Button } from "../ui/button";
import { uploadImage } from "@/actions";
import { toast } from "sonner";
import { LoadingSpinner } from "../ui/loading-sppiner";
import AppContext from "../hooks/createContext";
import { handleImageScale } from "../helpers/scaleHelper";

const UploadImage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isPending, startTransition] = useTransition();
  

  const {
    clicks: [clicks],
    image: [image, setImage],
    maskImg: [, setMaskImg],
    maskoutput:[maskoutput,setMaskOutput],
    modelScale: [modelScale, setModelScale] 
  } = useContext(AppContext)!;
 
    
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setFile(file);
    const objUrl = URL.createObjectURL(file)
    const url = new URL(objUrl, location.origin)
    loadImage(url);
    setError(null);
  }, []);

  
  const loadImage = async (url: URL) => {
    try {
      if(image && modelScale){
        return
      }
      const img = new Image() ;
      img.src = url.href;

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
      console.log(error);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return;

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadImage(formData);
        if (result?.success) {
          toast.success("Embedding successfully extracted!");
        }
      } catch (error) {
        setError((error as Error).message);

        setUploading(false);
      }
    });
  };

  useEffect(() => {
    if (file) {
      const uploadFile = async () => {
        await handleUpload();
      };
      uploadFile();
    }
  }, [file]);

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setProgress(0);
  };
  return (

    <>
  
    {
      isPending ? <LoadingSpinner/>:( <div className="space-y-4">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 cursor-pointer
            transition-colors duration-200 ease-in-out
            ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25"
            }
            ${error ? "border-red-500 bg-red-50" : ""}
          `}
        >
          <input {...getInputProps()} />
          {/* {preview ? (
            <div className="relative aspect-video">
              <Image
                src={preview || "/placeholder.svg"}
                alt="Upload preview"
                fill
                className="object-contain rounded-md"
              />
            </div>
          ) : ( */}
          <div className="text-center space-y-4">
            <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {isDragActive
                  ? "Drop your image here"
                  : "Drag & drop your image here"}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          </div>
        </div>
  
        {error && (
          <div className="text-sm text-red-500 flex items-center gap-2">
            <X className="w-4 h-4" />
            {error}
          </div>
        )}

        {
          image && (
            <div className="relative aspect-video">
              <img
                src={image.src || "/placeholder.svg"}
                alt="Upload preview"
               
                className="object-contain rounded-md"
              />
            </div>
          )
        }
  
        {/* {(file || uploading) && (
          <div className="space-y-4">
            {uploading && <Progress value={progress} className="h-1" />}
            <div className="flex gap-2">
              <Button onClick={handleUpload} disabled={uploading} className="flex-1">
                {uploading ? "Uploading..." : "Upload Image"}
              </Button>
              <Button variant="outline" onClick={handleClear} disabled={uploading}>
                Clear
              </Button>
            </div>
          </div>
        )} */}
      </div>)
    }
   
      </>
  );
  
};

export default UploadImage;
