"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Loader2,
  Mic,
  MicOff,
  Send,
  ShieldCheck,
  Sparkles,
  Volume2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOmaAssistantResponse, type OmaAssistantResponse } from "@/lib/oma-assistant";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  response?: OmaAssistantResponse;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort?: () => void;
  onresult:
    | ((event: {
        resultIndex: number;
        results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>;
      }) => void)
    | null;
  onend: (() => void) | null;
  onerror: ((event: { error?: string; message?: string }) => void) | null;
};

const starterPrompts = [
  "Sync my Outlook Inbox to Kit every Friday.",
  "Export all new contacts as CSV and skip duplicates.",
  "Why did yesterday's sync fail?",
  "Create a weekly backup report.",
];

const welcomeResponse: OmaAssistantResponse = {
  title: "OM - Assist",
  message:
    "I am ready to help with syncs, exports, automations, reports, and troubleshooting. I will ask before any action that moves, exports, deletes, or schedules personal data.",
  checklist: [
    "Describe the workflow in plain language.",
    "I will identify missing details.",
    "Use the linked workspace when you are ready to act.",
  ],
  needsConfirmation: false,
  missingFields: [],
  actionLinks: [
    { label: "Email Sync", href: "/settings" },
    { label: "Automation", href: "/automation" },
    { label: "Exports", href: "/export" },
  ],
};

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;

  const speechWindow = window as Window &
    typeof globalThis & {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };

  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

async function requestMicrophoneAccess() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("This browser does not support microphone permission requests.");
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  stream.getTracks().forEach((track) => track.stop());
}

