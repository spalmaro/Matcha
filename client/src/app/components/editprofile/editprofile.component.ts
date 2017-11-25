import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user'
import { ApiService } from '../../services/api.service'

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
  public user: User;

  constructor(private _apiService: ApiService) {
      this.user = new User({ firstname: '', lastname: '', email: '', username: '', password: '',
        lastConnected: Date.now(), description: '', dobday: 'Day', dobmonth: 'Month', gender: 'Gender', profilePicture: ''
      })
    // this._apiService.userInfo.subscribe(data => {
    //   if (data.success === true) {
    //     this.user = data.user;
    //   }
    // })
  }

  ngOnInit() {
  }

}
