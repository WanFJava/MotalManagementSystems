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
// 1. CLASS DIAGRAM (Unchanged)
// -----------------------------------------------------------------------------
function generateClassDiagram() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net">
  <diagram name="Class Diagram - Room Module" id="class-diagram-room-module">
    <mxGraphModel dx="1600" dy="1100" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="1100" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>

        <!-- <<Interface>> IGenericRepository -->
        <mxCell id="repo_generic" value="&lt;b&gt;&amp;laquo;Interface&amp;raquo;&lt;br&gt;IGenericRepository&lt;/b&gt;&#xa;--&#xa;+ getById()&#xa;+ findAll()&#xa;+ save()&#xa;+ deleteById()" style="swimlane;fontStyle=0;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=50;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="150" y="170" width="220" height="150" as="geometry"/>
        </mxCell>

        <!-- RentalRequestRepository -->
        <mxCell id="repo_rental" value="&lt;b&gt;RentalRequestRepository&lt;/b&gt;&#xa;--&#xa;+ findByCustomerId()&#xa;+ findByRoomId()" style="swimlane;fontStyle=0;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#333333;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="50" y="370" width="200" height="80" as="geometry"/>
        </mxCell>

        <!-- RoomRepository -->
        <mxCell id="repo_room" value="&lt;b&gt;RoomRepository&lt;/b&gt;&#xa;--&#xa;+ findAvailableRoom()&#xa;+ findByRoomNumber()" style="swimlane;fontStyle=0;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#333333;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="270" y="370" width="200" height="80" as="geometry"/>
        </mxCell>

        <!-- Implements arrows -->
        <mxCell id="rel_impl1" value="" style="endArrow=block;dashed=1;endFill=0;endSize=12;html=1;rounded=0;exitX=0.5;exitY=0;entryX=0.25;entryY=1;" edge="1" parent="1" source="repo_rental" target="repo_generic">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="rel_impl2" value="" style="endArrow=block;dashed=1;endFill=0;endSize=12;html=1;rounded=0;exitX=0.5;exitY=0;entryX=0.75;entryY=1;" edge="1" parent="1" source="repo_room" target="repo_generic">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>

        <!-- RoomService -->
        <mxCell id="service_room" value="&lt;b&gt;RoomService&lt;/b&gt;&#xa;--&#xa;- roomRepository: RoomRepository&#xa;- rentalRequestRepo: RentalRequestRepository&#xa;--&#xa;+ checkAvailability()&#xa;+ createBooking()&#xa;+ searchRoom()&#xa;+ createRoom()&#xa;+ updateRoom()&#xa;+ deleteRoom()" style="swimlane;fontStyle=0;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#333333;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="70" y="550" width="360" height="210" as="geometry"/>
        </mxCell>

        <!-- Use dependencies -->
        <mxCell id="rel_use1" value="Use" style="endArrow=open;dashed=1;html=1;rounded=0;exitX=0.25;exitY=0;entryX=0.5;entryY=1;" edge="1" parent="1" source="service_room" target="repo_rental">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="rel_use2" value="Use" style="endArrow=open;dashed=1;html=1;rounded=0;exitX=0.75;exitY=0;entryX=0.5;entryY=1;" edge="1" parent="1" source="service_room" target="repo_room">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>

        <!-- User -->
        <mxCell id="cls_user" value="&lt;b&gt;User&lt;/b&gt;&#xa;--&#xa;- id: Long&#xa;- fullName: String&#xa;- email: String&#xa;- password: String&#xa;- phone: String&#xa;- role: Role &amp;laquo;enum&amp;raquo;&#xa;- isActive: boolean&#xa;- createdAt: LocalDateTime&#xa;--&#xa;+ login()&#xa;+ logout()" style="swimlane;fontStyle=0;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#333333;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="790" y="60" width="230" height="250" as="geometry"/>
        </mxCell>

        <!-- Customer -->
        <mxCell id="cls_customer" value="&lt;b&gt;Customer&lt;/b&gt;&#xa;--&#xa;+ browseRoom()&#xa;+ searchRoom()&#xa;+ createRentalBooking()" style="swimlane;fontStyle=0;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#333333;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="660" y="370" width="200" height="90" as="geometry"/>
        </mxCell>

        <!-- Staff -->
        <mxCell id="cls_staff" value="&lt;b&gt;Staff&lt;/b&gt;&#xa;--&#xa;+ confirmBooking()&#xa;+ viewRoomBooking()&#xa;+ createRoom()&#xa;+ deleteRoom()&#xa;+ editRoom()" style="swimlane;fontStyle=0;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#333333;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="930" y="370" width="200" height="120" as="geometry"/>
        </mxCell>

        <!-- Extends arrows -->
        <mxCell id="rel_ext1" value="Extends" style="endArrow=block;endFill=0;endSize=12;html=1;rounded=0;exitX=0.5;exitY=0;entryX=0.25;entryY=1;" edge="1" parent="1" source="cls_customer" target="cls_user">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="rel_ext2" value="Extends" style="endArrow=block;endFill=0;endSize=12;html=1;rounded=0;exitX=0.5;exitY=0;entryX=0.75;entryY=1;" edge="1" parent="1" source="cls_staff" target="cls_user">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>

        <!-- RentalRequest -->
        <mxCell id="cls_booking" value="&lt;b&gt;RentalRequest&lt;/b&gt;&#xa;--&#xa;- id: Long&#xa;- checkInDate: LocalDateTime&#xa;- checkOutDate: LocalDateTime&#xa;- totalAmount: BigDecimal&#xa;- status: BookingStatus &amp;laquo;enum&amp;raquo;&#xa;- createdAt: LocalDateTime&#xa;--&#xa;+ confirm()&#xa;+ cancel()" style="swimlane;fontStyle=0;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#333333;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="650" y="550" width="220" height="210" as="geometry"/>
        </mxCell>

        <!-- Customer creates RentalRequest (1 creates 0..1*) -->
        <mxCell id="rel_cust_book" value="creates" style="endArrow=none;html=1;rounded=0;exitX=0.5;exitY=1;entryX=0.5;entryY=0;" edge="1" parent="1" source="cls_customer" target="cls_booking">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>

        <!-- Payment -->
        <mxCell id="cls_payment" value="&lt;b&gt;Payment&lt;/b&gt;&#xa;--&#xa;- id: Long&#xa;- amount: BigDecimal&#xa;- type: PaymentType &amp;laquo;enum&amp;raquo;&#xa;- status: PaymentStatus &amp;laquo;enum&amp;raquo;&#xa;- paidAt: LocalDateTime&#xa;--&#xa;+ process()" style="swimlane;fontStyle=0;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#333333;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="1000" y="550" width="220" height="150" as="geometry"/>
        </mxCell>

        <!-- RentalRequest involves Payment (1 involves 1..*) -->
        <mxCell id="rel_book_pay" value="involves" style="endArrow=none;startArrow=diamond;startFill=1;startSize=14;html=1;rounded=0;exitX=1;exitY=0.5;entryX=0;entryY=0.5;" edge="1" parent="1" source="cls_booking" target="cls_payment">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>

        <!-- Room -->
        <mxCell id="cls_room" value="&lt;b&gt;Room&lt;/b&gt;&#xa;--&#xa;- id: Long&#xa;- roomNumber: String&#xa;- type: RoomType &amp;laquo;enum&amp;raquo;&#xa;- price: BigDecimal&#xa;- status: RoomStatus &amp;laquo;enum&amp;raquo;&#xa;- createdAt: LocalDateTime&#xa;--&#xa;+ checkAvailability()" style="swimlane;fontStyle=0;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#333333;rounded=0;" vertex="1" parent="1">
          <mxGeometry x="660" y="850" width="200" height="160" as="geometry"/>
        </mxCell>

        <!-- RentalRequest linked to Room (0..1* linked to 1) -->
        <mxCell id="rel_book_room" value="linked to" style="endArrow=none;html=1;rounded=0;exitX=0.5;exitY=1;entryX=0.5;entryY=0;" edge="1" parent="1" source="cls_booking" target="cls_room">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

  saveDiagram('ClassDiagram_Room_Module.drawio', xml);
}

