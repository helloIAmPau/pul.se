import { server, assets } from '@pul.se/http';

const app = server();

app.use('/streams', assets('/segments'));

app.start();
