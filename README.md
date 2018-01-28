Skills In Pills
===============

- Rapidly prototype fun & useful skills through human-readable configuration.
- Easily handle many complex states within a skill.

## Structure

A skill is configured almost entirely through [YAML](https://learnxinyminutes.com/docs/yaml/) files called "pills".  An entire skill can be represented in a single pill(entrypoint.yml), or multiple pills can be used to represent groups of states(e.x. different "scenes" in a text adventure game).

## Getting Started

`npm install -g skills-in-pills`

This tool is designed to be used with the Ask CLI.  

[Ask CLI](https://developer.amazon.com/docs/smapi/ask-cli-command-reference.html): `npm install -g ask-cli`

It's also recommended you use Bespoken Tools for developing your skill without having to frequently redeploy to see your changes.

[Bespoken Tools](https://bespoken.tools/): `npm install -g bespoken-tools`

## Core Concepts

A skill is configured almost entirely through YAML files referred to as "pills".  An entire skill can be represented in a single pill, or multiple pills can be used to represent groups of states(e.g. different "scenes" in a text adventure game).  `entrypoint.yml` is always the default pill.

Each pill contains one or more "labels", which are merely the top-level objects in a pill.  Labels represent a very specific state in the execution of a skill, and can contain various key/value pairs used to build a skill response.

For example, a label can have a `speak:` key that defines the speech text that is returned to an Alexa-enabled device.  If you want to ask the user a question and wait for a response, you would define that with a `ask:`.

## Tutorial

Let's make a new skill with pills.

```sh
skills-in-pills new myskill
```

In `myskill/pills/entrypoint.yml`, you'll see the following:

```yaml
Intro:
  speak: Congratulations!  You've successuflly run your first skill with pills.
```

Before we continue, build your schema by running `skill-in-pills build-model`.  This will write a JSON file to the `build/alexa` directory.

Assuming you have set up the Ask CLI with the proper credentials, you can deploy your skill by running:

```sh
skills-in-pills deploy
```

Which is the equivalent of running

```sh
skills-in-pills bundle
ask deploy
```

If the deploy is successful, your skill should now be available on an Alexa-enabled device associatd with your Amazon developer account.  Just say "Alexa, open my skill" and see what happens, or use the new [test simulator](https://developer.amazon.com/blogs/alexa/post/577069bd-d9f9-439a-b4bf-3b0495e3d24b/announcing-new-test-simulator-beta-for-alexa-skills).

### Using the Bespoken Lambda Proxy

Bespoken Tools makes is much easier to develop Alexa skills because it allows you to make live code changes without having to redeploy.

1. Run `npm install -g bespoken-tools`
2. In the root directory of your skill, run `bst proxy lambda index.js`.  This will generate a URL in your console that you can use as a proxy to your locally running skill.
3. Sign in to the [Amazon developer portal](https://developer.amazon.com/login.html) and navigate to the configuration for your skill.
4. Select **Configuration** and select *HTTPS* under **Endpoint** and paste the URL we got from the console.  Click **Next**.
5. In the **SSL Certificate** section, under **Certificate for NA Endpoint:**, choose "My development endpoint is a sub-domain of a domain that has a wildcard certificate from a certificate authority".

Your skill can now be tested with an Alexa device associated with your Amazon developer account.

### Tutorial Cont'd

The skill can be invoked by saying "Alexa, open my skill."

Your device will then respond with "Congratulations!  You've successuflly run your first skill with pills."

If that's what Alexa says back to you, then you're good to go.  This is a pretty boring skill, though.  Let's make something more interesting!

```yaml
# pills/entrypoint.yml

Intro:
  speak: I know all sorts of things about animals.
```

We've changed the dialog, and your skill reflects that change immediately when you invoke it.  It's still very stupid, and there's no form of interaction.  Let's ask the user for the name of an animal.

```yaml
# pills/entrypoint.yml

Intro:
  speak: I know all sorts of things about animals.
  ask: What's your favorite animal?
```

Upon reinvoking the skill, you'll notice that the Alexa-enabled device will wait for a response, but does nothing more even if you respond to it.  Let's actually make it listen to what you have to say by adding an intent.

```yaml
# pills/entrypoint.yml

Intro:
  speak: I know all sorts of things about animals.
  ask: What's your favorite animal?
  intents:
    FavoriteAnimalIntent:
      go to: Read Animal Fact
```

Since our skill now expects an intent from the user, we must define it in `interaction-model.yml`.

```yaml
invocationName: my skill
types: []
intents:
  - name: FavoriteAnimalIntent
    samples: 
      - {animal}
      - the {animal}
dialog:
prompts:
```

Don't worry, it's not required that you define your slot types.

Generate your interaction model JSON by running `skills-in-pills build-model` and check out the file `build/alexa/models/en-US.json`.

```json
{
  "intents": [
    {
      "name": "AMAZON.CancelIntent",
      "samples": [],
      "slots": []
    },
    {
      "name": "AMAZON.HelpIntent",
      "samples": [],
      "slots": []
    },
    {
      "name": "AMAZON.StopIntent",
      "samples": [],
      "slots": []
    },
    {
      "name": "AnimalIntent",
      "samples": [
        "{animal}"
      ],
      "slots": [
        {
          "name": "animal",
          "type": "AMAZON.Animal",
          "samples": []
        }
      ]
    }
  ],
  "types": []
}
```


The compiler looked at the utterance samples you wrote and guessed the slot type!  When you define a slot in your intent by itself with no type specified, it will attempt to guess the type based on the name if it matches an Amazon built-in slot type.  If you didn't specify a type, and the name you use doesn't match a built-in type, it will default to `AMAZON.LITERAL`.

As you can see, the model builder will also add the required intents for you if you don't specify them yourself.

Deploy your skill and then reinvoke your skill by saying "Alexa, open my skill."

Oh, snap!  It asked you what your favorite animal is but still did nothing with your response!  Let's see if we can get it to talk back with the name you gave it.

```yaml
# pills/entrypoint.yml

Intro:
  speak: I know all sorts of things about animals.
  ask: What's your favorite animal?
  intents:
    FavoriteAnimalIntent:
      go to: Read Animal Fact

Read Animal Fact:
  speak: You said {{animal}}.
```

Now if you tell it that you like crocodiles, it will say "You like crocodiles."  How... useless.  Let's make your skill useful!

```yaml
# pills/entrypoint.yml

Intro:
  speak: I know all sorts of things about animals.
  ask: What's your favorite animal?
  intents:
    FavoriteAnimalIntent:
      go to: Read Animal Fact

Read Animal Fact:
  script: |
    fetch('https://simple.wikipedia.org/w/api.php?format=json&redirects=1&action=query&prop=extracts&exintro=&explaintext=&titles=' + animal)
      .then((resp) -> resp.json())
      .then((json) -> set 'temp.result', Object.values(json.query.pages)[0])
  speak: |
    You said {{slots.animal}}.
    {{#each temp.result as |page|}}
      {{page.extract}}
    {{/each}}
```

Incredible!  You've written a skill that takes user input and returns useful information!  A skill can really be this simple.  But there are some finishing touches we should add.

```yaml
# pills/entrypoint.yml

Start:
  intents:
    FavoriteAnimalIntent::
      go to: Read Animal Fact
  go to: Intro

Intro:
  speak: I know all sorts of things about animals.
  ask: What's your favorite animal?
  intents:
    FavoriteAnimalIntent:
      go to: Read Animal Fact

Read Animal Fact:
  script: |
    fetch('https://simple.wikipedia.org/w/api.php?format=json&redirects=1&action=query&prop=extracts&exintro=&explaintext=&titles=' + animal)
      .then((resp) -> resp.json())
      .then((json) -> set 'temp.result', Object.values(json.query.pages)[0])
  speak: |
    You said {{slots.animal}}.
    {{#each temp.result as |page|}}
      {{page.extract}}
    {{/each}}
```

Since we want a user to also be able to invoke the skill by saying "Alexa, ask my skill about monkeys", we've added a new label at the top of the pill that directs us between the intro and the fact reader.  The label at the top of a pill is always the first to be executed during a session.  You can think of what we created as a "router" label.

## Deployment

Running `skills-in-pills bundle` will create an optimized bundle of your skill and place it in `./build`, which you can upload to an AWS Lambda function.  You can deploy your skill as-is without bundling, but the bundling process precompiles your pills into a JSON structure that is a part of the application, reducing boot & response time.

## Object Reference

Until I can get a documentation builder working, see the YAML-formatted JSON schemas under [schemas/](https://github.com/Ravenstine/skills-in-pills/tree/master/schemas).

## Tests

Testing uses [Mocha](https://github.com/mochajs/mocha), and is pretty much a joke at the moment.

`npm install -g mocha`

Run tests with the `mocha` command in the root project folder.

## HALP

Help would most definitely be appreciated!  If you've forked the repo and added your own features, don't hesitate to make a pull request.  Assistance with documentation, as well as discussion in [issues](https://github.com/ravenstine/skills-in-pills/issues) would be of great help.

## TODO

- `swallow pill:` **complete**
- `go to random:`
- `condition:` **complete enough**
- `card:` **complete**
- `assign:` w/ operators **complete**
- template strings **complete**
- `script:` **complete**
- template keys **complete**
- `audio:` **complete**
- compilation/merging of custom slot types *i forget if i did this*
- linter/warning system to catch errors & pitfalls
- `reprompt:` **complete**
- full support of multi-language strings **complete**
- session persistence
- `video:`
- utterance expander **complete**
- utterance wildcard **complete**
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

See [LICENSE.txt](https://github.com/Ravenstine/skills-in-pills/blob/master/LICENSE.txt).

