const fs = require('fs');
const path = require('path');

// Helper to escape XML
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Diagram 1: UC03 Request Rental
function buildUC03Diagram() {
  const lifelines = [
    { id: 'll_tenant', name: 'Khách thuê&#xa;(Tenant)', type: 'actor', x: 60, width: 60, height: 560, fill: '#dae8fc', stroke: '#6c8ebf' },
    { id: 'll_ui', name: '&lt;b&gt;«boundary»&lt;br&gt;RentalRequestScreen&lt;/b&gt;', type: 'boundary', x: 230, width: 170, height: 560, fill: '#d5e8d4', stroke: '#82b366' },
    { id: 'll_api', name: '&lt;b&gt;«control»&lt;br&gt;RentalRequestController&lt;/b&gt;', type: 'control', x: 470, width: 180, height: 560, fill: '#ffe6cc', stroke: '#d79b00' },
    { id: 'll_room', name: '&lt;b&gt;«entity»&lt;br&gt;MongoDB: Room&lt;/b&gt;', type: 'entity', x: 720, width: 150, height: 560, fill: '#e1d5e7', stroke: '#9673a6' },
    { id: 'll_req', name: '&lt;b&gt;«entity»&lt;br&gt;MongoDB: RentalRequest&lt;/b&gt;', type: 'entity', x: 930, width: 170, height: 560, fill: '#f8cecc', stroke: '#b85450' }
  ];

  // Centers:
  // Tenant: 90
  // UI: 315
  // API: 560
  // Room: 795
  // Req: 1015

  const messages = [
    { type: 'sync', fromX: 90, toX: 315, y: 150, label: '1. Chọn phòng trống &amp; điền SĐT, ngày dự kiến, ghi chú' },
    { type: 'sync', fromX: 90, toX: 315, y: 190, label: '2. Bấm nút &quot;Gửi yêu cầu thuê&quot;' },
    { type: 'sync', fromX: 315, toX: 560, y: 220, label: '3. POST /api/rental-requests (roomId, tenantName, phone, date, note)' },
    { type: 'sync', fromX: 560, toX: 795, y: 250, label: '4. Room.findById(roomId)' },
    { type: 'return', fromX: 795, toX: 560, y: 280, label: '5. Thông tin Room (status, price, ...)' },
    
    // Alt branch 1
    { type: 'return', fromX: 560, toX: 315, y: 340, label: '6a. Trả về 400 Bad Request (&quot;Phòng không khả dụng để thuê&quot;)' },
    { type: 'return', fromX: 315, toX: 90, y: 370, label: '7a. Hiển thị thông báo lỗi trên màn hình' },
    
    // Alt branch 2
    { type: 'sync', fromX: 560, toX: 1015, y: 440, label: '6b. RentalRequest.create(status: &apos;PENDING&apos;, requestDate: now)' },
    { type: 'return', fromX: 1015, toX: 560, y: 470, label: '7b. Trả về yêu cầu vừa tạo thành công' },
    { type: 'return', fromX: 560, toX: 315, y: 500, label: '8b. Trả về 201 Created (Kèm dữ liệu RentalRequest)' },
    { type: 'return', fromX: 315, toX: 90, y: 530, label: '9b. Thông báo gửi yêu cầu thành công, chờ chủ trọ duyệt' }
  ];

  const frames = [
    {
      x: 40, y: 300, width: 1090, height: 260,
      title: 'alt',
      label: '[TC_RENTAL_02: Room status != AVAILABLE (Phòng đã thuê/bảo trì)]',
      dividerY: 410,
      dividerLabel: '[TC_RENTAL_01: Room status == AVAILABLE (Phòng hợp lệ)]'
    }
  ];

  return renderDiagramXml('UC03_Request_Rental', 'UC03: Gửi yêu cầu thuê phòng (Request Rental)', lifelines, messages, frames);
}

