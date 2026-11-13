const fs = require('fs');
const path = require('path');

const DIAGRAMS_DIR = path.join(__dirname, 'diagrams');
const DOWNLOADS_DIR = 'C:\\Users\\nguye\\Downloads';

if (!fs.existsSync(DIAGRAMS_DIR)) {
  fs.mkdirSync(DIAGRAMS_DIR, { recursive: true });
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

function saveDiagram(fileName, xmlContent) {
  const filePath1 = path.join(DIAGRAMS_DIR, fileName);
  fs.writeFileSync(filePath1, xmlContent, 'utf8');
  console.log(`Saved: ${filePath1}`);

  try {
    const filePath2 = path.join(DOWNLOADS_DIR, fileName);
    fs.writeFileSync(filePath2, xmlContent, 'utf8');
    console.log(`Mirrored to Downloads: ${filePath2}`);
  } catch (err) {
    console.warn(`Could not mirror to Downloads: ${err.message}`);
  }
}

// -----------------------------------------------------------------------------
// 1. CLASS DIAGRAM: Module 2 (Room & Search Management)
// Matches EXACT layout of Image 1 (Sample Class Diagram)
// -----------------------------------------------------------------------------
function generateClassDiagram() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net">
  <diagram name="Class Diagram - Room Module" id="class-diagram-room-module">
    <mxGraphModel dx="1600" dy="1100" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="1100" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>

        <!-- ==================== LEFT SIDE: REPOSITORY & SERVICE PATTERN ==================== -->

        <!-- <<Interface>> IGenericRepository -->
        <mxCell id="repo_generic" value="&lt;b&gt;&amp;laquo;Interface&amp;raquo;&lt;br&gt;IGenericRepository&amp;lt;T, ID&amp;gt;&lt;/b&gt;&#xa;--&#xa;+ getById(id: ID): T&#xa;+ findAll(): List&amp;lt;T&amp;gt;&#xa;+ save(entity: T): T&#xa;+ deleteById(id: ID): void" style="swimlane;fontStyle=0;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=50;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="160" y="220" width="220" height="150" as="geometry"/>
        </mxCell>

        <!-- BookingRepository / RentalRequestRepository -->
        <mxCell id="repo_rental" value="&lt;b&gt;RentalRequestRepository&lt;/b&gt;&#xa;--&#xa;+ findByCustomerId(customerId: Long): List&amp;lt;RentalRequest&amp;gt;&#xa;+ findByRoomId(roomId: Long): List&amp;lt;RentalRequest&amp;gt;" style="swimlane;fontStyle=0;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#333333;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="60" y="420" width="230" height="80" as="geometry"/>
        </mxCell>

        <!-- CarRepository / RoomRepository -->
        <mxCell id="repo_room" value="&lt;b&gt;RoomRepository&lt;/b&gt;&#xa;--&#xa;+ findAvailableRoom(criteria: SearchCriteria): List&amp;lt;Room&amp;gt;&#xa;+ findByRoomNumber(roomNumber: String): Room" style="swimlane;fontStyle=0;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#333333;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="310" y="420" width="230" height="80" as="geometry"/>
        </mxCell>

        <!-- Realization: RentalRequestRepository - - |> IGenericRepository -->
        <mxCell id="rel_impl1" value="" style="endArrow=block;dashed=1;endFill=0;endSize=12;html=1;rounded=0;exitX=0.5;exitY=0;entryX=0.25;entryY=1;" edge="1" parent="1" source="repo_rental" target="repo_generic">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>

        <!-- Realization: RoomRepository - - |> IGenericRepository -->
        <mxCell id="rel_impl2" value="" style="endArrow=block;dashed=1;endFill=0;endSize=12;html=1;rounded=0;exitX=0.5;exitY=0;entryX=0.75;entryY=1;" edge="1" parent="1" source="repo_room" target="repo_generic">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>

        <!-- RoomService / BookingService -->
        <mxCell id="service_room" value="&lt;b&gt;RoomService&lt;/b&gt;&#xa;--&#xa;- roomRepository: RoomRepository&#xa;- rentalRequestRepository: RentalRequestRepository&#xa;--&#xa;+ checkAvailability(roomId: Long, checkIn: LocalDateTime): boolean&#xa;+ createBooking(dto: RentalBookingDTO): RentalRequest&#xa;+ searchRoom(criteria: SearchCriteria): List&amp;lt;Room&amp;gt;&#xa;+ createRoom(dto: CreateRoomDTO): Room&#xa;+ updateRoom(id: Long, dto: UpdateRoomDTO): Room&#xa;+ deleteRoom(id: Long): boolean" style="swimlane;fontStyle=0;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#333333;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="140" y="580" width="320" height="170" as="geometry"/>
        </mxCell>

        <!-- Use dependency: RoomService - - > RentalRequestRepository -->
        <mxCell id="rel_use1" value="Use" style="endArrow=open;dashed=1;html=1;rounded=0;exitX=0.25;exitY=0;entryX=0.5;entryY=1;" edge="1" parent="1" source="service_room" target="repo_rental">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>

        <!-- Use dependency: RoomService - - > RoomRepository -->
        <mxCell id="rel_use2" value="Use" style="endArrow=open;dashed=1;html=1;rounded=0;exitX=0.75;exitY=0;entryX=0.5;entryY=1;" edge="1" parent="1" source="service_room" target="repo_room">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>

        <!-- ==================== CENTER & RIGHT SIDE: DOMAIN ENTITIES ==================== -->

        <!-- Base Class: User -->
        <mxCell id="cls_user" value="&lt;b&gt;User&lt;/b&gt;&#xa;--&#xa;- id: Long&#xa;- fullName: String&#xa;- email: String&#xa;- password: String&#xa;- phone: String&#xa;- role: Role &amp;laquo;enum&amp;raquo;&#xa;- isActive: boolean&#xa;- createdAt: LocalDateTime&#xa;--&#xa;+ login()&#xa;+ logout()" style="swimlane;fontStyle=0;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#333333;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="780" y="40" width="220" height="200" as="geometry"/>
        </mxCell>

        <!-- Customer (Extends User) -->
        <mxCell id="cls_customer" value="&lt;b&gt;Customer&lt;/b&gt;&#xa;--&#xa;+ browseRoom()&#xa;+ searchRoom()&#xa;+ createRentalBooking()" style="swimlane;fontStyle=0;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#333333;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="660" y="320" width="200" height="90" as="geometry"/>
        </mxCell>

        <!-- Staff (Extends User) -->
        <mxCell id="cls_staff" value="&lt;b&gt;Staff&lt;/b&gt;&#xa;--&#xa;+ confirmBooking()&#xa;+ viewRoomBooking()&#xa;+ createRoom()&#xa;+ deleteRoom()&#xa;+ editRoom()" style="swimlane;fontStyle=0;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#333333;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="920" y="320" width="200" height="120" as="geometry"/>
        </mxCell>

        <!-- Inheritance: Customer Extends User -->
        <mxCell id="rel_ext1" value="Extends" style="endArrow=block;endFill=0;endSize=12;html=1;rounded=0;exitX=0.5;exitY=0;entryX=0.25;entryY=1;" edge="1" parent="1" source="cls_customer" target="cls_user">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>

        <!-- Inheritance: Staff Extends User -->
        <mxCell id="rel_ext2" value="Extends" style="endArrow=block;endFill=0;endSize=12;html=1;rounded=0;exitX=0.5;exitY=0;entryX=0.75;entryY=1;" edge="1" parent="1" source="cls_staff" target="cls_user">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>

        <!-- Booking / RentalRequest -->
        <mxCell id="cls_booking" value="&lt;b&gt;RentalRequest&lt;/b&gt;&#xa;--&#xa;- id: Long&#xa;- checkInDate: LocalDateTime&#xa;- checkOutDate: LocalDateTime&#xa;- totalAmount: BigDecimal&#xa;- status: BookingStatus &amp;laquo;enum&amp;raquo;&#xa;- createdAt: LocalDateTime&#xa;--&#xa;+ confirm()&#xa;+ cancel()" style="swimlane;fontStyle=0;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#333333;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="650" y="490" width="220" height="170" as="geometry"/>
        </mxCell>

        <!-- Association: Customer creates RentalRequest (1 to 0..1*) -->
        <mxCell id="rel_cust_book" value="creates" style="endArrow=none;html=1;rounded=0;exitX=0.5;exitY=1;entryX=0.5;entryY=0;" edge="1" parent="1" source="cls_customer" target="cls_booking">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="750" y="420" as="sourcePoint"/>
            <mxPoint x="750" y="480" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="lbl_cust_book_1" value="1" style="edgeLabel;resizable=0;html=1;align=left;verticalAlign=bottom;" connectable="0" vertex="1" parent="rel_cust_book">
          <mxGeometry x="-0.8" relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="lbl_cust_book_n" value="0..1*" style="edgeLabel;resizable=0;html=1;align=right;verticalAlign=top;" connectable="0" vertex="1" parent="rel_cust_book">
          <mxGeometry x="0.8" relative="1" as="geometry"/>
        </mxCell>

        <!-- Payment -->
        <mxCell id="cls_payment" value="&lt;b&gt;Payment&lt;/b&gt;&#xa;--&#xa;- id: Long&#xa;- amount: BigDecimal&#xa;- type: PaymentType &amp;laquo;enum&amp;raquo;&#xa;- status: PaymentStatus &amp;laquo;enum&amp;raquo;&#xa;- paidAt: LocalDateTime&#xa;--&#xa;+ process()" style="swimlane;fontStyle=0;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#333333;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="980" y="500" width="230" height="150" as="geometry"/>
        </mxCell>

        <!-- Association: RentalRequest involves Payment (1 involves 1..*) -->
        <mxCell id="rel_book_pay" value="involves" style="endArrow=none;startArrow=diamond;startFill=1;startSize=14;html=1;rounded=0;exitX=1;exitY=0.5;entryX=0;entryY=0.5;" edge="1" parent="1" source="cls_booking" target="cls_payment">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="lbl_book_pay_1" value="1" style="edgeLabel;resizable=0;html=1;align=left;verticalAlign=bottom;" connectable="0" vertex="1" parent="rel_book_pay">
          <mxGeometry x="-0.7" relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="lbl_book_pay_n" value="1..*" style="edgeLabel;resizable=0;html=1;align=right;verticalAlign=bottom;" connectable="0" vertex="1" parent="rel_book_pay">
          <mxGeometry x="0.7" relative="1" as="geometry"/>
        </mxCell>

        <!-- Car / Room -->
        <mxCell id="cls_room" value="&lt;b&gt;Room&lt;/b&gt;&#xa;--&#xa;- id: Long&#xa;- roomNumber: String&#xa;- type: RoomType &amp;laquo;enum&amp;raquo;&#xa;- price: BigDecimal&#xa;- status: RoomStatus &amp;laquo;enum&amp;raquo;&#xa;- createdAt: LocalDateTime&#xa;--&#xa;+ checkAvailability()" style="swimlane;fontStyle=0;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#333333;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="660" y="740" width="200" height="160" as="geometry"/>
        </mxCell>

        <!-- Association: RentalRequest linked to Room (0..1* linked to 1) -->
        <mxCell id="rel_book_room" value="linked to" style="endArrow=none;html=1;rounded=0;exitX=0.5;exitY=1;entryX=0.5;entryY=0;" edge="1" parent="1" source="cls_booking" target="cls_room">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="lbl_book_room_n" value="0..1*" style="edgeLabel;resizable=0;html=1;align=left;verticalAlign=top;" connectable="0" vertex="1" parent="rel_book_room">
          <mxGeometry x="-0.7" relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="lbl_book_room_1" value="1" style="edgeLabel;resizable=0;html=1;align=right;verticalAlign=bottom;" connectable="0" vertex="1" parent="rel_book_room">
          <mxGeometry x="0.7" relative="1" as="geometry"/>
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

  saveDiagram('ClassDiagram_Room_Module.drawio', xml);
}

