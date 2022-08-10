import { css } from 'lit';
import componentStyles from '../../styles/component.styles';

export default css`
  ${componentStyles}

  :host {
    display: block;
  }

  .carousel {
    display: grid;

    grid-template-columns: min-content 1fr min-content;
    grid-template-rows: min-content 1fr min-content;
    grid-template-areas:
      '. heading .'
      '. slides .'
      '. pagination .';

    gap: var(--sl-spacing-small);
    align-items: center;
  }

  .carousel__heading {
    grid-area: heading;

    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--sl-font-size-large);
  }

  .carousel__pagination {
    grid-area: pagination;

    display: flex;
    justify-content: center;
    gap: var(--sl-spacing-small);

    padding-inline: var(--sl-spacing-medium);
  }

  .carousel__slides {
    grid-area: slides;

    display: grid;
    grid-auto-columns: 100%;
    grid-auto-rows: 100%;
    grid-auto-flow: column;
    align-items: center;
    gap: var(--sl-spacing-medium);

    overflow-x: auto;
    scroll-snap-type: x mandatory;
    overscroll-behavior-x: contain;

    scrollbar-width: none;
  }

  .carousel__slides ::slotted(sl-carousel-slide) {
    scroll-snap-align: center;
    /* scroll-snap-stop: always; */
  }

  .carousel__slides::-webkit-scrollbar {
    display: none;
  }

  .carousel__controls {
    grid-area: controls;
    display: contents;

    font-size: var(--sl-font-size-2x-large);
  }

  .carousel__prevButton {
    grid-column: 1;
    grid-row: 2;
  }

  .carousel__nextButton {
    grid-column: 3;
    grid-row: 2;
  }

  .carousel__indicator {
    display: block;
    border-radius: var(--sl-border-radius-circle);
    width: var(--sl-spacing-small);
    height: var(--sl-spacing-small);
    background-color: var(--sl-color-neutral-600);
    cursor: pointer;
  }

  .carousel__indicator--active {
    background-color: var(--sl-color-primary-600);
  }
`;