// Diagram 2: UC05 Manage Contract
function buildUC05Diagram() {
  const lifelines = [
    { id: 'll_landlord', name: 'Chủ trọ&#xa;(Landlord)', type: 'actor', x: 60, width: 60, height: 650, fill: '#dae8fc', stroke: '#6c8ebf' },
    { id: 'll_ui', name: '&lt;b&gt;«boundary»&lt;br&gt;ManageContractsScreen&lt;/b&gt;', type: 'boundary', x: 220, width: 170, height: 650, fill: '#d5e8d4', stroke: '#82b366' },
    { id: 'll_api', name: '&lt;b&gt;«control»&lt;br&gt;ContractController&lt;/b&gt;', type: 'control', x: 460, width: 180, height: 650, fill: '#ffe6cc', stroke: '#d79b00' },
    { id: 'll_room', name: '&lt;b&gt;«entity»&lt;br&gt;MongoDB: Room&lt;/b&gt;', type: 'entity', x: 700, width: 150, height: 650, fill: '#e1d5e7', stroke: '#9673a6' },
    { id: 'll_ctr', name: '&lt;b&gt;«entity»&lt;br&gt;MongoDB: Contract&lt;/b&gt;', type: 'entity', x: 910, width: 160, height: 650, fill: '#f8cecc', stroke: '#b85450' }
  ];

  // Centers:
  // Landlord: 90
  // UI: 305
  // API: 550
  // Room: 775
  // Ctr: 990

  const messages = [
    { type: 'sync', fromX: 90, toX: 305, y: 150, label: '1. Nhập thông tin Bên A, Bên B, ngày ký, thời hạn, cọc, giá thuê' },
    { type: 'sync', fromX: 90, toX: 305, y: 180, label: '2. Bấm &quot;Xác nhận lập hợp đồng&quot;' },
    { type: 'sync', fromX: 305, toX: 550, y: 210, label: '3. POST /api/contracts (roomId, Bên A, Bên B, signedDate, startDate, endDate, cọc, giá)' },
    { type: 'sync', fromX: 550, toX: 775, y: 240, label: '4. Room.findById(roomId)' },
    { type: 'return', fromX: 775, toX: 550, y: 265, label: '5. Thông tin phòng (status, price)' },
    { type: 'sync', fromX: 550, toX: 990, y: 295, label: '6. Contract.findOne({ roomId, status: &apos;ACTIVE&apos; })' },
    { type: 'return', fromX: 990, toX: 550, y: 320, label: '7. Kết quả tìm kiếm hợp đồng đang ACTIVE' },

    // Alt branch 1
    { type: 'return', fromX: 550, toX: 305, y: 375, label: '8a. Trả về 400 Bad Request (&quot;Phòng đang có hợp đồng hoặc đã thuê&quot;)' },
    { type: 'return', fromX: 305, toX: 90, y: 400, label: '9a. Cảnh báo lỗi lập trùng hợp đồng cho phòng đã có người' },

    // Alt branch 2
    { type: 'sync', fromX: 550, toX: 990, y: 470, label: '8b. Contract.create(status: &apos;ACTIVE&apos;, signedDate, Bên A, Bên B, ...)' },
    { type: 'return', fromX: 990, toX: 550, y: 495, label: '9b. Hợp đồng lưu thành công' },
    { type: 'sync', fromX: 550, toX: 775, y: 525, label: '10b. Cập nhật Room.status = &apos;RENTED&apos;' },
    { type: 'return', fromX: 775, toX: 550, y: 550, label: '11b. Lưu trạng thái RENTED thành công' },
    { type: 'return', fromX: 550, toX: 305, y: 580, label: '12b. Trả về 201 Created (Kèm bản ghi Contract)' },
    { type: 'return', fromX: 305, toX: 90, y: 610, label: '13b. Thông báo lập HĐ thành công, hiển thị nút &quot;👁️ Xem HĐ&quot; để xem và in' }
  ];

  const frames = [
    {
      x: 40, y: 345, width: 1070, height: 290,
      title: 'alt',
      label: '[TC_CTR_02: Phòng đang RENTED hoặc đã có hợp đồng ACTIVE]',
      dividerY: 440,
      dividerLabel: '[TC_CTR_01: Phòng AVAILABLE &amp; Thông tin hợp lệ]'
    }
  ];

  return renderDiagramXml('UC05_Manage_Contract', 'UC05: Lập hợp đồng thuê phòng mới (Manage Contract)', lifelines, messages, frames);
}