// -----------------------------------------------------------------------------
// Generic Sequence XML Builder: NO REPOSITORY
// Lifelines: Actor -> «user interaction» UI -> «control» Controller -> «service» Service -> «model» Model -> «database» MongoDB
// -----------------------------------------------------------------------------
function buildSequenceXml(diagramName, diagramId, actorName, lifelines, altGuardTrue, altGuardFalse, messages) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net">
  <diagram name="${diagramName}" id="${diagramId}">
    <mxGraphModel dx="1600" dy="1200" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="1300" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>

        <!-- Actor -->
        <mxCell id="lf_actor" value="${actorName}" style="shape=umlLifeline;participant=umlActor;perimeter=lifelinePerimeter;whiteSpace=nowrap;html=1;container=1;collapsible=0;recursiveResize=0;verticalAlign=top;spacingTop=52;outlineConnect=0;size=50;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="55" y="40" width="30" height="1150" as="geometry"/>
        </mxCell>`;

  lifelines.forEach((ll, idx) => {
    const isDb = ll.stereo === 'database';
    const fillCol = isDb ? '#d5e8d4' : '#b0e3e6';
    const strkCol = isDb ? '#82b366' : '#0e8088';
    xml += `
        <mxCell id="lf_${idx}" value="&amp;laquo;${ll.stereo}&amp;raquo;&lt;br&gt;&lt;b&gt;${ll.name}&lt;/b&gt;" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=50;fillColor=${fillCol};strokeColor=${strkCol};" vertex="1" parent="1">
          <mxGeometry x="${ll.x - 80}" y="40" width="160" height="1150" as="geometry"/>
        </mxCell>`;
  });

  // Messages
  messages.forEach((msg, idx) => {
    const isReturn = msg.isReturn;
    const isCreate = msg.isCreate;
    const arrowStyle = isReturn 
      ? 'endArrow=open;dashed=1;endFill=0;html=1;rounded=0;' 
      : (isCreate ? 'endArrow=open;dashed=1;endFill=0;html=1;rounded=0;' : 'endArrow=block;endFill=1;html=1;rounded=0;');
    
    xml += `
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
        <mxCell id="alt_frame" value="alt" style="shape=umlFrame;whiteSpace=wrap;html=1;pointerEvents=0;width=40;height=20;fontSize=12;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="35" y="380" width="1480" height="670" as="geometry"/>
        </mxCell>
        <mxCell id="lbl_guard_true" value="[${escapeXml(altGuardTrue)}]" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=11;fontStyle=2;" vertex="1" parent="1">
          <mxGeometry x="45" y="410" width="240" height="20" as="geometry"/>
        </mxCell>
        <mxCell id="alt_divider" value="" style="endArrow=none;dashed=1;html=1;rounded=0;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="35" y="860" as="sourcePoint"/>
            <mxPoint x="1515" y="860" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="lbl_guard_false" value="[${escapeXml(altGuardFalse)}]" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=11;fontStyle=2;" vertex="1" parent="1">
          <mxGeometry x="45" y="870" width="240" height="20" as="geometry"/>
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
// Lifelines: Customer -> UI -> Controller -> Service -> Model: Room -> Model: RentalRequest -> Database: MongoDB
// -----------------------------------------------------------------------------
function generateUCM03() {
  const lifelines = [
    { x: 230, stereo: 'user interaction', name: 'Rental Booking View' },
    { x: 440, stereo: 'control', name: 'RoomController' },
    { x: 670, stereo: 'service', name: 'RoomService' },
    { x: 910, stereo: 'model', name: 'Room' },
    { x: 1150, stereo: 'model', name: 'RentalRequest' },
    { x: 1400, stereo: 'database', name: 'MongoDB' }
  ];

  const msgs = [
    { num: '1', text: 'requestRentalBooking(roomId, checkIn, checkOut)', fromX: 70, toX: 230, y: 130 },
    { num: '2', text: 'POST /api/rooms/rental-booking', fromX: 230, toX: 440, y: 170 },
    { num: '3', text: 'checkRoomAvailable(roomId, checkIn, checkOut)', fromX: 440, toX: 670, y: 210 },
    { num: '4', text: 'findById(roomId)', fromX: 670, toX: 910, y: 250 },
    { num: '5', text: 'db.rooms.findOne({ _id: roomId })', fromX: 910, toX: 1400, y: 290 },
    { num: '6', text: 'room document (BSON)', fromX: 1400, toX: 910, y: 320, isReturn: true },
    { num: '7', text: 'Room entity instance', fromX: 910, toX: 670, y: 350, isReturn: true },

    // Alt [available: room.status == AVAILABLE]
    { num: '8', text: 'available = true', fromX: 670, toX: 440, y: 440, isReturn: true },
    { num: '9', text: 'generateNewBooking(customerId, roomId, checkIn, checkOut)', fromX: 440, toX: 670, y: 480 },
    { num: '10', text: '«create» new RentalRequest(dto, PENDING)', fromX: 670, toX: 1150, y: 520, isCreate: true },
    { num: '11', text: 'db.rentalRequests.insertOne(requestDoc)', fromX: 1150, toX: 1400, y: 560 },
    { num: '12', text: 'inserted ack with _id', fromX: 1400, toX: 1150, y: 590, isReturn: true },
    { num: '13', text: 'saved RentalRequest entity', fromX: 1150, toX: 670, y: 620, isReturn: true },
    { num: '14', text: 'updateStatus(roomId, RESERVED)', fromX: 670, toX: 910, y: 660 },
    { num: '15', text: 'db.rooms.updateOne({ _id: roomId }, { $set: { status: RESERVED } })', fromX: 910, toX: 1400, y: 700 },
    { num: '16', text: 'update response OK', fromX: 1400, toX: 910, y: 730, isReturn: true },
    { num: '17', text: 'confirmBooking(trackingId)', fromX: 440, toX: 230, y: 770, isReturn: true },
    { num: '18', text: 'Rental Booking Confirmed', fromX: 230, toX: 70, y: 800, isReturn: true },

    // Alt [unavailable: room.status != AVAILABLE]
    { num: '19', text: 'available = false', fromX: 670, toX: 440, y: 900, isReturn: true },
    { num: '20', text: '400 Bad Request ("Room is unavailable")', fromX: 440, toX: 230, y: 940, isReturn: true },
    { num: '21', text: 'showBookingErrorToast("Room not available")', fromX: 230, toX: 70, y: 980, isReturn: true }
  ];

  const xml = buildSequenceXml(
    'UC-M03 Request Rental',
    'uc-m03-request-rental',
    'Customer',
    lifelines,
    'available: room.status == AVAILABLE',
    'unavailable: room.status != AVAILABLE',
    msgs
  );

  saveDiagram('UC-M03_Request_Rental_SequenceDiagram.drawio', xml);
}

