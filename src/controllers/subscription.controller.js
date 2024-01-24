import mongoose,{isValidObjectId} from "mongoose";
import {User} from "../models/user.model.js"
import {Subscription} from "../models/subscription.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"



const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
   

    if(!channelId)
        throw new ApiError(400, " CHANNEL ID is required")



        if (!isValidObjectId(channelId)) {
            throw new ApiError(500, `Malformatted id ${channelId}`);
          }



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

        // console.log("subscriber" , subscriberExists)

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
        // console.log("subscriber" , Subscription)

            if(!rmSubcription) throw new ApiError(500, "error while removing subscription")
            return res.status(201).json(
                new ApiResponse(200, [], "successfully remove subcription")
               )

        }

})



//we will get all the subscriber of this channel id
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!channelId)
    throw new ApiError(400, " CHANNEL ID is required")


    if (!isValidObjectId(channelId)) {
        throw new ApiError(500, `Malformatted id ${channelId}`);
      }

// channel id might be not present in user
      const findChannel = await User.findById(channelId);

      if (!findChannel) {
        res
          .status(404)
          .json(new ApiResponse(404, {}, `Channel with ${channelId} not found !`));
      }


    const allsubscriber = await Subscription.aggregate([
        {
            $match:{
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $project:{
                subscriber:1
            }
        }
    ])

    if(!allsubscriber){
        throw new ApiError(500, "error while getting all subscribers list")
    }




    return res.status(200).json(
        new ApiResponse(200, allsubscriber , "successfully fetch all subscribers")
       )

})




// a user subscribed how many channel 
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!subscriberId) {
        throw new ApiError(500, "Subscriber Id is missing !");
      }
    
      if (!isValidObjectId(subscriberId)) {
        throw new ApiError(500, `Malformatted id ${channelId}`);
      }

      const user = await User.findById(subscriberId);

  if (!user) {
    res
      .status(404)
      .json(new ApiResponse(404, {}, `User with ${subscriberId} not found !`));
  }

  const allsubscribedChannel = await Subscription.aggregate([
    {
        $match:{
            subscriber: new mongoose.Types.ObjectId(subscriberId)
        }
    },
    {
        $project:{
            channel:1
        }
    }
    
])
if(!allsubscribedChannel){
    throw new ApiError(500, "error while getting all subscribers list")
}



return res.status(200).json(
    new ApiResponse(200, allsubscribedChannel , "successfully fetch all subscribedChannel")
   )


})


export {toggleSubscription,getUserChannelSubscribers,getSubscribedChannels}

