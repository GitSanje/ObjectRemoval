
export function extractImgData(url: URL, w?: number, h?: number): Promise<Uint8ClampedArray> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // Fix CORS issues
      img.src = url.href;
     
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const width = w ? w : img.naturalWidth;
        const height = h ? h : img.naturalHeight;
  
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
  
        if (!ctx) {
          return reject(new Error("Failed to get canvas context"));
        }
  
        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        resolve(imageData.data);
      };
  
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
    });
  }
  