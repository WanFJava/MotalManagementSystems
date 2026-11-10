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
      const exitY = Math.max(0.01, Math.min(0.99, (m.y - fromBar.y) / fromBar.h)).toFixed(3);
      const entryY = Math.max(0.01, Math.min(0.99, (m.y + 25 - fromBar.y) / fromBar.h)).toFixed(3);
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
// MODULE 1 (KHANH): AUTH & TENANT MANAGEMENT
// -------------------------------------------------------------

// UC-M01.1: Register
const ucM01_1Config = {
  name: 'UC-M01.1 Register',
  id: 'uc_m01_1_reg',
  lifelines: [
    { id: 'lf_u', val: 'Tenant / User', isActor: true, x: 50, w: 90, h: 1050 },
    { id: 'lf_ui', val: '&lt;&lt;Boundary&gt;&gt;&lt;br&gt;RegisterScreen', x: 230, w: 140, h: 1050 },
    { id: 'lf_c', val: '&lt;&lt;Controller&gt;&gt;&lt;br&gt;auth.controller', x: 470, w: 150, h: 1050 },
    { id: 'lf_s', val: '&lt;&lt;Service&gt;&gt;&lt;br&gt;auth.service', x: 720, w: 150, h: 1050 },
    { id: 'lf_m', val: '&lt;&lt;Model&gt;&gt;&lt;br&gt;User', x: 960, w: 140, h: 1050 },
    { id: 'lf_db', val: '&lt;&lt;Database&gt;&gt;&lt;br&gt;MongoDB', x: 1180, w: 120, h: 1050 }
  ],
  bars: [
    { id: 'bar_U_0', parent: 'lf_u', x: 39, y: 80, h: 150, xCenter: 95 },
    { id: 'bar_UI_0', parent: 'lf_ui', x: 64, y: 80, h: 880, xCenter: 300 },
    { id: 'bar_C_0', parent: 'lf_c', x: 69, y: 200, h: 720, xCenter: 545 },
    { id: 'bar_S_0', parent: 'lf_s', x: 69, y: 250, h: 630, xCenter: 795 },
    { id: 'bar_DB_0', parent: 'lf_db', x: 54, y: 310, h: 70, xCenter: 1240 },
    { id: 'bar_M_0', parent: 'lf_m', x: 64, y: 650, h: 160, xCenter: 1030 },
    { id: 'bar_DB_1', parent: 'lf_db', x: 54, y: 720, h: 70, xCenter: 1240 }
  ],
  frames: [
    { id: 'alt_dup', val: 'alt', x: 40, y: 370, w: 1260, h: 580 }
  ],
  dividers: [
    { id: 'div_dup', x1: 40, x2: 1300, y: 490 }
  ],
  guards: [
    { id: 'guard_dup', val: '[existingUser !== null (phone or email already taken)]', x: 140, y: 370, w: 350 },
    { id: 'guard_avail', val: '[existingUser === null (credentials available)]', x: 140, y: 492, w: 320 }
  ],
  messages: [
    { id: 'msg_0', from: 'bar_U_0', to: 'bar_UI_0', y: 110, val: 'fill registration form (name, email, phone, password)', type: 'call' },
    { id: 'msg_1', from: 'bar_U_0', to: 'bar_UI_0', y: 170, val: 'click &quot;Sign Up&quot;', type: 'call' },
    { id: 'msg_2', from: 'bar_UI_0', to: 'bar_C_0', y: 210, val: 'POST /api/auth/register (name, email, phone, password)', type: 'call' },
    { id: 'msg_3', from: 'bar_C_0', to: 'bar_S_0', y: 255, val: 'registerUser({ name, email, phone, password })', type: 'call' },
    { id: 'msg_4', from: 'bar_S_0', to: 'bar_DB_0', y: 310, val: 'db.users.findOne({ $or: [{ phone }, { email }] })', type: 'call' },
    { id: 'msg_5', from: 'bar_DB_0', to: 'bar_S_0', y: 360, val: 'found existing user / null', type: 'return' },
    // Alt branch 1: Duplicated
    { id: 'msg_6', from: 'bar_S_0', to: 'bar_C_0', y: 400, val: 'throw Error(&quot;Phone or email already registered&quot;)', type: 'return' },
    { id: 'msg_7', from: 'bar_C_0', to: 'bar_UI_0', y: 430, val: '400 Bad Request ({ success: false, message })', type: 'return' },
    { id: 'msg_8', from: 'bar_UI_0', to: 'bar_U_0', y: 460, val: 'display error alert: &quot;Phone/email already in use&quot;', type: 'return' },
    // Alt branch 2: Available
    { id: 'msg_9', from: 'bar_S_0', to: 'bar_S_0', y: 530, val: 'bcrypt.hash(password, 10)', type: 'self' },
    { id: 'msg_10', from: 'bar_S_0', to: 'bar_M_0', y: 660, val: 'new User({ name, email, phone, passwordHash, role: &#39;TENANT&#39; })', type: 'call' },
    { id: 'msg_11', from: 'bar_M_0', to: 'bar_DB_1', y: 720, val: 'db.users.insertOne(newUserDoc)', type: 'call' },
    { id: 'msg_12', from: 'bar_DB_1', to: 'bar_M_0', y: 770, val: 'insert result (acknowledged: true)', type: 'return' },
    { id: 'msg_13', from: 'bar_M_0', to: 'bar_S_0', y: 795, val: 'created user document', type: 'return' },
    { id: 'msg_14', from: 'bar_S_0', to: 'bar_S_0', y: 820, val: 'jwt.sign({ userId, role }, JWT_SECRET)', type: 'self' },
    { id: 'msg_15', from: 'bar_S_0', to: 'bar_C_0', y: 865, val: '{ user, token }', type: 'return' },
    { id: 'msg_16', from: 'bar_C_0', to: 'bar_UI_0', y: 895, val: '201 Created ({ success: true, token, user })', type: 'return' },
    { id: 'msg_17', from: 'bar_UI_0', to: 'bar_U_0', y: 935, val: 'store token &amp; redirect to Home Screen', type: 'return' }
  ]
};

