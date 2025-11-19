import Tesseract from 'tesseract.js'

export interface OCRResult {
  fullName?: string
  fatherName?: string
  cnicNumber?: string
  dob?: string
  rawText: string
  confidence?: number
}

// OpenAI API Key - TODO: Move to environment variable for security
const OPENAI_API_KEY = "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"

/**
 * Preprocess image for better OCR accuracy
 * Enhances contrast, converts to grayscale, uses adaptive thresholding
 */
const preprocessImage = (imageData: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      // Scale up for better OCR (minimum 1200px width)
      const scale = Math.max(1200 / img.width, 1)
      canvas.width = img.width * scale
      canvas.height = img.height * scale

      // Draw original image scaled up
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Get image data for processing
      const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageDataObj.data

      // First pass: Convert to grayscale
      const grayscale: number[] = []
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
        grayscale.push(gray)
      }

      // Second pass: Adaptive thresholding (better than simple threshold)
      // Calculate local average for each pixel
      const windowSize = 15
      for (let i = 0; i < data.length; i += 4) {
        const idx = i / 4
        const row = Math.floor(idx / canvas.width)
        const col = idx % canvas.width

        // Calculate local average
        let sum = 0
        let count = 0
        for (let dy = -Math.floor(windowSize / 2); dy <= Math.floor(windowSize / 2); dy++) {
          for (let dx = -Math.floor(windowSize / 2); dx <= Math.floor(windowSize / 2); dx++) {
            const y = row + dy
            const x = col + dx
            if (y >= 0 && y < canvas.height && x >= 0 && x < canvas.width) {
              const localIdx = y * canvas.width + x
              sum += grayscale[localIdx]
              count++
            }
          }
        }
        const avg = sum / count
        const gray = grayscale[idx]

        // Adaptive threshold: if pixel is darker than local average, make it black, else white
        const threshold = avg * 0.85 // 85% of local average
        const final = gray < threshold ? 0 : 255

        // Enhance contrast slightly
        const contrast = 1.2
        const adjusted = Math.min(255, Math.max(0, ((final / 255 - 0.5) * contrast + 0.5) * 255))

        data[i] = adjusted     // R
        data[i + 1] = adjusted // G
        data[i + 2] = adjusted // B
        // Alpha remains unchanged (data[i + 3])
      }

      // Put processed image data back
      ctx.putImageData(imageDataObj, 0, 0)

      // Convert back to base64
      const processedImageData = canvas.toDataURL('image/png', 1.0) // Use PNG for better quality
      resolve(processedImageData)
    }
    img.onerror = reject
    img.src = imageData
  })
}

/**
 * Extract text from an image using OCR with enhanced preprocessing
 * @param imageData - Base64 image data or image URL
 * @returns Extracted text and parsed fields
 */
export const extractTextFromImage = async (imageData: string): Promise<OCRResult> => {
  try {
    console.log('Starting OCR with image preprocessing...')
    
    // Preprocess image for better OCR accuracy
    const processedImage = await preprocessImage(imageData)
    console.log('Image preprocessing complete')

    // Initialize Tesseract worker with better configuration
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: (m) => {
        // Log progress
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
        }
      },
    })

    // Set OCR parameters for maximum accuracy
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-/: ',
      tessedit_pageseg_mode: 6 as any, // Assume a single uniform block of text
      preserve_interword_spaces: '1',
      tessedit_ocr_engine_mode: '2', // Use LSTM OCR engine for better accuracy
    })

    // Perform OCR on preprocessed image
    const { data: { text, confidence } } = await worker.recognize(processedImage, {
      rectangle: undefined, // Process entire image
    })
    
    console.log(`OCR Confidence: ${confidence}%`)
    
    // Terminate worker
    await worker.terminate()

    // If confidence is low, try again with different PSM mode
    let finalText = text
    let finalConfidence = confidence

    if (confidence < 70) {
      console.log('Low confidence, trying alternative OCR mode...')
      const worker2 = await Tesseract.createWorker('eng', 1, {
        logger: () => {}, // Silent for second attempt
      })

      await worker2.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-/: ',
        tessedit_pageseg_mode: 11 as any, // Sparse text (find as much text as possible in no particular order)
        preserve_interword_spaces: '1',
        tessedit_ocr_engine_mode: '2',
      })

      const { data: { text: text2, confidence: confidence2 } } = await worker2.recognize(processedImage)
      await worker2.terminate()

      // Use the result with higher confidence
      if (confidence2 > confidence) {
        finalText = text2
        finalConfidence = confidence2
        console.log(`Using alternative OCR mode, confidence: ${finalConfidence}%`)
      }
    }

    // Send raw OCR text to OpenAI for intelligent extraction
    console.log('Sending raw OCR text to OpenAI for extraction...')
    let parsed: Partial<OCRResult> = {}
    
    try {
      parsed = await extractWithOpenAI(finalText)
      console.log('OpenAI extraction successful:', parsed)
    } catch (openAIError) {
      console.warn('OpenAI extraction failed, falling back to local parsing:', openAIError)
      // Fallback to local parsing if OpenAI fails
      parsed = parseOCRText(finalText)
    }

    return {
      ...parsed,
      rawText: finalText,
      confidence: finalConfidence,
    }
  } catch (error) {
    console.error('OCR Error:', error)
    throw new Error('Failed to extract text from image')
  }
}

