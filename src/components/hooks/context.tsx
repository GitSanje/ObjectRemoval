"use client"

import React, { useState } from "react";
import { modelInputProps } from "../helpers/Interfaces";
import AppContext from "./createContext";
import { Tensor } from "onnxruntime-web";

const AppContextProvider = (props: {
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
}) => {
  const [clicks, setClicks] = useState<Array<modelInputProps> | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [maskImg, setMaskImg] = useState<HTMLImageElement | null>(null);
  const [isremove, setIsremove] = useState<boolean>(false);
  const [maskoutput, setMaskOutput] = useState<Tensor| null>(null);

  return (
    <AppContext.Provider
      value={{
        clicks: [clicks, setClicks],
        image: [image, setImage],
        maskImg: [maskImg, setMaskImg],
        isremove: [isremove,setIsremove],
        maskoutput:[maskoutput,setMaskOutput]
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
