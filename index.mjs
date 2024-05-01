#! /usr/bin/env node
import dotenv from "dotenv";
import { existsSync, mkdirSync } from "fs";
import sdk from "microsoft-cognitiveservices-speech-sdk";
import { exec } from "child_process";
import readline from "readline";
import path from "path";

// ------ CONFIG
dotenv.config({ path: "YOUR_ENV_FILE_PATH" });
const OUTPUT_PATH = "YOUR_OUTPUT_FOLDER_PATH";

checkOrCreateOutputFolder();

const filePath = path.join(OUTPUT_PATH, `${dateToFilename()}.wav`);

const VOICES = {
  es: "es-MX-YagoNeural",
  en: "en-US-RyanMultilingualNeural",
};

const DEFAULT_VOICE = "es";

const args = process.argv.slice(2);

const voice =
  args?.[0] && VOICES[args[0]] ? VOICES[args[0]] : VOICES[DEFAULT_VOICE];

// ------ SPEECH SYNTH

// Create speech service config
const speechConfig = sdk.SpeechConfig.fromSubscription(
  process.env.KEY,
  process.env.REGION
);
// Select voice
speechConfig.speechSynthesisVoiceName = voice;
// Select output format
speechConfig.speechSynthesisOutputFormat =
  sdk.SpeechSynthesisOutputFormat.Riff48Khz16BitMonoPcm;
// Select output path
const audioConfig = sdk.AudioConfig.fromAudioFileOutput(filePath);

// Create synth
var synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

const onSynth = (result) => {
  if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
    console.log("Synthesis finished.");
    afterSynth();
  } else {
    console.error(
      "Speech synthesis canceled, " +
        result.errorDetails +
        "\nDid you set the speech resource key and region values?"
    );
  }
  synthesizer.close();
  synthesizer = null;
};

const onError = (err) => {
  console.trace("err - " + err);
  synthesizer.close();
  synthesizer = null;
};

// ------ READLINE INPUT

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(
  `${voice} >> Enter some text that you want to speak >\n> `,
  (text) => {
    rl.close();
    synthesizer.speakTextAsync(text, onSynth, onError);
    console.log("Now synthesizing to: " + filePath);
  }
);

// ------ HELPERS

function checkOrCreateOutputFolder() {
  if (!existsSync(OUTPUT_PATH)) {
    mkdirSync(OUTPUT_PATH);
  }
}

function afterSynth() {
  exec(`start ${OUTPUT_PATH}`);
}

function dateToFilename() {
  return new Date().toISOString().replace(/T/gi, "_").replace(/:/gi, "-");
}
