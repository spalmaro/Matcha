import { SafeUrl } from '@angular/platform-browser/src/security/dom_sanitization_service';

export class User {
         public firstname: String;
         public lastname: String;
         public email: String;
         public gender: String;
         public username: String;
         public password: String;
         public lastconnected: Date;
         public description: String;
         public dobday: Number;
         public dobmonth: String;
         public dobyear: String;
         public orientation: String;
         public profilepicture: SafeUrl;
         public picture1: SafeUrl;
         public picture2: SafeUrl;
         public picture3: SafeUrl;
         public picture4: SafeUrl;
         public firstconnection: Boolean;
         public age: Number;
         public score: Number;
         public interests: Array<String>;
         public location: Object;
         public address: String;
         public online: boolean;

         constructor(data: any) {
           this.firstname = data.firstname;
           this.lastname = data.lastname;
           this.email = data.address;
           this.gender = data.gender;
           this.username = data.username;
           this.password = data.email;
           this.lastconnected = data.lastconnected;
           this.description = data.description;
           this.dobday = data.dobday;
           this.dobmonth = data.dobmonth;
           this.dobyear = data.dobyear;
           this.orientation = data.orientation;
           this.profilepicture = data.profilepicture;
           this.firstconnection = data.firstconnection;
           this.age = data.age;
           this.score = data.score;
           this.interests = data.interests;
           this.picture1 = data.picture1;
           this.picture2 = data.picture2;
           this.picture3 = data.picture3;
           this.picture4 = data.picture4;
           this.location = data.location;
           this.address = data.address;
           this.online = data.online;
         }
       }
