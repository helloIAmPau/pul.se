import Express from 'express';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const client = new S3Client({
  endpoint: 'http://storage:9000',
  region: 'us-east-1',
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY,
    secretAccessKey: process.env.STORAGE_SECRET_KEY
  }
});

const app = Express();

app.get('/streams/:session/:file', function(request, response) {
  const { session, file } = request.params;

  const command = new GetObjectCommand({
    Bucket: 'streams',
    Key: `${ session }/${ file }`
  });

  return client.send(command).then(function(object) {
    response.setHeader('content-type', object.ContentType);
    response.setHeader('content-length', object.ContentLength);

    object.Body.on('error', function(error) {
      throw new Error(error);
    });

    object.Body.pipe(response);
  });

});

app.use(function(error, request, response, next) {
  response.json({
    errors: [{
      message: error.message
    }]
  });
});

app.listen(80, '0.0.0.0', function() {
  console.log(`${ process.env.SERVICE } started @ http://0.0.0.0`);
});
