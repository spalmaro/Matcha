import { Component, OnInit } from '@angular/core';
import { ApiService } from 'app/services/api.service';
import { UserService } from 'app/services/user.service';
import { User } from 'app/models/user';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment'

@Component({
  selector: 'app-chat-details',
  templateUrl: './chat-details.component.html',
  styleUrls: ['./chat-details.component.css']
})
export class ChatDetailsComponent implements OnInit {
  currentUser: User = new User({});
  chatBuddy: User = new User({});
  messages = {};
  message = '';

  constructor(private _apiService: ApiService, private _userService: UserService,
    private route: ActivatedRoute, private sanitizer: DomSanitizer, private router: Router) { }

  ngOnInit() {
    const username = this.route.snapshot.paramMap.get('username');

    this._apiService.getProfile(username).subscribe(data => {
      if (data.username) {
          this._apiService.setVisit(username);
          const table = [data.profilepicture, data.picture1, data.picture2, data.picture3, data.picture4];
          const table2 = [this.chatBuddy.profilepicture, this.chatBuddy.picture1, this.chatBuddy.picture2,
             this.chatBuddy.picture3, this.chatBuddy.picture4];

          for (const i in table) {
            if (table[i] !== null || table[i] !== '') {
              table2[i] = this.sanitizer.bypassSecurityTrustUrl(table[i]);
            }
          }
        this.chatBuddy = data;
      } else {
        this.router.navigateByUrl('/profile');
      }
    })

    this._userService.getUserInfo().subscribe(data => {
      if (data.user) {
        this.currentUser = data.user;
        this._apiService.getMessages(this.currentUser, this.chatBuddy.username);
      }
    })

     this._apiService.messages.subscribe(list => {
       console.log('LIST OF MESSAGES', list)
       
     });
  }

  sendMessage() {
    this._apiService.sendMessage(this.message, this.chatBuddy.username, new Date().getTime())
    this.message = '';
  }

}
