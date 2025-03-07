
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
    
    // First, validate the audio blob
    if (!audioBlob || audioBlob.size < 100) {
      throw new Error("Empty or too small audio recording. Please try again and speak clearly.");
    }
    
    try {
      // Directly use the audioBlob for transcription
      const transcription = await fetchTranscription(audioBlob);
      
      if (!transcription || transcription.trim().length <= 5) {
        console.error("Empty or very short transcription result:", transcription);
        throw new Error("Couldn't detect speech. Please try again with clearer speech.");
      }
      
      // Clean up the transcription text
      const text = cleanTranscriptionText(transcription);
      console.log("Transcription successful:", text);
      
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
      console.error("Transcription API error:", error);
      throw error;
    }
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

// Fetch transcription from Groq API
async function fetchTranscription(audioBlob: Blob): Promise<string> {
  try {
    console.log("Audio blob details for API:", {
      size: audioBlob.size,
      type: audioBlob.type
    });
    
    // Check if blob is too small (likely empty audio)
    if (audioBlob.size < 100) {
      throw new Error("Audio recording appears to be empty or too short. Please try again.");
    }
    
    // Create FormData for the API request
    const formData = new FormData();
    
    // Add the file to FormData - make sure we're sending a proper file
    formData.append('file', new Blob([audioBlob], { type: audioBlob.type }), 'recording.webm');
    formData.append('model', 'whisper-large-v3'); // Using whisper-large-v3 model
    formData.append('response_format', 'json');
    
    console.log("Sending transcription request to Groq API with model: whisper-large-v3");
    
    // Call the Groq API
    const response = await fetch(`${GROQ_API_URL}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: formData
    });
    
    console.log("Groq API response status:", response.status);
    
    if (!response.ok) {
      let errorMessage = 'Failed to transcribe audio with Groq API';
      
      try {
        const errorData = await response.json();
        console.error('Groq API error:', errorData);
        errorMessage = errorData.error?.message || 'Failed to transcribe audio with Groq API';
      } catch (e) {
        console.error('Failed to parse error response');
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log("Transcription API response:", data);
    
    if (!data.text) {
      throw new Error("No transcription text returned from API");
    }
    
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
            content: 'You are an AI assistant that analyzes spoken thoughts and ideas, extracting meaningful insights and action items. Be precise and accurate in your analysis. ALWAYS include action items in your response.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5, // Slightly higher temperature for more creative results
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
      
    // Improved action items extraction
    let actionItems: string[] = [];
    if (actionItemsLine) {
      const actionItemsIndex = lines.indexOf(actionItemsLine);
      // Check if there are numbered action items in the following lines
      const numberedItems: string[] = [];
      
      // Look for numbered list items after "Action Items:" line
      for (let i = actionItemsIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        // Match numbered list items like "1. Item text" or "1) Item text"
        if (/^\d+[\.\)]/.test(line)) {
          // Remove the number and punctuation
          const item = line.replace(/^\d+[\.\)]\s*/, '').trim();
          if (item) numberedItems.push(item);
        } else if (!line.includes(':') && line.length > 0) {
          // If it's not a new section and not empty, consider it part of action items
          numberedItems.push(line);
        } else if (line.includes(':')) {
          // Stop if we hit a new section
          break;
        }
      }
      
      if (numberedItems.length > 0) {
        // Use the numbered items if found
        actionItems = numberedItems;
      } else {
        // Fall back to comma-separated parsing
        actionItems = actionItemsLine
          .replace('Action Items:', '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
      }
    }
    
    // If we still don't have action items, generate some based on the text
    if (actionItems.length === 0) {
      console.log("No action items found in response, generating default ones");
      
      // Generate at least one default action item based on the content
      if (text.length > 10) {
        const firstSentence = text.split('.')[0];
        if (firstSentence) {
          actionItems.push(`Follow up on "${firstSentence.trim()}"`);
        }
      }
      
      // Add a generic action item
      actionItems.push("Review and expand on these notes");
    }
    
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
