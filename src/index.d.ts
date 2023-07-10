import type Alpine from "alpinejs";

export type Logger = ({ message, type }: { message: string; type: string }) => void;
export type Progress = ({ ratio }: { ratio: number }) => void;

export interface FFmpegOptions {
  corePath?: string;
  log?: boolean;
  logger?: Logger;
  progress?: Progress;
}

export type FSOp = 'writeFile' | 'readFile'

export type FFmpeg = {
  load: () => Promise<void>;
  run: (args: string, inputFile: string, outputFile: string) => Promise<void>;
  FS: (op: FSOp, name: string, data?: Uint8Array) => Uint8Array;
  exit: () => Promise<void>;
  setLogger: (logger: Logger) => void;
  setLogging: (logging: boolean) => void;
  setProgress: (progress: Progress) => void;
  isLoaded: () => boolean;
}

export type FFmpegModule = {
  createFFmpeg: (opts: FFmpegOptions) => FFmpeg;
  fetchFile: (file: File) => Promise<Uint8Array>;
};

declare global {
  interface Window {
    Alpine: typeof Alpine;
    FFmpeg: FFmpegModule;
    webkitAudioContext: unknown;
  }
}
