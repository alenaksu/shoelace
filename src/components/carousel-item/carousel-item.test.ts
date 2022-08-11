import { expect, fixture, html } from '@open-wc/testing';

describe('<sl-carousel-item>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <sl-carousel-item></sl-carousel-item> `);

    expect(el).to.exist;
  });
});
