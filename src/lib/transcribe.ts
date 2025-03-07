
import { pipeline } from "@huggingface/transformers";
import { TranscriptionResult } from "@/types";
import { toast } from "@/hooks/use-sonner";

// Initialize models
let transcriber: any = null;
let textProcessor: any = null;

async function initModels() {
  if (!transcriber) {
    toast.loading("Loading transcription model...");
    try {
      // Try WebGPU first, fallback to CPU
      try {
        transcriber = await pipeline(
          "automatic-speech-recognition",
          "onnx-community/whisper-tiny.en",
          { device: "webgpu" }
        );
      } catch (error) {
        console.log("WebGPU not available, falling back to CPU", error);
        transcriber = await pipeline(
          "automatic-speech-recognition",
          "onnx-community/whisper-tiny.en"
        );
      }
    } catch (error) {
      console.error("Failed to initialize transcription model:", error);
      throw new Error("Failed to initialize transcription model");
    }
  }
  
  if (!textProcessor) {
    toast.loading("Loading text analysis model...");
    try {
      // Try WebGPU first, fallback to CPU
      try {
        textProcessor = await pipeline(
          "text-generation",
          "onnx-community/gpt2-medium",
          { device: "webgpu" }
        );
      } catch (error) {
        console.log("WebGPU not available, falling back to CPU", error);
        textProcessor = await pipeline(
          "text-generation",
          "onnx-community/gpt2-medium"
        );
      }
    } catch (error) {
      console.error("Failed to initialize text processing model:", error);
      throw new Error("Failed to initialize text processing model");
    }
  }
}

export async function transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
  try {
    await initModels();
    toast.loading("Transcribing your thoughts...");
    
    // Convert blob to array buffer for better compatibility
    const arrayBuffer = await audioBlob.arrayBuffer();
    
    // Transcribe audio
    const transcription = await transcriber({ data: arrayBuffer });
    const text = transcription.text;
    
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
    throw new Error("Failed to process transcription");
  }
}