// UC-M01.2: Login
const ucM01_2Config = {
  name: 'UC-M01.2 Login',
  id: 'uc_m01_2_login',
  lifelines: [
    { id: 'lf_u', val: 'User (Any Role)', isActor: true, x: 50, w: 90, h: 950 },
    { id: 'lf_ui', val: '&lt;&lt;Boundary&gt;&gt;&lt;br&gt;LoginScreen', x: 230, w: 140, h: 950 },
    { id: 'lf_c', val: '&lt;&lt;Controller&gt;&gt;&lt;br&gt;auth.controller', x: 470, w: 150, h: 950 },
    { id: 'lf_s', val: '&lt;&lt;Service&gt;&gt;&lt;br&gt;auth.service', x: 720, w: 150, h: 950 },
    { id: 'lf_db', val: '&lt;&lt;Database&gt;&gt;&lt;br&gt;MongoDB', x: 1050, w: 120, h: 950 }
  ],
  bars: [
    { id: 'bar_U_0', parent: 'lf_u', x: 39, y: 80, h: 120, xCenter: 95 },
    { id: 'bar_UI_0', parent: 'lf_ui', x: 64, y: 80, h: 810, xCenter: 300 },
    { id: 'bar_C_0', parent: 'lf_c', x: 69, y: 180, h: 680, xCenter: 545 },
    { id: 'bar_S_0', parent: 'lf_s', x: 69, y: 220, h: 610, xCenter: 795 },
    { id: 'bar_DB_0', parent: 'lf_db', x: 54, y: 270, h: 70, xCenter: 1110 }
  ],
  frames: [
    { id: 'alt_auth', val: 'alt', x: 40, y: 390, w: 1150, h: 470 }
  ],
  dividers: [
    { id: 'div_auth', x1: 40, x2: 1190, y: 520 }
  ],
  guards: [
    { id: 'guard_invalid', val: '[!user || !passwordMatch || user.isLocked]', x: 140, y: 390, w: 320 },
    { id: 'guard_valid', val: '[user &amp;&amp; passwordMatch &amp;&amp; !user.isLocked]', x: 140, y: 522, w: 320 }
  ],
  messages: [
    { id: 'msg_0', from: 'bar_U_0', to: 'bar_UI_0', y: 100, val: 'enter phone/email &amp; password', type: 'call' },
    { id: 'msg_1', from: 'bar_U_0', to: 'bar_UI_0', y: 150, val: 'click &quot;Sign In&quot;', type: 'call' },
    { id: 'msg_2', from: 'bar_UI_0', to: 'bar_C_0', y: 190, val: 'POST /api/auth/login (account, password)', type: 'call' },
    { id: 'msg_3', from: 'bar_C_0', to: 'bar_S_0', y: 230, val: 'authenticateUser(account, password)', type: 'call' },
    { id: 'msg_4', from: 'bar_S_0', to: 'bar_DB_0', y: 275, val: 'db.users.findOne({ $or: [{ phone: account }, { email: account }] })', type: 'call' },
    { id: 'msg_5', from: 'bar_DB_0', to: 'bar_S_0', y: 325, val: 'user record (including passwordHash, role, status)', type: 'return' },
    { id: 'msg_6', from: 'bar_S_0', to: 'bar_S_0', y: 350, val: 'bcrypt.compare(password, user.passwordHash)', type: 'self' },
    // Alt branch 1: Invalid
    { id: 'msg_7', from: 'bar_S_0', to: 'bar_C_0', y: 420, val: 'throw UnauthorizedError(&quot;Invalid credentials or locked account&quot;)', type: 'return' },
    { id: 'msg_8', from: 'bar_C_0', to: 'bar_UI_0', y: 455, val: '401 Unauthorized ({ success: false, message })', type: 'return' },
    { id: 'msg_9', from: 'bar_UI_0', to: 'bar_U_0', y: 490, val: 'show error toast: &quot;Incorrect account or password&quot;', type: 'return' },
    // Alt branch 2: Valid
    { id: 'msg_10', from: 'bar_S_0', to: 'bar_S_0', y: 560, val: 'jwt.sign({ userId: user._id, role: user.role })', type: 'self' },
    { id: 'msg_11', from: 'bar_S_0', to: 'bar_C_0', y: 640, val: '{ user: sanitize(user), accessToken }', type: 'return' },
    { id: 'msg_12', from: 'bar_C_0', to: 'bar_UI_0', y: 680, val: '200 OK ({ success: true, token, user })', type: 'return' },
    { id: 'msg_13', from: 'bar_UI_0', to: 'bar_U_0', y: 730, val: 'save token to AsyncStorage/localStorage &amp; route to Dashboard by role', type: 'return' }
  ]
};

// UC-M06: Update Tenant Profile (KYC / CCCD)
const ucM06Config = {
  name: 'UC-M06 Update Tenant Profile',
  id: 'uc_m06_profile',
  lifelines: [
    { id: 'lf_t', val: 'Tenant', isActor: true, x: 50, w: 90, h: 900 },
    { id: 'lf_ui', val: '&lt;&lt;Boundary&gt;&gt;&lt;br&gt;ProfileScreen', x: 230, w: 140, h: 900 },
    { id: 'lf_c', val: '&lt;&lt;Controller&gt;&gt;&lt;br&gt;tenant.controller', x: 470, w: 150, h: 900 },
    { id: 'lf_s', val: '&lt;&lt;Service&gt;&gt;&lt;br&gt;tenant.service', x: 720, w: 150, h: 900 },
    { id: 'lf_db', val: '&lt;&lt;Database&gt;&gt;&lt;br&gt;MongoDB', x: 1050, w: 120, h: 900 }
  ],
  bars: [
    { id: 'bar_T_0', parent: 'lf_t', x: 39, y: 80, h: 120, xCenter: 95 },
    { id: 'bar_UI_0', parent: 'lf_ui', x: 64, y: 80, h: 760, xCenter: 300 },
    { id: 'bar_C_0', parent: 'lf_c', x: 69, y: 170, h: 630, xCenter: 545 },
    { id: 'bar_S_0', parent: 'lf_s', x: 69, y: 210, h: 560, xCenter: 795 },
    { id: 'bar_DB_0', parent: 'lf_db', x: 54, y: 260, h: 70, xCenter: 1110 },
    { id: 'bar_DB_1', parent: 'lf_db', x: 54, y: 550, h: 70, xCenter: 1110 }
  ],
  frames: [
    { id: 'alt_cccd', val: 'alt', x: 40, y: 370, w: 1150, h: 420 }
  ],
  dividers: [
    { id: 'div_cccd', x1: 40, x2: 1190, y: 490 }
  ],
  guards: [
    { id: 'guard_inv', val: '[!isValidCitizenId(cccd) || cccd.length !== 12]', x: 140, y: 370, w: 320 },
    { id: 'guard_val', val: '[valid citizenId format &amp;&amp; verified token]', x: 140, y: 492, w: 300 }
  ],
  messages: [
    { id: 'msg_0', from: 'bar_T_0', to: 'bar_UI_0', y: 100, val: 'fill CCCD (12 digits), hometown, front/back photos', type: 'call' },
    { id: 'msg_1', from: 'bar_T_0', to: 'bar_UI_0', y: 140, val: 'click &quot;Save Profile&quot;', type: 'call' },
    { id: 'msg_2', from: 'bar_UI_0', to: 'bar_C_0', y: 180, val: 'PUT /api/tenants/profile (Header: Bearer Token, Body: profileData)', type: 'call' },
    { id: 'msg_3', from: 'bar_C_0', to: 'bar_S_0', y: 220, val: 'updateTenantProfile(userId, profileData)', type: 'call' },
    { id: 'msg_4', from: 'bar_S_0', to: 'bar_DB_0', y: 265, val: 'db.users.findById(userId)', type: 'call' },
    { id: 'msg_5', from: 'bar_DB_0', to: 'bar_S_0', y: 315, val: 'user document', type: 'return' },
    // Alt branch 1: Invalid
    { id: 'msg_6', from: 'bar_S_0', to: 'bar_C_0', y: 400, val: 'throw ValidationError(&quot;Citizen ID must contain exactly 12 numeric digits&quot;)', type: 'return' },
    { id: 'msg_7', from: 'bar_C_0', to: 'bar_UI_0', y: 435, val: '400 Bad Request ({ success: false, message })', type: 'return' },
    { id: 'msg_8', from: 'bar_UI_0', to: 'bar_T_0', y: 465, val: 'render red error badge under CCCD input', type: 'return' },
    // Alt branch 2: Valid
    { id: 'msg_9', from: 'bar_S_0', to: 'bar_DB_1', y: 550, val: 'db.users.updateOne({ _id: userId }, { $set: { cccd, hometown, isKycDone: true } })', type: 'call' },
    { id: 'msg_10', from: 'bar_DB_1', to: 'bar_S_0', y: 605, val: 'writeResult ({ modifiedCount: 1 })', type: 'return' },
    { id: 'msg_11', from: 'bar_S_0', to: 'bar_C_0', y: 650, val: 'updated user profile document', type: 'return' },
    { id: 'msg_12', from: 'bar_C_0', to: 'bar_UI_0', y: 690, val: '200 OK ({ success: true, message: &quot;Profile updated successfully&quot;, data })', type: 'return' },
    { id: 'msg_13', from: 'bar_UI_0', to: 'bar_T_0', y: 730, val: 'show green success toast &amp; update verified KYC badge', type: 'return' }
  ]
};

