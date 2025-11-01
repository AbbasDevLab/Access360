import PptxGenJS from 'pptxgenjs'

const deck = new PptxGenJS()
deck.author = 'Access360 Team'
deck.company = 'Forman Christian College (A Chartered University)'
deck.subject = 'Access360: AI-Powered Visitor Management System'
deck.title = 'Access360 - FYP Defense'

const themeColor = '1F4B99'
const lightText = 'FFFFFF'
const bodyFont = 'Calibri'

function titleSlide(title, subtitle) {
  const slide = deck.addSlide()
  slide.background = { color: 'FFFFFF' }
  slide.addShape(deck.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 1, fill: { color: themeColor } })
  slide.addText(title, { x: 0.6, y: 1.2, w: 9.2, h: 1.2, fontSize: 40, bold: true, color: themeColor, fontFace: bodyFont })
  if (subtitle) {
    slide.addText(subtitle, { x: 0.6, y: 2.3, w: 9.2, h: 0.6, fontSize: 20, color: '333333', fontFace: bodyFont })
  }
  slide.addText('Team: Haider Abbas · Taha Khurram · Haroon Ali', { x: 0.6, y: 6.0, w: 9.2, h: 0.4, fontSize: 14, color: '555555', fontFace: bodyFont })
  slide.addText('Advisor: Dr. Sidra Minhas · Secondary: Dr. Nosheen Sabahat', { x: 0.6, y: 6.5, w: 9.2, h: 0.4, fontSize: 12, color: '777777', fontFace: bodyFont })
}

function bulletsSlide(title, bullets, opts = {}) {
  const slide = deck.addSlide()
  slide.addShape(deck.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.6, fill: { color: themeColor } })
  slide.addText(title, { x: 0.5, y: 0.2, w: 9, h: 0.4, fontSize: 18, color: lightText, bold: true, fontFace: bodyFont })
  const left = opts.left ?? 0.7
  const top = opts.top ?? 1.1
  const width = opts.width ?? 9.0
  const fontSize = opts.fontSize ?? 18
  const paraSpace = opts.paraSpace ?? 10
  slide.addText(
    bullets.map((b) => ({ text: `${b}\n`, options: { bullet: true, fontSize, fontFace: bodyFont, color: '333333', paraSpace } })),
    { x: left, y: top, w: width, h: 5 }
  )
}

function twoColSlide(title, leftBullets, rightBullets) {
  const slide = deck.addSlide()
  slide.addShape(deck.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.6, fill: { color: themeColor } })
  slide.addText(title, { x: 0.5, y: 0.2, w: 9, h: 0.4, fontSize: 18, color: lightText, bold: true, fontFace: bodyFont })
  slide.addText(leftBullets.map((t) => ({ text: `${t}\n`, options: { bullet: true, fontSize: 18, fontFace: bodyFont, color: '333333', paraSpace: 10 } })), { x: 0.7, y: 1.1, w: 4.2, h: 5 })
  slide.addText(rightBullets.map((t) => ({ text: `${t}\n`, options: { bullet: true, fontSize: 18, fontFace: bodyFont, color: '333333', paraSpace: 10 } })), { x: 5.1, y: 1.1, w: 4.2, h: 5 })
}

// Slides
titleSlide('Access360', 'AI-Powered Visitor Management System (Pilot)')

bulletsSlide('Problem & Motivation', [
  'Manual registers, paper passes, slow and error-prone',
  'Weak verification; passes easy to forge',
  'Limited auditability and reporting',
  'Goal: secure, efficient, auditable pilot at single counter',
])

bulletsSlide('Solution Overview', [
  'OCR-based ID processing with validation',
  'Live photo capture for record-keeping (no biometric matching)',
  'Digitally signed QR pass (RS256) with scope + expiry',
  'Offline verification by guards via mobile app',
  'Bilingual UI (Urdu/English)',
])

twoColSlide('Architecture', [
  'React Counter UI (Enrollment)',
  'Python AI Service (Doc detect, classify, OCR)',
  '.NET 8 Backend (Auth, Pass, Audit)',
  'Mobile Guard App (Offline verify)',
], [
  'PostgreSQL (Records, Audit)',
  'Object Storage (Photos, Docs)',
  'JWT/QR (RS256, jti, scope)',
  'Queue for async OCR/notifications',
])

bulletsSlide('Key Flows', [
  'Enrollment: scan ID → OCR → review → capture photo → issue pass',
  'Verification: scan QR → verify signature offline → allow/deny',
  'Exit: scan again → mark checkout → return card tracking',
])

twoColSlide('Security & Privacy', [
  'TLS, RBAC, audit logs',
  'RS256-signed passes; key rotation',
  'Encrypted media at rest (AES‑256)',
  'Least-privilege services',
], [
  'Consent and retention controls',
  'Data minimization',
  'Human-in-the-loop for low confidence',
  'Device lock + offline tamper checks',
])

bulletsSlide('OCR & Validation', [
  'Tesseract with preprocessing (deskew, denoise, threshold)',
  'MRZ parsing (ICAO 9303) where applicable',
  'Regex/format checks (e.g., CNIC)',
  'Dual-language models (eng+urd) where needed',
])

bulletsSlide('QR/JWT Schema (Pilot)', [
  'Header: alg=RS256, kid',
  'Claims: jti, sub (visitorId), scope (sites), exp, iat, nbf',
  'Minimal PII in token; server lookup for details',
])

bulletsSlide('Offline Verification', [
  'Embedded public key; signature verified on-device',
  'Cache recently revoked jti list',
  'Queue events: check-in/out sync when online',
])

twoColSlide('SOP Alignment', [
  'Appointment flag and escort required',
  'Visitor types & campus sites list',
  'Badge display reminders on print/SMS',
], [
  'Lost-card reporting and card return flow',
  'Metal detector/bag scan notes (non-functional UI hints)',
  'Logs for police/QRF events',
])

twoColSlide('KPIs & Evaluation', [
  'Median enrollment ≤ 60s; P95 ≤ 120s',
  'OCR accuracy: CNIC ≥ 95%, names ≥ 85%',
], [
  'Guard verify latency ≤ 1s offline',
  'Uptime ≥ 99% during pilot hours',
])

bulletsSlide('Risks & Mitigations', [
  'Low-quality IDs → lighting + preprocessing',
  'Multilingual OCR errors → dual models + regex',
  'Network downtime → offline verification',
  'Change resistance → pilot KPIs + training',
])

bulletsSlide('Timeline (7 Weeks)', [
  'W1-2: Requirements & design',
  'W3-4: OCR & enrollment module',
  'W5: QR pass & guard app',
  'W6: Security & offline',
  'W7: Testing & report',
])

bulletsSlide('Budget (PKR 45,000)', [
  'Hardware (camera, workstation): 30,000',
  'Software/tools: 10,000',
  'Misc + contingency: 5,000',
])

twoColSlide('Team & Roles', [
  'Haider Abbas — Backend, Security, QR/JWT',
  'Taha Khurram — AI & Mobile (OCR, Guard App)',
  'Haroon Ali — Frontend & DevOps',
], [
  'Advisors: Dr. Sidra Minhas, Dr. Nosheen Sabahat',
  'Thanks to Security Dept (FCCU) for SOP inputs',
])

titleSlide('Thank You', 'Q&A')

const outPath = new URL('../Access360_FYP_Deck.pptx', import.meta.url)
await deck.writeFile({ fileName: outPath })
console.log('Deck generated at', outPath.pathname)





