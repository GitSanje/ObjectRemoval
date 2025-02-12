"use client"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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
  X
} from "lucide-react"
import UploadImage from "./comp/upload-image"





export default function Page() {

 


    
    

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
              <Button variant="outline" className="flex-1">
                <ImageIcon className="h-4 w-4 mr-2" />
                Gallery
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Button variant="secondary" className="w-full justify-start bg-blue-50 hover:bg-blue-100 text-blue-600">
              <MousePointer2 className="h-4 w-4 mr-2" />
              Hover & Click
            </Button>
            <div className="text-xs text-muted-foreground px-2">
              Click an object one or more times.
              <br />
              Shift-click to remove regions.
            </div>
            <div className="flex gap-2 mt-2">
  <Button variant="outline" className="flex-1 flex flex-col items-center">
    <Plus className="h-8 w-6 mb-1" /> 
    <span className="text-sm">Add Mask</span>
  </Button>
  <Button variant="outline" className="flex-1 flex flex-col items-center">
    <Minus className="h-6 w-6 mb-1" />
    <span className="text-sm">Remove Area</span>
  </Button>
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
             <UploadImage/>
          </div>
        </main>
      </div>
    </div>
  )
}