function ResponsePanel({ response }: { response: OmaAssistantResponse }) {
  return (
    <div className="mt-4 space-y-4 rounded-2xl border border-border bg-background/70 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="bg-primary/12 text-primary">{response.title}</Badge>
        {response.needsConfirmation ? (
          <Badge className="bg-amber-500/12 text-amber-700 dark:text-amber-300">Confirmation required</Badge>
        ) : null}
      </div>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {response.checklist.map((item) => (
          <li className="flex gap-2" key={item}>
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {response.missingFields.length ? (
        <div className="flex gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Missing: {response.missingFields.join(", ")}.</span>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {response.actionLinks.map((link) => (
          <Button asChild key={`${link.href}-${link.label}`} size="sm" variant="outline">
            <Link href={link.href as "/"}>
              {link.label}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}

export function OmaAssistantWorkspace({ mode = "page" }: { mode?: "page" | "panel" }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: welcomeResponse.message,
      response: welcomeResponse,
    },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("Voice input is ready when your browser allows microphone access.");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const finalTranscriptRef = useRef("");

  const latestResponse = useMemo(
    () => [...messages].reverse().find((message) => message.response)?.response ?? welcomeResponse,
    [messages],
  );

  useEffect(() => {
    const supported = Boolean(getSpeechRecognition()) && window.isSecureContext;
    setSpeechSupported(supported);
    setVoiceStatus(
      supported
        ? "Voice input is ready. Click the microphone and allow browser microphone access."
        : "Voice input needs Chrome or Edge on HTTPS or localhost. Typed commands still work.",
    );
  }, []);

  useEffect(() => {
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  function sendMessage(value = input) {
    const content = value.trim();
    if (!content) return;

    const response = getOmaAssistantResponse(content);
    setMessages((current) => [
      ...current,
      { id: createMessageId(), role: "user", content },
      {
        id: createMessageId(),
        role: "assistant",
        content: response.message,
        response,
      },
    ]);
    setInput("");
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
    setVoiceStatus("Voice input stopped.");
  }

  async function toggleListening() {
    if (!window.isSecureContext) {
      setSpeechSupported(false);
      setVoiceStatus("Microphone permission requires HTTPS or localhost. Open OMAZYNC on https:// or http://localhost:3000.");
      return;
    }

    if (listening) {
      stopListening();
      return;
    }

    try {
      setVoiceStatus("Requesting microphone permission...");
      await requestMicrophoneAccess();
    } catch (error) {
      setListening(false);
      if (error instanceof DOMException) {
        const messageByName: Record<string, string> = {
          NotAllowedError: "Microphone permission was blocked. Click the browser lock icon, allow microphone access, then try again.",
          NotFoundError: "No microphone was found. Connect or enable a microphone, then try again.",
          NotReadableError: "The microphone is already in use by another app or browser tab.",
          SecurityError: "The browser blocked microphone access. Use HTTPS or localhost and allow microphone permission.",
        };

        setVoiceStatus(messageByName[error.name] ?? error.message);
        return;
      }

      setVoiceStatus(error instanceof Error ? error.message : "Unable to request microphone permission.");
      return;
    }

    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setVoiceStatus("Microphone permission is allowed, but speech recognition is not available in this browser. Use Chrome or Edge for OM - Assist voice input.");
      return;
    }

    const recognition = new SpeechRecognition();
    finalTranscriptRef.current = "";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      let interimTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0].transcript.trim();

        if (result.isFinal) {
          finalTranscriptRef.current = `${finalTranscriptRef.current} ${transcript}`.trim();
        } else {
          interimTranscript = `${interimTranscript} ${transcript}`.trim();
        }
      }

      const visibleTranscript = [finalTranscriptRef.current, interimTranscript].filter(Boolean).join(" ");
      setInput(visibleTranscript);
      setVoiceStatus(interimTranscript ? "Listening... keep speaking." : "Voice captured. Processing...");
    };
    recognition.onend = () => {
      setListening(false);

      const finalTranscript = finalTranscriptRef.current.trim();
      if (finalTranscript) {
        setVoiceStatus("Voice command captured.");
        sendMessage(finalTranscript);
        finalTranscriptRef.current = "";
        return;
      }

      setVoiceStatus("I did not hear a command. Try again and speak after the browser mic prompt.");
    };
    recognition.onerror = (event) => {
      setListening(false);
      const error = event.error ?? "unknown";
      const messageByError: Record<string, string> = {
        "not-allowed": "Microphone permission was blocked. Allow microphone access in the browser and try again.",
        "service-not-allowed": "The browser blocked speech recognition. Use Chrome or Edge on HTTPS or localhost.",
        "audio-capture": "No microphone was detected. Check your input device and browser permissions.",
        network: "Speech recognition could not reach the browser speech service. Check the connection and try again.",
        "no-speech": "I did not hear speech. Try again and speak clearly after clicking the mic.",
        aborted: "Voice input was stopped.",
      };

      setVoiceStatus(messageByError[error] ?? event.message ?? "Voice input stopped unexpectedly.");
    };
    recognitionRef.current = recognition;

    try {
      setListening(true);
      setVoiceStatus("Listening... speak your OM - Assist command now.");
      recognition.start();
    } catch (error) {
      setListening(false);
      setVoiceStatus(error instanceof Error ? error.message : "Unable to start voice input.");
    }
  }

  const isPanel = mode === "panel";

  return (
    <div className={cn(isPanel ? "h-full" : "grid min-h-[calc(100vh-7rem)] gap-5 xl:grid-cols-[minmax(0,1fr)_360px]")}>
      <section
        className={cn(
          "flex flex-col overflow-hidden border border-border bg-card/86 shadow-sm",
          isPanel ? "h-full rounded-none border-0" : "min-h-[680px] rounded-3xl",
        )}
      >
        <div className="flex flex-wrap items-center gap-4 border-b border-border p-5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Bot className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight">OM - Assist</h1>
            <p className="text-sm text-muted-foreground">Voice and workflow assistant for OMAZYNC</p>
          </div>
          <Badge className="bg-emerald-500/12 text-emerald-700 dark:text-emerald-300">
            Safety checks on
          </Badge>
        </div>

        <div ref={transcriptRef} className="dashboard-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
          {messages.map((message) => (
            <div
              className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
              key={message.id}
            >
              <div
                className={cn(
                  "max-w-3xl rounded-3xl px-5 py-4 text-sm leading-6 shadow-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background/80 text-foreground",
                )}
              >
                <p>{message.content}</p>
                {message.response ? <ResponsePanel response={message.response} /> : null}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            {starterPrompts.map((prompt) => (
              <button
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
                key={prompt}
                onClick={() => sendMessage(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <Button
              size="sm"
              title={speechSupported ? "Voice input" : "Check voice input support"}
              type="button"
              variant={listening ? "default" : "outline"}
              onClick={toggleListening}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <input
              className="h-11 min-w-0 flex-1 rounded-full border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
              placeholder="Ask OM - Assist to sync, export, report, automate, or troubleshoot..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
            <Button type="submit">
              <Send className="h-4 w-4" />
              Send
            </Button>
          </form>
          {listening ? (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {voiceStatus}
            </div>
          ) : (
            <div className="mt-3 text-xs text-muted-foreground">{voiceStatus}</div>
          )}
        </div>
      </section>

      {isPanel ? null : (
      <aside className="space-y-5">
        <section className="rounded-3xl border border-border bg-card/86 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold">Operating Rules</h2>
          </div>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <p>OM - Assist will not expose passwords, tokens, OAuth secrets, private emails, or other users' data.</p>
            <p>Exports, destructive changes, external syncs, and recurring automations require confirmation.</p>
            <p>When a tool is unavailable, OM - Assist explains the limitation and sends you to the correct workspace.</p>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card/86 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold">Current Guidance</h2>
          </div>
          <div className="mt-4 rounded-2xl border border-border bg-background/70 p-4">
            <div className="text-sm font-semibold">{latestResponse.title}</div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{latestResponse.message}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card/86 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Volume2 className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold">Voice Status</h2>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            {speechSupported
              ? "Voice input is available. OM - Assist will capture the final spoken command and submit it for the same safe workflow checks."
              : "Voice input needs Chrome or Edge on HTTPS or localhost. Typed commands are available in every browser."}
          </p>
        </section>
      </aside>
      )}
    </div>
  );
}
