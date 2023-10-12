import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { MessagesWsService } from './messages-ws.service';
import { NewMessageDto } from './dto/new-message.dto';

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

  @SubscribeMessage('message-from-client')
  handleMessageFromClient(client: Socket, payload: NewMessageDto) {
    //! Emite unicamente al cliente que envía el mensaje
    // client.emit('message-from-server', {
    //   fullName: 'yo',
    //   message: payload.message || 'no-message',
    // });

    //! Emite a todos menos al cliente inicial
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'yo',
    //   message: payload.message || 'no-message',
    // });

    this.wss.emit('message-from-server', {
      fullName: 'yo',
      message: payload.message || 'no-message',
    });
  }
}
