
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
      // Request audio access with optimal configuration for translation
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        }
      });
      
      // Store stream reference for cleanup
      micStreamRef.current = stream;
      
      // Check support for preferred codec
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
      
      // Create media recorder with high-quality settings
      const options = { 
        mimeType, 
        audioBitsPerSecond: 128000
      };
      
      const mediaRecorder = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        try {
          if (audioChunksRef.current.length === 0) {
            toast.error("No audio recorded. Please try again.");
            return;
          }
          
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          
          if (audioBlob.size === 0) {
            toast.error("Empty recording detected. Please try again.");
            return;
          }
          
          if (audioBlob.size < 1000) {
            toast.error("Recording too short. Please try speaking louder or longer.");
            return;
          }
          
          // Log blob info for debugging
          console.log("Audio blob info:", {
            size: audioBlob.size,
            type: audioBlob.type,
            chunks: audioChunksRef.current.length
          });
          
          setStatus(prev => ({ ...prev, isProcessing: true }));
          
          const result = await transcribeAudio(audioBlob);
          onTranscriptionComplete(result);
        } catch (error) {
          console.error("Error processing recording:", error);
          toast.error(error instanceof Error ? error.message : "Failed to process recording. Please try again.");
        } finally {
          setStatus(prev => ({ ...prev, isProcessing: false }));
          // Release microphone access
          if (micStreamRef.current) {
            micStreamRef.current.getTracks().forEach(track => track.stop());
            micStreamRef.current = null;
          }
        }
      };
      
      // Start recording with smaller timeslice for more consistent chunks
      mediaRecorder.start(100); // Collect data more frequently
      
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
      mediaRecorderRef.current.stop();
      
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      
      setStatus(prev => ({ ...prev, isRecording: false }));
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
