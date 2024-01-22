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

    // console.log("afdsf     ",email)


    //4th step
     /*
        beacause we are using middleware in this route we
        get some extra things in our request ,
        using middleware usally do that
    */

    const avatarLocalPath = req.files?.avatar[0]?.path
    // console.log("afdsf",req.files?.avatar[0]?.path)
    

    /*
        ->in req.files.avatar 
        we take the first element , and this element has path
        
        ->multer take our file and upload it on our local filesystem
        in here we just extract the path

    */
        // const coverImageLocalPath = req.files?.coverImage[0]?.path

        

        // checking coverimage is given or not 

        let coverImageLocalPath
        console.log("asfasdfffsddf", req.files)

        if(req.files && req.files.coverImage.length > 0   ){
                coverImageLocalPath = req.files?.coverImage[0]?.path;
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

        console.log("asfasdfffsddf", avater.url)

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

            $unset:{
                refreshToken:1 //this removes the field from the document
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


    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request")
    }

  try {
      const decodedToken = jwt.verify(incomingRefreshToken,
          process.env.REFRESH_TOKEN_SECRET)
  
  
        const user = await User.findById(decodedToken?._id)  
        if(!user){
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

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword, confirmPassword} = req.body

    if(confirmPassword!= newPassword){
        throw new ApiError(401,"confirmPassword isn't match")
    }

   const user = await User.findById(req.user?._id)

   const isPasswordCorrect= await user.isPasswordCorrect(oldPassword)


   if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
   }

   await user.save({validateBeforeSave: false})

   user.password = newPassword


   return res.status(200).json(
    new ApiResponse(200, {}, "password changed successfully")
   )
})

const getCurrentUser = asyncHandler(async(req,res) =>{
    return res.status(200).json(
        new ApiResponse(200, req.user, "current user fetched successfully")
    )
})

const updateAccountDetails = asyncHandler(async (req,res) =>{

    const {fullName,email} = req.body

    if(!fullName || !email){
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName:fullName,
                email:email
            }
            // set is mongodb operator

        },
        {
            new:true
        }
        ).select("-password")


        return res.status(200).json(
            new ApiResponse(200, user, "Account details updated successfully")
        )

})


const updateUserAvatar = asyncHandler(async (req, res) => {

   const avatarLocalPath= req.file?.path // we are just sending one file which is avatar
   if(!avatarLocalPath){
        throw new ApiError(404, "avatar file is not sent")
   }


   //TODO: delete old image from cloudinary
   // how to do : get cloudinary old image url and remove it from cloudinary ; 
   //creating a utils function

   const avatar = await uploadOnCloudinary(avatarLocalPath)

   if(!avatar.url){
        throw new ApiError(404, "Error while updating avatar")
   }


   const user = await User.findByIdAndUpdate(
    req.user?._id,{
        $set:{
            avatar:avatar.url
        }
    },
    {
        new:true
    }
  ).select("-password")

  return res.status(200).json(
    new ApiResponse(200, user, "Avatar file uploaded successfully")
  )
})


const updateUserCoverImage = asyncHandler(async (req, res) => {

    const coverImageLocalPath= req.file?.path // we are just sending one file which is avatar
    if(!coverImageLocalPath){
         throw new ApiError(404, "cover image file is not sent")
    }
 
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
 
    if(!coverImage.url){
         throw new ApiError(404, "Error while updating cover image")
    }
 
 
    const user = await User.findByIdAndUpdate(
     req.user?._id,{
         $set:{
            coverImage:coverImage.url
         }
     },
     {
         new:true
     }
   ).select("-password")
 
   return res.status(200).json(
     new ApiResponse(200, user, "cover image file uploaded successfully")
   )
 })


 const getUserChannelProfile = asyncHandler(async (req, res) => {
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(404, "username is missing")
    }

   const channel = await User.aggregate([
            {
                $match:{
                    username : username?.toLowerCase()
                }
            },
            //firstly we just find the specfic channel which we want to find
            //username(document field name) : username?.toLowerCase()(params name or channel name)
            //after this pipline we have one document in user collection
            {
                $lookup:{
                    from:"subscriptions",
                    localField:"_id",
                    foreignField:"subscriber",
                    as :"subscribedToWhichChannel" 
                }
            },
            //now we make a field as "subscribedToWhichChannel" which store and array and in this array 
            //we store matching object which is matched with "user collection -> document -> _id -> field" and 
            //"subscriptions collection -> document -> subscriber -> field"
            // this  "subscribedToWhichChannel" field bascially store-> this user subscribed which which channels
            {
                $lookup:{
                    from:"subscriptions",
                    localField:"_id",
                    foreignField:"channel",
                    as :"subscribersOfThisChannel" 
                }
            },
             //now we make a field as "subscribersOfThisChannel" 
            // this  "subscribersOfThisChannel" field bascially store-> which which user subscribed this channel


            {
                $addFields:{
                    subscriberCount:{
                        $size:"subscribersOfThisChannel"
                    },
                    channelSubscribedToCount:{
                        $size:"subscribedToWhichChannel"
                    },
                    isSubcribed:{
                        $cond:{
                            if:{ $in : [req.user?._id , "$subscribersOfThisChannel.subscriber"]},
                            //we have add the "subscribersOfThisChannel" field in the filtered document
                            //and we said that in this field we store an array 
                            // and the array element are objects of "Subcription"collection 
                            //so for every object there must be an key named "subscriber"
                            //"$subscribersOfThisChannel.subscriber" we are pointint this key 
                            //$in : [req.user?._id , "$subscribersOfThisChannel.subscriber"] this said
                            //req.user._id is present or not in "subscribersOfThisChannel" array 
                            then: true,
                            else:false,
                        }
                    }
                }
            },

            // here we add extra two field ; In "subscriberCount" field we just store
            //the number of array elements in "subscribersOfThisChannel" field


            {
                $project:{
                    fullName:1,
                    username:1,
                    subscriberCount:1,
                    channelSubscribedToCount:1,
                    isSubcribed:1,
                    avatar:1,
                    coverImage:1,
                    email:1

                }
            }
    ])

    if(!channel?.length){
        throw new ApiError(404, "channel does not exist")
    }

    //channel will return array of document of object

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "channel details is fatched")
    )
 })
 

 const getWatchHistory = asyncHandler(async(req,res)=>{
    //"req.user._id" we get a string ; we don't get mongodb id but mongoose internally
    // convert it to mongodb objectid

    const user = await User.aggregate([
        {
            $match:{
                //_id: req.user._id we can not directly use it because mongoose dosent work 
                //here so we need to convert it to mongodb objectId
                _id: new mongoose.Schema.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as : "watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as : "owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1,
                                    }
                                }
                            ]
                            
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200, user[0].watchHistory, "watchHistory fetched successfully")
    )

 })


export {registerUser, loginUser, 
    logoutUser,refreshAccessToken,
    changeCurrentPassword,getCurrentUser,
    updateAccountDetails,updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
};