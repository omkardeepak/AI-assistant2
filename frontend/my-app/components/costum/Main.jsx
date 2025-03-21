"use client";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const Main = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { transcript, browserSupportsSpeechRecognition, resetTranscript } =
    useSpeechRecognition();

  useEffect(() => {
    setTextInput(transcript);
  }, [transcript]); // Update textarea with transcript

  if (!browserSupportsSpeechRecognition) {
    return <p>Your browser does not support speech recognition.</p>;
  }

  const toggleRecording = async () => {
    setIsRecording(!isRecording);

    if (!isRecording) {
      // Start listening
      SpeechRecognition.startListening({
        continuous: false,
        language: "en-IN",
      });
    } else {
      // Stop listening and send the query
      SpeechRecognition.stopListening();
      if (transcript.trim()) {
        await sendToBackend(transcript);
      }
    }
  };

  const sendToBackend = async (text) => {
    if (!text.trim()) return; // Prevent empty requests

    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response from backend");
      }

      const data = await response.json();
      if (data.response && data.audio) {
        setTextInput(data.response); // Display the text response in the textarea
        const audio = new Audio(data.audio); // Play the base64 audio
        audio.play();
      } else if (data.error) {
        setTextInput(data.error);
      }
    } catch (error) {
      console.error("Error sending data to backend:", error);
      setTextInput("Sorry, something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full py-16 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Left side with image and button */}
        <div className="md:w-1/3 flex flex-col items-center">
          <div className="relative flex justify-center items-center">
            {/* Sound propagation waves */}
            {isRecording && (
              <div className="absolute inset-0 flex justify-center items-center z-10">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full border border-blue-400"
                    style={{
                      width: `${100 + i * 40}px`,
                      height: `${100 + i * 40}px`,
                    }}
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Image container */}
            <motion.div
              className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg z-20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.1 }}
            >
              <img
                src="/images/zuhi.png"
                alt="Zuhi Assistant"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          <Separator className="w-full my-6" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Button
              onClick={toggleRecording}
              className={`relative flex items-center gap-3 px-12 py-6 text-2xl font-bold text-white rounded-full shadow-lg transition-all duration-300 overflow-hidden border-2 border-transparent 
                ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
            >
              <img
                src="/images/microphone.png"
                alt="Microphone"
                className="w-8 h-8 object-contain z-10"
              />
              <span className="relative z-10">
                {isRecording ? "Stop" : "Start Talking"}
              </span>
            </Button>
          </motion.div>
        </div>

        {/* Right side with textarea */}
        <motion.div
          className="md:w-2/3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="p-8 rounded-xl relative">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Conversation with Zuhi
            </h3>
            <div className="relative">
              <Textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Hello! How can I assist you today?"
                className="min-h-[400px] text-gray-700 bg-white border border-blue-600 rounded-lg p-4 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-300"
              />
              <button
                onClick={() => sendToBackend(textInput)}
                className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send size={24} />
                )}
              </button>
            </div>
            <Separator className="w-full my-6" />
            <div className="mt-6 text-gray-700 text-lg">
              <p>
                Ask Zuhi about admission procedures, required documents,
                deadlines, or any campus-related questions.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Main;
