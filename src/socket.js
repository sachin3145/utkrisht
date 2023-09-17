import { io } from "socket.io-client"

async function initSocket() {
    const options = {
        'force-new-connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000,
        transports: ['websocket']
    };
    return io(process.env.REACT_APP_BACKEND_URL, options);
}

export {initSocket}