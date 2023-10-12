import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

import { ConnectedClients } from './interfaces/connected-clients.interfaces';

@Injectable()
export class MessagesWsService {
  private _connectedClients: ConnectedClients = {};

  registerClient(client: Socket) {
    this._connectedClients[client.id] = client;
  }

  removeClient(clientId: string) {
    delete this._connectedClients[clientId];
  }

  getConnectedClients(): number {
    return Object.keys(this._connectedClients).length;
  }
}
