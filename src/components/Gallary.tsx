import Link from "next/link";
import React from "react";

interface GalleryProps {
  files: string[];
}

const Gallery: React.FC<GalleryProps> = ({ files }) => {
  return (
    <>
        <div className="text-3xl md:text-xl font-bold text-start text-gray-400 mb-6">
        📸 Find a photo in the gallery, or upload it
      </div>
    
 
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
    

      {files.map((file, index) => (
        <Link href={`/mask_create?fname=${file}`} key={index}>
        <div key={index} className="relative overflow-hidden rounded-lg shadow-md" >
          
          { (['jpg', 'png', 'jpeg'].includes(file.split('.')[1])) ?
            <img
              src={`/data/images/${file}`} 
              alt={`Uploaded ${index}`}
              className="w-full h-full object-cover rounded-lg hover:scale-105 transition-transform duration-300"
            />: ''
          }
        </div>
        </Link>
      ))}
    </div>
    </>
  );
};

export default Gallery;

