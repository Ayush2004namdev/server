import { TryCatch } from "../utils/TryCatch.js";

const Error = TryCatch((err, req, res, next) => {
    let status = err.status || 500;
    let message = err.message || 'Something went wrong';

    if(err.code === 11000){
        message = 'username allready taken';
    }

    if(err.name === 'CastError'){
        message = 'Please provide a valid ID';
    }

    res.status(status).json({
        sucsess: false,
        message
    });
})

export {Error};