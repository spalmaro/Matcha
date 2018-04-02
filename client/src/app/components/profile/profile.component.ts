import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user'
import { ApiService } from '../../services/api.service'
import { UserService } from '../../services/user.service'
import { Router } from '@angular/router'
import { DomSanitizer } from '@angular/platform-browser';
import { log } from 'util';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  public user: User;
  public upload = false;
  public picture: any;
  likeBy = [];
  viewedBy = [];

  constructor(private _apiService: ApiService, private _userService: UserService, private router: Router, private sanitizer: DomSanitizer) {
    this.user = new User({ firstname: '', lastname: '', email: '', username: '', password: '',
        lastconnected: Date.now(), description: '', dobday: '01', dobmonth: 'January', gender: 'Female', profilepicture: ''})
  }

  ngOnInit() {
    this._userService.getUserInfo().subscribe(data => {
    if (data.success === true) {
      const table = [data.user.profilepicture, data.user.picture1, data.user.picture2, data.user.picture3, data.user.picture4];
      const table2 = [this.user.profilepicture, this.user.picture1, this.user.picture2, this.user.picture3, this.user.picture4];
      for (const i in table) {
        if (table[i] !== null || table[i] !== '') {
          table2[i] = this.sanitizer.bypassSecurityTrustUrl(table[i]);
        }
      }
      this.user = data.user;
    }
  })

    this._apiService.getLikedByUsers();
    this._apiService.getVisitedByUsers();

    this._apiService.likedBy.subscribe(data => {
      console.log('LIKED BY', data)
      this.likeBy = data;
    })

    this._apiService.viewedBy.subscribe(data => {
      this.viewedBy = data;
    })
  }

  base64Clean(base64) {
    const marker = ';base64,';
    const base64Index = base64.indexOf(marker) + marker.length;
    const base64string = base64.substring(base64Index);
    const test = 'url(data:image/jpeg;base64,' + base64string + ')'; // added this for faker image urls to work
    return (test);
  }

  uploadPicture(event: any) {
    const numb = this.picture
    const pictureFile: HTMLInputElement = event.target || event.srcElement || event.currentTarget;
    const myReader: FileReader = new FileReader();
    let toclean;
    myReader.readAsDataURL(pictureFile.files.item(0));
    const that = this;
    myReader.onloadend = function(loadEvent: any) {
      const table = [that.user.profilepicture, that.user.picture1, that.user.picture2, that.user.picture3, that.user.picture4];
      toclean = loadEvent.target.result;
      if (that.picture === 0) {
        that.user.profilepicture = that.base64Clean(toclean);
      } else {
        const index = 'picture' + that.picture;
        that.user[index] = that.base64Clean(toclean);
      }
      that._apiService.updateUserProfile(that.user);
    };
  }

  showPopup(show: Boolean, picture: Number) {
    if (show === true) {
      this.upload = true;
      this.picture = picture;
    } else {
      this.upload = false;
    }
  }

  removePicture(picNbr: Number) {
    const index = 'picture' + picNbr;
    this.user[index] = '';
    this._apiService.updateUserProfile(this.user);
  }

  addInterest(event: any, interest) {
    if (event.keyCode === 13) {
      this.user.interests.push('#' + interest.value);
      this._apiService.updateUserProfile(this.user);
      interest.value = '';
    }
  }

  removeInterest(index) {
    this.user.interests.splice(index, 1)
    this._apiService.updateUserProfile(this.user);
  }
}
