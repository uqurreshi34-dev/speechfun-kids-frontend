// components/SpeechButton.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Mic } from "lucide-react";

interface SpeechButtonProps {
    expectedText: string;
    onResult: (isCorrect: boolean, transcript: string) => void;
}

// TypeScript interfaces for Web Speech API
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onend: (() => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

export default function SpeechButton({ expectedText, onResult }: SpeechButtonProps) {
    const [listening, setListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const lastTranscriptRef = useRef("");

    // Initialize speech recognition once on mount
    useEffect(() => {
        if (typeof window === "undefined") return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-GB";

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcriptText = event.results[0][0].transcript;
            lastTranscriptRef.current = transcriptText;
        };

        recognition.onend = () => {
            setListening(false);

            // Process result after recognition ends
            if (lastTranscriptRef.current) {
                const cleanedTranscript = lastTranscriptRef.current.toLowerCase().trim();
                const cleanedExpected = expectedText.toLowerCase().trim();
                const isCorrect = cleanedTranscript.includes(cleanedExpected);

                onResult(isCorrect, lastTranscriptRef.current);
                lastTranscriptRef.current = "";
            }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error("Speech recognition error:", event.error);
            setListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.onresult = null;
                recognitionRef.current.onend = null;
                recognitionRef.current.onerror = null;
            }
        };
    }, [expectedText, onResult]);

    const startListening = () => {
        if (typeof window === "undefined") return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support speech recognition. Try Chrome.");
            return;
        }

        if (recognitionRef.current && !listening) {
            lastTranscriptRef.current = "";
            setListening(true);
            try {
                recognitionRef.current.start();
            } catch (error) {
                console.error("Error starting recognition:", error);
                setListening(false);
            }
        }
    };

    // Server-side: render nothing to avoid hydration mismatch
    if (typeof window === "undefined") {
        return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        return <p className="text-red-500">Speech recognition not supported in this browser.</p>;
    }
    {/* <button
  onClick={handleSpeech}
  disabled={isListening}
  className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 sm:px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
>
  {isListening ? (
    <>
      <div className="animate-pulse">🎤</div>
      Listening...
    </>
  ) : (
    <>
      <Volume2 size={20} />
      Say It!
    </>
  )}
</button> */}
    return (
        <button
            onClick={startListening}
            disabled={listening}
            className={`flex items-center justify-center gap-2 bg-linear-to-r from-green-500 to-teal-500 text-white px-4 sm:px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition disabled:opacity-50 w-full sm:w-auto ${listening ? "bg-red-500" : "bg-green-500 hover:bg-green-600"
                }`}
        >
            <Mic size={20} />
            {listening ? "Listening..." : "Say It!"}
        </button>
    );
}
