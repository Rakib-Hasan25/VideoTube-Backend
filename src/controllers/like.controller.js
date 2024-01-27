import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/likes.model.js"
import {Video} from "../models/video.model.js"
import{Comment} from "../models/comments.model.js"
import{Tweet} from "../models/tweets.model.js"


import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    if(!videoId){
        throw new ApiError(400, "video Id is required")
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(500, `Malformatted video id ${videoId}`);
      }


      const videoAvail = await Video.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(videoId)
            }
        }
    ])


    if(videoAvail.length==0) 
        throw new ApiError(404, `there is no such videod`);


        const like = await Like.aggregate([
            {
                $match:{
                    video:new mongoose.Types.ObjectId(videoId)
                }
            }
        ])

        if(like.length==0){
            const result = await Like.create({
                video: videoId,
                like:null,
                tweet:null,
                likedBy:req?.user?._id
            })

            if(!result){
                throw new ApiError(500, "something is wrong while giving like in video")

            }

            return res.status(200).json(
                new ApiResponse(200,result, "successfully likes video")
               )
    
        }

        else{
            const likeId= like[0]._id
            const result = await Like.findByIdAndDelete(likeId)

            if(!result){
                throw new ApiError(500, "something is wrong while unliking the video")
                
            }


            return res.status(200).json(
                new ApiResponse(200,[], "successfully unlike the video")
               )

        }



})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment


    if(!commentId){
        throw new ApiError(400, "video Id is required")
    }
    if (!isValidObjectId(commentId)) {
        throw new ApiError(500, `Malformatted video id ${commentId}`);
      }


      const commentAvail = await Comment.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(commentId)
            }
        }
    ])


    if(commentAvail.length==0) 
        throw new ApiError(404, `there is no such videod`);


        const like = await Like.aggregate([
            {
                $match:{
                    comment:new mongoose.Types.ObjectId(commentId)
                }
            }
        ])

        if(like.length==0){
            const result = await Like.create({
                comment: commentId,
                video:null,
                like:null,
                likedBy:req?.user?._id
            })

            if(!result){
                throw new ApiError(500, "something is wrong while giving like in comment")

            }

            return res.status(200).json(
                new ApiResponse(200,result, "successfully likes video")
               )
    
        }

        else{
            const likeId= like[0]._id
            const result = await Like.findByIdAndDelete(likeId)

            if(!result){
                throw new ApiError(500, "something is wrong while unliking the comment")
                
            }


            return res.status(200).json(
                new ApiResponse(200,[], "successfully unlike the comment")
               )

        }






})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet


    
    if(!tweetId){
        throw new ApiError(400, "tweet Id is required")
    }
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(500, `Malformatted tweet id ${tweetId}`);
      }


      const tweetAvail = await Tweet.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(tweetId)
            }
        }
    ])


    if(tweetAvail.length==0) 
        throw new ApiError(404, `there is no such tweet`);


        const like = await Like.aggregate([
            {
                $match:{
                    tweet:new mongoose.Types.ObjectId(tweetId)
                }
            }
        ])

        if(like.length==0){
            const result = await Like.create({
                tweet:tweetId,
                video:null,
                comment:null,
                likedBy:req?.user?._id
            })

            if(!result){
                throw new ApiError(500, "something is wrong while giving like in tweet")

            }

            return res.status(200).json(
                new ApiResponse(200,result, "successfully likes tweet")
               )
    
        }

        else{
            const likeId= like[0]._id
            const result = await Like.findByIdAndDelete(likeId)

            if(!result){
                throw new ApiError(500, "something is wrong while unliking the tweet")
                
            }


            return res.status(200).json(
                new ApiResponse(200,[], "successfully unlike the tweet")
               )

        }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const like = await Like.aggregate([
        {
            $match:{
                likedBy :new mongoose.Types.ObjectId(req?.user?._id),
                comment:null,
                tweet:null
            }
        }
    ])


    if(!like){
        throw new ApiError(500, "something is wrong while getting all liked video")

    }

    return res.status(200).json(
        new ApiResponse(200,like.docs, "successfully fetched all the liked videos")
    )

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}