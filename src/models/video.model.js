import mongoose, {Schema} from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
        
    videoFile:{
        type:String,//cloudinary url
        required: true,
    },
    thumbnail:{
        type:String,
        required: true,
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    duration:{
        type:String, //cloudinary 
        // when we upload in thing in cloudinary we can get the duration
        required:true,
    },
    views:{
        type:Number,
        default:0,
    },
    isPublished:{
        type:Boolean,
        default:true,
    },
    videoUploader:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }


},{
    timestamps:true,
}
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model('Video', videoSchema);