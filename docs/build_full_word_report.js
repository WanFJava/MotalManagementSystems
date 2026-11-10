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
  PageNumber,
  ImageRun
} = require('docx');

const primaryColor = "1F497D"; // FPT Navy
const secondaryColor = "595959";
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

const imgDir = path.join(__dirname, 'diagram_images');

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

function createImageParagraph(imgFileName, width, height, captionText) {
  const p = path.join(imgDir, imgFileName);
  if (!fs.existsSync(p)) {
    return [new Paragraph({ text: `[Missing Image: ${imgFileName}]` })];
  }

  const imgBuffer = fs.readFileSync(p);
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 140, after: 100 },
      children: [
        new ImageRun({
          data: imgBuffer,
          transformation: {
            width: width,
            height: height
          }
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 180 },
      children: [
        new TextRun({
          text: captionText,
          bold: true,
          size: 20,
          color: primaryColor,
          font: "Calibri"
        })
      ]
    })
  ];
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
                spacing: { before: 140, after: 50 },
                children: [
                  new TextRun({
                    text: `[ DIAGRAM: ${diagramFileName} ]`,
                    bold: true,
                    size: 21,
                    color: primaryColor,
                    font: "Consolas"
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 40, after: 50 },
                children: [
                  new TextRun({
                    text: `Available in draw.io format at: docs/diagrams/${diagramFileName}`,
                    size: 18,
                    color: "555555",
                    italics: true,
                    font: "Calibri"
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 40, after: 140 },
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
          new Paragraph({ spacing: { before: 1000 } }),
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
            spacing: { before: 100, after: 300 },
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
            spacing: { before: 300, after: 150 },
            children: [
              new TextRun({
                text: "CAPSTONE PROJECT REPORT",
                bold: true,
                size: 38,
                color: primaryColor,
                font: "Calibri"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 200 },
            children: [
              new TextRun({
                text: "REPORT 4 – SOFTWARE DESIGN DOCUMENT (SDD)",
                bold: true,
                size: 28,
                color: "2E74B5",
                font: "Calibri"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 150, after: 450 },
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
            width: { size: 90, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            rows: [
              new TableRow({
                children: [
                  createCell("Role in Project", true, 26),
                  createCell("Member Name", true, 34),
                  createCell("Assigned Module & Scope", true, 40)
                ]
              }),
              new TableRow({
                children: [
                  createCell("Team Leader", false, 26, true),
                  createCell("Quang", false, 34, true),
                  createCell("Room & Search (5 Sequence Diagrams)", false, 40)
                ]
              }),
              new TableRow({
                children: [
                  createCell("Member 2", false, 26),
                  createCell("Phạm Văn Khánh", false, 34),
                  createCell("User Auth & KYC (4 Sequence Diagrams)", false, 40)
                ]
              }),
              new TableRow({
                children: [
                  createCell("Member 3", false, 26),
                  createCell("Đức", false, 34),
                  createCell("Rental Contract (4 Sequence Diagrams)", false, 40)
                ]
              }),
              new TableRow({
                children: [
                  createCell("Member 4", false, 26),
                  createCell("Nguyễn Văn Mạnh", false, 34),
                  createCell("Utility & VNPay (4 Sequence Diagrams)", false, 40)
                ]
              })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 900 },
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
          createBodyP("This document records all architectural revisions, design specifications, and review checkpoints throughout the Capstone software design phase."),
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
                  createCell("Full Domain Class Diagram & Mongoose Schemas design"),
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
                  createCell("1.1"),
                  createCell("Added System Context Diagram (DFD Level 0); Expanded to 17 Sequence Diagrams (>= 4 per member)"),
                  createCell("Quang (Lead)"),
                  createCell("Instructor")
                ]
              })
            ]
          }),

          new Paragraph({ spacing: { before: 200 } }),

          // Table of Contents Summary
          createHeading1("II. Table of Contents"),
          createBodyP("1. System Design"),
          createBodyP("   1.0 System Context Diagram (DFD Level 0)"),
          createBodyP("   1.1 System Architecture: 1.1.1 Front-end Architecture, 1.1.2 Back-end Architecture"),
          createBodyP("   1.2 Package Diagram: 1.2.1 Front-end Package Diagram, 1.2.2 Back-end Package Diagram"),
          createBodyP("2. Detailed Design"),
          createBodyP("   2.1 Module 1: Authentication & Tenant Management (Phạm Văn Khánh - 4 Sequence Diagrams)"),
          createBodyP("   2.2 Module 2: Room & Search Management (Quang - Team Leader - 5 Sequence Diagrams)"),
          createBodyP("   2.3 Module 3: Rental Contract Management (Đức - 4 Sequence Diagrams)"),
          createBodyP("   2.4 Module 4: Utility, Invoice & VNPay Payment (Nguyễn Văn Mạnh - 4 Sequence Diagrams)"),
          createBodyP("3. Database Design"),
          createBodyP("   3.1 System Domain Model / Class Diagram"),
          createBodyP("   3.2 Collection Schemas & Data Dictionary (users, rooms, contracts, invoices...)"),

          new Paragraph({ children: [new PageBreak()] }),

          // 1. System Design
          createHeading1("1. System Design"),

          // 1.0 System Context Diagram
          createHeading2("1.0 System Context Diagram (DFD Level 0)"),
          createBodyP("The System Context Diagram defines the high-level boundary of the Motel Management System (MMS) and delineates information exchanges with external stakeholders and third-party cloud infrastructure:"),
          createBodyP("• Tenant / Guest (Mobile & Web): Exchanges authentication credentials, room search queries, rental reservation requests, KYC citizen identification documents, digital contract signatures, and online invoice payment instructions."),
          createBodyP("• Landlord (Admin Web Portal): Inputs room inventory data, pricing policies, lease creation / extension / termination authorizations, and reviews rental requests alongside revenue analytics."),
          createBodyP("• Operations Staff (Web & Mobile): Transmits monthly electricity and water meter numbers, registers cash settlements, and monitors assigned room maintenance schedules."),
          createBodyP("• VNPay Payment Gateway (External API): Receives cryptographic HMAC-SHA512 order parameters and returns server-to-server asynchronous IPN webhooks to settle invoices."),
          createBodyP("• Cloudinary Storage (CDN Service): Persists and serves media assets including room showcase galleries, tenant citizen IDs, and vector signature PNGs."),

          // INSERT FIGURE 1.0 CONTEXT DIAGRAM IMAGE
          ...createImageParagraph("Figure_1_0_System_Context_Diagram.png", 580, 460, "Figure 1.0. System Context Diagram (DFD Level 0)"),

          new Paragraph({ children: [new PageBreak()] }),

          createHeading2("1.1 System Architecture"),
          createBodyP("The Motel Management System (MMS) adopts an enterprise 3-tier distributed architecture, separating Presentation (Client), Application Logic (NodeJS RESTful API), and Persistent Data Storage (MongoDB cluster & VNPay payment gateway)."),

          createHeading3("1.1.1 Front-end Architecture"),
          createBodyP("The front-end client architecture features two main client targets: React Admin Web for landlords/staff and React Native (Expo) for mobile tenants. The presentation layer delegates navigation through React Router DOM and React Navigation, modularizes UI into Pages, Components, and Contexts, and communicates asynchronously via an Axios Service Layer."),

          // INSERT FIGURE 1.1.1 IMAGE
          ...createImageParagraph("Figure_1_1_1_Frontend_Architecture.png", 460, 630, "Figure 1.1.1. Front-end Architecture"),

          new Paragraph({ children: [new PageBreak()] }),

          createHeading3("1.1.2 Back-end Architecture"),
          createBodyP("The backend architecture strictly enforces a layered pipeline matching the SAMS Capstone standard: API Layer (Routes) -> Request Processing Layer (Middlewares, Validators) -> Application Layer (Controllers) -> Business Logic Layer (Services) -> Data Access Layer (Mongoose Models) -> MongoDB Database. Auxiliary logic (Jobs, Utils, Constants, Configs) is encapsulated in dedicated packages."),

          // INSERT FIGURE 1.1.2 IMAGE
          ...createImageParagraph("Figure_1_1_2_Backend_Architecture.png", 460, 570, "Figure 1.1.2. Back-end Architecture"),

          new Paragraph({ children: [new PageBreak()] }),

          createHeading2("1.2 Package Diagram"),
          createHeading3("1.2.1 Front-end package diagram"),
          createBodyP("The front-end package diagram defines the structural organization of both the Admin Web and Tenant Mobile clients, connected through shared Services, Context providers, and utility formatters:"),

          // INSERT FIGURE 1.2.1 IMAGE
          ...createImageParagraph("Figure_1_2_1_Frontend_Package_Diagram.png", 580, 395, "Figure 1.2.1. Front-end package diagram"),

          new Paragraph({ spacing: { before: 180 } }),

          createHeading3("1.2.2 Back-end package diagram"),
          createBodyP("The back-end package structure organizes components into 10 decoupled directories to optimize reusability, testability, and maintainability:"),

          // INSERT FIGURE 1.2.2 IMAGE
          ...createImageParagraph("Figure_1_2_2_Backend_Package_Diagram.png", 580, 448, "Figure 1.2.2. Back-end package diagram"),

          createBodyP("Package descriptions:"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            rows: [
              new TableRow({
                children: [
                  createCell("No", true, 8),
                  createCell("Package", true, 20),
                  createCell("Description", true, 72)
                ]
              }),
              new TableRow({
                children: [
                  createCell("01"), createCell("/config"), createCell("Contains configuration settings for the backend system such as environment variables, database connection setup, and VNPay merchant credentials.")
                ]
              }),
              new TableRow({
                children: [
                  createCell("02"), createCell("/constants"), createCell("Stores constant values and enumerations (User roles, Room status, Contract status, Invoice status) to avoid hardcoding values and improve maintainability.")
                ]
              }),
              new TableRow({
                children: [
                  createCell("03"), createCell("/controllers"), createCell("Handles incoming HTTP requests and responses. Controllers receive requests from routes, extract parameters, call services, and return unified JSON responses to the client.")
                ]
              }),
              new TableRow({
                children: [
                  createCell("04"), createCell("/jobs"), createCell("Contains scheduled background tasks (cron jobs) that run automatically at specified intervals to handle time-sensitive operations (expiring unpaid bookings, monthly invoice generation, payment reminders).")
                ]
              }),
              new TableRow({
                children: [
                  createCell("05"), createCell("/middlewares"), createCell("Contains middleware functions used in the request processing pipeline, such as JWT authentication, Role-Based Access Control (RBAC), error handling, and request logging.")
                ]
              }),
              new TableRow({
                children: [
                  createCell("06"), createCell("/models"), createCell("Defines data models and database schemas used in the application. These models represent collections stored in MongoDB and enforce data integrity constraints.")
                ]
              }),
              new TableRow({
                children: [
                  createCell("07"), createCell("/routes"), createCell("Defines API endpoints and maps incoming HTTP requests to corresponding controller functions.")
                ]
              }),
              new TableRow({
                children: [
                  createCell("08"), createCell("/service"), createCell("Implements the core business logic of the application. Services process data, interact with models, and provide reusable business operations for controllers.")
                ]
              }),
              new TableRow({
                children: [
                  createCell("09"), createCell("/utils"), createCell("Provides helper functions and reusable utilities that support different parts of the application (response formatters, cryptographic HMAC hashing, token utilities).")
                ]
              }),
              new TableRow({
                children: [
                  createCell("10"), createCell("/validators"), createCell("Contains validation logic to verify request data (phone format, price bounds, citizen ID length) before requests are processed by controllers.")
                ]
              })
            ]
          }),

          new Paragraph({ children: [new PageBreak()] }),

          // 2. Detailed Design
          createHeading1("2. Detailed Design"),

          // 2.1 Module 1: Khanh
          createHeading2("2.1 Module 1: Authentication & Tenant Management (Phạm Văn Khánh - 4 Sequence Diagrams)"),
          createBodyP("This module manages user identity, secure authentication using JSON Web Tokens, tenant KYC compliance (citizen ID verification), and staff account management."),
          
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

          createHeading3("2.1.5 Manage Staff Accounts Sequence Diagram"),
          createFigureBox("Figure 2.1.5. Manage Staff Accounts Sequence Diagram", "UC-M15_Manage_Staff_SequenceDiagram.drawio"),
          createBodyP("Flow Description: Landlord inputs staff details (fullName, phone, role: STAFF). System validates uniqueness, hashes temporary password with Bcrypt, creates user record, and updates staff roster."),

          new Paragraph({ children: [new PageBreak()] }),

          // 2.2 Module 2: Quang
          createHeading2("2.2 Module 2: Room & Search Management (Quang - Team Leader - 5 Sequence Diagrams)"),
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
          createHeading2("2.3 Module 3: Rental Contract Management (Đức - 4 Sequence Diagrams)"),
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

          createHeading3("2.3.4 Extend Contract Duration Sequence Diagram"),
          createFigureBox("Figure 2.3.4. Extend Contract Duration Sequence Diagram", "UC-M05_3_Extend_Contract_SequenceDiagram.drawio"),
          createBodyP("Flow Description: Landlord or tenant initiates extension. System asserts contract is ACTIVE and newEndDate > currentEndDate, updating lease expiration."),

          createHeading3("2.3.5 Terminate Contract & Refund Sequence Diagram"),
          createFigureBox("Figure 2.3.5. Terminate Contract Sequence Diagram", "UC-M05_4_Terminate_Contract_SequenceDiagram.drawio"),
          createBodyP("Flow Description: Landlord liquidates contract. Guard asserts all invoices are settled (UNPAID count = 0), sets contract to TERMINATED, refunds deposit, and releases room status back to AVAILABLE."),

          new Paragraph({ children: [new PageBreak()] }),

          // 2.4 Module 4: Manh
          createHeading2("2.4 Module 4: Utility, Invoice & VNPay Payment (Nguyễn Văn Mạnh - 4 Sequence Diagrams)"),
          createBodyP("Manages monthly utility meter readings, automated billing generation, and direct payment integration with the VNPay Payment Gateway."),

          createHeading3("2.4.1 Class Diagram - Billing & Payment Module"),
          createFigureBox("Figure 2.4.1. Class Diagram - Billing & Payment Module", "ClassDiagram_Billing_Module.drawio"),
          new Paragraph({ spacing: { before: 120, after: 120 } }),

          createHeading3("2.4.2 Record Utility Readings Sequence Diagram"),
          createFigureBox("Figure 2.4.2. Record Utility Readings Sequence Diagram", "UC-M07_Record_Utility_SequenceDiagram.drawio"),
          createBodyP("Flow Description: Staff inputs new electricity and water readings. Guard condition asserts newReading >= oldReading, computes net consumption, and records utility data for monthly invoicing."),

          createHeading3("2.4.3 Generate Monthly Invoices Sequence Diagram"),
          createFigureBox("Figure 2.4.3. Generate Monthly Invoices Sequence Diagram", "UC-M08_Generate_Invoice_SequenceDiagram.drawio"),
          createBodyP("Flow Description: Batch process calculates total room rent + electricity usage + water usage + WiFi/garbage fees across all active contracts, generating monthly invoices staged in UNPAID status."),

          createHeading3("2.4.4 Pay Invoice via VNPay Gateway Sequence Diagram"),
          createFigureBox("Figure 2.4.4. Pay Invoice via VNPay Sequence Diagram", "UC-M09_1_VNPay_Payment_SequenceDiagram.drawio"),
          createBodyP("Flow Description: Tenant initiates invoice payment. Service constructs VNPay query parameters, generates cryptographic HMAC-SHA512 checksum, and returns redirect URL to VNPay Sandbox."),

          createHeading3("2.4.5 VNPay IPN Callback & Webhook Sequence Diagram"),
          createFigureBox("Figure 2.4.5. VNPay IPN Webhook Sequence Diagram", "UC-M09_2_VNPay_IPN_Callback_SequenceDiagram.drawio"),
          createBodyP("Flow Description: Asynchronous server-to-server webhook from VNPay. System validates secure checksum. If response code is '00', payment record is created, invoice is set to PAID, and confirmation code 00 is returned."),

          new Paragraph({ children: [new PageBreak()] }),

          // 3. Database Design
          createHeading1("3. Database Design"),
          createHeading2("3.1 System Domain Model / Class Diagram"),
          createBodyP("The domain model captures the complete entity-relationship graph, cardinalities, foreign key mappings, and schema attributes across the Motel Management System:"),

          // INSERT FIGURE 3.1 IMAGE
          ...createImageParagraph("Figure_3_1_System_Domain_Class_Diagram.png", 590, 393, "Figure 3.1. System Domain Class Diagram"),

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
          createHeading1("4. Conclusion"),
          createBodyP("This Software Design Document constitutes the official technical architecture and detailed specifications of the Motel Management System (MMS). All system-level diagrams, context diagrams, and module-specific sequence diagrams are fully realized and ready for academic grading and individual defense.")
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
