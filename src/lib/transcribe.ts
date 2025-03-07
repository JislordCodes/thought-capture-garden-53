
import { TranscriptionResult } from "@/types";
import { toast } from "@/hooks/use-sonner";

// Store the Groq API key
const GROQ_API_KEY = "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";
const GROQ_API_URL = "https://api.groq.com/openai/v1";

export async function transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
  try {
    toast.loading("Transcribing your thoughts...");
    
    // Convert the audio blob to base64
    const base64Audio = await blobToBase64(audioBlob);
    
    // Call Groq API for transcription
    const transcription = await fetchTranscription(base64Audio);
    
    if (!transcription) {
      throw new Error("No transcription result");
    }
    
    const text = transcription.trim();
    
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

// Convert blob to base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Extract the base64 data (remove the data URL prefix)
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Fetch transcription from Groq API
async function fetchTranscription(base64Audio: string): Promise<string> {
  try {
    // Create FormData for the audio file
    const formData = new FormData();
    
    // Convert base64 back to blob for sending
    const byteCharacters = atob(base64Audio);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'audio/webm' });
    
    // Add the file to FormData
    formData.append('file', blob, 'recording.webm');
    formData.append('model', 'whisper-1');
    
    // Call the Groq API
    const response = await fetch(`${GROQ_API_URL}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API error:', errorData);
      throw new Error('Failed to transcribe audio with Groq API');
    }
    
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Error in transcription:", error);
    throw error;
  }
}

export async function processTranscription(text: string): Promise<Omit<TranscriptionResult, 'text'>> {
  try {
    toast.loading("Analyzing your thoughts...");
    
    // Generate a structured analysis prompt
    const prompt = `Analyze this text:
    "${text}"
    
    Provide a structured analysis with the following components:
    1. A concise title (max 5 words)
    2. A one-paragraph summary of the main ideas (max 150 words)
    3. 3-5 categories that best describe the content
    4. 5-8 keywords or key insights from the text
    5. 3-5 actionable items or next steps based on the content
    
    Return your response in the following format:
    Title: [title]
    Summary: [summary]
    Categories: [category1], [category2], [category3]
    Keywords: [keyword1], [keyword2], [keyword3], [keyword4], [keyword5]
    Action Items: [action1], [action2], [action3]`;
    
    // Call Groq API for text analysis
    const response = await fetch(`${GROQ_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that analyzes spoken thoughts and ideas, extracting meaningful insights and action items.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 800
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API error:', errorData);
      throw new Error('Failed to analyze transcription with Groq API');
    }
    
    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    // Parse the response
    const lines = analysisText.split('\n').filter(Boolean);
    
    // Extract components (improved parsing)
    const titleLine = lines.find(line => line.includes('Title:'));
    const summaryLine = lines.find(line => line.includes('Summary:'));
    const categoriesLine = lines.find(line => line.includes('Categories:'));
    const keywordsLine = lines.find(line => line.includes('Keywords:'));
    const actionItemsLine = lines.find(line => line.includes('Action Items:'));
    
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
