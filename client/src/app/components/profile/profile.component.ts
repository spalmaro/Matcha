import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user'
import { ApiService } from '../../services/api.service'
import { Router } from '@angular/router'

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  public user: User;
  public upload = false;

  constructor(private _apiService: ApiService, private router: Router) {
    this.user = new User({ firstname: '', lastname: '', email: '', username: '', password: '',
        lastConnected: Date.now(), description: '', dobday: 'Day', dobmonth: 'Month', gender: 'Gender', profilePicture: ''})

  this._apiService.userInfo.subscribe(data => {
      if (data.success === true) {
        this.user = data.user;
        this.user.firstConnection = false;
        // console.log('####DATA', data)
      }
    })

    this._apiService.getUserInfo();
  }

  ngOnInit() {
  }

  uploadPicture(event: any) {
    const pictureFile: HTMLInputElement = event.target || event.srcElement || event.currentTarget;
    const formData = new FormData();
    const username: any = this.user.username;
    formData.append('file', pictureFile.files.item(0));
    formData.append('username', username);
  }

  showPopup(show: Boolean) {
    if (show === true) {
      this.upload = true;
    } else {
      this.upload = false;
    }
  }

  addInterest(event: any, interest) {
    if (event.keyCode === 13) {
      this._apiService.updateUserProfile(this.user);
      interest.value = '';
    }
  }
}
