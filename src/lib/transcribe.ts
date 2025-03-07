
import { TranscriptionResult } from "@/types";
import { toast } from "@/hooks/use-sonner";

// Store the Groq API key
const GROQ_API_KEY = "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";
const GROQ_API_URL = "https://api.groq.com/openai/v1";

export async function transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
  try {
    // Log the incoming audio blob for debugging
    console.log("Starting transcription for audio blob:", {
      size: audioBlob.size,
      type: audioBlob.type
    });
    
    toast.loading("Transcribing your thoughts...");
    
    // Call Groq API for transcription - sending the raw blob directly
    const transcription = await fetchTranscription(audioBlob);
    
    // Handle empty or very short responses better
    if (!transcription || transcription.trim().length <= 1) {
      console.error("Empty or very short transcription result:", transcription);
      throw new Error("Transcription returned empty or minimal text. Please try recording again with clearer speech.");
    }
    
    // Clean up the transcription text
    const text = cleanTranscriptionText(transcription);
    console.log("Transcription successful:", text);
    
    if (!text) {
      throw new Error("Empty transcription result after cleaning");
    }
    
    // Process the transcription
    const result = await processTranscription(text);
    console.log("Processing successful:", result);
    
    toast.dismiss();
    toast.success("Transcription complete!");
    
    return {
      text,
      ...result
    };
  } catch (error) {
    console.error("Transcription error:", error);
    toast.dismiss();
    toast.error(error instanceof Error ? error.message : "Failed to transcribe audio. Please try again.");
    throw error;
  }
}

// Clean up transcription text for better results
function cleanTranscriptionText(text: string): string {
  // Remove extra whitespace
  let cleaned = text.trim();
  
  // Fix common transcription artifacts
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.replace(/(\w)\.(\w)/g, '$1. $2'); // Add space after periods
  
  // Fix capitalization of sentences
  cleaned = cleaned.replace(/\. ([a-z])/g, (match, letter) => `. ${letter.toUpperCase()}`);
  
  return cleaned;
}

// Fetch transcription from Groq API - simplified to send the raw blob directly
async function fetchTranscription(audioBlob: Blob): Promise<string> {
  try {
    console.log("Audio blob size for API:", audioBlob.size, "bytes", "type:", audioBlob.type);
    
    // Check if blob is too small (likely empty audio)
    if (audioBlob.size < 1000) {
      throw new Error("Audio recording appears to be empty or too short. Please try again.");
    }
    
    // Create FormData for the API request
    const formData = new FormData();
    
    // Add the file to FormData with optimized settings
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', 'whisper-large-v3');
    formData.append('response_format', 'json');
    
    console.log("Sending transcription request to Groq API");
    
    // Call the Groq API using transcriptions endpoint
    const response = await fetch(`${GROQ_API_URL}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: formData
    });
    
    console.log("Got response from Groq API:", {
      status: response.status,
      statusText: response.statusText
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Unknown API error';
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorData.message || response.statusText || 'API error';
        console.error('Groq API error:', errorData);
      } catch (e) {
        console.error('Failed to parse error response:', errorText);
        errorMessage = response.statusText || 'API error';
      }
      
      throw new Error(`Failed to transcribe audio: ${errorMessage}`);
    }
    
    const data = await response.json();
    console.log("Transcription API response:", data);
    
    return data.text || "";
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
    
    // Call Groq API for text analysis with increased temperature for more creative analysis
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
            content: 'You are an AI assistant that analyzes spoken thoughts and ideas, extracting meaningful insights and action items. Be precise and accurate in your analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4, // Slightly lower temperature for more consistent results
        max_tokens: 800
      })
    });
    
    console.log("Analysis API response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API error during analysis:', errorData);
      throw new Error('Failed to analyze transcription with Groq API');
    }
    
    const data = await response.json();
    console.log("Analysis data received:", data);
    
    const analysisText = data.choices[0].message.content;
    console.log("Raw analysis text:", analysisText);
    
    // Parse the response
    const lines = analysisText.split('\n').filter(Boolean);
    
    // Extract components with improved parsing
    const titleLine = lines.find(line => line.includes('Title:'));
    const summaryLine = lines.find(line => line.includes('Summary:'));
    const categoriesLine = lines.find(line => line.includes('Categories:'));
    const keywordsLine = lines.find(line => line.includes('Keywords:'));
    const actionItemsLine = lines.find(line => line.includes('Action Items:'));
    
    const title = titleLine ? titleLine.replace('Title:', '').trim() : 'Untitled Note';
    
    // Handle multi-line summary case
    let summary = '';
    if (summaryLine) {
      const summaryIndex = lines.indexOf(summaryLine);
      summary = summaryLine.replace('Summary:', '').trim();
      
      // Check if next line is not a new section and add it to summary
      if (summaryIndex < lines.length - 1 && 
          !lines[summaryIndex + 1].includes('Categories:') && 
          !lines[summaryIndex + 1].includes('Keywords:') && 
          !lines[summaryIndex + 1].includes('Action Items:')) {
        summary += ' ' + lines[summaryIndex + 1].trim();
      }
    } else {
      summary = 'No summary available';
    }
    
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
    
    console.log("Final analysis result:", result);
    
    toast.dismiss();
    toast.success("Analysis complete!");
    
    return result;
  } catch (error) {
    console.error("Processing error:", error);
    toast.dismiss();
    toast.error(error instanceof Error ? error.message : "Failed to analyze transcription. Please try again.");
    throw error;
  }
}