// -----------------------------------------------------------------------------
// 2. SEQUENCE DIAGRAMS (5 Diagrams matching Image 2 Template)
// Lifeline Order:
// Actor -> «user interaction» UI -> «control» Controller -> «service» Service -> «repository» Repository -> «entity» Entity
// -----------------------------------------------------------------------------

function buildSequenceXml(diagramName, diagramId, actorName, uiName, ctrlName, srvName, repo1Name, repo2Name, entityName, altGuardTrue, altGuardFalse, messages) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net">
  <diagram name="${diagramName}" id="${diagramId}">
    <mxGraphModel dx="1600" dy="1200" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="1300" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>

        <!-- Lifelines with stereotypes in header -->
        <mxCell id="lf_actor" value="${actorName}" style="shape=umlLifeline;participant=umlActor;perimeter=lifelinePerimeter;whiteSpace=nowrap;html=1;container=1;collapsible=0;recursiveResize=0;verticalAlign=top;spacingTop=52;outlineConnect=0;size=50;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="60" y="40" width="30" height="1150" as="geometry"/>
        </mxCell>
        
        <mxCell id="lf_ui" value="&amp;laquo;user interaction&amp;raquo;&lt;br&gt;&lt;b&gt;${uiName}&lt;/b&gt;" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=50;fillColor=#b0e3e6;strokeColor=#0e8088;" vertex="1" parent="1">
          <mxGeometry x="180" y="40" width="160" height="1150" as="geometry"/>
        </mxCell>

        <mxCell id="lf_ctrl" value="&amp;laquo;control&amp;raquo;&lt;br&gt;&lt;b&gt;${ctrlName}&lt;/b&gt;" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=50;fillColor=#b0e3e6;strokeColor=#0e8088;" vertex="1" parent="1">
          <mxGeometry x="400" y="40" width="160" height="1150" as="geometry"/>
        </mxCell>

        <mxCell id="lf_srv" value="&amp;laquo;service&amp;raquo;&lt;br&gt;&lt;b&gt;${srvName}&lt;/b&gt;" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=50;fillColor=#b0e3e6;strokeColor=#0e8088;" vertex="1" parent="1">
          <mxGeometry x="620" y="40" width="160" height="1150" as="geometry"/>
        </mxCell>

        <mxCell id="lf_repo1" value="&amp;laquo;repository&amp;raquo;&lt;br&gt;&lt;b&gt;${repo1Name}&lt;/b&gt;" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=50;fillColor=#b0e3e6;strokeColor=#0e8088;" vertex="1" parent="1">
          <mxGeometry x="840" y="40" width="160" height="1150" as="geometry"/>
        </mxCell>`;

  if (repo2Name) {
    xml += `
        <mxCell id="lf_repo2" value="&amp;laquo;repository&amp;raquo;&lt;br&gt;&lt;b&gt;${repo2Name}&lt;/b&gt;" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=50;fillColor=#b0e3e6;strokeColor=#0e8088;" vertex="1" parent="1">
          <mxGeometry x="1060" y="40" width="160" height="1150" as="geometry"/>
        </mxCell>`;
  }

  if (entityName) {
    const entityX = repo2Name ? 1280 : 1060;
    xml += `
        <mxCell id="lf_entity" value="&amp;laquo;entity&amp;raquo;&lt;br&gt;&lt;b&gt;${entityName}&lt;/b&gt;" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=50;fillColor=#b0e3e6;strokeColor=#0e8088;" vertex="1" parent="1">
          <mxGeometry x="${entityX}" y="40" width="150" height="1150" as="geometry"/>
        </mxCell>`;
  }

  // Add messages
  messages.forEach((msg, idx) => {
    const isReturn = msg.isReturn;
    const isCreate = msg.isCreate;
    const arrowStyle = isReturn 
      ? 'endArrow=open;dashed=1;endFill=0;html=1;rounded=0;' 
      : (isCreate ? 'endArrow=open;dashed=1;endFill=0;html=1;rounded=0;' : 'endArrow=block;endFill=1;html=1;rounded=0;');
    
    xml += `
        <!-- Message ${msg.num}: ${escapeXml(msg.text)} -->
        <mxCell id="msg_${idx}" value="${msg.num}: ${escapeXml(msg.text)}" style="${arrowStyle}exitX=0.5;exitY=0;entryX=0.5;entryY=0;fontSize=11;verticalAlign=bottom;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="${msg.fromX}" y="${msg.y}" as="sourcePoint"/>
            <mxPoint x="${msg.toX}" y="${msg.y}" as="targetPoint"/>
          </mxGeometry>
        </mxCell>`;
  });

  // Alt Frame
  if (altGuardTrue) {
    xml += `
        <!-- Alt Frame -->
        <mxCell id="alt_frame" value="alt" style="shape=umlFrame;whiteSpace=wrap;html=1;pointerEvents=0;width=40;height=20;fontSize=12;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="40" y="380" width="1400" height="660" as="geometry"/>
        </mxCell>
        <mxCell id="lbl_guard_true" value="[${escapeXml(altGuardTrue)}]" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=11;fontStyle=2;" vertex="1" parent="1">
          <mxGeometry x="50" y="410" width="150" height="20" as="geometry"/>
        </mxCell>
        <!-- Alt Divider -->
        <mxCell id="alt_divider" value="" style="endArrow=none;dashed=1;html=1;rounded=0;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="40" y="860" as="sourcePoint"/>
            <mxPoint x="1440" y="860" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="lbl_guard_false" value="[${escapeXml(altGuardFalse)}]" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=11;fontStyle=2;" vertex="1" parent="1">
          <mxGeometry x="50" y="870" width="150" height="20" as="geometry"/>
        </mxCell>`;
  }

  xml += `
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

  return xml;
}

