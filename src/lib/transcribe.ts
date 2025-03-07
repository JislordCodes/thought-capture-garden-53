
import { pipeline } from "@huggingface/transformers";
import { TranscriptionResult } from "@/types";
import { toast } from "@/hooks/use-sonner";

// Initialize models
let transcriber: any = null;
let textProcessor: any = null;

async function initModels() {
  if (!transcriber) {
    try {
      toast.loading("Loading transcription model...");
      transcriber = await pipeline(
        "automatic-speech-recognition",
        "onnx-community/whisper-tiny.en"
      );
    } catch (error) {
      console.error("Failed to initialize transcription model:", error);
      toast.error("Could not load transcription model. Please check your connection.");
      throw new Error("Failed to initialize transcription model");
    }
  }
  
  if (!textProcessor) {
    try {
      toast.loading("Loading text analysis model...");
      textProcessor = await pipeline(
        "text-generation",
        "onnx-community/gpt2-medium"
      );
    } catch (error) {
      console.error("Failed to initialize text processing model:", error);
      toast.error("Could not load text processing model. Please check your connection.");
      throw new Error("Failed to initialize text processing model");
    }
  }
}

export async function transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
  try {
    await initModels();
    toast.loading("Transcribing your thoughts...");
    
    // Convert audio blob to array buffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    
    // Create float32 array from array buffer
    const audioData = new Float32Array(arrayBuffer);
    
    // Transcribe audio
    const transcription = await transcriber({
      data: audioData,
      sampling_rate: 16000 // Standard sampling rate for Whisper
    });
    
    if (!transcription || !transcription.text) {
      throw new Error("No transcription result");
    }
    
    const text = transcription.text.trim();
    
    if (!text) {
      throw new Error("Empty transcription result");
    }
    
    // Process the transcription
    const result = await processTranscription(text);
    
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
    throw error;
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
      do_sample: false
    });
    
    // Parse the generated response
    const output = response[0].generated_text.split('\n').filter(Boolean);
    
    // Extract components (improved parsing)
    const titleLine = output.find(line => line.includes('Title:'));
    const summaryLine = output.find(line => line.includes('Summary:'));
    const categoriesLine = output.find(line => line.includes('Categories:'));
    const keywordsLine = output.find(line => line.includes('Keywords:'));
    const actionItemsLine = output.find(line => line.includes('Action Items:'));
    
    const title = titleLine ? titleLine.replace('Title:', '').trim() : 'Untitled Note';
    const summary = summaryLine ? summaryLine.replace('Summary:', '').trim() : 'No summary available';
    const categories = categoriesLine ? 
      categoriesLine.replace('Categories:', '').split(',').map(s => s.trim()).filter(Boolean) : 
      [];
    const keywords = keywordsLine ? 
      keywordsLine.replace('Keywords:', '').split(',').map(s => s.trim()).filter(Boolean) : 
      [];
    const actionItems = actionItemsLine ? 
      actionItemsLine.replace('Action Items:', '').split(',').map(s => s.trim()).filter(Boolean) : 
      [];
    
    const result = {
      title,
      summary,
      categories,
      keywords,
      actionItems,
    };
    
    toast.dismiss();
    toast.success("Analysis complete!");
    
    return result;
  } catch (error) {
    console.error("Processing error:", error);
    toast.dismiss();
    toast.error("Failed to analyze transcription. Please try again.");
    throw error;
  }
}

