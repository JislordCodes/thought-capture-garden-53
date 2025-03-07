
import { pipeline } from "@huggingface/transformers";
import { TranscriptionResult } from "@/types";
import { toast } from "@/hooks/use-sonner";

// Initialize models
let transcriber: any = null;
let textProcessor: any = null;

async function initModels() {
  if (!transcriber) {
    toast.loading("Loading transcription model...");
    transcriber = await pipeline(
      "automatic-speech-recognition",
      "onnx-community/whisper-tiny.en",
      { device: "webgpu" }
    );
  }
  
  if (!textProcessor) {
    toast.loading("Loading text analysis model...");
    textProcessor = await pipeline(
      "text-generation",
      "onnx-community/gpt2-medium",
      { device: "webgpu" }
    );
  }
}

export async function transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
  try {
    await initModels();
    toast.loading("Transcribing your thoughts...");
    
    // Convert blob to URL for the model
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Transcribe audio
    const transcription = await transcriber(audioUrl);
    const text = transcription.text;
    
    // Process the transcription
    const result = await processTranscription(text);
    
    URL.revokeObjectURL(audioUrl);
    toast.dismiss();
    toast.success("Transcription complete!");
    
    return {
      text,
      ...result
    };
  } catch (error) {
    console.error("Transcription error:", error);
    toast.dismiss();
    toast.error("Failed to transcribe audio. Please try again.");
    throw new Error("Failed to transcribe audio");
  }
}

export async function processTranscription(text: string): Promise<Omit<TranscriptionResult, 'text'>> {
  try {
    toast.loading("Analyzing your thoughts...");
    
    // Generate a structured analysis prompt
    const prompt = `Analyze this text:
    "${text}"
    
    Title: 
    Summary: 
    Categories: 
    Keywords: 
    Action Items:`;
    
    const response = await textProcessor(prompt, {
      max_new_tokens: 200,
      temperature: 0.5,
    });
    
    // Parse the generated response
    const output = response[0].generated_text.split('\n').filter(Boolean);
    
    // Extract components (basic parsing, could be improved)
    const result = {
      title: output[1]?.replace('Title:', '').trim() || 'Untitled Note',
      summary: output[2]?.replace('Summary:', '').trim() || 'No summary available',
      categories: output[3]?.replace('Categories:', '').split(',').map(s => s.trim()) || [],
      keywords: output[4]?.replace('Keywords:', '').split(',').map(s => s.trim()) || [],
      actionItems: output[5]?.replace('Action Items:', '').split(',').map(s => s.trim()) || [],
    };
    
    toast.dismiss();
    toast.success("Analysis complete!");
    
    return result;
  } catch (error) {
    console.error("Processing error:", error);
    toast.dismiss();
    toast.error("Failed to analyze transcription. Please try again.");
    throw new Error("Failed to process transcription");
  }
}
