import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable()
export class SocketService {
  socket: any;
  private url = environment.API_URL;

  constructor() {
    this.socket = io.connect(this.url);
    this.socket
      .on('connection', socket => {
        socket.on('authenticated', () => {
          console.log('AUTHENTICATED');
        });
      })
      .emit('authenticate', { token: localStorage.getItem('token') })
      .emit('markOnline:set', { token: localStorage.getItem('token') });
  }

  socketConnect() {
    if (!this.socket) {
      this.socket = io.connect(this.url);
      this.socket.emit('authenticate', {
        token: localStorage.getItem('token')
      });
    }
    return this.socket;
  }
}
