import { compare, hash } from "bcrypt";
import mongoose, {Schema,model} from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true 
    },
    password: {
        type: String,
        required: true,
        selected:false,
    },
    avatar:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    bio:{
        type:String
    }
},{timestamps: true});

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) {
        next();
    }
    this.password = await hash(this.password, 10);
    next();
})

userSchema.methods.comparePassword = async function(enteredPassword){
    return await compare(enteredPassword , this.password);
}

export const User = mongoose.models.User || model('User', userSchema);
