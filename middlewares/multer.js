import multer from 'multer';


const uploadmulter = multer({   
    limits: {
        fileSize: 1024 * 1024 * 5
    },
})

const uploadAvatar = uploadmulter.single('avatar');

const addAttachments = uploadmulter.array('files',5);

export {uploadAvatar,addAttachments};