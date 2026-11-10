const fs = require('fs');
const path = require('path');

// ============================================================================
// 1. CLASS DIAGRAM: ClassDiagram_Contract_Module.drawio
// ============================================================================
function generateClassDiagram() {
  return `<mxfile host="app.diagrams.net">
  <diagram name="Rental Contract Management Class Diagram" id="class-diagram-contract-module">
    <mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1500" pageHeight="1050" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>

        <!-- Title -->
        <mxCell id="title" value="&lt;b&gt;Figure 2.3.1. Rental Contract Management Class Diagram&lt;/b&gt;" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=16;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="40" y="20" width="1400" height="30" as="geometry"/>
        </mxCell>

        <!-- 1. Contract Entity -->
        <mxCell id="cls_contract" value="«entity»&lt;br&gt;&lt;b&gt;Contract&lt;/b&gt;" style="swimlane;fontStyle=0;childLayout=stackLayout;horizontal=1;startSize=40;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="580" y="80" width="340" height="500" as="geometry"/>
        </mxCell>
        <mxCell id="attr_contract" value="- _id: ObjectId&#xa;- roomId: ObjectId&#xa;- tenantId: ObjectId&#xa;- rentalRequestId: ObjectId&#xa;- signedDate: Date&#xa;- startDate: Date&#xa;- endDate: Date&#xa;- depositAmount: Number&#xa;- rentalPrice: Number&#xa;- status: ContractStatus&#xa;- signatureUrl: String&#xa;- signedAt: Date&#xa;- landlordName: String&#xa;- landlordCccd: String&#xa;- landlordPhone: String&#xa;- tenantName: String&#xa;- tenantCccd: String&#xa;- tenantPhone: String&#xa;- tenantAddress: String" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=8;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;fontSize=11;" vertex="1" parent="cls_contract">
          <mxGeometry y="40" width="340" height="330" as="geometry"/>
        </mxCell>
        <mxCell id="line_contract" value="" style="line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;strokeColor=#000000;" vertex="1" parent="cls_contract">
          <mxGeometry y="370" width="340" height="8" as="geometry"/>
        </mxCell>
        <mxCell id="meth_contract" value="+ createContract(data: Object): Promise&lt;Contract&gt;&#xa;+ signContract(sigBase64: String): Promise&lt;Contract&gt;&#xa;+ extendContract(newEnd: Date): Promise&lt;Contract&gt;&#xa;+ terminateContract(): Promise&lt;Contract&gt;&#xa;+ isExpired(): Boolean" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=8;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;fontSize=11;" vertex="1" parent="cls_contract">
          <mxGeometry y="378" width="340" height="112" as="geometry"/>
        </mxCell>

        <!-- 2. ContractStatus Enum -->
        <mxCell id="cls_enum" value="«enumeration»&lt;br&gt;&lt;b&gt;ContractStatus&lt;/b&gt;" style="swimlane;fontStyle=0;childLayout=stackLayout;horizontal=1;startSize=40;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="980" y="80" width="180" height="170" as="geometry"/>
        </mxCell>
        <mxCell id="attr_enum" value="DRAFT&#xa;PENDING_SIGN&#xa;ACTIVE&#xa;EXPIRED&#xa;TERMINATED" style="text;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;fontSize=11;fontStyle=2;" vertex="1" parent="cls_enum">
          <mxGeometry y="40" width="180" height="120" as="geometry"/>
        </mxCell>

        <!-- 3. Room Entity -->
        <mxCell id="cls_room" value="«entity»&lt;br&gt;&lt;b&gt;Room&lt;/b&gt;" style="swimlane;fontStyle=0;childLayout=stackLayout;horizontal=1;startSize=40;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="80" y="80" width="280" height="260" as="geometry"/>
        </mxCell>
        <mxCell id="attr_room" value="- _id: ObjectId&#xa;- roomNumber: String&#xa;- basePrice: Number&#xa;- area: Number&#xa;- maxOccupants: Number&#xa;- status: RoomStatus&#xa;- amenities: List&lt;String&gt;" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=8;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;fontSize=11;" vertex="1" parent="cls_room">
          <mxGeometry y="40" width="280" height="130" as="geometry"/>
        </mxCell>
        <mxCell id="line_room" value="" style="line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;strokeColor=#000000;" vertex="1" parent="cls_room">
          <mxGeometry y="170" width="280" height="8" as="geometry"/>
        </mxCell>
        <mxCell id="meth_room" value="+ updateStatus(st: RoomStatus): Promise&lt;Room&gt;&#xa;+ isAvailable(): Boolean" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=8;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;fontSize=11;" vertex="1" parent="cls_room">
          <mxGeometry y="178" width="280" height="72" as="geometry"/>
        </mxCell>

        <!-- 4. RentalRequest Entity -->
        <mxCell id="cls_request" value="«entity»&lt;br&gt;&lt;b&gt;RentalRequest&lt;/b&gt;" style="swimlane;fontStyle=0;childLayout=stackLayout;horizontal=1;startSize=40;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="80" y="420" width="300" height="260" as="geometry"/>
        </mxCell>
        <mxCell id="attr_request" value="- _id: ObjectId&#xa;- userId: ObjectId&#xa;- roomId: ObjectId&#xa;- tenantName: String&#xa;- tenantPhone: String&#xa;- expectedMoveInDate: Date&#xa;- note: String&#xa;- status: RequestStatus&#xa;- requestDate: Date" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=8;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;fontSize=11;" vertex="1" parent="cls_request">
          <mxGeometry y="40" width="300" height="150" as="geometry"/>
        </mxCell>
        <mxCell id="line_request" value="" style="line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;strokeColor=#000000;" vertex="1" parent="cls_request">
          <mxGeometry y="190" width="300" height="8" as="geometry"/>
        </mxCell>
        <mxCell id="meth_request" value="+ approve(): Promise&lt;RentalRequest&gt;&#xa;+ reject(reason: String): Promise&lt;RentalRequest&gt;" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=8;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;fontSize=11;" vertex="1" parent="cls_request">
          <mxGeometry y="198" width="300" height="52" as="geometry"/>
        </mxCell>

        <!-- 5. User Entity -->
        <mxCell id="cls_user" value="«entity»&lt;br&gt;&lt;b&gt;User&lt;/b&gt;" style="swimlane;fontStyle=0;childLayout=stackLayout;horizontal=1;startSize=40;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="1220" y="80" width="240" height="230" as="geometry"/>
        </mxCell>
        <mxCell id="attr_user" value="- _id: ObjectId&#xa;- fullName: String&#xa;- email: String&#xa;- phone: String&#xa;- role: UserRole&#xa;- identityNumber: String&#xa;- address: String" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=8;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;fontSize=11;" vertex="1" parent="cls_user">
          <mxGeometry y="40" width="240" height="130" as="geometry"/>
        </mxCell>
        <mxCell id="line_user" value="" style="line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;strokeColor=#000000;" vertex="1" parent="cls_user">
          <mxGeometry y="170" width="240" height="8" as="geometry"/>
        </mxCell>
        <mxCell id="meth_user" value="+ hasRole(role: String): Boolean" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=8;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;fontSize=11;" vertex="1" parent="cls_user">
          <mxGeometry y="178" width="240" height="42" as="geometry"/>
        </mxCell>

        <!-- 6. ContractService -->
        <mxCell id="cls_service" value="«service»&lt;br&gt;&lt;b&gt;ContractService&lt;/b&gt;" style="swimlane;fontStyle=0;childLayout=stackLayout;horizontal=1;startSize=40;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="540" y="660" width="420" height="190" as="geometry"/>
        </mxCell>
        <mxCell id="attr_service" value="- contractRepository: Contract&#xa;- roomRepository: Room" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=8;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;fontSize=11;" vertex="1" parent="cls_service">
          <mxGeometry y="40" width="420" height="40" as="geometry"/>
        </mxCell>
        <mxCell id="line_service" value="" style="line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;strokeColor=#000000;" vertex="1" parent="cls_service">
          <mxGeometry y="80" width="420" height="8" as="geometry"/>
        </mxCell>
        <mxCell id="meth_service" value="+ createContract(payload: Object): Promise&lt;Contract&gt;&#xa;+ verifyAndSign(contractId: String, tenantId: String, sig: String): Promise&lt;Contract&gt;&#xa;+ extendContract(contractId: String, newEndDate: Date): Promise&lt;Contract&gt;&#xa;+ terminateContract(contractId: String): Promise&lt;Contract&gt;" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=8;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;fontSize=11;" vertex="1" parent="cls_service">
          <mxGeometry y="88" width="420" height="92" as="geometry"/>
        </mxCell>

        <!-- 7. ContractController -->
        <mxCell id="cls_ctrl" value="«controller»&lt;br&gt;&lt;b&gt;ContractController&lt;/b&gt;" style="swimlane;fontStyle=0;childLayout=stackLayout;horizontal=1;startSize=40;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="1040" y="660" width="380" height="210" as="geometry"/>
        </mxCell>
        <mxCell id="attr_ctrl" value="- contractService: ContractService" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=8;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;fontSize=11;" vertex="1" parent="cls_ctrl">
          <mxGeometry y="40" width="380" height="30" as="geometry"/>
        </mxCell>
        <mxCell id="line_ctrl" value="" style="line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;strokeColor=#000000;" vertex="1" parent="cls_ctrl">
          <mxGeometry y="70" width="380" height="8" as="geometry"/>
        </mxCell>
        <mxCell id="meth_ctrl" value="+ createContract(req: Request, res: Response): Promise&lt;void&gt;&#xa;+ signContract(req: Request, res: Response): Promise&lt;void&gt;&#xa;+ getAllContracts(req: Request, res: Response): Promise&lt;void&gt;&#xa;+ getContractById(req: Request, res: Response): Promise&lt;void&gt;&#xa;+ extendContract(req: Request, res: Response): Promise&lt;void&gt;&#xa;+ terminateContract(req: Request, res: Response): Promise&lt;void&gt;" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=8;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;fontSize=11;" vertex="1" parent="cls_ctrl">
          <mxGeometry y="78" width="380" height="122" as="geometry"/>
        </mxCell>

        <!-- RELATIONSHIPS -->
        <!-- Room to Contract (1 to 0..*) -->
        <mxCell id="rel_room_ctr" value="" style="endArrow=none;html=1;rounded=0;exitX=1;exitY=0.4;exitDx=0;exitDy=0;entryX=0;entryY=0.22;entryDx=0;entryDy=0;" edge="1" parent="1" source="cls_room" target="cls_contract">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="lbl_room_ctr_1" value="1" style="text;html=1;align=center;verticalAlign=middle;fontSize=11;" vertex="1" parent="rel_room_ctr">
          <mxGeometry relative="1" x="-0.85" y="-12" as="geometry"><mxPoint as="offset"/></mxGeometry>
        </mxCell>
        <mxCell id="lbl_room_ctr_m" value="0..*" style="text;html=1;align=center;verticalAlign=middle;fontSize=11;" vertex="1" parent="rel_room_ctr">
          <mxGeometry relative="1" x="0.85" y="-12" as="geometry"><mxPoint as="offset"/></mxGeometry>
        </mxCell>
        <mxCell id="lbl_room_ctr_txt" value="governs" style="text;html=1;align=center;verticalAlign=middle;fontSize=11;fontStyle=2;" vertex="1" parent="rel_room_ctr">
          <mxGeometry relative="1" x="0" y="-15" as="geometry"><mxPoint as="offset"/></mxGeometry>
        </mxCell>

        <!-- RentalRequest to Contract (0..1 to 1) -->
        <mxCell id="rel_req_ctr" value="" style="endArrow=none;html=1;rounded=0;exitX=1;exitY=0.35;exitDx=0;exitDy=0;entryX=0;entryY=0.75;entryDx=0;entryDy=0;" edge="1" parent="1" source="cls_request" target="cls_contract">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="lbl_req_ctr_1" value="0..1" style="text;html=1;align=center;verticalAlign=middle;fontSize=11;" vertex="1" parent="rel_req_ctr">
          <mxGeometry relative="1" x="-0.85" y="-12" as="geometry"><mxPoint as="offset"/></mxGeometry>
        </mxCell>
        <mxCell id="lbl_req_ctr_m" value="1" style="text;html=1;align=center;verticalAlign=middle;fontSize=11;" vertex="1" parent="rel_req_ctr">
          <mxGeometry relative="1" x="0.85" y="-12" as="geometry"><mxPoint as="offset"/></mxGeometry>
        </mxCell>
        <mxCell id="lbl_req_ctr_txt" value="promotes to" style="text;html=1;align=center;verticalAlign=middle;fontSize=11;fontStyle=2;" vertex="1" parent="rel_req_ctr">
          <mxGeometry relative="1" x="0" y="-15" as="geometry"><mxPoint as="offset"/></mxGeometry>
        </mxCell>

        <!-- User (Tenant) to Contract (1 to 0..*) -->
        <mxCell id="rel_user_ctr" value="" style="endArrow=none;html=1;rounded=0;exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=1;entryY=0.25;entryDx=0;entryDy=0;" edge="1" parent="1" source="cls_user" target="cls_contract">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="lbl_user_ctr_1" value="1" style="text;html=1;align=center;verticalAlign=middle;fontSize=11;" vertex="1" parent="rel_user_ctr">
          <mxGeometry relative="1" x="-0.85" y="-12" as="geometry"><mxPoint as="offset"/></mxGeometry>
        </mxCell>
        <mxCell id="lbl_user_ctr_m" value="0..*" style="text;html=1;align=center;verticalAlign=middle;fontSize=11;" vertex="1" parent="rel_user_ctr">
          <mxGeometry relative="1" x="0.85" y="-12" as="geometry"><mxPoint as="offset"/></mxGeometry>
        </mxCell>
        <mxCell id="lbl_user_ctr_txt" value="signs as tenant" style="text;html=1;align=center;verticalAlign=middle;fontSize=11;fontStyle=2;" vertex="1" parent="rel_user_ctr">
          <mxGeometry relative="1" x="0" y="-15" as="geometry"><mxPoint as="offset"/></mxGeometry>
        </mxCell>

        <!-- Contract to ContractStatus (Dependency) -->
        <mxCell id="rel_ctr_enum" value="" style="endArrow=open;dashed=1;html=1;rounded=0;exitX=1;exitY=0.15;exitDx=0;exitDy=0;entryX=0;entryY=0.35;entryDx=0;entryDy=0;endSize=8;" edge="1" parent="1" source="cls_contract" target="cls_enum">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="lbl_ctr_enum" value="«use»" style="text;html=1;align=center;verticalAlign=middle;fontSize=11;fontStyle=2;" vertex="1" parent="rel_ctr_enum">
          <mxGeometry relative="1" x="0" y="-12" as="geometry"><mxPoint as="offset"/></mxGeometry>
        </mxCell>

        <!-- Service to Contract (Manages) -->
        <mxCell id="rel_srv_ctr" value="" style="endArrow=open;dashed=1;html=1;rounded=0;exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;endSize=8;" edge="1" parent="1" source="cls_service" target="cls_contract">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="lbl_srv_ctr" value="«manages»" style="text;html=1;align=center;verticalAlign=middle;fontSize=11;fontStyle=2;" vertex="1" parent="rel_srv_ctr">
          <mxGeometry relative="1" x="0" y="-12" as="geometry"><mxPoint as="offset"/></mxGeometry>
        </mxCell>

        <!-- Controller to Service (Calls) -->
        <mxCell id="rel_ctrl_srv" value="" style="endArrow=open;dashed=1;html=1;rounded=0;exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;endSize=8;" edge="1" parent="1" source="cls_ctrl" target="cls_service">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="lbl_ctrl_srv" value="«calls»" style="text;html=1;align=center;verticalAlign=middle;fontSize=11;fontStyle=2;" vertex="1" parent="rel_ctrl_srv">
          <mxGeometry relative="1" x="0" y="-12" as="geometry"><mxPoint as="offset"/></mxGeometry>
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}

// ============================================================================
// 2. SEQUENCE DIAGRAM: UC-M05_1_Create_Contract_SequenceDiagram.drawio
// ============================================================================
function generateCreateContractSequenceDiagram() {
  return `<mxfile host="app.diagrams.net">
  <diagram name="UC-M05.1 Create Contract" id="uc-m05-1-create-contract">
    <mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1400" pageHeight="1120" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>

        <!-- Title -->
        <mxCell id="title" value="&lt;b&gt;Figure 2.3.2. Create Contract Sequence Diagram&lt;/b&gt;" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=15;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="40" y="10" width="1320" height="25" as="geometry"/>
        </mxCell>

        <!-- Lifelines -->
        <mxCell id="lf_landlord" value="Landlord" style="shape=umlLifeline;participant=umlActor;perimeter=lifelinePerimeter;whiteSpace=nowrap;html=1;container=1;collapsible=0;recursiveResize=0;verticalAlign=top;spacingTop=52;outlineConnect=0;size=50;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="115" y="45" width="30" height="1020" as="geometry"/>
        </mxCell>
        <mxCell id="lf_ui" value="«boundary»&lt;br&gt;ManageContractsPage" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1">
          <mxGeometry x="315" y="45" width="170" height="1020" as="geometry"/>
        </mxCell>
        <mxCell id="lf_controller" value="«boundary»&lt;br&gt;ContractController" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1">
          <mxGeometry x="615" y="45" width="170" height="1020" as="geometry"/>
        </mxCell>
        <mxCell id="lf_contract" value="«entity»&lt;br&gt;Contract" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1">
          <mxGeometry x="915" y="45" width="140" height="1020" as="geometry"/>
        </mxCell>
        <mxCell id="lf_room" value="«entity»&lt;br&gt;Room" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1">
          <mxGeometry x="1115" y="45" width="140" height="1020" as="geometry"/>
        </mxCell>
        <mxCell id="lf_db" value="«database»&lt;br&gt;MongoDB" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1">
          <mxGeometry x="1300" y="45" width="120" height="1020" as="geometry"/>
        </mxCell>

        <!-- Activation Bars -->
        <mxCell id="bar_L" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_landlord">
          <mxGeometry x="9" y="100" width="12" height="880" as="geometry"/>
        </mxCell>
        <mxCell id="bar_UI" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_ui">
          <mxGeometry x="79" y="100" width="12" height="880" as="geometry"/>
        </mxCell>
        <mxCell id="bar_C" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_controller">
          <mxGeometry x="79" y="170" width="12" height="770" as="geometry"/>
        </mxCell>
        <mxCell id="bar_R_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_room">
          <mxGeometry x="64" y="250" width="12" height="120" as="geometry"/>
        </mxCell>
        <mxCell id="bar_R_1" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_room">
          <mxGeometry x="64" y="700" width="12" height="80" as="geometry"/>
        </mxCell>
        <mxCell id="bar_CTR" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_contract">
          <mxGeometry x="64" y="580" width="12" height="100" as="geometry"/>
        </mxCell>
        <mxCell id="bar_DB_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_db">
          <mxGeometry x="54" y="275" width="12" height="70" as="geometry"/>
        </mxCell>
        <mxCell id="bar_DB_1" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_db">
          <mxGeometry x="54" y="605" width="12" height="190" as="geometry"/>
        </mxCell>

        <!-- Alt Frame -->
        <mxCell id="alt_frame" value="alt" style="shape=umlFrame;whiteSpace=wrap;html=1;pointerEvents=0;width=40;height=20;" vertex="1" parent="1">
          <mxGeometry x="40" y="420" width="1340" height="490" as="geometry"/>
        </mxCell>
        <mxCell id="div_alt" value="" style="endArrow=none;dashed=1;html=1;rounded=0;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="40" y="540" as="sourcePoint"/>
            <mxPoint x="1380" y="540" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="guard_err" value="[room is already occupied or not available]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1">
          <mxGeometry x="120" y="420" width="280" height="20" as="geometry"/>
        </mxCell>
        <mxCell id="guard_ok" value="[room is available (status == &apos;AVAILABLE&apos;)]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1">
          <mxGeometry x="120" y="542" width="280" height="20" as="geometry"/>
        </mxCell>

        <!-- Messages -->
        <!-- Step 1 -->
        <mxCell id="msg_1" value="1: select approved RentalRequest &amp; input depositAmount, rentalPrice, startDate, endDate" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="136" y="150" as="sourcePoint"/>
            <mxPoint x="394" y="150" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_1b" value="click &quot;Create Contract&quot;" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="136" y="180" as="sourcePoint"/>
            <mxPoint x="394" y="180" as="targetPoint"/>
          </mxGeometry>
        </mxCell>

        <!-- Step 2 -->
        <mxCell id="msg_2" value="2: POST /api/contracts (roomId, tenantId, depositAmount, rentalPrice, startDate, endDate)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="406" y="210" as="sourcePoint"/>
            <mxPoint x="694" y="210" as="targetPoint"/>
          </mxGeometry>
        </mxCell>

        <!-- Step 3 -->
        <mxCell id="msg_3" value="3: findById(roomId)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="706" y="290" as="sourcePoint"/>
            <mxPoint x="1179" y="290" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_3b" value="db.rooms.findById(roomId)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="1191" y="315" as="sourcePoint"/>
            <mxPoint x="1354" y="315" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_3c" value="room document (status, basePrice)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="1354" y="360" as="sourcePoint"/>
            <mxPoint x="1191" y="360" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_3d" value="room" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="1179" y="385" as="sourcePoint"/>
            <mxPoint x="706" y="385" as="targetPoint"/>
          </mxGeometry>
        </mxCell>

        <!-- Step 4 (Alt 1: Error) -->
        <mxCell id="msg_4a" value="4: 409 Conflict (&quot;Room is already occupied or not available&quot;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="694" y="470" as="sourcePoint"/>
            <mxPoint x="406" y="470" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_4b" value="displayConflictErrorAlert(&quot;Phòng không khả dụng&quot;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="394" y="505" as="sourcePoint"/>
            <mxPoint x="136" y="505" as="targetPoint"/>
          </mxGeometry>
        </mxCell>

        <!-- Step 5 (Alt 2: Success) -->
        <mxCell id="msg_5a" value="5: new Contract({ roomId, tenantId, depositAmount, rentalPrice, status: &apos;PENDING_SIGN&apos; })" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="706" y="620" as="sourcePoint"/>
            <mxPoint x="979" y="620" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_5b" value="db.contracts.insertOne(contractData)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="991" y="645" as="sourcePoint"/>
            <mxPoint x="1354" y="645" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_5c" value="contract document (status: &apos;PENDING_SIGN&apos;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="1354" y="680" as="sourcePoint"/>
            <mxPoint x="706" y="680" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_5d" value="updateStatus(&apos;RENTED&apos;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="706" y="720" as="sourcePoint"/>
            <mxPoint x="1179" y="720" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_5e" value="db.rooms.updateOne({ _id: roomId }, { $set: { status: &apos;RENTED&apos; } })" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="1191" y="745" as="sourcePoint"/>
            <mxPoint x="1354" y="745" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_5f" value="updatedRoom document" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="1354" y="780" as="sourcePoint"/>
            <mxPoint x="706" y="780" as="targetPoint"/>
          </mxGeometry>
        </mxCell>

        <!-- Step 6 -->
        <mxCell id="msg_6a" value="6: 201 Created (contract)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="694" y="830" as="sourcePoint"/>
            <mxPoint x="406" y="830" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_6b" value="refresh contract list &amp; displaySuccessAlert(&quot;Contract created as PENDING_SIGN&quot;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="394" y="870" as="sourcePoint"/>
            <mxPoint x="136" y="870" as="targetPoint"/>
          </mxGeometry>
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}

// ============================================================================
// 3. SEQUENCE DIAGRAM: UC-M05_2_Sign_Contract_SequenceDiagram.drawio
// ============================================================================
function generateSignContractSequenceDiagram() {
  return `<mxfile host="app.diagrams.net">
  <diagram name="UC-M05.2 Sign Contract" id="uc-m05-2-sign-contract">
    <mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1450" pageHeight="1120" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>

        <!-- Title -->
        <mxCell id="title" value="&lt;b&gt;Figure 2.3.3. Sign Contract Sequence Diagram&lt;/b&gt;" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=15;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="40" y="10" width="1370" height="25" as="geometry"/>
        </mxCell>

        <!-- Lifelines -->
        <mxCell id="lf_tenant" value="Tenant" style="shape=umlLifeline;participant=umlActor;perimeter=lifelinePerimeter;whiteSpace=nowrap;html=1;container=1;collapsible=0;recursiveResize=0;verticalAlign=top;spacingTop=52;outlineConnect=0;size=50;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="115" y="45" width="30" height="1020" as="geometry"/>
        </mxCell>
        <mxCell id="lf_ui" value="«boundary»&lt;br&gt;ContractDetailScreen (Mobile)" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1">
          <mxGeometry x="305" y="45" width="180" height="1020" as="geometry"/>
        </mxCell>
        <mxCell id="lf_controller" value="«boundary»&lt;br&gt;ContractController" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1">
          <mxGeometry x="585" y="45" width="170" height="1020" as="geometry"/>
        </mxCell>
        <mxCell id="lf_service" value="«control»&lt;br&gt;ContractService" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1">
          <mxGeometry x="845" y="45" width="160" height="1020" as="geometry"/>
        </mxCell>
        <mxCell id="lf_contract" value="«entity»&lt;br&gt;Contract" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1">
          <mxGeometry x="1095" y="45" width="140" height="1020" as="geometry"/>
        </mxCell>
        <mxCell id="lf_db" value="«database»&lt;br&gt;MongoDB" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;size=60;" vertex="1" parent="1">
          <mxGeometry x="1315" y="45" width="120" height="1020" as="geometry"/>
        </mxCell>

        <!-- Activation Bars -->
        <mxCell id="bar_T" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_tenant">
          <mxGeometry x="9" y="100" width="12" height="880" as="geometry"/>
        </mxCell>
        <mxCell id="bar_UI" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_ui">
          <mxGeometry x="84" y="100" width="12" height="880" as="geometry"/>
        </mxCell>
        <mxCell id="bar_C" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_controller">
          <mxGeometry x="79" y="170" width="12" height="770" as="geometry"/>
        </mxCell>
        <mxCell id="bar_S" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_service">
          <mxGeometry x="74" y="230" width="12" height="690" as="geometry"/>
        </mxCell>
        <mxCell id="bar_CTR" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_contract">
          <mxGeometry x="64" y="270" width="12" height="100" as="geometry"/>
        </mxCell>
        <mxCell id="bar_DB_0" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_db">
          <mxGeometry x="54" y="295" width="12" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="bar_DB_1" value="" style="html=1;points=[];perimeter=orthogonalPerimeter;outlineConnect=0;targetShapes=umlLifeline;portConstraint=eastwest;" vertex="1" parent="lf_db">
          <mxGeometry x="54" y="695" width="12" height="80" as="geometry"/>
        </mxCell>

        <!-- Alt Frame -->
        <mxCell id="alt_frame" value="alt" style="shape=umlFrame;whiteSpace=wrap;html=1;pointerEvents=0;width=40;height=20;" vertex="1" parent="1">
          <mxGeometry x="40" y="440" width="1390" height="470" as="geometry"/>
        </mxCell>
        <mxCell id="div_alt" value="" style="endArrow=none;dashed=1;html=1;rounded=0;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="40" y="560" as="sourcePoint"/>
            <mxPoint x="1430" y="560" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="guard_err" value="[tenantId != user.id or contract.status != &apos;PENDING_SIGN&apos;]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1">
          <mxGeometry x="120" y="440" width="360" height="20" as="geometry"/>
        </mxCell>
        <mxCell id="guard_ok" value="[tenant identity verified &amp; status == &apos;PENDING_SIGN&apos;]" style="text;html=1;align=left;verticalAlign=middle;whiteSpace=nowrap;fontSize=11;fontStyle=2;labelBackgroundColor=#ffffff;" vertex="1" parent="1">
          <mxGeometry x="120" y="562" width="340" height="20" as="geometry"/>
        </mxCell>

        <!-- Messages -->
        <!-- Step 1 -->
        <mxCell id="msg_1" value="1: open lease contract, review legal clauses &amp; draw signature on touch canvas" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="136" y="150" as="sourcePoint"/>
            <mxPoint x="389" y="150" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_1b" value="click &quot;Sign Contract&quot;" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="136" y="180" as="sourcePoint"/>
            <mxPoint x="389" y="180" as="targetPoint"/>
          </mxGeometry>
        </mxCell>

        <!-- Step 2 -->
        <mxCell id="msg_2" value="2: POST /api/contracts/:id/sign (signatureBase64)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="401" y="210" as="sourcePoint"/>
            <mxPoint x="664" y="210" as="targetPoint"/>
          </mxGeometry>
        </mxCell>

        <!-- Step 3 -->
        <mxCell id="msg_3a" value="verifyAndSign(id, tenantId, signatureBase64)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="676" y="245" as="sourcePoint"/>
            <mxPoint x="919" y="245" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_3b" value="3: findById(id)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="931" y="280" as="sourcePoint"/>
            <mxPoint x="1159" y="280" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_3c" value="db.contracts.findById(id)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="1171" y="305" as="sourcePoint"/>
            <mxPoint x="1369" y="305" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_3d" value="contract document" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="1369" y="350" as="sourcePoint"/>
            <mxPoint x="1171" y="350" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_3e" value="contract" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="1159" y="375" as="sourcePoint"/>
            <mxPoint x="931" y="375" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_3f" value="verifyIdentity &amp; checkStatus(PENDING_SIGN)" style="html=1;align=left;spacingLeft=4;verticalAlign=middle;endArrow=block;endFill=1;rounded=0;fontSize=11;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="931" y="405" as="sourcePoint"/>
            <mxPoint x="931" y="430" as="targetPoint"/>
            <Array as="points">
              <mxPoint x="961" y="405"/>
              <mxPoint x="961" y="430"/>
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- Branch 1: Error -->
        <mxCell id="msg_err_1" value="throw InvalidSignerException(&quot;Identity mismatch or contract not pending sign&quot;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="919" y="475" as="sourcePoint"/>
            <mxPoint x="676" y="475" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_err_2" value="403 Forbidden / 400 Bad Request" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="664" y="500" as="sourcePoint"/>
            <mxPoint x="401" y="500" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_err_3" value="displaySignErrorAlert(&quot;Ký hợp đồng thất bại&quot;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="389" y="525" as="sourcePoint"/>
            <mxPoint x="136" y="525" as="targetPoint"/>
          </mxGeometry>
        </mxCell>

        <!-- Branch 2: Success (Step 4) -->
        <mxCell id="msg_4a" value="4: saveSignature(signatureBase64)" style="html=1;align=left;spacingLeft=4;verticalAlign=middle;endArrow=block;endFill=1;rounded=0;fontSize=11;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="931" y="630" as="sourcePoint"/>
            <mxPoint x="931" y="655" as="targetPoint"/>
            <Array as="points">
              <mxPoint x="961" y="630"/>
              <mxPoint x="961" y="655"/>
            </Array>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_4b" value="db.contracts.updateOne({ _id: id }, { $set: { signatureUrl, signedAt: now, status: &apos;ACTIVE&apos; } })" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;endArrow=block;endFill=1;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="931" y="700" as="sourcePoint"/>
            <mxPoint x="1369" y="700" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_4c" value="writeResult (modifiedCount: 1)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="1369" y="740" as="sourcePoint"/>
            <mxPoint x="931" y="740" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_4d" value="signedContract (status: &apos;ACTIVE&apos;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="919" y="780" as="sourcePoint"/>
            <mxPoint x="676" y="780" as="targetPoint"/>
          </mxGeometry>
        </mxCell>

        <!-- Step 5 -->
        <mxCell id="msg_5a" value="5: 200 OK (signedContract)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="664" y="820" as="sourcePoint"/>
            <mxPoint x="401" y="820" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
        <mxCell id="msg_5b" value="displaySignedConfirmation(&quot;Ký hợp đồng thành công! Hợp đồng đã có hiệu lực (ACTIVE)&quot;)" style="html=1;verticalAlign=bottom;rounded=0;fontSize=11;dashed=1;endArrow=open;endSize=8;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="389" y="860" as="sourcePoint"/>
            <mxPoint x="136" y="860" as="targetPoint"/>
          </mxGeometry>
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}

const outDir = path.join(__dirname, '..', 'docs', 'diagrams');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Write all 3 files
fs.writeFileSync(path.join(outDir, 'ClassDiagram_Contract_Module.drawio'), generateClassDiagram(), 'utf8');
fs.writeFileSync(path.join(outDir, 'UC-M05_1_Create_Contract_SequenceDiagram.drawio'), generateCreateContractSequenceDiagram(), 'utf8');
fs.writeFileSync(path.join(outDir, 'UC-M05_2_Sign_Contract_SequenceDiagram.drawio'), generateSignContractSequenceDiagram(), 'utf8');

console.log('✅ Generated all 3 diagrams matching the report specifications exactly:');
console.log(' 1. docs/diagrams/ClassDiagram_Contract_Module.drawio');
console.log(' 2. docs/diagrams/UC-M05_1_Create_Contract_SequenceDiagram.drawio');
console.log(' 3. docs/diagrams/UC-M05_2_Sign_Contract_SequenceDiagram.drawio');
