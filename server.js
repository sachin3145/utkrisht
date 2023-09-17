const Express = require('express');
const http = require('http');
const ACTIONS = require('./src/Actions');
const { Server } = require('socket.io');
const { rmSync } = require('fs');
const { Socket } = require('socket.io-client');
const path = require('path');
const codeRunner = require("./codeRunner");
const app = Express();
const server = http.createServer(app);
const io = new Server(server);

app.use(Express.static('build'));
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html')); 
});


const userSocketMap = {};

function getAllConnectedClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(socketId => {
        return {
            socketId,
            userName: userSocketMap[socketId]
        }
    });
}

io.on('connection', socket => {
    socket.on(ACTIONS.JOIN, ({roomId, userName}) => {
        userSocketMap[socket.id] = userName;
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                userName,
                socketId: socket.id,
            });
        })
    });
    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, {
            code
        });
    })

    socket.on(ACTIONS.INPUT_CHANGE, ({ roomId, inputText }) => {
      socket.in(roomId).emit(ACTIONS.INPUT_CHANGE, {
        inputText,
      });
    });

  socket.on(ACTIONS.RUN_CODE, ({ roomId, language, code, input }) => {
        codeRunner(language, code, input).then(data => {
          // {"stdout":"1\n","error":"","stderr":""}
          const clients = getAllConnectedClients(roomId);
          clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.OUTPUT_CHANGE, {
              data,
            });
          });
        });
    });

    socket.on(ACTIONS.LANGUAGE_CHANGE, ({ roomId, language }) => {
      socket.in(roomId).emit(ACTIONS.LANGUAGE_CHANGE, {
        language,
      });
    });

    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, {
        code
      });
    });

    socket.on(ACTIONS.SYNC_LANGUAGE, ({ socketId, language }) => {
      io.to(socketId).emit(ACTIONS.LANGUAGE_CHANGE, {
        language,
      });
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach(roomId => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                userName: userSocketMap[socket.id]
            });
        })
        delete userSocketMap[socket.id];
        socket.leave();
    });
})

const PORT = process.env.PORT || 5000;
server.listen(PORT);