type SlClearEvent = CustomEvent<Record<PropertyKey, never>>;

declare global {
  interface GlobalEventHandlersEventMap {
    'sl-clear': SlClearEvent;
  }
}

export default SlClearEvent;
