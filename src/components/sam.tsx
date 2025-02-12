"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Github,
  Upload,
  ImageIcon,
  MousePointer2,
  Plus,
  Minus,
  RotateCcw,
  Undo2,
  Redo2,
  Copy,
  Square,
  Sparkles,
  Scissors,
  X,
} from "lucide-react";
import UploadImage from "./comp/upload-image";
import { useContext } from "react";
import AppContext from "./hooks/createContext";
import Segment from "./segment";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const {
    clicks: [clicks,setClicks],
    image: [image],
    isremove: [isremove, setIsremove],
    maskImg: [, setMaskImg],
  } = useContext(AppContext)!;
  const searchParams = useSearchParams();

  const fname = searchParams.get("fname");

  const image_path = `/data/images/${fname}`;
  const embed_path = `/data/embeddings/${fname?.split(".")[0]}_embedding.npy`;
  const handleRemoveClick = () => {
    setIsremove(true)
    console.log(clicks);
    
    if(clicks&& clicks.length>0){
      const updatedClicks = [...clicks]; 
      updatedClicks.pop();
      setClicks(updatedClicks)
    }
    setIsremove(false)
  };
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-[260px] border-r p-4 flex flex-col gap-4">
          <div className="space-y-4">
            <h2 className="font-medium">Tools</h2>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              <Link href={"/gallary"}>
                <Button variant="outline" className="flex-1">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Gallery
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              variant="secondary"
              className="w-full justify-start bg-blue-50 hover:bg-blue-100 text-blue-600"
            >
              <MousePointer2 className="h-4 w-4 mr-2" />
              Hover & Click
            </Button>
            <div className="text-xs text-muted-foreground px-2">
              Click an object one or more times.
              <br />
              Shift-click to remove regions.
            </div>
            <div className="flex gap-2 mt-2">
            <div className="flex flex-col items-center">
  <Button
    variant="outline"
    className={`w-10 h-10 flex flex-col items-center justify-center 
      `}
    // onClick={() => setIsremove(!isremove)}
  >
    {/* ${isremove ? "fill-white" : "fill-blue-700"}  // ${isremove ? "bg-blue-700 text-blue-700" : "bg-white text-blue-700"} 
      // border border-blue-700 hover:none*/}
    <Plus className={`w-6 h-6 fill-white `} strokeWidth={5} />
  </Button>
  <span className="text-sm mt-2">Add Mask</span>
</div>

<div className="flex flex-col items-center">
  <Button
    variant="default"
    className={`w-10 h-10 flex flex-col items-center justify-center 
      ${isremove ? "bg-blue-700 text-white": "bg-white text-blue-700"  } 
      border border-blue-700 `}
    onClick={handleRemoveClick}
  > 
    <Minus className={`w-6 h-6 `} strokeWidth={5} />
  </Button>
  <span className="text-sm mt-2">Remove Area</span>
</div>


            </div>

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button variant="ghost" size="sm" className="flex-1">
                <Undo2 className="h-4 w-4 mr-2" />
                Undo
              </Button>
              <Button variant="ghost" size="sm" className="flex-1">
                <Redo2 className="h-4 w-4 mr-2" />
                Redo
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <Copy className="h-4 w-4 mr-2" />
              Multi-mask
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Scissors className="h-4 w-4 mr-2" />
              Cut out object
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <Square className="h-4 w-4 mr-2" />
              Box
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Sparkles className="h-4 w-4 mr-2" />
              Everything
            </Button>
          </div>

          <Separator />

          <Button variant="ghost" className="w-full justify-start">
            <Scissors className="h-4 w-4 mr-2" />
            Cut-Outs
          </Button>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4">
          <div className="max-w-5xl mx-auto">
            {/* <Image
              src="/data/dogs.jpg"
              alt="Horses running in a field"
              width={1200}
              height={800}
              className="rounded-lg border"
            /> */}

            {fname ? (
              <Segment
                IMAGE_PATH={image_path}
                IMAGE_EMBEDDING={embed_path as string}
              />
            ) : (
              <UploadImage />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
