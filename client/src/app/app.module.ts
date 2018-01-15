import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http'

import { AppComponent } from './app.component';
import { IndexComponent } from './components/index/index.component';
import { ProfileComponent } from './components/profile/profile.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { EditprofileComponent } from './components/editprofile/editprofile.component'
import { HomeComponent } from './components/home/home.component'

import { AuthGuardService } from './services/auth-guard.service'
import { AuthGuardService2 } from './services/auth-guard2.service'
import { UserService } from './services/user.service';
import { ApiService } from 'app/services/api.service';
import { SocketService } from './services/socket.service';

const appRoutes: Routes = [
  { path: '', component: IndexComponent, canActivate: [AuthGuardService2] },
  { path: 'editprofile', component: EditprofileComponent, canActivate: [AuthGuardService] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuardService] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuardService] }
]

@NgModule({
  declarations: [
    AppComponent,
    IndexComponent,
    ProfileComponent,
    NavbarComponent,
    EditprofileComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [UserService, AuthGuardService, AuthGuardService2, ApiService, SocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
