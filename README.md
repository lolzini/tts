# tts

A CLI tool to create audios from text with Azure Speech Synth

## Add your config

Create a new `.env` file with the keys `KEY` and `REGION` according to your Azure Speech Services config.

Change the `dotenv.config()` path to the route of the `.env` file.

Change the `OUTPUT_PATH` to the route of your desired output folder.

To use globally you can run `npm i -g` inside the root folder. You should be able to run `tss` and use the prompts to generate a new audio.

You can use the arg `es` or `en` to choose the audio language.