// -----------------------------------------------------------------------------
// Sequence Diagram 2: UC-M02 Search & Filter Rooms
// Lifelines: Customer -> UI -> Controller -> Service -> Model: Room -> Database: MongoDB
// -----------------------------------------------------------------------------
function generateUCM02() {
  const lifelines = [
    { x: 260, stereo: 'user interaction', name: 'Room Search View' },
    { x: 520, stereo: 'control', name: 'RoomController' },
    { x: 780, stereo: 'service', name: 'RoomService' },
    { x: 1040, stereo: 'model', name: 'Room' },
    { x: 1300, stereo: 'database', name: 'MongoDB' }
  ];

  const msgs = [
    { num: '1', text: 'enterSearchCriteria(keyword, priceMin, priceMax, roomType)', fromX: 70, toX: 260, y: 130 },
    { num: '2', text: 'GET /api/rooms/search?keyword=...&priceMin=...', fromX: 260, toX: 520, y: 170 },
    { num: '3', text: 'searchRoom(searchCriteria)', fromX: 520, toX: 780, y: 210 },
    { num: '4', text: 'find(queryCriteria)', fromX: 780, toX: 1040, y: 250 },
    { num: '5', text: 'db.rooms.find({ status: AVAILABLE, price: { $gte, $lte } })', fromX: 1040, toX: 1300, y: 290 },
    { num: '6', text: 'room documents cursor (BSON)', fromX: 1300, toX: 1040, y: 320, isReturn: true },
    { num: '7', text: 'List<Room> hydrated entities', fromX: 1040, toX: 780, y: 350, isReturn: true },

    // Alt [rooms.size() > 0]
    { num: '8', text: 'hasResults = true', fromX: 780, toX: 520, y: 440, isReturn: true },
    { num: '9', text: 'formatRoomCards(rooms)', fromX: 520, toX: 780, y: 480 },
    { num: '10', text: 'return 200 OK (rooms array)', fromX: 780, toX: 520, y: 520, isReturn: true },
    { num: '11', text: 'renderRoomList(rooms)', fromX: 520, toX: 260, y: 560, isReturn: true },
    { num: '12', text: 'displayRoomCards(results)', fromX: 260, toX: 70, y: 600, isReturn: true },

    // Alt [rooms.isEmpty()]
    { num: '13', text: 'hasResults = false', fromX: 780, toX: 520, y: 900, isReturn: true },
    { num: '14', text: 'return 200 OK (empty array)', fromX: 520, toX: 260, y: 940, isReturn: true },
    { num: '15', text: 'displayEmptyPlaceholder("No matching rooms found")', fromX: 260, toX: 70, y: 980, isReturn: true }
  ];

  const xml = buildSequenceXml(
    'UC-M02 Search Rooms',
    'uc-m02-search-rooms',
    'Customer',
    lifelines,
    'rooms.size() > 0',
    'rooms.isEmpty()',
    msgs
  );

  saveDiagram('UC-M02_Search_Room_SequenceDiagram.drawio', xml);
}

