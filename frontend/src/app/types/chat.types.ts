export type Sender = "user" | "ai";

export interface Message {
  sender: Sender;
  text: string;
  sources?: {
    title: string;
    text?: string;
  }[];
  confidence?: number;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
}


// speechRecognition.types
export interface SpeechRecognitionAlternative {
  transcript: string;
}

export interface SpeechRecognitionResult {
  0: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionResultList {
  0: SpeechRecognitionResult;
}

export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

export interface SpeechRecognition {
  lang: string;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start(): void;
}

export interface SpeechRecognitionConstructor {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export {};