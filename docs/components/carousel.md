# Carousel

[component-header:sl-carousel]

A description of the component goes here.

```html preview
<div class="carousel-options">
  <sl-switch name="loop"> Loop </sl-switch>
  <sl-switch name="show-controls"> Show controls </sl-switch>
  <sl-switch name="show-pagination"> Show pagination </sl-switch>
</div>
<sl-divider></sl-divider>
<sl-carousel heading="Example carousel">
  <sl-carousel-item><img src="https://picsum.photos/530/300/?random=1" /></sl-carousel-item>
  <sl-carousel-item><img src="https://picsum.photos/530/300/?random=2" /></sl-carousel-item>
  <sl-carousel-item><img src="https://picsum.photos/530/300/?random=3" /></sl-carousel-item>
  <sl-carousel-item><img src="https://picsum.photos/530/300/?random=4" /></sl-carousel-item>
  <sl-carousel-item><img src="https://picsum.photos/530/300/?random=5" /></sl-carousel-item>
</sl-carousel>
<style>
  img {
    width: 100%;
  }
  .carousel-options {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    gap: 1rem;
  }
</style>
<script>
  const options = document.querySelector('.carousel-options');
  const carousel = document.querySelector('sl-carousel');
  const loop = options.querySelector('sl-switch[name="loop"]');
  const showControls = options.querySelector('sl-switch[name="show-controls"]');
  const showPagination = options.querySelector('sl-switch[name="show-pagination"]');

  loop.addEventListener('sl-change', () => (carousel.loop = loop.checked));
  showControls.addEventListener('sl-change', () => (carousel.showControls = showControls.checked));
  showPagination.addEventListener('sl-change', () => (carousel.showPagination = showPagination.checked));

  carousel.addEventListener('sl-slide-change', e => {
    console.log(e.detail);
  });
</script>
```

## Examples

### Vertical scrolling

```html preview
<sl-carousel class="vertical" heading="Vertical scrolling" loop show-pagination>
  <sl-carousel-item><img src="https://picsum.photos/530/300/?random=1" /></sl-carousel-item>
  <sl-carousel-item><img src="https://picsum.photos/530/300/?random=2" /></sl-carousel-item>
  <sl-carousel-item><img src="https://picsum.photos/530/300/?random=3" /></sl-carousel-item>
  <sl-carousel-item><img src="https://picsum.photos/530/300/?random=4" /></sl-carousel-item>
  <sl-carousel-item><img src="https://picsum.photos/530/300/?random=5" /></sl-carousel-item>
</sl-carousel>
<style>
  .vertical img {
    object-fit: cover;
    height: 100%;
  }
  .vertical::part(slides) {
    scroll-snap-type: y mandatory;
    grid-auto-flow: row;
    overflow: hidden scroll;
    aspect-ratio: auto 16/9;
  }

  .vertical::part(base) {
    grid-template-areas:
      'heading heading .'
      'slides slides pagination'
      '. . .';
  }

  .vertical::part(pagination) {
    flex-direction: column;
  }

  .vertical::part(controls) {
    transform: rotate(90deg);
    display: flex;
  }
</style>
```

### Scroll hint

```html preview
<sl-carousel class="scroll-hint" show-controls show-pagination>
  <sl-carousel-item><img src="https://picsum.photos/530/300/?random=1" /></sl-carousel-item>
  <sl-carousel-item><img src="https://picsum.photos/530/300/?random=2" /></sl-carousel-item>
  <sl-carousel-item><img src="https://picsum.photos/530/300/?random=3" /></sl-carousel-item>
  <sl-carousel-item><img src="https://picsum.photos/530/300/?random=4" /></sl-carousel-item>
  <sl-carousel-item><img src="https://picsum.photos/530/300/?random=5" /></sl-carousel-item>
</sl-carousel>

<style>
  .scroll-hint::part(slides) {
    padding-inline: 5rem;
  }
</style>
```

### HTMLContent

```html preview
<sl-carousel class="presentation" show-pagination>
  <sl-carousel-item>
    <div class="presentation__title">Slide 1</div>
    <div class="presentation__subtitle">Lorem ipsum dolor sit</div>
  </sl-carousel-item>
  <sl-carousel-item>
    <div class="presentation__title">Slide 2</div>
    <div class="presentation__subtitle">lorem ipsum dolor sit</div>
  </sl-carousel-item>
</sl-carousel>
<style>
  .presentation {
    aspect-ratio: 16 / 9;
  }

  .presentation__title {
    font-size: var(--sl-font-size-3x-large);
  }

  .presentation__subtitle {
    font-size: var(--sl-font-size-large);
  }
</style>
```

[component-metadata:sl-carousel]
