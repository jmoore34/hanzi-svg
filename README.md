# Hanzi SVG

This library, when imported, populates `img` elements with 汉字 stroke order animations.

## Installation

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/hanzi-svg@0.0.4" />
```

## Basic usage

```html
<img data-hanzi="龍" width="200" height="200" />
```

![example](img/龍.svg)

## Customized colors

```html
<img
    data-hanzi="龙"
    data-stroke-color="red"
    data-outline-color="brown"
    width="200"
    height="200"
/>
```

![example](img/龙.svg)

## Advanced usage

By default, the image's opacity will be set to 0 for up to 200 milliseconds while the character data loads. This reduces the chance of rapidly switching from the `alt` text (if any) to the rendered image. This value can be overwritten using `data-timeout`.

To reduce network traffic, you can use the following to allow caching more character data in the user's browser:
```html
<script>
    navigator.storage.persist();
</script>
```