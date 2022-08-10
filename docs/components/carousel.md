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
  <sl-carousel-slide><img src="https://picsum.photos/530/300/?random=1" /></sl-carousel-slide>
  <sl-carousel-slide><img src="https://picsum.photos/530/300/?random=2" /></sl-carousel-slide>
  <sl-carousel-slide><img src="https://picsum.photos/530/300/?random=3" /></sl-carousel-slide>
  <sl-carousel-slide><img src="https://picsum.photos/530/300/?random=4" /></sl-carousel-slide>
<sl-carousel-slide><img src="https://picsum.photos/530/300/?random=5" /></sl-carousel-slide>
</sl-carousel>
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
</script>
```

## Examples

### Vertical scrolling

```html preview
<sl-carousel class="vertical" heading="Vertical scrolling" loop show-pagination>
  <sl-carousel-slide><img src="https://picsum.photos/530/300/?random=1" /></sl-carousel-slide>
  <sl-carousel-slide><img src="https://picsum.photos/530/300/?random=2" /></sl-carousel-slide>
  <sl-carousel-slide><img src="https://picsum.photos/530/300/?random=3" /></sl-carousel-slide>
  <sl-carousel-slide><img src="https://picsum.photos/530/300/?random=4" /></sl-carousel-slide>
<sl-carousel-slide><img src="https://picsum.photos/530/300/?random=5" /></sl-carousel-slide>
</sl-carousel>
</sl-carousel>
<style>
  .vertical img {
    object-fit: cover;
  }
  .vertical::part(slides) {
    scroll-snap-type: y mandatory;
    grid-auto-flow: row;
    overflow: hidden scroll;
    aspect-ratio: 16/9;
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

### Second Example

TODO

[component-metadata:sl-carousel]
