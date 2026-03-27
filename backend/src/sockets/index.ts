import { Server as IOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

export let io: IOServer;

export const setupSockets = (server: HttpServer) => {
    io = new IOServer(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'PUT']
        }
    });

    io.on('connection', (socket: Socket) => {
        console.log(`Socket connected: ${socket.id}`);

        socket.on('join_order_room', (orderId: string) => {
            if (orderId) {
                socket.join(`order_${orderId}`);
                console.log(`Socket ${socket.id} joined room order_${orderId}`);
            }
        });

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
};

export const updateOrderStatus = (orderId: string, status: string) => {
    if (io) {
        io.to(`order_${orderId}`).emit('orderStatusUpdated', { orderId, status });
    }
};
