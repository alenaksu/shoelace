import { LocalizeController } from '@shoelace-style/localize';
import { LitElement, html } from 'lit';
import { customElement, eventOptions, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { map } from 'lit/directives/map.js';
import { range } from 'lit/directives/range.js';
import { when } from 'lit/directives/when.js';
import { prefersReducedMotion } from 'src/internal/animate';
import { debounce } from 'src/internal/debounce';
import { emit } from 'src/internal/event';
import { scrollIntoView } from 'src/internal/scroll';
import { watch } from 'src/internal/watch';
import styles from './carousel.styles';
import type SlCarouselItem from '../carousel-item/carousel-item';
import type { CSSResultGroup } from 'lit';

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
 * @csspart prev-button - The prev button.
 * @csspart next-button - The next button.
 *
 */
@customElement('sl-carousel')
export default class SlCarousel extends LitElement {
  static styles: CSSResultGroup = styles;

  /** The carousel's heading. */
  @property() heading = '';

  /** When set, allows the user to navigate the carousel in the same direction indefinitely. */
  @property({ type: Boolean, reflect: true }) loop = false;

  /** When set, show the carousel's navigation controls. */
  @property({ type: Boolean, reflect: true, attribute: 'show-controls' }) showControls = false;

  /** When set, show the carousel's pagination indicators. */
  @property({ type: Boolean, reflect: true, attribute: 'show-pagination' }) showPagination = false;

  /** When set, the slides will scroll automatically when the user is not interacting with them.  */
  @property({ type: Boolean, reflect: true }) autoplay = false;

  /** Specify the interval between each scroll  */
  @property({ type: Number }) autoplayInterval = 3000;

  @query('slot:not([name])') defaultSlot: HTMLSlotElement;
  @query('.carousel__slides') slidesContainer: HTMLElement;
  @query('.carousel__pagination') paginationContainer: HTMLElement;

  @state() activeSlide = 0;

  private autoplayTimerId: number;
  private readonly slides = this.getElementsByTagName('sl-carousel-item');
  private intersectionObserver: IntersectionObserver;
  private readonly intersectionObserverEntries = new Map<Element, IntersectionObserverEntry>();
  private readonly localize = new LocalizeController(this);

  getSlides({ excludeClones = true }: { excludeClones?: boolean } = {}) {
    return [...this.slides].filter(slide => !excludeClones || !slide.hasAttribute('data-clone'));
  }

  /**
   * Move the carousel to the previous slide.
   */
  prevSlide(behavior: ScrollBehavior = 'smooth') {
    this.scrollToSlide(this.activeSlide - 1, behavior);
  }

  /**
   * Move the carousel to the next slide.
   */
  nextSlide(behavior: ScrollBehavior = 'smooth') {
    this.scrollToSlide(this.activeSlide + 1, behavior);
  }

  scrollToSlide(index: number, behavior: ScrollBehavior = 'smooth') {
    const slidesCount = this.getSlides().length;
    this.activeSlide = (index + slidesCount) % slidesCount;

    const slidesWithClones = this.getSlides({ excludeClones: false });
    const slide = slidesWithClones.at((index + Number(this.loop) + slidesWithClones.length) % slidesWithClones.length)!;

    scrollIntoView(slide, this.slidesContainer, 'both', prefersReducedMotion() ? 'auto' : behavior);
  }

  @debounce(100)
  @eventOptions({ passive: true })
  handleScroll() {
    this.intersectionObserverEntries.forEach(entry => {
      const slide = entry.target as SlCarouselItem;
      slide.toggleAttribute('inert', !entry.isIntersecting);

      if (entry.isIntersecting) {
        if (this.loop && slide.hasAttribute('data-clone')) {
          const clonePosition = slide.getAttribute('data-clone');

          this.scrollToSlide(Number(clonePosition), 'auto');
        } else {
          const slides = this.getSlides();
          const intersectedSlide = slides.indexOf(slide);

          this.activeSlide = intersectedSlide;

          emit(this, 'sl-slide-change', {
            detail: {
              slideIndex: intersectedSlide,
              slide: entry.target
            }
          });
        }
      }
    });

    this.intersectionObserverEntries.clear();
  }

  @watch('loop', { waitUntilFirstUpdate: true })
  handleLoopChange() {
    const slides = this.getSlides();
    const intersectionObserver = this.intersectionObserver;

    this.getSlides({ excludeClones: false }).forEach(slide => {
      intersectionObserver.unobserve(slide);

      if (slide.hasAttribute('data-clone')) {
        slide.remove();
      }
    });

    if (this.loop) {
      const lastClone = slides.at(-1)?.cloneNode(true) as HTMLElement;
      lastClone.setAttribute('data-clone', String(slides.length - 1));
      this.prepend(lastClone);

      const firstClone = slides.at(0)?.cloneNode(true) as HTMLElement;
      firstClone.setAttribute('data-clone', '0');
      this.append(firstClone);
    }

    this.getSlides({ excludeClones: false }).forEach(slide => {
      intersectionObserver.observe(slide);
    });
  }

  pauseAutoplay = () => {
    clearInterval(this.autoplayTimerId);
    this.autoplayTimerId = 0;
  };

  resumeAutoplay = () => {
    if (this.autoplay) {
      this.autoplayTimerId = window.setInterval(() => {
        this.nextSlide();
      }, this.autoplayInterval);
    }
  };

  @watch('autoplay')
  handleAutoplayChange() {
    this.pauseAutoplay();
    this.resumeAutoplay();
  }

  handlePaginationKeydown(event: KeyboardEvent) {
    if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) {
      return;
    }

    const indicators = this.paginationContainer.querySelectorAll('.carousel__indicator');
    const isRtl = this.localize.dir() === 'rtl';
    const isLtr = this.localize.dir() === 'ltr';

    if ((isLtr && event.key === 'ArrowRight') || (isRtl && event.key === 'ArrowLeft')) {
      this.nextSlide();
    } else if ((isLtr && event.key === 'ArrowLeft') || (isRtl && event.key === 'ArrowRight')) {
      this.prevSlide();
    }

    // Move the focus to the current active indicator
    const indicator = indicators.item(this.activeSlide) as HTMLElement;
    indicator.focus();
  }

  connectedCallback(): void {
    super.connectedCallback();

    const intersectionObserver = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach(entry => {
          this.intersectionObserverEntries.set(entry.target, entry);
        });
      },
      {
        root: this.slidesContainer,
        threshold: 0.6
      }
    );
    this.intersectionObserver = intersectionObserver;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.intersectionObserver.disconnect();

    this.removeEventListener('mouseenter', this.pauseAutoplay);
    this.removeEventListener('mouseleave', this.resumeAutoplay);
    this.removeEventListener('focusin', this.pauseAutoplay);
    this.removeEventListener('focusout', this.resumeAutoplay);
  }

  protected firstUpdated(): void {
    this.setAttribute('aria-roledescription', 'carousel');

    this.addEventListener('mouseenter', this.pauseAutoplay);
    this.addEventListener('mouseleave', this.resumeAutoplay);
    this.addEventListener('focusin', this.pauseAutoplay);
    this.addEventListener('focusout', this.resumeAutoplay);

    this.handleLoopChange();
  }

  private renderPagination = () => {
    const slides = this.getSlides();
    const slidesCount = slides.length;

    const activeSlideIndex = this.activeSlide;

    return html`
      <nav part="pagination" class="carousel__pagination" role="tablist" @keydown="${this.handlePaginationKeydown}">
        ${map(
          range(slidesCount),
          i =>
            html`
              <span role="presentation">
                <button
                  @click="${() => this.scrollToSlide(i + Number(this.loop))}"
                  aria-selected="${i === activeSlideIndex ? 'true' : 'false'}"
                  tabindex="${i === activeSlideIndex ? '0' : '-1'}"
                  aria-label="${i + 1} of ${slidesCount}"
                  class="${classMap({
                    carousel__indicator: true,
                    'carousel__indicator--active': i === activeSlideIndex
                  })}"
                ></button>
              </span>
            `
        )}
      </nav>
    `;
  };

  private renderControls = () => {
    const loop = this.loop;
    const slides = this.getSlides();
    const slidesCount = slides.length;

    const activeSlideIndex = this.activeSlide;

    const prevEnabled = !loop && activeSlideIndex === 0;
    const nextEnabled = !loop && activeSlideIndex === slidesCount - 1;
    const isLtr = this.localize.dir() === 'ltr';

    return html`
      <nav part="controls" class="carousel__controls">
        <sl-icon-button
          label="Prev slide"
          part="prev-button"
          class="carousel__prevButton"
          ?disabled="${prevEnabled}"
          library="system"
          name="${isLtr ? 'chevron-left' : 'chevron-right'}"
          @click="${() => this.prevSlide()}"
        ></sl-icon-button>

        <sl-icon-button
          label="Next slide"
          part="next-button"
          class="carousel__nextButton"
          ?disabled="${nextEnabled}"
          library="system"
          name="${isLtr ? 'chevron-right' : 'chevron-left'}"
          @click="${() => this.nextSlide()}"
        ></sl-icon-button>
      </nav>
    `;
  };

  render() {
    const activeSlideElement = this.getSlides().at(this.activeSlide);

    return html`
      <section part="base" class="carousel" aria-roledescription="carousel">
        <div part="heading" class="carousel__heading">
          <slot name="heading">${this.heading}</slot>
        </div>

        <div part="slides" class="carousel__slides" @scroll="${this.handleScroll}" role="group" aria-live="off">
          <sl-visually-hidden
            aria-live="${this.autoplay && this.autoplayTimerId ? 'off' : 'polite'}"
            aria-atomic="true"
          >
            Slide ${this.activeSlide + 1} of ${this.getSlides().length} ${activeSlideElement?.label}
          </sl-visually-hidden>
          <slot></slot>
        </div>

        ${when(this.showControls, this.renderControls)} ${when(this.showPagination, this.renderPagination)}
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sl-carousel': SlCarousel;
  }
}
