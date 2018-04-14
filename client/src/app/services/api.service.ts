import { Injectable, Output, EventEmitter } from '@angular/core';
import { SocketService } from './socket.service';
import { UserService } from './user.service';
import { Http, Headers } from '@angular/http';
import { environment } from '../../environments/environment';

@Injectable()
export class ApiService {
  private API_URL = environment.API_URL;
  private socket: any;

  @Output() userInfo: EventEmitter<any> = new EventEmitter();
  @Output() updateInfo: EventEmitter<any> = new EventEmitter();
  @Output() list: EventEmitter<any> = new EventEmitter();
  @Output() messages: EventEmitter<any> = new EventEmitter();
  @Output() likedBy: EventEmitter<any> = new EventEmitter();
  @Output() viewedBy: EventEmitter<any> = new EventEmitter();
  @Output() convos: EventEmitter<any> = new EventEmitter();

  constructor(
    private socketService: SocketService,
    private _userService: UserService, private http: Http
  ) {
    this.socket = socketService.socketConnect();

    this.socket.on('userInfo:sent', data => {
        this.userInfo.emit(data);
    })

    this.socket.on('updateProfile:done', data => {
      this.updateInfo.emit(data)
    })

    this.socket.on('messages:post', data => {
      this.messages.emit(data);
    })

    this.socket.on('conversations:post', data => {
      this.convos.emit(data);
    })

    this.socket.on('search:post', data => {
      this.list.emit(data)
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
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    return this.http.get(this.API_URL + '/getProfile?username=' + username, { headers: headers })
      .map(res => res.json())
  }

  updateUserProfile(user) {
    this.socket.emit('updateProfile:set', user)
  }

  getList(user) {
    const headers = new Headers()

    headers.append('Content-Type', 'application/json')
    return this.http.post(this.API_URL + '/getList', { user }, { headers })
      .map(res => res.json())
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

  sendMessage(message, to, timestamp) {
    this.socket.emit('message:set', {message: message, to: to, from: this._userService.getCurrentUser(), timestamp: timestamp});
  }

  getConversations() {
    this.socket.emit('conversations:get', {username: this._userService.getCurrentUser()})
  }

  getMessages(from, to) {
    this.socket.emit('messages:get', {from: from, to: to})
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

  readConversation(person) {
    this.socket.emit('conversations:set', {buddy: person, currentUser: this._userService.getCurrentUser()});
  }
  forgotpassword(email) {
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    return this.http.post(this.API_URL + '/forgotpassword', {email: email}, { headers: headers })
      .map(res => res.json())
  }

  checkActivation(activation_uuid) {
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    return this.http.post(this.API_URL + '/checkActivation', { activation_uuid: activation_uuid }, { headers: headers })
      .map(res => res.json())
  }

  changePassword(password, username) {
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    return this.http.post(this.API_URL + '/changePassword', { password: password, username: username }, { headers: headers })
      .map(res => res.json())
  }

  changePasswordForgot(activation_uuid, password) {
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    return this.http
      .post(
        this.API_URL + '/changePasswordForgot',
        { activation_uuid: activation_uuid, password: password },
        { headers: headers }
      )
      .map(res => res.json())
  }

  markOffline(username) {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post(this.API_URL + '/logout', { username }, { headers: headers })
  }

}
