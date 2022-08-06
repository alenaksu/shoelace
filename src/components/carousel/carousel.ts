import { LitElement, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { map } from 'lit/directives/map.js';
import { range } from 'lit/directives/range.js';
import styles from './carousel.styles';
import type { CSSResultGroup } from 'lit';

/**
 * @since 2.0
 * @status experimental
 *
 * @dependency sl-example
 *
 * @event sl-event-name - Emitted as an example.
 *
 * @slot - The default slot.
 * @slot example - An example slot.
 *
 * @csspart base - The component's internal wrapper.
 *
 * @cssproperty --example - An example CSS custom property.
 */
@customElement('sl-carousel')
export default class SlCarousel extends LitElement {
  static styles: CSSResultGroup = styles;

  /** The carousel's heading. */
  @property() heading = 'example';

  @query('slot:not([name])') defaultSlot: HTMLSlotElement;
  @query('.carousel__slides') slidesContainer: HTMLDivElement;

  @state() currentSlide: HTMLElement;

  private slides = this.getElementsByTagName('sl-carousel-slide');
  private firstSlideClone: HTMLElement;
  private lastSlideClone: HTMLElement;
  private intersectionObserver: IntersectionObserver;

  getSlides({ excludeClones = true }: { excludeClones?: boolean } = {}) {
    return [...this.slides].filter(slide => !excludeClones || !slide.hasAttribute('data-clone'));
  }

  handleSlideIntersection = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
    const [currentEntry] = entries.filter(entry => entry.isIntersecting);
    if (!currentEntry) {
      return;
    }

    const currentSlide = currentEntry.target as HTMLElement;

    const slides = this.getSlides();

    if (currentSlide === this.lastSlideClone) {
      slides.at(-1)?.scrollIntoView({ block: 'nearest' });
    } else if (currentSlide === this.firstSlideClone) {
      slides.at(0)?.scrollIntoView({ block: 'nearest' });
    } else {
      this.currentSlide = currentSlide;
    }
  };

  handlePrevClick() {
    this.currentSlide.previousElementSibling?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  handleNextClick() {
    this.currentSlide.nextElementSibling?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  firstUpdated() {
    const intersectionObserver = new IntersectionObserver(this.handleSlideIntersection, {
      root: this.slidesContainer,
      threshold: 1
    });
    this.intersectionObserver = intersectionObserver;

    const slides = this.getSlides();
    slides.forEach(slide => intersectionObserver.observe(slide));

    this.firstSlideClone = slides.at(0)!.cloneNode(true) as HTMLElement;
    this.firstSlideClone.setAttribute('data-clone', '');
    this.lastSlideClone = slides.at(-1)!.cloneNode(true) as HTMLElement;
    this.lastSlideClone.setAttribute('data-clone', '');

    this.append(this.firstSlideClone);
    this.prepend(this.lastSlideClone);

    intersectionObserver.observe(this.firstSlideClone);
    intersectionObserver.observe(this.lastSlideClone);
  }

  scrollToSlide(index: number) {
    const slides = this.getSlides();
    slides.at(index)!.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  disconnectedCallback(): void {
    this.intersectionObserver.disconnect();
  }

  render() {
    const currentSlide = this.currentSlide;
    const slides = this.getSlides();
    const slidesCount = slides.length;
    const slideIndex = slides.indexOf(this.currentSlide);
    const isFirstSlide = slides.at(0) === currentSlide;
    const isLastSlide = slides.at(-1) === currentSlide;

    return html`
      <section class="carousel">
        <div part="heading" class="carousel__heading">
          <slot name="heading">${this.heading}</slot>
        </div>

        <div part="slides" class="carousel__slides">
          <slot></slot>
        </div>

        <div part="nav" class="carousel__nav">
          ${map(
            range(slidesCount),
            i =>
              html`
                <span
                  @click="${() => this.scrollToSlide(i)}"
                  class="${classMap({
                    carousel__navIndicator: true,
                    'carousel__navIndicator--active': i === slideIndex
                  })}"
                ></span>
              `
          )}
        </div>

        <div part="prev-button" class="carousel__prev" @click="${this.handlePrevClick}">
          <sl-icon-button ?disabled="${isFirstSlide}" library="system" name="chevron-left"></sl-icon-button>
        </div>
        <div part="next-button" class="carousel__next" @click="${this.handleNextClick}">
          <sl-icon-button ?disabled="${isLastSlide}" library="system" name="chevron-right"></sl-icon-button>
        </div>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sl-carousel': SlCarousel;
  }
}
