import { expect, fixture, html } from '@open-wc/testing';

describe('<sl-carousel>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <sl-carousel></sl-carousel> `);

    expect(el).to.exist;
  });
});
