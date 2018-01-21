import { Component, OnInit } from '@angular/core';
import { ApiService } from 'app/services/api.service';
import { UserService } from 'app/services/user.service';
import { NotificationService } from 'app/services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  public notifications = [];

  constructor(private _userService: UserService,
    private _apiService: ApiService,
    private _notificationService: NotificationService,
    private router: Router) { }

  ngOnInit() {
    this._apiService.getUserInfo();
    this._apiService.userInfo.subscribe(data => {
      if (data.success === true) {
        this._notificationService.getNotifications(data.user);
      }
    });

    this._notificationService.notifications.subscribe(data => {
      this.notifications = data;
    })

    this._notificationService.readNotifications()
  }

}