// -----------------------------------------------------------------------------
// Sequence Diagram 1: UC-M03 Request Rental (Booking)
// Perfectly matches Image 2 (Sample Sequence Diagram)
// -----------------------------------------------------------------------------
function generateUCM03() {
  // Lifeline Center X coordinates:
  // Actor: 75
  // UI: 260
  // Controller: 480
  // Service: 700
  // RoomRepository: 920
  // RentalRequestRepository: 1140
  // Room: 1355

  const msgs = [
    { num: '1', text: 'requestRentalBooking(roomId, checkIn, checkOut)', fromX: 75, toX: 260, y: 130 },
    { num: '2', text: 'POST /api/rooms/rental-booking', fromX: 260, toX: 480, y: 170 },
    { num: '3', text: 'checkRoomAvailable(roomId, checkIn, checkOut)', fromX: 480, toX: 700, y: 210 },
    { num: '4', text: 'findById(roomId)', fromX: 700, toX: 920, y: 250 },
    { num: '5', text: 'load(roomId)', fromX: 920, toX: 1355, y: 290 },
    { num: '6', text: 'Room entity', fromX: 1355, toX: 920, y: 320, isReturn: true },
    { num: '7', text: 'return Room', fromX: 920, toX: 700, y: 350, isReturn: true },

    // Alt [available]
    { num: '8', text: 'available = true', fromX: 700, toX: 480, y: 440, isReturn: true },
    { num: '9', text: 'generateNewBooking(customerId, roomId, checkIn, checkOut)', fromX: 480, toX: 700, y: 480 },
    { num: '10', text: '«create» new RentalRequest', fromX: 700, toX: 1140, y: 520, isCreate: true },
    { num: '11', text: 'saveRentalRequest()', fromX: 700, toX: 1140, y: 560 },
    { num: '12', text: 'RentalRequest', fromX: 1140, toX: 700, y: 590, isReturn: true },
    { num: '13', text: 'return RentalRequest', fromX: 700, toX: 480, y: 620, isReturn: true },
    { num: '14', text: 'create successful', fromX: 480, toX: 700, y: 650 },
    { num: '15', text: 'updateRoomStatus(roomId, RESERVED)', fromX: 700, toX: 920, y: 690 },
    { num: '16', text: 'updateRoomStatus(roomId, UNAVAILABLE)', fromX: 920, toX: 1355, y: 730 },
    { num: '17', text: 'update Response', fromX: 920, toX: 700, y: 760, isReturn: true },
    { num: '18', text: 'confirmBooking(trackingId)', fromX: 480, toX: 260, y: 800, isReturn: true },
    { num: '18b', text: 'Rental Booking Confirmed', fromX: 260, toX: 75, y: 830, isReturn: true },

    // Alt [unavailable]
    { num: '19', text: 'available = false', fromX: 700, toX: 480, y: 910, isReturn: true },
    { num: '20', text: '400 Bad Request ("Room is unavailable")', fromX: 480, toX: 260, y: 950, isReturn: true },
    { num: '21', text: 'showBookingErrorToast("Room not available")', fromX: 260, toX: 75, y: 990, isReturn: true }
  ];

  const xml = buildSequenceXml(
    'UC-M03 Request Rental',
    'uc-m03-request-rental',
    'Customer',
    'Rental Booking View',
    'RoomController',
    'RoomService',
    'RoomRepository',
    'RentalRequestRepository',
    'Room',
    'available',
    'unavailable',
    msgs
  );

  saveDiagram('UC-M03_Request_Rental_SequenceDiagram.drawio', xml);
}