// -----------------------------------------------------------------------------
// Sequence Diagram 3: UC-M04.1 Create Room
// Lifelines: Staff -> UI -> Controller -> Service -> Model: Room -> Database: MongoDB
// -----------------------------------------------------------------------------
function generateUCM04_1() {
  const lifelines = [
    { x: 260, stereo: 'user interaction', name: 'Create Room View' },
    { x: 520, stereo: 'control', name: 'RoomController' },
    { x: 780, stereo: 'service', name: 'RoomService' },
    { x: 1040, stereo: 'model', name: 'Room' },
    { x: 1300, stereo: 'database', name: 'MongoDB' }
  ];

  const msgs = [
    { num: '1', text: 'inputRoomDetails(roomNumber, type, price, area)', fromX: 70, toX: 260, y: 130 },
    { num: '2', text: 'POST /api/rooms', fromX: 260, toX: 520, y: 170 },
    { num: '3', text: 'createRoom(createRoomDTO)', fromX: 520, toX: 780, y: 210 },
    { num: '4', text: 'findOne({ roomNumber })', fromX: 780, toX: 1040, y: 250 },
    { num: '5', text: 'db.rooms.findOne({ roomNumber })', fromX: 1040, toX: 1300, y: 290 },
    { num: '6', text: 'null or existing document', fromX: 1300, toX: 1040, y: 320, isReturn: true },
    { num: '7', text: 'return existingRoom', fromX: 1040, toX: 780, y: 350, isReturn: true },

    // Alt [existingRoom == null (Unique)]
    { num: '8', text: 'isValid = true', fromX: 780, toX: 520, y: 440, isReturn: true },
    { num: '9', text: '«create» new Room(roomNumber, type, price, AVAILABLE)', fromX: 780, toX: 1040, y: 480, isCreate: true },
    { num: '10', text: 'db.rooms.insertOne(newRoomDoc)', fromX: 1040, toX: 1300, y: 520 },
    { num: '11', text: 'inserted ack with _id', fromX: 1300, toX: 1040, y: 550, isReturn: true },
    { num: '12', text: 'saved Room entity', fromX: 1040, toX: 780, y: 580, isReturn: true },
    { num: '13', text: 'return 201 Created (Room)', fromX: 780, toX: 520, y: 610, isReturn: true },
    { num: '14', text: 'displaySuccessToast("Room created successfully")', fromX: 520, toX: 260, y: 640, isReturn: true },
    { num: '15', text: 'showRoomCreated()', fromX: 260, toX: 70, y: 670, isReturn: true },

    // Alt [existingRoom != null (Duplicate)]
    { num: '16', text: 'isValid = false', fromX: 780, toX: 520, y: 900, isReturn: true },
    { num: '17', text: 'return 409 Conflict ("Room number already exists")', fromX: 520, toX: 260, y: 940, isReturn: true },
    { num: '18', text: 'displayValidationError("Duplicate room number")', fromX: 260, toX: 70, y: 980, isReturn: true }
  ];

  const xml = buildSequenceXml(
    'UC-M04.1 Create Room',
    'uc-m04-1-create-room',
    'Staff',
    lifelines,
    'existingRoom == null (Unique)',
    'existingRoom != null (Duplicate)',
    msgs
  );

  saveDiagram('UC-M04_1_Create_Room_SequenceDiagram.drawio', xml);
}

