import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import{User} from "../models/user.model.js"
import{uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
export {registerUser};