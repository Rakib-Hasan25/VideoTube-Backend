import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const userSchema = new mongoose.Schema({

    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim : true,
        index:true, 
        // for searching field enable or optimize index have to true, 
        // we can do without it but we can easily search by doing it, 
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim : true,  
    },
    fullName:{
        type: String,
        required: true,
        trim : true,
        index:true  
    },
    avatar:{
        type: String,// cloudinary url
        required: true,
     
    },
    coverImage:{
        type: String,// cloudinary url
    },
    watchHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ],

    password:{
        type: String,
        required:[true, "Password is required"]
    },
    refreshToken:{
        type:String
    }
},
{timestamps:true}
)

// direct data encryption is not possible so we need hooks from mongoose 
// we used 'pre' middleware or hooks , which is used to do anything before saving the data in database


userSchema.pre("save", async function(next){
    if(!this.isModified("password"))return next();

    this.password = await bcrypt.hash(this.password, 10)// here 10 is round
    next();
    
})

/*

in pre middleware we will do something before "save",
and what we will is written in the function but you can see we don't use callback function
()=>{} because it don't have the reference of the mongoose schema fields(like username, password etc)
and in this function we used async beacause password encryption takes time

but now there is problem arise when we save anything/update  in user it change password because before 
saving anything in database we are calling it 

so , we have to call it when we change the password only
 if(!this.isModified("password"))return next();

*/
userSchema.methods.isPasswordCorrect = async function (password){
  return  await bcrypt.compare(password, this.password) 
}
/*
here we create custom method ,  which will check between , password which the user send 
and password after encryption are same or not ,

actually ,we just check the password encryption is successful or not .

pasword(which user send)   and this.password(the encrypted password)


and this function return true or false,

*/


userSchema.methods.generateAccessToken = function(){
   return jwt.sign(
        {
            //payload 
            _id : this._id,
            email : this.email,
            username:this.username,
            fullName:this.fullName,
            //'fullName' is payload key ,this.fullName come from database
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }

    )

}


userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            //payload 
            _id : this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }

    )
}



/*
    jwt is bearer token, who have the token we think he is right

    
*/



export const User = mongoose.model('User',userSchema);