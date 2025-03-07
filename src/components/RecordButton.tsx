
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-sonner';
import { cn } from '@/lib/utils';
import { RecordingStatus } from '@/types';
import { transcribeAudio } from '@/lib/transcribe';

interface RecordButtonProps {
  onTranscriptionComplete: (result: any) => void;
}

const RecordButton: React.FC<RecordButtonProps> = ({ 
  onTranscriptionComplete 
}) => {
  const [status, setStatus] = useState<RecordingStatus>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    isProcessing: false
  });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && status.isRecording) {
        mediaRecorderRef.current.stop();
      }
      // Ensure microphone is released when component unmounts
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [status.isRecording]);
  
  const startRecording = async () => {
    try {
      // Reset audio chunks at the start of recording
      audioChunksRef.current = [];
      
      // Request audio access with optimal configuration for translation
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      console.log("Microphone access granted");
      
      // Store stream reference for cleanup
      micStreamRef.current = stream;
      
      // Check support for preferred codec
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/ogg';
      
      console.log("Using MIME type:", mimeType);
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      console.log("MediaRecorder created with options:", { mimeType });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        console.log("Data available event triggered, size:", event.data.size);
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log("Audio chunk added, total chunks:", audioChunksRef.current.length);
        }
      };
      
      mediaRecorder.onstop = async () => {
        try {
          console.log("Recording stopped, processing audio...");
          
          if (audioChunksRef.current.length === 0) {
            console.error("No audio chunks recorded");
            toast.error("No audio recorded. Please try again.");
            setStatus(prev => ({ ...prev, isProcessing: false, isRecording: false }));
            return;
          }
          
          console.log("Total audio chunks:", audioChunksRef.current.length);
          console.log("Audio chunk sizes:", audioChunksRef.current.map(chunk => chunk.size));
          
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          
          console.log("Created audio blob:", {
            size: audioBlob.size,
            type: audioBlob.type
          });
          
          if (audioBlob.size === 0) {
            console.error("Empty audio blob created");
            toast.error("Empty recording detected. Please try again.");
            setStatus(prev => ({ ...prev, isProcessing: false, isRecording: false }));
            return;
          }
          
          setStatus(prev => ({ ...prev, isProcessing: true, isRecording: false }));
          
          try {
            console.log("Sending audio for transcription...");
            const result = await transcribeAudio(audioBlob);
            console.log("Transcription complete:", result);
            onTranscriptionComplete(result);
          } catch (error) {
            console.error("Error in transcription process:", error);
            toast.error("Failed to process recording. Please try again.");
          } finally {
            setStatus(prev => ({ ...prev, isProcessing: false }));
            // Release microphone access
            if (micStreamRef.current) {
              micStreamRef.current.getTracks().forEach(track => track.stop());
              micStreamRef.current = null;
            }
          }
        } catch (error) {
          console.error("Error processing recording:", error);
          toast.error("Failed to process recording. Please try again.");
          setStatus(prev => ({ ...prev, isProcessing: false, isRecording: false }));
        }
      };
      
      // Start recording with a timeslice to get data during recording
      mediaRecorder.start(1000); // Collect data every second
      
      setStatus({
        isRecording: true,
        isPaused: false,
        duration: 0,
        isProcessing: false
      });
      
      timerRef.current = window.setInterval(() => {
        setStatus(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
      
      toast.success("Recording started. Speak clearly and a bit louder than normal.");
      
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Unable to access microphone. Please check permissions and try again.");
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && status.isRecording) {
      console.log("Stopping recording...");
      mediaRecorderRef.current.stop();
      
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {status.isRecording && (
        <div className="text-sm font-medium animate-pulse">
          {formatDuration(status.duration)}
        </div>
      )}
      
      <button
        onClick={status.isRecording ? stopRecording : startRecording}
        disabled={status.isProcessing}
        className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
          "focus:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2",
          status.isRecording 
            ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
            : "glass-button text-primary hover:text-primary-foreground hover:bg-primary"
        )}
        aria-label={status.isRecording ? "Stop recording" : "Start recording"}
      >
        {status.isProcessing ? (
          <Loader2 size={28} className="animate-spin" />
        ) : status.isRecording ? (
          <Square size={28} />
        ) : (
          <Mic size={28} />
        )}
      </button>
      
      <p className="text-sm text-muted-foreground animate-fade-in">
        {status.isProcessing 
          ? "Processing your thoughts..." 
          : status.isRecording 
            ? "Tap to stop recording" 
            : "Tap to start recording"}
      </p>
      {status.isRecording && (
        <div className="text-xs text-muted-foreground max-w-[200px] text-center">
          Speak clearly and at a normal pace for best results
        </div>
      )}
    </div>
  );
};

export default RecordButton;
