"use client"

import { useState } from "react"
import Image from "next/image"
import { Upload, Paintbrush, MousePointer, MessageSquare, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const ObjectRemovalApp = () => {
  const [activeTab, setActiveTab] = useState("draw")

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-8">Object Removal App</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Image Preview</CardTitle>
          <CardDescription>Upload your image and see the before and after results</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-between space-x-4">
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-2">Before</h2>
            <Image
              src="/data/examples/img.jpg"
              width={400}
              height={300}
              alt="Original image"
              className="rounded-lg object-cover w-full h-64"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-2">After</h2>
            <Image
              src="/data/examples/img_output.png"
              width={400}
              height={300}
              alt="Processed image"
              className="rounded-lg object-cover w-full h-64"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">
            <Upload className="mr-2 h-4 w-4" /> Upload Image
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to Remove an Object from Your Image</CardTitle>
          <CardDescription>Choose a method to remove objects from your image</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="draw">Draw Mode</TabsTrigger>
              <TabsTrigger value="click">Click Mode</TabsTrigger>
              <TabsTrigger value="prompt">Zero-Shot Prompt</TabsTrigger>
            </TabsList>
            <TabsContent value="draw">
              <div className="space-y-4">
                <p className="text-sm text-gray-700">
                  Create a mask around the object you want to remove by drawing over it. Once you finish drawing, click{" "}
                  <strong>Finish</strong> and then click <strong>Inpaint</strong> to remove the object.
                </p>
                <div className="flex justify-between space-x-4">
                  <Image
                    src="/data/examples/drawing.png"
                    width={200}
                    height={150}
                    alt="Drawing example"
                    className="rounded-lg object-cover"
                  />
                  <Image
                    src="/data/examples/finish.png"
                    width={200}
                    height={150}
                    alt="Finish example"
                    className="rounded-lg object-cover"
                  />
                </div>
                <Button className="w-full">
                  <Paintbrush className="mr-2 h-4 w-4" /> Start Drawing
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="click">
              <div className="space-y-4">
                <p className="text-sm text-gray-700">
                  Click on the object you want to remove. A star icon will appear to mark the target. Once marked, click
                  on <strong>Inpaint</strong> to generate the image with the object removed.
                </p>
                <div className="relative">
                  <Image
                    src="/data/examples/star.png"
                    width={400}
                    height={300}
                    alt="Click example"
                    className="rounded-lg object-cover w-full"
                  />
                </div>
                <Button className="w-full">
                  <MousePointer className="mr-2 h-4 w-4" /> Enable Click Mode
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="prompt">
              <div className="space-y-4">
                <p className="text-sm text-gray-700">
                  If you don't want to draw or select, just provide a zero-shot prompt, and the app will handle
                  everything end-to-end.
                </p>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Enter your prompt here, e.g., 'Remove the car from the image'"
                ></textarea>
                <Button className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" /> Process with Prompt
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Workflow Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal ml-6 space-y-2">
            <li>
              <strong>Upload your image</strong> using the button above.
            </li>
            <li>
              <strong>Choose a removal method</strong> from the tabs: Draw, Click, or Prompt.
            </li>
            <li>
              <strong>Follow the instructions</strong> for your chosen method.
            </li>
            <li>
              <strong>Click the Inpaint button</strong> to process your image.
            </li>
            <li>
              <strong>View and download</strong> your result in the "After" section.
            </li>
          </ol>
        </CardContent>
        <CardFooter>
          <Button className="w-full">
            <ArrowRight className="mr-2 h-4 w-4" /> Start Removing Objects
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default ObjectRemovalApp

