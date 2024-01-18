//lets assume file exists in our server and we can get our local path
// if can send the file from our local to cloudinary then we will delete our file from local

import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'
//fs means filesystem from node js

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret:process.env.CLOUDINARY_API_SECRET 
  });


  const uploadOnCloudinary = async (localFilePath)=>{
    try{
        if(!localFilePath)return null
        // upload the file on cloudinary
       const response= await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"// what type of file we are going to upload
        })
        // file has been successfully uploaded
        // console.log("file successfully uploaded on cloudinary",response.url )
        fs.unlinkSync(localFilePath)
        // 'response.url 'is after file upload url of the file 
        return response;

    }
    catch(err){
        fs.unlinkSync(localFilePath);// remove the localling saved temporary files as the 
        // upload operation got filed
        return null;

    }
  }
  
  export {uploadOnCloudinary}