import { css } from 'lit';
import componentStyles from '../../styles/component.styles';

export default css`
  ${componentStyles}

  :host {
    display: flex;

    align-items: center;
    justify-content: center;
    flex-direction: column;

    scroll-snap-align: center;
    scroll-snap-stop: always;

    height: 100%;
    width: 100%;
  }
`;
