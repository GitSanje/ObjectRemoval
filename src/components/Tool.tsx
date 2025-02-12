"use client"
import React, { useContext, useEffect, useState } from "react";
import AppContext from "./hooks/createContext";
import { ToolProps } from "./helpers/Interfaces";
import Image from "next/image";
import {Star} from 'lucide-react'

import * as _ from "underscore";

const Tool = ({ handleMouseMove }: ToolProps) => {

    const {
      clicks:[clicks, setClicks],
        image: [image],
        maskImg: [maskImg, setMaskImg],
      } = useContext(AppContext)!;
  const [imageScale,setImageScale] = useState<number>(0)
      
  // Determine if we should shrink or grow the images to match the
  // width or the height of the page and setup a ResizeObserver to
  // monitor changes in the size of the page

  const [shouldFitToWidth, setShouldFitToWidth] = useState(true);
 
  const fitToPage = () => {
    if (!image) return;
    const imageAspectRatio = image.width / image.height;
    const screenAspectRatio = window.innerWidth / window.innerHeight;
    setShouldFitToWidth(imageAspectRatio > screenAspectRatio);
  };


  useEffect(() => {
    const bodyEl = document.body;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === bodyEl) {
          fitToPage();
        }
      }
    });
    fitToPage();
    resizeObserver.observe(bodyEl);
    return () => {
      resizeObserver.unobserve(bodyEl);
    };
  }, [image]);

  const imageClasses = "";
  const maskImageClasses = `absolute opacity-40 pointer-events-none`;

  const handleClick = (e:any)=> {
    let el = e.nativeEvent.target;

    const rect = el.getBoundingClientRect();

    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    const imageScale = image ? image.width / el.offsetWidth : 1;
    setImageScale(imageScale)
    x *= imageScale;
    y *= imageScale;
    const clickType =1
    console.log('handleclick', clicks);
    
    if(clicks){
     
      setClicks([...clicks, { x, y ,clickType}]);
    }else{
      setClicks([{ x, y ,clickType}])
    }
   

  }
  // Render the image and the predicted mask image on top

  return (

    <>
{/* <div className="relative inline-block"> */}
    {
        image && (
            <img
            // onMouseMove={handleMouseMove}
            // onMouseOut={() => _.defer(() => setMaskImg(null))}
            onTouchStart={handleMouseMove}
            onClick={handleClick}
            src={image.src}
            className={`${
              shouldFitToWidth ? "w-full" : "h-full"
            } ${imageClasses}`}
            alt="none"
            >
              </img>

        )


    }
    
    {clicks?.map((click, index) => (
        <div
          key={index}
          className="absolute text-white text-xl"
          style={{
            left: `${click.x/imageScale}px`,
            top: `${click.y/imageScale}px`,
            transform: "translate(-50%, -50%)",
            color:"red"
          }}
        >
         
          <Star />
        </div>
      ))}

    {maskImg && (
        <img
          src={maskImg.src}
          className={`${
            shouldFitToWidth ? "w-full" : "h-full"
          } ${maskImageClasses}`}
          alt="mask Image"
        ></img>
      )}
      {/* </div> */}

    </>
  )



}

export default Tool