// -----------------------------------------------------------------------------
// Sequence Diagram 2: UC-M02 Search & Filter Rooms
// -----------------------------------------------------------------------------
function generateUCM02() {
  const msgs = [
    { num: '1', text: 'enterSearchCriteria(keyword, priceMin, priceMax, roomType)', fromX: 75, toX: 260, y: 130 },
    { num: '2', text: 'GET /api/rooms/search?keyword=...&priceMin=...', fromX: 260, toX: 480, y: 170 },
    { num: '3', text: 'searchRoom(searchCriteria)', fromX: 480, toX: 700, y: 210 },
    { num: '4', text: 'findAvailableRoom(criteria)', fromX: 700, toX: 920, y: 250 },
    { num: '5', text: 'queryAvailable(criteria)', fromX: 920, toX: 1140, y: 290 },
    { num: '6', text: 'List<Room> entities', fromX: 1140, toX: 920, y: 320, isReturn: true },
    { num: '7', text: 'return List<Room>', fromX: 920, toX: 700, y: 350, isReturn: true },

    // Alt [rooms.size() > 0]
    { num: '8', text: 'hasResults = true', fromX: 700, toX: 480, y: 440, isReturn: true },
    { num: '9', text: 'formatRoomCards(rooms)', fromX: 480, toX: 700, y: 490 },
    { num: '10', text: 'return 200 OK (rooms array)', fromX: 700, toX: 480, y: 530, isReturn: true },
    { num: '11', text: 'renderRoomList(rooms)', fromX: 480, toX: 260, y: 570, isReturn: true },
    { num: '12', text: 'displayRoomCards(results)', fromX: 260, toX: 75, y: 610, isReturn: true },

    // Alt [rooms.isEmpty()]
    { num: '13', text: 'hasResults = false', fromX: 700, toX: 480, y: 910, isReturn: true },
    { num: '14', text: 'return 200 OK (empty array)', fromX: 480, toX: 260, y: 950, isReturn: true },
    { num: '15', text: 'displayEmptyPlaceholder("No matching rooms found")', fromX: 260, toX: 75, y: 990, isReturn: true }
  ];

  const xml = buildSequenceXml(
    'UC-M02 Search Rooms',
    'uc-m02-search-rooms',
    'Customer',
    'RoomSearchView',
    'RoomController',
    'RoomService',
    'RoomRepository',
    null,
    'Room',
    'rooms.size() > 0',
    'rooms.isEmpty()',
    msgs
  );

  saveDiagram('UC-M02_Search_Room_SequenceDiagram.drawio', xml);
}

