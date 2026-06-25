---
external: false
draft: false
title: Input Range Slider Value without JavaScript
description: Experimental method to use geometry to get and display an input range slider value without JavaScript
date: 2026-06-25
---

# Reconstructing a Range Slider's Value Using Only CSS

When I started this experiment, I wasn't actually trying to build a custom range slider.

I was exploring some of the newer CSS features—Anchor Positioning, Container Query Units and `progress()`—when a question occurred to me:

**Could CSS determine the value of a range slider without reading the slider's value?**

Traditionally, displaying a value above a range slider requires JavaScript:

```js
slider.addEventListener('input', () => {
    output.textContent = slider.value;
});
```

CSS has never had access to a range input's current value, so this seemed impossible.

Or at least it used to.

## The Idea

Modern CSS gives us access to something almost as useful as a slider's value:

**its geometry.**

Using Anchor Positioning, the slider thumb can be treated as an anchor. That means other elements can be positioned relative to the thumb as it moves.

For example:

```css
input[type=range]::-webkit-slider-thumb {
    anchor-name: --thumb;
}
```

A value bubble can then be positioned above the thumb using:

```css
.value {
    position-anchor: --thumb;
    left: anchor(center);
    top: anchor(top);
}
```

This alone doesn't tell us the slider's value, but it does tell us where the thumb is.

And if we know where the thumb is, perhaps we can calculate the value ourselves.

## Converting Position into Width

The breakthrough came from creating an invisible measuring element.

This element stretches between the start of the slider track and the thumb position:

```text
Slider Start                    Thumb
|--------------------------------|
<--------- measure width ------->
```

Using Anchor Positioning:

```css
.measure {
    left: anchor(--slider left);
    right: anchor(--thumb left);
}
```

As the thumb moves, the width of `.measure` changes.

At the minimum value:

```text
measure width = 0
```

At the maximum value:

```text
measure width = maximum thumb travel
```

In other words, the width of this element becomes a physical representation of the slider's state.

## Measuring the Width

Normally CSS cannot read an element's dimensions.

However, Container Query Units give us a loophole.

By turning `.measure` into a size container:

```css
.measure {
    container-type: inline-size;
}
```

we gain access to:

```css
100cqi
```

which equals the current width of the element.

Suddenly the slider's position has become a number.

## Normalising the Measurement

The measured width still isn't very useful:

```text
0px → 284px
```

depending on the thumb's position.

What we really want is a value between 0 and 1.

This is where `progress()` comes in:

```css
--progress: progress(
    100cqi,
    0px,
    calc(var(--slider-width) - var(--thumb-size))
);
```

Conceptually:

```text
progress(current, minimum, maximum)
```

returns:

```text
(current - minimum)
÷
(maximum - minimum)
```

Result:

```text
0px     → 0
142px   → 0.5
284px   → 1
```

The slider position has now been converted into a normalised signal.

## Reconstructing the Slider Value

Once we have a normalised value, mapping it back to the slider's range becomes straightforward.

```css
--value: calc(
    var(--slider-min) +
    var(--progress) *
    (var(--slider-max) - var(--slider-min))
);
```

This is simply linear interpolation.

For a slider ranging from 1 to 50:

```text
progress = 0   → 1
progress = 0.5 → 25.5
progress = 1   → 50
```

At this point CSS has effectively reconstructed the slider's value without ever reading the slider itself.

## Displaying the Value

CSS still cannot directly convert a calculated number into text.

However, counters provide a useful workaround.

```css
counter-reset: value var(--value);
content: counter(value);
```

This allows the calculated value to be displayed in a pseudo-element positioned above the thumb.

No JavaScript required.

## What I Found Interesting

The most surprising thing about this experiment is that CSS never reads the slider value.

Instead, it derives the value from geometry.

The pipeline looks like this:

```text
Thumb Position
        ↓
Anchor Positioning
        ↓
Measuring Element Width
        ↓
Container Query Units (cqi)
        ↓
progress()
        ↓
Slider Value
        ↓
Counter Output
```

In other words:

> CSS is not observing state.
>
> CSS is inferring state from layout.

And that feels like a very different way of thinking about what CSS can do.

## Browser Support

This technique relies on several modern CSS features:

* Anchor Positioning
* Container Query Units (`cqi`)
* `progress()`
* `round()`
* Typed `attr()`

At the time of writing, support is limited to modern browsers implementing these features.

This is definitely an experiment rather than a production technique.

But it demonstrates something I didn't expect:

> With enough geometry, CSS can reconstruct information that it has never been given directly.

## Failed Approaches

As with most experiments, the final solution wasn't the first one.

Some of the ideas explored along the way included:

* Trying to derive the value directly from the thumb anchor position.
* Investigating whether `progress()` could operate on anchor coordinates.
* Looking at Style Queries and `if()` as potential shortcuts.
* Discovering that CSS counters can only output integers.
* Exploring whether a custom property could somehow expose an anchor's position.
* Realising that measuring geometry was easier than accessing state.

In hindsight, the key insight was surprisingly simple:

> Don't try to read the value.
>
> Measure something that changes when the value changes.

Once the thumb's movement could be represented as a measurable width, the rest of the solution naturally followed.
