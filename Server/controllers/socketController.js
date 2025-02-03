
const socketController = (io, socket) => {

    io.on('message', () => {
        socket.emit('message-reply', { message: 'cool boss'});
    });
}


export default socketController;