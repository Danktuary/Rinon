# Rinon

An emoji server bot for some friends and I. 🎉

# Installation and stuff

## Config file

Rename the `config.example.js` file to `config.js` and fill out the necessary fields. Almost all of the fields will have preset values, but there are some that will need to fill out yourself.

## Required permissions

* `ADD_REACTIONS`: For adding reactions so that the emojis can be approved or denied.
* `CREATE_INSTANT_INVITE`: For the `>server` command, so that users may join other emoji servers that Rinon is on.
* `EMBED_LINKS`: To post embeds in the #emoji-voting channel (text fallback soon™(?)), and also for the `>server` command (text fallback available™).
* `MANAGE_CHANNELS`: For creating the #emoji-voting channel with the correct permissions.
* `MANAGE_EMOJIS`: For adding new emojis.
* `MANAGE_MESSAGES`: For clearing reactions on approved/denied emojis.

## Initialization

Invite Rinon to your server and run the `>init` command. This should set up the #emoji-voting properly. After that, use the `>request` command and you're good to go!

# Contributing

If you see anything on the TODO.md file that interests you and you'd like to help out, please feel free to create a pull request. In the same sense, if you have any ideas, suggestions, or notice things that could be done differently that will improve efficiency, feel free to make an issue or create a pull request.
