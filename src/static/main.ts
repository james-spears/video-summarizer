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
        console.log('change');
        Array.from<File>(
          (this.$refs.input as HTMLInputElement).files || []
        ).forEach((file) => this.videos.push({ file, summary: "" }));
      };
    },
    drop(event: DragEvent, el: HTMLElement) {
      // console.log("File(s) dropped");
      el.classList.remove('!text-gray-500');
      el.classList.remove('!border-gray-500');
      el.classList.add('border-brand-500');
      // Prevent default behavior (Prevent file from being opened)
      event.preventDefault();
    
      if (event.dataTransfer?.items) {
        // Use DataTransferItemList interface to access the file(s)
        [...event.dataTransfer.items].forEach((item) => {
          // If dropped items aren't files, reject them
          if (item.kind === "file") {
            const file = item.getAsFile();
            this.videos.push({ file, summary: "" });
          }
        });
      } else if(event.dataTransfer?.files) {
        // Use DataTransfer interface to access the file(s)
        [...event.dataTransfer.files].forEach((file) => {
          this.videos.push({ file, summary: "" });
        });
      }
    },
    dragover(event: DragEvent, el: HTMLElement) {
      // console.log("File(s) in drop zone");
      el.classList.add('!text-gray-500');
      el.classList.add('!border-gray-500');
    
      // Prevent default behavior (Prevent file from being opened)
      event.preventDefault();
    },
    dragleave(event: DragEvent, el: HTMLElement) {
      // console.log("File(s) nolonger in drop zone");
      el.classList.remove('!text-gray-500');
      el.classList.remove('!border-gray-500');
      // Prevent default behavior (Prevent file from being opened)
      event.preventDefault();
    },
    submitForm() {
      this.summary = [];
      const openaiClient = openai(this.key);
      const process = async (video: { file: File, summary: string; loading: boolean; transcription: string; }) => {
        video.loading = true;
        const convertedAudioDataObj = await videoToAudio(video.file);
        if (convertedAudioDataObj) {
          const file = new File([convertedAudioDataObj.data], "output.mpeg");
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
