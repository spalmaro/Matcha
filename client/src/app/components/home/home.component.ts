import { Component, OnInit } from '@angular/core';
import { Search } from '../../models/search'
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SliderModule } from 'primeng/slider';
import { User } from '../../models/user'
import { ApiService } from 'app/services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public search = new Search({distance: 2, interests: []});
  public user: User;

  ageInterval = [18, 24];
  scoreInterval = [10, 100];


  constructor(private _apiService: ApiService) {
  }

  ngOnInit() {
    this._apiService.getUserInfo();
    this._apiService.userInfo.subscribe(data => {
      if (data.success === true) {
        this.user = data.user;
        this._apiService.getList(this.user);
      }
    });
  }

  addInterest(event: any, interest) {
    if (event.keyCode === 13) {
      this.search.interests.push('#' + interest.value);
      interest.value = '';
    }
  }

  submitSearch() {
    [this.search.startAge, this.search.endAge] = this.ageInterval;
    [this.search.startScore, this.search.endScore] = this.scoreInterval;
  }


}
