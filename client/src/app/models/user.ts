import { SafeUrl } from '@angular/platform-browser/src/security/dom_sanitization_service';

export class User {
         public firstname: String;
         public lastname: String;
         public email: String;
         public gender: String;
         public username: String;
         public password: String;
         public lastConnected: Date;
         public description: String;
         public dobday: Number;
         public dobmonth: String;
         public dobyear: String;
         public orientation: String;
         public profilePicture: SafeUrl;
         public firstConnection: Boolean;
         public age: Number;
         public score: Number;
         public interests: Array<String>;

         constructor(data: any) {
           this.firstname = data.firstname;
           this.lastname = data.lastname;
           this.email = data.address;
           this.gender = data.gender;
           this.username = data.username;
           this.password = data.email;
           this.lastConnected = data.lastConnected;
           this.description = data.description;
           this.dobday = data.dobday;
           this.dobmonth = data.dobmonth;
           this.dobyear = data.dobyear;
           this.orientation = data.orientation;
           this.profilePicture = data.profilePicture;
           this.firstConnection = data.firstConnection;
           this.age = data.age;
           this.score = data.score;
           this.interests = data.interests;
         }
       }
