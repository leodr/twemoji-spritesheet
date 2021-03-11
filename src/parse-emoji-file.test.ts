import mock from "mock-fs";
import { parseEmojiFile } from "./parse-emoji-file";

afterEach(() => mock.restore());

test("should parse an emoji file correctly", async () => {
  const emojiInput = [{ category: "example-category", emojis: ["1", "2"] }];

  mock({
    "emoji-input-file.json": JSON.stringify(emojiInput),
  });

  const emojiData = await parseEmojiFile("emoji-input-file.json");

  expect(emojiData).toStrictEqual(["1", "2"]);
});

test("should parse an emoji file correctly with descriptions", async () => {
  const emojiInput = [
    {
      category: "example-category",
      emojis: [
        ["1", "description for 1"],
        ["2", "description for 2"],
      ],
    },
  ];

  mock({
    "emoji-input-file.json": JSON.stringify(emojiInput),
  });

  const emojiData = await parseEmojiFile("emoji-input-file.json");

  expect(emojiData).toStrictEqual(["1", "2"]);
});

test("should throw for invalid data", async () => {
  const emojiInput = [
    { category: "example-category", emojis: [{ hello: "world" }] },
  ];

  mock({
    "emoji-input-file.json": JSON.stringify(emojiInput),
  });

  const emojiData = parseEmojiFile("emoji-input-file.json");

  await expect(async () => await emojiData).rejects.toBeTruthy();
});
