export interface OCRResult {
  fullName?: string
  fatherName?: string
  cnicNumber?: string
  dob?: string
  rawText: string
  confidence?: number
}

// OCR.space API Key - Load from environment variable for security
// Set VITE_OCR_SPACE_API_KEY in your .env file
const OCR_SPACE_API_KEY = import.meta.env.VITE_OCR_SPACE_API_KEY || ''

// OpenAI API Key - Load from environment variable for security
// Set VITE_OPENAI_API_KEY in your .env file
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || ''

// Check if API keys are configured
if (!OCR_SPACE_API_KEY && import.meta.env.PROD) {
  console.warn('OCR.space API key not configured. OCR extraction may fail.')
}
if (!OPENAI_API_KEY && import.meta.env.PROD) {
  console.warn('OpenAI API key not configured. OCR extraction may fail.')
}

/**
 * Convert base64 image to Blob for OCR.space API
 */
const base64ToBlob = (base64: string): Blob => {
  // Remove data URL prefix if present
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64
  
  // Convert base64 to binary
  const byteCharacters = atob(base64Data)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  
  // Determine MIME type from base64 string
  let mimeType = 'image/png'
  if (base64.includes('data:image/jpeg')) mimeType = 'image/jpeg'
  if (base64.includes('data:image/jpg')) mimeType = 'image/jpeg'
  if (base64.includes('data:image/png')) mimeType = 'image/png'
  
  return new Blob([byteArray], { type: mimeType })
}

/**
 * Extract text from an image using OCR.space API
 * @param imageData - Base64 image data or image URL
 * @returns Extracted text and parsed fields
 */
