import { Server } from 'socket.io';
import { parse } from 'cookie';
import { verify } from '@pul.se/auth/jwt';
import { listen } from '@pul.se/postgres';

const io = new Server(80, {
  path: '/broadcast',
  serveClient: false
});

io.use(function(socket, next) {
  const cookies = socket.request.headers.cookie;

  if(cookies == null) {
    next(new Error('No cookie found in request'));

    return;
  }

  try {
    const request = new Proxy(socket, {
      get: function(target, key) {
        if(key === 'cookies') {
          return parse(cookies);
        }

        return target.request[key];
      },
      set: function(target, key, value) {
        if(key !== 'user') {
          return true;
        }

        target.data.user = value;
        return true;
      }
    });

    verify(request, {}, next);
  } catch(e) {
    next(e);
  }
});

io.on('connection', function(socket) {
  const user = socket.data.user;
  socket.join(user.uid);
});

listen(function({ table, operation, room, data }) {
  io.to(room).emit(table, data);
});

console.log(`${ process.env.SERVICE } started @ http://0.0.0.0`);
