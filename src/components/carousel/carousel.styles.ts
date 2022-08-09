import { css } from 'lit';
import componentStyles from '../../styles/component.styles';

export default css`
  ${componentStyles}

  :host {
    display: block;
  }

  .carousel {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto 1fr auto;
    gap: var(--sl-spacing-small);
    grid-template-areas:
      '. heading .'
      'prev slides next'
      '. nav .';

    align-items: center;
  }

  .carousel__heading {
    grid-area: heading;

    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--sl-font-size-large);
  }

  .carousel__prev {
    grid-area: prev;
  }

  .carousel__next {
    grid-area: next;
  }

  .carousel__nav {
    grid-area: nav;
    display: flex;
    gap: var(--sl-spacing-small);
    justify-content: center;
  }

  .carousel__slides {
    grid-area: slides;

    display: grid;
    grid-auto-columns: 100%;
    grid-auto-flow: column;
    align-items: center;
    gap: var(--sl-spacing-medium);

    overflow-x: auto;
    scroll-snap-type: x mandatory;
    overscroll-behavior-x: contain;

    scrollbar-width: none;

    padding-inline: 2rem;
  }

  .carousel__slides ::slotted(sl-carousel-slide) {
    scroll-snap-align: center;
    /* scroll-snap-stop: always; */
  }

  .carousel__slides::-webkit-scrollbar {
    display: none;
  }

  .carousel__navIndicator {
    display: block;
    border-radius: var(--sl-border-radius-circle);
    width: var(--sl-spacing-small);
    height: var(--sl-spacing-small);
    background-color: var(--sl-color-neutral-600);
    cursor: pointer;
  }

  .carousel__navIndicator--active {
    background-color: var(--sl-color-primary-600);
  }
`;
