import { LitElement, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { map } from 'lit/directives/map.js';
import { range } from 'lit/directives/range.js';
import { when } from 'lit/directives/when.js';
import { emit } from 'src/internal/event';
import { watch } from 'src/internal/watch';
import styles from './carousel.styles';
import type { CSSResultGroup } from 'lit';

const waitForScrollEnd = (element: HTMLElement): Promise<void> =>
  new Promise(resolve => {
    let timerId = 0;

    function handleScroll() {
      clearTimeout(timerId);
      wait();
    }

    element.addEventListener('scroll', handleScroll, { passive: true });

    const wait = () => {
      timerId = window.setTimeout(() => {
        element.removeEventListener('scroll', handleScroll);
        resolve();
      }, 50);
    };
  });

/**
 * @since 2.0
 * @status experimental
 *
 * @dependency sl-icon-button
 *
 * @event sl-slide-change - Emitted when the active slide changes.
 *
 * @slot - The default slot.
 *
 * @csspart base - The carousel's internal wrapper.
 * @csspart heading - The carousel's internal wrapper.
 * @csspart slides - The scroll container that wraps the slides.
 * @csspart pagination - The pagination indicators wrapper.
 * @csspart controls - The controls wrapper.
 * @csspart carousel__prevButton - The prev button.
 * @csspart carousel__nextButton - The next button.
 *
 */
@customElement('sl-carousel')
export default class SlCarousel extends LitElement {
  static styles: CSSResultGroup = styles;

  /** The carousel's heading. */
  @property() heading = 'example';

  /** When set, allows the user to navigate the carousel in the same direction indefinitely */
  @property({ type: Boolean, reflect: true }) loop = false;

  /** When set, show the carousel's navigation controls */
  @property({ type: Boolean, reflect: true, attribute: 'show-controls' }) showControls = false;

  /** When set, show the carousel's pagination indicators */
  @property({ type: Boolean, reflect: true, attribute: 'show-pagination' }) showPagination = false;

  @query('slot:not([name])') defaultSlot: HTMLSlotElement;
  @query('.carousel__slides') slidesContainer: HTMLDivElement;

  @state() currentSlide: number;

  private slides = this.getElementsByTagName('sl-carousel-slide');
  private intersectionObserver: IntersectionObserver;

  getSlides({ excludeClones = true }: { excludeClones?: boolean } = {}) {
    return [...this.slides].filter(slide => !excludeClones || !slide.hasAttribute('data-clone'));
  }

  handleSlideIntersection = async (entries: IntersectionObserverEntry[]) => {
    const [currentEntry] = entries.filter(entry => entry.isIntersecting);
    if (!currentEntry) {
      return;
    }

    const slides = this.getSlides({ excludeClones: false });
    const currentSlide = slides.indexOf(currentEntry.target as HTMLElement);
    this.currentSlide = currentSlide;

    await waitForScrollEnd(this.slidesContainer);

    if (this.loop) {
      if (currentSlide === 0) {
        // If we are on the last slide clone, move the focus on the last slide
        this.scrollToSlide(-2, 'auto');
        return;
      } else if (currentSlide === slides.length - 1) {
        // If we are on the first slide clone, move the focus on the first slide
        this.scrollToSlide(1, 'auto');
        return;
      }
    }

    emit(this, 'sl-slide-change', { detail: currentEntry.target });
  };

  @watch('loop')
  handleLoopChange() {
    const slides = this.getSlides();
    const intersectionObserver = this.intersectionObserver;

    this.getSlides({ excludeClones: false }).forEach(slide => {
      intersectionObserver.unobserve(slide);

      if (slide.hasAttribute('data-clone')) {
        slide.remove();
      }
    });

    this.scrollToSlide(0, 'auto');

    if (this.loop) {
      const lastClone = slides.at(-1)?.cloneNode(true) as HTMLElement;
      lastClone.setAttribute('data-clone', '');

      const firstClone = slides.at(0)?.cloneNode(true) as HTMLElement;
      firstClone.setAttribute('data-clone', '');

      this.prepend(lastClone);
      this.append(firstClone);
    }

    this.getSlides({ excludeClones: false }).forEach(slide => {
      intersectionObserver.observe(slide);
    });
  }

  handlePrevClick() {
    this.scrollToSlide(this.currentSlide - 1);
  }

  handleNextClick() {
    this.scrollToSlide(this.currentSlide + 1);
  }

  connectedCallback(): void {
    super.connectedCallback();

    const intersectionObserver = new IntersectionObserver(this.handleSlideIntersection, {
      root: this.slidesContainer,
      threshold: 0.6
    });
    this.intersectionObserver = intersectionObserver;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.intersectionObserver.disconnect();
  }

  scrollToSlide(index: number, behavior: ScrollBehavior = 'smooth') {
    const slides = this.getSlides({ excludeClones: false });
    const normalizedIndex = (index + slides.length) % slides.length;
    slides.at(normalizedIndex)!.scrollIntoView({ block: 'nearest', behavior });
  }

  protected firstUpdated(): void {
    // If loop is set, then move the focus to the second slide as the first one
    // will be clone of the last
    this.scrollToSlide(this.loop ? 1 : 0, 'auto');
  }

  render() {
    const { loop, showControls, showPagination } = this;
    const slides = this.getSlides();
    const slidesCount = slides.length;

    // Normalize index to not take clones into account
    const currentSlideIndex = (this.currentSlide - Number(loop) + slidesCount) % slidesCount;

    const prevEnabled = !loop && currentSlideIndex === 0;
    const nextEnabled = !loop && currentSlideIndex === slides.length - 1;

    return html`
      <section part="base" class="carousel">
        <div part="heading" class="carousel__heading">
          <slot name="heading">${this.heading}</slot>
        </div>

        <div part="slides" class="carousel__slides">
          <slot></slot>
        </div>

        ${when(
          showPagination,
          () => html`
            <div part="pagination" class="carousel__pagination">
              ${map(
                range(slidesCount),
                i =>
                  html`
                    <span
                      @click="${() => this.scrollToSlide(i)}"
                      @keypress=""
                      class="${classMap({
                        carousel__indicator: true,
                        'carousel__indicator--active': i === currentSlideIndex
                      })}"
                    ></span>
                  `
              )}
            </div>
          `
        )}
        ${when(
          showControls,
          () => html`
            <div part="controls" class="carousel__controls">
              <sl-icon-button
                part="carousel__prevButton"
                class="carousel__prevButton"
                ?disabled="${prevEnabled}"
                library="system"
                name="chevron-left"
                @click="${this.handlePrevClick}"
              ></sl-icon-button>

              <sl-icon-button
                part="carousel__nextButton"
                class="carousel__nextButton"
                ?disabled="${nextEnabled}"
                library="system"
                name="chevron-right"
                @click="${this.handleNextClick}"
              ></sl-icon-button>
            </div>
          `
        )}
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sl-carousel': SlCarousel;
  }
}
