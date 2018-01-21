import { Injectable, Output, EventEmitter } from '@angular/core';
import 'rxjs/add/operator/map'
import { SocketService } from './socket.service';
import { UserService } from './user.service';
import * as moment from 'moment';

@Injectable()
export class NotificationService {
  private socket: any;
  private interval;

  @Output() notifications: EventEmitter<any> = new EventEmitter();
  @Output() unreadnotifs: EventEmitter<any> = new EventEmitter();

  constructor(private socketService: SocketService, private _userService: UserService) {
    this.socket = socketService.socketConnect();

    this.socket.on('notifications:post', data => {
      let unread = 0;
      for (const notif of data) {
        if (notif.read === false) {
          unread += 1;
        }
        notif.date = moment(notif.date).fromNow()
        notif['message'] = notif.type === 'match' ? `New ${notif.type} with ` : `New ${notif.type} from `
      }
      this.notifications.emit(data);
      this.unreadnotifs.emit(unread);
    });
  }

  getNotifications(user) {
    this.socket.emit('notifications:get', user);
    clearInterval(this.interval)
  }

  readNotifications() {
    console.log(this._userService.getCurrentUser());
    this.socket.emit('notifications:set', this._userService.getCurrentUser());
  }
}