// -------------------------------------------------------------
// MODULE 3 (DUC): RENTAL CONTRACT MANAGEMENT
// -------------------------------------------------------------

// UC-M05.1: Create Contract
const ucM05_1Config = {
  name: 'UC-M05.1 Create Contract',
  id: 'uc_m05_1_contract',
  lifelines: [
    { id: 'lf_m', val: 'Landlord / Staff', isActor: true, x: 50, w: 90, h: 1050 },
    { id: 'lf_ui', val: '&lt;&lt;Boundary&gt;&gt;&lt;br&gt;ContractCreateModal', x: 230, w: 140, h: 1050 },
    { id: 'lf_c', val: '&lt;&lt;Controller&gt;&gt;&lt;br&gt;contract.controller', x: 470, w: 150, h: 1050 },
    { id: 'lf_s', val: '&lt;&lt;Service&gt;&gt;&lt;br&gt;contract.service', x: 720, w: 150, h: 1050 },
    { id: 'lf_m_c', val: '&lt;&lt;Model&gt;&gt;&lt;br&gt;Contract', x: 960, w: 130, h: 1050 },
    { id: 'lf_db', val: '&lt;&lt;Database&gt;&gt;&lt;br&gt;MongoDB', x: 1180, w: 120, h: 1050 }
  ],
  bars: [
    { id: 'bar_M_0', parent: 'lf_m', x: 39, y: 80, h: 120, xCenter: 95 },
    { id: 'bar_UI_0', parent: 'lf_ui', x: 64, y: 80, h: 880, xCenter: 300 },
    { id: 'bar_C_0', parent: 'lf_c', x: 69, y: 170, h: 750, xCenter: 545 },
    { id: 'bar_S_0', parent: 'lf_s', x: 69, y: 210, h: 680, xCenter: 795 },
    { id: 'bar_DB_0', parent: 'lf_db', x: 54, y: 260, h: 70, xCenter: 1240 },
    { id: 'bar_MC_0', parent: 'lf_m_c', x: 59, y: 550, h: 190, xCenter: 1025 },
    { id: 'bar_DB_1', parent: 'lf_db', x: 54, y: 600, h: 120, xCenter: 1240 }
  ],
  frames: [
    { id: 'alt_room_status', val: 'alt', x: 40, y: 360, w: 1260, h: 540 }
  ],
  dividers: [
    { id: 'div_room_status', x1: 40, x2: 1300, y: 480 }
  ],
  guards: [
    { id: 'guard_occupied', val: '[room.status === &#39;RENTED&#39; || !room]', x: 140, y: 360, w: 320 },
    { id: 'guard_available', val: '[room.status === &#39;AVAILABLE&#39;]', x: 140, y: 482, w: 250 }
  ],
  messages: [
    { id: 'msg_0', from: 'bar_M_0', to: 'bar_UI_0', y: 100, val: 'select approved request, enter deposit, startDate, endDate', type: 'call' },
    { id: 'msg_1', from: 'bar_M_0', to: 'bar_UI_0', y: 140, val: 'click &quot;Create Contract&quot;', type: 'call' },
    { id: 'msg_2', from: 'bar_UI_0', to: 'bar_C_0', y: 180, val: 'POST /api/contracts (roomId, tenantId, deposit, rentalPrice, startDate, endDate)', type: 'call' },
    { id: 'msg_3', from: 'bar_C_0', to: 'bar_S_0', y: 220, val: 'createContract(contractPayload)', type: 'call' },
    { id: 'msg_4', from: 'bar_S_0', to: 'bar_DB_0', y: 265, val: 'db.rooms.findById(roomId)', type: 'call' },
    { id: 'msg_5', from: 'bar_DB_0', to: 'bar_S_0', y: 315, val: 'room document', type: 'return' },
    // Alt branch 1: Occupied
    { id: 'msg_6', from: 'bar_S_0', to: 'bar_C_0', y: 390, val: 'throw ConflictError(&quot;Room is already rented or not available&quot;)', type: 'return' },
    { id: 'msg_7', from: 'bar_C_0', to: 'bar_UI_0', y: 425, val: '409 Conflict ({ success: false, message })', type: 'return' },
    { id: 'msg_8', from: 'bar_UI_0', to: 'bar_M_0', y: 455, val: 'show error popup: &quot;Cannot create contract: Room occupied&quot;', type: 'return' },
    // Alt branch 2: Available
    { id: 'msg_9', from: 'bar_S_0', to: 'bar_MC_0', y: 555, val: 'new Contract({ contractCode, roomId, tenantId, status: &#39;DRAFT&#39;, ... })', type: 'call' },
    { id: 'msg_10', from: 'bar_MC_0', to: 'bar_DB_1', y: 605, val: 'db.contracts.insertOne(contractDoc)', type: 'call' },
    { id: 'msg_11', from: 'bar_DB_1', to: 'bar_MC_0', y: 650, val: 'inserted contract doc', type: 'return' },
    { id: 'msg_12', from: 'bar_MC_0', to: 'bar_DB_1', y: 680, val: 'db.rooms.updateOne({ _id: roomId }, { $set: { status: &#39;RENTED&#39; } })', type: 'call' },
    { id: 'msg_13', from: 'bar_DB_1', to: 'bar_MC_0', y: 710, val: 'room updated to RENTED', type: 'return' },
    { id: 'msg_14', from: 'bar_MC_0', to: 'bar_S_0', y: 735, val: 'contract instance', type: 'return' },
    { id: 'msg_15', from: 'bar_S_0', to: 'bar_C_0', y: 770, val: 'created contract object', type: 'return' },
    { id: 'msg_16', from: 'bar_C_0', to: 'bar_UI_0', y: 810, val: '201 Created ({ success: true, message: &quot;Contract created&quot;, data })', type: 'return' },
    { id: 'msg_17', from: 'bar_UI_0', to: 'bar_M_0', y: 845, val: 'close modal &amp; refresh Contract List with status DRAFT / PENDING_SIGN', type: 'return' }
  ]
};

