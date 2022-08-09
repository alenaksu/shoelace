import { LitElement, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { map } from 'lit/directives/map.js';
import { range } from 'lit/directives/range.js';
import { watch } from '../../internal/watch';
import styles from './carousel.styles';
import type { CSSResultGroup } from 'lit';

export function waitEvent(element: HTMLElement, eventName: string) {
  return new Promise(resolve => {
    element.addEventListener(eventName, resolve, { once: true });
  });
}

export function withPan(element: HTMLElement) {
  let startX = -1;

  const handlePointerUp = (event: PointerEvent) => {
    const delta = startX - event.clientX;

    element.removeEventListener('pointermove', handlePointerMove);
    element.dispatchEvent(new CustomEvent('panend', { detail: { delta } }));
  };

  const handlePointerDown = (event: PointerEvent) => {
    event.preventDefault();

    startX = event.clientX;

    element.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp, { once: true });
    element.dispatchEvent(new CustomEvent('panstart'));
  };

  const handlePointerMove = (event: PointerEvent) => {
    const delta = startX - event.clientX;

    element.dispatchEvent(new CustomEvent('pan', { detail: { delta } }));
  };

  element.addEventListener('pointerdown', handlePointerDown);
}

export function withSwipe(element: HTMLElement, { threshold = 10, velocity = 0.3 } = {}) {
  let startTime = 0;

  withPan(element);

  element.addEventListener('panstart', () => {
    startTime = Date.now();
  });

  element.addEventListener('panend', (event: CustomEvent<{ delta: number }>) => {
    const delta = event.detail.delta;
    const distance = Math.abs(delta);
    const v = distance / (Date.now() - startTime);

    if (distance >= threshold && v >= velocity)
      element.dispatchEvent(
        new CustomEvent('swipe', {
          detail: {
            direction: Math.sign(delta)
          }
        })
      );
  });
}

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

  /** An example property. */
  @state() currentSlide = 0;
  @property({ type: Boolean, reflect: true }) infinite = false;

  @query('slot:not([name])') defaultSlot: HTMLSlotElement;
  @query('.carousel__scroller') scrollerElement: HTMLSlotElement;
  @query('.carousel__slides') slidesContainer: HTMLSlotElement;

  private slides = this.getElementsByTagName('sl-carousel-slide') as HTMLCollectionOf<HTMLElement>;
  private intersectionObserver: IntersectionObserver;

  handleSlideIntersection = (/*entries: IntersectionObserverEntry[]*/) => {
    // const [currentEntry] = entries.filter(entry => entry.isIntersecting);
    // if (!currentEntry) {
    //   return;
    // }

    const slides = this.getSlides({ excludeClones: false });
    const slidesCount = slides.length;
    const halfCount = Math.floor(slidesCount / 2);
    const currentSlideIndex = this.currentSlide;

    requestAnimationFrame(() => {
      for (let i = 0; i < slidesCount; i++) {
        const index = currentSlideIndex - halfCount + i;
        slides.at(index % slidesCount)!.style.setProperty('order', i.toString());
      }

      const currentSlide = slides.at(currentSlideIndex)!;
      this.scrollerElement.style.setProperty('transition', 'none');
      this.scrollerElement.style.setProperty('--scroll', `-${currentSlide.offsetLeft}px`);
      this.scrollerElement.getBoundingClientRect();
      requestAnimationFrame(() => {
        this.scrollerElement.style.removeProperty('transition');
      });
    });
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

    if (this.infinite) {
      // const lastClone = slides.at(-1)?.cloneNode(true) as HTMLElement;
      // lastClone.setAttribute('data-clone', '');

      // const firstClone = slides.at(0)?.cloneNode(true) as HTMLElement;
      // firstClone.setAttribute('data-clone', '');

      // this.prepend(lastClone);
      // this.append(firstClone);

      // this.getSlides({ excludeClones: false }).forEach(slide => {
      //   intersectionObserver.observe(slide);
      // });

      // this.handleSlideIntersection(intersectionObserver.takeRecords());
      this.handleSlideIntersection();
    }

    // this.scrollerElement.style.setProperty('transition', 'none');

    // this.requestUpdate('currentSlide');
    // requestAnimationFrame(() => {
    //   this.scrollerElement.style.removeProperty('transition');
    // });
  }

  getSlides({ excludeClones = true }: { excludeClones?: boolean } = {}) {
    return [...this.slides].filter(slide => !excludeClones || !slide.hasAttribute('data-clone'));
  }

  @watch('currentSlide', { waitUntilFirstUpdate: true })
  handleSlideChange() {
    const slides = this.getSlides({ excludeClones: false });
    const currentSlide = slides.at(this.currentSlide)!;
    this.scrollerElement.style.setProperty('--scroll', `-${currentSlide.offsetLeft}px`);
  }

  gotoSlide(index: number) {
    const slidesCount = this.getSlides({ excludeClones: false }).length;
    this.currentSlide = (index + slidesCount) % slidesCount;
  }

  prevSlide() {
    this.gotoSlide(this.currentSlide - 1);
  }

  nextSlide() {
    this.gotoSlide(this.currentSlide + 1);
  }

  protected firstUpdated(): void {
    withSwipe(this.scrollerElement);

    const intersectionObserver = new IntersectionObserver(this.handleSlideIntersection, {
      root: this.slidesContainer,
      threshold: 1.0
    });
    this.intersectionObserver = intersectionObserver;

    this.handleInfiniteChange();
    this.handleSlideChange();

    this.scrollerElement.addEventListener('swipe', ({ detail: { direction } }: CustomEvent<{ direction: number }>) => {
      if (direction > 0) this.nextSlide();
      else if (direction < 0) this.prevSlide();
    });

    this.scrollerElement.addEventListener('pan', ({ detail: { delta } }: CustomEvent<{ delta: number }>) => {
      this.scrollerElement.style.setProperty('--pan', `${-delta}px`);
      this.scrollerElement.classList.add('carousel__scroller--panning');
    });

    this.scrollerElement.addEventListener('panend', () => {
      this.scrollerElement.style.removeProperty('--pan');
      this.scrollerElement.classList.remove('carousel__scroller--panning');
    });
  }

  render() {
    const infinite = this.infinite;
    const slidesCount = this.getSlides({ excludeClones: false }).length;
    const currentSlide = this.currentSlide;
    const prevDisabled = !infinite && currentSlide === 0;
    const nextDisabled = !infinite && currentSlide === slidesCount - 1;

    return html`
      <div part="base" class="carousel">
        <div class="carousel__heading">${this.currentSlide}</div>
        <div class="carousel__slides">
          <div class="carousel__scroller" @transitionend="${this.handleSlideIntersection}">
            <slot></slot>
          </div>
        </div>

        <div part="nav" class="carousel__nav">
          ${map(
            range(slidesCount),
            i =>
              html`
                <span
                  @keypress=""
                  @click="${() => this.gotoSlide(i)}"
                  class="${classMap({
                    carousel__navIndicator: true,
                    'carousel__navIndicator--active': i === currentSlide
                  })}"
                ></span>
              `
          )}
        </div>

        <div @keypress="" part="prev-button" class="carousel__prev" @click="${this.prevSlide}">
          <sl-icon-button ?disabled="${prevDisabled}" library="system" name="chevron-left"></sl-icon-button>
        </div>
        <div @keypress="" part="next-button" class="carousel__next" @click="${this.nextSlide}">
          <sl-icon-button ?disabled="${nextDisabled}" library="system" name="chevron-right"></sl-icon-button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sl-carousel': SlCarousel;
  }
}
