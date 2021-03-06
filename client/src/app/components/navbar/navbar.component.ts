import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { ApiService } from 'app/services/api.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  public notiftotal = 0;
  public search = '';
  public newmsgs = 0;
  username;

  constructor(private _userService: UserService,
    private _apiService: ApiService, private _notificationService: NotificationService, private router: Router) { }

  ngOnInit() {
    this._userService.getUserInfo().subscribe(data => {
      if (data.success === true) {
        setInterval(() => {
          this._notificationService.getNotifications(data.user);
        }, 1000);
        this.username = data.user.username;
      }
    });
    this._notificationService.unreadnotifs.subscribe(data => {
      this.notiftotal = data;
    });

    this._notificationService.unreadMsgs.subscribe(data => {
      this.newmsgs = data;
    });
  }

  markAllRead(event: Event) {
    event.preventDefault();
    event.stopPropagation();


  }

  searchUser(e) {
    if (e.keyCode === 13) {
      this.router.navigateByUrl('/search/' + this.search);
      location.reload();
      this.search = '';
    }
  }

  logout() {
   this._apiService.markOffline(this.username).subscribe(
     {
        next: (val) => {
        },
        complete: () => {
    //  const response = res.json();
    //  if (response.success) {
          this._userService.logout();
          this.router.navigate(['/']);
        }
    //  }
   })
  }

  stop(event) {
    event.stopPropagation();
  }
}