// -----------------------------------------------------------------------------
// Sequence Diagram 3: UC-M04.1 Create Room
// -----------------------------------------------------------------------------
function generateUCM04_1() {
  const msgs = [
    { num: '1', text: 'inputRoomDetails(roomNumber, type, price, area)', fromX: 75, toX: 260, y: 130 },
    { num: '2', text: 'POST /api/rooms', fromX: 260, toX: 480, y: 170 },
    { num: '3', text: 'createRoom(createRoomDTO)', fromX: 480, toX: 700, y: 210 },
    { num: '4', text: 'findByRoomNumber(roomNumber)', fromX: 700, toX: 920, y: 250 },
    { num: '5', text: 'queryByNumber(roomNumber)', fromX: 920, toX: 1140, y: 290 },
    { num: '6', text: 'existingRoom document', fromX: 1140, toX: 920, y: 320, isReturn: true },
    { num: '7', text: 'return existingRoom', fromX: 920, toX: 700, y: 350, isReturn: true },

    // Alt [existingRoom == null (Unique)]
    { num: '8', text: 'isValid = true', fromX: 700, toX: 480, y: 440, isReturn: true },
    { num: '9', text: '«create» new Room(roomNumber, type, price, AVAILABLE)', fromX: 700, toX: 1140, y: 490, isCreate: true },
    { num: '10', text: 'save(newRoom)', fromX: 700, toX: 920, y: 530 },
    { num: '11', text: 'saved Room entity', fromX: 920, toX: 700, y: 570, isReturn: true },
    { num: '12', text: 'return 201 Created (Room)', fromX: 700, toX: 480, y: 610, isReturn: true },
    { num: '13', text: 'displaySuccessToast("Room created successfully")', fromX: 480, toX: 260, y: 650, isReturn: true },
    { num: '14', text: 'showRoomCreated()', fromX: 260, toX: 75, y: 690, isReturn: true },

    // Alt [existingRoom != null (Duplicate)]
    { num: '15', text: 'isValid = false', fromX: 700, toX: 480, y: 910, isReturn: true },
    { num: '16', text: 'return 409 Conflict ("Room number already exists")', fromX: 480, toX: 260, y: 950, isReturn: true },
    { num: '17', text: 'displayValidationError("Duplicate room number")', fromX: 260, toX: 75, y: 990, isReturn: true }
  ];

  const xml = buildSequenceXml(
    'UC-M04.1 Create Room',
    'uc-m04-1-create-room',
    'Staff',
    'CreateRoomView',
    'RoomController',
    'RoomService',
    'RoomRepository',
    null,
    'Room',
    'existingRoom == null (Unique)',
    'existingRoom != null (Duplicate)',
    msgs
  );

  saveDiagram('UC-M04_1_Create_Room_SequenceDiagram.drawio', xml);
}

