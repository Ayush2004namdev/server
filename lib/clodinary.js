import { v2 as cloudinary } from 'cloudinary';
import {v4 as uuid} from 'uuid'


const getBase64 = (file) => `data:${file.mimetype};base64,${file.buffer.toString('base64')}`


const uploadToClodinary = async function(files =[]) {

    const uploadedFiles =  files.map((file) => {
        return new Promise((resolve , reject) => {
            cloudinary.uploader
       .upload(
           getBase64(file), {
                resource_type:'auto',
               public_id: uuid(),
           },(err,res) => {
            if(err) return reject(err);
            resolve(res); 
           }
       )
        })       
    })

    const result = await Promise.all(uploadedFiles);
    const transformedResult = result.map((res) => ({
        public_id:res?.public_id,
        url:res?.secure_url
    }))

    console.log({transformedResult,result});


    return transformedResult;

}

export default uploadToClodinary;

