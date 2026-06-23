export type Sender = "user" | "ai";

export interface Message {
  sender: Sender;
  text: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
}