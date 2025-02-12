"use client"
import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import Link from "next/link"
import Image from "next/image"
import { Upload, X } from "lucide-react"
import { Progress } from "@radix-ui/react-progress"
import { Button } from "../ui/button"
import { uploadImage } from "@/actions"

const UploadImage = () => {
    

const [ file, setFile] = useState<File | null>(null);
const [preview, setPreview] = useState<string | null>(null)
const [uploading, setUploading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [progress, setProgress] = useState(0)


const onDrop = useCallback(( acceptedFiles: File[]) => {
   const file = acceptedFiles[0];
   setFile(file)
   setPreview(URL.createObjectURL(file))
   setError(null)
},[])


const { getRootProps, getInputProps, isDragActive } = useDropzone({
  onDrop,
  accept: {
    "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
  },
  maxFiles: 1,
  multiple: false,
})

const handleUpload = async () => {
  if (!file) return

  try {
      setUploading(true)
      setError(null)

      // Simulate upload progress

      const progressInterval = setInterval(() => {
          setProgress((prev) => {
              if (prev >= 95) {
                  clearInterval(progressInterval)
                  return prev
                }
                return prev + 5

          })
      })

      const formData = new FormData()
      
      formData.append("file", file)
      const result = await uploadImage(formData)
      clearInterval(progressInterval)
      setProgress(100)

    if (result?.error) {
      throw new Error(result.error)
    }

    // Reset after successful upload
    setTimeout(() => {
      setFile(null)
      setPreview(null)
      setProgress(0)
      setUploading(false)
    }, 1000)

  } catch (e) {
      setError((e as Error).message)
      setProgress(0)
      setUploading(false)
  }


}

const handleClear = () => {
  setFile(null)
  setPreview(null)
  setError(null)
  setProgress(0)
}
  return (
    <div className="space-y-4">

      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 cursor-pointer
          transition-colors duration-200 ease-in-out
          ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
          ${error ? "border-red-500 bg-red-50" : ""}
        `}
      >
       
        <input {...getInputProps()} />
        {preview ? (
          <div className="relative aspect-video">
            <Image
              src={preview || "/placeholder.svg"}
              alt="Upload preview"
              fill
              className="object-contain rounded-md"
            />
          </div>
        ) : (
          <div className="text-center space-y-4">
            <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {isDragActive ? "Drop your image here" : "Drag & drop your image here"}
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
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

{(file || uploading) && (
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
      )}



      
    </div>
  )
}

export default UploadImage
