import { Router } from "express";
import { uploadAvatar } from "../middlewares/multer.js";
import { acceptFriendRequest, createUser, getMyFriends, getNotifications, loginUser, logoutUser, myData, searchUser, sendFriendRequest } from "../controllers/user.js";
import { isAuthenticated } from "../middlewares/IsAuthenticated.js";
import { LoginValidator, RegisterValidator, acceptRequestValidator, sendRequestValidator, validationHandler } from "../middlewares/Validator.js";
import { ErrorHandler } from "../utils/ErrorHandler.js";

const app = Router();

app.get("/", (req, res) => {
    res.send('Hello World');
});

//create a new user
app.post('/create', uploadAvatar, RegisterValidator(),validationHandler, createUser);

//login route for an existing user
app.post('/login' ,LoginValidator() , validationHandler, loginUser);

//logout route
app.get('/logout' , logoutUser)

//middleware to check if the user is Authenticated or not
app.use(isAuthenticated);

//get my details
app.get('/me' , myData);

//search user in the search box
app.get('/search',searchUser)

app.get('/notification' , getNotifications)

//send friend request
app.post('/sendrequest' , sendRequestValidator() , validationHandler,sendFriendRequest)

app.put('/acceptrequest' , acceptRequestValidator() , validationHandler, acceptFriendRequest)

app.get('/friends' , getMyFriends)


app.use('*' , (req,res,next) => {
    return next(new ErrorHandler('Page not Found' , 404));
})

export default app;