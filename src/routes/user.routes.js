import {Router} from "express"
import { registerUser,loginUser, logoutUser,refreshAccessToken } from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
const router = Router()


router.route("/register").post(
    //a middleware we are using , we will pass our file 
    //our passed file will be stored in local 
    upload.fields([
        {
            name:"avatar",//our passed file name
            maxCount:1 // how many copy of this file we will store
        },
        {
            name:"coverImage",//our passed file name
            maxCount:1 // how many copy of this file we will store
        },
    ]),
    registerUser)

router.route("/login").post(loginUser)

//secured routes
// for logout we previously have to ensure that we
// are logged in or not for this use 'verifyJWT'
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)




export default router