import express from 'express';

const app = express();

app.use('/streams', express.static('/segments'));

app.listen(80, '0.0.0.0', function() {
  console.log(`${ process.env.service } started @ http://0.0.0.0`);
});
