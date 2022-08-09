# Carousel

[component-header:sl-carousel]

A description of the component goes here.

```html preview
<div class="carousel-options">
  <sl-switch checked name="infinite"> Infinite </sl-switch>
</div>
<sl-carousel heading="Example carousel" infinite>
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
  const infinite = options.querySelector('sl-switch[name="infinite"]');

  infinite.addEventListener('sl-change', () => (carousel.infinite = infinite.checked));
</script>
```

## Examples

### First Example

TODO

### Second Example

TODO

[component-metadata:sl-carousel]
