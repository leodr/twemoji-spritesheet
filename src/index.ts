#!/usr/bin/env node

import { createCanvas, loadImage } from "canvas";
import { Command } from "commander";
import * as fs from "fs";
import sizeOf from "image-size";
import fetch from "node-fetch";
import * as path from "path";
import { parse } from "twemoji-parser";
import { parseEmojiFile } from "./parse-emoji-file";

const COLUMN_COUNT = 42;

const program = new Command();

interface Options {
  outFile: string;
}

program
  .name("npx twemoji-spritesheet")
  .arguments("<inputFile>")
  .option(
    "-o --out-file <filename>",
    "the location of the output file, relative to the current working directory",
    "twemoji-spritesheet.png"
  )
  .action(async (inputFile: string, options: Options) => {
    const emojiList = await parseEmojiFile(inputFile);

    const urlList = emojiList.map((emoji: string) => parse(emoji)[0].url);

    const canvas = createCanvas(200, 200);
    const ctx = canvas.getContext("2d");

    const image = await fetch(urlList[0]).then((res) => res.buffer());

    const { width, height } = sizeOf(image);

    if (!width || !height) {
      throw Error("Could not get the emoji image dimensions.");
    }

    const rowCount = Math.ceil(urlList.length / COLUMN_COUNT);

    canvas.width = COLUMN_COUNT * width;
    canvas.height = rowCount * height;

    await Promise.all(
      urlList.map(async (emoji: string, index) => {
        const image = await fetch(emoji).then((res) => res.buffer());

        const canvasImage = await loadImage(image);

        ctx.drawImage(
          canvasImage,
          (index % COLUMN_COUNT) * width,
          Math.floor(index / COLUMN_COUNT) * height
        );
      })
    );

    const outputPath = path.resolve(options.outFile);

    const out = fs.createWriteStream(outputPath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
  });

program.parse(process.argv);
