import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-changepwd',
  templateUrl: './changepwd.component.html',
  styleUrls: ['./changepwd.component.css']
})
export class ChangepwdComponent implements OnInit {
  isLogged: boolean;
  activation_uuid: string;
  isError = false;
  status = '';
  password = '';
  repeatpwd = '';
  notMatch = true;

  constructor(private _apiService: ApiService, private _userService: UserService,
    private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.activation_uuid = params['id'] ? params['id'] : '';
      console.log(this.activation_uuid)
      if (this.activation_uuid.length) {
        this._apiService.checkActivation(this.activation_uuid).subscribe(result => {
          console.log(result)
          if (result.success === false) {
            this.isError = true;
          } else if (result['status'] === 'valid') {
            this.isError = false;
            this.status = 'valid'
          } else if (result['status'] === 'resent') {
            this.isError = false;
            this.status = 'resent';
          }
        })
        this.isLogged = false;
      } else {
        this.isLogged = true;
      }
    })
  }

  changePassword() {
    if (this.isLogged === true) {
      this._apiService.changePassword(this.password, this._userService.getCurrentUser()).subscribe(result => {
        if (result.success === true) {
          this.status = 'changed';
          setTimeout(() => {
            this.router.navigate(['/editprofile']);
          }, 3000);
        } else {
          this.status = 'error';
        }
      })
    } else {
      this._apiService.changePasswordForgot(this.activation_uuid, this.password).subscribe(res => {
        if (res.success === true) {
          this._userService.storeUserData(res.token, res.username);
          this.status = 'changed';
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 3000);
        } else {
          this.status = 'error';
        }
      })
    }
  }

  passwordMatch() {
    if (this.password !== this.repeatpwd) {
      this.notMatch = true;
    } else {
      this.notMatch = false;
    }
  }

}
