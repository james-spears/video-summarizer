import openai from "@/utils/openai";
import { Video, transcode } from '@/utils/video-to-audio';
import Alpine from "alpinejs";

window.Alpine = Alpine;

document.addEventListener("alpine:init", () => {
  Alpine.data("demo", () => ({
    show: false,
    videos: [],
    key: "",
    submitted: false,
    initDemo($nextTick: (fn: () => void) => void) {
      $nextTick(() => {
        this.show = true;
      });
      this.$refs.input.onchange = async () => {
        console.log("change");
        Array.from<File>(
          (this.$refs.input as HTMLInputElement).files || []
        ).forEach((file) =>
          this.videos.push({
            input: file,
            output: null,
            summary: "",
            loading: false,
            progress: "",
            transcript: "",
          })
        );
      };
    },
    drop(event: DragEvent, el: HTMLElement) {
      // console.log("File(s) dropped");
      el.classList.remove("!text-gray-500");
      el.classList.remove("!border-gray-500");
      el.classList.add("border-brand-500");
      // Prevent default behavior (Prevent file from being opened)
      event.preventDefault();

      if (event.dataTransfer?.items) {
        // Use DataTransferItemList interface to access the file(s)
        [...event.dataTransfer.items].forEach((item) => {
          // If dropped items aren't files, reject them
          if (item.kind === "file") {
            const file = item.getAsFile();
            this.videos.push({
              input: file,
              output: null,
              summary: "",
              loading: false,
              progress: "",
              transcript: "",
            });
          }
        });
      } else if (event.dataTransfer?.files) {
        // Use DataTransfer interface to access the file(s)
        [...event.dataTransfer.files].forEach((file) => {
          this.videos.push({
            input: file,
            output: null,
            summary: "",
            loading: false,
            progress: "",
            transcript: "",
          });
        });
      }
    },
    dragover(event: DragEvent, el: HTMLElement) {
      // console.log("File(s) in drop zone");
      el.classList.add("!text-gray-500");
      el.classList.add("!border-gray-500");

      // Prevent default behavior (Prevent file from being opened)
      event.preventDefault();
    },
    dragleave(event: DragEvent, el: HTMLElement) {
      // console.log("File(s) nolonger in drop zone");
      el.classList.remove("!text-gray-500");
      el.classList.remove("!border-gray-500");
      // Prevent default behavior (Prevent file from being opened)
      event.preventDefault();
    },
    async submitForm() {
      this.submited = true;
      const openaiClient = openai(this.key);
      const analyze = async (video: Video) => {
        video.progress = "Transcribing";
        const transcription = await openaiClient.transcribe(video.output);
        video.transcription = transcription.text;
        video.progress = "Summarizing";
        const summary = await openaiClient.summarize(transcription.text);
        video.summary = summary.choices[0].text;
        video.loading = false;
        video.progress = "Complete";
      };
      for (let video of Array.from<Video>(this.videos)) {
        video = await transcode(video);
        analyze(video);
      }
      this.submitted = false;
    },
  }));
});

Alpine.start();
