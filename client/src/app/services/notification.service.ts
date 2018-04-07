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
  @Output() unreadMsgs: EventEmitter<any> = new EventEmitter();

  constructor(private socketService: SocketService, private _userService: UserService) {
    this.socket = socketService.socketConnect();

    this.socket.on('notifications:post', data => {
      let unread = 0;
      let msg_unread = 0;
      const final = [];
      for (const notif of data) {
        if (notif.notif_read === 'false' && notif.notif_type !== 'message') {
          unread += 1;
        } else if (notif.notif_read === 'false' && notif.notif_type === 'message') {
          msg_unread++;
        }
        if (notif.notif_type !== 'message') {
          notif.notif_date = moment(notif.notif_date).fromNow()
          notif['message'] = notif.notif_type === 'match' ? `New match with ` : `New ${notif.notif_type} from `
          final.push(notif)
        }
      }
      this.notifications.emit(final);
      this.unreadnotifs.emit(unread);
      this.unreadMsgs.emit(msg_unread);
    });
  }

  getNotifications(user) {
    this.socket.emit('notifications:get', user);
    clearInterval(this.interval)
  }

  readNotifications() {
    this.socket.emit('notifications:set', this._userService.getCurrentUser());
  }

  readMessages() {
    this.socket.emit('messages:set', this._userService.getCurrentUser());
  }
}
