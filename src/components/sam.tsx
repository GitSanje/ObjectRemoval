"use client";

import Link from "next/link";
import { toast } from "sonner";
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
  VenetianMask,
  Loader2,
} from "lucide-react";
import UploadImage from "./comp/upload-image";
import {
  Suspense,
  useContext,
  useEffect,
  useState,
  useTransition,
} from "react";
import AppContext from "./hooks/createContext";
import Segment from "./segment";

import { arrayToImageMask } from "./helpers/extractMask";
import { saveMaskImage } from "./helpers/imgUtils";

export default function Page() {
  const {
    clicks: [clicks, setClicks],
    image: [image],
    isremove: [isremove, setIsremove],
    maskImg: [, setMaskImg],
    maskoutput: [maskoutput],
  } = useContext(AppContext)!;

  const [isPending, startTransition] = useTransition();
  const [clickedObject, setClickedObject] = useState<string | null>(null);
  const [fname, setFname] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFname(params.get("fname"));
  }, []);

  const handleObjectClick = (objId: string) => {
    if (!objId) {
      // setClickedObject('');
      return;
    }
    setClickedObject(objId);
    setTimeout(() => {
      setClickedObject("");
    }, 150);
  };
  console.log(clickedObject, clickedObject === "redo");

  const [cutOutImg, setCutOutImg] = useState<string | null>(null);
  const [maskimggray, setMaskImgGray] = useState<string | null>(null);
  const image_path = `/data/images/${fname}`;
  const embed_path = `/data/embeddings/${fname?.split(".")[0]}_embedding.npy`;

  const handleRemoveClick = () => {
    setIsremove(true);

    if (!clicks || clicks.length == 0) {
      toast.success("No points are present", {});
    }

    if (clicks && clicks.length > 0) {
      const updatedClicks = [...clicks];
      updatedClicks.pop();
      setClicks(updatedClicks);
    }
    setTimeout(() => {
      setIsremove(false);
    }, 150);
  };

  const handleCutOutMask = async () => {
    const imgUrl = new URL(image_path, location.origin);

    if (!maskoutput) {
      toast.success("No mask has been created");
    }
    if (maskoutput && imgUrl) {
      const imgMask = await arrayToImageMask(imgUrl, maskoutput);

      setCutOutImg(imgMask?.src as string);
    }
  };

  const handleGenerateMask = async () => {
    startTransition(async () => {
      if (!maskoutput) {
        toast.success("No mask has been created");
        return;
      }
      const response = await saveMaskImage(maskoutput!, fname!);
      console.log(response);
      
      if (response?.success) {
        toast.success("Mask image has been saved!");
      }
      
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-[320px] border-r p-4 flex flex-col gap-4">
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

            <Button
              variant="secondary"
              className="w-full justify-start bg-blue-50 hover:bg-blue-100 text-blue-600"
              onClick={handleGenerateMask}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <VenetianMask
                  className="h-4 w-4 mr-2"
                  size={48}
                  strokeWidth={2}
                />
              )}
              {isPending ? "Generating..." : "Generate Mask"}
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
      ${isremove ? "bg-indigo-700 text-white" : "bg-white text-indigo-700"} 
      border border-indigo-700 `}
                  onClick={handleRemoveClick}
                  onMouseDown={() => setIsremove(true)}
                  onMouseUp={() => setIsremove(false)}
                  onMouseLeave={() => setIsremove(false)}
                >
                  <Minus className={`w-6 h-6 `} strokeWidth={5} />
                </Button>
                <span className="text-sm mt-2">Remove Area</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant={"default"}
                className={`flex flex-row items-center justify-center 
                ${
                  clickedObject === "reset"
                    ? "bg-indigo-700 text-white"
                    : "bg-white text-indigo-700"
                } 
                border border-indigo-700 `}
                onClick={() => handleObjectClick("reset")}
              >
                <RotateCcw className="h-4 w-4 mr-2" strokeWidth={5} />
                Reset
              </Button>
              <Button
                size="sm"
                variant={"default"}
                className={`flex flex-row items-center justify-center 
                ${
                  clickedObject === "undo"
                    ? "bg-indigo-700 text-white"
                    : "bg-white text-indigo-700"
                } 
                border border-indigo-700 `}
                onClick={() => handleObjectClick("undo")}
              >
                <Undo2 className="h-4 w-4 mr-2" strokeWidth={5} />
                Undo
              </Button>

              <Button
                size="sm"
                variant={"default"}
                className={`flex flex-row items-center justify-center 
                ${
                  clickedObject === "redo"
                    ? "bg-indigo-700 text-white"
                    : "bg-white text-indigo-700"
                } 
                border border-indigo-700 `}
                onClick={() => handleObjectClick("redo")}
              >
                <Redo2 className="h-4 w-4 mr-2" strokeWidth={5} />
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

            <div className="relative w-full flex flex-col items-center">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleCutOutMask}
              >
                <Scissors className="h-4 w-4 mr-2" />
                Cut out object
              </Button>

              {/* Animated Cut-Out Image Display */}
              {cutOutImg && (
                <div
                  className="mt-4 transition-all duration-500 transform scale-95  animate-fade-in"
                  style={{
                    maxWidth: "100%",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={cutOutImg!}
                    alt="Cut-Out Mask"
                    className="w-auto h-auto rounded-lg shadow-lg"
                  />
                </div>
              )}
            </div>
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
