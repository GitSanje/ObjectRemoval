"use client"
import React, { useContext, useEffect, useState } from "react";
import AppContext from "./hooks/createContext";
import { ToolProps } from "./helpers/Interfaces";
import Image from "next/image";

import * as _ from "underscore";

const Tool = ({ handleMouseMove }: ToolProps) => {

    const {
        image: [image],
        maskImg: [maskImg, setMaskImg],
      } = useContext(AppContext)!;

      
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

  // Render the image and the predicted mask image on top

  return (

    <>

    {
        image && (
            <img
            onMouseMove={handleMouseMove}
            onMouseOut={() => _.defer(() => setMaskImg(null))}
            onTouchStart={handleMouseMove}
            src={image.src}
            className={`${
              shouldFitToWidth ? "w-full" : "h-full"
            } ${imageClasses}`}
            alt="none"
            >
              </img>

        )


    }
    

    {maskImg && (
        <img
          src={maskImg.src}
          className={`${
            shouldFitToWidth ? "w-full" : "h-full"
          } ${maskImageClasses}`}
          alt="mask Image"
        ></img>
      )}

    </>
  )



}

export default Tool