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

  // 2. Bars
  bars.forEach(b => {
    xml += `        <mxCell id="${b.id}" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="${b.parent}"><mxGeometry x="${b.x}" y="${b.y}" width="12" height="${b.h}" as="geometry"/></mxCell>\n`;
  });

  // Map bars for lookup
  const barMap = {};
  bars.forEach(b => {
    barMap[b.id] = b;
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
    const src = barMap[m.from];
    const dst = barMap[m.to];

    if (m.type === 'self') {
      // Self-call on src bar
      const exitY = ((m.y - src.y) / src.h).toFixed(4);
      const entryY = (((m.y + 26) - src.y) / src.h).toFixed(4);
      const loopX = (src.parentX || 615) + 85 + 30; // loop point out to the right
      xml += `        <mxCell id="${m.id}" value="${m.val}" style="html=1;align=left;spacingLeft=4;verticalAlign=middle;endArrow=block;endFill=1;rounded=0;fontSize=11;exitX=1;exitY=${exitY};exitDx=0;exitDy=0;exitPerimeter=0;entryX=1;entryY=${entryY};entryDx=0;entryDy=0;entryPerimeter=0;" edge="1" parent="1" source="${m.from}" target="${m.from}"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="${loopX}" y="${m.y + 40}"/><mxPoint x="${loopX}" y="${m.y + 66}"/></Array></mxGeometry></mxCell>\n`;
    } else {
      const isForward = src.xCenter < dst.xCenter;
      const exitX = isForward ? 1 : 0;
      const entryX = isForward ? 0 : 1;

      // Perfectly matching exitY and entryY ensures pure horizontal arrow
      const exitY = ((m.y - src.y) / src.h).toFixed(4);
      const entryY = ((m.y - dst.y) / dst.h).toFixed(4);

      const arrowStyle = m.type === 'return'
        ? `html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;exitX=${exitX};exitY=${exitY};exitDx=0;exitDy=0;exitPerimeter=0;entryX=${entryX};entryY=${entryY};entryDx=0;entryDy=0;entryPerimeter=0;`
        : `html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;exitX=${exitX};exitY=${exitY};exitDx=0;exitDy=0;exitPerimeter=0;entryX=${entryX};entryY=${entryY};entryDx=0;entryDy=0;entryPerimeter=0;`;

      xml += `        <mxCell id="${m.id}" value="${m.val}" style="${arrowStyle}" edge="1" parent="1" source="${m.from}" target="${m.to}"><mxGeometry relative="1" as="geometry"/></mxCell>\n`;
    }
  });

  xml += `      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

  return xml;
}

// =========================================================================
// DEFINITION 1: UC-M02 Search Room Sequence Diagram
// =========================================================================
const ucM02Config = {
  name: 'UC-M02 Search Room',
  id: 'uc-m02-search-room',
  width: 1400,
  height: 1050,
  lifelines: [
    { id: 'lf_tenant', val: 'Tenant / Guest', isActor: true, x: 115, w: 30, h: 960 },
    { id: 'lf_ui', val: '«boundary»&lt;br&gt;RoomSearchPage', x: 315, w: 170, h: 960 },
    { id: 'lf_controller', val: '«controller»&lt;br&gt;RoomController', x: 615, w: 170, h: 960 },
    { id: 'lf_room', val: '«entity»&lt;br&gt;Room', x: 930, w: 140, h: 960 },
    { id: 'lf_db', val: '«database»&lt;br&gt;MongoDB', x: 1170, w: 140, h: 960 }
  ],
  bars: [
    { id: 'bar_T_0', parent: 'lf_tenant', x: 9, y: 90, h: 810, xCenter: 130 },
    { id: 'bar_UI_0', parent: 'lf_ui', x: 79, y: 90, h: 810, xCenter: 400 },
    { id: 'bar_C_0', parent: 'lf_controller', x: 79, y: 170, h: 690, xCenter: 700, parentX: 615 },
    { id: 'bar_R_0', parent: 'lf_room', x: 64, y: 280, h: 220, xCenter: 1000 },
    { id: 'bar_DB_0', parent: 'lf_db', x: 64, y: 320, h: 140, xCenter: 1240 }
  ],
  frames: [
    { id: 'alt_search', val: 'alt', x: 40, y: 520, w: 1280, h: 360 }
  ],
  dividers: [
    { id: 'div_0', x1: 40, x2: 1320, y: 680 }
  ],
  guards: [
    { id: 'guard_0', val: '[rooms.length === 0 (no matching rooms)]', x: 142, y: 520, w: 320 },
    { id: 'guard_1', val: '[rooms.length &gt; 0 (matches found)]', x: 142, y: 682, w: 280 }
  ],
  messages: [
    { id: 'msg_0', from: 'bar_T_0', to: 'bar_UI_0', y: 100, val: 'select filter criteria (keyword, status, minPrice, maxPrice, area, amenities)', type: 'call' },
    { id: 'msg_1', from: 'bar_T_0', to: 'bar_UI_0', y: 140, val: 'click &quot;Search Rooms&quot;', type: 'call' },
    { id: 'msg_2', from: 'bar_UI_0', to: 'bar_C_0', y: 180, val: 'GET /api/rooms/search?keyword=...&amp;status=AVAILABLE&amp;minPrice=...&amp;maxPrice=...', type: 'call' },
    { id: 'msg_3', from: 'bar_C_0', to: 'bar_C_0', y: 220, val: 'build dynamic query filter object&#xa;{ status, basePrice: { $gte, $lte }, area, amenities }', type: 'self' },
    { id: 'msg_4', from: 'bar_C_0', to: 'bar_R_0', y: 290, val: 'find(queryCriteria).sort({ createdAt: -1 })', type: 'call' },
    { id: 'msg_5', from: 'bar_R_0', to: 'bar_DB_0', y: 330, val: 'db.rooms.find(queryCriteria)', type: 'call' },
    { id: 'msg_6', from: 'bar_DB_0', to: 'bar_R_0', y: 400, val: 'cursor of matching room documents', type: 'return' },
    { id: 'msg_7', from: 'bar_R_0', to: 'bar_C_0', y: 450, val: 'rooms array', type: 'return' },
    // Inside alt - branch 1
    { id: 'msg_8', from: 'bar_C_0', to: 'bar_UI_0', y: 560, val: '200 OK (success: true, data: [])', type: 'return' },
    { id: 'msg_9', from: 'bar_UI_0', to: 'bar_T_0', y: 610, val: 'show empty state: &quot;No rooms match your search criteria&quot;', type: 'return' },
    // Inside alt - branch 2
    { id: 'msg_10', from: 'bar_C_0', to: 'bar_UI_0', y: 720, val: '200 OK (success: true, total: rooms.length, data: rooms)', type: 'return' },
    { id: 'msg_11', from: 'bar_UI_0', to: 'bar_T_0', y: 780, val: 'render room cards in grid layout (photos, price, area, amenity badges)', type: 'return' }
  ]
};

// =========================================================================
// DEFINITION 2: UC-M04.1 Create Room Sequence Diagram
// =========================================================================
const ucM04_1Config = {
  name: 'UC-M04.1 Create Room',
  id: 'uc-m04-1-create-room',
  width: 1400,
  height: 1350,
  lifelines: [
    { id: 'lf_manager', val: 'Manager', isActor: true, x: 115, w: 30, h: 1260 },
    { id: 'lf_ui', val: '«boundary»&lt;br&gt;RoomInventoryPage', x: 315, w: 170, h: 1260 },
    { id: 'lf_controller', val: '«controller»&lt;br&gt;RoomController', x: 615, w: 170, h: 1260 },
    { id: 'lf_room', val: '«entity»&lt;br&gt;Room', x: 930, w: 140, h: 1260 },
    { id: 'lf_db', val: '«database»&lt;br&gt;MongoDB', x: 1170, w: 140, h: 1260 }
  ],
  bars: [
    { id: 'bar_M_0', parent: 'lf_manager', x: 9, y: 90, h: 110, xCenter: 130 },
    { id: 'bar_M_1', parent: 'lf_manager', x: 9, y: 220, h: 970, xCenter: 130 },
    { id: 'bar_UI_0', parent: 'lf_ui', x: 79, y: 90, h: 110, xCenter: 400 },
    { id: 'bar_UI_1', parent: 'lf_ui', x: 79, y: 220, h: 970, xCenter: 400 },
    { id: 'bar_C_0', parent: 'lf_controller', x: 79, y: 260, h: 900, xCenter: 700, parentX: 615 },
    { id: 'bar_R_0', parent: 'lf_room', x: 64, y: 640, h: 480, xCenter: 1000 },
    { id: 'bar_DB_0', parent: 'lf_db', x: 64, y: 680, h: 400, xCenter: 1240 }
  ],
  frames: [
    { id: 'alt_outer', val: 'alt', x: 40, y: 390, w: 1280, h: 790 },
    { id: 'alt_inner', val: 'alt', x: 65, y: 730, w: 1235, h: 430 }
  ],
  dividers: [
    { id: 'div_0', x1: 40, x2: 1320, y: 490 },
    { id: 'div_1', x1: 40, x2: 1320, y: 590 },
    { id: 'div_2', x1: 65, x2: 1300, y: 880 }
  ],
  guards: [
    { id: 'guard_0', val: '[not signed in or missing permission]', x: 142, y: 390, w: 250 },
    { id: 'guard_1', val: '[invalid input: basePrice &lt;= 0 or missing roomNumber]', x: 142, y: 492, w: 340 },
    { id: 'guard_2', val: '[valid request]', x: 142, y: 592, w: 200 },
    { id: 'guard_3', val: '[roomNumber already exists (unique index)]', x: 142, y: 730, w: 280 },
    { id: 'guard_4', val: '[roomNumber is unique]', x: 142, y: 882, w: 200 }
  ],
  messages: [
    { id: 'msg_0', from: 'bar_M_0', to: 'bar_UI_0', y: 100, val: 'click &quot;Add New Room&quot;', type: 'call' },
    { id: 'msg_1', from: 'bar_UI_0', to: 'bar_M_0', y: 160, val: 'render empty room creation modal form', type: 'return' },
    { id: 'msg_2', from: 'bar_M_1', to: 'bar_UI_1', y: 230, val: 'fill room details (roomNumber, basePrice, area, maxOccupants, amenities) &amp; submit', type: 'call' },
    { id: 'msg_3', from: 'bar_UI_1', to: 'bar_C_0', y: 270, val: 'POST /api/rooms (body: roomData)', type: 'call' },
    { id: 'msg_4', from: 'bar_C_0', to: 'bar_C_0', y: 310, val: 'authenticate, requireRole(&#39;MANAGER&#39;, &#39;STAFF&#39;),&#xa;validate input fields', type: 'self' },
    // Outer alt - branch 1
    { id: 'msg_5', from: 'bar_C_0', to: 'bar_UI_1', y: 420, val: '401 Unauthorized / 403 Forbidden', type: 'return' },
    { id: 'msg_6', from: 'bar_UI_1', to: 'bar_M_1', y: 460, val: 'show access error notification', type: 'return' },
    // Outer alt - branch 2
    { id: 'msg_7', from: 'bar_C_0', to: 'bar_UI_1', y: 520, val: '400 Bad Request (validation errors)', type: 'return' },
    { id: 'msg_8', from: 'bar_UI_1', to: 'bar_M_1', y: 560, val: 'show form errors: &quot;Base price must be greater than 0&quot;', type: 'return' },
    // Outer alt - branch 3 (Valid)
    { id: 'msg_9', from: 'bar_C_0', to: 'bar_R_0', y: 650, val: 'findOne({ roomNumber: roomNumber.trim() })', type: 'call' },
    { id: 'msg_10', from: 'bar_R_0', to: 'bar_DB_0', y: 690, val: 'db.rooms.findOne({ roomNumber })', type: 'call' },
    // Inner alt - sub-branch 1 (Duplicate)
    { id: 'msg_11', from: 'bar_DB_0', to: 'bar_R_0', y: 760, val: 'existing room document', type: 'return' },
    { id: 'msg_12', from: 'bar_R_0', to: 'bar_C_0', y: 790, val: 'existing room instance', type: 'return' },
    { id: 'msg_13', from: 'bar_C_0', to: 'bar_UI_1', y: 820, val: '400 Bad Request (&quot;Room number already exists&quot;)', type: 'return' },
    { id: 'msg_14', from: 'bar_UI_1', to: 'bar_M_1', y: 850, val: 'show error toast: &quot;Room number already exists, please choose another&quot;', type: 'return' },
    // Inner alt - sub-branch 2 (Unique)
    { id: 'msg_15', from: 'bar_DB_0', to: 'bar_R_0', y: 910, val: 'null (not found)', type: 'return' },
    { id: 'msg_16', from: 'bar_C_0', to: 'bar_R_0', y: 940, val: 'create(roomData)', type: 'call' },
    { id: 'msg_17', from: 'bar_R_0', to: 'bar_DB_0', y: 970, val: 'db.rooms.insertOne(roomDoc)', type: 'call' },
    { id: 'msg_18', from: 'bar_DB_0', to: 'bar_R_0', y: 1010, val: 'inserted document with _id', type: 'return' },
    { id: 'msg_19', from: 'bar_R_0', to: 'bar_C_0', y: 1040, val: 'new Room instance', type: 'return' },
    { id: 'msg_20', from: 'bar_C_0', to: 'bar_UI_1', y: 1080, val: '201 Created (success: true, data: newRoom)', type: 'return' },
    { id: 'msg_21', from: 'bar_UI_1', to: 'bar_M_1', y: 1120, val: 'close modal, show success toast &quot;Room created successfully!&quot;, reload list', type: 'return' }
  ]
};

// =========================================================================
// DEFINITION 3: UC-M04.3 Delete Room Sequence Diagram
// =========================================================================
const ucM04_3Config = {
  name: 'UC-M04.3 Delete Room',
  id: 'uc-m04-3-delete-room',
  width: 1400,
  height: 1350,
  lifelines: [
    { id: 'lf_manager', val: 'Manager', isActor: true, x: 115, w: 30, h: 1260 },
    { id: 'lf_ui', val: '«boundary»&lt;br&gt;RoomInventoryPage', x: 315, w: 170, h: 1260 },
    { id: 'lf_controller', val: '«controller»&lt;br&gt;RoomController', x: 615, w: 170, h: 1260 },
    { id: 'lf_room', val: '«entity»&lt;br&gt;Room', x: 930, w: 140, h: 1260 },
    { id: 'lf_db', val: '«database»&lt;br&gt;MongoDB', x: 1170, w: 140, h: 1260 }
  ],
  bars: [
    { id: 'bar_M_0', parent: 'lf_manager', x: 9, y: 90, h: 110, xCenter: 130 },
    { id: 'bar_M_1', parent: 'lf_manager', x: 9, y: 220, h: 970, xCenter: 130 },
    { id: 'bar_UI_0', parent: 'lf_ui', x: 79, y: 90, h: 110, xCenter: 400 },
    { id: 'bar_UI_1', parent: 'lf_ui', x: 79, y: 220, h: 970, xCenter: 400 },
    { id: 'bar_C_0', parent: 'lf_controller', x: 79, y: 260, h: 900, xCenter: 700, parentX: 615 },
    { id: 'bar_R_0', parent: 'lf_room', x: 64, y: 350, h: 170, xCenter: 1000 },
    { id: 'bar_R_1', parent: 'lf_room', x: 64, y: 960, h: 140, xCenter: 1000 },
    { id: 'bar_DB_0', parent: 'lf_db', x: 64, y: 380, h: 90, xCenter: 1240 },
    { id: 'bar_DB_1', parent: 'lf_db', x: 64, y: 730, h: 80, xCenter: 1240 },
    { id: 'bar_DB_2', parent: 'lf_db', x: 64, y: 990, h: 80, xCenter: 1240 }
  ],
  frames: [
    { id: 'alt_outer', val: 'alt', x: 40, y: 520, w: 1280, h: 660 },
    { id: 'alt_inner', val: 'alt', x: 65, y: 780, w: 1235, h: 380 }
  ],
  dividers: [
    { id: 'div_0', x1: 40, x2: 1320, y: 610 },
    { id: 'div_1', x1: 40, x2: 1320, y: 710 },
    { id: 'div_2', x1: 65, x2: 1300, y: 930 }
  ],
  guards: [
    { id: 'guard_0', val: '[!room (Room not found)]', x: 142, y: 520, w: 250 },
    { id: 'guard_1', val: '[room.status === &#39;RENTED&#39; (Cannot delete occupied room)]', x: 142, y: 612, w: 360 },
    { id: 'guard_2', val: '[room.status !== &#39;RENTED&#39; - Check active lease contracts]', x: 142, y: 712, w: 360 },
    { id: 'guard_3', val: '[activeContract exists]', x: 142, y: 780, w: 250 },
    { id: 'guard_4', val: '[valid: no active contracts found (safe to delete)]', x: 142, y: 932, w: 320 }
  ],
  messages: [
    { id: 'msg_0', from: 'bar_M_0', to: 'bar_UI_0', y: 100, val: 'select room and click &quot;Delete Room&quot;', type: 'call' },
    { id: 'msg_1', from: 'bar_UI_0', to: 'bar_M_0', y: 160, val: 'show delete confirmation modal dialog', type: 'return' },
    { id: 'msg_2', from: 'bar_M_1', to: 'bar_UI_1', y: 230, val: 'confirm &quot;Yes, Delete&quot;', type: 'call' },
    { id: 'msg_3', from: 'bar_UI_1', to: 'bar_C_0', y: 270, val: 'DELETE /api/rooms/:id', type: 'call' },
    { id: 'msg_4', from: 'bar_C_0', to: 'bar_C_0', y: 310, val: 'authenticate, requireRole(&#39;MANAGER&#39;)', type: 'self' },
    { id: 'msg_5', from: 'bar_C_0', to: 'bar_R_0', y: 360, val: 'findById(id)', type: 'call' },
    { id: 'msg_6', from: 'bar_R_0', to: 'bar_DB_0', y: 390, val: 'db.rooms.findOne({ _id: id })', type: 'call' },
    { id: 'msg_7', from: 'bar_DB_0', to: 'bar_R_0', y: 430, val: 'room document', type: 'return' },
    { id: 'msg_8', from: 'bar_R_0', to: 'bar_C_0', y: 470, val: 'room instance', type: 'return' },
    // Outer alt - branch 1
    { id: 'msg_9', from: 'bar_C_0', to: 'bar_UI_1', y: 540, val: '404 Not Found (&quot;Room not found&quot;)', type: 'return' },
    { id: 'msg_10', from: 'bar_UI_1', to: 'bar_M_1', y: 580, val: 'show error message: &quot;Room not found&quot;', type: 'return' },
    // Outer alt - branch 2
    { id: 'msg_11', from: 'bar_C_0', to: 'bar_UI_1', y: 630, val: '400 Bad Request (&quot;Cannot delete occupied room&quot;)', type: 'return' },
    { id: 'msg_12', from: 'bar_UI_1', to: 'bar_M_1', y: 670, val: 'show warning: &quot;Cannot delete room currently occupied by tenant!&quot;', type: 'return' },
    // Outer alt - branch 3 (Check contracts)
    { id: 'msg_13', from: 'bar_C_0', to: 'bar_DB_1', y: 740, val: 'db.contracts.findOne({ room: id, status: &#39;ACTIVE&#39; })', type: 'call' },
    // Inner alt - sub-branch 1 (Contract exists)
    { id: 'msg_14', from: 'bar_DB_1', to: 'bar_C_0', y: 810, val: 'activeContract document', type: 'return' },
    { id: 'msg_15', from: 'bar_C_0', to: 'bar_UI_1', y: 850, val: '400 Bad Request (&quot;Active contract exists for this room&quot;)', type: 'return' },
    { id: 'msg_16', from: 'bar_UI_1', to: 'bar_M_1', y: 890, val: 'show error toast: &quot;Please terminate the active lease contract before deleting&quot;', type: 'return' },
    // Inner alt - sub-branch 2 (Safe to delete)
    { id: 'msg_17', from: 'bar_C_0', to: 'bar_R_1', y: 970, val: 'deleteOne({ _id: id })', type: 'call' },
    { id: 'msg_18', from: 'bar_R_1', to: 'bar_DB_2', y: 1000, val: 'db.rooms.deleteOne({ _id: id })', type: 'call' },
    { id: 'msg_19', from: 'bar_DB_2', to: 'bar_R_1', y: 1040, val: '{ acknowledged: true, deletedCount: 1 }', type: 'return' },
    { id: 'msg_20', from: 'bar_R_1', to: 'bar_C_0', y: 1070, val: 'delete result', type: 'return' },
    { id: 'msg_21', from: 'bar_C_0', to: 'bar_UI_1', y: 1100, val: '200 OK (success: true, message: &quot;Room deleted successfully&quot;)', type: 'return' },
    { id: 'msg_22', from: 'bar_UI_1', to: 'bar_M_1', y: 1130, val: 'show success toast notification, remove room row from table', type: 'return' }
  ]
};

// =========================================================================
// DEFINITION 4: UC-M03 Request Rental Sequence Diagram
// =========================================================================
const ucM03Config = {
  name: 'UC-M03 Request Rental',
  id: 'uc-m03-request-rental',
  width: 1400,
  height: 1250,
  lifelines: [
    { id: 'lf_tenant', val: 'Tenant', isActor: true, x: 115, w: 30, h: 1180 },
    { id: 'lf_ui', val: '«boundary»&lt;br&gt;RoomDetailPage', x: 315, w: 170, h: 1180 },
    { id: 'lf_controller', val: '«controller»&lt;br&gt;RoomController', x: 615, w: 170, h: 1180 },
    { id: 'lf_req', val: '«entity»&lt;br&gt;RentalRequest', x: 930, w: 140, h: 1180 },
    { id: 'lf_db', val: '«database»&lt;br&gt;MongoDB', x: 1170, w: 140, h: 1180 }
  ],
  bars: [
    { id: 'bar_T_0', parent: 'lf_tenant', x: 9, y: 90, h: 110, xCenter: 130 },
    { id: 'bar_T_1', parent: 'lf_tenant', x: 9, y: 220, h: 900, xCenter: 130 },
    { id: 'bar_UI_0', parent: 'lf_ui', x: 79, y: 90, h: 110, xCenter: 400 },
    { id: 'bar_UI_1', parent: 'lf_ui', x: 79, y: 220, h: 900, xCenter: 400 },
    { id: 'bar_C_0', parent: 'lf_controller', x: 79, y: 260, h: 840, xCenter: 700, parentX: 615 },
    { id: 'bar_REQ_0', parent: 'lf_req', x: 64, y: 760, h: 220, xCenter: 1000 },
    { id: 'bar_DB_0', parent: 'lf_db', x: 64, y: 520, h: 90, xCenter: 1240 },
    { id: 'bar_DB_1', parent: 'lf_db', x: 64, y: 800, h: 90, xCenter: 1240 }
  ],
  frames: [
    { id: 'alt_outer', val: 'alt', x: 40, y: 390, w: 1280, h: 710 },
    { id: 'alt_inner', val: 'alt', x: 65, y: 640, w: 1235, h: 440 }
  ],
  dividers: [
    { id: 'div_0', x1: 40, x2: 1320, y: 490 },
    { id: 'div_1', x1: 65, x2: 1300, y: 740 }
  ],
  guards: [
    { id: 'guard_0', val: '[invalid input: invalid phone format or missing moveInDate]', x: 142, y: 390, w: 360 },
    { id: 'guard_1', val: '[valid input]', x: 142, y: 492, w: 200 },
    { id: 'guard_2', val: '[room.status === &#39;MAINTENANCE&#39; or &#39;RENTED&#39;]', x: 142, y: 640, w: 320 },
    { id: 'guard_3', val: '[room.status === &#39;AVAILABLE&#39;]', x: 142, y: 742, w: 220 }
  ],
  messages: [
    { id: 'msg_0', from: 'bar_T_0', to: 'bar_UI_0', y: 100, val: 'click &quot;Request Rental / Hold Room&quot;', type: 'call' },
    { id: 'msg_1', from: 'bar_UI_0', to: 'bar_T_0', y: 160, val: 'render modal form (fullName, phone, email, moveInDate, note)', type: 'return' },
    { id: 'msg_2', from: 'bar_T_1', to: 'bar_UI_1', y: 230, val: 'fill form details and click &quot;Submit Request&quot;', type: 'call' },
    { id: 'msg_3', from: 'bar_UI_1', to: 'bar_C_0', y: 270, val: 'POST /api/rooms/:id/rental-request (body: tenantRequestData)', type: 'call' },
    { id: 'msg_4', from: 'bar_C_0', to: 'bar_C_0', y: 310, val: 'validate phone, fullName, moveInDate', type: 'self' },
    // Outer alt - branch 1 (Invalid)
    { id: 'msg_5', from: 'bar_C_0', to: 'bar_UI_1', y: 410, val: '400 Bad Request (&quot;Please provide full name, valid phone and move-in date&quot;)', type: 'return' },
    { id: 'msg_6', from: 'bar_UI_1', to: 'bar_T_1', y: 450, val: 'show validation error message on form', type: 'return' },
    // Outer alt - branch 2 (Valid)
    { id: 'msg_7', from: 'bar_C_0', to: 'bar_DB_0', y: 530, val: 'db.rooms.findById(id)', type: 'call' },
    { id: 'msg_8', from: 'bar_DB_0', to: 'bar_C_0', y: 580, val: 'room document', type: 'return' },
    // Inner alt - sub-branch 1 (Not available)
    { id: 'msg_9', from: 'bar_C_0', to: 'bar_UI_1', y: 660, val: '400 Bad Request (&quot;Room is currently not available for rental requests&quot;)', type: 'return' },
    { id: 'msg_10', from: 'bar_UI_1', to: 'bar_T_1', y: 700, val: 'show error toast: &quot;Room is currently not available, please choose another&quot;', type: 'return' },
    // Inner alt - sub-branch 2 (Available)
    { id: 'msg_11', from: 'bar_C_0', to: 'bar_REQ_0', y: 770, val: 'create({ roomId, tenantInfo, status: &#39;PENDING&#39; })', type: 'call' },
    { id: 'msg_12', from: 'bar_REQ_0', to: 'bar_DB_1', y: 810, val: 'db.rentalRequests.insertOne(requestDoc)', type: 'call' },
    { id: 'msg_13', from: 'bar_DB_1', to: 'bar_REQ_0', y: 860, val: 'inserted rentalRequest doc', type: 'return' },
    { id: 'msg_14', from: 'bar_REQ_0', to: 'bar_C_0', y: 910, val: 'rentalRequest instance', type: 'return' },
    { id: 'msg_15', from: 'bar_C_0', to: 'bar_UI_1', y: 950, val: '201 Created (success: true, message: &quot;Request submitted successfully&quot;, data)', type: 'return' },
    { id: 'msg_16', from: 'bar_UI_1', to: 'bar_T_1', y: 1000, val: 'close modal, show confirmation popup with request ID and instructions', type: 'return' }
  ]
};

// Generate and write all files
const configs = [
  { file: 'UC-M02_Search_Room_SequenceDiagram.drawio', xml: createDiagramXml(ucM02Config) },
  { file: 'UC-M04_1_Create_Room_SequenceDiagram.drawio', xml: createDiagramXml(ucM04_1Config) },
  { file: 'UC-M04_3_Delete_Room_SequenceDiagram.drawio', xml: createDiagramXml(ucM04_3Config) },
  { file: 'UC-M03_Request_Rental_SequenceDiagram.drawio', xml: createDiagramXml(ucM03Config) },
  { file: 'UC-M04_2_Update_Room_SequenceDiagram.drawio', xml: fs.readFileSync('C:\\Users\\nguye\\Downloads\\UC-M09_Update_Room_Info_SequenceDiagram.drawio', 'utf8') }
];

configs.forEach(c => {
  targetDirs.forEach(dir => {
    const dest = path.join(dir, c.file);
    fs.writeFileSync(dest, c.xml, 'utf8');
    console.log(`Generated perfect layout: ${dest}`);
  });
});

console.log('All diagrams generated with mathematically perfect horizontal alignment and spacing!');