// -----------------------------------------------------------------------------
// Sequence Diagram 4: UC-M04.2 Update Room Info
// -----------------------------------------------------------------------------
function generateUCM04_2() {
  const msgs = [
    { num: '1', text: 'modifyRoomInfo(roomId, newPrice, newType, newStatus)', fromX: 75, toX: 260, y: 130 },
    { num: '2', text: 'PUT /api/rooms/{id}', fromX: 260, toX: 480, y: 170 },
    { num: '3', text: 'updateRoom(roomId, updateRoomDTO)', fromX: 480, toX: 700, y: 210 },
    { num: '4', text: 'findById(roomId)', fromX: 700, toX: 920, y: 250 },
    { num: '5', text: 'load(roomId)', fromX: 920, toX: 1140, y: 290 },
    { num: '6', text: 'Room entity', fromX: 1140, toX: 920, y: 320, isReturn: true },
    { num: '7', text: 'return room', fromX: 920, toX: 700, y: 350, isReturn: true },

    // Alt [room != null]
    { num: '8', text: 'isFound = true', fromX: 700, toX: 480, y: 440, isReturn: true },
    { num: '9', text: 'updateAttributes(price, type, status)', fromX: 700, toX: 1140, y: 490 },
    { num: '10', text: 'save(room)', fromX: 700, toX: 920, y: 530 },
    { num: '11', text: 'updated Room entity', fromX: 920, toX: 700, y: 570, isReturn: true },
    { num: '12', text: 'return 200 OK (updatedRoom)', fromX: 700, toX: 480, y: 610, isReturn: true },
    { num: '13', text: 'displaySuccessToast("Room updated successfully")', fromX: 480, toX: 260, y: 650, isReturn: true },
    { num: '14', text: 'showUpdatedRoomDetails()', fromX: 260, toX: 75, y: 690, isReturn: true },

    // Alt [room == null]
    { num: '15', text: 'isFound = false', fromX: 700, toX: 480, y: 910, isReturn: true },
    { num: '16', text: 'return 404 Not Found ("Room does not exist")', fromX: 480, toX: 260, y: 950, isReturn: true },
    { num: '17', text: 'displayErrorMessage("Room not found")', fromX: 260, toX: 75, y: 990, isReturn: true }
  ];

  const xml = buildSequenceXml(
    'UC-M04.2 Update Room',
    'uc-m04-2-update-room',
    'Staff',
    'EditRoomView',
    'RoomController',
    'RoomService',
    'RoomRepository',
    null,
    'Room',
    'room != null',
    'room == null',
    msgs
  );

  saveDiagram('UC-M04_2_Update_Room_SequenceDiagram.drawio', xml);
}

