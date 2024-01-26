import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.


    const totalVideoViews = await Video.aggregate([
        {
            $match:{
                videoUploader: new mongoose.Types.ObjectId(req?.user?._id)
            },
         
        },
        {
            $group: {
                _id: null,
                totalVideoViews: { $sum: "$views" }
            }
        }
        // it count in a group all the key "named:totalVideoViews" all values 
        
    ])


    const totalVideos = await Video.aggregate([
        {
            $match: {
                owner: new Types.ObjectId(userId)
            }
        },
        {
            $count: "totalVideosCount"
        }
    ]);


   

    const totalSubscribers = await Subscription.aggregate([
        {
        $match:{
            channel: new Types.ObjectId(req?.user?._id)
        }
    }
    ,
    //it just count all the matched document and assign the number to "totalSubscribersCount"
    {
        $count: "totalSubscribersCount"
    }

    ])


   

    const totalLikes = await Like.aggregate([
        {
            $match:{
                likedBy: new Types.ObjectId(req?.user?._id)
            },
        },
        
        {
            $group:{
                _id:null,
                totalVideoLikes:{
                    $sum:{
                        $cond: [
                            { $ifNull: ["$video", false] },
                            1,
                            0
                        ]

                    }
                },
                totalTweetLikes: {
                    $sum: {
                        $cond: [
                            { $ifNull: ["$tweet", false] },
                            1,
                            0
                        ]
                    }
                }
            }

            
        }
    ])



    const states ={
        totalLikes:totalLikes[0] ||0,
        totalSubscribers:totalSubscribers[0].totalSubscribersCount||0,
        totalVideos:totalVideos[0].totalVideosCount||0,
        totalVideoViews:totalVideoViews[0].totalVideoViews||0

    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, states, "channel details is fatched")
    )


})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req.user._id;
    
    const videos = await Video.find({ videoUploader: userId });

    return res.status(200).json(new ApiResponse(
        200,
        { videos },
        "Channel videos fetched successfully"
    ))
})

export {
    getChannelStats, 
    getChannelVideos
    }