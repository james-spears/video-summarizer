import openai from "@/utils/openai";
import videoToAudio from "@/utils/video-to-audio";
import Alpine from "alpinejs";
window.Alpine = Alpine;

document.addEventListener("alpine:init", () => {
  Alpine.data("demo", () => ({
    show: false,
    videos: [],
    key: "",
    message: "",
    initDemo($nextTick: (fn: () => void) => void) {
      $nextTick(() => {
        this.show = true;
      });
      this.$refs.input.onchange = async () => {
        Array.from<File>(
          (this.$refs.input as HTMLInputElement).files || []
        ).forEach((file) => this.videos.push({ file, summary: "" }));
      };
    },
    submitForm() {
      this.summary = [];
      const openaiClient = openai(this.key);
      const process = async (video: { file: File, summary: string; loading: boolean; transcription: string; }) => {
        video.loading = true;
        const convertedAudioDataObj = await videoToAudio(video.file, "mp3");
        if (convertedAudioDataObj) {
          const file = new File([convertedAudioDataObj.data], "output.mp3");
          const transcription = await openaiClient.transcribe(file);
          video.transcription = transcription.text;
          const summary = await openaiClient.summarize(transcription.text);
          video.summary = summary.choices[0].text;
          video.loading = false;
        }
      }
      Array.from<{ file: File, summary: string; loading: boolean; transcription: string; }>(this.videos).forEach(video => process(video));
    },
  }));
});

Alpine.start();
