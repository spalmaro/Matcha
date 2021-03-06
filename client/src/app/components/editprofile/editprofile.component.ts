import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { User } from '../../models/user'
import { ApiService } from '../../services/api.service'
import { Router } from '@angular/router'
import { DomSanitizer } from '@angular/platform-browser';
import { UserService } from '../../services/user.service'
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  selector: 'app-editprofile',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './editprofile.component.html',
  styleUrls: ['./editprofile.component.css']
})

export class EditprofileComponent implements OnInit {
  public months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December']

  public days = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18',
  '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31']

  public gender = ['Male', 'Female']

  public orientation = ['Guys', 'Girls', 'Both']
  public upload = false;
  public user: User;
  public locationInput: Object;

  public userSettings: any = {
    showRecentSearch: false,
    showCurrentLocation: false,
    showSearchButton: false,
    inputPlaceholderText: ''
  }

  constructor(private _apiService: ApiService, private _userService: UserService, private router: Router, private sanitizer: DomSanitizer) {
      this.user = new User({ firstname: '', lastname: '', email: '', username: '', password: '',
        lastconnected: Date.now(), description: '', dobday: 'Day', dobmonth: 'Month', gender: 'Gender', profilepicture: ''
      })

      this._userService.getUserInfo().subscribe(data => {
        if (data.success === true) {
          if (data.user.profilepicture != null) {
            this.user.profilepicture = this.sanitizer.bypassSecurityTrustUrl(data.user.profilepicture);
          }
          this.user = data.user;
          const test = document.getElementById('search_places') as HTMLInputElement;
          if (test) {
            test.value = this.user.address as string;
          }
          if (this.user.firstconnection === true) {
            this.user.firstconnection = false;
            if (navigator.geolocation) {
              console.log('In here')
              navigator.geolocation.getCurrentPosition(this.setLocation.bind(this), this.setLocationBackup.bind(this));
            }
          }
          console.log('####DATA', data)
      }
    })
  }

  ngOnInit() {
    this.userSettings = Object.assign({}, this.userSettings);
  }

  base64Clean(base64) {
    const marker = ';base64,';
    const base64Index = base64.indexOf(marker) + marker.length;
    const base64string = base64.substring(base64Index);
    const test = 'url(data:image/jpeg;base64,' + base64string + ')';
    return (test);
  }

  uploadPicture(event: any) {
    const pictureFile: HTMLInputElement = event.target || event.srcElement || event.currentTarget;
    const myReader: FileReader = new FileReader();
    let toclean;
    myReader.readAsDataURL(pictureFile.files.item(0));
    const that = this;
    myReader.onloadend = function(loadEvent: any) {
      toclean = loadEvent.target.result;
      that.user.profilepicture = that.base64Clean(toclean);
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
    this.router.navigate(['profile'])
  }

  setLocation(position) {
    if (position) {
      const {latitude, longitude} = position.coords;
      this._userService.getLocation(latitude, longitude).subscribe(data => {
        this.user.address = data.results[4].formatted_address;
        this.user.location = { x: longitude, y: latitude };
        this._apiService.updateUserProfile(this.user);
        const test = document.getElementById('search_places') as HTMLInputElement;
        if (test) {
          test.value = this.user.address as string;
        }
      })
    } else {
      this.setLocationBackup();
    }
  }

  setLocationBackup() {
      this._userService.getLocationBackup().subscribe(data => {
        const {lat, lng} = data.location;
        this._userService.getLocation(lat, lng).subscribe(result => {
          this.user.address = result.results[4].formatted_address;
          this.user.location = { x: lng, y: lat };
          const test = document.getElementById('search_places') as HTMLInputElement;
          if (test) {
            test.value = this.user.address as string;
          }
          this._apiService.updateUserProfile(this.user);
      })
      })
  }

  autoCompleteCallback(selectedData: any) {
    if (selectedData.data) {
      const {lat, lng} = selectedData.data.geometry.location;
      this.user.address = selectedData.data.formatted_address;
      this.user.location = {x: lng, y: lat};
    }
  }

}
