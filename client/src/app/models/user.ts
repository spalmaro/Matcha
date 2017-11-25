export class User {
  public firstname: String
  public lastname: String
  public email: String
  public gender: String
  public username: String
  public password: String
  public lastConnected: Date
  public description: String
  public dobday: String
  public dobmonth: String
  public dobyear: String
  public profilePicture: String

  constructor(data: any) {
    this.firstname = data.firstname;
    this.lastname = data.lastname;
    this.email = data.address;
    this.gender = data.gender
    this.username = data.username;
    this.password = data.email;
    this.lastConnected = data.lastConnected;
    this.description = data.description;
    this.dobday = data.dobday;
    this.dobmonth = data.dobmonth;
    this.dobyear = data.dobyear;
    this.profilePicture = data.profilePicture
  }
}
