const Error = (err, req, res, next) => {

    let status = err.status || 500;
    let message = err.message || 'Something went wrong';
    if (err.code === 11000) {
      message = 'Username already taken';
    }
  
    if (err.name === 'CastError') {
      message = 'Please provide a valid ID';
    }
    console.log('message',message , err)
    res.status(status).json({
      success: false,
      message,
    });
  };
  
  export { Error };
  