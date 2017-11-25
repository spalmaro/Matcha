import { Injectable, Output, EventEmitter } from '@angular/core';
import { SocketService } from './socket.service';
import { UserService } from './user.service';

@Injectable()
export class ApiService {
  // private apiUrl = environment.API_URL;
  private socket: any;

  @Output() userInfo: EventEmitter<any> = new EventEmitter();

  constructor(
    private socketService: SocketService,
    private _userService: UserService
  ) {
    // this.socket = socketService.socket();

    // this.socket.on('userInfo:sent', data => {
    //     this.userInfo.emit(data);
    // })
  }

  getUserInfo() {
    // this.socket.emit('userInfo:get', this._userService.getCurrentUser());
  }
}
