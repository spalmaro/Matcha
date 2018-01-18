export class Search {
  public startAge: Number;
  public endAge: Number;
  public startScore: Number;
  public endScore: Number;
  public distance: Number;
  public interests: Array<any>;


  constructor(data: any) {
    this.startAge = data.startAge;
    this.endAge = data.endAge;
    this.startScore = data.startScore;
    this.endScore = data.endScore;
    this.distance = data.distance;
    this.interests = data.interests;
  }
}
