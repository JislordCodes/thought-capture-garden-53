
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
  
  // Format duration to MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  useEffect(() => {
    // Clean up when component unmounts
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && status.isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [status.isRecording]);
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // Only process if there's actual content
        if (audioBlob.size > 0) {
          setStatus(prev => ({ ...prev, isProcessing: true }));
          try {
            const result = await transcribeAudio(audioBlob);
            onTranscriptionComplete(result);
            toast.success("Thoughts captured successfully!");
          } catch (error) {
            console.error("Error processing recording:", error);
            toast.error("Failed to process your recording. Please try again.");
          } finally {
            setStatus(prev => ({ ...prev, isProcessing: false }));
          }
        }
        
        // Clean up media tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      
      // Start timer
      setStatus({
        isRecording: true,
        isPaused: false,
        duration: 0,
        isProcessing: false
      });
      
      timerRef.current = window.setInterval(() => {
        setStatus(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
      
      toast.success("Recording started. Capture your thoughts!");
      
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
        <div className="text-sm font-medium animate-fade-in">
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
            ? "bg-red-500 hover:bg-red-600 text-white animate-pulse-recording" 
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
    </div>
  );
};

export default RecordButton;