// Diagram 3: UC05.1 Extend Contract
function buildUC051Diagram() {
  const lifelines = [
    { id: 'll_landlord', name: 'Chủ trọ&#xa;(Landlord)', type: 'actor', x: 80, width: 60, height: 530, fill: '#dae8fc', stroke: '#6c8ebf' },
    { id: 'll_ui', name: '&lt;b&gt;«boundary»&lt;br&gt;ManageContractsScreen&lt;/b&gt;', type: 'boundary', x: 280, width: 180, height: 530, fill: '#d5e8d4', stroke: '#82b366' },
    { id: 'll_api', name: '&lt;b&gt;«control»&lt;br&gt;ContractController&lt;/b&gt;', type: 'control', x: 550, width: 180, height: 530, fill: '#ffe6cc', stroke: '#d79b00' },
    { id: 'll_ctr', name: '&lt;b&gt;«entity»&lt;br&gt;MongoDB: Contract&lt;/b&gt;', type: 'entity', x: 810, width: 160, height: 530, fill: '#f8cecc', stroke: '#b85450' }
  ];

  // Centers:
  // Landlord: 110
  // UI: 370
  // API: 640
  // Ctr: 890

  const messages = [
    { type: 'sync', fromX: 110, toX: 370, y: 150, label: '1. Bấm nút &quot;Gia hạn&quot; tại hàng hợp đồng' },
    { type: 'sync', fromX: 110, toX: 370, y: 185, label: '2. Nhập ngày kết thúc mới (newEndDate)' },
    { type: 'sync', fromX: 370, toX: 640, y: 220, label: '3. PUT /api/contracts/:id/extend (body: { endDate: newEndDate })' },
    { type: 'sync', fromX: 640, toX: 890, y: 250, label: '4. Contract.findById(id)' },
    { type: 'return', fromX: 890, toX: 640, y: 280, label: '5. Trả về thông tin hợp đồng hiện tại' },

    // Alt branch 1
    { type: 'return', fromX: 640, toX: 370, y: 340, label: '6a. Trả về 400 Bad Request (&quot;Chỉ có thể gia hạn hợp đồng ACTIVE&quot;)' },
    { type: 'return', fromX: 370, toX: 110, y: 370, label: '7a. Báo lỗi trạng thái không cho phép gia hạn' },

    // Alt branch 2
    { type: 'sync', fromX: 640, toX: 890, y: 435, label: '6b. Cập nhật contract.endDate = newEndDate &amp; save()' },
    { type: 'return', fromX: 890, toX: 640, y: 460, label: '7b. Lưu gia hạn thành công' },
    { type: 'return', fromX: 640, toX: 370, y: 485, label: '8b. Trả về 200 OK (&quot;Gia hạn hợp đồng thành công&quot;)' },
    { type: 'return', fromX: 370, toX: 110, y: 510, label: '9b. Cập nhật thời hạn hợp đồng mới trên bảng danh sách' }
  ];

  const frames = [
    {
      x: 50, y: 305, width: 960, height: 230,
      title: 'alt',
      label: '[Contract status != ACTIVE (HĐ đã thanh lý/hết hạn)]',
      dividerY: 405,
      dividerLabel: '[Contract status == ACTIVE (HĐ đang có hiệu lực)]'
    }
  ];

  return renderDiagramXml('UC05_1_Extend_Contract', 'UC05.1: Gia hạn hợp đồng (Extend Contract)', lifelines, messages, frames);
}

