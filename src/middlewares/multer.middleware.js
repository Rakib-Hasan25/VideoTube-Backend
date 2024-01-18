import multer from "multer"


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },

    //to configure file name
    filename: function (req, file, cb) {

    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    //   cb(null, file.fieldname + '-' + uniqueSuffix)


    cb(null, file.originalname) 
    /*
        we saved file as it orginal name, but name can be duplicate
        but we use it here beacause we saved this file for a small amount of time,
        when we upload it on the cloudinary we delete it so we don't need to worry 

    */
    }

  })
  
  export const upload = multer({ storage: storage })



  // main line: here storage (function which we write )
  //will return the filepath which we store in local storage


  
  /*
  ->multer is using to store our file we a user sent any response 
   
  ->function (req, file, cb) 
   in multer we can access file
   cb means call back
    "./public/temp" where file will be stored

  ->disk storage is used , beacause our file can be bigger 
  so if use memory then we can not store it 
*/