// UC-M05.2: Sign Contract
const ucM05_2Config = {
  name: 'UC-M05.2 Tenant Sign Contract',
  id: 'uc_m05_2_sign',
  lifelines: [
    { id: 'lf_t', val: 'Tenant', isActor: true, x: 50, w: 90, h: 900 },
    { id: 'lf_ui', val: '&lt;&lt;Boundary&gt;&gt;&lt;br&gt;ContractSignScreen', x: 230, w: 140, h: 900 },
    { id: 'lf_c', val: '&lt;&lt;Controller&gt;&gt;&lt;br&gt;contract.controller', x: 470, w: 150, h: 900 },
    { id: 'lf_s', val: '&lt;&lt;Service&gt;&gt;&lt;br&gt;contract.service', x: 720, w: 150, h: 900 },
    { id: 'lf_db', val: '&lt;&lt;Database&gt;&gt;&lt;br&gt;MongoDB', x: 1050, w: 120, h: 900 }
  ],
  bars: [
    { id: 'bar_T_0', parent: 'lf_t', x: 39, y: 80, h: 120, xCenter: 95 },
    { id: 'bar_UI_0', parent: 'lf_ui', x: 64, y: 80, h: 760, xCenter: 300 },
    { id: 'bar_C_0', parent: 'lf_c', x: 69, y: 170, h: 630, xCenter: 545 },
    { id: 'bar_S_0', parent: 'lf_s', x: 69, y: 210, h: 560, xCenter: 795 },
    { id: 'bar_DB_0', parent: 'lf_db', x: 54, y: 260, h: 70, xCenter: 1110 },
    { id: 'bar_DB_1', parent: 'lf_db', x: 54, y: 550, h: 70, xCenter: 1110 }
  ],
  frames: [
    { id: 'alt_sign', val: 'alt', x: 40, y: 370, w: 1150, h: 420 }
  ],
  dividers: [
    { id: 'div_sign', x1: 40, x2: 1190, y: 490 }
  ],
  guards: [
    { id: 'guard_not_allowed', val: '[contract.status !== &#39;PENDING_SIGN&#39; || contract.tenantId !== userId]', x: 140, y: 370, w: 420 },
    { id: 'guard_allowed', val: '[valid contract &amp;&amp; verified tenant]', x: 140, y: 492, w: 250 }
  ],
  messages: [
    { id: 'msg_0', from: 'bar_T_0', to: 'bar_UI_0', y: 100, val: 'review terms, draw signature canvas &amp; check agree checkbox', type: 'call' },
    { id: 'msg_1', from: 'bar_T_0', to: 'bar_UI_0', y: 140, val: 'click &quot;Confirm &amp; Sign Contract&quot;', type: 'call' },
    { id: 'msg_2', from: 'bar_UI_0', to: 'bar_C_0', y: 180, val: 'POST /api/contracts/:id/sign (signatureData, signedAt)', type: 'call' },
    { id: 'msg_3', from: 'bar_C_0', to: 'bar_S_0', y: 220, val: 'signContract(contractId, userId, signatureData)', type: 'call' },
    { id: 'msg_4', from: 'bar_S_0', to: 'bar_DB_0', y: 265, val: 'db.contracts.findById(contractId)', type: 'call' },
    { id: 'msg_5', from: 'bar_DB_0', to: 'bar_S_0', y: 315, val: 'contract document', type: 'return' },
    // Alt branch 1: Invalid
    { id: 'msg_6', from: 'bar_S_0', to: 'bar_C_0', y: 400, val: 'throw ForbiddenError(&quot;Contract cannot be signed in current state&quot;)', type: 'return' },
    { id: 'msg_7', from: 'bar_C_0', to: 'bar_UI_0', y: 435, val: '403 Forbidden ({ success: false, message })', type: 'return' },
    { id: 'msg_8', from: 'bar_UI_0', to: 'bar_T_0', y: 465, val: 'show error: &quot;Unauthorized to sign this contract&quot;', type: 'return' },
    // Alt branch 2: Valid
    { id: 'msg_9', from: 'bar_S_0', to: 'bar_DB_1', y: 550, val: 'db.contracts.updateOne({ _id: contractId }, { $set: { status: &#39;ACTIVE&#39;, signature: signatureData, signedAt: new Date() } })', type: 'call' },
    { id: 'msg_10', from: 'bar_DB_1', to: 'bar_S_0', y: 605, val: 'writeResult ({ modifiedCount: 1 })', type: 'return' },
    { id: 'msg_11', from: 'bar_S_0', to: 'bar_C_0', y: 650, val: 'active contract object', type: 'return' },
    { id: 'msg_12', from: 'bar_C_0', to: 'bar_UI_0', y: 690, val: '200 OK ({ success: true, message: &quot;Contract officially signed &amp; active&quot;, data })', type: 'return' },
    { id: 'msg_13', from: 'bar_UI_0', to: 'bar_T_0', y: 730, val: 'show success modal with PDF download link &amp; status ACTIVE', type: 'return' }
  ]
};

// -------------------------------------------------------------
// MODULE 4 (MANH): UTILITY, INVOICE & VNPAY PAYMENT
// -------------------------------------------------------------

// UC-M07: Record Utility
const ucM07Config = {
  name: 'UC-M07 Record Utility',
  id: 'uc_m07_utility',
  lifelines: [
    { id: 'lf_s', val: 'Staff / Landlord', isActor: true, x: 50, w: 90, h: 900 },
    { id: 'lf_ui', val: '&lt;&lt;Boundary&gt;&gt;&lt;br&gt;UtilityRecordModal', x: 230, w: 140, h: 900 },
    { id: 'lf_c', val: '&lt;&lt;Controller&gt;&gt;&lt;br&gt;utility.controller', x: 470, w: 150, h: 900 },
    { id: 'lf_s_srv', val: '&lt;&lt;Service&gt;&gt;&lt;br&gt;utility.service', x: 720, w: 150, h: 900 },
    { id: 'lf_db', val: '&lt;&lt;Database&gt;&gt;&lt;br&gt;MongoDB', x: 1050, w: 120, h: 900 }
  ],
  bars: [
    { id: 'bar_S_0', parent: 'lf_s', x: 39, y: 80, h: 120, xCenter: 95 },
    { id: 'bar_UI_0', parent: 'lf_ui', x: 64, y: 80, h: 760, xCenter: 300 },
    { id: 'bar_C_0', parent: 'lf_c', x: 69, y: 170, h: 630, xCenter: 545 },
    { id: 'bar_SRV_0', parent: 'lf_s_srv', x: 69, y: 210, h: 560, xCenter: 795 },
    { id: 'bar_DB_0', parent: 'lf_db', x: 54, y: 260, h: 70, xCenter: 1110 },
    { id: 'bar_DB_1', parent: 'lf_db', x: 54, y: 550, h: 70, xCenter: 1110 }
  ],
  frames: [
    { id: 'alt_meter', val: 'alt', x: 40, y: 370, w: 1150, h: 420 }
  ],
  dividers: [
    { id: 'div_meter', x1: 40, x2: 1190, y: 490 }
  ],
  guards: [
    { id: 'guard_meter_invalid', val: '[newElec &lt; oldElec || newWater &lt; oldWater]', x: 140, y: 370, w: 320 },
    { id: 'guard_meter_valid', val: '[newElec &gt;= oldElec &amp;&amp; newWater &gt;= oldWater]', x: 140, y: 492, w: 320 }
  ],
  messages: [
    { id: 'msg_0', from: 'bar_S_0', to: 'bar_UI_0', y: 100, val: 'select room, enter month, newElec, newWater', type: 'call' },
    { id: 'msg_1', from: 'bar_S_0', to: 'bar_UI_0', y: 140, val: 'click &quot;Save Reading&quot;', type: 'call' },
    { id: 'msg_2', from: 'bar_UI_0', to: 'bar_C_0', y: 180, val: 'POST /api/utilities (roomId, month, newElec, newWater)', type: 'call' },
    { id: 'msg_3', from: 'bar_C_0', to: 'bar_SRV_0', y: 220, val: 'recordUtility({ roomId, month, newElec, newWater })', type: 'call' },
    { id: 'msg_4', from: 'bar_SRV_0', to: 'bar_DB_0', y: 265, val: 'db.utilities.findOne({ roomId }).sort({ month: -1 })', type: 'call' },
    { id: 'msg_5', from: 'bar_DB_0', to: 'bar_SRV_0', y: 315, val: 'last month reading (oldElec, oldWater)', type: 'return' },
    // Alt branch 1: Invalid
    { id: 'msg_6', from: 'bar_SRV_0', to: 'bar_C_0', y: 400, val: 'throw ValidationError(&quot;New meter reading cannot be less than old reading&quot;)', type: 'return' },
    { id: 'msg_7', from: 'bar_C_0', to: 'bar_UI_0', y: 435, val: '400 Bad Request ({ success: false, message })', type: 'return' },
    { id: 'msg_8', from: 'bar_UI_0', to: 'bar_S_0', y: 465, val: 'show error warning on meter inputs', type: 'return' },
    // Alt branch 2: Valid
    { id: 'msg_9', from: 'bar_SRV_0', to: 'bar_DB_1', y: 550, val: 'db.utilities.insertOne({ roomId, month, oldElec, newElec, usageElec, oldWater, newWater, usageWater })', type: 'call' },
    { id: 'msg_10', from: 'bar_DB_1', to: 'bar_SRV_0', y: 605, val: 'inserted reading document', type: 'return' },
    { id: 'msg_11', from: 'bar_SRV_0', to: 'bar_C_0', y: 650, val: 'created utility record', type: 'return' },
    { id: 'msg_12', from: 'bar_C_0', to: 'bar_UI_0', y: 690, val: '201 Created ({ success: true, message: &quot;Recorded successfully&quot;, data })', type: 'return' },
    { id: 'msg_13', from: 'bar_UI_0', to: 'bar_S_0', y: 730, val: 'update table &amp; show success toast', type: 'return' }
  ]
};