// -----------------------------------------------------------------------------
// Sequence Diagram 4: UC-M04.2 Update Room Info
// Lifelines: Staff -> UI -> Controller -> Service -> Model: Room -> Database: MongoDB
// -----------------------------------------------------------------------------
function generateUCM04_2() {
  const lifelines = [
    { x: 260, stereo: 'user interaction', name: 'Edit Room View' },
    { x: 520, stereo: 'control', name: 'RoomController' },
    { x: 780, stereo: 'service', name: 'RoomService' },
    { x: 1040, stereo: 'model', name: 'Room' },
    { x: 1300, stereo: 'database', name: 'MongoDB' }
  ];

  const msgs = [
    { num: '1', text: 'modifyRoomInfo(roomId, newPrice, newType, newStatus)', fromX: 70, toX: 260, y: 130 },
    { num: '2', text: 'PUT /api/rooms/{id}', fromX: 260, toX: 520, y: 170 },
    { num: '3', text: 'updateRoom(roomId, updateRoomDTO)', fromX: 520, toX: 780, y: 210 },
    { num: '4', text: 'findById(roomId)', fromX: 780, toX: 1040, y: 250 },
    { num: '5', text: 'db.rooms.findById(roomId)', fromX: 1040, toX: 1300, y: 290 },
    { num: '6', text: 'room document', fromX: 1300, toX: 1040, y: 320, isReturn: true },
    { num: '7', text: 'Room entity instance', fromX: 1040, toX: 780, y: 350, isReturn: true },

    // Alt [room != null]
    { num: '8', text: 'isFound = true', fromX: 780, toX: 520, y: 440, isReturn: true },
    { num: '9', text: 'updateAttributes(price, type, status)', fromX: 780, toX: 1040, y: 480 },
    { num: '10', text: 'db.rooms.updateOne({ _id: roomId }, { $set: updateFields })', fromX: 1040, toX: 1300, y: 520 },
    { num: '11', text: 'update acknowledgment', fromX: 1300, toX: 1040, y: 550, isReturn: true },
    { num: '12', text: 'updated Room entity', fromX: 1040, toX: 780, y: 580, isReturn: true },
    { num: '13', text: 'return 200 OK (updatedRoom)', fromX: 780, toX: 520, y: 610, isReturn: true },
    { num: '14', text: 'displaySuccessToast("Room updated successfully")', fromX: 520, toX: 260, y: 640, isReturn: true },
    { num: '15', text: 'showUpdatedRoomDetails()', fromX: 260, toX: 70, y: 670, isReturn: true },

    // Alt [room == null]
    { num: '16', text: 'isFound = false', fromX: 780, toX: 520, y: 900, isReturn: true },
    { num: '17', text: 'return 404 Not Found ("Room does not exist")', fromX: 520, toX: 260, y: 940, isReturn: true },
    { num: '18', text: 'displayErrorMessage("Room not found")', fromX: 260, toX: 70, y: 980, isReturn: true }
  ];

  const xml = buildSequenceXml(
    'UC-M04.2 Update Room',
    'uc-m04-2-update-room',
    'Staff',
    lifelines,
    'room != null',
    'room == null',
    msgs
  );

  saveDiagram('UC-M04_2_Update_Room_SequenceDiagram.drawio', xml);
}

