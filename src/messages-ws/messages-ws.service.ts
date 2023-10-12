import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Socket } from 'socket.io';

import { ConnectedClients } from './interfaces/connected-clients.interfaces';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class MessagesWsService {
  private _connectedClients: ConnectedClients = {};

  constructor(
    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
  ) {}

  async registerClient(client: Socket, userId: string) {
    const user = await this._userRepository.findOneBy({ id: userId });

    if (!user) throw new Error('User not found');
    if (!user.isActive) throw new Error('User not active');

    this._checkUserConnection(user);

    this._connectedClients[client.id] = {
      socket: client,
      user,
    };
  }

  removeClient(clientId: string) {
    delete this._connectedClients[clientId];
  }

  getConnectedClients(): string[] {
    return Object.keys(this._connectedClients);
  }

  getUserFullNameBySocketID(socketId: string): string {
    return this._connectedClients[socketId].user.fullName;
  }

  private _checkUserConnection(user: User) {
    for (const clientId of Object.keys(this._connectedClients)) {
      const connectedClient = this._connectedClients[clientId];

      if (connectedClient.user.id === user.id) {
        connectedClient.socket.disconnect();
        break;
      }
    }
  }
}
