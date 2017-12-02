import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router'
import { User } from '../../models/user'
import { UserService } from '../../services/user.service'

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {
  public months = ['January', 'February', 'March',
  'April', 'May', 'June', 'July', 'August', 'September',
  'October', 'November', 'December']

  public days = ['1', '2', '3', '4', '5', '6', '7', '8',
  '9', '10', '11', '12', '13', '14', '15', '16', '17', '18',
  '19', '20', '21', '22', '23', '24', '25', '26', '27', '28',
  '29', '30', '31']

  public gender = ['Male', 'Female']
  public user: User
  public login: {'username': String, 'password': String};
  public isSuccess = false;
  public message = '';
  public isError = false;
  public error = '';


  constructor(private router: Router, private _userService: UserService) {
  this.user = new User({
    firstname: '', lastname: '', email: '', username: '', password: '',
    lastConnected: Date.now(), description: '', dobday: 'Day', dobmonth: 'Month', gender: 'Gender', profilePicture: ''
  })

  this.login = { 'username': '', 'password': ''}
}

  ngOnInit() {
  }

  onLoginSubmit() {
    this._userService.authenticateUser(this.login).subscribe(data => {
      if (data.success) {
        this._userService.storeUserData(data.token, data.user);
        if (data.firstConnection === true) {
          this.router.navigate(['/editprofile']);
        } else {
          this.router.navigate(['/home']);
        }
      } else {
        console.log('Unsuccessful login');
        this.error = data.msg;
        this.isError = true;
        this.router.navigate(['/']);
      }
    })
  }

  onSignupSubmit() {
    console.log('####USER', this.user)
    this._userService.signUpUser(this.user).subscribe(data => {
      if (data.success) {
        console.log('Successful signup')
        this.isSuccess = true;
        this.message = data.msg;
      } else {
        console.log('Unsuccessful signup')
        this.error = data.msg
        this.isError = true;
        this.router.navigate(['/'])
      }
    })
  }

}