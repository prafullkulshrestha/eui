import { ItemCreationMdmPage } from './app.po';

describe('item-creation-mdm App', () => {
  let page: ItemCreationMdmPage;

  beforeEach(() => {
    page = new ItemCreationMdmPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
