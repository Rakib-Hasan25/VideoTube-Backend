import {Router} from "express"
import { registerUser,
    loginUser, 
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
 } from "../controllers/user.controller.js"
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
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-account-details").patch(verifyJWT,updateAccountDetails)
// we used patch beacause we want to update only some specific fields in the document
// if we used post all field will be newly updated
router.route("/update-avatar")
.patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
//we are just sending one single file for this we use upload.single("avatar")

router.route("/update-cover-image")
.patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)


router.route("/channel/:username")
.get(verifyJWT,getUserChannelProfile)
//":username" is a perams

router.route("/watch-history").get(verifyJWT,getWatchHistory)


export default router