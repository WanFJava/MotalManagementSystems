const fs = require('fs');
const path = require('path');

function generateUC03() {
  return `<mxfile host="app.diagrams.net">
  <diagram name="UC03 Request Rental" id="uc03-request-rental">
    <mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1400" pageHeight="950" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        
        <!-- Lifelines -->
        <mxCell id="lf_tenant" value="Tenant" style="shape=umlLifeline;participant=umlActor;perimeter=lifelinePerimeter;whiteSpace=nowrap;html=1;container=1;collapsible=0;recursiveResize=0;verticalAlign=top;spacingTop=52;outlineConnect=0;size=50;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="115" y="40" width="30" height="850" as="geometry"/>
        </mxCell>
        <mxCell id="lf_ui" value="«boundary»&lt;br&gt;RentalRequestScreen" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1">
          <mxGeometry x="315" y="40" width="170" height="850" as="geometry"/>
        </mxCell>
        <mxCell id="lf_controller" value="«control»&lt;br&gt;RentalRequestController" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1">
          <mxGeometry x="615" y="40" width="170" height="850" as="geometry"/>
        </mxCell>
        <mxCell id="lf_room" value="«entity»&lt;br&gt;Room" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1">
          <mxGeometry x="930" y="40" width="140" height="850" as="geometry"/>
        </mxCell>
        <mxCell id="lf_db" value="«database»&lt;br&gt;MongoDB" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1">
          <mxGeometry x="1170" y="40" width="140" height="850" as="geometry"/>
        </mxCell>

        <!-- Activation Bars -->
        <mxCell id="bar_T" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_tenant">
          <mxGeometry x="9" y="100" width="12" height="710" as="geometry"/>
        </mxCell>
        <mxCell id="bar_UI" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_ui">
          <mxGeometry x="79" y="100" width="12" height="710" as="geometry"/>
        </mxCell>
        <mxCell id="bar_C" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_controller">
          <mxGeometry x="79" y="170" width="12" height="610" as="geometry"/>
        </mxCell>
        <mxCell id="bar_R" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_room">
          <mxGeometry x="64" y="270" width="12" height="90" as="geometry"/>
        </mxCell>
        <mxCell id="bar_DB_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_db">
          <mxGeometry x="64" y="295" width="12" height="50" as="geometry"/>
        </mxCell>
        <mxCell id="bar_DB_1" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_db">
          <mxGeometry x="64" y="605" width="12" height="80" as="geometry"/>
        </mxCell>

        <!-- Alt Frame -->
        <mxCell id="alt_0" value="alt" style="shape=umlFrame;whiteSpace=wrap;html=1;pointerEvents=0;width=40;height=20;" vertex="1" parent="1">
          <mxGeometry x="40" y="405" width="1280" height="385" as="geometry"/>
        </mxCell>
        <mxCell id="div_0" value="" style="endArrow=none;dashed=1;html=1;rounded=0;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="40" y="555" as="sourcePoint"/>
            <mxPoint x="1320" y="555" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="guard_0" value="[TC_RENTAL_02: room not found or status != &apos;AVAILABLE&apos;]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1">
          <mxGeometry x="120" y="405" width="340" height="20" as="geometry"/>
        </mxCell>
        <mxCell id="guard_1" value="[TC_RENTAL_01: status == &apos;AVAILABLE&apos;]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1">
          <mxGeometry x="120" y="557" width="280" height="20" as="geometry"/>
        </mxCell>

        <!-- Messages -->
        <mxCell id="msg_0" value="1: select available room &amp; enter contact info" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="136" y="150" as="sourcePoint"/>
            <mxPoint x="394" y="150" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_1" value="2: clickSubmit()" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="136" y="185" as="sourcePoint"/>
            <mxPoint x="394" y="185" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_2" value="3: POST /api/rental-requests (roomId, tenantName, phone, date, note)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="406" y="210" as="sourcePoint"/>
            <mxPoint x="694" y="210" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_3" value="validateInput(roomId, tenantName)" style="html=1;align=left;spacingLeft=4;verticalAlign=middle;endArrow=block;endFill=1;rounded=0;fontSize=11;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="706" y="235" as="sourcePoint"/>
            <mxPoint x="706" y="260" as="targetPoint"/>
            <Array as="points">
              <mxPoint x="736" y="235"/>
              <mxPoint x="736" y="260"/>
            </Array>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_4" value="4: findById(roomId)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="706" y="310" as="sourcePoint"/>
            <mxPoint x="994" y="310" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_5" value="findOne({ _id: roomId })" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="1006" y="335" as="sourcePoint"/>
            <mxPoint x="1234" y="335" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_6" value="room document" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="1234" y="375" as="sourcePoint"/>
            <mxPoint x="1006" y="375" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_7" value="room" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="994" y="390" as="sourcePoint"/>
            <mxPoint x="706" y="390" as="targetPoint"/>
          </mxGeometry>
        </mxCell>

        <!-- Alt 1: Error branch -->
        <mxCell id="msg_8" value="5a: 400 Bad Request (&quot;Phòng hiện tại không khả dụng để thuê&quot;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="694" y="470" as="sourcePoint"/>
            <mxPoint x="406" y="470" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_9" value="displayErrorAlert()" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="394" y="505" as="sourcePoint"/>
            <mxPoint x="136" y="505" as="targetPoint"/>
          </mxGeometry>
        </mxCell>

        <!-- Alt 2: Success branch -->
        <mxCell id="msg_10" value="5b: RentalRequest.create({ roomId, tenantName, phone, date, status: &apos;PENDING&apos; })" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="706" y="625" as="sourcePoint"/>
            <mxPoint x="1234" y="625" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_11" value="savedRentalRequest document" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="1234" y="670" as="sourcePoint"/>
            <mxPoint x="706" y="670" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_12" value="6b: 201 Created (rentalRequest)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="694" y="715" as="sourcePoint"/>
            <mxPoint x="406" y="715" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_13" value="displaySuccessAlert(&quot;Gửi yêu cầu thuê phòng thành công&quot;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="394" y="750" as="sourcePoint"/>
            <mxPoint x="136" y="750" as="targetPoint"/>
          </mxGeometry>
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}

function generateUC05() {
  return `<mxfile host="app.diagrams.net">
  <diagram name="UC05 Manage Contract" id="uc05-manage-contract">
    <mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1400" pageHeight="1050" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>

        <!-- Lifelines -->
        <mxCell id="lf_landlord" value="Landlord" style="shape=umlLifeline;participant=umlActor;perimeter=lifelinePerimeter;whiteSpace=nowrap;html=1;container=1;collapsible=0;recursiveResize=0;verticalAlign=top;spacingTop=52;outlineConnect=0;size=50;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="115" y="40" width="30" height="960" as="geometry"/>
        </mxCell>
        <mxCell id="lf_ui" value="«boundary»&lt;br&gt;ManageContractsScreen" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1">
          <mxGeometry x="315" y="40" width="170" height="960" as="geometry"/>
        </mxCell>
        <mxCell id="lf_controller" value="«control»&lt;br&gt;ContractController" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1">
          <mxGeometry x="615" y="40" width="170" height="960" as="geometry"/>
        </mxCell>
        <mxCell id="lf_contract" value="«entity»&lt;br&gt;Contract" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1">
          <mxGeometry x="930" y="40" width="140" height="960" as="geometry"/>
        </mxCell>
        <mxCell id="lf_db" value="«database»&lt;br&gt;MongoDB" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1">
          <mxGeometry x="1170" y="40" width="140" height="960" as="geometry"/>
        </mxCell>

        <!-- Activation Bars -->
        <mxCell id="bar_L" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_landlord">
          <mxGeometry x="9" y="100" width="12" height="820" as="geometry"/>
        </mxCell>
        <mxCell id="bar_UI" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_ui">
          <mxGeometry x="79" y="100" width="12" height="820" as="geometry"/>
        </mxCell>
        <mxCell id="bar_C" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_controller">
          <mxGeometry x="79" y="170" width="12" height="710" as="geometry"/>
        </mxCell>
        <mxCell id="bar_CTR" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_contract">
          <mxGeometry x="64" y="655" width="12" height="90" as="geometry"/>
        </mxCell>
        <mxCell id="bar_DB_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_db">
          <mxGeometry x="64" y="270" width="12" height="90" as="geometry"/>
        </mxCell>
        <mxCell id="bar_DB_1" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_db">
          <mxGeometry x="64" y="670" width="12" height="120" as="geometry"/>
        </mxCell>

        <!-- Alt Frame -->
        <mxCell id="alt_0" value="alt" style="shape=umlFrame;whiteSpace=wrap;html=1;pointerEvents=0;width=40;height=20;" vertex="1" parent="1">
          <mxGeometry x="40" y="440" width="1280" height="470" as="geometry"/>
        </mxCell>
        <mxCell id="div_0" value="" style="endArrow=none;dashed=1;html=1;rounded=0;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="40" y="580" as="sourcePoint"/>
            <mxPoint x="1320" y="580" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="guard_0" value="[TC_CTR_02: room.status == &apos;RENTED&apos; or activeContract exists]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1">
          <mxGeometry x="120" y="440" width="370" height="20" as="geometry"/>
        </mxCell>
        <mxCell id="guard_1" value="[TC_CTR_01: room is AVAILABLE &amp; valid contract data]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1">
          <mxGeometry x="120" y="582" width="340" height="20" as="geometry"/>
        </mxCell>

        <!-- Messages -->
        <mxCell id="msg_0" value="1: enterContractDetails(Bên A, Bên B, signedDate, startDate, endDate, cọc, giá)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="136" y="150" as="sourcePoint"/>
            <mxPoint x="394" y="150" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_1" value="2: clickConfirmContract()" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="136" y="185" as="sourcePoint"/>
            <mxPoint x="394" y="185" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_2" value="3: POST /api/contracts (roomId, Bên A, Bên B, signedDate, startDate, endDate, cọc, giá)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="406" y="210" as="sourcePoint"/>
            <mxPoint x="694" y="210" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_3" value="validateDateAndFields(startDate &lt; endDate)" style="html=1;align=left;spacingLeft=4;verticalAlign=middle;endArrow=block;endFill=1;rounded=0;fontSize=11;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="706" y="235" as="sourcePoint"/>
            <mxPoint x="706" y="260" as="targetPoint"/>
            <Array as="points">
              <mxPoint x="736" y="235"/>
              <mxPoint x="736" y="260"/>
            </Array>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_4" value="4: Room.findById(roomId)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="706" y="310" as="sourcePoint"/>
            <mxPoint x="1234" y="310" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_5" value="room (status, price)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="1234" y="340" as="sourcePoint"/>
            <mxPoint x="706" y="340" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_6" value="5: Contract.findOne({ roomId, status: &apos;ACTIVE&apos; })" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="706" y="375" as="sourcePoint"/>
            <mxPoint x="1234" y="375" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_7" value="activeContract / null" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="1234" y="410" as="sourcePoint"/>
            <mxPoint x="706" y="410" as="targetPoint"/>
          </mxGeometry>
        </mxCell>

        <!-- Branch 1: Error -->
        <mxCell id="msg_8" value="6a: 400 Bad Request (&quot;Phòng đang có hợp đồng hoạt động hoặc đã được thuê&quot;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="694" y="500" as="sourcePoint"/>
            <mxPoint x="406" y="500" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_9" value="displayErrorAlert(&quot;Phòng đã có người thuê&quot;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="394" y="535" as="sourcePoint"/>
            <mxPoint x="136" y="535" as="targetPoint"/>
          </mxGeometry>
        </mxCell>

        <!-- Branch 2: Success -->
        <mxCell id="msg_10" value="6b: new Contract({ status: &apos;ACTIVE&apos;, signedDate, Bên A, Bên B, ... })" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="706" y="660" as="sourcePoint"/>
            <mxPoint x="994" y="660" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_11" value="save()" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="1006" y="690" as="sourcePoint"/>
            <mxPoint x="1234" y="690" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_12" value="7b: Room.findByIdAndUpdate(roomId, { status: &apos;RENTED&apos; })" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="706" y="730" as="sourcePoint"/>
            <mxPoint x="1234" y="730" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_13" value="updatedRoom document" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="1234" y="765" as="sourcePoint"/>
            <mxPoint x="706" y="765" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_14" value="8b: 201 Created (contract)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="694" y="810" as="sourcePoint"/>
            <mxPoint x="406" y="810" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_15" value="displaySuccessAlert(&quot;Tạo hợp đồng thành công, phòng chuyển RENTED&quot;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="394" y="850" as="sourcePoint"/>
            <mxPoint x="136" y="850" as="targetPoint"/>
          </mxGeometry>
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}

function generateUC051() {
  return `<mxfile host="app.diagrams.net">
  <diagram name="UC05.1 Extend Contract" id="uc05-1-extend-contract">
    <mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1400" pageHeight="920" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>

        <!-- Lifelines -->
        <mxCell id="lf_landlord" value="Landlord" style="shape=umlLifeline;participant=umlActor;perimeter=lifelinePerimeter;whiteSpace=nowrap;html=1;container=1;collapsible=0;recursiveResize=0;verticalAlign=top;spacingTop=52;outlineConnect=0;size=50;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="115" y="40" width="30" height="830" as="geometry"/>
        </mxCell>
        <mxCell id="lf_ui" value="«boundary»&lt;br&gt;ManageContractsScreen" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1">
          <mxGeometry x="315" y="40" width="170" height="830" as="geometry"/>
        </mxCell>
        <mxCell id="lf_controller" value="«control»&lt;br&gt;ContractController" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1">
          <mxGeometry x="615" y="40" width="170" height="830" as="geometry"/>
        </mxCell>
        <mxCell id="lf_contract" value="«entity»&lt;br&gt;Contract" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1">
          <mxGeometry x="930" y="40" width="140" height="830" as="geometry"/>
        </mxCell>
        <mxCell id="lf_db" value="«database»&lt;br&gt;MongoDB" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1">
          <mxGeometry x="1170" y="40" width="140" height="830" as="geometry"/>
        </mxCell>

        <!-- Activation Bars -->
        <mxCell id="bar_L" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_landlord">
          <mxGeometry x="9" y="100" width="12" height="690" as="geometry"/>
        </mxCell>
        <mxCell id="bar_UI" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_ui">
          <mxGeometry x="79" y="100" width="12" height="690" as="geometry"/>
        </mxCell>
        <mxCell id="bar_C" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_controller">
          <mxGeometry x="79" y="170" width="12" height="590" as="geometry"/>
        </mxCell>
        <mxCell id="bar_DB_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_db">
          <mxGeometry x="64" y="235" width="12" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="bar_DB_1" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_db">
          <mxGeometry x="64" y="580" width="12" height="70" as="geometry"/>
        </mxCell>

        <!-- Alt Frame -->
        <mxCell id="alt_0" value="alt" style="shape=umlFrame;whiteSpace=wrap;html=1;pointerEvents=0;width=40;height=20;" vertex="1" parent="1">
          <mxGeometry x="40" y="375" width="1280" height="400" as="geometry"/>
        </mxCell>
        <mxCell id="div_0" value="" style="endArrow=none;dashed=1;html=1;rounded=0;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="40" y="525" as="sourcePoint"/>
            <mxPoint x="1320" y="525" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="guard_0" value="[contract not found or status != &apos;ACTIVE&apos;]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1">
          <mxGeometry x="120" y="375" width="280" height="20" as="geometry"/>
        </mxCell>
        <mxCell id="guard_1" value="[contract.status == &apos;ACTIVE&apos; (Hợp lệ để gia hạn)]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1">
          <mxGeometry x="120" y="527" width="310" height="20" as="geometry"/>
        </mxCell>

        <!-- Messages -->
        <mxCell id="msg_0" value="1: selectContract &amp; clickExtend()" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="136" y="150" as="sourcePoint"/>
            <mxPoint x="394" y="150" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_1" value="2: enterNewEndDate(newEndDate)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="136" y="185" as="sourcePoint"/>
            <mxPoint x="394" y="185" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_2" value="3: PUT /api/contracts/:id/extend (body: { endDate: newEndDate })" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="406" y="210" as="sourcePoint"/>
            <mxPoint x="694" y="210" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_3" value="4: Contract.findById(id)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="706" y="275" as="sourcePoint"/>
            <mxPoint x="1234" y="275" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_4" value="contract document" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="1234" y="315" as="sourcePoint"/>
            <mxPoint x="706" y="315" as="targetPoint"/>
          </mxGeometry>
        </mxCell>

        <!-- Branch 1: Error -->
        <mxCell id="msg_5" value="5a: 400 Bad Request (&quot;Chỉ có thể gia hạn hợp đồng đang hoạt động&quot;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="694" y="440" as="sourcePoint"/>
            <mxPoint x="406" y="440" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_6" value="displayErrorAlert(&quot;Không thể gia hạn hợp đồng đã thanh lý&quot;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="394" y="475" as="sourcePoint"/>
            <mxPoint x="136" y="475" as="targetPoint"/>
          </mxGeometry>
        </mxCell>

        <!-- Branch 2: Success -->
        <mxCell id="msg_7" value="5b: save({ endDate: newEndDate })" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="706" y="600" as="sourcePoint"/>
            <mxPoint x="1234" y="600" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_8" value="updatedContract document" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="1234" y="640" as="sourcePoint"/>
            <mxPoint x="706" y="640" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_9" value="6b: 200 OK (&quot;Gia hạn hợp đồng thành công&quot;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="694" y="685" as="sourcePoint"/>
            <mxPoint x="406" y="685" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_10" value="displaySuccessAlert(&quot;Gia hạn thành công, ngày kết thúc mới cập nhật&quot;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="394" y="725" as="sourcePoint"/>
            <mxPoint x="136" y="725" as="targetPoint"/>
          </mxGeometry>
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}

function generateUC052() {
  return `<mxfile host="app.diagrams.net">
  <diagram name="UC05.2 Terminate Contract" id="uc05-2-terminate-contract">
    <mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1400" pageHeight="980" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>

        <!-- Lifelines -->
        <mxCell id="lf_landlord" value="Landlord" style="shape=umlLifeline;participant=umlActor;perimeter=lifelinePerimeter;whiteSpace=nowrap;html=1;container=1;collapsible=0;recursiveResize=0;verticalAlign=top;spacingTop=52;outlineConnect=0;size=50;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="115" y="40" width="30" height="890" as="geometry"/>
        </mxCell>
        <mxCell id="lf_ui" value="«boundary»&lt;br&gt;ManageContractsScreen" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1">
          <mxGeometry x="315" y="40" width="170" height="890" as="geometry"/>
        </mxCell>
        <mxCell id="lf_controller" value="«control»&lt;br&gt;ContractController" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1">
          <mxGeometry x="615" y="40" width="170" height="890" as="geometry"/>
        </mxCell>
        <mxCell id="lf_contract" value="«entity»&lt;br&gt;Contract" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1">
          <mxGeometry x="930" y="40" width="140" height="890" as="geometry"/>
        </mxCell>
        <mxCell id="lf_db" value="«database»&lt;br&gt;MongoDB" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1">
          <mxGeometry x="1170" y="40" width="140" height="890" as="geometry"/>
        </mxCell>

        <!-- Activation Bars -->
        <mxCell id="bar_L" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_landlord">
          <mxGeometry x="9" y="100" width="12" height="750" as="geometry"/>
        </mxCell>
        <mxCell id="bar_UI" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_ui">
          <mxGeometry x="79" y="100" width="12" height="750" as="geometry"/>
        </mxCell>
        <mxCell id="bar_C" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_controller">
          <mxGeometry x="79" y="170" width="12" height="650" as="geometry"/>
        </mxCell>
        <mxCell id="bar_DB_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_db">
          <mxGeometry x="64" y="240" width="12" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="bar_DB_1" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_db">
          <mxGeometry x="64" y="580" width="12" height="110" as="geometry"/>
        </mxCell>

        <!-- Alt Frame -->
        <mxCell id="alt_0" value="alt" style="shape=umlFrame;whiteSpace=wrap;html=1;pointerEvents=0;width=40;height=20;" vertex="1" parent="1">
          <mxGeometry x="40" y="380" width="1280" height="460" as="geometry"/>
        </mxCell>
        <mxCell id="div_0" value="" style="endArrow=none;dashed=1;html=1;rounded=0;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="40" y="530" as="sourcePoint"/>
            <mxPoint x="1320" y="530" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="guard_0" value="[contract.status == &apos;TERMINATED&apos; (Đã thanh lý trước đó)]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1">
          <mxGeometry x="120" y="380" width="310" height="20" as="geometry"/>
        </mxCell>
        <mxCell id="guard_1" value="[TC_CTR_03: contract.status != &apos;TERMINATED&apos; (Hợp lệ để thanh lý)]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1">
          <mxGeometry x="120" y="532" width="370" height="20" as="geometry"/>
        </mxCell>

        <!-- Messages -->
        <mxCell id="msg_0" value="1: selectContract &amp; clickTerminate()" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="136" y="150" as="sourcePoint"/>
            <mxPoint x="394" y="150" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_1" value="2: confirmTerminationDialog()" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="136" y="185" as="sourcePoint"/>
            <mxPoint x="394" y="185" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_2" value="3: PUT /api/contracts/:id/terminate" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="406" y="210" as="sourcePoint"/>
            <mxPoint x="694" y="210" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_3" value="4: Contract.findById(id)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="706" y="275" as="sourcePoint"/>
            <mxPoint x="1234" y="275" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_4" value="contract document" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="1234" y="320" as="sourcePoint"/>
            <mxPoint x="706" y="320" as="targetPoint"/>
          </mxGeometry>
        </mxCell>

        <!-- Branch 1: Error -->
        <mxCell id="msg_5" value="5a: 400 Bad Request (&quot;Hợp đồng đã được thanh lý trước đó&quot;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="694" y="445" as="sourcePoint"/>
            <mxPoint x="406" y="445" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_6" value="displayErrorAlert(&quot;Hợp đồng đã được thanh lý&quot;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="394" y="480" as="sourcePoint"/>
            <mxPoint x="136" y="480" as="targetPoint"/>
          </mxGeometry>
        </mxCell>

        <!-- Branch 2: Success -->
        <mxCell id="msg_7" value="5b: save({ status: &apos;TERMINATED&apos; })" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="706" y="600" as="sourcePoint"/>
            <mxPoint x="1234" y="600" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_8" value="6b: Room.findByIdAndUpdate(contract.roomId, { status: &apos;AVAILABLE&apos; })" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="706" y="640" as="sourcePoint"/>
            <mxPoint x="1234" y="640" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_9" value="updatedRoom (status: AVAILABLE)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="1234" y="680" as="sourcePoint"/>
            <mxPoint x="706" y="680" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_10" value="7b: 200 OK (&quot;Thanh lý hợp đồng thành công&quot;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="694" y="730" as="sourcePoint"/>
            <mxPoint x="406" y="730" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_11" value="displaySuccessAlert(&quot;Thanh lý HĐ thành công, phòng tự chuyển AVAILABLE&quot;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="394" y="770" as="sourcePoint"/>
            <mxPoint x="136" y="770" as="targetPoint"/>
          </mxGeometry>
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}

// Build consolidated file
function generateAllInOne() {
  const content03 = generateUC03().match(/<diagram[\s\S]*?<\/diagram>/)[0];
  const content05 = generateUC05().match(/<diagram[\s\S]*?<\/diagram>/)[0];
  const content051 = generateUC051().match(/<diagram[\s\S]*?<\/diagram>/)[0];
  const content052 = generateUC052().match(/<diagram[\s\S]*?<\/diagram>/)[0];

  return `<mxfile host="app.diagrams.net">
  ${content03}
  ${content05}
  ${content051}
  ${content052}
</mxfile>`;
}

const outDir = path.join(__dirname, '..', 'docs', 'diagrams');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'UC03_Request_Rental.drawio'), generateUC03(), 'utf8');
fs.writeFileSync(path.join(outDir, 'UC05_Manage_Contract.drawio'), generateUC05(), 'utf8');
fs.writeFileSync(path.join(outDir, 'UC05_1_Extend_Contract.drawio'), generateUC051(), 'utf8');
fs.writeFileSync(path.join(outDir, 'UC05_2_Terminate_Contract.drawio'), generateUC052(), 'utf8');
fs.writeFileSync(path.join(outDir, 'Sequence_Diagrams_Rental_Contract.drawio'), generateAllInOne(), 'utf8');

console.log('✅ Generated 100% matched Visual Paradigm / pure UML .drawio files!');
