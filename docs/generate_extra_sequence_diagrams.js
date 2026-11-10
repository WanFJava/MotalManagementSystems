const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, 'diagrams'),
  'C:\\Users\\nguye\\Downloads'
];

targetDirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function createDiagramXml(config) {
  const { name, id, width = 1400, height = 1450, lifelines, bars, messages, frames, dividers, guards } = config;

  let xml = `<mxfile host="app.diagrams.net">
  <diagram name="${name}" id="${id}">
    <mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${width}" pageHeight="${height}" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
`;

  // 1. Lifelines
  lifelines.forEach(lf => {
    const isActor = lf.isActor;
    const style = isActor
      ? `shape=umlLifeline;participant=umlActor;perimeter=lifelinePerimeter;whiteSpace=nowrap;html=1;container=1;collapsible=0;recursiveResize=0;verticalAlign=top;spacingTop=52;outlineConnect=0;size=50;fontStyle=1;`
      : `shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;`;
    xml += `        <mxCell id="${lf.id}" value="${lf.val}" style="${style}" vertex="1" parent="1"><mxGeometry x="${lf.x}" y="40" width="${lf.w}" height="${lf.h || 1350}" as="geometry"/></mxCell>\n`;
  });

  // Map bars for lookup
  const barMap = {};
  bars.forEach(b => {
    barMap[b.id] = b;
    xml += `        <mxCell id="${b.id}" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="${b.parent}"><mxGeometry x="${b.x}" y="${b.y}" width="12" height="${b.h}" as="geometry"/></mxCell>\n`;
  });

  // 3. Frames (alt)
  (frames || []).forEach(f => {
    xml += `        <mxCell id="${f.id}" value="${f.val || 'alt'}" style="shape=umlFrame;whiteSpace=wrap;html=1;pointerEvents=0;width=40;height=20;" vertex="1" parent="1"><mxGeometry x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" as="geometry"/></mxCell>\n`;
  });

  // 4. Dividers (dashed lines for alt)
  (dividers || []).forEach(d => {
    xml += `        <mxCell id="${d.id}" value="" style="endArrow=none;dashed=1;html=1;rounded=0;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><mxPoint x="${d.x1}" y="${d.y}" as="sourcePoint"/><mxPoint x="${d.x2}" y="${d.y}" as="targetPoint"/></mxGeometry></mxCell>\n`;
  });

  // 5. Guards (text)
  (guards || []).forEach(g => {
    xml += `        <mxCell id="${g.id}" value="${g.val}" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1"><mxGeometry x="${g.x}" y="${g.y}" width="${g.w || 250}" height="20" as="geometry"/></mxCell>\n`;
  });

  // 6. Messages
  messages.forEach(m => {
    const fromBar = barMap[m.from];
    const toBar = barMap[m.to];
    const isSelf = m.type === 'self';
    const isReturn = m.type === 'return';

    if (isSelf) {
      xml += `        <mxCell id="${m.id}" value="${m.val}" style="html=1;verticalAlign=bottom;endArrow=block;edgeStyle=orthogonalEdgeStyle;rounded=0;" edge="1" parent="1" source="${m.from}" target="${m.from}"><mxGeometry relative="1" as="geometry"><mxPoint as="offset"/><Array as="points"><mxPoint x="${fromBar.xCenter + 30}" y="${m.y}"/><mxPoint x="${fromBar.xCenter + 30}" y="${m.y + 25}"/></Array><mxPoint x="${fromBar.xCenter + 6}" y="${m.y}" as="sourcePoint"/><mxPoint x="${fromBar.xCenter + 6}" y="${m.y + 25}" as="targetPoint"/></mxGeometry></mxCell>\n`;
    } else {
      const isForward = fromBar.xCenter < toBar.xCenter;
      const exitX = isForward ? '1' : '0';
      const entryX = isForward ? '0' : '1';
      const exitY = Math.max(0.01, Math.min(0.99, (m.y - fromBar.y) / fromBar.h)).toFixed(3);
      const entryY = Math.max(0.01, Math.min(0.99, (m.y - toBar.y) / toBar.h)).toFixed(3);

      const style = isReturn
        ? `html=1;verticalAlign=bottom;endArrow=open;dashed=1;endSize=8;exitX=${exitX};exitY=${exitY};entryX=${entryX};entryY=${entryY};rounded=0;`
        : `html=1;verticalAlign=bottom;endArrow=block;exitX=${exitX};exitY=${exitY};entryX=${entryX};entryY=${entryY};rounded=0;`;

      xml += `        <mxCell id="${m.id}" value="${m.val}" style="${style}" edge="1" parent="1" source="${m.from}" target="${m.to}"><mxGeometry relative="1" as="geometry"><mxPoint as="offset"/></mxGeometry></mxCell>\n`;
    }
  });

  xml += `      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

  return xml;
}

// -------------------------------------------------------------
// EXTRA 1 (KHANH - 4th): UC-M15 Manage Staff Accounts
// -------------------------------------------------------------
const ucM15Config = {
  name: 'UC-M15 Manage Staff Accounts',
  id: 'uc_m15_staff',
  lifelines: [
    { id: 'lf_l', val: 'Landlord (Admin)', isActor: true, x: 50, w: 90, h: 950 },
    { id: 'lf_ui', val: '&lt;&lt;Boundary&gt;&gt;&lt;br&gt;StaffManageModal', x: 230, w: 140, h: 950 },
    { id: 'lf_c', val: '&lt;&lt;Controller&gt;&gt;&lt;br&gt;tenant.controller', x: 470, w: 150, h: 950 },
    { id: 'lf_s', val: '&lt;&lt;Service&gt;&gt;&lt;br&gt;auth.service', x: 720, w: 150, h: 950 },
    { id: 'lf_db', val: '&lt;&lt;Database&gt;&gt;&lt;br&gt;MongoDB', x: 1050, w: 120, h: 950 }
  ],
  bars: [
    { id: 'bar_L_0', parent: 'lf_l', x: 39, y: 80, h: 120, xCenter: 95 },
    { id: 'bar_UI_0', parent: 'lf_ui', x: 64, y: 80, h: 810, xCenter: 300 },
    { id: 'bar_C_0', parent: 'lf_c', x: 69, y: 170, h: 680, xCenter: 545 },
    { id: 'bar_S_0', parent: 'lf_s', x: 69, y: 210, h: 610, xCenter: 795 },
    { id: 'bar_DB_0', parent: 'lf_db', x: 54, y: 260, h: 70, xCenter: 1110 },
    { id: 'bar_DB_1', parent: 'lf_db', x: 54, y: 550, h: 70, xCenter: 1110 }
  ],
  frames: [
    { id: 'alt_staff', val: 'alt', x: 40, y: 370, w: 1150, h: 420 }
  ],
  dividers: [
    { id: 'div_staff', x1: 40, x2: 1190, y: 490 }
  ],
  guards: [
    { id: 'guard_dup', val: '[existingStaff !== null (phone already used)]', x: 140, y: 370, w: 320 },
    { id: 'guard_ok', val: '[phone available &amp;&amp; caller is Landlord]', x: 140, y: 492, w: 300 }
  ],
  messages: [
    { id: 'msg_0', from: 'bar_L_0', to: 'bar_UI_0', y: 100, val: 'fill staff name, phone, email, initial password &amp; role: STAFF', type: 'call' },
    { id: 'msg_1', from: 'bar_L_0', to: 'bar_UI_0', y: 140, val: 'click &quot;Create Staff Account&quot;', type: 'call' },
    { id: 'msg_2', from: 'bar_UI_0', to: 'bar_C_0', y: 180, val: 'POST /api/tenants/staff (Authorization: Bearer Token, Body: staffData)', type: 'call' },
    { id: 'msg_3', from: 'bar_C_0', to: 'bar_S_0', y: 220, val: 'createStaffUser(staffData, landlordId)', type: 'call' },
    { id: 'msg_4', from: 'bar_S_0', to: 'bar_DB_0', y: 265, val: 'db.users.findOne({ phone: staffData.phone })', type: 'call' },
    { id: 'msg_5', from: 'bar_DB_0', to: 'bar_S_0', y: 315, val: 'existing record / null', type: 'return' },
    // Alt branch 1: Duplicate
    { id: 'msg_6', from: 'bar_S_0', to: 'bar_C_0', y: 400, val: 'throw ConflictError(&quot;Staff phone number already registered&quot;)', type: 'return' },
    { id: 'msg_7', from: 'bar_C_0', to: 'bar_UI_0', y: 435, val: '409 Conflict ({ success: false, message })', type: 'return' },
    { id: 'msg_8', from: 'bar_UI_0', to: 'bar_L_0', y: 465, val: 'show error popup on form', type: 'return' },
    // Alt branch 2: Success
    { id: 'msg_9', from: 'bar_S_0', to: 'bar_S_0', y: 520, val: 'bcrypt.hash(password, 10)', type: 'self' },
    { id: 'msg_10', from: 'bar_S_0', to: 'bar_DB_1', y: 560, val: 'db.users.insertOne({ fullName, phone, role: &#39;STAFF&#39;, ... })', type: 'call' },
    { id: 'msg_11', from: 'bar_DB_1', to: 'bar_S_0', y: 615, val: 'inserted staff document', type: 'return' },
    { id: 'msg_12', from: 'bar_S_0', to: 'bar_C_0', y: 660, val: 'created staff instance', type: 'return' },
    { id: 'msg_13', from: 'bar_C_0', to: 'bar_UI_0', y: 700, val: '201 Created ({ success: true, message: &quot;Staff created&quot;, data })', type: 'return' },
    { id: 'msg_14', from: 'bar_UI_0', to: 'bar_L_0', y: 740, val: 'close modal &amp; append new staff to Staff Table', type: 'return' }
  ]
};

// -------------------------------------------------------------
// EXTRA 2 (DUC - 3rd): UC-M05.3 Extend Contract Duration
// -------------------------------------------------------------
const ucM05_3Config = {
  name: 'UC-M05.3 Extend Contract Duration',
  id: 'uc_m05_3_extend',
  lifelines: [
    { id: 'lf_l', val: 'Landlord / Staff', isActor: true, x: 50, w: 90, h: 900 },
    { id: 'lf_ui', val: '&lt;&lt;Boundary&gt;&gt;&lt;br&gt;ExtendContractModal', x: 230, w: 140, h: 900 },
    { id: 'lf_c', val: '&lt;&lt;Controller&gt;&gt;&lt;br&gt;contract.controller', x: 470, w: 150, h: 900 },
    { id: 'lf_s', val: '&lt;&lt;Service&gt;&gt;&lt;br&gt;contract.service', x: 720, w: 150, h: 900 },
    { id: 'lf_db', val: '&lt;&lt;Database&gt;&gt;&lt;br&gt;MongoDB', x: 1050, w: 120, h: 900 }
  ],
  bars: [
    { id: 'bar_L_0', parent: 'lf_l', x: 39, y: 80, h: 120, xCenter: 95 },
    { id: 'bar_UI_0', parent: 'lf_ui', x: 64, y: 80, h: 760, xCenter: 300 },
    { id: 'bar_C_0', parent: 'lf_c', x: 69, y: 170, h: 630, xCenter: 545 },
    { id: 'bar_S_0', parent: 'lf_s', x: 69, y: 210, h: 560, xCenter: 795 },
    { id: 'bar_DB_0', parent: 'lf_db', x: 54, y: 260, h: 70, xCenter: 1110 },
    { id: 'bar_DB_1', parent: 'lf_db', x: 54, y: 540, h: 70, xCenter: 1110 }
  ],
  frames: [
    { id: 'alt_ext', val: 'alt', x: 40, y: 360, w: 1150, h: 420 }
  ],
  dividers: [
    { id: 'div_ext', x1: 40, x2: 1190, y: 480 }
  ],
  guards: [
    { id: 'guard_inv_date', val: '[newEndDate &lt;= contract.endDate || contract.status !== &#39;ACTIVE&#39;]', x: 140, y: 360, w: 380 },
    { id: 'guard_valid_ext', val: '[newEndDate &gt; contract.endDate &amp;&amp; contract.status === &#39;ACTIVE&#39;]', x: 140, y: 482, w: 380 }
  ],
  messages: [
    { id: 'msg_0', from: 'bar_L_0', to: 'bar_UI_0', y: 100, val: 'select contract, pick new extension end date (+6 or +12 months)', type: 'call' },
    { id: 'msg_1', from: 'bar_L_0', to: 'bar_UI_0', y: 140, val: 'click &quot;Confirm Extension&quot;', type: 'call' },
    { id: 'msg_2', from: 'bar_UI_0', to: 'bar_C_0', y: 180, val: 'PUT /api/contracts/:id/extend (newEndDate, extensionTerms)', type: 'call' },
    { id: 'msg_3', from: 'bar_C_0', to: 'bar_S_0', y: 220, val: 'extendContractDuration(contractId, newEndDate)', type: 'call' },
    { id: 'msg_4', from: 'bar_S_0', to: 'bar_DB_0', y: 265, val: 'db.contracts.findById(contractId)', type: 'call' },
    { id: 'msg_5', from: 'bar_DB_0', to: 'bar_S_0', y: 315, val: 'current contract document', type: 'return' },
    // Alt branch 1: Invalid
    { id: 'msg_6', from: 'bar_S_0', to: 'bar_C_0', y: 390, val: 'throw BadRequestError(&quot;New end date must be after current expiration&quot;)', type: 'return' },
    { id: 'msg_7', from: 'bar_C_0', to: 'bar_UI_0', y: 425, val: '400 Bad Request ({ success: false, message })', type: 'return' },
    { id: 'msg_8', from: 'bar_UI_0', to: 'bar_L_0', y: 455, val: 'show date picker error toast', type: 'return' },
    // Alt branch 2: Valid
    { id: 'msg_9', from: 'bar_S_0', to: 'bar_DB_1', y: 540, val: 'db.contracts.updateOne({ _id: contractId }, { $set: { endDate: newEndDate } })', type: 'call' },
    { id: 'msg_10', from: 'bar_DB_1', to: 'bar_S_0', y: 595, val: 'writeResult ({ modifiedCount: 1 })', type: 'return' },
    { id: 'msg_11', from: 'bar_S_0', to: 'bar_C_0', y: 640, val: 'updated contract document', type: 'return' },
    { id: 'msg_12', from: 'bar_C_0', to: 'bar_UI_0', y: 680, val: '200 OK ({ success: true, message: &quot;Contract extended&quot;, data })', type: 'return' },
    { id: 'msg_13', from: 'bar_UI_0', to: 'bar_L_0', y: 720, val: 'close modal &amp; update contract expiration badge', type: 'return' }
  ]
};

// -------------------------------------------------------------
// EXTRA 3 (DUC - 4th): UC-M05.4 Terminate Contract & Refund
// -------------------------------------------------------------
const ucM05_4Config = {
  name: 'UC-M05.4 Terminate Contract & Refund',
  id: 'uc_m05_4_term',
  lifelines: [
    { id: 'lf_l', val: 'Landlord / Staff', isActor: true, x: 50, w: 90, h: 950 },
    { id: 'lf_ui', val: '&lt;&lt;Boundary&gt;&gt;&lt;br&gt;TerminateContractModal', x: 230, w: 140, h: 950 },
    { id: 'lf_c', val: '&lt;&lt;Controller&gt;&gt;&lt;br&gt;contract.controller', x: 470, w: 150, h: 950 },
    { id: 'lf_s', val: '&lt;&lt;Service&gt;&gt;&lt;br&gt;contract.service', x: 720, w: 150, h: 950 },
    { id: 'lf_db', val: '&lt;&lt;Database&gt;&gt;&lt;br&gt;MongoDB', x: 1050, w: 120, h: 950 }
  ],
  bars: [
    { id: 'bar_L_0', parent: 'lf_l', x: 39, y: 80, h: 120, xCenter: 95 },
    { id: 'bar_UI_0', parent: 'lf_ui', x: 64, y: 80, h: 810, xCenter: 300 },
    { id: 'bar_C_0', parent: 'lf_c', x: 69, y: 170, h: 680, xCenter: 545 },
    { id: 'bar_S_0', parent: 'lf_s', x: 69, y: 210, h: 610, xCenter: 795 },
    { id: 'bar_DB_0', parent: 'lf_db', x: 54, y: 260, h: 70, xCenter: 1110 },
    { id: 'bar_DB_1', parent: 'lf_db', x: 54, y: 550, h: 120, xCenter: 1110 }
  ],
  frames: [
    { id: 'alt_term', val: 'alt', x: 40, y: 360, w: 1150, h: 470 }
  ],
  dividers: [
    { id: 'div_term', x1: 40, x2: 1190, y: 480 }
  ],
  guards: [
    { id: 'guard_unpaid_debt', val: '[hasUnpaidInvoices === true]', x: 140, y: 360, w: 260 },
    { id: 'guard_all_clear', val: '[allInvoicesSettled === true]', x: 140, y: 482, w: 260 }
  ],
  messages: [
    { id: 'msg_0', from: 'bar_L_0', to: 'bar_UI_0', y: 100, val: 'select contract, input termination reason &amp; deposit refund amount', type: 'call' },
    { id: 'msg_1', from: 'bar_L_0', to: 'bar_UI_0', y: 140, val: 'click &quot;Liquidate &amp; Terminate Contract&quot;', type: 'call' },
    { id: 'msg_2', from: 'bar_UI_0', to: 'bar_C_0', y: 180, val: 'POST /api/contracts/:id/terminate (refundAmount, reason)', type: 'call' },
    { id: 'msg_3', from: 'bar_C_0', to: 'bar_S_0', y: 220, val: 'terminateContract(contractId, refundAmount, reason)', type: 'call' },
    { id: 'msg_4', from: 'bar_S_0', to: 'bar_DB_0', y: 265, val: 'db.invoices.find({ contractId, status: &#39;UNPAID&#39; })', type: 'call' },
    { id: 'msg_5', from: 'bar_DB_0', to: 'bar_S_0', y: 315, val: 'unpaid invoice list', type: 'return' },
    // Alt branch 1: Unpaid invoices
    { id: 'msg_6', from: 'bar_S_0', to: 'bar_C_0', y: 390, val: 'throw ConflictError(&quot;Cannot terminate: Outstanding unpaid invoices exist&quot;)', type: 'return' },
    { id: 'msg_7', from: 'bar_C_0', to: 'bar_UI_0', y: 425, val: '409 Conflict ({ success: false, message })', type: 'return' },
    { id: 'msg_8', from: 'bar_UI_0', to: 'bar_L_0', y: 455, val: 'show debt settlement warning modal', type: 'return' },
    // Alt branch 2: All clear
    { id: 'msg_9', from: 'bar_S_0', to: 'bar_DB_1', y: 550, val: 'db.contracts.updateOne({ _id: contractId }, { $set: { status: &#39;TERMINATED&#39; } })', type: 'call' },
    { id: 'msg_10', from: 'bar_DB_1', to: 'bar_S_0', y: 590, val: 'contract set to TERMINATED', type: 'return' },
    { id: 'msg_11', from: 'bar_S_0', to: 'bar_DB_1', y: 620, val: 'db.rooms.updateOne({ _id: roomId }, { $set: { status: &#39;AVAILABLE&#39; } })', type: 'call' },
    { id: 'msg_12', from: 'bar_DB_1', to: 'bar_S_0', y: 650, val: 'room restored to AVAILABLE', type: 'return' },
    { id: 'msg_13', from: 'bar_S_0', to: 'bar_C_0', y: 680, val: 'termination receipt &amp; contract object', type: 'return' },
    { id: 'msg_14', from: 'bar_C_0', to: 'bar_UI_0', y: 710, val: '200 OK ({ success: true, message: &quot;Contract liquidated&quot; })', type: 'return' },
    { id: 'msg_15', from: 'bar_UI_0', to: 'bar_L_0', y: 745, val: 'refresh table: contract marked TERMINATED, room AVAILABLE', type: 'return' }
  ]
};

// -------------------------------------------------------------
// EXTRA 4 (MANH - 2nd): UC-M08 Generate Monthly Invoices
// -------------------------------------------------------------
const ucM08Config = {
  name: 'UC-M08 Generate Monthly Invoices',
  id: 'uc_m08_inv_gen',
  lifelines: [
    { id: 'lf_l', val: 'Landlord / Staff', isActor: true, x: 50, w: 90, h: 950 },
    { id: 'lf_ui', val: '&lt;&lt;Boundary&gt;&gt;&lt;br&gt;InvoiceGenModal', x: 230, w: 140, h: 950 },
    { id: 'lf_c', val: '&lt;&lt;Controller&gt;&gt;&lt;br&gt;invoice.controller', x: 470, w: 150, h: 950 },
    { id: 'lf_s', val: '&lt;&lt;Service&gt;&gt;&lt;br&gt;invoice.service', x: 720, w: 150, h: 950 },
    { id: 'lf_db', val: '&lt;&lt;Database&gt;&gt;&lt;br&gt;MongoDB', x: 1050, w: 120, h: 950 }
  ],
  bars: [
    { id: 'bar_L_0', parent: 'lf_l', x: 39, y: 80, h: 120, xCenter: 95 },
    { id: 'bar_UI_0', parent: 'lf_ui', x: 64, y: 80, h: 810, xCenter: 300 },
    { id: 'bar_C_0', parent: 'lf_c', x: 69, y: 170, h: 680, xCenter: 545 },
    { id: 'bar_S_0', parent: 'lf_s', x: 69, y: 210, h: 610, xCenter: 795 },
    { id: 'bar_DB_0', parent: 'lf_db', x: 54, y: 260, h: 70, xCenter: 1110 },
    { id: 'bar_DB_1', parent: 'lf_db', x: 54, y: 550, h: 70, xCenter: 1110 }
  ],
  frames: [
    { id: 'alt_inv', val: 'alt', x: 40, y: 360, w: 1150, h: 420 }
  ],
  dividers: [
    { id: 'div_inv', x1: 40, x2: 1190, y: 480 }
  ],
  guards: [
    { id: 'guard_no_util', val: '[!utilityReading || missingMeter]', x: 140, y: 360, w: 260 },
    { id: 'guard_util_ok', val: '[utilityReading exists &amp;&amp; contract.status === &#39;ACTIVE&#39;]', x: 140, y: 482, w: 350 }
  ],
  messages: [
    { id: 'msg_0', from: 'bar_L_0', to: 'bar_UI_0', y: 100, val: 'select billing month (e.g. 2026-11), click &quot;Generate Invoices&quot;', type: 'call' },
    { id: 'msg_1', from: 'bar_L_0', to: 'bar_UI_0', y: 140, val: 'confirm batch generation', type: 'call' },
    { id: 'msg_2', from: 'bar_UI_0', to: 'bar_C_0', y: 180, val: 'POST /api/invoices/generate (month: &quot;2026-11&quot;)', type: 'call' },
    { id: 'msg_3', from: 'bar_C_0', to: 'bar_S_0', y: 220, val: 'generateMonthlyInvoices(month)', type: 'call' },
    { id: 'msg_4', from: 'bar_S_0', to: 'bar_DB_0', y: 265, val: 'db.utilities.find({ month }) &amp; db.contracts.find({ status: &#39;ACTIVE&#39; })', type: 'call' },
    { id: 'msg_5', from: 'bar_DB_0', to: 'bar_S_0', y: 315, val: 'active contracts &amp; utility records', type: 'return' },
    // Alt branch 1: Missing reading
    { id: 'msg_6', from: 'bar_S_0', to: 'bar_C_0', y: 390, val: 'throw BadRequestError(&quot;Cannot generate: Missing utility readings for month&quot;)', type: 'return' },
    { id: 'msg_7', from: 'bar_C_0', to: 'bar_UI_0', y: 425, val: '400 Bad Request ({ success: false, message })', type: 'return' },
    { id: 'msg_8', from: 'bar_UI_0', to: 'bar_L_0', y: 455, val: 'show error popup: &quot;Please record electricity/water first&quot;', type: 'return' },
    // Alt branch 2: Success
    { id: 'msg_9', from: 'bar_S_0', to: 'bar_S_0', y: 510, val: 'calculateTotal(rent + elecUsage*3500 + waterUsage*25000 + wifi + garbage)', type: 'self' },
    { id: 'msg_10', from: 'bar_S_0', to: 'bar_DB_1', y: 560, val: 'db.invoices.insertMany(invoiceDocs)', type: 'call' },
    { id: 'msg_11', from: 'bar_DB_1', to: 'bar_S_0', y: 615, val: 'inserted count result', type: 'return' },
    { id: 'msg_12', from: 'bar_S_0', to: 'bar_C_0', y: 660, val: 'generated invoices summary', type: 'return' },
    { id: 'msg_13', from: 'bar_C_0', to: 'bar_UI_0', y: 700, val: '201 Created ({ success: true, count: N, data: invoiceList })', type: 'return' },
    { id: 'msg_14', from: 'bar_UI_0', to: 'bar_L_0', y: 740, val: 'close modal &amp; display fresh monthly invoices with UNPAID badges', type: 'return' }
  ]
};

const extraDiagrams = [
  { file: 'UC-M15_Manage_Staff_SequenceDiagram.drawio', xml: createDiagramXml(ucM15Config) },
  { file: 'UC-M05_3_Extend_Contract_SequenceDiagram.drawio', xml: createDiagramXml(ucM05_3Config) },
  { file: 'UC-M05_4_Terminate_Contract_SequenceDiagram.drawio', xml: createDiagramXml(ucM05_4Config) },
  { file: 'UC-M08_Generate_Invoice_SequenceDiagram.drawio', xml: createDiagramXml(ucM08Config) }
];

extraDiagrams.forEach(d => {
  targetDirs.forEach(dir => {
    const dest = path.join(dir, d.file);
    fs.writeFileSync(dest, d.xml, 'utf8');
    console.log(`Generated: ${dest}`);
  });
});

console.log('All 4 extra sequence diagrams successfully created!');
