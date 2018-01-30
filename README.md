Skillex
=======

- Write Alexa skills through human-readable configuration.
- Easily handle many complex states within a skill.

## Getting Started

`npm install -g skillex`

This tool is designed to be used with the Ask CLI.  

[Ask CLI](https://developer.amazon.com/docs/smapi/ask-cli-command-reference.html): `npm install -g ask-cli`

It's also recommended you use Bespoken Tools for developing your skill without having to frequently redeploy to see your changes.

[Bespoken Tools](https://bespoken.tools/): `npm install -g bespoken-tools`

## Core Concepts

A skill is configured almost entirely through YAML files referred to as "scenes".  An entire skill can be represented in a single scene, or multiple scenes can be used to represent groups of states(e.g. different "scenes" in a text adventure game).  `entrypoint.yml` is always the default scene.

Each scene contains one or more "labels", which are merely the top-level objects in a scene.  Labels represent a very specific scene in the execution of a skill, and can contain various key/value pairs used to build a skill response.

For example, a label can have a `say:` key that defines the speech text that is returned to an Alexa-enabled device.  If you want to ask the user a question and wait for a response, you would define that with a `ask:`.

## Tutorial

Let's make a new skill.

```sh
skillex new my-skill
```

In `my-skill/scene/entrypoint.yml`, you'll see the following:

```yaml
Intro:
  speak: Congratulations!  You've successuflly run your first skill.
```

Before we continue, build your schema by running `skillex build-model`.  This will write a JSON file to the `build/alexa/models` directory.

Assuming you have set up the Ask CLI with the proper credentials, you can deploy your skill by running:

```sh
skillex deploy
```

Which is the equivalent of running

```sh
skillex bundle
ask deploy
```

If the deploy is successful, your skill should now be available on an Alexa-enabled device associatd with your Amazon developer account.  Just say "Alexa, open my skill" and see what happens, or use the new [test simulator](https://developer.amazon.com/blogs/alexa/post/577069bd-d9f9-439a-b4bf-3b0495e3d24b/announcing-new-test-simulator-beta-for-alexa-skills).

## Tests

Testing uses [Mocha](https://github.com/mochajs/mocha), and is pretty much a joke at the moment.

`npm install -g mocha`

Run tests with the `mocha` command in the root project folder.

## Current State

I'm working on a serious rewrite.  Will add more documentation soon as things stabilize.

## TODO

- `go to scene:` **complete**
- `go to random:`
- `condition:` **complete enough**
- `card:` **complete**
- `assign:` w/ operators **complete**
- template strings **complete**
- `script:` **complete**
- template keys **complete**
- `audio:` **complete**
- linter/warning system to catch errors & pitfalls
- `reprompt:` **complete**
- full support of multi-language strings **complete**
- session persistence
- `video:`
- utterance expander **complete**
- intent wildcard **complete**
- automatic mapping of simpler intent names to AMAZON intent names **complete**
- automagically guess built-in slot types based on slot names **complete**
- encrypted attributes
- simple slot value extraction **complete**
- your utterances are also your intents & samples **complete**
- `require slots:`
- templates and the Display directive
- `prompts:`
- Random speech strings to easily provide converstional variance **complete**

## License

See [LICENSE.txt](https://github.com/Ravenstine/skillex/blob/master/LICENSE.txt).

