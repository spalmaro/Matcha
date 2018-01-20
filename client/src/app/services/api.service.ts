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
  @Output() notifications: EventEmitter<any> = new EventEmitter();
  @Output() messages: EventEmitter<any> = new EventEmitter();

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

    this.socket.on('notifications:post', data => {
      this.notifications.emit(data);
    })

    this.socket.on('messages:post', data => {
      this.messages.emit(data);
    })

    this.socket.on('search:post', data => {
      this.list.emit(data)
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

  searchList(search, user) {
    this.socket.emit('search:get', {search: search, user: user})
  }

  setLikeDislike(status, username) {
    this.socket.emit('status:set', {currentUser: this._userService.getCurrentUser(), subject: username, status: status})
  }

  getNotifications(user) {
    this.socket.emit('notifications:get', user);
  }

  readUnreadNotifications(notification) {
    this.socket.emit('notifications:set', notification);
  }

  sendMessage(message) {
    this.socket.emit('message:set', message);
  }

  getMessages(user) {
    this.socket.emit('messages:get', user)
  }

  setVisit(currentUser, username) {
    this.socket.emit('visit:set', { currentUser: currentUser, username: username });
  }
}
