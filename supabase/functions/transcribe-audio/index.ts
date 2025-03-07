
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const OPENAI_API_URL = 'https://api.openai.com/v1/audio/transcriptions'

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
    const { audio } = await req.json()
    
    if (!audio) {
      return new Response(
        JSON.stringify({ error: 'No audio data provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Convert base64 to blob
    const binaryData = atob(audio)
    const bytes = new Uint8Array(binaryData.length)
    for (let i = 0; i < binaryData.length; i++) {
      bytes[i] = binaryData.charCodeAt(i)
    }
    
    // Create form data for OpenAI API
    const formData = new FormData()
    formData.append('file', new Blob([bytes], { type: 'audio/wav' }), 'recording.wav')
    formData.append('model', 'whisper-1')
    formData.append('response_format', 'json')
    
    // Call OpenAI API for transcription
    const openAIResponse = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: formData
    })
    
    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json()
      console.error('OpenAI API error:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to transcribe audio with OpenAI' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    const transcriptionResult = await openAIResponse.json()
    
    // Call the process-transcription function
    const processResponse = await fetch(
      `${req.url.replace('transcribe-audio', 'process-transcription')}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: transcriptionResult.text }),
      }
    )
    
    if (!processResponse.ok) {
      const errorData = await processResponse.json()
      console.error('Processing error:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to process transcription' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    const processedData = await processResponse.json()
    
    // Combine the transcription with the processed data
    const result = {
      text: transcriptionResult.text,
      ...processedData
    }
    
    return new Response(
      JSON.stringify(result),
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