// UC-M09.1: VNPay Payment
const ucM09_1Config = {
  name: 'UC-M09.1 Pay Invoice via VNPay',
  id: 'uc_m09_1_vnpay',
  lifelines: [
    { id: 'lf_t', val: 'Tenant', isActor: true, x: 50, w: 90, h: 900 },
    { id: 'lf_ui', val: '&lt;&lt;Boundary&gt;&gt;&lt;br&gt;InvoiceDetailModal', x: 230, w: 140, h: 900 },
    { id: 'lf_c', val: '&lt;&lt;Controller&gt;&gt;&lt;br&gt;payment.controller', x: 470, w: 150, h: 900 },
    { id: 'lf_s', val: '&lt;&lt;Service&gt;&gt;&lt;br&gt;vnpay.service', x: 720, w: 150, h: 900 },
    { id: 'lf_db', val: '&lt;&lt;Database&gt;&gt;&lt;br&gt;MongoDB', x: 960, w: 120, h: 900 },
    { id: 'lf_vnp', val: '&lt;&lt;Gateway&gt;&gt;&lt;br&gt;VNPay Sandbox', x: 1180, w: 130, h: 900 }
  ],
  bars: [
    { id: 'bar_T_0', parent: 'lf_t', x: 39, y: 80, h: 120, xCenter: 95 },
    { id: 'bar_UI_0', parent: 'lf_ui', x: 64, y: 80, h: 760, xCenter: 300 },
    { id: 'bar_C_0', parent: 'lf_c', x: 69, y: 170, h: 630, xCenter: 545 },
    { id: 'bar_S_0', parent: 'lf_s', x: 69, y: 210, h: 560, xCenter: 795 },
    { id: 'bar_DB_0', parent: 'lf_db', x: 54, y: 260, h: 70, xCenter: 1020 },
    { id: 'bar_VNP_0', parent: 'lf_vnp', x: 59, y: 550, h: 70, xCenter: 1245 }
  ],
  frames: [
    { id: 'alt_pay', val: 'alt', x: 40, y: 370, w: 1260, h: 420 }
  ],
  dividers: [
    { id: 'div_pay', x1: 40, x2: 1300, y: 490 }
  ],
  guards: [
    { id: 'guard_paid', val: '[invoice.status === &#39;PAID&#39; || !invoice]', x: 140, y: 370, w: 320 },
    { id: 'guard_unpaid', val: '[invoice.status === &#39;UNPAID&#39;]', x: 140, y: 492, w: 250 }
  ],
  messages: [
    { id: 'msg_0', from: 'bar_T_0', to: 'bar_UI_0', y: 100, val: 'view invoice #INV-2026-11 &amp; click &quot;Pay via VNPay&quot;', type: 'call' },
    { id: 'msg_1', from: 'bar_UI_0', to: 'bar_C_0', y: 180, val: 'POST /api/payments/create-vnpay-url (invoiceId, bankCode: &quot;NCB&quot;)', type: 'call' },
    { id: 'msg_2', from: 'bar_C_0', to: 'bar_S_0', y: 220, val: 'createPaymentUrl(invoiceId, ipAddr, bankCode)', type: 'call' },
    { id: 'msg_3', from: 'bar_S_0', to: 'bar_DB_0', y: 265, val: 'db.invoices.findById(invoiceId)', type: 'call' },
    { id: 'msg_4', from: 'bar_DB_0', to: 'bar_S_0', y: 315, val: 'invoice document', type: 'return' },
    // Alt branch 1: Paid
    { id: 'msg_5', from: 'bar_S_0', to: 'bar_C_0', y: 400, val: 'throw BadRequestError(&quot;Invoice has already been settled&quot;)', type: 'return' },
    { id: 'msg_6', from: 'bar_C_0', to: 'bar_UI_0', y: 435, val: '400 Bad Request ({ success: false, message })', type: 'return' },
    { id: 'msg_7', from: 'bar_UI_0', to: 'bar_T_0', y: 465, val: 'show alert: &quot;Invoice is already paid!&quot;', type: 'return' },
    // Alt branch 2: Unpaid
    { id: 'msg_8', from: 'bar_S_0', to: 'bar_S_0', y: 530, val: 'buildVNPayParams() &amp; hmacSHA512(secureHash)', type: 'self' },
    { id: 'msg_9', from: 'bar_S_0', to: 'bar_C_0', y: 640, val: '{ paymentUrl: &quot;https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...&quot; }', type: 'return' },
    { id: 'msg_10', from: 'bar_C_0', to: 'bar_UI_0', y: 680, val: '200 OK ({ success: true, paymentUrl })', type: 'return' },
    { id: 'msg_11', from: 'bar_UI_0', to: 'bar_T_0', y: 720, val: 'redirect browser/app webview to VNPay Gateway payment portal', type: 'return' }
  ]
};

