Skills In Pills
===============

**NOTE:** I planned on building this system out, but I've been distracted by many things not Alexa-related.  If I do continue work on this, it will probably end up as a major rewrite with some different paradigms as I have never been completely satisfied with the logic flow.  For the time being, treat this thing as a toy.

A nicer way to write Alexa skills. (WIP)

- Rapidly prototype fun & useful skills through human-readable configuration.
- Easily handle many complex states within a skill.
- Compile your intent schema from your skill configuration.  Never be baffled at synatx errors in your schema.†

## Structure

A skill is configured almost entirely through YAML files called "pills".  If you are familiar with [how to write YAML](https://learnxinyminutes.com/docs/yaml/), then you know how to write a skill with pills.  An entire skill can be represented in a single pill(entrypoint.yml), or multiple pills can be used to represent groups of states(e.x. different "scenes" in a text adventure game).

## Getting Started

At the moment, Skills in Pills is available simply as an app skeleton.  Follow these instructions to install:

- `npm install -g skills-in-pills`
- Install [Bespoken Tools](https://bespoken.tools/): `npm install -g bespoken-tools`

## Core Concepts

A skill is configured almost entirely through YAML files referred to as "pills".  If you are familiar with [how to write YAML](https://learnxinyminutes.com/docs/yaml/), then you know how to write a skill with pills.  An entire skill can be represented in a single pill, or multiple pills can be used to represent groups of states(e.g. different "scenes" in a text adventure game).  `entrypoint.yml` is always the default pill.

Each pill contains one or more "labels", which are merely the top-level objects in a pill.  You can think of them as the equivalent of functions in a programming language, though they are much more constrained than that.  A label can contain a variety of keys & values that build a skill response.

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

Before we continue, build your schema by running `skill-in-pills build-schema`.  This will write a JSON file to the `schemas/` directory.

Now it's time to run the Bespoken Tools proxy server:

```sh
bst proxy lambda index.js --verbose
```

The output of that command will say something like `Your URL for Alexa Skill configuration:` and a link.  Copy that link down for later.

### Skill Setup

Now we just need to tie things into a new skill configuration.

1. Sign in to the [Amazon developer portal](https://developer.amazon.com/login.html). If you haven’t done so already, you’ll need to create a free account.
2. From the top navigation bar, select **Alexa**.
3. Under **Alexa Skills Kit**, choose **Get Started >**.
4. Choose **Add a New Skill**.
5. Name your skill and add an "invocation name".  This is the word or phrase that users will speak to activate the skill.  We'll use "my skill" as the invocation name for this tutorial.  Save and continue.
6. Click on the button that says "Launch Skill Builder Beta".  Skills In Pills doesn't currently support the old builder.
7. In the "Code Editor" tab, drag and drop the JSON file you built earlier into the window, then click **Apply Changes**.
8. Click **Build Model**.  This may take a few minutes.  Then click the button at the top that says **Configuration**.
9. Under **Endpoint**, select *HTTPS* and tick the box of whichever region is closest to you.  In my case, that's `North America`.  Paste the URL we saved from earlier into the text field, then click **Next**.
10. In the **SSL Certificate** section, under **Certificate for NA Endpoint:**, choose "My development endpoint is a sub-domain of a domain that has a wildcard certificate from a certificate authority".

Your skill is now ready to be tested.  You can either test it using the service simulator, [Echosim.io](https://echosim.io/), or an Echo device associated with your developer account.

Bespoken Tools is a useful tool that allows you to develop Alexa skills locally, without having to use AWS Lambda.  It also reloads your code automatically when you make changes.

### Tutorial Cont'd

The skill can be invoked by saying "Alexa, open my skill."

Your device will then respond with "Congratulations!  You've successuflly run your first skill with pills."

If that's the response you get, then you're good to go.  This is a pretty boring skill, though.  Let's make something more interesting!

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

Upon reinvoking the skill, you'll notice that the Echo device will wait for a response, but does nothing more even if you respond to it.  Let's actually make it listen to what you have to say by adding an intent.

```yaml
# pills/entrypoint.yml

Intro:
  speak: I know all sorts of things about animals.
  ask: What's your favorite animal?
  utterances:
    ${animal}:
      go to: Read Animal Fact
```

Hmm... that's not how you write an intent name... is it?  That looks more like a sample utterance.  Anyway, moving on.

Because we have now changed how the interaction model works, we have to generate a new intent schema by running `skill-in-pills build-schema`.  Let's check out what's in that new file.

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

How did it do that???

The compiler looked at the utterance you wrote and derived an intent name, a sample utterance, an a slot including the slot type!  When you define a slot in your intent by itself with no type specified, it will attempt to guess the type based on the name if it matches an Amazon built-in slot type.  We'll learn about defining types later on.  For now, this will work perfectly.

Upload this schema in the Skill Builder and build the interaction model.  When that's done, reinvoke your skill by saying "Alexa, open my skill."

Oh, snap!  It asked you what your favorite animal is but still did nothing with your response!  Let's see if we can get it to talk back with the name you gave it.

```yaml
# pills/entrypoint.yml

Intro:
  speak: I know all sorts of things about animals.
  ask: What's your favorite animal?
  utterances:
    ${animal}:
      go to: Read Animal Fact

Read Animal Fact:
  speak: You said ${animal}.
```

Now if you tell it that you like crocodiles, it will say "You like crocodiles."  How... useless.  Let's make your skill useful!

```yaml
# pills/entrypoint.yml

Intro:
  speak: I know all sorts of things about animals.
  ask: What's your favorite animal?
  utterances:
    ${animal}:
      go to: Read Animal Fact

Read Animal Fact:
  web request: 
    url: https://simple.wikipedia.org/w/api.php?format=json&redirects=1&action=query&prop=extracts&exintro=&explaintext=&titles=${animal}
    pluck: extract
  speak: You said ${animal}. ${webResponse}.
```

Incredible!  You've written a skill that takes user input and returns useful information!  A skill can really be this simple.  But there are some finishing touches we should add.

```yaml
# pills/entrypoint.yml

Start:
  utterances:
    ${animal}:
      go to: Read Animal Fact
  go to: Intro

Intro:
  speak: I know all sorts of things about animals.
  ask: What's your favorite animal?
  utterances:
    ${animal}:
      go to: Read Animal Fact

Read Animal Fact:
  web request:
    url: https://simple.wikipedia.org/w/api.php?format=json&redirects=1&action=query&prop=extracts&exintro=&explaintext=&titles=${animal}
    pluck: extract
    none speech: I don't know about ${animal}.
  speak: You said ${animal}. ${webResponse}.
```

Since we want a user to also be able to invoke the skill by saying "Alexa, ask my skill about monkeys", we've added a new label at the top of the pill that directs us between the intro and the fact reader.  The label at the top of a pill is always the first to be executed during a session.  You can think of what we created as a "router" label.

Sometimes you'll ask it something it will not know about.  In that case, the `none speak:` key in the web request overrides the label dialog if the search result returned nothing.

## Schema Builder

`skill-in-pills build-schema` will go through all intents mentioned in all the pills and merge them into a single JSON intent schema in the `speechAssets/` directory.  Drag or copy+paste the schema into your Alexa Skills Kit code editor.  Any intents with the same name get merged, including their sample utterances.

This only outputs a schema that will work for Skill Builder Beta.  It will not output separate text files for sample utterances.  You should just use Skill Builder Beta.

## Development

It's recommended that you use [bespoken.tools](https://bespoken.tools/).

`bst proxy lambda index.js`

In your terminal, bst will print a link that you can provide to your Alexa skill configuration.  This will proxy requests from an Echo device to your skill.

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

