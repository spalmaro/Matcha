import { Component, OnInit } from '@angular/core';
import { ApiService } from 'app/services/api.service';
import { User } from 'app/models/user';
import { UserService } from 'app/services/user.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  user: User = new User({})
  people = []
  constructor(private _apiService: ApiService,
  private _userService: UserService) { }

  ngOnInit() {
    this._apiService.getUserInfo();

    this._apiService.userInfo.subscribe(data => {
      if (data.user) {
        this.user = data.user;
        this._apiService.getMessages(this.user)
      }
    })

    this._apiService.messages.subscribe(list => {
      for (const item of list) {
        if (item.users[0] !== this._userService.getCurrentUser()) {
          if (!this.people.includes(item.users[0])){
            this.people.push(item.users[0]);
          }
        } else {
          if (!this.people.includes(item.users[1])) {
            this.people.push(item.users[1]);
          }
        }
      }
    })

  }

}
