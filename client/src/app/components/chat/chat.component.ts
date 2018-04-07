import { Component, OnInit } from '@angular/core';
import { ApiService } from 'app/services/api.service';
import { User } from 'app/models/user';
import { UserService } from 'app/services/user.service';
import { NotificationService } from 'app/services/notification.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  user: User = new User({})
  people = []
  constructor(private _apiService: ApiService,
  private _userService: UserService, private _notificationService: NotificationService) { }

  ngOnInit() {

    this._userService.getUserInfo().subscribe(data => {
      if (data.user) {
        this.user = data.user;
        this._apiService.getConversations();
      }
    })

    this._apiService.convos.subscribe(list => {
      if (list.result) {
        this.people = list.result;
      }
    })

    this._notificationService.readMessages()

  }

  markConversationRead(person) {
    this._apiService.readConversation(person);
  }

}