// Diagram 4: UC05.2 Terminate Contract
function buildUC052Diagram() {
  const lifelines = [
    { id: 'll_landlord', name: 'Chủ trọ&#xa;(Landlord)', type: 'actor', x: 60, width: 60, height: 560, fill: '#dae8fc', stroke: '#6c8ebf' },
    { id: 'll_ui', name: '&lt;b&gt;«boundary»&lt;br&gt;ManageContractsScreen&lt;/b&gt;', type: 'boundary', x: 230, width: 170, height: 560, fill: '#d5e8d4', stroke: '#82b366' },
    { id: 'll_api', name: '&lt;b&gt;«control»&lt;br&gt;ContractController&lt;/b&gt;', type: 'control', x: 470, width: 180, height: 560, fill: '#ffe6cc', stroke: '#d79b00' },
    { id: 'll_ctr', name: '&lt;b&gt;«entity»&lt;br&gt;MongoDB: Contract&lt;/b&gt;', type: 'entity', x: 720, width: 160, height: 560, fill: '#f8cecc', stroke: '#b85450' },
    { id: 'll_room', name: '&lt;b&gt;«entity»&lt;br&gt;MongoDB: Room&lt;/b&gt;', type: 'entity', x: 940, width: 150, height: 560, fill: '#e1d5e7', stroke: '#9673a6' }
  ];

  // Centers:
  // Landlord: 90
  // UI: 315
  // API: 560
  // Ctr: 800
  // Room: 1015

  const messages = [
    { type: 'sync', fromX: 90, toX: 315, y: 150, label: '1. Bấm nút &quot;Thanh lý&quot; tại hàng hợp đồng mong muốn' },
    { type: 'sync', fromX: 90, toX: 315, y: 180, label: '2. Xác nhận hộp thoại: &quot;Xác nhận thanh lý hợp đồng phòng?&quot;' },
    { type: 'sync', fromX: 315, toX: 560, y: 210, label: '3. PUT /api/contracts/:id/terminate' },
    { type: 'sync', fromX: 560, toX: 800, y: 240, label: '4. Contract.findById(id)' },
    { type: 'return', fromX: 800, toX: 560, y: 265, label: '5. Trả về thông tin hợp đồng hiện tại' },

    // Alt branch 1
    { type: 'return', fromX: 560, toX: 315, y: 320, label: '6a. Trả về 400 Bad Request (&quot;Hợp đồng đã được thanh lý trước đó&quot;)' },
    { type: 'return', fromX: 315, toX: 90, y: 345, label: '7a. Báo lỗi không thể thanh lý lại' },

    // Alt branch 2 (TC_CTR_03)
    { type: 'sync', fromX: 560, toX: 800, y: 410, label: '6b. Cập nhật contract.status = &apos;TERMINATED&apos; &amp; save()' },
    { type: 'return', fromX: 800, toX: 560, y: 435, label: '7b. Lưu trạng thái TERMINATED thành công' },
    { type: 'sync', fromX: 560, toX: 1015, y: 465, label: '8b. Room.findById(contract.roomId) &amp; status = &apos;AVAILABLE&apos;' },
    { type: 'return', fromX: 1015, toX: 560, y: 490, label: '9b. Giải phóng phòng thành công (status: AVAILABLE)' },
    { type: 'return', fromX: 560, toX: 315, y: 515, label: '10b. Trả về 200 OK (&quot;Thanh lý hợp đồng thành công&quot;)' },
    { type: 'return', fromX: 315, toX: 90, y: 540, label: '11b. Cập nhật bảng: HĐ TERMINATED, Phòng tự chuyển về AVAILABLE' }
  ];

  const frames = [
    {
      x: 40, y: 290, width: 1090, height: 275,
      title: 'alt',
      label: '[Contract status == TERMINATED (Đã thanh lý trước đó)]',
      dividerY: 380,
      dividerLabel: '[TC_CTR_03: Contract status != TERMINATED (Hợp lệ để thanh lý)]'
    }
  ];

  return renderDiagramXml('UC05_2_Terminate_Contract', 'UC05.2: Thanh lý hợp đồng &amp; Giải phóng phòng (Terminate Contract)', lifelines, messages, frames);
}

// Master function to render XML for a diagram page
function renderDiagramXml(pageId, pageTitle, lifelines, messages, frames) {
  let xml = '';
  let cellId = 2;

  // Title box
  xml += `        <mxCell id="${cellId++}" value="&lt;b&gt;SEQUENCE DIAGRAM - ${escapeXml(pageTitle)}&lt;/b&gt;" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=16;fontColor=#1b365d;" vertex="1" parent="1">\n`;
  xml += `          <mxGeometry x="60" y="20" width="1000" height="35" as="geometry" />\n`;
  xml += `        </mxCell>\n`;

  // Frames (alt/opt)
  if (frames && frames.length > 0) {
    frames.forEach(fr => {
      const frId = cellId++;
      xml += `        <mxCell id="${frId}" value="${escapeXml(fr.title)}&#xa;${escapeXml(fr.label)}" style="shape=umlFrame;whiteSpace=wrap;html=1;width=60;height=25;boundedLbl=1;verticalAlign=top;align=left;spacingLeft=8;fillColor=#fffbf0;strokeColor=#d6b656;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="1">\n`;
      xml += `          <mxGeometry x="${fr.x}" y="${fr.y}" width="${fr.width}" height="${fr.height}" as="geometry" />\n`;
      xml += `        </mxCell>\n`;

      if (fr.dividerY) {
        xml += `        <mxCell id="${cellId++}" value="${escapeXml(fr.dividerLabel || '')}" style="line;strokeWidth=1;dashed=1;labelPosition=center;verticalLabelPosition=top;align=left;spacingLeft=15;html=1;strokeColor=#d6b656;fontSize=11;fontStyle=1;" vertex="1" parent="1">\n`;
        xml += `          <mxGeometry x="${fr.x}" y="${fr.dividerY}" width="${fr.width}" height="10" as="geometry" />\n`;
        xml += `        </mxCell>\n`;
      }
    });
  }

  // Lifelines
  lifelines.forEach(ll => {
    const isActor = ll.type === 'actor';
    const style = isActor
      ? `shape=umlLifeline;participant=umlActor;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;verticalAlign=top;spacingTop=36;outlineConnect=0;size=40;fillColor=${ll.fill};strokeColor=${ll.stroke};fontStyle=1;fontSize=12;`
      : `shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=${ll.fill};strokeColor=${ll.stroke};fontSize=12;`;

    xml += `        <mxCell id="${ll.id}" value="${ll.name}" style="${style}" vertex="1" parent="1">\n`;
    xml += `          <mxGeometry x="${ll.x}" y="70" width="${ll.width}" height="${ll.height}" as="geometry" />\n`;
    xml += `        </mxCell>\n`;
  });

  // Messages
  messages.forEach(msg => {
    const isSync = msg.type === 'sync';
    const style = isSync
      ? `html=1;verticalAlign=bottom;endArrow=block;edgeStyle=orthogonalEdgeStyle;rounded=0;fontSize=11;fontStyle=${msg.fromX < 200 ? '1' : '0'};strokeColor=#182E3E;`
      : `html=1;verticalAlign=bottom;endArrow=open;dashed=1;endSize=8;edgeStyle=orthogonalEdgeStyle;rounded=0;fontSize=11;fontStyle=0;strokeColor=#4A6572;`;

    xml += `        <mxCell id="${cellId++}" value="${escapeXml(msg.label)}" style="${style}" edge="1" parent="1">\n`;
    xml += `          <mxGeometry relative="1" as="geometry">\n`;
    xml += `            <mxPoint x="${msg.fromX}" y="${msg.y}" as="sourcePoint" />\n`;
    xml += `            <mxPoint x="${msg.toX}" y="${msg.y}" as="targetPoint" />\n`;
    xml += `          </mxGeometry>\n`;
    xml += `        </mxCell>\n`;
  });

  return xml;
}

