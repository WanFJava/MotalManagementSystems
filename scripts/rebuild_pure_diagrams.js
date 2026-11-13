const fs = require('fs');
const path = require('path');

// ============================================================================
// UC-M05_1_Create_Contract_SequenceDiagram.drawio
// Matches UC-M09_Update_Room_Info_SequenceDiagram.drawio 100%
// ============================================================================
function buildCreateContractDrawio() {
  return `<mxfile host="app.diagrams.net">
  <diagram name="UC-M05.1 Create Contract" id="uc-m05-1-create-contract">
    <mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1400" pageHeight="920" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <mxCell id="lf_landlord" value="Landlord" style="shape=umlLifeline;participant=umlActor;perimeter=lifelinePerimeter;whiteSpace=nowrap;html=1;container=1;collapsible=0;recursiveResize=0;verticalAlign=top;spacingTop=52;outlineConnect=0;size=50;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="115" y="40" width="30" height="840" as="geometry"/></mxCell>
        <mxCell id="lf_ui" value="«boundary»&lt;br&gt;ManageContractsPage" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1"><mxGeometry x="315" y="40" width="170" height="840" as="geometry"/></mxCell>
        <mxCell id="lf_controller" value="«boundary»&lt;br&gt;ContractController" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1"><mxGeometry x="615" y="40" width="170" height="840" as="geometry"/></mxCell>
        <mxCell id="lf_contract" value="«entity»&lt;br&gt;Contract" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1"><mxGeometry x="930" y="40" width="140" height="840" as="geometry"/></mxCell>
        <mxCell id="lf_db" value="«database»&lt;br&gt;MongoDB" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1"><mxGeometry x="1170" y="40" width="140" height="840" as="geometry"/></mxCell>
        
        <!-- Activation Bars -->
        <mxCell id="bar_L_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_landlord"><mxGeometry x="9" y="100" width="12" height="710" as="geometry"/></mxCell>
        <mxCell id="bar_UI_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_ui"><mxGeometry x="79" y="100" width="12" height="710" as="geometry"/></mxCell>
        <mxCell id="bar_C_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_controller"><mxGeometry x="79" y="172" width="12" height="610" as="geometry"/></mxCell>
        <mxCell id="bar_CTR_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_contract"><mxGeometry x="64" y="208" width="12" height="120" as="geometry"/></mxCell>
        <mxCell id="bar_DB_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_db"><mxGeometry x="64" y="244" width="12" height="48" as="geometry"/></mxCell>
        <mxCell id="bar_CTR_1" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_contract"><mxGeometry x="64" y="520" width="12" height="190" as="geometry"/></mxCell>
        <mxCell id="bar_DB_1" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_db"><mxGeometry x="64" y="556" width="12" height="120" as="geometry"/></mxCell>

        <!-- Alt Frame -->
        <mxCell id="alt_outer" value="alt" style="shape=umlFrame;whiteSpace=wrap;html=1;pointerEvents=0;width=40;height=20;" vertex="1" parent="1"><mxGeometry x="40" y="350" width="1280" height="440" as="geometry"/></mxCell>
        <mxCell id="div_0" value="" style="endArrow=none;dashed=1;html=1;rounded=0;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><mxPoint x="40" y="470" as="sourcePoint"/><mxPoint x="1320" y="470" as="targetPoint"/></mxGeometry></mxCell>
        <mxCell id="guard_0" value="[room is already occupied or not available]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1"><mxGeometry x="142" y="350" width="310" height="20" as="geometry"/></mxCell>
        <mxCell id="guard_1" value="[room is available (status === &apos;AVAILABLE&apos;)]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1"><mxGeometry x="142" y="472" width="290" height="20" as="geometry"/></mxCell>

        <!-- Messages -->
        <mxCell id="msg_0" value="select approved RentalRequest &amp; input deposit, price, start date, end date" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;exitX=1;exitY=0.0;exitDx=0;exitDy=0;entryX=0;entryY=0.0;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_L_0" target="bar_UI_0"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="msg_1" value="click &quot;Create Contract&quot;" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;exitX=1;exitY=0.051;exitDx=0;exitDy=0;entryX=0;entryY=0.051;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_L_0" target="bar_UI_0"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="msg_2" value="POST /api/contracts (roomId, tenantId, depositAmount, rentalPrice, startDate, endDate)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;exitX=1;exitY=0.101;exitDx=0;exitDy=0;entryX=0;entryY=0.0;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_UI_0" target="bar_C_0"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="msg_3" value="verify room availability (roomId)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;exitX=1;exitY=0.059;exitDx=0;exitDy=0;entryX=0;entryY=0.0;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_C_0" target="bar_CTR_0"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="msg_4" value="db.rooms.findById(roomId)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;exitX=1;exitY=0.30;exitDx=0;exitDy=0;entryX=0;entryY=0.0;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_CTR_0" target="bar_DB_0"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="msg_5" value="room document" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;exitX=0;exitY=0.75;exitDx=0;exitDy=0;entryX=1;entryY=0.60;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_DB_0" target="bar_CTR_0"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="msg_6" value="room" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;exitX=0;exitY=0.90;exitDx=0;exitDy=0;entryX=1;entryY=0.236;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_CTR_0" target="bar_C_0"><mxGeometry relative="1" as="geometry"/></mxCell>

        <!-- Branch 1 (Error) -->
        <mxCell id="msg_7" value="409 Conflict (&quot;Room is already occupied or not available&quot;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;exitX=0;exitY=0.357;exitDx=0;exitDy=0;entryX=1;entryY=0.408;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_C_0" target="bar_UI_0"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="msg_8" value="show error alert: &quot;Cannot create contract: Room occupied&quot;" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;exitX=0;exitY=0.459;exitDx=0;exitDy=0;entryX=1;entryY=0.459;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_UI_0" target="bar_L_0"><mxGeometry relative="1" as="geometry"/></mxCell>

        <!-- Branch 2 (Success) -->
        <mxCell id="msg_9" value="new Contract({ roomId, tenantId, depositAmount, rentalPrice, status: &apos;PENDING_SIGN&apos; })" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;exitX=1;exitY=0.570;exitDx=0;exitDy=0;entryX=0;entryY=0.0;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_C_0" target="bar_CTR_1"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="msg_10" value="db.contracts.insertOne(contractDoc)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;exitX=1;exitY=0.189;exitDx=0;exitDy=0;entryX=0;entryY=0.0;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_CTR_1" target="bar_DB_1"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="msg_11" value="inserted contract doc (status: &apos;PENDING_SIGN&apos;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;exitX=0;exitY=0.30;exitDx=0;exitDy=0;entryX=1;entryY=0.379;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_DB_1" target="bar_CTR_1"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="msg_12" value="db.rooms.updateOne({ _id: roomId }, { $set: { status: &apos;RENTED&apos; } })" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;exitX=1;exitY=0.568;exitDx=0;exitDy=0;entryX=0;entryY=0.60;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_CTR_1" target="bar_DB_1"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="msg_13" value="room updated to RENTED" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;exitX=0;exitY=0.90;exitDx=0;exitDy=0;entryX=1;entryY=0.758;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_DB_1" target="bar_CTR_1"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="msg_14" value="contract instance" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;exitX=0;exitY=0.947;exitDx=0;exitDy=0;entryX=1;entryY=0.866;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_CTR_1" target="bar_C_0"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="msg_15" value="201 Created (contract)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;exitX=0;exitY=0.925;exitDx=0;exitDy=0;entryX=1;entryY=0.935;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_C_0" target="bar_UI_0"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="msg_16" value="refresh contract list &amp; show success alert" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;exitX=0;exitY=0.986;exitDx=0;exitDy=0;entryX=1;entryY=0.986;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_UI_0" target="bar_L_0"><mxGeometry relative="1" as="geometry"/></mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}

// ============================================================================
// UC-M05_2_Sign_Contract_SequenceDiagram.drawio
// Matches UC-M09_Update_Room_Info_SequenceDiagram.drawio 100%
// ============================================================================
function buildSignContractDrawio() {
  return `<mxfile host="app.diagrams.net">
  <diagram name="UC-M05.2 Sign Contract" id="uc-m05-2-sign-contract">
    <mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1400" pageHeight="880" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <mxCell id="lf_tenant" value="Tenant" style="shape=umlLifeline;participant=umlActor;perimeter=lifelinePerimeter;whiteSpace=nowrap;html=1;container=1;collapsible=0;recursiveResize=0;verticalAlign=top;spacingTop=52;outlineConnect=0;size=50;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="115" y="40" width="30" height="780" as="geometry"/></mxCell>
        <mxCell id="lf_ui" value="«boundary»&lt;br&gt;ContractDetailScreen (Mobile)" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1"><mxGeometry x="315" y="40" width="170" height="780" as="geometry"/></mxCell>
        <mxCell id="lf_controller" value="«boundary»&lt;br&gt;ContractController" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1"><mxGeometry x="615" y="40" width="170" height="780" as="geometry"/></mxCell>
        <mxCell id="lf_contract" value="«entity»&lt;br&gt;Contract" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1"><mxGeometry x="930" y="40" width="140" height="780" as="geometry"/></mxCell>
        <mxCell id="lf_db" value="«database»&lt;br&gt;MongoDB" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1"><mxGeometry x="1170" y="40" width="140" height="780" as="geometry"/></mxCell>

        <!-- Activation Bars -->
        <mxCell id="bar_T_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_tenant"><mxGeometry x="9" y="100" width="12" height="650" as="geometry"/></mxCell>
        <mxCell id="bar_UI_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_ui"><mxGeometry x="79" y="100" width="12" height="650" as="geometry"/></mxCell>
        <mxCell id="bar_C_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_controller"><mxGeometry x="79" y="172" width="12" height="550" as="geometry"/></mxCell>
        <mxCell id="bar_CTR_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_contract"><mxGeometry x="64" y="208" width="12" height="120" as="geometry"/></mxCell>
        <mxCell id="bar_DB_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_db"><mxGeometry x="64" y="244" width="12" height="48" as="geometry"/></mxCell>
        <mxCell id="bar_CTR_1" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_contract"><mxGeometry x="64" y="520" width="12" height="150" as="geometry"/></mxCell>
        <mxCell id="bar_DB_1" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_db"><mxGeometry x="64" y="556" width="12" height="70" as="geometry"/></mxCell>

        <!-- Alt Frame -->
        <mxCell id="alt_outer" value="alt" style="shape=umlFrame;whiteSpace=wrap;html=1;pointerEvents=0;width=40;height=20;" vertex="1" parent="1"><mxGeometry x="40" y="350" width="1280" height="390" as="geometry"/></mxCell>
        <mxCell id="div_0" value="" style="endArrow=none;dashed=1;html=1;rounded=0;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><mxPoint x="40" y="470" as="sourcePoint"/><mxPoint x="1320" y="470" as="targetPoint"/></mxGeometry></mxCell>
        <mxCell id="guard_0" value="[tenantId !== user.id || contract.status !== &apos;PENDING_SIGN&apos;]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1"><mxGeometry x="142" y="350" width="370" height="20" as="geometry"/></mxCell>
        <mxCell id="guard_1" value="[tenant identity verified &amp;&amp; contract.status === &apos;PENDING_SIGN&apos;]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1"><mxGeometry x="142" y="472" width="390" height="20" as="geometry"/></mxCell>

        <!-- Messages -->
        <mxCell id="msg_0" value="open lease contract on mobile app, review legal clauses &amp; draw signature on touch canvas" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;exitX=1;exitY=0.0;exitDx=0;exitDy=0;entryX=0;entryY=0.0;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_T_0" target="bar_UI_0"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="msg_1" value="click &quot;Sign Contract&quot;" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;exitX=1;exitY=0.055;exitDx=0;exitDy=0;entryX=0;entryY=0.055;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_T_0" target="bar_UI_0"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="msg_2" value="POST /api/contracts/:id/sign (signatureBase64)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;exitX=1;exitY=0.111;exitDx=0;exitDy=0;entryX=0;entryY=0.0;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_UI_0" target="bar_C_0"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="msg_3" value="verify contract and status (id)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;exitX=1;exitY=0.065;exitDx=0;exitDy=0;entryX=0;entryY=0.0;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_C_0" target="bar_CTR_0"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="msg_4" value="db.contracts.findById(id)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;exitX=1;exitY=0.30;exitDx=0;exitDy=0;entryX=0;entryY=0.0;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_CTR_0" target="bar_DB_0"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="msg_5" value="contract document" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;exitX=0;exitY=0.75;exitDx=0;exitDy=0;entryX=1;entryY=0.60;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_DB_0" target="bar_CTR_0"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="msg_6" value="contract" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;exitX=0;exitY=0.90;exitDx=0;exitDy=0;entryX=1;entryY=0.262;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_CTR_0" target="bar_C_0"><mxGeometry relative="1" as="geometry"/></mxCell>

        <!-- Branch 1 (Error) -->
        <mxCell id="msg_7" value="403 Forbidden / 400 Bad Request (&quot;Invalid tenant identity or contract status&quot;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;exitX=0;exitY=0.396;exitDx=0;exitDy=0;entryX=1;entryY=0.446;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_C_0" target="bar_UI_0"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="msg_8" value="show error alert: &quot;Cannot sign contract&quot;" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;exitX=0;exitY=0.508;exitDx=0;exitDy=0;entryX=1;entryY=0.508;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_UI_0" target="bar_T_0"><mxGeometry relative="1" as="geometry"/></mxCell>

        <!-- Branch 2 (Success) -->
        <mxCell id="msg_9" value="saveSignatureAndActivate({ signatureBase64, signedAt: now, status: &apos;ACTIVE&apos; })" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;exitX=1;exitY=0.633;exitDx=0;exitDy=0;entryX=0;entryY=0.0;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_C_0" target="bar_CTR_1"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="msg_10" value="db.contracts.updateOne({ _id: id }, { $set: { signatureUrl, signedAt, status: &apos;ACTIVE&apos; } })" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;exitX=1;exitY=0.24;exitDx=0;exitDy=0;entryX=0;entryY=0.0;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_CTR_1" target="bar_DB_1"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="msg_11" value="writeResult ({ modifiedCount: 1 })" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;exitX=0;exitY=0.85;exitDx=0;exitDy=0;entryX=1;entryY=0.67;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_DB_1" target="bar_CTR_1"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="msg_12" value="updated contract (status: &apos;ACTIVE&apos;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;exitX=0;exitY=0.90;exitDx=0;exitDy=0;entryX=1;entryY=0.827;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_CTR_1" target="bar_C_0"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="msg_13" value="200 OK ({ success: true, message: &quot;Contract officially signed &amp; active&quot;, data })" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;exitX=0;exitY=0.891;exitDx=0;exitDy=0;entryX=1;entryY=0.908;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_C_0" target="bar_UI_0"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="msg_14" value="display signed confirmation &amp; contract officially ACTIVE" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;exitX=0;exitY=0.969;exitDx=0;exitDy=0;entryX=1;entryY=0.969;entryDx=0;entryDy=0;" edge="1" parent="1" source="bar_UI_0" target="bar_T_0"><mxGeometry relative="1" as="geometry"/></mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}

const outDir = path.join(__dirname, '..', 'docs', 'diagrams');
fs.writeFileSync(path.join(outDir, 'UC-M05_1_Create_Contract_SequenceDiagram.drawio'), buildCreateContractDrawio(), 'utf8');
fs.writeFileSync(path.join(outDir, 'UC-M05_2_Sign_Contract_SequenceDiagram.drawio'), buildSignContractDrawio(), 'utf8');

console.log('✅ Rebuilt UC-M05_1 and UC-M05_2 in exact UC-M09 Draw.io standard!');
