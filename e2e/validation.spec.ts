import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.route(
    "https://api.openai.com/v1/audio/transcriptions",
    async (route) => {
      const json = {
        text: "Hello, this is a test. It's June 9th or June 10th? July. July 9th. Anyways, it's early July. This is a test video to test the video summary site.",
      };
      await route.fulfill({ json });
    }
  );

  await page.route("https://api.openai.com/v1/completions", async (route) => {
    const json = {
      message: {
        id: "cmpl-7ayFRd8knnW18NHUeCnE60cl7HYcZ",
        object: "text_completion",
        created: 1689045757,
        model: "text-davinci-003",
        choices: [
          {
            text: "\nThis video is a test done in early July to check the functionality of a video summary site.",
            index: 0,
            logprobs: null,
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 60,
          completion_tokens: 20,
          total_tokens: 80,
        },
      },
    };
    await route.fulfill({ json });
  });

  await page.goto("http://localhost:3000/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Video Summarizer/);

  const [fileChooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    page.getByTestId("upload-button").click(),
  ]);

  await fileChooser.setFiles([
    "./e2e/videos/test.mov",
    "./e2e/videos/test.mp4",
    "./e2e/videos/test.webm",
    "./e2e/videos/test.wmv",
  ]);

  await expect(page.getByTestId("video-item-0")).toHaveCount(1);
  await expect(page.getByTestId("video-item-1")).toHaveCount(1);
  await expect(page.getByTestId("video-item-2")).toHaveCount(1);
  await expect(page.getByTestId("video-item-3")).toHaveCount(1);

  await expect(page.getByTestId("video-player-0")).toHaveCount(1);
  await expect(page.getByTestId("video-player-1")).toHaveCount(1);
  await expect(page.getByTestId("video-player-2")).toHaveCount(1);
  await expect(page.getByTestId("video-player-3")).toHaveCount(1);

  await expect(page.getByTestId("video-name-0")).toHaveText("test.mov");
  await expect(page.getByTestId("video-name-1")).toHaveText("test.mp4");
  await expect(page.getByTestId("video-name-2")).toHaveText("test.webm");
  await expect(page.getByTestId("video-name-3")).toHaveText("test.wmv");

  await expect(page.getByTestId("video-description-0")).toHaveText(
    "video/quicktime"
  );
  await expect(page.getByTestId("video-description-1")).toHaveText("video/mp4");
  await expect(page.getByTestId("video-description-2")).toHaveText(
    "video/webm"
  );
  await expect(page.getByTestId("video-description-3")).toHaveText(
    "video/x-ms-wmv"
  );

  await page.getByTestId("openai-api-key").fill("sk-...");

  await Promise.all([
    page.waitForResponse("https://api.openai.com/v1/audio/transcriptions"),
    page.waitForResponse("https://api.openai.com/v1/completions"),
    page.getByTestId("generate-summary").click({ clickCount: 2 }),
  ]);

  // const exp =
  //   "\nThis video is a test done in early July to check the functionality of a video summary site.";

  await expect(page.getByTestId("video-summary-0")).toHaveCount(1);
  await expect(page.getByTestId("video-summary-1")).toHaveCount(1);
  await expect(page.getByTestId("video-summary-2")).toHaveCount(1);
  await expect(page.getByTestId("video-summary-3")).toHaveCount(1);
});
