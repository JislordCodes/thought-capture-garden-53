
import { TranscriptionResult } from "@/types";
import { toast } from "@/hooks/use-sonner";

// Function to transcribe audio using OpenAI's API through a Supabase Edge Function
export async function transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
  try {
    // Convert audio blob to base64
    const reader = new FileReader();
    const audioBase64Promise = new Promise<string>((resolve) => {
      reader.onloadend = () => {
        // Extract the base64 data part from the result
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
    });
    
    reader.readAsDataURL(audioBlob);
    const audioBase64 = await audioBase64Promise;
    
    // Show processing toast
    toast.loading("Transcribing your thoughts...");
    
    // Call the Supabase Edge Function for transcription
    const response = await fetch('/api/transcribe-audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ audio: audioBase64 }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to transcribe audio');
    }
    
    const result = await response.json();
    toast.dismiss();
    toast.success("Transcription complete!");
    
    return result;
  } catch (error) {
    console.error("Transcription error:", error);
    toast.dismiss();
    toast.error("Failed to transcribe audio. Please try again.");
    throw new Error("Failed to transcribe audio");
  }
}

// Process transcription using OpenAI to extract insights
export async function processTranscription(text: string): Promise<Omit<TranscriptionResult, 'text'>> {
  try {
    toast.loading("Analyzing your thoughts...");
    
    // Call the Supabase Edge Function for processing
    const response = await fetch('/api/process-transcription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process transcription');
    }
    
    const result = await response.json();
    toast.dismiss();
    toast.success("Analysis complete!");
    
    return {
      title: result.title,
      summary: result.summary,
      categories: result.categories,
      keywords: result.keywords,
      actionItems: result.actionItems,
    };
  } catch (error) {
    console.error("Processing error:", error);
    toast.dismiss();
    toast.error("Failed to analyze transcription. Please try again.");
    throw new Error("Failed to process transcription");
  }
}
