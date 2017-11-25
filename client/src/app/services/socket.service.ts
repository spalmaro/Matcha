import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable()
export class SocketService {
  socket: any;
  private url = environment.API_URL;

  constructor() {
    this.socket = io(this.url)
    // this.connection = io.connect(this.url);
    // const that = this;

    // this.connection.on('connect', function() {
    //   that.connection.on('authenticated', function() {
    //     console.log('authenticated !');
    //   });

    //   that.connection.emit('authenticate', {
    //     token: localStorage.getItem('token')
    //   });
    // });
  }

  // socket() {
  //   if (!this.connection) {
  //     this.connection = io.connect(this.url);
  //     this.connection.emit('authenticate', {
  //       token: localStorage.getItem('token')
  //     });
  //   }
  //   return this.connection;
  // }
}
