
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

serve(async (req) => {
  try {
    // Check for API key
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Parse request
    const { text } = await req.json()
    
    if (!text) {
      return new Response(
        JSON.stringify({ error: 'No text provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Prepare prompt for OpenAI
    const prompt = `
      Analyze the following text which is a transcription of someone speaking about their thoughts, ideas, and goals:
      
      """
      ${text}
      """
      
      Provide a structured analysis with the following components:
      1. A concise title (max 5 words)
      2. A one-paragraph summary of the main ideas (max 150 words)
      3. 3-5 categories that best describe the content
      4. 5-8 keywords or key insights from the text
      5. 3-5 actionable items or next steps based on the content
      
      Return ONLY a JSON object with the following structure:
      {
        "title": "string",
        "summary": "string",
        "categories": ["string", "string", ...],
        "keywords": ["string", "string", ...],
        "actionItems": ["string", "string", ...]
      }
    `

    // Call OpenAI API for processing
    const openAIResponse = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
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
        response_format: { type: 'json_object' }
      })
    })
    
    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json()
      console.error('OpenAI API error:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to process text with OpenAI' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    const completionResponse = await openAIResponse.json()
    const analysisResult = JSON.parse(completionResponse.choices[0].message.content)
    
    return new Response(
      JSON.stringify(analysisResult),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