// -----------------------------------------------------------------------------
// Sequence Diagram 5: UC-M04.3 Delete Room
// Lifelines: Staff -> UI -> Controller -> Service -> Model: Room -> Database: MongoDB
// -----------------------------------------------------------------------------
function generateUCM04_3() {
  const lifelines = [
    { x: 260, stereo: 'user interaction', name: 'Room List View' },
    { x: 520, stereo: 'control', name: 'RoomController' },
    { x: 780, stereo: 'service', name: 'RoomService' },
    { x: 1040, stereo: 'model', name: 'Room' },
    { x: 1300, stereo: 'database', name: 'MongoDB' }
  ];

  const msgs = [
    { num: '1', text: 'requestDeleteRoom(roomId)', fromX: 70, toX: 260, y: 130 },
    { num: '2', text: 'DELETE /api/rooms/{id}', fromX: 260, toX: 520, y: 170 },
    { num: '3', text: 'deleteRoom(roomId)', fromX: 520, toX: 780, y: 210 },
    { num: '4', text: 'findById(roomId)', fromX: 780, toX: 1040, y: 250 },
    { num: '5', text: 'db.rooms.findById(roomId)', fromX: 1040, toX: 1300, y: 290 },
    { num: '6', text: 'room document with status', fromX: 1300, toX: 1040, y: 320, isReturn: true },
    { num: '7', text: 'Room entity instance', fromX: 1040, toX: 780, y: 350, isReturn: true },

    // Alt [room.status != RENTED]
    { num: '8', text: 'canDelete = true', fromX: 780, toX: 520, y: 440, isReturn: true },
    { num: '9', text: 'deleteById(roomId)', fromX: 780, toX: 1040, y: 480 },
    { num: '10', text: 'db.rooms.deleteOne({ _id: roomId })', fromX: 1040, toX: 1300, y: 520 },
    { num: '11', text: 'delete result { deletedCount: 1 }', fromX: 1300, toX: 1040, y: 550, isReturn: true },
    { num: '12', text: 'return deleteStatus = true', fromX: 1040, toX: 780, y: 580, isReturn: true },
    { num: '13', text: 'return 200 OK ("Room deleted successfully")', fromX: 780, toX: 520, y: 610, isReturn: true },
    { num: '14', text: 'refreshRoomTable("Room deleted")', fromX: 520, toX: 260, y: 640, isReturn: true },
    { num: '15', text: 'displayDeleteConfirmation()', fromX: 260, toX: 70, y: 670, isReturn: true },

    // Alt [room.status == RENTED]
    { num: '16', text: 'canDelete = false', fromX: 780, toX: 520, y: 900, isReturn: true },
    { num: '17', text: 'return 400 Bad Request ("Cannot delete occupied room under lease")', fromX: 520, toX: 260, y: 940, isReturn: true },
    { num: '18', text: 'displayWarningAlert("Cannot delete room currently rented")', fromX: 260, toX: 70, y: 980, isReturn: true }
  ];

  const xml = buildSequenceXml(
    'UC-M04.3 Delete Room',
    'uc-m04-3-delete-room',
    'Staff',
    lifelines,
    'room.status != RENTED',
    'room.status == RENTED',
    msgs
  );

  saveDiagram('UC-M04_3_Delete_Room_SequenceDiagram.drawio', xml);
}

// Run all generators
console.log('Generating Module 2 Draw.io diagrams (Deleted repository, direct Model -> MongoDB)...');
generateClassDiagram();
generateUCM03();
generateUCM02();
generateUCM04_1();
generateUCM04_2();
generateUCM04_3();
console.log('All Draw.io diagrams updated successfully!');
