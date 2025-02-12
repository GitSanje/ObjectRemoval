import React from 'react'
import fs from "fs/promises"
import path from 'path';
import Gallery from '@/components/Gallary';

const dirPath = path.join(process.cwd(),"/public/data/images")

const files = await fs.readdir(dirPath);

const page = () => {
  return (
    <div>
        <Gallery files={files}/>
      
    </div>
  )
}

export default page
