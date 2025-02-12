
import Sam from '@/components/sam'
import { ensureDirectory } from '@/lib';
import path from 'path';
import React from 'react'

const page = async() => {
  
  // const filePath = path.resolve('.', 'data', 'dogs.jpg');
  const publicPath = path.join(process.cwd(), 'public/data/images');
  await ensureDirectory(publicPath)
  
  return (
    <div>

      
        <Sam/>
      
    </div>
  )
}

export default page
