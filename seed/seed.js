import { faker } from '@faker-js/faker';
import { User } from '../models/user.js';
const fakedata = async(num) => {
    try{
        
        const datapromise = [];
    
    for (let i = 0; i < num; i++) {
        const d = User.create({
            name:faker.person.fullName(),
            username:faker.internet.userName(),
            bio:faker.lorem.sentence(10),
            password:"password",
            avatar:{
                url:faker.image.avatar(),
                public_id:faker.system.fileName()
            }
        })
        datapromise.push(d)
        
    }
    await Promise.all(datapromise);
        process.exit(1);
    }catch(e){
        console.error(e);
        process.exit(1);    
    }
}

export {fakedata};