// -----------------------------------------------------------------------------
// Sequence Diagram 5: UC-M04.3 Delete Room
// -----------------------------------------------------------------------------
function generateUCM04_3() {
  const msgs = [
    { num: '1', text: 'requestDeleteRoom(roomId)', fromX: 75, toX: 260, y: 130 },
    { num: '2', text: 'DELETE /api/rooms/{id}', fromX: 260, toX: 480, y: 170 },
    { num: '3', text: 'deleteRoom(roomId)', fromX: 480, toX: 700, y: 210 },
    { num: '4', text: 'findById(roomId)', fromX: 700, toX: 920, y: 250 },
    { num: '5', text: 'load(roomId)', fromX: 920, toX: 1140, y: 290 },
    { num: '6', text: 'Room entity', fromX: 1140, toX: 920, y: 320, isReturn: true },
    { num: '7', text: 'return room', fromX: 920, toX: 700, y: 350, isReturn: true },

    // Alt [room.status != RENTED]
    { num: '8', text: 'canDelete = true', fromX: 700, toX: 480, y: 440, isReturn: true },
    { num: '9', text: 'deleteById(roomId)', fromX: 700, toX: 920, y: 490 },
    { num: '10', text: 'confirm delete', fromX: 920, toX: 700, y: 530, isReturn: true },
    { num: '11', text: 'return 200 OK ("Room deleted successfully")', fromX: 700, toX: 480, y: 570, isReturn: true },
    { num: '12', text: 'refreshRoomTable("Room deleted")', fromX: 480, toX: 260, y: 610, isReturn: true },
    { num: '13', text: 'displayDeleteConfirmation()', fromX: 260, toX: 75, y: 650, isReturn: true },

    // Alt [room.status == RENTED]
    { num: '14', text: 'canDelete = false', fromX: 700, toX: 480, y: 910, isReturn: true },
    { num: '15', text: 'return 400 Bad Request ("Cannot delete occupied room under active lease")', fromX: 480, toX: 260, y: 950, isReturn: true },
    { num: '16', text: 'displayWarningAlert("Cannot delete room currently rented")', fromX: 260, toX: 75, y: 990, isReturn: true }
  ];

  const xml = buildSequenceXml(
    'UC-M04.3 Delete Room',
    'uc-m04-3-delete-room',
    'Staff',
    'RoomListView',
    'RoomController',
    'RoomService',
    'RoomRepository',
    null,
    'Room',
    'room.status != RENTED',
    'room.status == RENTED',
    msgs
  );

  saveDiagram('UC-M04_3_Delete_Room_SequenceDiagram.drawio', xml);
}

// Run all generators
console.log('Generating Module 2 Draw.io diagrams matching user reference templates...');
generateClassDiagram();
generateUCM03();
generateUCM02();
generateUCM04_1();
generateUCM04_2();
generateUCM04_3();
console.log('All Module 2 Draw.io diagrams generated successfully!');
