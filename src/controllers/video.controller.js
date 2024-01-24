import mongoose from "mongoose";

import {Video} from "../models/video.model.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {v2 as cloudinary} from 'cloudinary'




const publishAVideo = asyncHandler(async (req,res)=>{
    //first user have to be authorized to publish video
    //then user can sent a video we temporaily store on local storage
    //then upload to cloudinary and then delete video from local storage
    //store cloudinary video url in mongoose
    //and get a response
    const {title,description} = req.body

    if(
        [title,description].some(
            (field)=>field?.toLowerCase()==="")
            ){
                throw new ApiError("400","title and description are required")
    }


    const videoLocalPath = req.files?.videoFile[0]?.path 
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path 


    if(videoLocalPath==null && videoLocalPath ==undefined){
        throw new ApiError(400,"video file is required")
    }

    if(thumbnailLocalPath==null && thumbnailLocalPath ==undefined){
        throw new ApiError(400,"thumbnail file is required")
    }



    const uploadedVideo = await uploadOnCloudinary(videoLocalPath)
    const uploadedThumbnail= await uploadOnCloudinary(thumbnailLocalPath)



    if(!uploadedVideo){
        throw new ApiError(400,"Upload Failures")
    }
    if(!uploadedThumbnail){
        throw new ApiError(400,"Upload Failures")
    }


    const video =await  Video.create({
        videoFile: uploadedVideo?.url || "",
        thumbnail:uploadedThumbnail?.url || "",
        title:title,
        videoUploader:req.user._id,
        description:description,
        duration:uploadedVideo?.duration ||""
    })


    const publishedVideo=  await Video.findById(video._id)

    if(!publishedVideo){
        throw new ApiError(500,"something went wrong while uploading the video")
      }


      return res.status(201).json(
        new ApiResponse(200,publishedVideo, "video upload  successfully")
       )

})


const getAllVideos = asyncHandler(async(req,res)=>{
    const { page =2, limit = 10, sortBy, sortType,userId} = req.query
    
    if(
        [sortBy, sortType].some((field)=>
        field?.trim() === "")
        )
    {
        throw new ApiError(400, "sortBy and sortType query parameters are required")
      
    }


    // const baseQuery = {};

    // // Adding additional filters based on query parameters
    // if (query) {
    //   baseQuery.$or = [
    //     { title: { $regex: query, $options: "i" } }, // Case-insensitive search in the title
    //     { description: { $regex: query, $options: "i" } }, // Case-insensitive search in the description
    //   ];
    // }
   

    const sortOptions = {};
  if (sortBy) {
    sortOptions[sortBy] = sortType === "desc" ? -1 : 1;
  }
    // console.log("limit ", options.limit)   


    // console.log("type of  ", typeof limit , typeof page )

    const videos = await Video.aggregatePaginate(
        Video.aggregate([
        //   { $match: { ...baseQuery, owner: userId } }, // Add owner filter if userId is provided
        // {
            // $match:{_id: new mongoose.Types.ObjectId(userId)}},
          { $sort: sortOptions },
          { $skip: (page - 1) * limit },
          { $limit: parseInt(limit) },
        ])
      );




    // const length = videos.docs.length
    // console.log("length ", length)


    if(!videos){
        throw new ApiError(500,"something went wrong while fetching video")

    }
    
    return res.status(200).json(
        new ApiResponse(200, videos.docs, "successfully fetched")
       )


})

const getVideoById = asyncHandler(async(req,res) => {
    const {videoId} = req.params

    if(!videoId?.trim()){
        throw new ApiError(404, "video id is missing")
    }

    const video = await Video.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(videoId)
            }
        }
    ])

    if(!video){
        throw new ApiError(500,"something went wrong while getting the video")
    }

    return res.status(200).json(
        new ApiResponse(200, video, "successfully fetched")
       )


})


const updateVideo = asyncHandler(async(req, res)=>{

    const {videoId} = req.params
    const {title,description} = req.body
    const thumbnailLocalPath= req.file?.path

    if(!title || !description || !thumbnailLocalPath){
        throw new ApiError(400, "All fields are required")
    }



    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!videoId) throw new ApiError(400,"video id is required")
    if(!thumbnail) throw new ApiError(400,"Something is wrong while uploading thumbnail")

    // here we going to update the video details
    const video = await Video.findById(videoId)
    
    const response = await cloudinary.uploader.destroy(video.thumbnail)

    if(response) {
        console.log("thumbnail deleted successfully");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,{
            $set:{
                title:title,
                description:description,
                thumbnail:thumbnail.secure_url,

            }
        },
        {
            new:true
        }
      )

      if(!updatedVideo) {
        throw new ApiError(500,"something went wrong when updating video details")
      }

      return res.status(200).json(
        new ApiResponse(200, updatedVideo, "video details updated successfully")
      )





})


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId?.trim()){
        throw new ApiError(404, "video id is missing")
    }
    const video = await Video.findById(videoId)


        
    const response = await cloudinary.uploader.destroy(video.thumbnail, video.videoFile)

    if(response) {
        console.log("thumbnail and video deleted successfully from coloudinary");
    }

    const rmVideo = await Video.findByIdAndDelete(videoId)

    if (!rmVideo){
        throw new ApiError(500,"something is wrong while deleting the video")
    }
    return res.status(200).json(
        new ApiResponse(200, [],"video file deleted successfully")
      )
})



const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId?.trim()){
        throw new ApiError(404, "video file is missing")
    }


    const video = await Video.findById(videoId)

    if(!video)throw new ApiError(400, "video not found")
    const status = video.isPublished
    console.log("video status", status)


    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,{
            $set:{
                isPublished:status===true? false : true

            }
        },
        {
            new:true
        }
      ).select('-createdAt -updatedAt -description -duration -_id -thumbnail')

      if (!updatedVideo){
        throw new ApiError(500,"something is wrong while changing published status")
    }


    return res.status(200).json(
        new ApiResponse(200,updatedVideo,"changing published status successfully")
      )








})


export { publishAVideo,getAllVideos,getVideoById,updateVideo,deleteVideo,togglePublishStatus}