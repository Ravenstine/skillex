Skills In Pills
===============

An alternative way to write Alexa skills. (WIP)

## Goals

- Allow people to write useful skills through configuration.
- Make it easy to handle many complex states within a skill.
- Let intents be defined inline where they are being used within states.

## Organisation

A skill is configured almost entirely through YAML files called "pills".  If you are familiar with how to write YAML, then you know how to write a skill with pills.  An entire skill can be represented in a single pill(entrypoint.yml), or multiple pills can be used to represent groups of states(e.x. different "scenes" in a text adventure game).

Every pill contains a set of labels describing specific states.  A label is merely a top-level key in a pill.

This is an example of a label:

```yaml
Intro:
  dialog: Hello world!
```

## Tests

Testing uses [Mocha](https://github.com/mochajs/mocha).

`npm install -g mocha`

Run tests with the `mocha` command in the root project folder.

