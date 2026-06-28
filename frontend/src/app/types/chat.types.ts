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