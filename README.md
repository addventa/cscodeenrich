# ChatScript code enricher

When you create a chatbot you may want to dissociate the text of the chatbot: answers labels and user utterance samples, from your chatscript code source.
Goal is to ease maintenance and to allow some enrichment by the business users (which sadly won't edit the chatscript top files). It's also easier for them to add synonyms.

This simple program will take as an input:
* top files which contain place holders (bsXxx = 'bot says Xxx' or usXxx = 'user says Xxx')
* a plain text file which contains the replacement values of the placeholders

It will generate new top files with the placeholders replaced by their target values.

## In your ChatScript top files

### Chatbot answers

Put texts like `bsOkDone` anywhere in the text that should be output by your bot (or in any macro etc.). After merging it will be transformed in
```
[Ok it's done.] [Done.] [Oops!... I Did It Again.]
``` 

Pattern is `bs*`, _bs_ stands for "bot says".


### User utterances

Put comments like `# usCreditCardCeiling`. After merging it will be transformed in
```
# usCreditCardCeiling
#! I want to change the ceiling of my credit card
#! augment my credit card maximum
```

Pattern is `us*`, _bs_ stands for "user says".

Most surely you will need to check your patterns and enrich them each time the business users give you new user utterances.


You should be able to compile your chatbot as is even before the merging.


## Labels file

The labels file is just a plein text file.
Each line contains either a title (bsSomething or usSomething) and the lines after the title are the replacement.

```
bsOkDone
Ok it's done.
Done.
Oops!... I Did It Again.

usCreditCardCeiling
I want to change the ceiling of my credit card
augment my credit card maximum
```

Feel free to add blank lines anywhere.
There's no required order between the bsSomething and usSomething.


## Merging both

Configuration is done via `config.json` file:
* `mapping`: path to your mapping file
* `cstop`: path to your top files (no training '/')
* `cstopoutput`: path to the top files which will be written

`cstop` and `cstopoutout` should have different values.



