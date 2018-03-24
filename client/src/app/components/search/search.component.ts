import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'app/models/user';
import { ParamMap } from '@angular/router/src/shared';
import { ApiService } from 'app/services/api.service';
import { UserService } from 'app/services/user.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  profile: User;
  currentUser: User;
  likesme: boolean = false;
  ilike = false;
  idislike = false;

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer,
  private router: Router, private _apiService: ApiService, private _userService: UserService) { }

  ngOnInit() {
    const username = this.route.snapshot.paramMap.get('username');
    this.profile = new User({});
    this.currentUser = new User({});
    this._apiService.getProfile(username);
    this._apiService.getLikedByUsers();

    this._apiService.profile.subscribe(data => {
      if (data.username) {
          this._apiService.setVisit(username);
          const table = [data.profilepicture, data.picture1, data.picture2, data.picture3, data.picture4];
          const table2 = [this.profile.profilepicture, this.profile.picture1, this.profile.picture2,
             this.profile.picture3, this.profile.picture4];

          for (const i in table) {
            if (table[i] !== null || table[i] !== '') {
              table2[i] = this.sanitizer.bypassSecurityTrustUrl(table[i]);
            }
          }
        this.profile = data;
        this._apiService.likedBy.subscribe((likes) => {
          console.log('PROFIL', likes)
          for (const d of likes) {
            if (d.subject === this.profile.username) {
              this.likesme = true
              return ;
            }
          }
        })
      } else {
        this.router.navigateByUrl('/profile');
      }
    })

    this._userService.getUserInfo().subscribe(data => {
      if (data.user) {
        this.currentUser = data.user;
        if (this.currentUser['liked'].includes(this.profile.username)) {
          this.ilike = true;
        } else if (this.currentUser['dislike'].includes(this.profile.username)) {
          this.idislike = true;
        }
      }
    })


  }

  reportUser(event: Event) {
    event.stopPropagation();
    if (confirm('Are you sure you want to report this user as a fake account?')) {
      this._apiService.reportUser(this.profile.username)
    }
  }

  setLikeDislike(status: string) {
    if (status === 'like') {
      this.ilike = true;
      this.idislike = false;
    } else {
      this.ilike = false;
      this.idislike = true;
    }
    this.idislike = status === 'dislike' ? true : false;
    this._apiService.setLikeDislike(status, this.profile.username);
  }

  setBlocked() {
    this._apiService.blockUser(this.profile.username)
    this.router.navigate(['/']);
  }
}
