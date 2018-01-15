import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user'
import { ApiService } from '../../services/api.service'
import { Router } from '@angular/router'
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-editprofile',
  templateUrl: './editprofile.component.html',
  styleUrls: ['./editprofile.component.css']
})

export class EditprofileComponent implements OnInit {
  public months = ['January', 'February', 'March',
  'April', 'May', 'June', 'July', 'August', 'September',
  'October', 'November', 'December']

  public days = ['1', '2', '3', '4', '5', '6', '7', '8',
  '9', '10', '11', '12', '13', '14', '15', '16', '17', '18',
  '19', '20', '21', '22', '23', '24', '25', '26', '27', '28',
  '29', '30', '31']

  public gender = ['Male', 'Female']

  public orientation = ['Guys', 'Girls', 'Both']
  public upload = false;
  public user: User;

  constructor(private _apiService: ApiService, private router: Router, private sanitizer: DomSanitizer) {
      this.user = new User({ firstname: '', lastname: '', email: '', username: '', password: '',
        lastConnected: Date.now(), description: '', dobday: 'Day', dobmonth: 'Month', gender: 'Gender', profilePicture: ''
      })

    this._apiService.userInfo.subscribe(data => {
      if (data.success === true) {
        if (data.user.profilePicture != null) {
          this.user.profilePicture = this.sanitizer.bypassSecurityTrustUrl(data.user.profilePicture);
        }
        this.user = data.user;
        if (this.user.firstConnection === true) {
          this.user.firstConnection = false;
          this._apiService.updateUserProfile(this.user);
        }
        console.log('####DATA', data)
      }
    })

    this._apiService.getUserInfo();

    this._apiService.updateInfo.subscribe(data => {
      console.log('PROFILE', data)
      if (data.success === true) {
        router.navigate(['profile'])
      }
    })
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

  onUpdateSubmit() {
    console.log(this.user);
    this._apiService.updateUserProfile(this.user);
  }

}
