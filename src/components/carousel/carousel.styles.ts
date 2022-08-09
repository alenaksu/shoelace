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
    overflow: hidden;
  }

  .carousel__scroller {
    position: relative;
    display: grid;
    grid-auto-columns: 100%;
    grid-auto-flow: column;
    align-items: center;
    touch-action: none;
    transition: 1000ms transform cubic-bezier(0.34, 1.26, 0.64, 1);
    transform: translate3d(calc(var(--scroll, 0px) + var(--pan, 0px)), 0, 0);
    gap: var(--sl-spacing-medium);
    margin-inline: 4rem;
  }

  .carousel__scroller--panning {
    transition: none;
  }

  .carousel__nav {
    grid-area: nav;
    display: flex;
    gap: var(--sl-spacing-small);
    justify-content: center;
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
