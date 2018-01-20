import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service'
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  public notifications;
  public notiftotal = 0;
  public newmsgs = 0;

  constructor(private _userService: UserService, private router: Router) { }

  ngOnInit() {

  }

  logout() {
    this._userService.logout();
    this.router.navigate(['/']);
  }
}
