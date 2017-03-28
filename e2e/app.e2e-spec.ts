import { GlowingBearPage } from './app.po';

describe('glowing-bear App', () => {
  let page: GlowingBearPage;

  beforeEach(() => {
    page = new GlowingBearPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
