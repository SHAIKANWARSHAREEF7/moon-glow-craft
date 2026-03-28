"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.setupSockets = exports.io = void 0;
const socket_io_1 = require("socket.io");
const setupSockets = (server) => {
    exports.io = new socket_io_1.Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'PUT']
        }
    });
    exports.io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);
        socket.on('join_order_room', (orderId) => {
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
exports.setupSockets = setupSockets;
const updateOrderStatus = (orderId, status) => {
    if (exports.io) {
        exports.io.to(`order_${orderId}`).emit('orderStatusUpdated', { orderId, status });
    }
};
exports.updateOrderStatus = updateOrderStatus;
//# sourceMappingURL=index.js.map