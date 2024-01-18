import {Router} from "express"
import { registerUser } from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
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


export default router