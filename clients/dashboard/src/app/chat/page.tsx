"use client";

import { ChatInterface } from "../(chat)/chat-interface";

export default function ChatPage() {
  return (
    <div className="w-full h-full flex flex-col">
      <ChatInterface className="h-full" />
    </div>
  );
}
