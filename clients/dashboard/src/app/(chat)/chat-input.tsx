"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/buttons/button";
import { cn } from "@/utils/cn";
import { 
  ArrowUp,
  BoxAdd,
  Microphone
} from "iconsax-reactjs";

interface ChatFormData {
  message: string;
}

interface ChatInputProps {
  onSubmit: (data: ChatFormData) => Promise<void>;
  isLoading?: boolean;
  className?: string;
  size?: "large" | "compact";
}

export function ChatInput({ onSubmit, isLoading = false, className, size = "large" }: ChatInputProps) {
  const { register, handleSubmit, reset, watch } = useForm<ChatFormData>({
    defaultValues: {
      message: "",
    },
  });

  const messageValue = watch("message");
  const hasMessage = messageValue?.trim().length > 0;

  const handleFormSubmit = async (data: ChatFormData) => {
    if (!data.message.trim()) return;
    await onSubmit(data);
    reset();
  };

  const handleAttachment = () => {
    console.log("Handle attachment");
  };

  const isCompact = size === "compact";
  const isLarge = size === "large";

  return (
    <div className={cn(
      isCompact && "px-6 py-4",
      isLarge && "w-full max-w-4xl mx-auto space-y-12",
      className
    )}>
      {/* Title - only show for large */}
      {isLarge && (
        <div className="text-center">
          <h1 className="text-5xl font-semibold text-gray-900 mb-4">
            What insights do you need?
          </h1>
        </div>
      )}

      {/* Container for compact size */}
      <div className={cn(isCompact && "w-full max-w-4xl mx-auto")}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="relative">
          <div className={cn(
            "relative bg-white rounded-2xl border border-gray-200 focus-within:border-gray-300 transition-all",
            isCompact && "p-3 rounded-full",
            isLarge && "p-4"
          )}>
            <div className={cn(
              "flex gap-3",
              isCompact && "items-center",
              isLarge && "items-start"
            )}>
              {/* Left side button for compact */}
              {isCompact && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={handleAttachment}
                  className="flex-shrink-0 p-1.5"
                >
                  <BoxAdd size={16} />
                </Button>
              )}

              {/* Input field */}
              <div className="flex-1">
                {isLarge ? (
                  <textarea
                    {...register("message")}
                    placeholder="Ask anything"
                    className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-sm leading-relaxed resize-none min-h-[60px] max-h-[200px]"
                    autoComplete="off"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(handleFormSubmit)();
                      }
                    }}
                  />
                ) : (
                  <input
                    {...register("message")}
                    placeholder="Ask anything"
                    className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-sm py-1"
                    autoComplete="off"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(handleFormSubmit)();
                      }
                    }}
                  />
                )}

                {/* Bottom row for large size */}
                {isLarge && (
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAttachment}
                        className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 rounded-full"
                      >
                        <BoxAdd size={16} />
                      </Button>
                    </div>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={!hasMessage || isLoading}
                    >
                      <ArrowUp size={18} />
                    </Button>
                  </div>
                )}
              </div>

              {/* Right side buttons for compact */}
              {isCompact && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={handleAttachment}
                  >
                    <Microphone size={16} />
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    size="xs"
                  >
                    <ArrowUp size={16} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
