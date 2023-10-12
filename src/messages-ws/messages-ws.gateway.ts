import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MessagesWsService } from './messages-ws.service';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly messagesWsService: MessagesWsService) {}

  handleConnection(client: Socket) {
    // console.log('Client connected: ', client.id);
    this.messagesWsService.registerClient(client);

    console.log({
      ConnectedClients: this.messagesWsService.getConnectedClients(),
    });
  }

  handleDisconnect(client: Socket) {
    // console.log('Client disconnected: ' + client.id);
    this.messagesWsService.removeClient(client.id);

    console.log({
      ConnectedClients: this.messagesWsService.getConnectedClients(),
    });
  }
}
