
import connectDB from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({
    path: './env'
})


connectDB();



/*
!1st approach 



// require('dotenv').config({path:'./env'})

import dotenv from "dotenv"
import mongoose  from "mongoose";
import { DB_NAME } from "./constants.js";
dotenv.config({
    path: './env'
})
import express from "express";
const app = express();

;(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        app.on("error", (error)=>{
            console.log("ERRR : " ,error);
            throw error;

        })
        // after mongoDB connection we might can have error which we handle upper
        app.listen(process.env.PORT,()=>{

                console.log(`App is listening on ${process.env.PORT}`)
            });
    }
    catch(error){
        console.error("Error: " , error)
        throw err
    }
})()

*/



