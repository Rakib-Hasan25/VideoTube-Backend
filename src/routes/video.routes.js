import {Router} from "express"

import { publishAVideo,getAllVideos,getVideoById,updateVideo,deleteVideo,togglePublishStatus} from "../controllers/video.controller.js"


import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"


const router = Router()

router.use(verifyJWT) // Apply verifyJWT to all routes in this file


router.route("/publishAVideo").post(upload.fields([
    {
        name:"videoFile",
        maxCount:1
    },
    {
        name:"thumbnail",
        maxCount:1
    }
    
]),

publishAVideo

)

router.route("/getVideos").get(getAllVideos)
router.route("/:videoId").get(getVideoById)
router.route("/updateVideoDetails/:videoId").patch(upload.single("thumbnail"),updateVideo)
router.route("/delete/:videoId").delete(deleteVideo)
router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router

