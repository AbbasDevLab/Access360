# Access360: Digital Visitor Management System

**Final Year Project Proposal by**  
Haider Abbas | Taha Khurram | Haroon Ali  
**Advisor:** Dr. Sidra Minhas | **Co-Advisor:** Dr. Nosheen Sabahat  
Department of Computer Science  
Forman Christian College University  
Lahore, Pakistan (2024)

## ABSTRACT
Access360 is a digital visitor management system intended to replace the manual, time‑consuming, and error‑prone process currently used at the university. The pilot (Module 1) will be deployed at a single entry counter and will: (i) extract visitor details from CNIC or other identity documents via OCR, (ii) capture a live photograph for record‑keeping, and (iii) assign an existing visitor card (unique ID) to the visitor by linking the card to the visitor's CNIC within the system. Upon exit, the card is returned, marked available, and the exit timestamp is recorded. Returning visitors will be processed rapidly by retrieving their stored profile using CNIC or phone number, updating only the purpose of visit and any building access details. Module 2 (future scope) will introduce QR‑based passes and building access control. The project targets a reduction in registration time from 4–5 minutes per visitor to ≤ 2 minutes, enabling a channelized, auditable, and secure workflow.


## INTRODUCTION
The existing visitor intake relies on handwritten registers and paper passes. This practice leads to long queues, transcription errors, and fragmented records that are difficult to search or audit. During peak hours, anecdotal evidence from delivery personnel indicates waiting times may reach 20–30 minutes before a pass is issued. A digitized intake process—centered on OCR for rapid data entry and a centralized database—can significantly improve throughput, reliability, and transparency.

## PROBLEM STATEMENT

### Unmet need or Problem
The current manual workflow is slow (≈ 4–5 minutes per visitor), scales poorly at peak times, and produces records that are hard to query or audit. There is no efficient mechanism to associate a returned visitor with prior records, and paper passes lack systematic tracking.

### Who needs it?
Primary stakeholders include campus security staff, administrative offices, and departments receiving visitors (e.g., faculty offices, finance, registrar). Secondary stakeholders include external visitors and delivery personnel who benefit from reduced waiting time. The immediate deployment is scoped to a single counter but is designed for subsequent campus‑wide adoption.


## LITERATURE REVIEW
Optical Character Recognition (OCR) is a mature technique for digitizing text on identity documents. Practical deployments commonly combine image preprocessing (denoising, deskewing, thresholding) with domain‑specific validation (e.g., regex formats for ID numbers) to improve accuracy. Open‑source engines such as Tesseract are widely used in production contexts when paired with appropriate preprocessing and template guidance. Commercial visitor management systems exist, but many are costly and less customizable for institutional requirements. The proposed pilot leverages open‑source tooling and a constrained, well‑defined workflow to balance accuracy, speed, and maintainability.

## PROJECT OVERVIEW/GOAL
The goal is to deliver a secure, efficient, and auditable visitor management system suitable for campus deployment. In Module 1, the system will perform OCR‑based ID capture, live photo capture, and assignment of existing visitor cards with unique IDs linked to the visitor's CNIC. The database will maintain visit records, card availability status, and entry/exit timestamps. For returning visitors, operators will retrieve records using CNIC or phone number to minimize intake time. Module 2 (future) will introduce QR‑based passes and guard‑side verification for building access control.


## PROJECT DEVELOPMENT METHODOLOGY / ARCHITECTURE

### Modules and Deliverables:
- **Counter Registration Module**: Operator UI for intake; workflows for first‑time and returning visitors; card assignment and return.
- **OCR Module**: Document capture, preprocessing, and field extraction for CNIC/ID; validation of formats.
- **Media & Data Storage**: Live photo capture stored with visit record; retention and retrieval policies.
- **Reporting & Audit**: Basic dashboards for daily counts, peak‑hour load, and card inventory.
- **Future (Module 2)**: QR‑based passes; guard app for building access control.

### Workflow Diagram
```
[Visitor Arrives] → [ID Scan/OCR] → [Photo Capture] → [Card Assignment] → [Entry Log]
                                                      ↓
[Exit] ← [Card Return] ← [Exit Log] ← [Card Available]
```

### System Architecture Diagram
```
[Counter UI] → [OCR Service] → [Backend API] → [Database]
     ↓              ↓              ↓
[Photo Storage] [Validation] [Card Management]
```


## PROJECT MILESTONES AND DELIVERABLES
- **Weeks 1–2**: Requirements elicitation; workflow design; data model; UI wireframes.
- **Weeks 3–4**: OCR integration; counter intake module; photo capture; card assignment logic.
- **Week 5**: Database integration; reporting views; internal testing; pilot dry‑run.
- **Week 6**: Pilot deployment at single counter; feedback; refinements.
- **Post‑Pilot**: Evaluation; documentation; Module 2 planning (QR passes & guard app).

## WORK DIVISION
- **Haider Abbas**: Backend services; data model; card lifecycle and visit logging; reporting.
- **Taha Khurram**: OCR pipeline; image preprocessing; mobile/guard‑side considerations.
- **Haroon Ali**: Frontend (counter UI); deployment; dashboards; usability improvements.


## COSTING
- **Hardware setup**: PKR 30,000
- **Hosting and domain**: PKR 15,000
- **Total Estimated Cost**: PKR 45,000

## REFERENCES
Smith, R. (2007). An Overview of the Tesseract OCR Engine. Proceedings of the Ninth International Conference on Document Analysis and Recognition (ICDAR).  
International Civil Aviation Organization (ICAO). Doc 9303: Machine Readable Travel Documents.  
ISO/IEC 30107: Information technology — Biometric presentation attack detection.


