import { LitElement, html } from 'lit';
import { customElement, eventOptions, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { map } from 'lit/directives/map.js';
import { range } from 'lit/directives/range.js';
import { when } from 'lit/directives/when.js';
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
  @query('.carousel__slides') slidesContainer: HTMLDivElement;

  @state() activeSlide = 0;

  private autoplayTimerId: number;
  private slides = this.getElementsByTagName('sl-carousel-item');
  private intersectionObserver: IntersectionObserver;
  private intersectionObserverEntries = new Map<Element, IntersectionObserverEntry>();

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
    const slides = this.getSlides({ excludeClones: false });
    const normalizedIndex = (index + slides.length) % slides.length;

    scrollIntoView(slides.at(normalizedIndex)!, this.slidesContainer, 'both', behavior);
  }

  @debounce(100)
  @eventOptions({ passive: true })
  handleScroll() {
    this.intersectionObserverEntries.forEach(entry => {
      entry.target.toggleAttribute('inert', !entry.isIntersecting);

      if (entry.isIntersecting) {
        const slides = this.getSlides({ excludeClones: false });
        const intersectedSlide = slides.indexOf(entry.target as SlCarouselItem);

        if (this.loop && entry.target.hasAttribute('data-clone')) {
          if (intersectedSlide === 0) {
            // If we are on the last slide clone, move the focus on the last slide
            this.scrollToSlide(-2, 'auto');
          } else if (intersectedSlide === slides.length - 1) {
            // If we are on the first slide clone, move the focus on the first slide
            this.scrollToSlide(1, 'auto');
          }
        } else if (this.activeSlide !== intersectedSlide) {
          this.activeSlide = intersectedSlide;
          emit(this, 'sl-slide-change', { detail: entry.target });
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
      lastClone.setAttribute('data-clone', '');
      this.prepend(lastClone);

      const firstClone = slides.at(0)?.cloneNode(true) as HTMLElement;
      firstClone.setAttribute('data-clone', '');
      this.append(firstClone);
    }

    this.getSlides({ excludeClones: false }).forEach(slide => {
      intersectionObserver.observe(slide);
    });
    intersectionObserver.takeRecords();
  }

  pauseAutoplay = () => {
    clearInterval(this.autoplayTimerId);
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

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.intersectionObserver.disconnect();

    this.removeEventListener('mouseenter', this.pauseAutoplay);
    this.removeEventListener('focusin', this.pauseAutoplay);
    this.removeEventListener('mouseleave', this.resumeAutoplay);
    this.removeEventListener('focusout', this.resumeAutoplay);
  }

  protected firstUpdated(): void {
    this.setAttribute('tabindex', '-1');
    this.setAttribute('aria-roledescription', 'carousel');

    this.addEventListener('mouseenter', this.pauseAutoplay);
    this.addEventListener('focusin', this.pauseAutoplay);
    this.addEventListener('mouseleave', this.resumeAutoplay);
    this.addEventListener('focusout', this.resumeAutoplay);

    this.scrollToSlide(0, 'auto');

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

    this.handleLoopChange();
  }

  private renderPagination = () => {
    const slides = this.getSlides();
    const slidesCount = slides.length;

    // Normalize index to not take clones into account
    const activeSlideIndex = (this.activeSlide - Number(this.loop) + slidesCount) % slidesCount;

    return html`
      <nav part="pagination" class="carousel__pagination">
        ${map(
          range(slidesCount),
          i =>
            html`
              <span
                @click="${() => this.scrollToSlide(i + Number(this.loop))}"
                aria-selected="${i === activeSlideIndex ? 'true' : 'false'}"
                tabindex="${i === activeSlideIndex ? '0' : '-1'}"
                @keypress=""
                class="${classMap({
                  carousel__indicator: true,
                  'carousel__indicator--active': i === activeSlideIndex
                })}"
              >
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

    // Normalize index to not take clones into account
    const activeSlideIndex = (this.activeSlide - Number(loop) + slidesCount) % slidesCount;

    const prevEnabled = !loop && activeSlideIndex === 0;
    const nextEnabled = !loop && activeSlideIndex === slides.length - 1;

    return html`
      <nav part="controls" class="carousel__controls">
        <sl-icon-button
          part="prev-button"
          class="carousel__prevButton"
          ?disabled="${prevEnabled}"
          library="system"
          name="chevron-left"
          @click="${() => this.prevSlide()}"
        ></sl-icon-button>

        <sl-icon-button
          part="next-button"
          class="carousel__nextButton"
          ?disabled="${nextEnabled}"
          library="system"
          name="chevron-right"
          @click="${() => this.nextSlide()}"
        ></sl-icon-button>
      </nav>
    `;
  };

  render() {
    return html`
      <section part="base" class="carousel" aria-roledescription="carousel">
        <div part="heading" class="carousel__heading">
          <slot name="heading">${this.heading}</slot>
        </div>

        <div part="slides" class="carousel__slides" @scroll="${this.handleScroll}" role="group" aria-live="polite">
          <slot></slot>
        </div>

        ${when(this.showPagination, this.renderPagination)} ${when(this.showControls, this.renderControls)}
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sl-carousel': SlCarousel;
  }
}
