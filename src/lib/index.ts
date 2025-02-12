"use server"
import fs, { mkdir } from "fs/promises";


export const fileExists = async (pathToFileOrDir: string): Promise<boolean> => {
    try {
      await fs.stat(pathToFileOrDir);
      return true; // File or directory exists
    } catch (error) {
      return false; // File or directory does not exist
    }
  };
  
  export async function ensureDirectory(dirPath: string) {
    if (!(await fileExists(dirPath))) {
      const res = await mkdir(dirPath, { recursive: true });
      if(res){
        console.log('====================================');
        console.log(`Successfully created ${dirPath}`);
        console.log('====================================');
      }
       
    }
  }


// export function getOriginalFileName(storedFileName: string): string {
//     return storedFileName.substring(storedFileName.indexOf("-")+1);

//   }