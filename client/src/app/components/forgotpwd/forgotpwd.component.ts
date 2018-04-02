import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router'

@Component({
  selector: 'app-forgotpwd',
  templateUrl: './forgotpwd.component.html',
  styleUrls: ['./forgotpwd.component.css']
})
export class ForgotpwdComponent implements OnInit {
  email = '';
  invalidEmail = false;
  isSuccess = false;
  constructor(private _apiService: ApiService, private router: Router) { }

  ngOnInit() {
  }

  sendLink() {
    this._apiService.forgotpassword(this.email).subscribe(result => {
      if (result.success === true) {
        this.isSuccess = true;
        this.invalidEmail = false;
        setTimeout(() => {
          this.router.navigateByUrl('/');
        }, 4000);
      } else {
        this.invalidEmail = true;
      }
    })
  }

}
