import mongoose from "mongoose";
import {User} from "../models/user.model.js"
import {Subscription} from "../models/subscription.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"



const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
   

    if(!channelId)
        throw new ApiError(400, " CHANNEL ID is required")



        // await  Subscription.findOne({
        //     $or:[{req.user?._id}]  
        //    })

       
        const subscriberExists = await Subscription.aggregate([
            {
                $match:{
                    subscriber: new mongoose.Types.ObjectId(req.user?._id)
                }
            }
        ])

        console.log("subscriber" , subscriberExists)

        if(subscriberExists.length==0){
             const newSubscription = await Subscription.create({
                subscriber:req.user?._id,
                channel:channelId
             })
             if(!newSubscription) throw new ApiError(500, "error while creating a subscription document")

             return res.status(201).json(
                new ApiResponse(200, newSubscription, "successfully added subscription")
               )
        }
        else{

            const rmSubcription = await Subscription.findByIdAndDelete(subscriberExists[0]._id)
        console.log("subscriber" , Subscription)

            if(!rmSubcription) throw new ApiError(500, "error while removing subscription")
            return res.status(201).json(
                new ApiResponse(200, [], "successfully remove subcription")
               )

        }

})





export {toggleSubscription}