export const extractTextFromImage = async (imageData: string): Promise<OCRResult> => {
  try {
    if (!OCR_SPACE_API_KEY || OCR_SPACE_API_KEY.trim() === '') {
      throw new Error('OCR.space API key is not configured. Please set VITE_OCR_SPACE_API_KEY in your .env file.')
    }

    console.log('Starting OCR with OCR.space API...')
    
    // Convert base64 to Blob for FormData
    const imageBlob = base64ToBlob(imageData)
    
    // Create FormData
    const formData = new FormData()
    formData.append('file', imageBlob, 'image.png')
    formData.append('language', 'eng') // English
    formData.append('isOverlayRequired', 'false')
    formData.append('detectOrientation', 'true')
    formData.append('scale', 'true')
    formData.append('OCREngine', '2') // OCR Engine 2 for better accuracy

    // Send request to OCR.space API
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': OCR_SPACE_API_KEY,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OCR.space API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    
    // Check if OCR was successful
    if (result.OCRExitCode !== 1 && result.OCRExitCode !== 2) {
      throw new Error(`OCR.space API returned error code: ${result.OCRExitCode}`)
    }

    // Extract text from all parsed results
    let finalText = ''
    let confidence = 0
    
    if (result.ParsedResults && result.ParsedResults.length > 0) {
      // Combine all parsed text
      finalText = result.ParsedResults
        .map((parsed: any) => parsed.ParsedText || '')
        .join('\n')
        .trim()
      
      // Calculate average confidence if available
      const confidences = result.ParsedResults
        .map((parsed: any) => parsed.TextOverlay?.MeanConfidence || 0)
        .filter((conf: number) => conf > 0)
      
      if (confidences.length > 0) {
        confidence = confidences.reduce((a: number, b: number) => a + b, 0) / confidences.length
      } else {
        // Default confidence if not provided (OCR.space doesn't always provide it)
        confidence = 80
      }
    }

    // Also check TextOverlay for additional text
    if (result.ParsedResults && result.ParsedResults.length > 0) {
      const textOverlay = result.ParsedResults[0].TextOverlay
      if (textOverlay && textOverlay.Lines) {
        const overlayText = textOverlay.Lines
          .map((line: any) => line.LineText || '')
          .join('\n')
          .trim()
        
        // Use overlay text if parsed text is empty or combine them
        if (!finalText || finalText.length < 10) {
          finalText = overlayText || finalText
        }
      }
    }

    if (!finalText || finalText.trim().length === 0) {
      throw new Error('No text extracted from image')
    }

    console.log(`OCR.space extraction complete. Text length: ${finalText.length} characters`)
    console.log(`Estimated confidence: ${Math.round(confidence)}%`)

    // Use local parsing directly from OCR.space raw text (OpenAI code commented out)
    console.log('Parsing OCR text locally...')
    const parsed = parseOCRText(finalText)
    console.log('Local parsing successful:', parsed)

    // OpenAI API code commented out - using only OCR.space raw data
    // // Send raw OCR text to OpenAI for intelligent extraction
    // console.log('Sending raw OCR text to OpenAI for extraction...')
    // let parsed: Partial<OCRResult> = {}
    // 
    // try {
    //   parsed = await extractWithOpenAI(finalText)
    //   console.log('OpenAI extraction successful:', parsed)
    // } catch (openAIError) {
    //   console.warn('OpenAI extraction failed, falling back to local parsing:', openAIError)
    //   // Fallback to local parsing if OpenAI fails
    //   parsed = parseOCRText(finalText)
    // }

    return {
      ...parsed,
      rawText: finalText,
      confidence: Math.round(confidence),
    }
  } catch (error) {
    console.error('OCR Error:', error)
    throw new Error(`Failed to extract text from image: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Extract structured data from OCR text using OpenAI API
 * Sends raw text to ChatGPT for intelligent parsing
 * 
 * COMMENTED OUT: Using only OCR.space raw data with local parsing instead
 */
/*
const extractWithOpenAI = async (rawText: string): Promise<Partial<OCRResult>> => {
  if (!OPENAI_API_KEY || OPENAI_API_KEY.trim() === '') {
    throw new Error('OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your .env file.')
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using gpt-4o-mini for faster and cheaper responses
        messages: [
          {
            role: 'system',
            content: `You are an expert at extracting information from Pakistani National Identity Card (CNIC) OCR text. 
Extract the following information from the raw OCR text:
1. First Name (Full Name) - The person's complete name, usually after "Name" label
2. Father Name - The father's name that appears after "Father Name" label, or after S/O (Son Of), D/O (Daughter Of)
3. CNIC Number - Pakistani CNIC in format XXXXX-XXXXXXX-X (13 digits total), usually after "Identity Number" label

IMPORTANT: Look for these specific patterns:
- "Name" followed by the person's name on the next line
- "Father Name" followed by the father's name on the next line (common pattern)
- Or "S/O" or "D/O" followed by the father's name
- "Identity Number" followed by the CNIC number

Return ONLY a valid JSON object with these exact keys: fullName, fatherName, cnicNumber
If any field is not found, set it to null.
Format CNIC number as XXXXX-XXXXXXX-X (with dashes).
Format names in Title Case (e.g., "Muhammad Ali Khan" not "MUHAMMAD ALI KHAN").`
          },
          {
            role: 'user',
            content: `Extract the First Name, Father Name, and CNIC Number from this OCR text:\n\n${rawText}`
          }
        ],
        temperature: 0.1, // Low temperature for consistent extraction
        response_format: { type: 'json_object' }
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    
    if (!content) {
      throw new Error('No content in OpenAI response')
    }

    // Parse JSON response
    const extracted = JSON.parse(content)
    
    // Validate and format the extracted data
    const result: Partial<OCRResult> = {}
    
    // Handle fullName (First Name)
    if (extracted.fullName !== null && extracted.fullName !== undefined && typeof extracted.fullName === 'string' && extracted.fullName.trim()) {
      result.fullName = extracted.fullName.trim()
    }
    
    // Handle fatherName
    if (extracted.fatherName !== null && extracted.fatherName !== undefined && typeof extracted.fatherName === 'string' && extracted.fatherName.trim()) {
      result.fatherName = extracted.fatherName.trim()
    }
    
    // Handle cnicNumber
    if (extracted.cnicNumber !== null && extracted.cnicNumber !== undefined && typeof extracted.cnicNumber === 'string' && extracted.cnicNumber.trim()) {
      // Normalize CNIC format
      let cnic = extracted.cnicNumber.trim().replace(/\s+/g, '')
      // Ensure proper format: XXXXX-XXXXXXX-X
      if (/^\d{13}$/.test(cnic)) {
        cnic = `${cnic.substring(0, 5)}-${cnic.substring(5, 12)}-${cnic.substring(12, 13)}`
        result.cnicNumber = cnic
      } else if (/^\d{5}-\d{7}-\d{1}$/.test(cnic)) {
        // Already in correct format
        result.cnicNumber = cnic
      } else {
        // Try to fix format
        const digits = cnic.replace(/\D/g, '')
        if (digits.length === 13) {
          result.cnicNumber = `${digits.substring(0, 5)}-${digits.substring(5, 12)}-${digits.substring(12, 13)}`
        }
      }
    }

    console.log('OpenAI extracted data:', result)
    return result
  } catch (error) {
    console.error('OpenAI extraction error:', error)
    throw error
  }
}
*/

/**
 * Parse OCR text to extract structured data (Fallback method)
 * Looks for CNIC patterns and name patterns (optimized for Pakistani ID cards)
 */
const parseOCRText = (text: string): Partial<OCRResult> => {
  const result: Partial<OCRResult> = {}
  
  // Log raw text for debugging
  console.log('Raw OCR text:', text)
  
  // Store original text (preserve newlines for pattern matching)
  const originalText = text
  
  // Normalize text: replace multiple spaces, but preserve newlines for now
  let cleanText = text
    .replace(/[ \t]+/g, ' ') // Multiple spaces/tabs to single (but keep newlines)
    .trim()

  // Only fix common OCR errors in name context (not in numbers)
  // Don't replace globally - this was corrupting names

  // Extract CNIC - Most important, try multiple patterns (use original text)
  // Pattern 1: Standard format with dashes (34104-7441992-1)
  const cnicPattern1 = /\b(\d{5}[-]\d{7}[-]\d{1})\b/g
  let cnicMatch = originalText.match(cnicPattern1)
  if (cnicMatch && cnicMatch[0]) {
    result.cnicNumber = cnicMatch[0]
    console.log('CNIC found (pattern 1):', result.cnicNumber)
  }

  // Pattern 2: With spaces (34104 7441992 1)
  if (!result.cnicNumber) {
    const cnicPattern2 = /\b(\d{5}\s+\d{7}\s+\d{1})\b/g
    cnicMatch = originalText.match(cnicPattern2)
    if (cnicMatch && cnicMatch[0]) {
      result.cnicNumber = cnicMatch[0].replace(/\s+/g, '-')
      console.log('CNIC found (pattern 2):', result.cnicNumber)
    }
  }

  // Pattern 3: No separators (3410474419921)
  if (!result.cnicNumber) {
    const cnicPattern3 = /\b(\d{5}\d{7}\d{1})\b/g
    cnicMatch = originalText.match(cnicPattern3)
    if (cnicMatch && cnicMatch[0]) {
      const cnic = cnicMatch[0]
      if (cnic.length === 13) {
        result.cnicNumber = `${cnic.substring(0, 5)}-${cnic.substring(5, 12)}-${cnic.substring(12, 13)}`
        console.log('CNIC found (pattern 3):', result.cnicNumber)
      }
    }
  }

  // Pattern 4: Mixed separators (e.g., 34104 7441992-1)
  if (!result.cnicNumber) {
    const cnicPattern4 = /\b(\d{5}[-\s]?\d{7}[-\s]?\d{1})\b/g
    cnicMatch = originalText.match(cnicPattern4)
    if (cnicMatch && cnicMatch[0]) {
      result.cnicNumber = cnicMatch[0].replace(/\s+/g, '').replace(/(\d{5})(\d{7})(\d{1})/, '$1-$2-$3')
      console.log('CNIC found (pattern 4):', result.cnicNumber)
    }
  }

  // Extract Name - Simple: Find "Name" label and get only the first line after it
  // OCR.space API returns structured data, so we can rely on the format
  const nameMatch = text.match(/(?:^|\n)\s*Name\s*\n+\s*([^\n]+)/i)
  if (nameMatch && nameMatch[1]) {
    // Verify this is NOT "Father Name" by checking what comes before
    const matchIndex = nameMatch.index !== undefined ? nameMatch.index : text.indexOf(nameMatch[0])
    const textBeforeMatch = text.substring(Math.max(0, matchIndex - 10), matchIndex).toLowerCase()
    
    if (!textBeforeMatch.includes('father')) {
      let name = nameMatch[1].trim()
      // Take only the first line (in case there are multiple lines)
      name = name.split('\n')[0].trim()
      // Remove trailing punctuation
      name = name.replace(/[:\.,;]+$/, '').trim()
      
      // Simple validation: at least 2 words, reasonable length
      const nameParts = name.split(/\s+/).filter(part => part.length > 1)
      if (nameParts.length >= 2 && nameParts.length <= 5 && name.length > 4 && name.length < 50) {
        // Capitalize properly - Title Case
        result.fullName = nameParts.map(part => {
          if (part === part.toUpperCase() && part.length > 2) {
            return part.charAt(0) + part.slice(1).toLowerCase()
          }
          return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        }).join(' ')
        console.log('Extracted name:', result.fullName)
      }
    }
  }



  // Extract Father's Name - Simple: Find "Father Name" label and get the text on the very next line
  // OCR.space API returns structured data, so we can rely on the format
  const fatherNameMatch = text.match(/(?:^|\n)\s*Father\s+Name\s*\n+\s*([^\n]+)/i)
  if (fatherNameMatch && fatherNameMatch[1]) {
    let fatherName = fatherNameMatch[1].trim()
    // Clean up the name - remove any trailing labels or numbers, take only first line
    fatherName = fatherName.split('\n')[0].trim()
    fatherName = fatherName.replace(/[:\.,;]+$/, '').trim()
    
    // Simple validation: at least 2 words, reasonable length
    const nameParts = fatherName.split(/\s+/).filter(part => part.length > 1)
    if (nameParts.length >= 2 && nameParts.length <= 5 && fatherName.length > 5 && fatherName !== result.fullName) {
      // Capitalize properly - Title Case
      result.fatherName = nameParts.map(part => {
        if (part === part.toUpperCase() && part.length > 2) {
          return part.charAt(0) + part.slice(1).toLowerCase()
        }
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      }).join(' ')
      console.log('Extracted father name:', result.fatherName)
    }
  }

  // Extract Date of Birth
  const dobPatterns = [
    /(?:DOB|Date of Birth|تاریخ پیدائش|Birth|DATE OF BIRTH)[\s:]+(\d{2}[-\/]\d{2}[-\/]\d{4})/i,
    /(?:DOB|Date of Birth|تاریخ پیدائش|Birth)[\s:]+(\d{4}[-\/]\d{2}[-\/]\d{2})/i,
    /\b(\d{2}[-\/]\d{2}[-\/]\d{4})\b/,
    /\b(\d{4}[-\/]\d{2}[-\/]\d{2})\b/,
  ]

  for (const pattern of dobPatterns) {
    const match = cleanText.match(pattern)
    if (match && match[1]) {
      result.dob = match[1]
      break
    }
  }

  console.log('Parsed OCR result:', result)
  return result
}

