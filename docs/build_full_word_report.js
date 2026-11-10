const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  PageBreak,
  Header,
  Footer,
  PageNumber
} = require('docx');

const primaryColor = "1F497D"; // FPT / Professional Navy
const secondaryColor = "595959";
const headerBgColor = "EBF1F5";
const tableBorderColor = "D3D3D3";

const thinBorder = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: tableBorderColor
};

const cellBorders = {
  top: thinBorder,
  bottom: thinBorder,
  left: thinBorder,
  right: thinBorder
};

function createCell(text, isHeader = false, widthPercent = 25, isBold = false) {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    shading: isHeader ? { fill: "DCE6F1", type: ShadingType.CLEAR } : undefined,
    children: [
      new Paragraph({
        alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { before: 80, after: 80 },
        children: [
          new TextRun({
            text: text,
            bold: isHeader || isBold,
            size: isHeader ? 20 : 19,
            color: isHeader ? primaryColor : "000000",
            font: "Calibri"
          })
        ]
      })
    ]
  });
}

function createHeading1(title) {
  return new Paragraph({
    text: title,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 32,
        color: primaryColor,
        font: "Calibri"
      })
    ]
  });
}

function createHeading2(title) {
  return new Paragraph({
    text: title,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 26,
        color: primaryColor,
        font: "Calibri"
      })
    ]
  });
}

function createHeading3(title) {
  return new Paragraph({
    text: title,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 90 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 22,
        color: "2E74B5",
        font: "Calibri"
      })
    ]
  });
}

function createBodyP(text, isItalic = false) {
  return new Paragraph({
    spacing: { before: 80, after: 80, line: 276 },
    children: [
      new TextRun({
        text: text,
        size: 22,
        font: "Calibri",
        italics: isItalic
      })
    ]
  });
}

