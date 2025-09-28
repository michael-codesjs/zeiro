"use client";

import { ChatInterface } from "./(chat)/chat-interface";

export default function Chat() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <ChatInterface className="flex-1" />
    </div>
  );
}
