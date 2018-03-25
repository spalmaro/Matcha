import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http'
import { Ng4GeoautocompleteModule } from 'ng4-geoautocomplete';

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
import { NotificationService } from './services/notification.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChatComponent } from './components/chat/chat.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { SearchComponent } from './components/search/search.component';
import { PagenotfoundComponent } from './components/pagenotfound/pagenotfound.component';
import { ChatDetailsComponent } from './components/chat-details/chat-details.component';
import { SliderModule } from 'primeng/slider';
import { MatMenuModule } from '@angular/material/menu';
import {MatInputModule } from '@angular/material/input';
import { ChangepwdComponent } from './components/changepwd/changepwd.component';
import { ForgotpwdComponent } from './components/forgotpwd/forgotpwd.component';

const appRoutes: Routes = [
  { path: 'search/:username', component: SearchComponent, canActivate: [AuthGuardService]},
  { path: 'chat/:username', component: ChatDetailsComponent, canActivate: [AuthGuardService]},
  { path: 'search', redirectTo: '', canActivate: [AuthGuardService]},
  { path: '', component: IndexComponent, canActivate: [AuthGuardService2] },
  { path: 'editprofile', component: EditprofileComponent, canActivate: [AuthGuardService] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuardService] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuardService] },
  { path: 'chat', component: ChatComponent, canActivate: [AuthGuardService]},
  { path: 'notifications', component: NotificationsComponent, canActivate: [AuthGuardService]},
  { path: '**', component: PagenotfoundComponent}
]

@NgModule({
  declarations: [
    AppComponent,
    IndexComponent,
    ProfileComponent,
    NavbarComponent,
    EditprofileComponent,
    HomeComponent,
    ChatComponent,
    NotificationsComponent,
    SearchComponent,
    PagenotfoundComponent,
    ChatDetailsComponent,
    ChangepwdComponent,
    ForgotpwdComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(appRoutes),
    Ng4GeoautocompleteModule.forRoot(),
    ReactiveFormsModule,
    SliderModule,
    MatMenuModule
  ],
  providers: [
    UserService,
    AuthGuardService,
    AuthGuardService2,
    ApiService,
    SocketService,
    NotificationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
