import { LitElement, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { map } from 'lit/directives/map.js';
import { range } from 'lit/directives/range.js';
import { watch } from 'src/internal/watch';
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

  /** */
  @property({ type: Boolean }) infinite = false;

  @query('slot:not([name])') defaultSlot: HTMLSlotElement;
  @query('.carousel__slides') slidesContainer: HTMLDivElement;

  @state() currentSlide: number;

  private slides = this.getElementsByTagName('sl-carousel-slide');
  private intersectionObserver: IntersectionObserver;

  getSlides({ excludeClones = true }: { excludeClones?: boolean } = {}) {
    return [...this.slides].filter(slide => !excludeClones || !slide.hasAttribute('data-clone'));
  }

  handleSlideIntersection = (entries: IntersectionObserverEntry[]) => {
    const [currentEntry] = entries.filter(entry => entry.isIntersecting);
    if (!currentEntry) {
      return;
    }

    const slides = this.getSlides({ excludeClones: false });
    const currentSlide = slides.indexOf(currentEntry.target as HTMLElement);

    if (currentSlide === 0) {
      slides.at(-2)?.scrollIntoView({ block: 'nearest' });
    } else if (currentSlide === slides.length - 1) {
      slides.at(1)?.scrollIntoView({ block: 'nearest' });
    } else {
      this.currentSlide = currentSlide;
    }
  };

  @watch('infinite', { waitUntilFirstUpdate: true })
  handleInfiniteChange() {
    const slides = this.getSlides();
    const intersectionObserver = this.intersectionObserver;

    this.getSlides({ excludeClones: false }).forEach(slide => {
      intersectionObserver.unobserve(slide);

      if (slide.hasAttribute('data-clone')) {
        slide.remove();
      }
    });

    this.scrollToSlide(0);

    if (this.infinite) {
      const lastClone = slides.at(-1)?.cloneNode(true) as HTMLElement;
      lastClone.setAttribute('data-clone', '');

      const firstClone = slides.at(0)?.cloneNode(true) as HTMLElement;
      firstClone.setAttribute('data-clone', '');

      this.prepend(lastClone);
      this.append(firstClone);

      this.getSlides({ excludeClones: false }).forEach(slide => {
        intersectionObserver.observe(slide);
      });
    }
  }

  handlePrevClick() {
    this.scrollToSlide(this.currentSlide - 1);
  }

  handleNextClick() {
    this.scrollToSlide(this.currentSlide + 1);
  }

  firstUpdated() {
    const intersectionObserver = new IntersectionObserver(this.handleSlideIntersection, {
      root: this.slidesContainer,
      threshold: 1
    });
    this.intersectionObserver = intersectionObserver;

    this.handleInfiniteChange();
  }

  scrollToSlide(index: number) {
    const slides = this.getSlides({ excludeClones: false });

    const slideIndex = (index + slides.length) % slides.length;
    slides.at(slideIndex)!.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  disconnectedCallback(): void {
    this.intersectionObserver.disconnect();
  }

  render() {
    const currentSlide = this.currentSlide;
    const infinite = this.infinite;
    const slides = this.getSlides({ excludeClones: false });
    const slidesCount = slides.length;
    const prevEnabled = !infinite && currentSlide === 0;
    const nextEnabled = !infinite && currentSlide === slides.length;

    return html`
      <section class="carousel">
        <div part="heading" class="carousel__heading">
          <slot name="heading">${this.heading} ${currentSlide}</slot>
        </div>

        <div part="slides" class="carousel__slides">
          <slot></slot>
        </div>

        <div part="nav" class="carousel__nav">
          ${map(
            range(Number(infinite), slidesCount - Number(infinite)),
            i =>
              html`
                <span
                  @click="${() => this.scrollToSlide(i)}"
                  @keypress=""
                  class="${classMap({
                    carousel__navIndicator: true,
                    'carousel__navIndicator--active': i === currentSlide
                  })}"
                ></span>
              `
          )}
        </div>

        <div part="prev-button" class="carousel__prev">
          <sl-icon-button
            ?disabled="${prevEnabled}"
            library="system"
            name="chevron-left"
            @click="${this.handlePrevClick}"
          ></sl-icon-button>
        </div>
        <div part="next-button" class="carousel__next">
          <sl-icon-button
            ?disabled="${nextEnabled}"
            library="system"
            name="chevron-right"
            @click="${this.handleNextClick}"
          ></sl-icon-button>
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
