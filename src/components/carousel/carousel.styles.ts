import { css } from 'lit';
import componentStyles from '../../styles/component.styles';

export default css`
  ${componentStyles}

  :host {
    display: block;

    --gutters: var(--sl-spacing-medium);
    --controls-size: var(--sl-font-size-2x-large);
  }

  .carousel {
    min-height: 100%;
    min-width: 100%;

    display: grid;

    gap: var(--sl-spacing-small);

    grid-template-columns: min-content 1fr min-content;
    grid-template-rows: min-content 1fr min-content;
    grid-template-areas:
      '. heading .'
      '. slides .'
      '. pagination .';

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
  }

  .carousel__slides {
    grid-area: slides;

    width: 100%;
    height: 100%;

    display: grid;
    grid-auto-columns: 100%;
    grid-auto-rows: 100%;
    grid-auto-flow: column;
    align-items: center;

    gap: var(--gutters);

    overflow: auto;
    scroll-snap-type: x mandatory;
    overscroll-behavior-x: contain;

    scrollbar-width: none;

    padding-inline: var(--sl-spacing-small);
    padding-block: var(--sl-spacing-small);
  }

  .carousel__slides::-webkit-scrollbar {
    display: none;
  }

  .carousel__controls {
    grid-area: controls;
    display: contents;

    font-size: var(--controls-size);
  }

  .carousel__controlButton {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    background: none;
    border: none;
    border-radius: var(--sl-border-radius-medium);
    font-size: inherit;
    color: var(--sl-color-neutral-600);
    padding: var(--sl-spacing-x-small);
    cursor: pointer;
    transition: var(--sl-transition-medium) color;
    appearance: none;
  }

  .carousel__controlButton--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .carousel__controlButton--disabled::part(base) {
    pointer-events: none;
  }

  .carousel__controlButton--prev {
    grid-column: 1;
    grid-row: 2;
  }

  .carousel__controlButton--next {
    grid-column: 3;
    grid-row: 2;
  }

  .carousel__indicator {
    display: block;
    cursor: pointer;
    background: none;
    border: 0;
    border-radius: var(--sl-border-radius-circle);
    width: var(--sl-spacing-small);
    height: var(--sl-spacing-small);
    background-color: var(--sl-color-neutral-600);
    will-change: transform;
    transition: var(--sl-transition-fast) transform ease-ins;
  }

  .carousel__indicator--active {
    background-color: var(--sl-color-primary-600);
    transform: scale(1.2);
  }
`;
