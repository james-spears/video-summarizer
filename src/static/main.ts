import Alpine from "alpinejs";

declare global {
  interface Window {
    Alpine: typeof Alpine;
    FFmpeg: any;
  }
}

// const elm = document.getElementById('uploader');
// elm?.addEventListener('change', transcode);

// const cancel = () => {
//   try {
//     ffmpeg.exit();
//   } catch (e) {}
//   ffmpeg = null;
// };

const { createFFmpeg, fetchFile } = window.FFmpeg;
let ffmpeg: any = null;

window.Alpine = Alpine;

document.addEventListener("alpine:init", () => {
  Alpine.data("demo", () => ({
    show: false,
    file: "",
    key: "",
    message: "",
    summary: "",
    initDemo($nextTick: (fn: () => void) => void) {
      $nextTick(() => {
        this.show = true;
      });
      this.$refs.input.onchange = () => {
        this.file = (this.$refs.input as HTMLInputElement).files?.[0];
      };
    },
    async transcode() {
      const that = this;
      if (ffmpeg === null) {
        ffmpeg = createFFmpeg({ log: true });
      }
      const { name } = this.file;
      this.message = "Loading ffmpeg-core.js";
      if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
      }
      ffmpeg.FS("writeFile", name, await fetchFile(this.file));
      this.message = "Start transcoding";
      await ffmpeg.run("-i", name, "output.mp3");
      this.message = "Complete transcoding";
      const data = ffmpeg.FS("readFile", "output.mp3");

      // const video = document.getElementById('output-video');
      const blob = new Blob([data.buffer], { type: "audio/mpeg" });
      // (<HTMLVideoElement>video).src = URL.createObjectURL(blob);
      const file = new File([blob], "output.mp3");

      console.log("data", data);
      this.message = "Transcribing audio";

      async function transcribe(file: File) {
        const formData = new FormData();

        formData.append("model", "whisper-1");
        formData.append("file", file);

        const response = await fetch(
          "https://api.openai.com/v1/audio/transcriptions",
          {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${that.key}`,
            },
          }
        );
        return response.json();
      }

      const transcription = await transcribe(file);

      async function summarize(text: string) {
        const prompt = `Summarize the key points in this video transcript:
      
          ${text}
          `;

        const response = await fetch("https://api.openai.com/v1/completions", {
          method: "POST",
          body: JSON.stringify({
            model: "text-davinci-003",
            prompt,
            temperature: 1,
            max_tokens: 100,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${that.key}`,
          },
        });
        return response.json();
      }

      this.message = "Summarizing Text";
      const summary = await summarize(transcription.text);
      this.message = "";
      this.summary = "Summary: " + summary.choices[0].text;
    },
    submitForm() {
      console.log("file", typeof this.file);
      console.log("key", this.key);
      this.summary = "";
      this.transcode();
    },
  }));
});

Alpine.start();

const adder = (a: number, b: number) => a + b;

export default adder;
