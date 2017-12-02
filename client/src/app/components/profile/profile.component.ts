import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user'
import { ApiService } from '../../services/api.service'
import { Router } from '@angular/router'
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  public user: User;
  public upload = false;

  constructor(private _apiService: ApiService, private router: Router, private sanitizer: DomSanitizer) {
    this.user = new User({ firstname: '', lastname: '', email: '', username: '', password: '',
        lastConnected: Date.now(), description: '', dobday: 'Day', dobmonth: 'Month', gender: 'Gender', profilePicture: ''})

  this._apiService.userInfo.subscribe(data => {
      if (data.success === true) {
        if (data.user.profilePicture != null) {
          this.user.profilePicture = this.sanitizer.bypassSecurityTrustUrl(data.user.profilePicture);
        }
        this.user = data.user;
        this.user.firstConnection = false;
        // console.log('####DATA', data)
      }
    })

    this._apiService.getUserInfo();
  }

  ngOnInit() {
  }

  base64Clean(base64) {
    const marker = ';base64,';
    const base64Index = base64.indexOf(marker) + marker.length;
    const base64string = base64.substring(base64Index);
    return (base64string);
  }

  uploadPicture(event: any) {
    const pictureFile: HTMLInputElement = event.target || event.srcElement || event.currentTarget;
    const myReader: FileReader = new FileReader();
    let toclean;
    myReader.readAsDataURL(pictureFile.files.item(0));
    const that = this;
    myReader.onloadend = function(loadEvent: any) {
      toclean = loadEvent.target.result;
      that.user.profilePicture = that.base64Clean(toclean);
      that._apiService.updateUserProfile(that.user);
    };
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
