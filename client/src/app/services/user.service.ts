import { Injectable, Output, EventEmitter } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map'
import { User } from '../models/user'
import { environment } from '../../environments/environment';
import { tokenNotExpired } from 'angular2-jwt';

@Injectable()
export class UserService {
  authToken: any
  private API_URL = environment.API_URL;
  private API_KEY = environment.API_KEY;

  constructor( private http: Http ) {}

  signUpUser(user) {
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    return this.http.post(this.API_URL + '/signup', user, { headers: headers })
      .map(res => res.json())
  }

  authenticateUser(user) {
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    return this.http.post(this.API_URL + '/login', user, { headers: headers })
      .map(res => res.json())
  }

  storeUserData(token, user) {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    sessionStorage.setItem('connected', 'true');
    sessionStorage.setItem('currentUser', user.username);
  }

  getCurrentUser() {
    return (sessionStorage.getItem('currentUser'));
  }

  getLocation(latitude, longitude) {
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    return this.http.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.API_KEY}`)
      .map(res => res.json())
  }

  getLocationBackup() {
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    return this.http.post(`https://www.googleapis.com/geolocation/v1/geolocate?key=${this.API_KEY}`, {})
      .map(res => res.json())
  }

  loadToken() {
    const token = localStorage.getItem('token')
    this.authToken = token;
  }

  loggedIn() {
    return tokenNotExpired('token')
  }

  logout() {
    sessionStorage.clear();
    localStorage.clear();
  }
}