// UC-M09.2: VNPay IPN Callback
const ucM09_2Config = {
  name: 'UC-M09.2 VNPay IPN Callback',
  id: 'uc_m09_2_ipn',
  lifelines: [
    { id: 'lf_vnp', val: '&lt;&lt;Gateway&gt;&gt;&lt;br&gt;VNPay Server', isActor: true, x: 50, w: 100, h: 900 },
    { id: 'lf_c', val: '&lt;&lt;Controller&gt;&gt;&lt;br&gt;payment.controller', x: 280, w: 150, h: 900 },
    { id: 'lf_s', val: '&lt;&lt;Service&gt;&gt;&lt;br&gt;payment.service', x: 530, w: 150, h: 900 },
    { id: 'lf_db_p', val: '&lt;&lt;Database&gt;&gt;&lt;br&gt;payment_transactions', x: 790, w: 150, h: 900 },
    { id: 'lf_db_i', val: '&lt;&lt;Database&gt;&gt;&lt;br&gt;invoices', x: 1060, w: 140, h: 900 }
  ],
  bars: [
    { id: 'bar_VNP_0', parent: 'lf_vnp', x: 44, y: 80, h: 720, xCenter: 100 },
    { id: 'bar_C_0', parent: 'lf_c', x: 69, y: 100, h: 680, xCenter: 355 },
    { id: 'bar_S_0', parent: 'lf_s', x: 69, y: 140, h: 610, xCenter: 605 },
    { id: 'bar_DBP_0', parent: 'lf_db_p', x: 69, y: 460, h: 80, xCenter: 865 },
    { id: 'bar_DBI_0', parent: 'lf_db_i', x: 64, y: 580, h: 80, xCenter: 1130 }
  ],
  frames: [
    { id: 'alt_vnp_chk', val: 'alt', x: 40, y: 260, w: 1180, h: 480 }
  ],
  dividers: [
    { id: 'div_vnp_chk', x1: 40, x2: 1220, y: 390 }
  ],
  guards: [
    { id: 'guard_hash_err', val: '[!isValidChecksum(vnp_SecureHash)]', x: 140, y: 260, w: 320 },
    { id: 'guard_hash_ok', val: '[checksum valid &amp;&amp; vnp_ResponseCode === &#39;00&#39;]', x: 140, y: 392, w: 350 }
  ],
  messages: [
    { id: 'msg_0', from: 'bar_VNP_0', to: 'bar_C_0', y: 110, val: 'GET /api/payments/vnpay-ipn?vnp_Amount=...&amp;vnp_SecureHash=...', type: 'call' },
    { id: 'msg_1', from: 'bar_C_0', to: 'bar_S_0', y: 150, val: 'handleVNPayIPN(queryParams)', type: 'call' },
    { id: 'msg_2', from: 'bar_S_0', to: 'bar_S_0', y: 190, val: 'verifySecureHash(queryParams, HASH_SECRET)', type: 'self' },
    // Alt branch 1: Invalid checksum
    { id: 'msg_3', from: 'bar_S_0', to: 'bar_C_0', y: 290, val: '{ RspCode: &#39;97&#39;, Message: &#39;Invalid checksum&#39; }', type: 'return' },
    { id: 'msg_4', from: 'bar_C_0', to: 'bar_VNP_0', y: 330, val: '200 OK ({ RspCode: &#39;97&#39;, Message: &#39;Invalid Checksum&#39; })', type: 'return' },
    // Alt branch 2: Valid checksum & code 00
    { id: 'msg_5', from: 'bar_S_0', to: 'bar_DBP_0', y: 460, val: 'db.payment_transactions.insertOne({ invoiceId, vnpTxnRef, status: &#39;SUCCESS&#39; })', type: 'call' },
    { id: 'msg_6', from: 'bar_DBP_0', to: 'bar_S_0', y: 510, val: 'transaction doc created', type: 'return' },
    { id: 'msg_7', from: 'bar_S_0', to: 'bar_DBI_0', y: 580, val: 'db.invoices.updateOne({ _id: invoiceId }, { $set: { status: &#39;PAID&#39;, paidAt: now } })', type: 'call' },
    { id: 'msg_8', from: 'bar_DBI_0', to: 'bar_S_0', y: 630, val: 'invoice marked as PAID', type: 'return' },
    { id: 'msg_9', from: 'bar_S_0', to: 'bar_C_0', y: 670, val: '{ RspCode: &#39;00&#39;, Message: &#39;Confirm Success&#39; }', type: 'return' },
    { id: 'msg_10', from: 'bar_C_0', to: 'bar_VNP_0', y: 710, val: '200 OK ({ RspCode: &#39;00&#39;, Message: &#39;Success&#39; })', type: 'return' }
  ]
};

// -------------------------------------------------------------
// MODULE CLASS DIAGRAMS (KHANH, DUC, MANH)
// -------------------------------------------------------------

