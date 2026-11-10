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

function createBodyP(text, isItalic = false, isBold = false) {
  return new Paragraph({
    spacing: { before: 70, after: 70, line: 276 },
    children: [
      new TextRun({
        text: text,
        size: 22,
        font: "Calibri",
        italics: isItalic,
        bold: isBold
      })
    ]
  });
}

function createBulletP(bulletText, leadBold = "") {
  const runs = [];
  if (leadBold) {
    runs.push(new TextRun({ text: leadBold, bold: true, size: 22, font: "Calibri" }));
  }
  runs.push(new TextRun({ text: bulletText, size: 22, font: "Calibri" }));
  return new Paragraph({
    indent: { left: 400 },
    spacing: { before: 50, after: 50, line: 260 },
    children: runs
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
                spacing: { before: 140, after: 40 },
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
                spacing: { before: 30, after: 40 },
                children: [
                  new TextRun({
                    text: `Exported draw.io vector file: docs/diagrams/${diagramFileName}`,
                    size: 18,
                    color: "555555",
                    italics: true,
                    font: "Calibri"
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 30, after: 140 },
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
                  createCell("Assigned Subsystem", true, 40)
                ]
              }),
              new TableRow({
                children: [
                  createCell("Team Leader", false, 26, true),
                  createCell("Quang", false, 34, true),
                  createCell("Room & Search Management (5 Use Cases)", false, 40)
                ]
              }),
              new TableRow({
                children: [
                  createCell("Member 2", false, 26),
                  createCell("Phạm Văn Khánh", false, 34),
                  createCell("Authentication & Tenant KYC (4 Use Cases)", false, 40)
                ]
              }),
              new TableRow({
                children: [
                  createCell("Member 3", false, 26),
                  createCell("Đức", false, 34),
                  createCell("Rental Contract Management (4 Use Cases)", false, 40)
                ]
              }),
              new TableRow({
                children: [
                  createCell("Member 4", false, 26),
                  createCell("Nguyễn Văn Mạnh", false, 34),
                  createCell("Utility, Billing & VNPay Payment (4 Use Cases)", false, 40)
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
                  createCell("1.0"),
                  createCell("Completed SDD: High-resolution diagrams, 4 Module Class Diagrams, 17 Sequence Diagrams"),
                  createCell("Quang (Lead)"),
                  createCell("Instructor")
                ]
              })
            ]
          }),

          new Paragraph({ spacing: { before: 200 } }),

          // Table of Contents
          createHeading1("Table of Contents"),
          createBodyP("I. Record of Changes"),
          createBodyP("1. System Design"),
          createBulletP("1.0 System Context Diagram (DFD Level 0)"),
          createBulletP("1.1 System Architecture"),
          createBulletP("   1.1.1 Front-end Architecture"),
          createBulletP("   1.1.2 Back-end Architecture"),
          createBulletP("1.2 Package Diagram"),
          createBulletP("   1.2.1 Front-end package diagram"),
          createBulletP("   1.2.2 Back-end package diagram"),
          createBodyP("2. Detailed Design"),
          createBulletP("2.1 Authentication & Tenant Management (Phạm Văn Khánh)"),
          createBulletP("   2.1.1 Class Diagram"),
          createBulletP("   2.1.2 Sign In"),
          createBulletP("   2.1.3 Sign Up"),
          createBulletP("   2.1.4 Update Tenant Profile (KYC)"),
          createBulletP("   2.1.5 Manage Staff Accounts"),
          createBulletP("2.2 Room & Search Management (Quang)"),
          createBulletP("   2.2.1 Class Diagram"),
          createBulletP("   2.2.2 Search & Filter Rooms"),
          createBulletP("   2.2.3 Request Rental"),
          createBulletP("   2.2.4 Create Room"),
          createBulletP("   2.2.5 Update Room Info"),
          createBulletP("   2.2.6 Delete Room"),
          createBulletP("2.3 Rental Contract Management (Đức)"),
          createBulletP("   2.3.1 Class Diagram"),
          createBulletP("   2.3.2 Create Contract"),
          createBulletP("   2.3.3 Sign Contract"),
          createBulletP("   2.3.4 Extend Contract"),
          createBulletP("   2.3.5 Terminate Contract"),
          createBulletP("2.4 Utility, Billing & Payment (Nguyễn Văn Mạnh)"),
          createBulletP("   2.4.1 Class Diagram"),
          createBulletP("   2.4.2 Record Utility Readings"),
          createBulletP("   2.4.3 Generate Monthly Invoices"),
          createBulletP("   2.4.4 Pay Invoice via VNPay"),
          createBulletP("   2.4.5 VNPay IPN Callback"),
          createBodyP("3. Database Design"),
          createBulletP("3.1 System Domain Model / Class Diagram"),
          createBulletP("3.2 Collection Schemas & Data Dictionary"),

          new Paragraph({ children: [new PageBreak()] }),

          // 1. System Design
          createHeading1("1. System Design"),

          // 1.0 System Context Diagram (DFD Level 0) - Fully rewritten to match user diagram
          createHeading2("1.0 System Context Diagram (DFD Level 0)"),
          createBodyP("The System Context Diagram (Context-level Data Flow Diagram - DFD Level 0) models the highest-level operational boundary of the Motel Management System (Process 0: Motel Management Systems). It visualizes all information flows exchanged between the core software engine and the four primary external entities (terminators): Tenant, Manager, Staff, and the external Payment Gateway."),

          // INSERT FIGURE 1.0 CONTEXT DIAGRAM IMAGE (Exact diagram from user)
          ...createImageParagraph("Figure_1_0_System_Context_Diagram.png", 590, 330, "Figure 1.0. System Context Diagram (DFD Level 0)"),

          new Paragraph({ spacing: { before: 100 } }),
          createBodyP("Detailed Specification of External Entities and Data Flows:", false, true),

          createBodyP("1. Entity: Tenant (Khách thuê & Khách vãng lai)", false, true),
          createBulletP("Registration Information (full name, phone, email, initial password to establish credentials).", "• Inbound Flow: "),
          createBulletP("Login Information (authentication account and encrypted password).", "• Inbound Flow: "),
          createBulletP("Room Search Criteria (keywords, budget price range, surface area, and amenity filters).", "• Inbound Flow: "),
          createBulletP("Rental Request (reservation inquiry, expected move-in date, occupancy count).", "• Inbound Flow: "),
          createBulletP("Payment Request (authorization to settle rent and utility invoices via digital banking).", "• Inbound Flow: "),
          createBulletP("Maintenance Request (repair tickets regarding electrical, water, or furniture issues).", "• Inbound Flow: "),
          createBulletP("Feedback / Complaint (evaluations of room quality and operational service reviews).", "• Inbound Flow: "),
          createBulletP("Room Information (detailed room specifications, photo galleries, rental price, and real-time status).", "• Outbound Flow: "),
          createBulletP("Contract (legally compliant electronic lease agreements and digital signature prompts).", "• Outbound Flow: "),
          createBulletP("Invoice (itemized monthly billing for rent, electric usage, water usage, and fixed service fees).", "• Outbound Flow: "),
          createBulletP("Payment Result (instant digital transaction confirmations and balance updates).", "• Outbound Flow: "),
          createBulletP("Notifications (automated reminders for upcoming due dates, maintenance status, and lease expiry).", "• Outbound Flow: "),
          createBulletP("Maintenance Status (real-time progress updates on submitted repair tickets).", "• Outbound Flow: "),

          createBodyP("2. Entity: Manager / Landlord (Chủ trọ / Quản lý cấp cao)", false, true),
          createBulletP("Pricing Configuration (base rent per room type, electricity price per kWh, water rate per cubic meter).", "• Inbound Flow: "),
          createBulletP("Service Configuration (fixed fees including high-speed internet, environmental sanitation, security).", "• Inbound Flow: "),
          createBulletP("Contract Management (authorizing draft contracts, approving extensions, and confirming terminations).", "• Inbound Flow: "),
          createBulletP("Staff Management (registering employee accounts, defining operational roles, and revoking permissions).", "• Inbound Flow: "),
          createBulletP("Tenant Management (reviewing citizen KYC profiles, approving occupants, and resolving tenant disputes).", "• Inbound Flow: "),
          createBulletP("Report Requests (ad-hoc queries for financial metrics, occupancy trends, and debt tracking).", "• Inbound Flow: "),
          createBulletP("Revenue Reports (consolidated gross and net revenue analytics across monthly and yearly cycles).", "• Outbound Flow: "),
          createBulletP("Payment Reports (audit trails of settled transactions, pending payments, and overdue debts).", "• Outbound Flow: "),
          createBulletP("Occupancy Reports (utilization rates, available vs. rented inventory ratios).", "• Outbound Flow: "),
          createBulletP("Utility Reports (macro-level water and electricity consumption statistics).", "• Outbound Flow: "),
          createBulletP("Maintenance Reports (summary of facility health, open repairs, and maintenance expenditures).", "• Outbound Flow: "),
          createBulletP("Tenant Information (master directory of active and previous resident profiles).", "• Outbound Flow: "),

          createBodyP("3. Entity: Staff (Nhân viên vận hành)", false, true),
          createBulletP("Utility Readings (monthly physical meter numbers: old/new electric kWh and water cubic meters).", "• Inbound Flow: "),
          createBulletP("Payment Confirmation (recording manual over-the-counter cash payments collected on-site).", "• Inbound Flow: "),
          createBulletP("Maintenance Updates (updating repair status: 'IN_PROGRESS', 'RESOLVED', inspection notes).", "• Inbound Flow: "),
          createBulletP("Tenant Information (registering temporary residence metadata with local police).", "• Inbound Flow: "),
          createBulletP("Contract Information (submitting room handover checklists and key return confirmations).", "• Inbound Flow: "),
          createBulletP("Room List & Room Information (up-to-date inventory status for facility inspections).", "• Outbound Flow: "),
          createBulletP("Tenant List (resident directory with phone numbers and assigned room numbers).", "• Outbound Flow: "),
          createBulletP("Contract Information (active lease details for verifying tenant tenancy rights).", "• Outbound Flow: "),
          createBulletP("Invoice List & Payment Information (status of billed invoices to assist in debt collection).", "• Outbound Flow: "),
          createBulletP("Maintenance Requests (work orders dispatched to staff detailing room number and reported fault).", "• Outbound Flow: "),

          createBodyP("4. Entity: Payment Gateway (Cổng thanh toán điện tử - VNPay)", false, true),
          createBulletP("Payment Request (secure checkout order parameters: vnp_TmnCode, vnp_Amount, vnp_TxnRef, vnp_ReturnUrl).", "• Outbound Flow: "),
          createBulletP("Invoice ID & Amount (exact monetary settlement value in VND).", "• Outbound Flow: "),
          createBulletP("Transaction Information (order description, customer IP address, and HMAC-SHA512 secure hash).", "• Outbound Flow: "),
          createBulletP("Payment Status (transaction disposition: 'SUCCESS', 'FAILED', or 'CANCELLED').", "• Inbound Flow: "),
          createBulletP("Transaction ID (unique banking reference code issued by the national payment switch).", "• Inbound Flow: "),
          createBulletP("Payment Result (server-to-server IPN webhook payload with response code '00' confirming payment).", "• Inbound Flow: "),

          new Paragraph({ spacing: { before: 120 } }),
          createBodyP("Table 1.0. System Context Diagram Data Flow Matrix:", false, true),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            rows: [
              new TableRow({
                children: [
                  createCell("External Entity", true, 20),
                  createCell("Direction", true, 15),
                  createCell("Data Flow Name", true, 30),
                  createCell("Operational Objective", true, 35)
                ]
              }),
              new TableRow({
                children: [
                  createCell("Tenant", false, 20, true),
                  createCell("Tenant -> System"),
                  createCell("Registration / Login Info"),
                  createCell("Account authentication and secure session initialization")
                ]
              }),
              new TableRow({
                children: [
                  createCell("Tenant"),
                  createCell("Tenant -> System"),
                  createCell("Room Search & Rental Request"),
                  createCell("Browsing inventory and reserving available rental units")
                ]
              }),
              new TableRow({
                children: [
                  createCell("Tenant"),
                  createCell("System -> Tenant"),
                  createCell("Contract, Invoices, Payment Result"),
                  createCell("Online lease signing, monthly billing, and transaction receipts")
                ]
              }),
              new TableRow({
                children: [
                  createCell("Manager", false, 20, true),
                  createCell("Manager -> System"),
                  createCell("Pricing & Service Configurations"),
                  createCell("Setting rental prices, utility unit costs, and service rates")
                ]
              }),
              new TableRow({
                children: [
                  createCell("Manager"),
                  createCell("System -> Manager"),
                  createCell("Revenue & Occupancy Reports"),
                  createCell("Macro analytics on business performance and collection rates")
                ]
              }),
              new TableRow({
                children: [
                  createCell("Staff", false, 20, true),
                  createCell("Staff -> System"),
                  createCell("Utility Readings & Cash Confirm"),
                  createCell("Entering monthly meter numbers and reconciling cash payments")
                ]
              }),
              new TableRow({
                children: [
                  createCell("Staff"),
                  createCell("System -> Staff"),
                  createCell("Maintenance Requests & Room List"),
                  createCell("Dispatching facility repair tasks and tenant inspection lists")
                ]
              }),
              new TableRow({
                children: [
                  createCell("Payment Gateway", false, 20, true),
                  createCell("System -> Gateway"),
                  createCell("Payment Request & HMAC Hash"),
                  createCell("Redirecting tenant to secure sandbox gateway with order info")
                ]
              }),
              new TableRow({
                children: [
                  createCell("Payment Gateway"),
                  createCell("Gateway -> System"),
                  createCell("IPN Webhook & Payment Result"),
                  createCell("Confirming settlement to automatically transition invoice to PAID")
                ]
              })
            ]
          }),

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
          createHeading2("2.1 Authentication & Tenant Management"),
          createBodyP("Assigned Team Member: Phạm Văn Khánh", false, true),
          createBodyP("This module governs user onboarding, authentication via JSON Web Tokens, tenant KYC compliance (citizen ID verification), and operations staff account provisioning."),
          
          createHeading3("2.1.1 Class Diagram"),
          createFigureBox("Figure 2.1.1. Authentication & Tenant Management Class Diagram", "ClassDiagram_User_Module.drawio"),
          new Paragraph({ spacing: { before: 120, after: 120 } }),

          createHeading3("2.1.2 Sign In"),
          createFigureBox("Figure 2.1.2. Sign In Sequence Diagram", "UC-M01_2_Login_SequenceDiagram.drawio"),
          createBodyP("1. User enters phone/email and password on LoginScreen and clicks Sign In."),
          createBodyP("2. LoginScreen sends HTTP POST request to /api/auth/login with account and password."),
          createBodyP("3. auth.controller extracts credentials and invokes auth.service.authenticateUser()."),
          createBodyP("4. auth.service queries MongoDB: db.users.findOne({ $or: [{ phone }, { email }] })."),
          createBodyP("5. MongoDB returns user record with passwordHash, role, and isLocked status."),
          createBodyP("6. auth.service compares password using bcrypt.compare(password, user.passwordHash)."),
          createBodyP("7. If valid and not locked: auth.service signs JWT token with user ID and role, and returns user object."),
          createBodyP("8. auth.controller returns HTTP 200 OK with accessToken and user profile."),
          createBodyP("9. LoginScreen stores JWT in AsyncStorage / LocalStorage and redirects user to Dashboard by role."),
          createBodyP("Alternative Flow: If user not found, password incorrect, or account is locked, auth.service throws UnauthorizedError. auth.controller returns HTTP 401 Unauthorized, and UI displays error toast."),

          new Paragraph({ spacing: { before: 120 } }),
          createHeading3("2.1.3 Sign Up"),
          createFigureBox("Figure 2.1.3. Sign Up Sequence Diagram", "UC-M01_1_Register_SequenceDiagram.drawio"),
          createBodyP("1. Tenant fills full name, email, phone number, and password on RegisterScreen, then clicks Sign Up."),
          createBodyP("2. RegisterScreen dispatches HTTP POST /api/auth/register with user registration payload."),
          createBodyP("3. auth.controller receives request and delegates to auth.service.registerUser()."),
          createBodyP("4. auth.service executes db.users.findOne to check if phone or email is already registered."),
          createBodyP("5. If existing user found: throws ConflictError, returns HTTP 400 Bad Request, UI shows error alert."),
          createBodyP("6. If available: auth.service hashes password using bcrypt with salt rounds = 10."),
          createBodyP("7. auth.service creates new User document with role = 'TENANT' and persists to MongoDB."),
          createBodyP("8. auth.service signs JWT token, returns created user data and session token."),
          createBodyP("9. auth.controller returns HTTP 201 Created; RegisterScreen navigates tenant to Home Screen."),

          new Paragraph({ spacing: { before: 120 } }),
          createHeading3("2.1.4 Update Tenant Profile"),
          createFigureBox("Figure 2.1.4. Update Tenant Profile Sequence Diagram", "UC-M06_Update_Tenant_Profile_SequenceDiagram.drawio"),
          createBodyP("1. Tenant opens ProfileScreen, enters 12-digit Citizen ID (CCCD), hometown, and uploads ID photos."),
          createBodyP("2. ProfileScreen issues HTTP PUT /api/tenants/profile with Bearer Token and profileData."),
          createBodyP("3. tenant.controller verifies session token and invokes tenant.service.updateTenantProfile()."),
          createBodyP("4. tenant.service validates that citizen ID contains exactly 12 numeric digits."),
          createBodyP("5. If invalid: returns HTTP 400 Bad Request; UI displays validation error badge."),
          createBodyP("6. If valid: tenant.service updates MongoDB record: { cccd, hometown, isKycDone: true }."),
          createBodyP("7. tenant.controller returns HTTP 200 OK; UI displays verified KYC badge."),

          new Paragraph({ spacing: { before: 120 } }),
          createHeading3("2.1.5 Manage Staff Accounts"),
          createFigureBox("Figure 2.1.5. Manage Staff Accounts Sequence Diagram", "UC-M15_Manage_Staff_SequenceDiagram.drawio"),
          createBodyP("1. Landlord opens Staff Management view, inputs staff name, phone, email, and role: STAFF."),
          createBodyP("2. UI dispatches HTTP POST /api/tenants/staff with authorization header."),
          createBodyP("3. tenant.controller verifies caller has role LANDLORD or ADMIN."),
          createBodyP("4. auth.service checks phone uniqueness, hashes initial temporary password, and saves staff user."),
          createBodyP("5. System returns HTTP 201 Created; UI appends newly registered staff member to the staff table."),

          new Paragraph({ children: [new PageBreak()] }),

          // 2.2 Module 2: Quang
          createHeading2("2.2 Room & Search Management"),
          createBodyP("Assigned Team Leader: Quang", false, true),
          createBodyP("Responsible for room inventory management, multi-criteria search algorithms, rental request processing, and operational room state transitions."),

          createHeading3("2.2.1 Class Diagram"),
          createFigureBox("Figure 2.2.1. Room & Search Management Class Diagram", "ClassDiagram_Room_Module.drawio"),
          new Paragraph({ spacing: { before: 120, after: 120 } }),

          createHeading3("2.2.2 Search & Filter Rooms"),
          createFigureBox("Figure 2.2.2. Search & Filter Rooms Sequence Diagram", "UC-M02_Search_Room_SequenceDiagram.drawio"),
          createBodyP("1. User adjusts search criteria on SearchRoomScreen (keyword, minPrice, maxPrice, area, amenities) and clicks Search Rooms."),
          createBodyP("2. SearchRoomScreen sends HTTP GET /api/rooms/search with query string parameters."),
          createBodyP("3. room.controller delegates to room.service.filterRooms(queryCriteria)."),
          createBodyP("4. room.service constructs MongoDB query with regex keyword and price bounds, executing db.rooms.find().sort({ createdAt: -1 })."),
          createBodyP("5. MongoDB returns cursor of matching room documents."),
          createBodyP("6. If matching rooms found: room.controller returns HTTP 200 OK with rooms array, UI renders room cards."),
          createBodyP("7. If no rooms match: room.controller returns HTTP 200 OK with empty array, UI renders Empty State placeholder."),

          new Paragraph({ spacing: { before: 120 } }),
          createHeading3("2.2.3 Request Rental"),
          createFigureBox("Figure 2.2.3. Request Rental Sequence Diagram", "UC-M03_Request_Rental_SequenceDiagram.drawio"),
          createBodyP("1. Tenant views room details and clicks Request Rental / Hold Room."),
          createBodyP("2. UI displays modal form; tenant inputs full name, phone number, expected move-in date, and notes."),
          createBodyP("3. UI sends HTTP POST /api/rooms/:id/rental-request with tenant request payload."),
          createBodyP("4. room.controller validates input fields and queries room document from MongoDB."),
          createBodyP("5. If room status is not AVAILABLE (e.g. RENTED or MAINTENANCE): returns HTTP 400 Bad Request, UI shows warning toast."),
          createBodyP("6. If room is AVAILABLE: room.service creates RentalRequest document with status = 'PENDING'."),
          createBodyP("7. room.controller returns HTTP 201 Created; UI displays confirmation dialog with request tracking ID."),

          new Paragraph({ spacing: { before: 120 } }),
          createHeading3("2.2.4 Create Room"),
          createFigureBox("Figure 2.2.4. Create Room Sequence Diagram", "UC-M04_1_Create_Room_SequenceDiagram.drawio"),
          createBodyP("1. Landlord fills room number, type, monthly price, area, and amenity tags on Add Room screen."),
          createBodyP("2. UI sends HTTP POST /api/rooms with room payload."),
          createBodyP("3. room.controller validates input parameters (price > 0, area > 0, roomNumber not empty)."),
          createBodyP("4. room.service queries db.rooms.findOne({ roomNumber }) to ensure uniqueness."),
          createBodyP("5. If room number already exists: returns HTTP 409 Conflict; UI highlights duplicate input."),
          createBodyP("6. If room number is unique: persists new Room document with status = 'AVAILABLE'."),
          createBodyP("7. room.controller returns HTTP 201 Created; UI closes modal and updates room inventory table."),

          new Paragraph({ spacing: { before: 120 } }),
          createHeading3("2.2.5 Update Room Info"),
          createFigureBox("Figure 2.2.5. Update Room Info Sequence Diagram", "UC-M04_2_Update_Room_SequenceDiagram.drawio"),
          createBodyP("1. Landlord edits room details (price, description, amenities, images) on Edit Room modal."),
          createBodyP("2. UI sends HTTP PUT /api/rooms/:id with updated fields."),
          createBodyP("3. room.controller validates parameters and calls room.service.modifyRoom(id, payload)."),
          createBodyP("4. room.service updates document in MongoDB via db.rooms.findByIdAndUpdate()."),
          createBodyP("5. room.controller returns HTTP 200 OK; UI updates room row with updated information."),

          new Paragraph({ spacing: { before: 120 } }),
          createHeading3("2.2.6 Delete Room"),
          createFigureBox("Figure 2.2.6. Delete Room Sequence Diagram", "UC-M04_3_Delete_Room_SequenceDiagram.drawio"),
          createBodyP("1. Landlord clicks Delete Room icon for a specific room."),
          createBodyP("2. UI sends HTTP DELETE /api/rooms/:id."),
          createBodyP("3. room.controller queries active contracts in db.contracts.find({ roomId, status: 'ACTIVE' })."),
          createBodyP("4. Critical Business Guard: If active contracts exist or room.status is RENTED: system aborts deletion and returns HTTP 400 Bad Request ('Cannot delete room with active lease')."),
          createBodyP("5. If room is AVAILABLE and has no active contracts: executes db.rooms.deleteOne({ _id: id })."),
          createBodyP("6. room.controller returns HTTP 200 OK; UI removes room row from data table."),

          new Paragraph({ children: [new PageBreak()] }),

          // 2.3 Module 3: Duc
          createHeading2("2.3 Rental Contract Management"),
          createBodyP("Assigned Team Member: Đức", false, true),
          createBodyP("Governs legally binding leases, terms, digital signatures, lease extensions, and security deposit liquidations."),

          createHeading3("2.3.1 Class Diagram"),
          createFigureBox("Figure 2.3.1. Rental Contract Management Class Diagram", "ClassDiagram_Contract_Module.drawio"),
          new Paragraph({ spacing: { before: 120, after: 120 } }),

          createHeading3("2.3.2 Create Contract"),
          createFigureBox("Figure 2.3.2. Create Contract Sequence Diagram", "UC-M05_1_Create_Contract_SequenceDiagram.drawio"),
          createBodyP("1. Landlord selects an approved RentalRequest and inputs deposit amount, rental price, start date, and end date."),
          createBodyP("2. UI sends HTTP POST /api/contracts with contract creation payload."),
          createBodyP("3. contract.controller verifies room availability in db.rooms.findById(roomId)."),
          createBodyP("4. If room is already occupied or not available: returns HTTP 409 Conflict."),
          createBodyP("5. If available: creates new Contract document with status = 'PENDING_SIGN' and updates room.status = 'RENTED'."),
          createBodyP("6. contract.controller returns HTTP 201 Created; UI refreshes contract list."),

          new Paragraph({ spacing: { before: 120 } }),
          createHeading3("2.3.3 Sign Contract"),
          createFigureBox("Figure 2.3.3. Sign Contract Sequence Diagram", "UC-M05_2_Sign_Contract_SequenceDiagram.drawio"),
          createBodyP("1. Tenant opens lease contract on mobile app, reviews legal clauses, draws signature on touch canvas, and clicks Sign."),
          createBodyP("2. UI sends HTTP POST /api/contracts/:id/sign with signature base64 image data."),
          createBodyP("3. contract.controller verifies tenant identity matches contract.tenantId and contract.status is PENDING_SIGN."),
          createBodyP("4. contract.service saves signature URL, sets signedAt timestamp, and updates status to 'ACTIVE'."),
          createBodyP("5. contract.controller returns HTTP 200 OK; UI presents downloadable signed PDF contract."),

          new Paragraph({ spacing: { before: 120 } }),
          createHeading3("2.3.4 Extend Contract"),
          createFigureBox("Figure 2.3.4. Extend Contract Sequence Diagram", "UC-M05_3_Extend_Contract_SequenceDiagram.drawio"),
          createBodyP("1. Landlord or tenant selects an active lease and specifies a new extended end date (e.g. +6 or +12 months)."),
          createBodyP("2. UI sends HTTP PUT /api/contracts/:id/extend with newEndDate."),
          createBodyP("3. contract.service verifies contract is currently ACTIVE and newEndDate is after current endDate."),
          createBodyP("4. If invalid date: returns HTTP 400 Bad Request; UI displays date picker error toast."),
          createBodyP("5. If valid: updates contract.endDate in MongoDB and logs extension addendum."),
          createBodyP("6. contract.controller returns HTTP 200 OK; UI updates contract expiration badge."),

          new Paragraph({ spacing: { before: 120 } }),
          createHeading3("2.3.5 Terminate Contract"),
          createFigureBox("Figure 2.3.5. Terminate Contract Sequence Diagram", "UC-M05_4_Terminate_Contract_SequenceDiagram.drawio"),
          createBodyP("1. Landlord selects contract to terminate, enters check-out inspection notes and deposit refund amount."),
          createBodyP("2. UI sends HTTP POST /api/contracts/:id/terminate with refundAmount and reason."),
          createBodyP("3. contract.service queries db.invoices.find({ contractId, status: 'UNPAID' })."),
          createBodyP("4. Guard Condition: If unpaid invoices remain: returns HTTP 409 Conflict ('Cannot terminate lease with unpaid debt')."),
          createBodyP("5. If all invoices settled: sets contract.status = 'TERMINATED' and restores room.status = 'AVAILABLE'."),
          createBodyP("6. contract.controller returns HTTP 200 OK; UI updates contract status and frees room for new tenants."),

          new Paragraph({ children: [new PageBreak()] }),

          // 2.4 Module 4: Manh
          createHeading2("2.4 Utility, Billing & Payment Management"),
          createBodyP("Assigned Team Member: Nguyễn Văn Mạnh", false, true),
          createBodyP("Manages monthly utility meter recordings, automated billing calculation, and direct payment integration with the VNPay Gateway."),

          createHeading3("2.4.1 Class Diagram"),
          createFigureBox("Figure 2.4.1. Utility, Billing & Payment Class Diagram", "ClassDiagram_Billing_Module.drawio"),
          new Paragraph({ spacing: { before: 120, after: 120 } }),

          createHeading3("2.4.2 Record Utility Readings"),
          createFigureBox("Figure 2.4.2. Record Utility Readings Sequence Diagram", "UC-M07_Record_Utility_SequenceDiagram.drawio"),
          createBodyP("1. Staff selects room, billing month, and inputs new electricity and water meter indicators."),
          createBodyP("2. UI sends HTTP POST /api/utilities with roomId, month, newElec, and newWater."),
          createBodyP("3. utility.service queries previous month reading to obtain oldElec and oldWater."),
          createBodyP("4. Guard Condition: If newElec < oldElec or newWater < oldWater: returns HTTP 400 Bad Request."),
          createBodyP("5. If valid: calculates electricUsage and waterUsage, and persists UtilityReading document."),
          createBodyP("6. utility.controller returns HTTP 201 Created; UI updates reading table with green success badge."),

          new Paragraph({ spacing: { before: 120 } }),
          createHeading3("2.4.3 Generate Monthly Invoices"),
          createFigureBox("Figure 2.4.3. Generate Monthly Invoices Sequence Diagram", "UC-M08_Generate_Invoice_SequenceDiagram.drawio"),
          createBodyP("1. Landlord selects billing cycle (e.g. 2026-11) and clicks Generate Invoices."),
          createBodyP("2. UI dispatches HTTP POST /api/invoices/generate with month parameter."),
          createBodyP("3. invoice.service queries active contracts and matching utility reading documents."),
          createBodyP("4. If utility readings are missing for any room: returns HTTP 400 Bad Request; UI alerts staff to input readings."),
          createBodyP("5. If readings complete: service calculates: total = roomAmount + (electricUsage * price) + (waterUsage * price) + internet + garbage."),
          createBodyP("6. invoice.service executes db.invoices.insertMany() with status = 'UNPAID'."),
          createBodyP("7. invoice.controller returns HTTP 201 Created; UI displays generated invoice batch."),

          new Paragraph({ spacing: { before: 120 } }),
          createHeading3("2.4.4 Pay Invoice via VNPay"),
          createFigureBox("Figure 2.4.4. Pay Invoice via VNPay Sequence Diagram", "UC-M09_1_VNPay_Payment_SequenceDiagram.drawio"),
          createBodyP("1. Tenant views unpaid invoice and clicks Pay via VNPay."),
          createBodyP("2. UI sends HTTP POST /api/payments/create-vnpay-url with invoiceId and bankCode (e.g. 'NCB')."),
          createBodyP("3. payment.service checks invoice.status === 'UNPAID'. If already paid: returns HTTP 400 Bad Request."),
          createBodyP("4. payment.service constructs VNPay query parameters and generates HMAC-SHA512 secure checksum using vnp_HashSecret."),
          createBodyP("5. payment.controller returns HTTP 200 OK with paymentUrl; UI redirects browser/mobile webview to VNPay portal."),

          new Paragraph({ spacing: { before: 120 } }),
          createHeading3("2.4.5 VNPay IPN Callback"),
          createFigureBox("Figure 2.4.5. VNPay IPN Webhook Sequence Diagram", "UC-M09_2_VNPay_IPN_Callback_SequenceDiagram.drawio"),
          createBodyP("1. VNPay Server issues server-to-server HTTP GET to /api/payments/vnpay-ipn with transaction parameters and vnp_SecureHash."),
          createBodyP("2. payment.service validates HMAC-SHA512 checksum using hash secret key."),
          createBodyP("3. If checksum invalid: returns HTTP 200 with { RspCode: '97', Message: 'Invalid Checksum' }."),
          createBodyP("4. If checksum valid and vnp_ResponseCode === '00': persists PaymentTransaction document in MongoDB."),
          createBodyP("5. payment.service updates invoice.status = 'PAID' and sets paidAt timestamp."),
          createBodyP("6. payment.controller responds to VNPay with HTTP 200 { RspCode: '00', Message: 'Success' }."),

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
