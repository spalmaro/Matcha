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
  public search = new Search({distance: 160, interests: []});
  public user: User;
  public list: User[] = [];

  ageInterval = [18, 65];
  scoreInterval = [0, 100];


  constructor(private _apiService: ApiService, private _userService: UserService, private sanitizer: DomSanitizer) {
  }

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
      this.list = data;
    })
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
  }

  setLikeDislike(status: string) {
    this._apiService.setLikeDislike(status, this.list[0].username);
    this.list.shift();
    if (this.list.length === 0) {
      this._apiService.getList(this.user);
    }
  }


}
