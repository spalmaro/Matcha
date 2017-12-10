import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { UserService } from './user.service';

@Injectable()
export class AuthGuardService2 implements CanActivate {
  constructor(public _userService: UserService, private router: Router) {}

  canActivate() {
    if (this._userService.loggedIn()) {
      this.router.navigate(['home']);
      return false;
    } else {
      return true;
    }
  }
}
