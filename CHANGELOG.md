# Changelog

The first two numbers of the versioning scheme refer to the  version of `reveal.js` that was used for testing the plugins. The last number is a running index indicating the version of the plugin collection.

## Unpublished

- ...

## 4.2.4

### New features

- Added support for changing  playback rate of audio: https://github.com/rajgoel/reveal.js-plugins/pull/148

### Breaking changes

- Default audio suffix is now `.webm`. Explicitly set config parameter back to `.ogg` if needed.

## 4.2.0

### New features

- Added `loadcontent` plugin
- Plugins now work in strict mode

### Breaking changes

- In `animate` plugin, external svgs must now be loaded with `loadcontent` plugin. Thus, `data-src` is no longer supported to load external svg files to be animated. To migrate old animations add the [`loadcontent` plugin](loadcontent) and replace
```html
<div data-animate data-src="graphics.svg">
<!-- External svg file to be animated will be added here -->
</div>
```
by
```html
<div data-animate data-load="graphics.svg">
<!-- External svg file to be animated will be added here -->
</div>
```

- Removed deprecated config from `anything` plugin
- Removed deprecated buttons from `chalkboard` plugin (use `customcontrols` plugin instead)
- Removed deprecated buttons from `questions` plugin (use `customcontrols` plugin instead)
- Removed `embed-tweet` plugin, `loadcontent` plugin can be used instead
- Seminar plugin now works with [socket.io v4.6.1](https://socket.io/docs/v4/changelog/4.6.1): Make sure to update seminar server and client library, e.g., by using
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.6.1/socket.io.js"></script>
```

## 4.1.5

- Last version before starting changelog.
