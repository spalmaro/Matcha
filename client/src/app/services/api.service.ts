import { Injectable, Output, EventEmitter } from '@angular/core';
import { SocketService } from './socket.service';
import { UserService } from './user.service';

@Injectable()
export class ApiService {
  // private apiUrl = environment.API_URL;
  private socket: any;

  @Output() userInfo: EventEmitter<any> = new EventEmitter();
  @Output() updateInfo: EventEmitter<any> = new EventEmitter();
  @Output() list: EventEmitter<any> = new EventEmitter();

  constructor(
    private socketService: SocketService,
    private _userService: UserService
  ) {
    this.socket = socketService.socketConnect();

    this.socket.on('userInfo:sent', data => {
        this.userInfo.emit(data);
    })

    this.socket.on('updateProfile:done', data => {
      this.updateInfo.emit(data)
    })

    this.socket.on('list:post', list => {
      this.list.emit(list);
    })
  }

  getUserInfo() {
    this.socket.emit('userInfo:get', this._userService.getCurrentUser());
  }

  updateUserProfile(user) {
    console.log('##USER', user)
    this.socket.emit('updateProfile:set', user)
  }

  getList(user) {
    this.socket.emit('list:get', user);
  }
}
