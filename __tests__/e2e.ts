import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import pkgJson from "../package.json";

const execAsync = promisify(exec);

// Set the timeout to 30 seconds, because our script might take a while.
jest.setTimeout(30000);

test("should create a png file", async () => {
  const binPath = path.resolve(pkgJson.bin["twemoji-spritesheet"]);

  await execAsync(
    `node ${binPath} ./emojis-en-v13.0.json --out-file output.png`,
    { cwd: __dirname }
  );

  const outputPath = path.join(__dirname, "output.png");

  expect(fs.existsSync(outputPath)).toBe(true);

  const outputSizeInBytes = fs.statSync(outputPath).size;

  expect(outputSizeInBytes).toBeGreaterThan(HUNDRED_KB);
});

const HUNDRED_KB = 100 * 1024;