function createModuleClassDiagramXml(config) {
  const { name, id, classes, relations } = config;
  let xml = `<mxfile host="app.diagrams.net">
  <diagram name="${name}" id="${id}">
    <mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1500" pageHeight="1100" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
`;

  classes.forEach(c => {
    const val = `&lt;b&gt;${c.stereotype ? `&amp;lt;&amp;lt;${c.stereotype}&amp;gt;&amp;gt;&lt;br&gt;` : ''}${c.name}&lt;/b&gt;&lt;hr size=&quot;1&quot;/&gt;${c.attrs.join('&lt;br&gt;')}&lt;hr size=&quot;1&quot;/&gt;${c.methods.join('&lt;br&gt;')}`;
    xml += `        <mxCell id="${c.id}" value="${val}" style="swimlane;fontStyle=0;childLayout=stackLayout;horizontal=1;startSize=26;fillColor=#dae8fc;strokeColor=#6c8ebf;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;whiteSpace=wrap;html=1;" vertex="1" parent="1"><mxGeometry x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" as="geometry"/></mxCell>\n`;
  });

  relations.forEach(r => {
    let style = "html=1;rounded=0;endArrow=open;endSize=12;";
    if (r.type === 'dashed') {
      style = "html=1;rounded=0;dashed=1;endArrow=open;endSize=12;";
    }
    xml += `        <mxCell id="${r.id}" value="${r.val || ''}" style="${style}" edge="1" parent="1" source="${r.from}" target="${r.to}"><mxGeometry relative="1" as="geometry"/></mxCell>\n`;
  });

  xml += `      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
  return xml;
}

// User Module Class Diagram
const userModuleClassConfig = {
  name: 'Class Diagram - User & Tenant Module',
  id: 'cd_user_module',
  classes: [
    {
      id: 'c_auth_ctrl', stereotype: 'Controller', name: 'AuthController', x: 60, y: 60, w: 260, h: 200,
      attrs: ['- authService: AuthService'],
      methods: ['+ register(req, res): Promise&lt;void&gt;', '+ login(req, res): Promise&lt;void&gt;', '+ refreshToken(req, res): Promise&lt;void&gt;', '+ getProfile(req, res): Promise&lt;void&gt;']
    },
    {
      id: 'c_tenant_ctrl', stereotype: 'Controller', name: 'TenantController', x: 60, y: 320, w: 260, h: 200,
      attrs: ['- tenantService: TenantService'],
      methods: ['+ updateProfile(req, res): Promise&lt;void&gt;', '+ uploadKYCDocuments(req, res): Promise&lt;void&gt;', '+ getMyRooms(req, res): Promise&lt;void&gt;', '+ getStaffList(req, res): Promise&lt;void&gt;']
    },
    {
      id: 'c_auth_srv', stereotype: 'Service', name: 'AuthService', x: 420, y: 60, w: 280, h: 220,
      attrs: ['- userModel: Model&lt;IUser&gt;', '- jwtSecret: string'],
      methods: ['+ registerUser(data: RegisterDTO): Promise&lt;IUser&gt;', '+ authenticate(account, pass): Promise&lt;AuthToken&gt;', '+ hashPassword(password: string): string', '+ verifyJwtToken(token: string): TokenPayload']
    },
    {
      id: 'c_tenant_srv', stereotype: 'Service', name: 'TenantService', x: 420, y: 320, w: 280, h: 200,
      attrs: ['- userModel: Model&lt;IUser&gt;'],
      methods: ['+ updateTenantKYC(userId, kycData): Promise&lt;IUser&gt;', '+ validateCitizenId(id: string): boolean', '+ lockAccount(userId: string): Promise&lt;boolean&gt;']
    },
    {
      id: 'c_user_model', stereotype: 'Entity/Model', name: 'User', x: 800, y: 150, w: 290, h: 320,
      attrs: [
        '+ _id: ObjectId', '+ fullName: string', '+ email: string', '+ phone: string',
        '+ passwordHash: string', '+ role: UserRole', '+ cccd: string',
        '+ hometown: string', '+ cccdImages: string[]', '+ isKycDone: boolean',
        '+ isLocked: boolean', '+ createdAt: Date', '+ updatedAt: Date'
      ],
      methods: ['+ comparePassword(plain: string): Promise&lt;boolean&gt;', '+ toJSON(): SafeUserObject']
    }
  ],
  relations: [
    { id: 'r1', from: 'c_auth_ctrl', to: 'c_auth_srv', val: 'uses' },
    { id: 'r2', from: 'c_tenant_ctrl', to: 'c_tenant_srv', val: 'uses' },
    { id: 'r3', from: 'c_auth_srv', to: 'c_user_model', val: 'queries &amp; saves' },
    { id: 'r4', from: 'c_tenant_srv', to: 'c_user_model', val: 'queries &amp; updates' }
  ]
};

// Contract Module Class Diagram
const contractModuleClassConfig = {
  name: 'Class Diagram - Contract Module',
  id: 'cd_contract_module',
  classes: [
    {
      id: 'c_contract_ctrl', stereotype: 'Controller', name: 'ContractController', x: 60, y: 120, w: 280, h: 230,
      attrs: ['- contractService: ContractService'],
      methods: [
        '+ createContract(req, res): Promise&lt;void&gt;',
        '+ signContract(req, res): Promise&lt;void&gt;',
        '+ extendContract(req, res): Promise&lt;void&gt;',
        '+ terminateContract(req, res): Promise&lt;void&gt;',
        '+ getContractById(req, res): Promise&lt;void&gt;'
      ]
    },
    {
      id: 'c_contract_srv', stereotype: 'Service', name: 'ContractService', x: 440, y: 120, w: 300, h: 250,
      attrs: ['- contractModel: Model&lt;IContract&gt;', '- roomModel: Model&lt;IRoom&gt;'],
      methods: [
        '+ createNewContract(dto: ContractDTO): Promise&lt;IContract&gt;',
        '+ signDigitalContract(id, userId, sig): Promise&lt;IContract&gt;',
        '+ extendContractDuration(id, newEndDate): Promise&lt;IContract&gt;',
        '+ terminateAndRefund(id, refundAmount): Promise&lt;IContract&gt;'
      ]
    },
    {
      id: 'c_contract_model', stereotype: 'Entity/Model', name: 'RentalContract', x: 840, y: 100, w: 300, h: 320,
      attrs: [
        '+ _id: ObjectId', '+ contractCode: string', '+ roomId: ObjectId',
        '+ tenantId: ObjectId', '+ landlordId: ObjectId', '+ depositAmount: number',
        '+ rentalPrice: number', '+ startDate: Date', '+ endDate: Date',
        '+ status: ContractStatus', '+ signatureUrl: string', '+ signedAt: Date'
      ],
      methods: ['+ isExpiringSoon(): boolean', '+ canBeSignedBy(userId): boolean']
    }
  ],
  relations: [
    { id: 'rc1', from: 'c_contract_ctrl', to: 'c_contract_srv', val: 'delegates to' },
    { id: 'rc2', from: 'c_contract_srv', to: 'c_contract_model', val: 'manages lifecycle' }
  ]
};

// Billing & VNPay Module Class Diagram
const billingModuleClassConfig = {
  name: 'Class Diagram - Billing & Payment Module',
  id: 'cd_billing_module',
  classes: [
    {
      id: 'c_inv_ctrl', stereotype: 'Controller', name: 'InvoiceController', x: 60, y: 60, w: 260, h: 200,
      attrs: ['- invoiceService: InvoiceService'],
      methods: ['+ generateMonthlyInvoices(req, res)', '+ getInvoicesByRoom(req, res)', '+ confirmCashPayment(req, res)']
    },
    {
      id: 'c_pay_ctrl', stereotype: 'Controller', name: 'PaymentController', x: 60, y: 320, w: 260, h: 180,
      attrs: ['- vnpayService: VNPayService'],
      methods: ['+ createVNPayUrl(req, res)', '+ handleVNPayIPN(req, res)', '+ handleVNPayReturn(req, res)']
    },
    {
      id: 'c_inv_srv', stereotype: 'Service', name: 'InvoiceService', x: 400, y: 60, w: 280, h: 210,
      attrs: ['- invoiceModel: Model&lt;IInvoice&gt;', '- utilityModel: Model&lt;IUtility&gt;'],
      methods: ['+ calculateMonthlyBill(roomId, month)', '+ generateInvoice(data)', '+ markInvoiceAsPaid(id, method)']
    },
    {
      id: 'c_vnp_srv', stereotype: 'Service', name: 'VNPayService', x: 400, y: 320, w: 280, h: 200,
      attrs: ['- tmnCode: string', '- hashSecret: string', '- vnpUrl: string'],
      methods: ['+ buildPaymentUrl(invoice, ip): string', '+ verifyIPNSignature(params): boolean', '+ recordTransaction(data)']
    },
    {
      id: 'c_inv_model', stereotype: 'Entity/Model', name: 'Invoice', x: 770, y: 60, w: 280, h: 250,
      attrs: [
        '+ _id: ObjectId', '+ invoiceCode: string', '+ roomId: ObjectId',
        '+ month: string', '+ totalAmount: number', '+ status: InvoiceStatus',
        '+ dueDate: Date', '+ paidAt: Date'
      ],
      methods: ['+ calculateTotal(): number']
    },
    {
      id: 'c_txn_model', stereotype: 'Entity/Model', name: 'PaymentTransaction', x: 770, y: 330, w: 280, h: 200,
      attrs: [
        '+ _id: ObjectId', '+ invoiceId: ObjectId', '+ transactionNo: string',
        '+ amount: number', '+ bankCode: string', '+ status: string'
      ],
      methods: ['+ verifyTransaction(): boolean']
    }
  ],
  relations: [
    { id: 'rb1', from: 'c_inv_ctrl', to: 'c_inv_srv', val: 'uses' },
    { id: 'rb2', from: 'c_pay_ctrl', to: 'c_vnp_srv', val: 'uses' },
    { id: 'rb3', from: 'c_inv_srv', to: 'c_inv_model', val: 'creates &amp; queries' },
    { id: 'rb4', from: 'c_vnp_srv', to: 'c_txn_model', val: 'records transaction' },
    { id: 'rb5', from: 'c_vnp_srv', to: 'c_inv_model', val: 'updates status' }
  ]
};

// Architecture Diagram
function createArchitectureDiagramXml() {
  return `<mxfile host="app.diagrams.net">
  <diagram name="System Architecture" id="sys_arch">
    <mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1400" pageHeight="900" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>

        <!-- Tier 1: Client Tier -->
        <mxCell id="tier1" value="CLIENT TIER (Presentation Layer)" style="swimlane;startSize=30;fillColor=#e1d5e7;strokeColor=#9673a6;fontStyle=1;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="80" y="80" width="1200" height="180" as="geometry"/>
        </mxCell>
        <mxCell id="web_client" value="&lt;b&gt;Web Administration Application&lt;/b&gt;&lt;br&gt;(React 18, Vite, Tailwind CSS, Axios)&lt;br&gt;&lt;i&gt;Target: Landlord &amp; Staff&lt;/i&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="tier1">
          <mxGeometry x="120" y="55" width="380" height="90" as="geometry"/>
        </mxCell>
        <mxCell id="mob_client" value="&lt;b&gt;Mobile Application&lt;/b&gt;&lt;br&gt;(React Native / Expo, Android SDK, AsyncStorage)&lt;br&gt;&lt;i&gt;Target: Tenants &amp; Guests&lt;/i&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="tier1">
          <mxGeometry x="680" y="55" width="380" height="90" as="geometry"/>
        </mxCell>

        <!-- Tier 2: Backend Tier -->
        <mxCell id="tier2" value="APPLICATION TIER (Backend RESTful API Layer)" style="swimlane;startSize=30;fillColor=#ffe6cc;strokeColor=#d79b00;fontStyle=1;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="80" y="320" width="1200" height="260" as="geometry"/>
        </mxCell>
        <mxCell id="api_gw" value="&lt;b&gt;RESTful API Gateway &amp; Middleware&lt;/b&gt;&lt;br&gt;(Express.js, CORS, Helmet, JWT Auth &amp; RBAC Guard)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;" vertex="1" parent="tier2">
          <mxGeometry x="80" y="50" width="1040" height="50" as="geometry"/>
        </mxCell>
        <mxCell id="mod_user" value="&lt;b&gt;User &amp; Auth Module&lt;/b&gt;&lt;br&gt;JWT, Bcrypt, KYC" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#d79b00;" vertex="1" parent="tier2">
          <mxGeometry x="80" y="130" width="220" height="90" as="geometry"/>
        </mxCell>
        <mxCell id="mod_room" value="&lt;b&gt;Room Module&lt;/b&gt;&lt;br&gt;Room CRUD, Search, Rental Request" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#d79b00;" vertex="1" parent="tier2">
          <mxGeometry x="350" y="130" width="230" height="90" as="geometry"/>
        </mxCell>
        <mxCell id="mod_contract" value="&lt;b&gt;Contract Module&lt;/b&gt;&lt;br&gt;Digital Contract, Sign, Extend, Terminate" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#d79b00;" vertex="1" parent="tier2">
          <mxGeometry x="630" y="130" width="240" height="90" as="geometry"/>
        </mxCell>
        <mxCell id="mod_billing" value="&lt;b&gt;Billing &amp; Payment Module&lt;/b&gt;&lt;br&gt;Utility Meter, Invoice, VNPay Gateway" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#d79b00;" vertex="1" parent="tier2">
          <mxGeometry x="910" y="130" width="210" height="90" as="geometry"/>
        </mxCell>

        <!-- Tier 3: Data Tier & External Services -->
        <mxCell id="tier3" value="DATA &amp; EXTERNAL SERVICES TIER" style="swimlane;startSize=30;fillColor=#f8cecc;strokeColor=#b85450;fontStyle=1;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="80" y="640" width="1200" height="180" as="geometry"/>
        </mxCell>
        <mxCell id="db_mongo" value="&lt;b&gt;Primary Database&lt;/b&gt;&lt;br&gt;MongoDB (Mongoose ODM)&lt;br&gt;Collections: users, rooms, contracts, invoices, utilities, payment_transactions" style="shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor=#f5f5f5;fontColor=#333333;strokeColor=#666666;" vertex="1" parent="tier3">
          <mxGeometry x="150" y="45" width="450" height="100" as="geometry"/>
        </mxCell>
        <mxCell id="ext_vnpay" value="&lt;b&gt;External Payment Gateway&lt;/b&gt;&lt;br&gt;VNPay Sandbox API&lt;br&gt;(HMAC-SHA512 Signature &amp; IPN Webhook)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;" vertex="1" parent="tier3">
          <mxGeometry x="720" y="55" width="380" height="80" as="geometry"/>
        </mxCell>

        <!-- Connectors -->
        <mxCell id="c1" value="HTTPS / REST JSON" style="html=1;verticalAlign=bottom;endArrow=block;rounded=0;strokeWidth=2;" edge="1" parent="1" source="web_client" target="api_gw"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="c2" value="HTTPS / REST JSON" style="html=1;verticalAlign=bottom;endArrow=block;rounded=0;strokeWidth=2;" edge="1" parent="1" source="mob_client" target="api_gw"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="c3" value="Mongoose ODM" style="html=1;verticalAlign=bottom;endArrow=block;rounded=0;strokeWidth=2;" edge="1" parent="1" source="mod_room" target="db_mongo"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="c4" value="Secure Webhook / API" style="html=1;verticalAlign=bottom;endArrow=block;rounded=0;strokeWidth=2;" edge="1" parent="1" source="mod_billing" target="ext_vnpay"><mxGeometry relative="1" as="geometry"/></mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}

