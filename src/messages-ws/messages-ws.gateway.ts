import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { MessagesWsService } from './messages-ws.service';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  constructor(private readonly messagesWsService: MessagesWsService) {}

  handleConnection(client: Socket) {
    // console.log('Client connected: ', client.id);
    this.messagesWsService.registerClient(client);

    // console.log({
    //   ConnectedClients: this.messagesWsService.getConnectedClients(),
    // });

    this.wss.emit(
      'client-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }

  handleDisconnect(client: Socket) {
    // console.log('Client disconnected: ' + client.id);
    this.messagesWsService.removeClient(client.id);

    // console.log({
    //   ConnectedClients: this.messagesWsService.getConnectedClients(),
    // });

    this.wss.emit(
      'client-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }
}
