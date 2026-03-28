import { Server as IOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
export declare let io: IOServer;
export declare const setupSockets: (server: HttpServer) => void;
export declare const updateOrderStatus: (orderId: string, status: string) => void;
//# sourceMappingURL=index.d.ts.map