const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, 'diagrams'),
  'C:\\Users\\nguye\\Downloads'
];

targetDirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function wrap(name, id, content, width = 1400, height = 1500) {
  return `<mxfile host="app.diagrams.net">
  <diagram name="${name}" id="${id}">
    <mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${width}" pageHeight="${height}" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
${content}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}

// =========================================================================
// 1. UC-M04.1 Create Room Sequence Diagram
// =========================================================================
const createRoomXml = `        <mxCell id="lf_manager" value="Manager" style="shape=umlLifeline;participant=umlActor;perimeter=lifelinePerimeter;whiteSpace=nowrap;html=1;container=1;collapsible=0;recursiveResize=0;verticalAlign=top;spacingTop=52;outlineConnect=0;size=50;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="115" y="40" width="30" height="1320" as="geometry"/></mxCell>
        <mxCell id="lf_ui" value="«boundary»&lt;br&gt;RoomInventoryPage" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1"><mxGeometry x="315" y="40" width="170" height="1320" as="geometry"/></mxCell>
        <mxCell id="lf_controller" value="«controller»&lt;br&gt;RoomController" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1"><mxGeometry x="615" y="40" width="170" height="1320" as="geometry"/></mxCell>
        <mxCell id="lf_room" value="«entity»&lt;br&gt;Room" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1"><mxGeometry x="930" y="40" width="140" height="1320" as="geometry"/></mxCell>
        <mxCell id="lf_db" value="«database»&lt;br&gt;MongoDB" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1"><mxGeometry x="1170" y="40" width="140" height="1320" as="geometry"/></mxCell>

        <mxCell id="bar_M_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_manager"><mxGeometry x="9" y="100" width="12" height="180" as="geometry"/></mxCell>
        <mxCell id="bar_M_1" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_manager"><mxGeometry x="9" y="320" width="12" height="920" as="geometry"/></mxCell>

        <mxCell id="bar_UI_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_ui"><mxGeometry x="79" y="100" width="12" height="180" as="geometry"/></mxCell>
        <mxCell id="bar_UI_1" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_ui"><mxGeometry x="79" y="320" width="12" height="920" as="geometry"/></mxCell>

        <mxCell id="bar_C_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_controller"><mxGeometry x="79" y="350" width="12" height="850" as="geometry"/></mxCell>
        <mxCell id="bar_R_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_room"><mxGeometry x="64" y="660" width="12" height="490" as="geometry"/></mxCell>
        <mxCell id="bar_DB_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_db"><mxGeometry x="64" y="700" width="12" height="420" as="geometry"/></mxCell>

        <mxCell id="msg_c0" value="click &quot;Thêm phòng mới&quot;" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1" source="bar_M_0" target="bar_UI_0"><mxGeometry relative="1" as="geometry"><mxPoint y="120" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_c1" value="render modal form tạo phòng trống" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_UI_0" target="bar_M_0"><mxGeometry relative="1" as="geometry"><mxPoint y="200" as="offset"/></mxGeometry></mxCell>

        <mxCell id="msg_c2" value="nhập thông tin phòng (roomNumber, basePrice, area, maxOccupants, amenities) và click Lưu" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1" source="bar_M_1" target="bar_UI_1"><mxGeometry relative="1" as="geometry"><mxPoint y="330" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_c3" value="POST /api/rooms (body: roomData)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1" source="bar_UI_1" target="bar_C_0"><mxGeometry relative="1" as="geometry"><mxPoint y="360" as="offset"/></mxGeometry></mxCell>
        
        <mxCell id="msg_c4" value="authenticate, requireRole('MANAGER', 'STAFF'),&#xa;validate input fields" style="html=1;align=left;spacingLeft=4;verticalAlign=middle;endArrow=block;endFill=1;rounded=0;fontSize=11;" edge="1" parent="1" source="bar_C_0" target="bar_C_0"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="734" y="400"/><mxPoint x="734" y="430"/></Array></mxGeometry></mxCell>

        <mxCell id="alt_create" value="alt" style="shape=umlFrame;whiteSpace=wrap;html=1;pointerEvents=0;width=40;height=20;" vertex="1" parent="1"><mxGeometry x="40" y="460" width="1280" height="740" as="geometry"/></mxCell>
        <mxCell id="guard_c0" value="[not signed in or missing permission]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1"><mxGeometry x="142" y="460" width="250" height="20" as="geometry"/></mxCell>
        <mxCell id="msg_c5" value="401 Unauthorized / 403 Forbidden" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_C_0" target="bar_UI_1"><mxGeometry relative="1" as="geometry"><mxPoint y="480" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_c6" value="hiển thị lỗi quyền truy cập" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_UI_1" target="bar_M_1"><mxGeometry relative="1" as="geometry"><mxPoint y="500" as="offset"/></mxGeometry></mxCell>

        <mxCell id="div_c0" value="" style="endArrow=none;dashed=1;html=1;rounded=0;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><mxPoint x="40" y="530" as="sourcePoint"/><mxPoint x="1320" y="530" as="targetPoint"/></mxGeometry></mxCell>
        <mxCell id="guard_c1" value="[invalid input: basePrice &lt;= 0 or missing roomNumber]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1"><mxGeometry x="142" y="532" width="300" height="20" as="geometry"/></mxCell>
        <mxCell id="msg_c7" value="400 Bad Request (lỗi validation)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_C_0" target="bar_UI_1"><mxGeometry relative="1" as="geometry"><mxPoint y="560" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_c8" value="hiển thị cảnh báo: &quot;Giá phòng phải lớn hơn 0&quot;" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_UI_1" target="bar_M_1"><mxGeometry relative="1" as="geometry"><mxPoint y="580" as="offset"/></mxGeometry></mxCell>

        <mxCell id="div_c1" value="" style="endArrow=none;dashed=1;html=1;rounded=0;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><mxPoint x="40" y="610" as="sourcePoint"/><mxPoint x="1320" y="610" as="targetPoint"/></mxGeometry></mxCell>
        <mxCell id="guard_c2" value="[valid request]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1"><mxGeometry x="142" y="612" width="250" height="20" as="geometry"/></mxCell>
        <mxCell id="msg_c9" value="findOne({ roomNumber: roomNumber.trim() })" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1" source="bar_C_0" target="bar_R_0"><mxGeometry relative="1" as="geometry"><mxPoint y="670" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_c10" value="db.rooms.findOne({ roomNumber })" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1" source="bar_R_0" target="bar_DB_0"><mxGeometry relative="1" as="geometry"><mxPoint y="710" as="offset"/></mxGeometry></mxCell>

        <mxCell id="alt_inner_c" value="alt" style="shape=umlFrame;whiteSpace=wrap;html=1;pointerEvents=0;width=40;height=20;" vertex="1" parent="1"><mxGeometry x="65" y="750" width="1235" height="430" as="geometry"/></mxCell>
        <mxCell id="guard_c3" value="[roomNumber already exists]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1"><mxGeometry x="142" y="750" width="250" height="20" as="geometry"/></mxCell>
        <mxCell id="msg_c11" value="existing room document" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_DB_0" target="bar_R_0"><mxGeometry relative="1" as="geometry"><mxPoint y="780" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_c12" value="existing room found" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_R_0" target="bar_C_0"><mxGeometry relative="1" as="geometry"><mxPoint y="800" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_c13" value="400 Bad Request (&quot;Số phòng đã tồn tại&quot;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_C_0" target="bar_UI_1"><mxGeometry relative="1" as="geometry"><mxPoint y="830" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_c14" value="thông báo: &quot;Số phòng đã tồn tại, vui lòng chọn số khác&quot;" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_UI_1" target="bar_M_1"><mxGeometry relative="1" as="geometry"><mxPoint y="850" as="offset"/></mxGeometry></mxCell>

        <mxCell id="div_c2" value="" style="endArrow=none;dashed=1;html=1;rounded=0;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><mxPoint x="65" y="890" as="sourcePoint"/><mxPoint x="1300" y="890" as="targetPoint"/></mxGeometry></mxCell>
        <mxCell id="guard_c4" value="[roomNumber is unique]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1"><mxGeometry x="142" y="892" width="250" height="20" as="geometry"/></mxCell>
        <mxCell id="msg_c15" value="null (not found)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_DB_0" target="bar_R_0"><mxGeometry relative="1" as="geometry"><mxPoint y="920" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_c16" value="create(roomData)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1" source="bar_C_0" target="bar_R_0"><mxGeometry relative="1" as="geometry"><mxPoint y="960" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_c17" value="db.rooms.insertOne(roomDoc)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1" source="bar_R_0" target="bar_DB_0"><mxGeometry relative="1" as="geometry"><mxPoint y="1000" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_c18" value="inserted document with _id" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_DB_0" target="bar_R_0"><mxGeometry relative="1" as="geometry"><mxPoint y="1050" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_c19" value="new Room instance" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_R_0" target="bar_C_0"><mxGeometry relative="1" as="geometry"><mxPoint y="1090" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_c20" value="201 Created (success: true, data: newRoom)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_C_0" target="bar_UI_1"><mxGeometry relative="1" as="geometry"><mxPoint y="1120" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_c21" value="đóng modal, hiển thị Toast &quot;Tạo phòng thành công!&quot;, cập nhật danh sách" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_UI_1" target="bar_M_1"><mxGeometry relative="1" as="geometry"><mxPoint y="1150" as="offset"/></mxGeometry></mxCell>`;

// =========================================================================
// 2. UC-M04.3 Delete Room Sequence Diagram
// =========================================================================
const deleteRoomXml = `        <mxCell id="lf_manager" value="Manager" style="shape=umlLifeline;participant=umlActor;perimeter=lifelinePerimeter;whiteSpace=nowrap;html=1;container=1;collapsible=0;recursiveResize=0;verticalAlign=top;spacingTop=52;outlineConnect=0;size=50;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="115" y="40" width="30" height="1350" as="geometry"/></mxCell>
        <mxCell id="lf_ui" value="«boundary»&lt;br&gt;RoomInventoryPage" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1"><mxGeometry x="315" y="40" width="170" height="1350" as="geometry"/></mxCell>
        <mxCell id="lf_controller" value="«controller»&lt;br&gt;RoomController" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1"><mxGeometry x="615" y="40" width="170" height="1350" as="geometry"/></mxCell>
        <mxCell id="lf_room" value="«entity»&lt;br&gt;Room" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1"><mxGeometry x="930" y="40" width="140" height="1350" as="geometry"/></mxCell>
        <mxCell id="lf_db" value="«database»&lt;br&gt;MongoDB" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1"><mxGeometry x="1170" y="40" width="140" height="1350" as="geometry"/></mxCell>

        <mxCell id="bar_M_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_manager"><mxGeometry x="9" y="100" width="12" height="160" as="geometry"/></mxCell>
        <mxCell id="bar_M_1" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_manager"><mxGeometry x="9" y="300" width="12" height="970" as="geometry"/></mxCell>

        <mxCell id="bar_UI_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_ui"><mxGeometry x="79" y="100" width="12" height="160" as="geometry"/></mxCell>
        <mxCell id="bar_UI_1" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_ui"><mxGeometry x="79" y="300" width="12" height="970" as="geometry"/></mxCell>

        <mxCell id="bar_C_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_controller"><mxGeometry x="79" y="340" width="12" height="900" as="geometry"/></mxCell>
        <mxCell id="bar_R_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_room"><mxGeometry x="64" y="460" width="12" height="740" as="geometry"/></mxCell>
        <mxCell id="bar_DB_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_db"><mxGeometry x="64" y="490" width="12" height="680" as="geometry"/></mxCell>

        <mxCell id="msg_d0" value="chọn phòng và click nút &quot;Xóa&quot;" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1" source="bar_M_0" target="bar_UI_0"><mxGeometry relative="1" as="geometry"><mxPoint y="120" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_d1" value="hiển thị modal xác nhận xóa phòng" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_UI_0" target="bar_M_0"><mxGeometry relative="1" as="geometry"><mxPoint y="180" as="offset"/></mxGeometry></mxCell>

        <mxCell id="msg_d2" value="xác nhận &quot;Đồng ý xóa&quot;" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1" source="bar_M_1" target="bar_UI_1"><mxGeometry relative="1" as="geometry"><mxPoint y="310" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_d3" value="DELETE /api/rooms/:id" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1" source="bar_UI_1" target="bar_C_0"><mxGeometry relative="1" as="geometry"><mxPoint y="340" as="offset"/></mxGeometry></mxCell>
        
        <mxCell id="msg_d4" value="authenticate, requireRole('MANAGER')" style="html=1;align=left;spacingLeft=4;verticalAlign=middle;endArrow=block;endFill=1;rounded=0;fontSize=11;" edge="1" parent="1" source="bar_C_0" target="bar_C_0"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="734" y="370"/><mxPoint x="734" y="395"/></Array></mxGeometry></mxCell>

        <mxCell id="msg_d5" value="findById(id)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1" source="bar_C_0" target="bar_R_0"><mxGeometry relative="1" as="geometry"><mxPoint y="470" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_d6" value="db.rooms.findOne({ _id: id })" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1" source="bar_R_0" target="bar_DB_0"><mxGeometry relative="1" as="geometry"><mxPoint y="500" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_d7" value="room document" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_DB_0" target="bar_R_0"><mxGeometry relative="1" as="geometry"><mxPoint y="530" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_d8" value="room" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_R_0" target="bar_C_0"><mxGeometry relative="1" as="geometry"><mxPoint y="550" as="offset"/></mxGeometry></mxCell>

        <mxCell id="alt_del" value="alt" style="shape=umlFrame;whiteSpace=wrap;html=1;pointerEvents=0;width=40;height=20;" vertex="1" parent="1"><mxGeometry x="40" y="580" width="1280" height="660" as="geometry"/></mxCell>
        <mxCell id="guard_d0" value="[!room (Phòng không tồn tại)]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1"><mxGeometry x="142" y="580" width="250" height="20" as="geometry"/></mxCell>
        <mxCell id="msg_d9" value="404 Not Found (&quot;Phòng không tồn tại&quot;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_C_0" target="bar_UI_1"><mxGeometry relative="1" as="geometry"><mxPoint y="605" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_d10" value="hiển thị lỗi &quot;Phòng không tồn tại&quot;" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_UI_1" target="bar_M_1"><mxGeometry relative="1" as="geometry"><mxPoint y="625" as="offset"/></mxGeometry></mxCell>

        <mxCell id="div_d0" value="" style="endArrow=none;dashed=1;html=1;rounded=0;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><mxPoint x="40" y="660" as="sourcePoint"/><mxPoint x="1320" y="660" as="targetPoint"/></mxGeometry></mxCell>
        <mxCell id="guard_d1" value="[room.status === 'RENTED' (Phòng đang có khách thuê)]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1"><mxGeometry x="142" y="662" width="350" height="20" as="geometry"/></mxCell>
        <mxCell id="msg_d11" value="400 Bad Request (&quot;Không thể xóa phòng đang có khách thuê&quot;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_C_0" target="bar_UI_1"><mxGeometry relative="1" as="geometry"><mxPoint y="690" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_d12" value="hiển thị cảnh báo chặn xóa: &quot;Phòng đang có khách thuê!&quot;" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_UI_1" target="bar_M_1"><mxGeometry relative="1" as="geometry"><mxPoint y="710" as="offset"/></mxGeometry></mxCell>

        <mxCell id="div_d1" value="" style="endArrow=none;dashed=1;html=1;rounded=0;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><mxPoint x="40" y="750" as="sourcePoint"/><mxPoint x="1320" y="750" as="targetPoint"/></mxGeometry></mxCell>
        <mxCell id="guard_d2" value="[room.status !== 'RENTED' - Kiểm tra ràng buộc hợp đồng]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1"><mxGeometry x="142" y="752" width="350" height="20" as="geometry"/></mxCell>
        <mxCell id="msg_d13" value="db.contracts.findOne({ room: id, status: 'ACTIVE' })" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1" source="bar_C_0" target="bar_DB_0"><mxGeometry relative="1" as="geometry"><mxPoint y="780" as="offset"/></mxGeometry></mxCell>

        <mxCell id="alt_inner_d" value="alt" style="shape=umlFrame;whiteSpace=wrap;html=1;pointerEvents=0;width=40;height=20;" vertex="1" parent="1"><mxGeometry x="65" y="820" width="1235" height="400" as="geometry"/></mxCell>
        <mxCell id="guard_d3" value="[activeContract tồn tại]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1"><mxGeometry x="142" y="820" width="250" height="20" as="geometry"/></mxCell>
        <mxCell id="msg_d14" value="activeContract document" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_DB_0" target="bar_C_0"><mxGeometry relative="1" as="geometry"><mxPoint y="850" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_d15" value="400 Bad Request (&quot;Phòng đang có hợp đồng hiệu lực&quot;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_C_0" target="bar_UI_1"><mxGeometry relative="1" as="geometry"><mxPoint y="880" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_d16" value="báo lỗi: &quot;Vui lòng thanh lý hợp đồng trước khi xóa phòng&quot;" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_UI_1" target="bar_M_1"><mxGeometry relative="1" as="geometry"><mxPoint y="900" as="offset"/></mxGeometry></mxCell>

        <mxCell id="div_d2" value="" style="endArrow=none;dashed=1;html=1;rounded=0;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><mxPoint x="65" y="940" as="sourcePoint"/><mxPoint x="1300" y="940" as="targetPoint"/></mxGeometry></mxCell>
        <mxCell id="guard_d4" value="[hợp lệ: không có hợp đồng active]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1"><mxGeometry x="142" y="942" width="250" height="20" as="geometry"/></mxCell>
        <mxCell id="msg_d17" value="deleteOne({ _id: id })" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1" source="bar_C_0" target="bar_R_0"><mxGeometry relative="1" as="geometry"><mxPoint y="980" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_d18" value="db.rooms.deleteOne({ _id: id })" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1" source="bar_R_0" target="bar_DB_0"><mxGeometry relative="1" as="geometry"><mxPoint y="1010" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_d19" value="{ acknowledged: true, deletedCount: 1 }" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_DB_0" target="bar_R_0"><mxGeometry relative="1" as="geometry"><mxPoint y="1050" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_d20" value="delete result" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_R_0" target="bar_C_0"><mxGeometry relative="1" as="geometry"><mxPoint y="1080" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_d21" value="200 OK (success: true, message: &quot;Xóa phòng thành công&quot;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_C_0" target="bar_UI_1"><mxGeometry relative="1" as="geometry"><mxPoint y="1120" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_d22" value="hiển thị Toast thông báo thành công, xóa hàng khỏi bảng" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_UI_1" target="bar_M_1"><mxGeometry relative="1" as="geometry"><mxPoint y="1150" as="offset"/></mxGeometry></mxCell>`;

// =========================================================================
// 3. UC-M02 Search Room Sequence Diagram
// =========================================================================
const searchRoomXml = `        <mxCell id="lf_tenant" value="Tenant / Guest" style="shape=umlLifeline;participant=umlActor;perimeter=lifelinePerimeter;whiteSpace=nowrap;html=1;container=1;collapsible=0;recursiveResize=0;verticalAlign=top;spacingTop=52;outlineConnect=0;size=50;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="115" y="40" width="30" height="1100" as="geometry"/></mxCell>
        <mxCell id="lf_ui" value="«boundary»&lt;br&gt;RoomSearchPage" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1"><mxGeometry x="315" y="40" width="170" height="1100" as="geometry"/></mxCell>
        <mxCell id="lf_controller" value="«controller»&lt;br&gt;RoomController" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1"><mxGeometry x="615" y="40" width="170" height="1100" as="geometry"/></mxCell>
        <mxCell id="lf_room" value="«entity»&lt;br&gt;Room" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1"><mxGeometry x="930" y="40" width="140" height="1100" as="geometry"/></mxCell>
        <mxCell id="lf_db" value="«database»&lt;br&gt;MongoDB" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1"><mxGeometry x="1170" y="40" width="140" height="1100" as="geometry"/></mxCell>

        <mxCell id="bar_T_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_tenant"><mxGeometry x="9" y="100" width="12" height="920" as="geometry"/></mxCell>
        <mxCell id="bar_UI_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_ui"><mxGeometry x="79" y="100" width="12" height="920" as="geometry"/></mxCell>
        <mxCell id="bar_C_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_controller"><mxGeometry x="79" y="180" width="12" height="780" as="geometry"/></mxCell>
        <mxCell id="bar_R_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_room"><mxGeometry x="64" y="320" width="12" height="580" as="geometry"/></mxCell>
        <mxCell id="bar_DB_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_db"><mxGeometry x="64" y="360" width="12" height="500" as="geometry"/></mxCell>

        <mxCell id="msg_s0" value="chọn tiêu chí lọc (keyword, status, minPrice, maxPrice, area, amenity)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1" source="bar_T_0" target="bar_UI_0"><mxGeometry relative="1" as="geometry"><mxPoint y="120" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_s1" value="click nút &quot;Tìm kiếm phòng&quot;" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1" source="bar_T_0" target="bar_UI_0"><mxGeometry relative="1" as="geometry"><mxPoint y="150" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_s2" value="GET /api/rooms/search?keyword=...&amp;minPrice=...&amp;maxPrice=..." style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1" source="bar_UI_0" target="bar_C_0"><mxGeometry relative="1" as="geometry"><mxPoint y="190" as="offset"/></mxGeometry></mxCell>

        <mxCell id="msg_s3" value="build dynamic query object&#xa;{ status, basePrice: { $gte, $lte }, area, amenities }" style="html=1;align=left;spacingLeft=4;verticalAlign=middle;endArrow=block;endFill=1;rounded=0;fontSize=11;" edge="1" parent="1" source="bar_C_0" target="bar_C_0"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="734" y="240"/><mxPoint x="734" y="280"/></Array></mxGeometry></mxCell>

        <mxCell id="msg_s4" value="find(queryCriteria).sort({ createdAt: -1 })" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1" source="bar_C_0" target="bar_R_0"><mxGeometry relative="1" as="geometry"><mxPoint y="330" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_s5" value="db.rooms.find(queryCriteria)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1" source="bar_R_0" target="bar_DB_0"><mxGeometry relative="1" as="geometry"><mxPoint y="370" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_s6" value="cursor of matching room documents" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_DB_0" target="bar_R_0"><mxGeometry relative="1" as="geometry"><mxPoint y="440" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_s7" value="rooms array" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_R_0" target="bar_C_0"><mxGeometry relative="1" as="geometry"><mxPoint y="480" as="offset"/></mxGeometry></mxCell>

        <mxCell id="alt_search" value="alt" style="shape=umlFrame;whiteSpace=wrap;html=1;pointerEvents=0;width=40;height=20;" vertex="1" parent="1"><mxGeometry x="40" y="520" width="1280" height="460" as="geometry"/></mxCell>
        <mxCell id="guard_s0" value="[rooms.length === 0 (Không tìm thấy phòng phù hợp)]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1"><mxGeometry x="142" y="520" width="350" height="20" as="geometry"/></mxCell>
        <mxCell id="msg_s8" value="200 OK (success: true, data: [])" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_C_0" target="bar_UI_0"><mxGeometry relative="1" as="geometry"><mxPoint y="560" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_s9" value="hiển thị empty state: &quot;Không có phòng nào thỏa mãn tiêu chí tìm kiếm&quot;" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_UI_0" target="bar_T_0"><mxGeometry relative="1" as="geometry"><mxPoint y="600" as="offset"/></mxGeometry></mxCell>

        <mxCell id="div_s0" value="" style="endArrow=none;dashed=1;html=1;rounded=0;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><mxPoint x="40" y="670" as="sourcePoint"/><mxPoint x="1320" y="670" as="targetPoint"/></mxGeometry></mxCell>
        <mxCell id="guard_s1" value="[rooms.length &gt; 0 (Có kết quả phù hợp)]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1"><mxGeometry x="142" y="672" width="300" height="20" as="geometry"/></mxCell>
        <mxCell id="msg_s10" value="200 OK (success: true, total: rooms.length, data: rooms)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_C_0" target="bar_UI_0"><mxGeometry relative="1" as="geometry"><mxPoint y="730" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_s11" value="render danh sách dạng lưới Card Grid (ảnh, giá, diện tích, tag tiện ích)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_UI_0" target="bar_T_0"><mxGeometry relative="1" as="geometry"><mxPoint y="780" as="offset"/></mxGeometry></mxCell>`;

// =========================================================================
// 4. UC-M03 Request Rental Sequence Diagram
// =========================================================================
const requestRentalXml = `        <mxCell id="lf_tenant" value="Tenant" style="shape=umlLifeline;participant=umlActor;perimeter=lifelinePerimeter;whiteSpace=nowrap;html=1;container=1;collapsible=0;recursiveResize=0;verticalAlign=top;spacingTop=52;outlineConnect=0;size=50;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="115" y="40" width="30" height="1250" as="geometry"/></mxCell>
        <mxCell id="lf_ui" value="«boundary»&lt;br&gt;RoomDetailPage" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1"><mxGeometry x="315" y="40" width="170" height="1250" as="geometry"/></mxCell>
        <mxCell id="lf_controller" value="«controller»&lt;br&gt;RoomController" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1"><mxGeometry x="615" y="40" width="170" height="1250" as="geometry"/></mxCell>
        <mxCell id="lf_req" value="«entity»&lt;br&gt;RentalRequest" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1"><mxGeometry x="930" y="40" width="140" height="1250" as="geometry"/></mxCell>
        <mxCell id="lf_db" value="«database»&lt;br&gt;MongoDB" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1"><mxGeometry x="1170" y="40" width="140" height="1250" as="geometry"/></mxCell>

        <mxCell id="bar_T_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_tenant"><mxGeometry x="9" y="100" width="12" height="170" as="geometry"/></mxCell>
        <mxCell id="bar_T_1" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_tenant"><mxGeometry x="9" y="310" width="12" height="880" as="geometry"/></mxCell>

        <mxCell id="bar_UI_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_ui"><mxGeometry x="79" y="100" width="12" height="170" as="geometry"/></mxCell>
        <mxCell id="bar_UI_1" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_ui"><mxGeometry x="79" y="310" width="12" height="880" as="geometry"/></mxCell>

        <mxCell id="bar_C_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_controller"><mxGeometry x="79" y="350" width="12" height="800" as="geometry"/></mxCell>
        <mxCell id="bar_REQ_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_req"><mxGeometry x="64" y="660" width="12" height="450" as="geometry"/></mxCell>
        <mxCell id="bar_DB_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_db"><mxGeometry x="64" y="520" width="12" height="560" as="geometry"/></mxCell>

        <mxCell id="msg_r0" value="click &quot;Gửi yêu cầu giữ phòng&quot;" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1" source="bar_T_0" target="bar_UI_0"><mxGeometry relative="1" as="geometry"><mxPoint y="120" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_r1" value="mở modal nhập họ tên, SĐT, ngày dọn vào, ghi chú" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_UI_0" target="bar_T_0"><mxGeometry relative="1" as="geometry"><mxPoint y="190" as="offset"/></mxGeometry></mxCell>

        <mxCell id="msg_r2" value="nhập form và click &quot;Xác nhận gửi yêu cầu&quot;" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1" source="bar_T_1" target="bar_UI_1"><mxGeometry relative="1" as="geometry"><mxPoint y="320" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_r3" value="POST /api/rooms/:id/rental-request (body: tenantRequestData)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1" source="bar_UI_1" target="bar_C_0"><mxGeometry relative="1" as="geometry"><mxPoint y="355" as="offset"/></mxGeometry></mxCell>

        <mxCell id="msg_r4" value="validate phone, fullName, moveInDate" style="html=1;align=left;spacingLeft=4;verticalAlign=middle;endArrow=block;endFill=1;rounded=0;fontSize=11;" edge="1" parent="1" source="bar_C_0" target="bar_C_0"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="734" y="390"/><mxPoint x="734" y="420"/></Array></mxGeometry></mxCell>

        <mxCell id="alt_req" value="alt" style="shape=umlFrame;whiteSpace=wrap;html=1;pointerEvents=0;width=40;height=20;" vertex="1" parent="1"><mxGeometry x="40" y="440" width="1280" height="720" as="geometry"/></mxCell>
        <mxCell id="guard_r0" value="[invalid input: SĐT không hợp lệ hoặc thiếu ngày dọn vào]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1"><mxGeometry x="142" y="440" width="350" height="20" as="geometry"/></mxCell>
        <mxCell id="msg_r5" value="400 Bad Request (&quot;Vui lòng điền đủ họ tên, SĐT và ngày dọn vào&quot;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_C_0" target="bar_UI_1"><mxGeometry relative="1" as="geometry"><mxPoint y="470" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_r6" value="hiển thị thông báo lỗi trên form" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_UI_1" target="bar_T_1"><mxGeometry relative="1" as="geometry"><mxPoint y="490" as="offset"/></mxGeometry></mxCell>

        <mxCell id="div_r0" value="" style="endArrow=none;dashed=1;html=1;rounded=0;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><mxPoint x="40" y="520" as="sourcePoint"/><mxPoint x="1320" y="520" as="targetPoint"/></mxGeometry></mxCell>
        <mxCell id="guard_r1" value="[valid input]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1"><mxGeometry x="142" y="522" width="250" height="20" as="geometry"/></mxCell>
        <mxCell id="msg_r7" value="db.rooms.findById(id)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1" source="bar_C_0" target="bar_DB_0"><mxGeometry relative="1" as="geometry"><mxPoint y="550" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_r8" value="room doc" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_DB_0" target="bar_C_0"><mxGeometry relative="1" as="geometry"><mxPoint y="580" as="offset"/></mxGeometry></mxCell>

        <mxCell id="alt_inner_r" value="alt" style="shape=umlFrame;whiteSpace=wrap;html=1;pointerEvents=0;width=40;height=20;" vertex="1" parent="1"><mxGeometry x="65" y="610" width="1235" height="520" as="geometry"/></mxCell>
        <mxCell id="guard_r2" value="[room.status === 'MAINTENANCE' or 'RENTED']" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1"><mxGeometry x="142" y="610" width="300" height="20" as="geometry"/></mxCell>
        <mxCell id="msg_r9" value="400 Bad Request (&quot;Phòng không sẵn sàng để nhận yêu cầu giữ chỗ&quot;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_C_0" target="bar_UI_1"><mxGeometry relative="1" as="geometry"><mxPoint y="640" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_r10" value="cảnh báo: &quot;Phòng hiện không trống, vui lòng chọn phòng khác&quot;" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_UI_1" target="bar_T_1"><mxGeometry relative="1" as="geometry"><mxPoint y="660" as="offset"/></mxGeometry></mxCell>

        <mxCell id="div_r1" value="" style="endArrow=none;dashed=1;html=1;rounded=0;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><mxPoint x="65" y="700" as="sourcePoint"/><mxPoint x="1300" y="700" as="targetPoint"/></mxGeometry></mxCell>
        <mxCell id="guard_r3" value="[room.status === 'AVAILABLE']" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1"><mxGeometry x="142" y="702" width="250" height="20" as="geometry"/></mxCell>
        <mxCell id="msg_r11" value="create({ roomId, tenantInfo, status: 'PENDING' })" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1" source="bar_C_0" target="bar_REQ_0"><mxGeometry relative="1" as="geometry"><mxPoint y="740" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_r12" value="db.rentalRequests.insertOne(requestDoc)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1" source="bar_REQ_0" target="bar_DB_0"><mxGeometry relative="1" as="geometry"><mxPoint y="780" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_r13" value="inserted rentalRequest doc" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_DB_0" target="bar_REQ_0"><mxGeometry relative="1" as="geometry"><mxPoint y="830" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_r14" value="rentalRequest instance" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_REQ_0" target="bar_C_0"><mxGeometry relative="1" as="geometry"><mxPoint y="870" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_r15" value="201 Created (success: true, message: &quot;Gửi yêu cầu thành công&quot;, data)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_C_0" target="bar_UI_1"><mxGeometry relative="1" as="geometry"><mxPoint y="910" as="offset"/></mxGeometry></mxCell>
        <mxCell id="msg_r16" value="đóng modal, hiển thị popup mã xác nhận yêu cầu và hướng dẫn chờ duyệt" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1" source="bar_UI_1" target="bar_T_1"><mxGeometry relative="1" as="geometry"><mxPoint y="950" as="offset"/></mxGeometry></mxCell>`;

// =========================================================================
// 5. CLASS DIAGRAM: ROOM MODULE (BCE Pattern)
// =========================================================================
const classDiagramXml = `        <!-- Boundary: RoomInventoryPage -->
        <mxCell id="cls_ui_inventory" value="«boundary»&#xa;RoomInventoryPage&#xa;--&#xa;- rooms: Room[]&#xa;- selectedRoom: Room&#xa;- filterStatus: String&#xa;- isModalOpen: Boolean&#xa;--&#xa;+ componentDidMount(): void&#xa;+ loadRooms(): void&#xa;+ handleCreateRoom(data: CreateRoomDTO): void&#xa;+ handleUpdateRoom(id: String, data: UpdateRoomDTO): void&#xa;+ handleDeleteRoom(id: String): void&#xa;+ render(): JSX.Element" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="60" y="80" width="310" height="210" as="geometry"/>
        </mxCell>

        <!-- Boundary: RoomSearchPage -->
        <mxCell id="cls_ui_search" value="«boundary»&#xa;RoomSearchPage&#xa;--&#xa;- searchResults: Room[]&#xa;- filterCriteria: RoomFilterDTO&#xa;- loading: Boolean&#xa;--&#xa;+ handleSearch(): void&#xa;+ handleFilterChange(field: String, val: Any): void&#xa;+ renderGridCards(): JSX.Element" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="60" y="330" width="310" height="170" as="geometry"/>
        </mxCell>

        <!-- Boundary: RoomDetailPage -->
        <mxCell id="cls_ui_detail" value="«boundary»&#xa;RoomDetailPage&#xa;--&#xa;- room: Room&#xa;- requestModalOpen: Boolean&#xa;--&#xa;+ loadRoomDetails(id: String): void&#xa;+ submitRentalRequest(req: RentalRequestDTO): void" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="60" y="540" width="310" height="150" as="geometry"/>
        </mxCell>

        <!-- Controller: RoomController -->
        <mxCell id="cls_controller" value="«controller»&#xa;RoomController&#xa;--&#xa;--&#xa;+ getAllRooms(req: Request, res: Response): Promise&lt;void&gt;&#xa;+ searchRooms(req: Request, res: Response): Promise&lt;void&gt;&#xa;+ getRoomById(req: Request, res: Response): Promise&lt;void&gt;&#xa;+ createRoom(req: Request, res: Response): Promise&lt;void&gt;&#xa;+ updateRoom(req: Request, res: Response): Promise&lt;void&gt;&#xa;+ deleteRoom(req: Request, res: Response): Promise&lt;void&gt;&#xa;+ createRentalRequest(req: Request, res: Response): Promise&lt;void&gt;" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="490" y="240" width="380" height="230" as="geometry"/>
        </mxCell>

        <!-- Service: RoomService -->
        <mxCell id="cls_service" value="«service»&#xa;RoomService&#xa;--&#xa;--&#xa;+ fetchAllRooms(): Promise&lt;Room[]&gt;&#xa;+ searchByCriteria(filter: RoomFilterDTO): Promise&lt;Room[]&gt;&#xa;+ findRoomById(id: String): Promise&lt;Room&gt;&#xa;+ createNewRoom(dto: CreateRoomDTO): Promise&lt;Room&gt;&#xa;+ updateRoomById(id: String, dto: UpdateRoomDTO): Promise&lt;Room&gt;&#xa;+ removeRoom(id: String): Promise&lt;Boolean&gt;&#xa;+ validateRoomNumberUnique(num: String): Promise&lt;Boolean&gt;" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="490" y="530" width="380" height="210" as="geometry"/>
        </mxCell>

        <!-- Entity: Room -->
        <mxCell id="cls_entity_room" value="«entity»&#xa;Room&#xa;--&#xa;+ _id: ObjectId&#xa;+ roomNumber: String&#xa;+ basePrice: Number&#xa;+ area: Number&#xa;+ maxOccupants: Number&#xa;+ amenities: String[]&#xa;+ status: RoomStatus&#xa;+ description: String&#xa;+ images: String[]&#xa;+ createdAt: Date&#xa;+ updatedAt: Date&#xa;--&#xa;+ isAvailable(): Boolean&#xa;+ canBeDeleted(): Boolean" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="1010" y="140" width="280" height="270" as="geometry"/>
        </mxCell>

        <!-- Entity: RentalRequest -->
        <mxCell id="cls_entity_req" value="«entity»&#xa;RentalRequest&#xa;--&#xa;+ _id: ObjectId&#xa;+ roomId: ObjectId&#xa;+ tenantName: String&#xa;+ tenantPhone: String&#xa;+ tenantEmail: String&#xa;+ moveInDate: Date&#xa;+ note: String&#xa;+ status: RequestStatus&#xa;+ createdAt: Date&#xa;--&#xa;+ approve(): void&#xa;+ reject(reason: String): void" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="1010" y="470" width="280" height="230" as="geometry"/>
        </mxCell>

        <!-- Enum RoomStatus -->
        <mxCell id="cls_enum_status" value="«enumeration»&#xa;RoomStatus&#xa;--&#xa;AVAILABLE&#xa;RENTED&#xa;MAINTENANCE" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="1070" y="740" width="160" height="100" as="geometry"/>
        </mxCell>

        <!-- Relationships -->
        <mxCell id="rel_ui_ctrl1" value="HTTP POST/PUT/DEL" style="endArrow=open;dashed=1;html=1;endFill=0;exitX=1;exitY=0.5;entryX=0;entryY=0.25;" edge="1" parent="1" source="cls_ui_inventory" target="cls_controller">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="rel_ui_ctrl2" value="HTTP GET /search" style="endArrow=open;dashed=1;html=1;endFill=0;exitX=1;exitY=0.5;entryX=0;entryY=0.5;" edge="1" parent="1" source="cls_ui_search" target="cls_controller">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="rel_ui_ctrl3" value="HTTP POST /rental-request" style="endArrow=open;dashed=1;html=1;endFill=0;exitX=1;exitY=0.5;entryX=0;entryY=0.8;" edge="1" parent="1" source="cls_ui_detail" target="cls_controller">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>

        <mxCell id="rel_ctrl_srv" value="delegates to" style="endArrow=open;dashed=1;html=1;endFill=0;exitX=0.5;exitY=1;entryX=0.5;entryY=0;" edge="1" parent="1" source="cls_controller" target="cls_service">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>

        <mxCell id="rel_srv_room" value="manages" style="endArrow=open;dashed=1;html=1;endFill=0;exitX=1;exitY=0.25;entryX=0;entryY=0.75;" edge="1" parent="1" source="cls_service" target="cls_entity_room">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>

        <mxCell id="rel_srv_req" value="creates" style="endArrow=open;dashed=1;html=1;endFill=0;exitX=1;exitY=0.75;entryX=0;entryY=0.5;" edge="1" parent="1" source="cls_service" target="cls_entity_req">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>

        <mxCell id="rel_room_req" value="1        0..*" style="endArrow=none;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;" edge="1" parent="1" source="cls_entity_room" target="cls_entity_req">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>

        <mxCell id="rel_room_status" value="uses" style="endArrow=open;dashed=1;html=1;endFill=0;exitX=0.5;exitY=1;entryX=0.5;entryY=0;" edge="1" parent="1" source="cls_entity_room" target="cls_enum_status">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>`;

// Write all diagrams
const diagrams = [
  { file: 'UC-M04_1_Create_Room_SequenceDiagram.drawio', name: 'UC-M04.1 Create Room', id: 'uc-m04-1-create-room', xml: createRoomXml, w: 1400, h: 1400 },
  { file: 'UC-M04_2_Update_Room_SequenceDiagram.drawio', name: 'UC-M04.2 Update Room', id: 'uc-m04-2-update-room', xml: fs.readFileSync('C:\\Users\\nguye\\Downloads\\UC-M09_Update_Room_Info_SequenceDiagram.drawio', 'utf8').split('<root>')[1].split('</root>')[0], w: 1400, h: 1482 },
  { file: 'UC-M04_3_Delete_Room_SequenceDiagram.drawio', name: 'UC-M04.3 Delete Room', id: 'uc-m04-3-delete-room', xml: deleteRoomXml, w: 1400, h: 1450 },
  { file: 'UC-M02_Search_Room_SequenceDiagram.drawio', name: 'UC-M02 Search Room', id: 'uc-m02-search-room', xml: searchRoomXml, w: 1400, h: 1200 },
  { file: 'UC-M03_Request_Rental_SequenceDiagram.drawio', name: 'UC-M03 Request Rental', id: 'uc-m03-request-rental', xml: requestRentalXml, w: 1400, h: 1350 },
  { file: 'ClassDiagram_Room_Module.drawio', name: 'Class Diagram - Room Module', id: 'class-diagram-room-module', xml: classDiagramXml, w: 1400, h: 1000 }
];

diagrams.forEach(d => {
  const fullContent = d.file === 'UC-M04_2_Update_Room_SequenceDiagram.drawio' 
    ? fs.readFileSync('C:\\Users\\nguye\\Downloads\\UC-M09_Update_Room_Info_SequenceDiagram.drawio', 'utf8')
    : wrap(d.name, d.id, d.xml, d.w, d.h);

  targetDirs.forEach(dir => {
    const dest = path.join(dir, d.file);
    fs.writeFileSync(dest, fullContent, 'utf8');
    console.log(`Generated: ${dest}`);
  });
});

console.log('All diagrams successfully generated!');
