import { MatchaPage } from './app.po';

describe('matcha App', () => {
  let page: MatchaPage;

  beforeEach(() => {
    page = new MatchaPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
