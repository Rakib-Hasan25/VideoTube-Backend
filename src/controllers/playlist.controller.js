import mongoose,{isValidObjectId} from "mongoose";
import {Playlist} from "../models/playlist.model.js"
import {User} from "../models/user.model.js"
import {Video} from "../models/video.model.js"


import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    
    if(!name || !description) throw new ApiError(400, "name and decription field are required")


    console.log("NAME",name,  description)

    const playlist = await Playlist.create({

        name:name,
        description:description,
        owner:req.user?._id
    })
    console.log("PLAYLIST",playlist)

    if(!playlist) throw new ApiError(500, "error while creating playlist")


    return res.status(201).json(
        new ApiResponse(200, playlist,"playlist successfully created")
    )

})



const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    

    if(!userId)  throw new ApiError(400, "please provide user id")

    const user = await User.findById(userId)

    if(!user) throw new ApiError(404, "invalid user id")




    const playlist = await Playlist.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        }
    ])


    if(playlist.length==0) {
        return res.status(200).json(
            new ApiResponse(200, [],"there is no playlist for this user")
        ) 
    }
    else {
        return res.status(200).json(
            new ApiResponse(200, playlist,"successfully fetched playlist for this user")
        ) 
    }


})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id





    if(!playlistId)  throw new ApiError(400, "please provide playlist id")

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(500, `Malformatted id ${playlistId}`);
      }
    

    const playlist = await Playlist.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(playlistId)
            }
        }
    ])


    if(playlist.length==0) {
        return res.status(200).json(
            new ApiResponse(200, [],"there is no playlist for this user")
        ) 
    }
    else {
        return res.status(200).json(
            new ApiResponse(200, playlist,"successfully fetched playlist for this playlist id")
        ) 
    }




})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId || !videoId)  throw new ApiError(400, "please provide a playlist  and a video ")


    if (!isValidObjectId(playlistId)) {
        throw new ApiError(500, `Malformatted playlist id ${playlistId}`);
      }

      if (!isValidObjectId(videoId)) {
        throw new ApiError(500, `Malformatted playlist id ${videoId}`);
      }


      const playlist = await Playlist.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(playlistId)
            }
        }
    ])


    if(playlist.length==0) {
        throw new ApiError(404, `there is no such playlist`);
       
    }


    const video = await Video.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(videoId)
            }
        }
    ])


    if(video.length==0) {
        throw new ApiError(404, `there is no such video`)
    }


    // playlist[0].Video.push(videoId)

    // const updatedPlaylist = await playlist[0].save();
    const result = await Playlist.findByIdAndUpdate(
        playlistId,
        { $push: { videos: videoId } },
        { new: true }
      );
  

console.log("result", result)

    return res.status(200).json(
        new ApiResponse(200, result,"successfully fetched playlist for this playlist id")
    )  
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params


    
    if(!playlistId || !videoId)  throw new ApiError(400, "please provide playlist and video ")


    if (!isValidObjectId(playlistId)) {
        throw new ApiError(500, `Malformatted playlist id ${playlistId}`);
      }

      if (!isValidObjectId(videoId)) {
        throw new ApiError(500, `Malformatted playlist id ${videoId}`);
      }


      const playlist = await Playlist.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(playlistId)
            }
        }
    ])


    if(playlist.length==0) {
        throw new ApiError(404, `there is no such playlist`);
       
    }


    // const video = await Playlist.aggregate([
    //     {
    //         $match:{
    //             Video: new mongoose.Types.ObjectId(videoId)
    //         }
    //     }
    // ])


    // if(video.length==0) {
    //     throw new ApiError(404, `there is no such video in playlist `)
    // }


    const result = await Playlist.findByIdAndUpdate(
       playlistId,
           {
             $pull: { videos: videoId }
            
            },
            { new: true }
      );




        return res.status(200).json(
            new ApiResponse(200, result,"successfully insert video on playlist")
        )  
      


   

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    
    if(!playlistId)  throw new ApiError(400, "please provide playlist id")

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(500, `Malformatted id ${playlistId}`);
      }
    

    const playlist = await Playlist.findByIdAndDelete(playlistId);


    if (!playlist){
        throw new ApiError(500,"something is wrong while deleting the playlist");
    }
    return res.status(200).json(
        new ApiResponse(200, [],"playlist deleted successfully")
      )


    
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!playlistId)  throw new ApiError(400, "please provide playlist id")

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(500, `Malformatted id ${playlistId}`);
      }


    if(!name || !description) throw new ApiError(400, "name and decription field are required")



    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                name:name,
                description:description
            }
            // set is mongodb operator

        },
        {
            new:true
        }
        ).select("-password")

        return res.status(200).json(
            new ApiResponse(200, playlist, "playlist details updated successfully")
        )





})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}