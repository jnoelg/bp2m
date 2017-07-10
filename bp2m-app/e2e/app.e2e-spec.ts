import { Bp2mAppPage } from './app.po';

describe('bp2m-app App', () => {
  let page: Bp2mAppPage;

  beforeEach(() => {
    page = new Bp2mAppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
