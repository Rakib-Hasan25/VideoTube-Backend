import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";






export const verifyJWT = asyncHandler(async(req, _ , next)=>{

  try {
      const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
      //we will get the token from the req.cookies but for mobile application 
      // we get the token from the header ' Authorization:' section beacause
      // for website we can save token as cookies but for mobile application we can't save
      //token we have to save in local storage or shared preferences  
  
      if(!token){
          throw new ApiError(401, "Unauthorized request")
      }
  
  
  
  
      const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
  
      // but to decode token , we need the screct key of the access token
      // and this secret_access_key  we defined in our enviroment variable
      //  decodetoken(an object) has same key "_id","email","username","password"  
  
  
      const user = await User.findById(decodedToken?._id)
      .select("-password -refreshToken")
      //we extract the _id of the user and find user by that _id
  
  
  
  
      if(!user){
          //TODO: discuss about frontend
          throw new ApiError(401, "Invalid Access Token")
      }
  
      req.user = user;
      //we add a new object in the req ,
      next();
  } catch (error) {
        throw new ApiError(401,error?.message|| "invalid access token")
    
  }
})