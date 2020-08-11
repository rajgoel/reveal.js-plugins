# Audio slideshow

A plugin for [Reveal.js](https://github.com/hakimel/reveal.js) allowing to easily add audio playback to each slide and fragment of your presentation.
The slideshow adds an audio player to the slideshow and plays an audio file provided for each slide and fragment.
When an audio file has finished playing, the plugin and automatically advances the slideshow to the next slide or fragment.

[Check out the live demo](https://rajgoel.github.io/reveal.js-demos/audio-slideshow-demo.html)


## Installation

Copy the files ```plugin.js```, ```recorder.js```, and ```RecordRTC.js``` into the plugin folder of your reveal.js presentation, i.e. ```plugin/audio-slideshow``` and load the plugin as shown below.

```html
<script src="plugin/audio-slideshow/plugin.js"></script>
<script src="plugin/audio-slideshow/recorder.js"></script>
<script src="plugin/audio-slideshow/RecordRTC.js"></script>

<script>
    Reveal.initialize({
        // ...
        plugins: [ RevealAudioSlideshow, RevealAudioRecorder ],
        // ...
    });
</script>
```

The plugin ```RevealAudioRecorder``` and the respective files ```recorder.js``` and ```RecordRTC.js```are optional and not necessary for audio playback.


## Configuration

The ```plugin.js``` has several parameters that you can set for your presentation by providing an ```audio``` option in the reveal.js initialization options.
Note that all configuration parameters are optional and will default as specified below.


```javascript
Reveal.initialize({
	// ...
	audio: {
		prefix: 'audio/', 	// audio files are stored in the "audio" folder
		suffix: '.ogg',		// audio files have the ".ogg" ending
		textToSpeechURL: null,  // the URL to the text to speech converter
		defaultNotes: false, 	// use slide notes as default for the text to speech converter
		defaultText: false, 	// use slide text as default for the text to speech converter
		advance: 0, 		// advance to next slide after given time in milliseconds after audio has played, use negative value to not advance
		autoplay: false,	// automatically start slideshow
		defaultDuration: 5,	// default duration in seconds if no audio is available
		defaultAudios: true,	// try to play audios with names such as audio/1.2.ogg
		playerOpacity: 0.05,	// opacity value of audio player if unfocused
		playerStyle: 'position: fixed; bottom: 4px; left: 25%; width: 50%; height:75px; z-index: 33;', // style used for container of audio controls
		startAtFragment: false, // when moving to a slide, start at the current fragment or at the start of the slide
	},
	// ...
});
```

## Preparing an audio slideshow

For each slide or fragment you can explicitly specify a file to be played when the slide or fragment is shown by setting the ```data-audio-src``` attribute for the slide or fragment.

```html
<section>
	<p>
		With audio slideshows you can add recorded audio to whatever you want to deliver to your audience.
	</p>
	<p class ="fragment" data-audio-src="audio/birds.ogg">
		Listen to the birds
	</p>
</section>
```

If no audio file is explicitly specified, the plugin automatically determines the name of the audio file using the given ```prefix```, the slide (or fragment) indices, and the ```suffix```, e.g. in the above code the slideshow will play the file ```audio/1.2.ogg```  before the fragment is shown (assuming that ```prefix``` is ```"audio/"```, ```suffix``` is ```".ogg"``` , ```Reveal.getIndices().h``` is ```"1"``` and ```Reveal.getIndices().v``` is ```"2"```).

If you just want to play audio when file names are explicitly set with ```data-audio-src```, configure ```defaultAudios``` to ```false```.

### Text-to-speech

If no audio file is explicitly specified and the default audio file is not found, the plugin can play audio files obtained from a text-to-speech generator.
In order to enable text-to-speech functionality, the parameter ```textToSpeechURL``` must be specified.
For example, in order to use the free text-to-speech generator of [Voice RSS](http://www.voicerss.org/) you can set ```textToSpeechURL: "http://api.voicerss.org/?key=[YOUR_KEY]&hl=en-gb&c=ogg&src="```,
where ```[YOUR_KEY]``` should be the key that you obtained after [registration at Voice RSS](http://www.voicerss.org/registration.aspx).

The plugin automatically extracts the text to be sent to the text-to-speech generator from the slide content in the following order:
- If the optional  ```data-audio-text``` attribute is given for the slide or fragment, the value of this attribute is used as the text.
- If  the  parameter ```defaultNotes``` is set to ```true```, the text given in the notes of the slide are used as the text (note that this option does not work with fragments).
- If the parameter ```defaultText``` is set to ```true```, the slide or fragment content is used as text.


```html
<section data-audio-text="This is the text sent to the text-to-speech generator">
	<p>This is the text shown on the slide</p>
</section>
<section>
	<p>This is the text <span data-audio-text="sent to the text-to-speech generator (but only if the parameter defaultText is set to true)">shown on the slide</span></p>
</section>

```

### Audio recording

You can use the ```recorder.js``` plugin to record audio files for each slide and fragment.

Recording can be toggled by pressing the key ```R```.
A red circle in the upper right corner of the slideshow shows that the recorder is on.
When navigating to a slide for which an audio file is already recorded, recording is suspended so that the previously recorded file is not lost.
A yellow circle shows that recording is automatically resumed when navigating to a slide without a recorded audio file.
After stopping the recorder, you can use the audio controls to check your recording.

By pressing the key ```Z```you can download a zip-file containing the audio files recorded for each slide and fragment.

The ```recorder.js``` plugin allows you to fetch the automatically generated audio files by pressing the key ```T```. The fetched audio files are downloaded as a zip-file and can be provided to the slideshow.
Note that the text-to-speech converter is only used if no audio file is provided with the slideshow.


### Navigation behaviour

#### Slides without audio

If no audio file and no text is provided for a slide or fragment, the slide advances after the duration specified by the ```defaultDuration``` parameter.

#### Options for automatically advancing to next slide

The ```advance``` parameter can be used to specify a time (in milliseconds) to wait before advancing to the next slide or fragment.
If the parameter value is set to zero, the slideshow advances with the next slide or fragment immediately after the previous audio is played.
If the parameter value is set to a negative value, the slideshow does not advance after the audio is played.
For each slide or fragment the ```data-audio-advance``` attribute can be set to overwrite the  parameter.

#### Automatically start slideshow

By default the slideshow does not start automatically. The ```autoplay``` parameter can be used to automatically start the slideshow when navigating to it.

#### Navigating to a slide with fragments

By default the audio slideshow does not show any fragment when navigating to a slide (even if they were shown previously). The ```startAtFragment``` parameter can be used to use the default behaviour of reveal.js.


#### Linking audio controls to embedded video

By setting the ```data-audio-controls``` attribute for a video, the audio player controls can be linked to an embedded video.

```html
<video preload="auto" data-audio-controls src="http://video.webmfiles.org/big-buck-bunny_trailer.webm" width="720" height="480">
</video>
```


## Compatibility and known issues

Playback is supported on recent desktop versions of Firefox, Chrome, and Opera.
However, audio support of different browsers and for different operating systems is differently implemented and may not always work flawlessly.
For example, playback of audio when using Chrome for Android, must be triggered [manually](https://code.google.com/p/chromium/issues/detail?id=178297) for each slide and fragment due to design decisions of Chrome developers.
For other browser and mobile devices the functionality may be limited or the plugin may not work at all.


The ```recorder.js```  plugin is based on [RecordRTC.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC) and supports recording on recent desktop versions of Firefox, Chrome, and Opera.
For other browser and mobile devices recording may not work at all.

### Recording and fetching audio files on Chrome

Your slideshow should be loaded  on HTTP or HTTPS. For slide decks stored on the local disk, you may have to launch the Chrome browser from the command line window with additional arguments for full functionality.

```
google-chrome  --disable-web-security --allow-file-access-from-files slidedeck.html
```

## License

MIT licensed

Copyright (C) 2020 Asvin Goel
