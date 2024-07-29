import { body, param, query, validationResult } from "express-validator";
import { ErrorHandler } from "../utils/ErrorHandler.js";

const RegisterValidator = () => [
  body("name", "Please Provide a Name").notEmpty(),
  body("username", "Please Provide a username").notEmpty(),
  body("bio", "Please Provide a bio").notEmpty(),
  body("password", "Please Provide a password").notEmpty(),
];

const LoginValidator = () => [
  body("username", "Please Provide a username").notEmpty(),
  body("password", "Please Provide a password").notEmpty(),
];

const CreateGroupValidator = () => [
  body("name", "Please Provide a Group name").notEmpty(),
  body("members")
    .notEmpty()
    .withMessage("Please Provide members")
    .isArray({ min: 1, max: 100 })
    .withMessage("there should be members between 3-100"),
];

const sendRequestValidator = () => [
  body("userId", "Please Send UserID").notEmpty(),
];

const AddtoGroupValidation = () => [
  body("groupId").notEmpty().withMessage("Please provide GroupId"),
  body("members")
    .notEmpty()
    .withMessage("please provide members")
    .isArray({ min: 1, max: 100 })
    .withMessage("please provide members to add in the group"),
];

const RemoveFromGroupValidation = () => [
    body('groupId' , 'Please provide a GroupId').notEmpty(),
    body('userId' , 'Please Provide UserId').notEmpty()
]

const renameValidation = () => [
    param('id', 'Please provide with an Id').notEmpty(),
    body('name','please provide a name to rename the group').notEmpty()
]

const acceptRequestValidator = () => [
    body('reqId' , 'Please provide a valid ID').notEmpty(),
    body('accept' , 'Please provide accept').notEmpty().isBoolean().withMessage('accept should be a boolean')
]
const validationHandler = (req, res, next) => {
  const { errors } = validationResult(req);
  const ErrorMessages = errors.map((er) => er.msg).join(",");
  console.log(errors, ErrorMessages);
  if (errors.length <= 0) return next();
  else return next(new ErrorHandler(ErrorMessages, 400));
};


export {
  RegisterValidator,
  validationHandler,
  LoginValidator,
  CreateGroupValidator,
  sendRequestValidator,
  AddtoGroupValidation,
  RemoveFromGroupValidation,
  renameValidation,
  acceptRequestValidator
};
