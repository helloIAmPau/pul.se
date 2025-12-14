import express from 'express';
import cookieParser from 'cookie-parser';

export const server = function() {
  const app = express();
  app.use(cookieParser());

  app.start = function() {
    app.use(function(error, request, response, next) {
      console.log(error);
    
      response.json({
        errors: [{
          message: error.message
        }]
      });
    });
    
    app.listen(80, '0.0.0.0', function() {
      console.log(`${ process.env.service } started @ http://0.0.0.0`);
    });
  };

  return app;
};

export const assets = function(folder) {
  return express.static(folder);
};
