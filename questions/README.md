# Questions plugin

> Section under construction

The questions plugin provides the capability to collect questions from the audience for a Q&A session. It uses the [`seminar` plugin](https://github.com/rajgoel/reveal.js-plugins/tree/master/seminar).


A host can open a seminar room and share a link with the room name to anyone else. Everyone with the link can follow the hosted presentation ask questions. Other participants can upvote questions and hosts can close questions.

[Check out the demo](https://rajgoel.github.io/reveal.js-demos/?topic=seminar)

## Setup

To use the plugin include
```html
<!-- Font awesome is used by several plugins -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<!-- Custom controls plugin -->
<script src="https://cdn.jsdelivr.net/npm/reveal.js-plugins@latest/customcontrols/plugin.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js-plugins@latest/customcontrols/style.css">
<!-- Seminar plugin -->
<script src="https://cdn.jsdelivr.net/npm/reveal.js-plugins@latest/seminar/plugin.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.6.1/socket.io.js"></script>
<!-- Questions plugin requires seminar plugin -->
<script src="https://cdn.jsdelivr.net/npm/reveal.js-plugins@latest/questions/plugin.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js-plugins@latest/questions/style.css">
```
to the header of your presentation and configure reveal.js and the plugin by

```js
Reveal.initialize({
  customcontrols: {
    controls: [
      {
        id: 'toggle-questions',
        title: 'Toggle Q&A dashboard (Q)',
        icon: '<span class="fa-stack" style="margin: -24px -12px;padding:0;"><span class="fa-solid fa-comment fa-stack-1x"></span><strong class="fa-stack-1x fa-inverse qna question-counter" style="font-size:0.5em;"></strong></span>',
        action: 'RevealQnA.toggleQnA();'
      }
    ]
  },
	seminar: {
    // add configuration here
  },
  // ...
  plugins: [ RevealSeminar, RevealQnA ],
  // ...
});
```


## License

MIT licensed

Copyright (C) 2023 Asvin Goel
