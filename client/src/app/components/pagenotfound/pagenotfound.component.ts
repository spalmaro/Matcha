import { Component, OnInit } from '@angular/core';
import { UserService } from 'app/services/user.service';

@Component({
  selector: 'app-pagenotfound',
  templateUrl: './pagenotfound.component.html',
  styleUrls: ['./pagenotfound.component.css']
})
export class PagenotfoundComponent implements OnInit {
  user: string;
  constructor(private _userService: UserService) { }

  ngOnInit() {
    this.user = this._userService.getCurrentUser();
  }

}
