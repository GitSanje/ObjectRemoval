"use client";
import {
  useState,
  useCallback,
  useTransition,
  useEffect,
  useContext,
} from "react";
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
import { fileExists, getImageEmbedding } from "@/lib";

const UploadImage = ({ fromupload, setUpload }: { fromupload: boolean ,
  setUpload?: (upload:boolean)=> void
}) => {
  const [file, setFile] = useState<File | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    clicks: [clicks],
    image: [image, setImage],
    maskImg: [, setMaskImg],
    maskoutput: [maskoutput, setMaskOutput],
    modelScale: [modelScale, setModelScale],
  } = useContext(AppContext)!;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setFile(file);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const setParams = (name: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("fname", name);
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    );
    window.location.reload();
  };
  if(fromupload && setUpload){
    setUpload(isPending)
  }

  const handleUpload = async () => {
    if (!file) return;
   

    startTransition(async () => {
      try {
        if (
          await fileExists(
            `public/data/embeddings/${file.name.split(".")[0]}_embedding.npy`
          )
        ) {
          setParams(file.name);
          return;
        }

        // const params = new URLSearchParams(window.location.search);
        window.history.replaceState({}, "", `${window.location.pathname}`);

        const formData = new FormData();
        formData.append("file", file);

        const result = await getImageEmbedding(formData);

        if (result?.success) {
          setParams(file.name);
          toast.success("Embedding successfully extracted!");
        }
      } catch (error) {
        setError((error as Error).message);
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

  return (
    <>
      {isPending ? (
        fromupload ? (

          <div className="space-y-4">

      
          <Button variant="outline" className="flex-1">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          </div>
        ) : (
          <LoadingSpinner />
        )
      ) : (
        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={
              fromupload
                ? ""
                : `
              
              border-2 border-dashed rounded-lg p-6 cursor-pointer
              transition-colors duration-200 ease-in-out
              ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25"
              }
              ${error ? "border-red-500 bg-red-50" : ""}
            `
            }
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
            {fromupload ? (
              <Button variant="outline" className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            ) : (
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
            )}
          </div>

          {error && (
            <div className="text-sm text-red-500 flex items-center gap-2">
              <X className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* {
            image && (
              <div className="relative aspect-video">
                <img
                  src={image.src || "/placeholder.svg"}
                  alt="Upload preview"
                 
                  className="object-contain rounded-md"
                />
              </div>
            )
          } */}
        </div>
      )}
    </>
  );
};

export default UploadImage;