// Write all generated files
const allDiagrams = [
  // Module 1 (Khanh)
  { file: 'ClassDiagram_User_Module.drawio', xml: createModuleClassDiagramXml(userModuleClassConfig) },
  { file: 'UC-M01_1_Register_SequenceDiagram.drawio', xml: createDiagramXml(ucM01_1Config) },
  { file: 'UC-M01_2_Login_SequenceDiagram.drawio', xml: createDiagramXml(ucM01_2Config) },
  { file: 'UC-M06_Update_Tenant_Profile_SequenceDiagram.drawio', xml: createDiagramXml(ucM06Config) },

  // Module 3 (Duc)
  { file: 'ClassDiagram_Contract_Module.drawio', xml: createModuleClassDiagramXml(contractModuleClassConfig) },
  { file: 'UC-M05_1_Create_Contract_SequenceDiagram.drawio', xml: createDiagramXml(ucM05_1Config) },
  { file: 'UC-M05_2_Sign_Contract_SequenceDiagram.drawio', xml: createDiagramXml(ucM05_2Config) },

  // Module 4 (Manh)
  { file: 'ClassDiagram_Billing_Module.drawio', xml: createModuleClassDiagramXml(billingModuleClassConfig) },
  { file: 'UC-M07_Record_Utility_SequenceDiagram.drawio', xml: createDiagramXml(ucM07Config) },
  { file: 'UC-M09_1_VNPay_Payment_SequenceDiagram.drawio', xml: createDiagramXml(ucM09_1Config) },
  { file: 'UC-M09_2_VNPay_IPN_Callback_SequenceDiagram.drawio', xml: createDiagramXml(ucM09_2Config) },

  // System Architecture
  { file: 'System_Architecture.drawio', xml: createArchitectureDiagramXml() }
];

allDiagrams.forEach(d => {
  targetDirs.forEach(dir => {
    const dest = path.join(dir, d.file);
    fs.writeFileSync(dest, d.xml, 'utf8');
    console.log(`Generated file: ${dest}`);
  });
});

console.log('Successfully generated all remaining diagrams for Khanh, Duc, Manh, and System Architecture!');