function createFigureBox(figureTitle, diagramFileName) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.DASHED, size: 6, color: "4F81BD" },
      bottom: { style: BorderStyle.DASHED, size: 6, color: "4F81BD" },
      left: { style: BorderStyle.DASHED, size: 6, color: "4F81BD" },
      right: { style: BorderStyle.DASHED, size: 6, color: "4F81BD" }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { fill: "F2F5F8", type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 180, after: 60 },
                children: [
                  new TextRun({
                    text: `[ DIAGRAM PLACEHOLDER: ${diagramFileName} ]`,
                    bold: true,
                    size: 22,
                    color: primaryColor,
                    font: "Consolas"
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 40, after: 60 },
                children: [
                  new TextRun({
                    text: `Exported file available at: docs/diagrams/${diagramFileName}`,
                    size: 18,
                    color: "555555",
                    italics: true,
                    font: "Calibri"
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 40, after: 180 },
                children: [
                  new TextRun({
                    text: figureTitle,
                    bold: true,
                    size: 20,
                    color: primaryColor,
                    font: "Calibri"
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}

async function buildDocument() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 22,
            color: "000000"
          }
        }
      }
    },
    sections: [
      // Section 1: Title Page & Meta
      {
        properties: {},
        children: [
          new Paragraph({ spacing: { before: 1200 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: "FPT UNIVERSITY",
                bold: true,
                size: 32,
                color: "E36C09", // FPT Orange
                font: "Calibri"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 400 },
            children: [
              new TextRun({
                text: "DEPARTMENT OF SOFTWARE ENGINEERING",
                bold: true,
                size: 24,
                color: "595959",
                font: "Calibri"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
            children: [
              new TextRun({
                text: "CAPSTONE PROJECT REPORT",
                bold: true,
                size: 40,
                color: primaryColor,
                font: "Calibri"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 300 },
            children: [
              new TextRun({
                text: "REPORT 4 – SOFTWARE DESIGN DOCUMENT (SDD)",
                bold: true,
                size: 30,
                color: "2E74B5",
                font: "Calibri"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 600 },
            children: [
              new TextRun({
                text: "Project: Motel Management System (MMS)",
                bold: true,
                size: 26,
                color: primaryColor,
                font: "Calibri"
              })
            ]
          }),

          // Info Table
          new Table({
            alignment: AlignmentType.CENTER,
            width: { size: 85, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            rows: [
              new TableRow({
                children: [
                  createCell("Role in Project", true, 30),
                  createCell("Member Name", true, 35),
                  createCell("Assigned Module", true, 35)
                ]
              }),
              new TableRow({
                children: [
                  createCell("Team Leader", false, 30, true),
                  createCell("Quang", false, 35, true),
                  createCell("Room & Search Management", false, 35)
                ]
              }),
              new TableRow({
                children: [
                  createCell("Member 2", false, 30),
                  createCell("Phạm Văn Khánh", false, 35),
                  createCell("User Auth & Tenant KYC", false, 35)
                ]
              }),
              new TableRow({
                children: [
                  createCell("Member 3", false, 30),
                  createCell("Đức", false, 35),
                  createCell("Rental Contract Management", false, 35)
                ]
              }),
              new TableRow({
                children: [
                  createCell("Member 4", false, 30),
                  createCell("Nguyễn Văn Mạnh", false, 35),
                  createCell("Utility, Billing & VNPay Payment", false, 35)
                ]
              })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 1200 },
            children: [
              new TextRun({
                text: "Hanoi, Academic Year 2026",
                italics: true,
                size: 22,
                color: secondaryColor,
                font: "Calibri"
              })
            ]
          }),
          new Paragraph({ children: [new PageBreak()] })
        ]
      },

      // Section 2: Document Body with Header & Footer
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 120 },
                children: [
                  new TextRun({
                    text: "MMS – Report 4 (Software Design Document)",
                    size: 18,
                    color: "888888",
                    font: "Calibri"
                  })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 120 },
                children: [
                  new TextRun({
                    text: "Page ",
                    size: 18,
                    font: "Calibri"
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                    font: "Calibri"
                  }),
                  new TextRun({
                    text: " of ",
                    size: 18,
                    font: "Calibri"
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 18,
                    font: "Calibri"
                  })
                ]
              })
            ]
          })
        },
        children: [
          // Record of Changes
          createHeading1("I. Record of Changes"),
          createBodyP("This document records all modifications, reviews, and architectural milestones throughout the software design lifecycle."),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            rows: [
              new TableRow({
                children: [
                  createCell("Date", true, 15),
                  createCell("Ver.", true, 10),
                  createCell("Description", true, 45),
                  createCell("Author", true, 15),
                  createCell("Approved", true, 15)
                ]
              }),
              new TableRow({
                children: [
                  createCell("2026-10-25"),
                  createCell("0.1"),
                  createCell("Initial System Architecture & Layered Package Draft"),
                  createCell("Quang (Lead)"),
                  createCell("Mentor")
                ]
              }),
              new TableRow({
                children: [
                  createCell("2026-10-31"),
                  createCell("0.5"),
                  createCell("Full Domain Class Diagram & Mongoose Schema specifications"),
                  createCell("Team"),
                  createCell("Mentor")
                ]
              }),
              new TableRow({
                children: [
                  createCell("2026-11-04"),
                  createCell("0.8"),
                  createCell("Module-level Controller/Service/Model APIs synchronization"),
                  createCell("All Members"),
                  createCell("Instructor")
                ]
              }),
              new TableRow({
                children: [
                  createCell("2026-11-10"),
                  createCell("1.0"),
                  createCell("Final SDD: Architecture, Package, 4 Module Class Diagrams, 14 Sequence Diagrams"),
                  createCell("Quang (Lead)"),
                  createCell("Instructor")
                ]
              })
            ]
          }),

          new Paragraph({ spacing: { before: 240 } }),

          // Table of Contents Summary
          createHeading1("II. Table of Contents Summary"),
          createBodyP("1. System Design: 1.1 System Architecture, 1.2 Package Diagrams (Frontend & Backend)"),
          createBodyP("2. Detailed Design:"),
          createBodyP("   2.1 Module 1: Authentication & Tenant Management (Phạm Văn Khánh)"),
          createBodyP("   2.2 Module 2: Room & Search Management (Quang - Team Leader)"),
          createBodyP("   2.3 Module 3: Rental Contract Management (Đức)"),
          createBodyP("   2.4 Module 4: Utility, Billing & VNPay Payment (Nguyễn Văn Mạnh)"),
          createBodyP("3. Database Design: 3.1 Domain Model / Class Diagram, 3.2 Collection Schemas & Data Dictionary"),

          new Paragraph({ children: [new PageBreak()] }),

          // 1. System Design
          createHeading1("1. System Design"),
          createHeading2("1.1 System Architecture"),
          createBodyP("The Motel Management System (MMS) is engineered on a distributed 3-tier enterprise architecture ensuring security, separation of concerns, and cloud scalability:"),
          createBodyP("• Tier 1 - Presentation Layer: Modern responsive Web Administration Dashboard (React 18, Vite, Tailwind CSS) for landlords/staff and Native Mobile Application (React Native / Expo) for tenants."),
          createBodyP("• Tier 2 - Application Layer: High-performance Node.js / Express.js RESTful API engine incorporating JWT Authentication, Role-Based Access Control (RBAC), and domain Service layers."),
          createBodyP("• Tier 3 - Data Storage & External Services: MongoDB cluster for high-throughput document persistence alongside the external VNPay Payment Gateway Sandbox for financial settlements."),

          new Paragraph({ spacing: { before: 120, after: 120 } }),
          createFigureBox("Figure 1.1. System Architecture Diagram", "System_Architecture.drawio"),
          new Paragraph({ spacing: { before: 120, after: 120 } }),

          createHeading3("1.1.1 Front-end Architecture"),
          createBodyP("The frontend adheres to component-driven design. The Web portal manages state via React Context API and handles asynchronous REST traffic using Axios interceptors. The Mobile client is packaged via Expo for Android deployment, persisting session tokens via AsyncStorage."),

          createHeading3("1.1.2 Back-end Architecture"),
          createBodyP("The backend applies the standard Controller-Service-Repository pattern. Routes define HTTP interfaces, Middlewares enforce authentication and payload validation, Controllers orchestrate request lifecycles, Services implement pure business calculations, and Mongoose Models represent database collections with automatic schema validation hooks."),

          createHeading2("1.2 Package Diagram"),
          createHeading3("1.2.1 Front-end Package Diagram"),
          createBodyP("The frontend repository is structured into modular namespaces:"),
          createBodyP("• src/components: Shared atomic widgets (modals, data tables, alert toasts, form inputs)."),
          createBodyP("• src/pages: Functional route destinations (RoomsPage, ContractsPage, InvoicesPage, ProfilePage)."),
          createBodyP("• src/services: Typed API clients mapped to backend REST endpoints."),
          createBodyP("• src/context: Global state providers (AuthContext, ThemeContext)."),

          createHeading3("1.2.2 Back-end Package Diagram"),
          createBodyP("The backend directory enforces strict separation of responsibilities:"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            rows: [
              new TableRow({
                children: [
                  createCell("No", true, 10),
                  createCell("Package", true, 25),
                  createCell("Description & Responsibilities", true, 65)
                ]
              }),
              new TableRow({
                children: [
                  createCell("1"),
                  createCell("config/"),
                  createCell("Database connections, JWT signing keys, VNPay merchant credentials")
                ]
              }),
              new TableRow({
                children: [
                  createCell("2"),
                  createCell("routes/"),
                  createCell("RESTful route declarations and HTTP method bindings")
                ]
              }),
              new TableRow({
                children: [
                  createCell("3"),
                  createCell("middlewares/"),
                  createCell("JWT verification, RBAC guard, input validation, and global error handlers")
                ]
              }),
              new TableRow({
                children: [
                  createCell("4"),
                  createCell("controllers/"),
                  createCell("HTTP request extraction, DTO mapping, and JSON response delivery")
                ]
              }),
              new TableRow({
                children: [
                  createCell("5"),
                  createCell("services/"),
                  createCell("Core business rules: pricing algorithms, signature verification, VNPay hash")
                ]
              }),
              new TableRow({
                children: [
                  createCell("6"),
                  createCell("models/"),
                  createCell("Mongoose schemas: User, Room, RentalRequest, Contract, Utility, Invoice")
                ]
              })
            ]
          }),

          new Paragraph({ children: [new PageBreak()] }),

          // 2. Detailed Design
          createHeading1("2. Detailed Design"),

          // 2.1 Module 1: Khanh
          createHeading2("2.1 Module 1: Authentication & Tenant Management (Phạm Văn Khánh)"),
          createBodyP("This module governs user onboarding, authentication via JSON Web Tokens, tenant KYC compliance (citizen ID verification), and staff permission management."),
          
          createHeading3("2.1.1 Class Diagram - User & Tenant Module"),
          createFigureBox("Figure 2.1.1. Class Diagram - User & Tenant Module", "ClassDiagram_User_Module.drawio"),
          new Paragraph({ spacing: { before: 120, after: 120 } }),

          createHeading3("2.1.2 Sign Up (Register) Sequence Diagram"),
          createFigureBox("Figure 2.1.2. Sign Up Sequence Diagram", "UC-M01_1_Register_SequenceDiagram.drawio"),
          createBodyP("Flow Description: The user inputs name, phone, email, and password. The system queries MongoDB to ensure uniqueness of phone/email. If unique, password is encrypted with Bcrypt (salt round = 10), new User document is persisted, and a signed JWT is returned for seamless login."),

          createHeading3("2.1.3 Sign In (Login) Sequence Diagram"),
          createFigureBox("Figure 2.1.3. Sign In Sequence Diagram", "UC-M01_2_Login_SequenceDiagram.drawio"),
          createBodyP("Flow Description: The client sends credentials to POST /api/auth/login. The service compares bcrypt hash and verifies account is not locked. Upon validation, a JWT session token containing user ID and role is issued."),

          createHeading3("2.1.4 Update Tenant Profile (KYC) Sequence Diagram"),
          createFigureBox("Figure 2.1.4. Update Tenant Profile Sequence Diagram", "UC-M06_Update_Tenant_Profile_SequenceDiagram.drawio"),
          createBodyP("Flow Description: The tenant submits 12-digit Citizen ID (CCCD), hometown, and identity card photographs. Upon validation, isKycDone is flagged true, allowing instant 1-click room rental requests."),

          new Paragraph({ children: [new PageBreak()] }),

          // 2.2 Module 2: Quang
          createHeading2("2.2 Module 2: Room & Search Management (Quang - Team Leader)"),
          createBodyP("Responsible for room inventory management, multi-criteria search algorithms, rental request processing, and operational room state transitions."),

          createHeading3("2.2.1 Class Diagram - Room Module"),
          createFigureBox("Figure 2.2.1. Class Diagram - Room Module", "ClassDiagram_Room_Module.drawio"),
          new Paragraph({ spacing: { before: 120, after: 120 } }),

          createHeading3("2.2.2 Search & Filter Rooms Sequence Diagram"),
          createFigureBox("Figure 2.2.2. Search & Filter Rooms Sequence Diagram", "UC-M02_Search_Room_SequenceDiagram.drawio"),
          createBodyP("Flow Description: The client provides keyword, minPrice, maxPrice, and amenities. The backend executes a MongoDB query with regex and range operators. If matched, room array is returned; otherwise, an empty array triggers the UI Empty State."),

          createHeading3("2.2.3 Request Rental / Hold Room Sequence Diagram"),
          createFigureBox("Figure 2.2.3. Request Rental Sequence Diagram", "UC-M03_Request_Rental_SequenceDiagram.drawio"),
          createBodyP("Flow Description: Tenant requests reservation on a selected room. Service checks room.status === 'AVAILABLE'. If available, a RentalRequest document with status PENDING is created for landlord approval."),

          createHeading3("2.2.4 Create Room Sequence Diagram"),
          createFigureBox("Figure 2.2.4. Create Room Sequence Diagram", "UC-M04_1_Create_Room_SequenceDiagram.drawio"),
          createBodyP("Flow Description: Landlord inputs room number, type, price, and amenities. System verifies room number uniqueness, validates positive price, and stores room as AVAILABLE."),

          createHeading3("2.2.5 Update Room Info Sequence Diagram"),
          createFigureBox("Figure 2.2.5. Update Room Info Sequence Diagram", "UC-M04_2_Update_Room_SequenceDiagram.drawio"),
          createBodyP("Flow Description: Fully synchronized with instructor-approved UC-M09 specification: updates pricing, amenities, and media with atomic persistence."),

          createHeading3("2.2.6 Delete Room Sequence Diagram"),
          createFigureBox("Figure 2.2.6. Delete Room Sequence Diagram", "UC-M04_3_Delete_Room_SequenceDiagram.drawio"),
          createBodyP("Flow Description: Critical business rule guard: System queries active contracts. If room status is RENTED or has active contracts, deletion is strictly aborted with 400 Bad Request to guarantee data integrity."),

          new Paragraph({ children: [new PageBreak()] }),

          // 2.3 Module 3: Duc
          createHeading2("2.3 Module 3: Rental Contract Management (Đức)"),
          createBodyP("Manages electronic lease contracts, legally binding terms, online digital signatures, contract extensions, and security deposit liquidations."),

          createHeading3("2.3.1 Class Diagram - Contract Module"),
          createFigureBox("Figure 2.3.1. Class Diagram - Contract Module", "ClassDiagram_Contract_Module.drawio"),
          new Paragraph({ spacing: { before: 120, after: 120 } }),

          createHeading3("2.3.2 Create Contract Sequence Diagram"),
          createFigureBox("Figure 2.3.2. Create Contract Sequence Diagram", "UC-M05_1_Create_Contract_SequenceDiagram.drawio"),
          createBodyP("Flow Description: Landlord converts an approved RentalRequest into an official lease. Room status automatically switches to RENTED, and the contract is staged in PENDING_SIGN."),

          createHeading3("2.3.3 Tenant Sign Contract Online Sequence Diagram"),
          createFigureBox("Figure 2.3.3. Sign Contract Sequence Diagram", "UC-M05_2_Sign_Contract_SequenceDiagram.drawio"),
          createBodyP("Flow Description: Tenant inspects legal terms on mobile, draws signature on touch canvas, and clicks confirm. System verifies user identity, saves digital signature image, and activates contract (status: ACTIVE)."),

          new Paragraph({ children: [new PageBreak()] }),

          // 2.4 Module 4: Manh
          createHeading2("2.4 Module 4: Utility, Invoice & VNPay Payment (Nguyễn Văn Mạnh)"),
          createBodyP("Manages monthly utility meter readings, automated billing generation, and direct payment integration with the VNPay Payment Gateway."),

          createHeading3("2.4.1 Class Diagram - Billing & Payment Module"),
          createFigureBox("Figure 2.4.1. Class Diagram - Billing & Payment Module", "ClassDiagram_Billing_Module.drawio"),
          new Paragraph({ spacing: { before: 120, after: 120 } }),

          createHeading3("2.4.2 Record Utility Readings Sequence Diagram"),
          createFigureBox("Figure 2.4.2. Record Utility Readings Sequence Diagram", "UC-M07_Record_Utility_SequenceDiagram.drawio"),
          createBodyP("Flow Description: Staff inputs new electricity and water readings. Guard condition asserts newReading >= oldReading, computes net consumption, and records utility data for monthly invoicing."),

          createHeading3("2.4.3 Pay Invoice via VNPay Gateway Sequence Diagram"),
          createFigureBox("Figure 2.4.3. Pay Invoice via VNPay Sequence Diagram", "UC-M09_1_VNPay_Payment_SequenceDiagram.drawio"),
          createBodyP("Flow Description: Tenant initiates invoice payment. Service constructs VNPay query parameters, generates cryptographic HMAC-SHA512 checksum, and returns redirect URL to VNPay Sandbox."),

          createHeading3("2.4.4 VNPay IPN Callback & Webhook Sequence Diagram"),
          createFigureBox("Figure 2.4.4. VNPay IPN Webhook Sequence Diagram", "UC-M09_2_VNPay_IPN_Callback_SequenceDiagram.drawio"),
          createBodyP("Flow Description: Asynchronous server-to-server webhook from VNPay. System validates secure checksum. If response code is '00', payment record is created, invoice is set to PAID, and confirmation code 00 is returned."),

          new Paragraph({ children: [new PageBreak()] }),

          // 3. Database Design
          createHeading1("3. Database Design"),
          createHeading2("3.1 System Domain Model / Class Diagram"),
          createBodyP("The domain diagram captures the holistic schema architecture, relationships, and multiplicities across the entire Motel Management System:"),

          createFigureBox("Figure 3.1. Full System Domain Class Diagram", "ClassDiagram_Full_Project.drawio"),
          new Paragraph({ spacing: { before: 180, after: 120 } }),

          createHeading2("3.2 Collection Schemas & Data Dictionary"),

          createHeading3("3.2.1 Collection: users"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            rows: [
              new TableRow({
                children: [
                  createCell("Field Name", true, 20),
                  createCell("Type", true, 15),
                  createCell("Nullable", true, 12),
                  createCell("Key / Index", true, 18),
                  createCell("Description & Rules", true, 35)
                ]
              }),
              new TableRow({
                children: [
                  createCell("_id"), createCell("ObjectId"), createCell("No"), createCell("PK"), createCell("Primary unique identifier")
                ]
              }),
              new TableRow({
                children: [
                  createCell("fullName"), createCell("String"), createCell("No"), createCell("-"), createCell("Full legal name")
                ]
              }),
              new TableRow({
                children: [
                  createCell("phone"), createCell("String"), createCell("No"), createCell("Unique Index"), createCell("10 digits phone, login credential")
                ]
              }),
              new TableRow({
                children: [
                  createCell("email"), createCell("String"), createCell("No"), createCell("Unique Index"), createCell("Valid email address format")
                ]
              }),
              new TableRow({
                children: [
                  createCell("passwordHash"), createCell("String"), createCell("No"), createCell("-"), createCell("Bcrypt hash (salt round 10)")
                ]
              }),
              new TableRow({
                children: [
                  createCell("role"), createCell("String"), createCell("No"), createCell("-"), createCell("ADMIN, LANDLORD, STAFF, TENANT")
                ]
              }),
              new TableRow({
                children: [
                  createCell("cccd"), createCell("String"), createCell("Yes"), createCell("Index"), createCell("12-digit Citizen ID for KYC")
                ]
              }),
              new TableRow({
                children: [
                  createCell("isKycDone"), createCell("Boolean"), createCell("No"), createCell("-"), createCell("Default false; true when verified")
                ]
              }),
              new TableRow({
                children: [
                  createCell("isLocked"), createCell("Boolean"), createCell("No"), createCell("-"), createCell("Default false; true locks login")
                ]
              })
            ]
          }),

          createHeading3("3.2.2 Collection: rooms"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            rows: [
              new TableRow({
                children: [
                  createCell("Field Name", true, 20),
                  createCell("Type", true, 15),
                  createCell("Nullable", true, 12),
                  createCell("Key / Index", true, 18),
                  createCell("Description & Rules", true, 35)
                ]
              }),
              new TableRow({
                children: [
                  createCell("_id"), createCell("ObjectId"), createCell("No"), createCell("PK"), createCell("Primary room key")
                ]
              }),
              new TableRow({
                children: [
                  createCell("roomNumber"), createCell("String"), createCell("No"), createCell("Unique Index"), createCell("Room code (e.g., P101, P202)")
                ]
              }),
              new TableRow({
                children: [
                  createCell("roomType"), createCell("String"), createCell("No"), createCell("Index"), createCell("SINGLE, DOUBLE, STUDIO, MEZZANINE")
                ]
              }),
              new TableRow({
                children: [
                  createCell("price"), createCell("Number"), createCell("No"), createCell("Index"), createCell("Monthly rent in VND (price > 0)")
                ]
              }),
              new TableRow({
                children: [
                  createCell("area"), createCell("Number"), createCell("No"), createCell("-"), createCell("Surface area in square meters")
                ]
              }),
              new TableRow({
                children: [
                  createCell("status"), createCell("String"), createCell("No"), createCell("Index"), createCell("AVAILABLE, RENTED, MAINTENANCE")
                ]
              }),
              new TableRow({
                children: [
                  createCell("amenities"), createCell("Array[String]"), createCell("No"), createCell("-"), createCell("AC, HEATER, WIFI, BALCONY")
                ]
              })
            ]
          }),

          createHeading3("3.2.3 Collection: contracts"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            rows: [
              new TableRow({
                children: [
                  createCell("Field Name", true, 20),
                  createCell("Type", true, 15),
                  createCell("Nullable", true, 12),
                  createCell("Key / Index", true, 18),
                  createCell("Description & Rules", true, 35)
                ]
              }),
              new TableRow({
                children: [
                  createCell("_id"), createCell("ObjectId"), createCell("No"), createCell("PK"), createCell("Primary contract ID")
                ]
              }),
              new TableRow({
                children: [
                  createCell("contractCode"), createCell("String"), createCell("No"), createCell("Unique Index"), createCell("Format: HD-YYYY-XXXX")
                ]
              }),
              new TableRow({
                children: [
                  createCell("roomId"), createCell("ObjectId"), createCell("No"), createCell("FK (rooms)"), createCell("Associated leased room")
                ]
              }),
              new TableRow({
                children: [
                  createCell("tenantId"), createCell("ObjectId"), createCell("No"), createCell("FK (users)"), createCell("Tenant signee ID")
                ]
              }),
              new TableRow({
                children: [
                  createCell("rentalPrice"), createCell("Number"), createCell("No"), createCell("-"), createCell("Monthly rental fee in VND")
                ]
              }),
              new TableRow({
                children: [
                  createCell("depositAmount"), createCell("Number"), createCell("No"), createCell("-"), createCell("Security deposit in VND")
                ]
              }),
              new TableRow({
                children: [
                  createCell("status"), createCell("String"), createCell("No"), createCell("Index"), createCell("DRAFT, PENDING_SIGN, ACTIVE, TERMINATED")
                ]
              }),
              new TableRow({
                children: [
                  createCell("signatureUrl"), createCell("String"), createCell("Yes"), createCell("-"), createCell("Digital signature image path")
                ]
              })
            ]
          }),

          createHeading3("3.2.4 Collection: invoices"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            rows: [
              new TableRow({
                children: [
                  createCell("Field Name", true, 20),
                  createCell("Type", true, 15),
                  createCell("Nullable", true, 12),
                  createCell("Key / Index", true, 18),
                  createCell("Description & Rules", true, 35)
                ]
              }),
              new TableRow({
                children: [
                  createCell("_id"), createCell("ObjectId"), createCell("No"), createCell("PK"), createCell("Invoice identifier")
                ]
              }),
              new TableRow({
                children: [
                  createCell("invoiceCode"), createCell("String"), createCell("No"), createCell("Unique Index"), createCell("Format: INV-YYYYMM-XXXX")
                ]
              }),
              new TableRow({
                children: [
                  createCell("roomId"), createCell("ObjectId"), createCell("No"), createCell("FK (rooms)"), createCell("Billed room")
                ]
              }),
              new TableRow({
                children: [
                  createCell("month"), createCell("String"), createCell("No"), createCell("Index"), createCell("Billing cycle (YYYY-MM)")
                ]
              }),
              new TableRow({
                children: [
                  createCell("totalAmount"), createCell("Number"), createCell("No"), createCell("-"), createCell("Rent + Electric + Water + Service")
                ]
              }),
              new TableRow({
                children: [
                  createCell("status"), createCell("String"), createCell("No"), createCell("Index"), createCell("UNPAID, PAID, OVERDUE")
                ]
              }),
              new TableRow({
                children: [
                  createCell("paidAt"), createCell("Date"), createCell("Yes"), createCell("-"), createCell("Timestamp payment confirmed")
                ]
              })
            ]
          }),

          new Paragraph({ spacing: { before: 240 } }),
          createHeading1("4. Conclusion & Handover"),
          createBodyP("This Software Design Document serves as the authoritative blueprint for development, API testing, quality assurance, and graduation defense. All corresponding draw.io visual diagrams are synchronized and ready for oral examinations.")
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  const outPaths = [
    path.join(__dirname, 'Report4_Software_Design_Document.docx'),
    'C:\\Users\\nguye\\Downloads\\Report4_Software_Design_Document.docx'
  ];

  outPaths.forEach(p => {
    fs.writeFileSync(p, buffer);
    console.log(`Word file generated: ${p}`);
  });
}

buildDocument().catch(err => {
  console.error("Error generating docx:", err);
  process.exit(1);
});
