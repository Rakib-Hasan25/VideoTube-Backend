// const asyncHandler = () =>{}


const asyncHandler  = (requestHandler) => {
    (req, res, next)=>{
        Promise.resolve(requestHandler(req,res,next))
        .catch((err)=>next(err));
    }
}

export {asyncHandler}







//or,

// const asyncHandler = (fn) => async (req,res,next) => {
//     try{
//         await fn(req,res,next)
//     }
//     catch(error){
//         res.status(err.code || 500).json({
//             success: false,
//             message:err.message 
//         })
//     }
// }



/* 

 asyncHandler = (fn) =>  { () => {} } or (fn) =>  () => {} 

(fn) =>: This part of the expression is the arrow function declaration. It takes a single parameter fn, 
() => {}: This is the body of the arrow function. It's another arrow function, 
denoted by () =>, which takes no parameters and has an empty code block {}.


It defines a higher-order function that takes a single argument fn.
This higher-order function returns another function, which is also an arrow function.
The returned arrow function takes no arguments and has an empty body, essentially not performing any specific actions when called.


*/ 

