import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import{User} from "../models/user.model.js"
import{uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"




const generateAccessandRefreshTokens = async(userId)=>{
    try{
        const user = await User.findById(userId)
       const accessToken= user.generateAccessToken()
       const refreshToken= user.generateRefreshToken() 



       user.refreshToken= refreshToken;
       //"user" is a object , which we find from database
       //so in user.model we have refreshtoken
       // we just update or insert the refresh token
       await user.save({validateBeforeSave:false})
       //while saving refresh token we don't want any 
       //validatation like ("password , username exists or not")
       // so we just tell validationBeforeSave should be false


       return {accessToken:accessToken, refreshToken:refreshToken}

    }
    catch(error){
        throw new ApiError(500,
            "Something went wrong while generating access and refresh tokens")
    }

}

const registerUser = asyncHandler(async(req,res)=>{
    //1st: get user details from frontend
    //2nd: validation - not empty
    //3rd: check if user already exists in db: username,email
    //4th: check for images , check for avatar
    //5th:upload them to cloudinary
    //6th: create user object - create entry in db
    // 7th: check for user creation 
    //      remove password and refresh token field from response
    //8th: return response 


    //1st step
    const {fullName, email, username, password} = req.body
    console.log("email", email)



    //2nd step

    // if(fullName === ""){
    //     throw new ApiError(400, "fullname is required")
    // }
    if(
        [fullName, email, username, password].some((field)=>
        field?.trim() === "")
        )
    {
        throw new ApiError(400, "all fields are required")
        // here we traverse for every array element , if for
        // any array element we get true , body will exicute thats mean
        // it will throw the error
    }


    //3rd step:

    //User.findOne({username});

    const existedUser = await User.findOne({
        $or:[
            { username }, { email }
        ]
    }) 
    // here we check the first entity in db which is match with our username
    //and email 


    if(existedUser){
        throw new ApiError(409,"User with email or username already exists" )
    }



    //4th step
    
     /*
        beacause we are using middleware in this route we
        get some extra things in our request ,
        using middleware usally do that
    */

    const avatarLocalPath = req.files?.avatar[0]?.path
    console.log("afdsf",req.files?.avatar[0]?.path)
    

    /*
        ->in req.files.avatar 
        we take the first element , and this element has path
        
        ->multer take our file and upload it on our local filesystem
        in here we just extract the path

    */
        // const coverImageLocalPath = req.files?.coverImage[0]?.path

        

        // checking coverimage is given or not 

        let coverImageLocalPath
        if(req.files && Array.isArray(req.files.coverImage) 
            && req.files.coverImage.length > 0){
                coverImageLocalPath = req.files.coverImage[0].path;
        }
        // console.log("coverimage", req.files.coverImage)
        

        if(!avatarLocalPath){
            throw new ApiError(400,"Avatar file is required")
        }



        //5th step

        const avater = await uploadOnCloudinary(avatarLocalPath)
        const coverImage= await uploadOnCloudinary(coverImageLocalPath)

        if(!avater){
            throw new ApiError(400,"Avatar file is required")
        }

        // console.log("asfasdfffsddf", avater.url)

        //6th step

       // we just upload the the user in database
        const user= await User.create({
            fullName,
            avatar:avater.url,//here we previously checked avatar 
            coverImage:coverImage?.url || "",//here we haven't checked cover image 
            //so it can be null
            email,
            password,
            username:username.toLowerCase(),

        })


        //7th step

        //now we again verify that we successfully uploaded user
        // in database or not

        // but if we get the user now we are ready to send response
        // we won't want to take password and -refresh token


       const createdUser=  await User.findById(user._id).select(
                "-password -refreshToken"
       )

       if(!createdUser){
         throw new ApiError(500,"something went wrong while registering the user")
       }

       //8th step

       return res.status(201).json(
        new ApiResponse(200, createdUser, "user registration successfully")
       )
})



const loginUser = asyncHandler(async(req,res)=>{
    //from req.body we have to extract the data
    // username and password
    // find the user
    // check the password
    //geneate the access token and refresh token
    // send cookies with response

    //1st and 2nd step
    const {email,username,password} = req.body
    console.log("email ",email)

    if(!username && ! email){
        throw new ApiError(400, "user name and email are required")
    }


//3rd step
   const user =  await User.findOne({
     $or:[{username},{email}]  
    })


    if(!user){
        throw new ApiError(404, "user is not found")
    }

    // console.log("user : ",user)



    //4th step

    const isPasswordValid = await user.isPasswordCorrect(password)
    //"password" which the user just entered and "user" is the data
    // which we find from database when we searching from the User

    //user.isPasswordCorrect() this function is defined on user.model
    //for this reason we can use it

    if(!isPasswordValid){
        throw new ApiError(401, "Invaild user credentials")
    }


    const {accessToken,refreshToken}=await generateAccessandRefreshTokens(user._id);
    // for the user 
    // which we find from database, we just pass his id

    // console.log("accessToken : ", accessToken)



   const loggedInUser= await User.findById(user._id).select("-password -refreshToken")



    // console.log("loggedInuser : ", loggedInUser)
   


   const options={
    httpOnly:true,
    secure:true,
   }
   // by default our cookies can be modified by frontend 
   // but now only the backend/server can modify the cookies

   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
    new ApiResponse(200,{
        user:loggedInUser,
        accessToken,
        refreshToken
    },
    "user logged in successfully"
    
    )
   )
   //here .cookie we can use beacause we use cookie-parser package
   //here, in json response we also send the access token and refresh token
   //frontend developer might need to save it in local storage , mostly needed
   // for appdeveloper

})



