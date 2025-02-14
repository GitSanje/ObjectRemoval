"use client"
import React, { createContext } from 'react'
import { modelInputProps, modelScaleProps } from '../helpers/Interfaces';
import { Tensor } from 'onnxruntime-web';


interface contextProps {
    clicks: [
      clicks: modelInputProps[] | null,
      setClicks: (e: modelInputProps[] | null) => void
    ];
    image: [
      image: HTMLImageElement | null,
      setImage: (e: HTMLImageElement | null) => void
    ];
    maskImg: [
      maskImg: HTMLImageElement | null,
      setMaskImg: (e: HTMLImageElement | null) => void
    ];
    isremove: [isremove : boolean,
      setIsremove: (isremove:boolean) => void];
      maskoutput: [maskoutput : Tensor|null,
        setMaskOutput: (maskoutput:Tensor |null) => void];
        modelScale: [modelScale:modelScaleProps |null, setModelScale:(modelScale:modelScaleProps |null )=> void] 
  }
  
  
  const AppContext = createContext<contextProps | null>(null);

export default AppContext;
  

