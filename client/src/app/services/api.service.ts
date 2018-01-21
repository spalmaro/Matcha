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
  @Output() messages: EventEmitter<any> = new EventEmitter();
  @Output() profile: EventEmitter<any> = new EventEmitter();
  @Output() likedBy: EventEmitter<any> = new EventEmitter();
  @Output() viewedBy: EventEmitter<any> = new EventEmitter();

  constructor(
    private socketService: SocketService,
    private _userService: UserService
  ) {
    this.socket = socketService.socketConnect();

    this.socket.on('userInfo:sent', data => {
      console.log('LIKED BY', data)
        this.userInfo.emit(data);
    })

    this.socket.on('updateProfile:done', data => {
      this.updateInfo.emit(data)
    })

    this.socket.on('list:post', list => {
      this.list.emit(list);
    })

    this.socket.on('messages:post', data => {
      this.messages.emit(data);
    })

    this.socket.on('search:post', data => {
      this.list.emit(data)
    })

    this.socket.on('profile:post', data => {
      this.profile.emit(data);
    })

    this.socket.on('likeby:post', data => {
      this.likedBy.emit(data);
    })

    this.socket.on('viewdby:post', data => {
      this.viewedBy.emit(data);
    })
  }

  getUserInfo() {
    this.socket.emit('userInfo:get', this._userService.getCurrentUser());
  }

  getProfile(username) {
    this.socket.emit('profile:get', username);
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

  sendMessage(message) {
    this.socket.emit('message:set', message);
  }

  getMessages(user) {
    this.socket.emit('messages:get', user)
  }

  setVisit(username) {
    this.socket.emit('visit:set', { currentUser: this._userService.getCurrentUser(), username: username });
  }

  reportUser(userToReport) {
    this.socket.emit('report:set', {userToReport: userToReport, currentUser: this._userService.getCurrentUser()})
  }

  blockUser(blockedUser) {
    this.socket.emit('block:set', {blockedUser: blockedUser, currentUser: this._userService.getCurrentUser()})
  }

  getLikedByUsers() {
    this.socket.emit('likeby:get', this._userService.getCurrentUser())
  }

  getVisitedByUsers() {
    this.socket.emit('viewedby:get', this._userService.getCurrentUser())
  }
}
