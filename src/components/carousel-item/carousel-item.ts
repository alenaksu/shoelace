import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import styles from './carousel-item.styles';
import type { CSSResultGroup } from 'lit';

/**
 * @since 2.0
 * @status experimental
 *
 *
 * @slot - The default slot.
 *
 */
@customElement('sl-carousel-item')
export default class SlCarouselItem extends LitElement {
  static styles: CSSResultGroup = styles;

  render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sl-carousel-item': SlCarouselItem;
  }
}
