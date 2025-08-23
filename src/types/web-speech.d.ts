// Minimal Web Speech API type declarations for browsers that implement it
// This avoids importing external @types packages and satisfies TS compiler.

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionResultItem {
  transcript: string;
  confidence: number;
}
interface SpeechRecognitionResult {
  0: SpeechRecognitionResultItem;
  isFinal: boolean;
  length: number;
}
interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface Window {
  webkitSpeechRecognition?: { new(): SpeechRecognition };
  SpeechRecognition?: { new(): SpeechRecognition };
}