const logoutUser =asyncHandler(async (req, res) => {
// remove the refresh token from the database

    await User.findByIdAndUpdate(
        req.user._id,{
            $set:{
                refreshToken:undefined
            },
        },
        {
            new: true,
        }
        //new:true means "User.findbyIdUpdate()"  return a response
        //which gives us the  user data but now we will get the updated data,
        //means user refresh token will be undefined
    )
    // we get req.user._id because we define a middleware 
    // and this middleware insert a new object can 'user'
    //in the 'req'


    //remove cookies from the user which we give him


    const options={
        httpOnly:true,
        secure:true,
       }


       return res.status(200)
       .clearCookie("accessToken", options)
       .clearCookie("refreshToken",options).json(
        new ApiResponse(200,{}, "User logged out")
       )

})


const refreshAccessToken = asyncHandler(async (req, res) => {
    // get the refresh token from the cookies or 
    // for mobile app we can get from req.body

    const incomingRefreshToken = req.cookies.
    refreshToken || req.body.refreshToken


    if(incomingRefreshToken){
        throw new ApiError(401, "unauthorized request")
    }

  try {
      const decodedToken = jwt.verify(incomingRefreshToken,
          process.env.REFRESH_TOKEN_SECRET)
  
  
        const user = await User.findById(decodedToken?._id)  
        if(incomingRefreshToken){
          throw new ApiError(401, "Invalid refresh token")
      }
  
  
      if(incomingRefreshToken != user?.refreshToken){
          throw new ApiError(401, "Refresh token is expired or used")   
      }
  
  
      const {accessToken,newRefreshToken}= await generateAccessandRefreshTokens(user._id);
  
      const options={
          httpOnly: true,
          secure:true,
      }
  
      return res
      .status(200)
      .cookie("accessToken", accessToken,options)
      .cookie("refreshToken", newRefreshToken,options)
      .json(
          new ApiResponse(200,{
              accessToken:accessToken,
              refreshToken:newRefreshToken
          },
          "Access token refreshed"
          
          )
      )
  
  } catch (error) {
        throw new ApiError(401, error?.message|| "Invalid refresh token")
    
  }


})
export {registerUser, loginUser, logoutUser,refreshAccessToken};