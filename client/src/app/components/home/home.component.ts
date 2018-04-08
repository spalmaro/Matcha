import { Component, OnInit } from '@angular/core';
import { Search } from '../../models/search'
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SliderModule } from 'primeng/slider';
import { User } from '../../models/user'
import { ApiService } from 'app/services/api.service';
import { UserService } from 'app/services/user.service'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public search = new Search({ distance: 160, interests: [] });
  public user: User;
  public list: User[] = [];
  profilepicture;
  picture1;
  picture2;
  picture3;
  picture4;
  searched = false;

  ageInterval = [18, 65];
  scoreInterval = [0, 100];

  constructor(
    private _apiService: ApiService,
    private _userService: UserService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.ageInterval = [18, 65];
    this.scoreInterval = [0, 100];

    this._userService.getUserInfo().subscribe(data => {
      if (data.success === true) {
        this.user = data.user;
        this._apiService.getList(this.user);
      }
    });
    this._apiService.list.subscribe(data => {
      console.log('GOT LIST', data)
      this.list = data;
      for (const user of this.list) {
        if (user.profilepicture !== null || user.profilepicture !== '') {

          this.profilepicture  = this.sanitizer.bypassSecurityTrustUrl(
            (user.profilepicture as string).slice(
              4,
              (user.profilepicture as string).length - 1
            )
          );
        }
        if (user.picture1 !== null || user.picture1 !== '') {
          this.picture1 = this.sanitizer.bypassSecurityTrustUrl(
            (user.picture1 as string).slice(
              4,
              (user.picture1 as string).length - 1
            )
          );
        }
        if (user.picture2 !== null || user.picture2 !== '') {
          this.picture2 = this.sanitizer.bypassSecurityTrustUrl(
            (user.picture2 as string).slice(
              4,
              (user.picture2 as string).length - 1
            )
          );
        }
        if (user.picture3 !== null || user.picture3 !== '') {
          this.picture3 = this.sanitizer.bypassSecurityTrustUrl(
            (user.picture3 as string).slice(
              4,
              (user.picture3 as string).length - 1
            )
          );
        }
        if (user.picture4 !== null || user.picture4 !== '') {
          this.picture4 = this.sanitizer.bypassSecurityTrustUrl(
            (user.picture4 as string).slice(
              4,
              (user.picture4 as string).length - 1
            )
          );
        }
      }
    });
  }

  addInterest(event, interest) {
    if (event.keyCode === 13) {
      this.search.interests.push('#' + interest.value);
      interest.value = '';
    }
  }

  submitSearch(event) {
    [this.search.startAge, this.search.endAge] = this.ageInterval;
    [this.search.startScore, this.search.endScore] = this.scoreInterval;
    this._apiService.searchList(this.search, this.user);
    this.searched = true;
  }

  setLikeDislike(status: string) {
    this._apiService.setLikeDislike(status, this.list[0].username);
    this.list.shift();
    // if (this.list.length === 0 && !this.searched) {
    //   this._apiService.getList(this.user);
    // } else if (this.searched) {
    //   this._apiService.searchList(this.search, this.user);
    // }
  }

  removeInterest(index) {
    this.search.interests.splice(index, 1);
  }
}
