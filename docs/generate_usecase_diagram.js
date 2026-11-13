const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, 'diagrams'),
  'C:\\Users\\nguye\\Downloads'
];

targetDirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function createUseCaseDiagramXml() {
  return `<mxfile host="app.diagrams.net">
  <diagram name="System Use Case Diagram" id="system_usecase_diag">
    <mxGraphModel dx="1600" dy="1100" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1650" pageHeight="1200" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>

        <!-- System Boundary -->
        <mxCell id="sys_boundary" value="Motel Management System (MMS)" style="shape=umlFrame;whiteSpace=wrap;html=1;width=240;height=30;fontStyle=1;fontSize=14;fillColor=#f8f9fa;strokeColor=#4F81BD;strokeWidth=2;" vertex="1" parent="1">
          <mxGeometry x="250" y="40" width="1120" height="1100" as="geometry"/>
        </mxCell>

        <!-- ACTORS -->
        <!-- 1. Tenant (Left Top) -->
        <mxCell id="act_tenant" value="Tenant / Guest&#xa;(Khách thuê)" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fontStyle=1;fontSize=12;fillColor=#d5e8d4;strokeColor=#82b366;strokeWidth=2;" vertex="1" parent="1">
          <mxGeometry x="80" y="240" width="70" height="120" as="geometry"/>
        </mxCell>

        <!-- 2. Staff (Right Top) -->
        <mxCell id="act_staff" value="Staff&#xa;(Nhân viên)" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fontStyle=1;fontSize=12;fillColor=#fff2cc;strokeColor=#d6b656;strokeWidth=2;" vertex="1" parent="1">
          <mxGeometry x="1470" y="320" width="70" height="120" as="geometry"/>
        </mxCell>

        <!-- 3. Manager (Right Bottom) -->
        <mxCell id="act_manager" value="Manager&#xa;(Chủ trọ / Admin)" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fontStyle=1;fontSize=12;fillColor=#ffe6cc;strokeColor=#d79b00;strokeWidth=2;" vertex="1" parent="1">
          <mxGeometry x="1470" y="780" width="70" height="120" as="geometry"/>
        </mxCell>

        <!-- Generalization: Manager inherits Staff -->
        <mxCell id="rel_inherit" value="" style="endArrow=block;endSize=16;endFill=0;html=1;rounded=0;strokeWidth=2;strokeColor=#d79b00;" edge="1" parent="1" source="act_manager" target="act_staff">
          <mxGeometry width="160" relative="1" as="geometry"/>
        </mxCell>

        <!-- 4. VNPay Gateway (Left Bottom) -->
        <mxCell id="act_vnpay" value="&lt;&lt;External System&gt;&gt;&#xa;VNPay Gateway" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fontStyle=1;fontSize=12;fillColor=#e1d5e7;strokeColor=#9673a6;strokeWidth=2;" vertex="1" parent="1">
          <mxGeometry x="80" y="760" width="70" height="120" as="geometry"/>
        </mxCell>

        <!-- USE CASES -->

        <!-- Module 1: Auth & Account -->
        <mxCell id="sub_auth" value="Authentication &amp; User Management" style="swimlane;fontStyle=1;fontSize=12;startSize=24;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
          <mxGeometry x="280" y="80" width="500" height="230" as="geometry"/>
        </mxCell>
        <mxCell id="uc_register" value="UC01.1: Sign Up (Register)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#6c8ebf;fontStyle=1;" vertex="1" parent="sub_auth">
          <mxGeometry x="30" y="40" width="190" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="uc_login" value="UC01.2: Sign In (Login)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#6c8ebf;fontStyle=1;" vertex="1" parent="sub_auth">
          <mxGeometry x="270" y="40" width="190" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="uc_profile" value="UC06: Update Profile (KYC)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#6c8ebf;fontStyle=1;" vertex="1" parent="sub_auth">
          <mxGeometry x="30" y="140" width="190" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="uc_staff_mgmt" value="UC15: Manage Staff Accounts" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#6c8ebf;fontStyle=1;" vertex="1" parent="sub_auth">
          <mxGeometry x="270" y="140" width="200" height="60" as="geometry"/>
        </mxCell>

        <!-- Module 2: Room & Rental (Quang) -->
        <mxCell id="sub_room" value="Room Inventory &amp; Rental Requests (Quang)" style="swimlane;fontStyle=1;fontSize=12;startSize=24;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1">
          <mxGeometry x="830" y="80" width="510" height="230" as="geometry"/>
        </mxCell>
        <mxCell id="uc_search" value="UC02: Search &amp; Filter Rooms" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#82b366;fontStyle=1;" vertex="1" parent="sub_room">
          <mxGeometry x="30" y="40" width="190" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="uc_req_rental" value="UC03: Request Rental / Hold" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#82b366;fontStyle=1;" vertex="1" parent="sub_room">
          <mxGeometry x="280" y="40" width="200" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="uc_manage_room" value="UC04: Manage Rooms&#xa;(Create, Update, Delete)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#82b366;fontStyle=1;" vertex="1" parent="sub_room">
          <mxGeometry x="150" y="140" width="220" height="65" as="geometry"/>
        </mxCell>

        <!-- Module 3: Contract (Duc) -->
        <mxCell id="sub_contract" value="Rental Contract Management (Đức)" style="swimlane;fontStyle=1;fontSize=12;startSize=24;fillColor=#fff2cc;strokeColor=#d6b656;" vertex="1" parent="1">
          <mxGeometry x="280" y="340" width="500" height="340" as="geometry"/>
        </mxCell>
        <mxCell id="uc_create_contract" value="UC05.1: Create Contract" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#d6b656;fontStyle=1;" vertex="1" parent="sub_contract">
          <mxGeometry x="30" y="40" width="190" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="uc_sign_contract" value="UC05.2: Sign Contract Online" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#d6b656;fontStyle=1;" vertex="1" parent="sub_contract">
          <mxGeometry x="270" y="40" width="200" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="uc_extend_contract" value="UC05.3: Extend Contract" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#d6b656;fontStyle=1;" vertex="1" parent="sub_contract">
          <mxGeometry x="30" y="150" width="190" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="uc_term_contract" value="UC05.4: Terminate Contract&#xa;&amp; Refund Deposit" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#d6b656;fontStyle=1;" vertex="1" parent="sub_contract">
          <mxGeometry x="270" y="150" width="200" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="uc_view_contract" value="UC05.5: View Contract Details" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#d6b656;fontStyle=1;" vertex="1" parent="sub_contract">
          <mxGeometry x="150" y="250" width="210" height="60" as="geometry"/>
        </mxCell>

        <!-- Module 4: Utility, Billing & Payment (Manh) -->
        <mxCell id="sub_billing" value="Utility, Billing &amp; Payment (Mạnh)" style="swimlane;fontStyle=1;fontSize=12;startSize=24;fillColor=#e1d5e7;strokeColor=#9673a6;" vertex="1" parent="1">
          <mxGeometry x="830" y="340" width="510" height="340" as="geometry"/>
        </mxCell>
        <mxCell id="uc_utility" value="UC07: Record Utility Readings" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#9673a6;fontStyle=1;" vertex="1" parent="sub_billing">
          <mxGeometry x="30" y="40" width="200" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="uc_gen_invoice" value="UC08: Generate Monthly Invoices" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#9673a6;fontStyle=1;" vertex="1" parent="sub_billing">
          <mxGeometry x="270" y="40" width="210" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="uc_pay_vnpay" value="UC09.1: Pay Invoice via VNPay" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#9673a6;fontStyle=1;" vertex="1" parent="sub_billing">
          <mxGeometry x="30" y="150" width="200" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="uc_vnpay_ipn" value="UC09.2: Process VNPay IPN" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#9673a6;fontStyle=1;" vertex="1" parent="sub_billing">
          <mxGeometry x="270" y="150" width="210" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="uc_confirm_cash" value="UC10: Confirm Cash Payment" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#9673a6;fontStyle=1;" vertex="1" parent="sub_billing">
          <mxGeometry x="150" y="250" width="210" height="60" as="geometry"/>
        </mxCell>

        <!-- Module 5: Reports & Operations (Manager only) -->
        <mxCell id="sub_report" value="System Analytics &amp; Reports (Manager)" style="swimlane;fontStyle=1;fontSize=12;startSize=24;fillColor=#ffe6cc;strokeColor=#d79b00;" vertex="1" parent="1">
          <mxGeometry x="500" y="720" width="610" height="180" as="geometry"/>
        </mxCell>
        <mxCell id="uc_rep_rev" value="UC16: View Revenue &amp; Debt Reports" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#d79b00;fontStyle=1;" vertex="1" parent="sub_report">
          <mxGeometry x="40" y="50" width="240" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="uc_rep_occ" value="UC17: View Occupancy Statistics" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#d79b00;fontStyle=1;" vertex="1" parent="sub_report">
          <mxGeometry x="330" y="50" width="240" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="uc_config_price" value="UC18: Configure Service Pricing" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#d79b00;fontStyle=1;" vertex="1" parent="sub_report">
          <mxGeometry x="190" y="115" width="240" height="55" as="geometry"/>
        </mxCell>

        <!-- ASSOCIATIONS -->

        <!-- Tenant Associations -->
        <mxCell id="link_t1" style="endArrow=none;html=1;strokeColor=#82b366;strokeWidth=1.5;" edge="1" parent="1" source="act_tenant" target="uc_register"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="link_t2" style="endArrow=none;html=1;strokeColor=#82b366;strokeWidth=1.5;" edge="1" parent="1" source="act_tenant" target="uc_login"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="link_t3" style="endArrow=none;html=1;strokeColor=#82b366;strokeWidth=1.5;" edge="1" parent="1" source="act_tenant" target="uc_profile"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="link_t4" style="endArrow=none;html=1;strokeColor=#82b366;strokeWidth=1.5;" edge="1" parent="1" source="act_tenant" target="uc_search"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="link_t5" style="endArrow=none;html=1;strokeColor=#82b366;strokeWidth=1.5;" edge="1" parent="1" source="act_tenant" target="uc_req_rental"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="link_t6" style="endArrow=none;html=1;strokeColor=#82b366;strokeWidth=1.5;" edge="1" parent="1" source="act_tenant" target="uc_sign_contract"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="link_t7" style="endArrow=none;html=1;strokeColor=#82b366;strokeWidth=1.5;" edge="1" parent="1" source="act_tenant" target="uc_pay_vnpay"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="link_t8" style="endArrow=none;html=1;strokeColor=#82b366;strokeWidth=1.5;" edge="1" parent="1" source="act_tenant" target="uc_view_contract"><mxGeometry relative="1" as="geometry"/></mxCell>

        <!-- Staff Associations -->
        <mxCell id="link_s1" style="endArrow=none;html=1;strokeColor=#d6b656;strokeWidth=1.5;" edge="1" parent="1" source="act_staff" target="uc_login"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="link_s2" style="endArrow=none;html=1;strokeColor=#d6b656;strokeWidth=1.5;" edge="1" parent="1" source="act_staff" target="uc_manage_room"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="link_s3" style="endArrow=none;html=1;strokeColor=#d6b656;strokeWidth=1.5;" edge="1" parent="1" source="act_staff" target="uc_create_contract"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="link_s4" style="endArrow=none;html=1;strokeColor=#d6b656;strokeWidth=1.5;" edge="1" parent="1" source="act_staff" target="uc_extend_contract"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="link_s5" style="endArrow=none;html=1;strokeColor=#d6b656;strokeWidth=1.5;" edge="1" parent="1" source="act_staff" target="uc_term_contract"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="link_s6" style="endArrow=none;html=1;strokeColor=#d6b656;strokeWidth=1.5;" edge="1" parent="1" source="act_staff" target="uc_utility"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="link_s7" style="endArrow=none;html=1;strokeColor=#d6b656;strokeWidth=1.5;" edge="1" parent="1" source="act_staff" target="uc_gen_invoice"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="link_s8" style="endArrow=none;html=1;strokeColor=#d6b656;strokeWidth=1.5;" edge="1" parent="1" source="act_staff" target="uc_confirm_cash"><mxGeometry relative="1" as="geometry"/></mxCell>

        <!-- Manager Exclusive Associations -->
        <mxCell id="link_m1" style="endArrow=none;html=1;strokeColor=#d79b00;strokeWidth=1.5;" edge="1" parent="1" source="act_manager" target="uc_staff_mgmt"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="link_m2" style="endArrow=none;html=1;strokeColor=#d79b00;strokeWidth=1.5;" edge="1" parent="1" source="act_manager" target="uc_rep_rev"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="link_m3" style="endArrow=none;html=1;strokeColor=#d79b00;strokeWidth=1.5;" edge="1" parent="1" source="act_manager" target="uc_rep_occ"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="link_m4" style="endArrow=none;html=1;strokeColor=#d79b00;strokeWidth=1.5;" edge="1" parent="1" source="act_manager" target="uc_config_price"><mxGeometry relative="1" as="geometry"/></mxCell>

        <!-- VNPay Gateway Associations -->
        <mxCell id="link_v1" style="endArrow=none;html=1;strokeColor=#9673a6;strokeWidth=1.5;" edge="1" parent="1" source="act_vnpay" target="uc_pay_vnpay"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="link_v2" style="endArrow=none;html=1;strokeColor=#9673a6;strokeWidth=1.5;" edge="1" parent="1" source="act_vnpay" target="uc_vnpay_ipn"><mxGeometry relative="1" as="geometry"/></mxCell>

        <!-- Use Case Relationships (include & extend) -->
        <!-- Pay VNPay <<include>> Process IPN -->
        <mxCell id="rel_inc_pay" value="&amp;lt;&amp;lt;include&amp;gt;&amp;gt;" style="html=1;verticalAlign=bottom;labelBackgroundColor=none;endArrow=open;endSize=10;dashed=1;rounded=0;strokeWidth=1.5;strokeColor=#9673a6;" edge="1" parent="sub_billing" source="uc_pay_vnpay" target="uc_vnpay_ipn">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>

        <!-- Create Contract <<include>> Manage Room (Update Status to RENTED) -->
        <mxCell id="rel_inc_contract" value="&amp;lt;&amp;lt;include&amp;gt;&amp;gt;" style="html=1;verticalAlign=bottom;labelBackgroundColor=none;endArrow=open;endSize=10;dashed=1;rounded=0;strokeWidth=1.5;strokeColor=#d6b656;" edge="1" parent="1" source="uc_create_contract" target="uc_manage_room">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>

        <!-- Request Rental <<extend>> Update Profile KYC -->
        <mxCell id="rel_ext_rental" value="&amp;lt;&amp;lt;extend&amp;gt;&amp;gt;" style="html=1;verticalAlign=bottom;labelBackgroundColor=none;endArrow=open;endSize=10;dashed=1;rounded=0;strokeWidth=1.5;strokeColor=#82b366;" edge="1" parent="1" source="uc_profile" target="uc_req_rental">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}

const xml = createUseCaseDiagramXml();
targetDirs.forEach(dir => {
  const dest = path.join(dir, 'UseCase_Diagram_System.drawio');
  fs.writeFileSync(dest, xml, 'utf8');
  console.log(`Generated Use Case Diagram: ${dest}`);
});
