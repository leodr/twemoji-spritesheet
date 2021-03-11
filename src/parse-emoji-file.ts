import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import * as yup from "yup";

const readFileAsync = promisify(fs.readFile);

export async function parseEmojiFile(relativeInputPath: string) {
  const absPath = path.resolve(relativeInputPath);

  const content = await readFileAsync(absPath, { encoding: "utf-8" });

  const json = JSON.parse(content);

  const validatedEmojiData: EmojiData = await emojiDataSchema.validate(json);

  const emojiList = validatedEmojiData.flatMap((category) =>
    category.emojis.map((data) => (Array.isArray(data) ? data[0] : data))
  );

  return emojiList;
}

const emojiDataSchema = yup
  .array(
    yup.object().shape({
      category: yup.string().required().required(),
      emojis: yup
        .array(
          yup.lazy((value) => {
            switch (typeof value) {
              case "object":
                return yup.array(yup.string().required()).required();
              default:
                return yup.string().required();
            }
          })
        )
        .required(),
    })
  )
  .required();

type EmojiData = yup.Asserts<typeof emojiDataSchema>;