// Build complete multi-page draw.io XML
function buildMultiPageDrawio() {
  const p1 = buildUC03Diagram();
  const p2 = buildUC05Diagram();
  const p3 = buildUC051Diagram();
  const p4 = buildUC052Diagram();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="2026-11-09T16:40:00.000Z" agent="Antigravity/2.0" version="24.0.0" type="device">
  <diagram id="diag_uc03" name="UC03 - Request Rental">
    <mxGraphModel dx="1280" dy="780" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1200" pageHeight="750" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
${p1}      </root>
    </mxGraphModel>
  </diagram>
  <diagram id="diag_uc05" name="UC05 - Manage Contract">
    <mxGraphModel dx="1280" dy="780" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1200" pageHeight="800" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
${p2}      </root>
    </mxGraphModel>
  </diagram>
  <diagram id="diag_uc05_1" name="UC05.1 - Extend Contract">
    <mxGraphModel dx="1280" dy="780" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1100" pageHeight="700" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
${p3}      </root>
    </mxGraphModel>
  </diagram>
  <diagram id="diag_uc05_2" name="UC05.2 - Terminate Contract">
    <mxGraphModel dx="1280" dy="780" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1200" pageHeight="750" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
${p4}      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
`;
  return xml;
}

// Build single-page draw.io XML
function buildSinglePageDrawio(pageId, name, pageContent, width = 1200, height = 750) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="2026-11-09T16:40:00.000Z" agent="Antigravity/2.0" version="24.0.0" type="device">
  <diagram id="${pageId}" name="${name}">
    <mxGraphModel dx="1280" dy="780" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${width}" pageHeight="${height}" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
${pageContent}      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
`;
}

// Generate files
const outDir = path.join(__dirname, '..', 'docs', 'diagrams');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// 1. All-in-one file (4 tabs)
fs.writeFileSync(path.join(outDir, 'Sequence_Diagrams_Rental_Contract.drawio'), buildMultiPageDrawio(), 'utf8');

// 2. Individual files
fs.writeFileSync(path.join(outDir, 'UC03_Request_Rental.drawio'), buildSinglePageDrawio('diag_uc03', 'UC03 - Request Rental', buildUC03Diagram(), 1200, 750), 'utf8');
fs.writeFileSync(path.join(outDir, 'UC05_Manage_Contract.drawio'), buildSinglePageDrawio('diag_uc05', 'UC05 - Manage Contract', buildUC05Diagram(), 1200, 800), 'utf8');
fs.writeFileSync(path.join(outDir, 'UC05_1_Extend_Contract.drawio'), buildSinglePageDrawio('diag_uc05_1', 'UC05.1 - Extend Contract', buildUC051Diagram(), 1100, 700), 'utf8');
fs.writeFileSync(path.join(outDir, 'UC05_2_Terminate_Contract.drawio'), buildSinglePageDrawio('diag_uc05_2', 'UC05.2 - Terminate Contract', buildUC052Diagram(), 1200, 750), 'utf8');

console.log('✅ Generated 5 .drawio files successfully in docs/diagrams!');
