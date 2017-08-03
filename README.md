Skills In Pills
===============

A nicer way to write Alexa skills. (WIP)

- Write fun & useful skills through human-readable configuration.
- Easily handle many complex states within a skill.
- Define your intents within your skill configuration.
- Use [SSML](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/speech-synthesis-markup-language-ssml-reference) as the default output speech type.

## Structure

A skill is configured almost entirely through YAML files called "pills".  If you are familiar with [how to write YAML](https://learnxinyminutes.com/docs/yaml/), then you know how to write a skill with pills.  An entire skill can be represented in a single pill(entrypoint.yml), or multiple pills can be used to represent groups of states(e.x. different "scenes" in a text adventure game).

Every pill contains a set of labels describing specific states.  A label is merely a top-level key in a pill.

This is an example of a label:

```yaml
FirstFloor:
  dialog: You enter the spooky house.
  choice:
    dialog: Would you like to go upstairs, or stay on the floor you're on?
    intents:
      UpstairsIntent:
        samples:
          - go upstairs
          - upstairs
        go to: Upstairs
      DiningRoomIntent:
        samples:
          - stay on the floor i'm on
          - stay on this floor
          - stay here
          - stay
        go to: DiningRoom
```

## Compiler

You can optionally include intent information inside of pills.  Currently, this is limited to just sample utterances, but will be expanded in the near future.

`node compiler.js` will go through all intents mentioned in all the pills and merge them into a single JSON intent schema.  Copy & paste the output into your Alexa Skills Kit code editor.  Any intents with the same name get merged, including their sample utterances.

## Development

It's recommended that you use [bespoken.tools](https://bespoken.tools/).

### Installation

`npm install -g bespoken-tools`

### Use

`bst proxy lambda index.js`

In your terminal, bst will print a link that you can provide to your Alexa skill configuration.  This will proxy requests from an Echo device to your skill.

## Tests

Testing uses [Mocha](https://github.com/mochajs/mocha).  It's also kinda horseshit at the moment.

`npm install -g mocha`

Run tests with the `mocha` command in the root project folder.

