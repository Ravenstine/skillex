Skills In Pills
===============

A nicer way to write Alexa skills. (WIP)

- Rapidly prototype fun & useful skills through human-readable configuration.
- Easily handle many complex states within a skill.
- Compile your intent schema from your skill configuration.

## Structure

A skill is configured almost entirely through YAML files called "pills".  If you are familiar with [how to write YAML](https://learnxinyminutes.com/docs/yaml/), then you know how to write a skill with pills.  An entire skill can be represented in a single pill(entrypoint.yml), or multiple pills can be used to represent groups of states(e.x. different "scenes" in a text adventure game).

## Getting Started

At the moment, Skills in Pills is available simply as an app skeleton.  Follow these instructions to install:

- Fork & clone the repo.
- Run `npm install` in the project directory.
- Install [Bespoken Tools](https://bespoken.tools/): `npm install -g bespoken-tools`

## Core Concepts

A skill is configured almost entirely through YAML files referred to as "pills".  If you are familiar with [how to write YAML](https://learnxinyminutes.com/docs/yaml/), then you know how to write a skill with pills.  An entire skill can be represented in a single pill, or multiple pills can be used to represent groups of states(e.g. different "scenes" in a text adventure game).  `entrypoint.yml` is always the default pill.

Each pill contains one or more "labels", which are merely the top-level objects in a pill.  You can think of them as the equivalent of functions in a programming language, though they are much more constrained than that.  A label can contain a variety of keys & values that build a skill response.

For example, a label can have a `dialog:` key that defines the speech text that is returned to an Alexa-enabled device.  If you want to ask the user a question and wait for a response, you would define that with a `choice:`.

## Tutorial

Let's make a new skill with pills.

In `pills/entrypoint.yml`, you'll see the following:

```yaml
Intro:
  dialog: Congratulations!  You've successuflly run your first skill with pills.
```

Before we continue, build your schema by running `node compiler.js`.  This will write a JSON file to the `schemas/` directory.

Now it's time to run the Bespoken Tools proxy server:

```sh
bst proxy lambda index.js --pithy
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
  dialog: I know all sorts of things about animals.
```

We've changed the dialog, and your skill reflects that change immediately when you invoke it.  It's still very stupid, and there's no form of interaction.  Let's ask the user for the name of an animal.

```yaml
# pills/entrypoint.yml

Intro:
  dialog: I know all sorts of things about animals.
  choice: 
    dialog: What's your favorite animal?
```

Upon reinvoking the skill, you'll notice that the Echo device will wait for a response, but does nothing more even if you respond to it.  Let's actually make it listen to what you have to say by adding an intent.

```yaml
# pills/entrypoint.yml

Intro:
  dialog: I know all sorts of things about animals.
  choice: 
    dialog: What's your favorite animal?
    intents:
      ${animal}:
        go to: Read Animal Fact
```

Hmm... that's not how you write an intent name... is it?  That looks more like a sample utterance.  Anyway, moving on.

Because we have now changed how the interaction model works, we have to generate a new intent schema by running `node compiler.js`.  Let's check out what's in that new file.

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

The compiler looked at the intent you wrote(the word "intent" being a bit of a misnomer) and derived an intent name, a sample utterance, an a slot including the slot type!  When you define a slot in your intent by itself with no type specified, it will attempt to guess the type based on the name if it matches an Amazon built-in slot type.  We'll learn about defining types later on.  For now, this will work perfectly.  

Upload this schema in the Skill Builder and build the interaction model.  When that's done, reinvoke your skill by saying "Alexa, open my skill."

Oh, snap!  It asked you what your favorite animal is but still did nothing with your response!  Let's see if we can get it to talk back with the name you gave it.

```yaml
# pills/entrypoint.yml

Intro:
  dialog: I know all sorts of things about animals.
  choice: 
    dialog: What's your favorite animal?
    intents:
      ${animal}:
        go to: Read Animal Fact

Read Animal Fact:
  dialog: You said ${animal}.
```

Now if you tell it that you like crocodiles, it will say "You like crocodiles."  How... useless.  Let's make your skill useful!

```yaml
# pills/entrypoint.yml

Intro:
  dialog: I know all sorts of things about animals.
  choice: 
    dialog: What's your favorite animal?
    intents:
      ${animal}:
        go to: Read Animal Fact

Read Animal Fact:
  web request: 
    url: https://simple.wikipedia.org/w/api.php?format=json&redirects=1&action=query&prop=extracts&exintro=&explaintext=&titles=${animal}
    pluck: extract
  dialog: You said ${animal}. ${webResponse}.
```

Incredible!  You've written a skill that takes user input and returns useful information!  A skill can really be this simple.  But there are some finishing touches we should add.

```yaml
# pills/entrypoint.yml

Start:
  intents:
    launch request:
      go to: Intro
    ${animal}:
      go to: Read Animal Fact

Intro:
  dialog: I know all sorts of things about animals.
  choice: 
    dialog: What's your favorite animal?
    intents:
      ${animal}:
        go to: Read Animal Fact

Read Animal Fact:
  web request:
    url: https://simple.wikipedia.org/w/api.php?format=json&redirects=1&action=query&prop=extracts&exintro=&explaintext=&titles=${animal}
    pluck: extract
    none dialog: I don't know about ${animal}.
  dialog: You said ${animal}. ${webResponse}.
```

Since we want a user to also be able to invoke the skill by saying "Alexa, ask my skill about monkeys", we've added a new label at the top of the pill that directs us between the intro and the fact reader.  The label at the top of a pill is always the first to be executed during a session.  You can think of what we created as a "router" label.

Sometimes you'll ask it something it will not know about.  In that case, the `none dialog:` key in the web request overrides the label dialog if the search result returned nothing.


## Compiler

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

## HALP

Help would most definitely be appreciated!  If you've forked the repo and added your own features, don't hesitate to make a pull request.  Assistance with documentation, as well as discussion in [issues](https://github.com/ravenstine/skills-in-pills/issues) would be of great help.

## TODO

- web request **complete**
- `go to pill:` **complete**
- `go to random:`
- `condition:` **complete enough**
- `card:` **complete**
- `assign:` w/ operators **complete**
- template strings **complete**
- `script:` **complete**
- metadata section w/ `import:` **complete**
- template labels **complete**
- `audio:` **complete**
- compilation/merging of custom slot types
- linter/warning system to catch errors
- `reprompt:` **complete**
- full support of multi-language strings
- session persistence
- `video:`
- utterance expander **complete**
- intent wildcard **complete**
- `none dialog:` for web request **complete**
- directive function access inside of `script:`
- automatic mapping of simpler intent names to AMAZON intent names **complete**
- automagically guess built-in slot types based on slot names **complete**
- encrypted attributes
- simple slot value extraction **complete**
- your intent names are also your sample utterances **complete**
- `require slots:`
- `temp:` **complete**
- `pluck:` **complete**

## License

See [LICENSE.txt](https://github.com/Ravenstine/skills-in-pills/blob/master/LICENSE.txt).