/**
 * Extract structured data from OCR text using OpenAI API
 * Sends raw text to ChatGPT for intelligent parsing
 */
const extractWithOpenAI = async (rawText: string): Promise<Partial<OCRResult>> => {
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
1. First Name (Full Name) - The person's complete name
2. Father Name - The father's name (often appears after S/O, D/O, or "Father" label)
3. CNIC Number - Pakistani CNIC in format XXXXX-XXXXXXX-X (13 digits total)

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

/**
 * Parse OCR text to extract structured data (Fallback method)
 * Looks for CNIC patterns and name patterns (optimized for Pakistani ID cards)
 */
const parseOCRText = (text: string): Partial<OCRResult> => {
  const result: Partial<OCRResult> = {}
  
  // Log raw text for debugging
  console.log('Raw OCR text:', text)
  
  // Normalize text: replace multiple spaces, handle OCR errors (but be careful!)
  let cleanText = text
    .replace(/\s+/g, ' ') // Multiple spaces to single
    .trim()

  // Store original for CNIC extraction (don't corrupt numbers)
  const originalText = cleanText

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

  // Extract Name - Multiple strategies
  const excludedWords = ['CNIC', 'ID', 'CARD', 'PAKISTAN', 'ISLAMIC', 'REPUBLIC', 'NAME', 'نام', 'NIC', 'IDENTITY', 'NATIONAL', 'ISLAMIC REPUBLIC']
  
  // Strategy 1: Look for "Name" label followed by name (Pakistani ID format)
  // Names are typically in uppercase or title case on Pakistani ID cards
  const nameLabelPatterns = [
    // Pattern: "Name" followed by name (could be on same line or next line)
    /Name\s*[:]?\s*([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,3})/i,
    // Pattern: Name at start of line (very common on Pakistani IDs)
    /(?:^|\n)\s*([A-Z]{2,}(?:\s+[A-Z]{2,}){1,3})\s*(?:\n|$|Identity|Father|Gender|Country)/i,
    // Pattern: After "PAKISTAN" or "National Identity Card"
    /(?:PAKISTAN|National Identity Card|ISLAMIC REPUBLIC)[\s\S]{0,100}Name\s*[:]?\s*([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,3})/i,
  ]

  for (const pattern of nameLabelPatterns) {
    const match = cleanText.match(pattern)
    if (match && match[1]) {
      let name = match[1].trim()
      // Remove any trailing punctuation or labels
      name = name.replace(/[:\.,;]+$/, '').trim()
      
      const nameParts = name.split(/\s+/).filter(part => part.length > 1)
      if (nameParts.length >= 2 && nameParts.length <= 5) {
        const isValid = !nameParts.some(part => {
          const partUpper = part.toUpperCase()
          return excludedWords.some(excluded => partUpper.includes(excluded)) ||
                 /^\d+$/.test(part) || // Numbers only
                 partUpper === 'M' || partUpper === 'F' || // Gender markers
                 part.includes('-') && /\d/.test(part) // CNIC-like
        })
        
        if (isValid && name.length > 4 && name.length < 50) {
          // Capitalize first letter of each word properly
          result.fullName = nameParts.map(part => {
            if (part === part.toUpperCase() && part.length > 2) {
              // If all uppercase (like "HAIDER"), convert to title case
              return part.charAt(0) + part.slice(1).toLowerCase()
            }
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
          }).join(' ')
          
          console.log('Extracted name from label:', result.fullName)
          break
        }
      }
    }
  }

  // Strategy 2: Look for title case names (First Name Last Name) - more reliable
  if (!result.fullName) {
    const titleCasePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/g
    const matches = [...cleanText.matchAll(titleCasePattern)]
    
    for (const match of matches) {
      if (match[1]) {
        const name = match[1].trim()
        const nameParts = name.split(/\s+/)
        
        if (nameParts.length >= 2 && nameParts.length <= 5) {
          const isValid = !nameParts.some(part => {
            const partUpper = part.toUpperCase()
            return excludedWords.some(excluded => partUpper.includes(excluded)) ||
                   /^\d+$/.test(part) ||
                   partUpper === 'M' || partUpper === 'F'
          })
          
          // Check position - name should appear before CNIC in Pakistani IDs
          const nameIndex = cleanText.indexOf(name)
          const cnicIndex = result.cnicNumber ? cleanText.indexOf(result.cnicNumber) : -1
          
          if (isValid && name.length > 5 && name.length < 50) {
            // Name should be before CNIC number on the card
            if (cnicIndex === -1 || nameIndex < cnicIndex) {
              result.fullName = name
              console.log('Extracted name from title case:', result.fullName)
              break
            }
          }
        }
      }
    }
  }

  // Strategy 3: Look for uppercase words (common in ID cards) that form a name
  if (!result.fullName) {
    // Find sequences of 2-5 uppercase words that are likely names
    // But be more careful - names usually appear before other data
    const uppercasePattern = /\b([A-Z]{2,}(?:\s+[A-Z]{2,}){1,4})\b/g
    const matches = [...cleanText.matchAll(uppercasePattern)]
    
    // Filter matches that appear early in the text (names are usually at top)
    const earlyMatches = matches.filter(match => {
      const matchIndex = cleanText.indexOf(match[1])
      return matchIndex < cleanText.length * 0.4 // First 40% of text
    })
    
    for (const match of earlyMatches) {
      if (match[1]) {
        const name = match[1].trim()
        const nameParts = name.split(/\s+/).filter(part => part.length > 1)
        
        if (nameParts.length >= 2 && nameParts.length <= 5) {
          const isValid = !nameParts.some(part => {
            const partUpper = part.toUpperCase()
            return excludedWords.some(excluded => partUpper.includes(excluded)) ||
                   /^\d+$/.test(part) ||
                   partUpper === 'M' || partUpper === 'F' ||
                   (part.includes('-') && /\d/.test(part))
          })
          
          if (isValid && name.length > 5 && name.length < 50) {
            // Check position relative to CNIC
            const nameIndex = cleanText.indexOf(name)
            const cnicIndex = result.cnicNumber ? cleanText.indexOf(result.cnicNumber) : -1
            if (cnicIndex === -1 || nameIndex < cnicIndex) {
              // Convert to title case
              result.fullName = nameParts.map(part => {
                return part.charAt(0) + part.slice(1).toLowerCase()
              }).join(' ')
              
              console.log('Extracted name from uppercase pattern:', result.fullName)
              break
            }
          }
        }
      }
    }
  }


  // Extract Father's Name - Look for S/O, D/O, C/O, Father patterns
  const fatherPatterns = [
    // S/O (Son Of) pattern - most common on Pakistani IDs
    /\bS\s*\/\s*O\s*[:]?\s*([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,3})/i,
    // D/O (Daughter Of) pattern
    /\bD\s*\/\s*O\s*[:]?\s*([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,3})/i,
    // Father label pattern
    /Father\s*[:]?\s*([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,3})/i,
    // After name, look for S/O pattern
    new RegExp(`(${result.fullName || '[A-Za-z]+'})\\s+S\\s*/\\s*O\\s*[:]?\\s*([A-Z][A-Za-z]+(?:\\s+[A-Z][A-Za-z]+){0,3})`, 'i'),
  ]

  for (const pattern of fatherPatterns) {
    const match = cleanText.match(pattern)
    if (match) {
      // Get the father name (could be in different capture groups)
      let fatherName = match[match.length - 1]?.trim() || match[1]?.trim()
      
      if (fatherName) {
        // Remove any trailing punctuation
        fatherName = fatherName.replace(/[:\.,;]+$/, '').trim()
        const nameParts = fatherName.split(/\s+/).filter(part => part.length > 1)
        
        if (nameParts.length >= 2 && nameParts.length <= 5) {
          const isValid = !nameParts.some(part => {
            const partUpper = part.toUpperCase()
            return excludedWords.some(excluded => partUpper.includes(excluded)) ||
                   /^\d+$/.test(part) ||
                   partUpper === 'M' || partUpper === 'F'
          })
          
          if (isValid && fatherName.length > 5 && fatherName !== result.fullName) {
            // Capitalize properly
            result.fatherName = nameParts.map(part => {
              if (part === part.toUpperCase() && part.length > 2) {
                return part.charAt(0) + part.slice(1).toLowerCase()
              }
              return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
            }).join(' ')
            
            console.log('Extracted father name:', result.fatherName)
            break
          }
        }
      }
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

