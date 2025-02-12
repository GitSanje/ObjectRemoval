
async function preprocessImage(imageUrl: string){

    const image = await fetch(imageUrl)
    .then((res) => res.blob())
    .then((blob) => createImageBitmap(blob));

    
}