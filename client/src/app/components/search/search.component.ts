import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'app/models/user';
import { ParamMap } from '@angular/router/src/shared';
import { ApiService } from 'app/services/api.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  profile: User;
  currentUser: User;

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer,
  private router: Router, private _apiService: ApiService) { }

  ngOnInit() {
    const username = this.route.snapshot.paramMap.get('username');
    this.profile = new User({});
    this.currentUser = new User({});
    this._apiService.getProfile(username);
    this._apiService.getUserInfo();

    this._apiService.profile.subscribe(data => {
      if (data.username) {
          this._apiService.setVisit(username);
          const table = [data.profilePicture, data.picture1, data.picture2, data.picture3, data.picture4];
          const table2 = [this.profile.profilePicture, this.profile.picture1, this.profile.picture2,
             this.profile.picture3, this.profile.picture4];

          for (const i in table) {
            if (table[i] !== null || table[i] !== '') {
              table2[i] = this.sanitizer.bypassSecurityTrustUrl(table[i]);
            }
          }
        this.profile = data;
      } else {
        this.router.navigateByUrl('/profile');
      }
    })

    this._apiService.userInfo.subscribe(data => {
      if (data.user) {
        this.currentUser = data.user;
      }
    })
  }

  reportUser(event: Event) {
    event.stopPropagation();
    // event.preventDefault();
    if (confirm('Are you sure you want to report this user as a fake account?')) {
      this._apiService.reportUser(this.profile.username)
    }
  }

  setLikeDislike(status: string) {
    this._apiService.setLikeDislike(status, this.profile.username);
  }
}
