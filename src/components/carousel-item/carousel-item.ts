import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { watch } from 'src/internal/watch';
import styles from './carousel-item.styles';
import type { CSSResultGroup } from 'lit';

/**
 * @since 2.0
 * @status experimental
 *
 * @property label - A description of the current slide
 *
 * @slot - The default slot.
 *
 */
@customElement('sl-carousel-item')
export default class SlCarouselItem extends LitElement {
  static styles: CSSResultGroup = styles;

  @property() label = '';

  firstUpdated() {
    this.setAttribute('role', 'group');
    this.setAttribute('aria-roledescription', 'slide');
  }

  @watch('label')
  handleLabelChange() {
    this.setAttribute('aria-label', this.label);
  }

  render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sl-carousel-item': SlCarouselItem;
  }
}
