'use client';
import React from 'react';
import Conversation from '../components/Conversation';
import Dropdown from '../components/Dropdown';
import { useMedia } from '../components/MediaStore';
import { useState, useRef } from 'react';

export default function App() {
  // from mediastore
  const {
    enableStreams,
    disableStreams,
    mediaStream,
    isReady
  } = useMedia();

  const [isInterviewing, setIsInterviewing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'retell' | 'eleven'>('retell')
  const [selectedLlm, setSelectedLlm] = useState('gpt4ominirt');

  const platformOptions = [
    { value: 'retell', label: 'Retell' },
    { value: 'eleven', label: 'ElevenLabs' },
  ];

  const llmOptions = [
    { value: 'gpt41', label: 'GPT 4.1' },
    { value: 'gpt4ort', label: 'GPT 4o realtime' },
    { value: 'gpt4ominirt', label: 'GPT 4o mini realtime' },
    { value: 'gemini20flash', label: 'Gemini 2.0 flash' },
    { value: 'claude37sonnet', label: 'Claude 3.7 Sonnet' },
    { value: 'claude35haiku', label: 'Claude 3.5 Haiku' },
    { value: 'claudesonnet4', label: 'Claude Sonnet 4 (11labs only)' },
  ];

  // lets page control actions inside conversation
  const conversationRef = useRef<{ end: () => void }>(null);

  const handleStart = async () => {
    const stream = await requestMicAccess();
    if (stream) {
      setIsInterviewing(true);
    }
  };

  const handleEnd = () => {
    // access wtv current ref points to, calls end() if it exists
    // and the call is routed to whichever actual function exposed by useImperativeHandle in Conversation?
    conversationRef.current?.end();
    setIsInterviewing(false);
    disableStreams();
  };

  const [micAllowed, setMicAllowed] = useState(false);
  const requestMicAccess = async (): Promise<MediaStream | null> => {
    try {
      const stream = await enableStreams();
      if (stream) {
        setMicAllowed(true);
        return stream;
      }
      return null;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      return null;
    }
  };

  //   // Check if the API is available
  //   if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  //     throw new Error("MediaDevices API or getUserMedia not supported in this browser.");
  //   }

  //   const astream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  //   console.log("Microphone access granted", stream);
  //   setMicAllowed(true);
  //   return stream;
  // } catch (error) {
  //   console.error("Error accessing microphone:", error);
  //   return null;
  // }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-8">
      <img src="/avatar.PNG" alt="jokebear" className="w-50 h-50 mb-5" />

      {/* model selection & start interview */}
      <Dropdown
        label="Select Platform: "
        id="model-select"
        value={selectedModel}
        onChange={(value) => setSelectedModel(value as 'retell' | 'eleven')}
        options={platformOptions}
      />

      <Dropdown
        label="Select LLM: "
        id="llm-select"
        value={selectedLlm}
        onChange={(value) => setSelectedLlm(value)}
        options={llmOptions}
      />

      {/* start interview button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleStart}
          disabled={isInterviewing}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-white ${isInterviewing ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
            }`}
        >
          {isInterviewing ? (
            <>
              <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
              Interview in Progress...
            </>
          ) : (
            'Start Interview'
          )}
        </button>
      </div>

      {isInterviewing && (
        <div className="w-full max-w-2xl items-center justify-center">

          {!micAllowed ? (
            <>
              <div className="mb-4 text-gray-700">
                This interview requires microphone access. Please allow access to continue.
              </div>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full"
                onClick={handleStart}
              >
                Allow Microphone and Video Access
              </button>
            </>
          ) : (
            <>
              <Conversation
                ref={conversationRef} // what is this
                isInterviewing={isInterviewing}
                llmChoice={selectedLlm}
                onEnd={handleEnd}
                mediaStream={mediaStream}
              />
              {!isInterviewing && (
                <div className="text-center text-gray-500">Session ended</div>
              )}
              {/* <button
                onClick={handleEnd}
                className="mt-6 bg-red-400 hover:bg-red-500 text-white px-4 py-2 rounded-full"
              >
                End interview.
              </button> */}
            </>
          )}
        </div>
      )}
    </div>
  );
}