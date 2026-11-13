Add-Type -AssemblyName System.Drawing

$imgDir = "E:\02_Projects_BaiTap\ReactJS_FER202\LuyenReactJS\MotalManagementSystems\docs\diagram_images"
if (!(Test-Path $imgDir)) { New-Item -ItemType Directory -Path $imgDir -Force | Out-Null }

function Draw-RoundedRect($g, $pen, $brush, $x, $y, $w, $h, $radius) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $diameter = $radius * 2
    $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
    $path.AddArc($x + $w - $diameter, $y, $diameter, $diameter, 270, 90)
    $path.AddArc($x + $w - $diameter, $y + $h - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc($x, $y + $h - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()
    if ($brush) { $g.FillPath($brush, $path) }
    if ($pen) { $g.DrawPath($pen, $path) }
    $path.Dispose()
}

# Function to draw UML Actor stick figure
function Draw-UMLActor($g, $pen, $brush, $x, $y, $name, $font, $textBrush) {
    # Head circle
    $g.DrawEllipse($pen, ($x + 20), $y, 30, 30)
    # Body line
    $g.DrawLine($pen, ($x + 35), ($y + 30), ($x + 35), ($y + 70))
    # Arms line
    $g.DrawLine($pen, ($x + 10), ($y + 45), ($x + 60), ($y + 45))
    # Left leg
    $g.DrawLine($pen, ($x + 35), ($y + 70), ($x + 15), ($y + 105))
    # Right leg
    $g.DrawLine($pen, ($x + 35), ($y + 70), ($x + 55), ($y + 105))
    
    # Label
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Near
    $g.DrawString($name, $font, $textBrush, (New-Object System.Drawing.RectangleF(($x - 30), ($y + 115), 130, 50)), $sf)
}

# Function to draw Use Case Oval
function Draw-UseCaseOval($g, $pen, $brush, $x, $y, $w, $h, $text, $font, $textBrush) {
    $g.FillEllipse($brush, $x, $y, $w, $h)
    $g.DrawEllipse($pen, $x, $y, $w, $h)
    
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString($text, $font, $textBrush, (New-Object System.Drawing.RectangleF($x, $y, $w, $h)), $sf)
}

$w = 1600
$h = 1200
$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
$g.Clear([System.Drawing.Color]::White)

$fontTitle = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)
$fontActor = New-Object System.Drawing.Font("Arial", 10.5, [System.Drawing.FontStyle]::Bold)
$fontSubHeader = New-Object System.Drawing.Font("Arial", 12, [System.Drawing.FontStyle]::Bold)
$fontUC = New-Object System.Drawing.Font("Arial", 9, [System.Drawing.FontStyle]::Regular)
$fontUCMini = New-Object System.Drawing.Font("Arial", 8.5, [System.Drawing.FontStyle]::Italic)

$sfCenter = New-Object System.Drawing.StringFormat
$sfCenter.Alignment = [System.Drawing.StringAlignment]::Center
$sfCenter.LineAlignment = [System.Drawing.StringAlignment]::Center

$brushBlack = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30,30,30))
$brushNavy = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(31, 73, 125))

# Top Title
$g.DrawString("SYSTEM USE CASE DIAGRAM`nMOTEL MANAGEMENT SYSTEM (MMS)", $fontTitle, $brushNavy, (New-Object System.Drawing.RectangleF(0, 15, 1600, 50)), $sfCenter)

# System Boundary Rectangle
$penSys = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(79, 129, 189), 2.5)
$brushSysBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(250, 252, 255))
Draw-RoundedRect $g $penSys $brushSysBg 230 75 1140 1090 12

# Boundary Header Banner
$brushBanner = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 230, 242))
$g.FillRectangle($brushBanner, 230, 75, 1140, 35)
$g.DrawLine($penSys, 230, 110, 1370, 110)
$g.DrawString("System Boundary: Motel Management System (MMS)", $fontSubHeader, $brushNavy, 250, 83)

# Common styling
$bOvalWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$penLine = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 120, 120), 1.5)
$penActor = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(40, 40, 40), 2)
$penDashed = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(90, 90, 90), 1.5)
$penDashed.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
$penDashed.CustomEndCap = New-Object System.Drawing.Drawing2D.AdjustableArrowCap(4, 5, $true)

# -----------------------------------------------------------------
# 1. MODULE 1: AUTH & TENANT PROFILE
# -----------------------------------------------------------------
$penSub1 = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(108, 142, 191), 1.5)
$bSub1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 243, 255))
Draw-RoundedRect $g $penSub1 $bSub1 260 130 500 220 8
$g.DrawString("Authentication & User Subsystem", $fontSubHeader, $brushNavy, 275, 140)

Draw-UseCaseOval $g $penSub1 $bOvalWhite 280 180 190 55 "UC01.1: Sign Up (Register)" $fontUC $brushBlack
Draw-UseCaseOval $g $penSub1 $bOvalWhite 540 180 190 55 "UC01.2: Sign In (Login)" $fontUC $brushBlack
Draw-UseCaseOval $g $penSub1 $bOvalWhite 280 265 190 55 "UC06: Update Profile (KYC)" $fontUC $brushBlack
Draw-UseCaseOval $g $penSub1 $bOvalWhite 540 265 200 55 "UC15: Manage Staff Accounts" $fontUC $brushBlack

# -----------------------------------------------------------------
# 2. MODULE 2: ROOM & SEARCH (QUANG)
# -----------------------------------------------------------------
$penSub2 = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(130, 179, 102), 1.5)
$bSub2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 247, 235))
Draw-RoundedRect $g $penSub2 $bSub2 800 130 540 220 8
$g.DrawString("Room & Search Subsystem (Quang)", $fontSubHeader, [System.Drawing.Brushes]::DarkGreen, 815, 140)

Draw-UseCaseOval $g $penSub2 $bOvalWhite 830 180 200 55 "UC02: Search & Filter Rooms" $fontUC $brushBlack
Draw-UseCaseOval $g $penSub2 $bOvalWhite 1100 180 210 55 "UC03: Request Rental / Hold" $fontUC $brushBlack
Draw-UseCaseOval $g $penSub2 $bOvalWhite 950 265 240 60 "UC04: Manage Rooms`n(Create, Update, Delete)" $fontUC $brushBlack

# -----------------------------------------------------------------
# 3. MODULE 3: RENTAL CONTRACT (DUC)
# -----------------------------------------------------------------
$penSub3 = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(214, 182, 86), 1.5)
$bSub3 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 252, 235))
Draw-RoundedRect $g $penSub3 $bSub3 260 380 500 340 8
$g.DrawString("Rental Contract Subsystem (Đức)", $fontSubHeader, [System.Drawing.Brushes]::DarkGoldenrod, 275, 390)

Draw-UseCaseOval $g $penSub3 $bOvalWhite 280 430 190 55 "UC05.1: Create Contract" $fontUC $brushBlack
Draw-UseCaseOval $g $penSub3 $bOvalWhite 540 430 200 55 "UC05.2: Sign Contract Online" $fontUC $brushBlack
Draw-UseCaseOval $g $penSub3 $bOvalWhite 280 520 190 55 "UC05.3: Extend Contract" $fontUC $brushBlack
Draw-UseCaseOval $g $penSub3 $bOvalWhite 540 520 200 60 "UC05.4: Terminate Contract`n& Refund Deposit" $fontUC $brushBlack
Draw-UseCaseOval $g $penSub3 $bOvalWhite 410 620 210 55 "UC05.5: View Contract Details" $fontUC $brushBlack

# -----------------------------------------------------------------
# 4. MODULE 4: UTILITY & BILLING (MANH)
# -----------------------------------------------------------------
$penSub4 = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(150, 115, 166), 1.5)
$bSub4 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(248, 242, 252))
Draw-RoundedRect $g $penSub4 $bSub4 800 380 540 340 8
$g.DrawString("Utility, Billing & Payment Subsystem (Mạnh)", $fontSubHeader, [System.Drawing.Brushes]::Indigo, 815, 390)

Draw-UseCaseOval $g $penSub4 $bOvalWhite 830 430 200 55 "UC07: Record Utility Readings" $fontUC $brushBlack
Draw-UseCaseOval $g $penSub4 $bOvalWhite 1100 430 210 55 "UC08: Generate Invoices" $fontUC $brushBlack
Draw-UseCaseOval $g $penSub4 $bOvalWhite 830 520 200 55 "UC09.1: Pay via VNPay" $fontUC $brushBlack
Draw-UseCaseOval $g $penSub4 $bOvalWhite 1100 520 210 55 "UC09.2: Process VNPay IPN" $fontUC $brushBlack
Draw-UseCaseOval $g $penSub4 $bOvalWhite 950 620 220 55 "UC10: Confirm Cash Payment" $fontUC $brushBlack

# -----------------------------------------------------------------
# 5. MODULE 5: REPORTS & CONFIG (MANAGER)
# -----------------------------------------------------------------
$penSub5 = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(215, 155, 0), 1.5)
$bSub5 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 245, 230))
Draw-RoundedRect $g $penSub5 $bSub5 480 750 640 180 8
$g.DrawString("Analytics, Reports & Configuration Subsystem (Manager)", $fontSubHeader, [System.Drawing.Brushes]::SaddleBrown, 495, 760)

Draw-UseCaseOval $g $penSub5 $bOvalWhite 510 810 260 55 "UC16: View Revenue & Debt Reports" $fontUC $brushBlack
Draw-UseCaseOval $g $penSub5 $bOvalWhite 820 810 260 55 "UC17: View Occupancy Statistics" $fontUC $brushBlack
Draw-UseCaseOval $g $penSub5 $bOvalWhite 670 875 260 50 "UC18: Configure Service Pricing" $fontUC $brushBlack

# -----------------------------------------------------------------
# ACTORS DRAWING
# -----------------------------------------------------------------
# 1. Tenant (Left Top)
Draw-UMLActor $g $penActor $brushBlack 90 200 "Tenant / Guest`n(Khách thuê)" $fontActor $brushBlack

# 2. VNPay Gateway (Left Bottom)
Draw-UMLActor $g $penActor $brushBlack 90 600 "<<External>>`nVNPay Gateway" $fontActor $brushBlack

# 3. Staff (Right Top)
Draw-UMLActor $g $penActor $brushBlack 1440 320 "Staff`n(Nhân viên)" $fontActor $brushBlack

# 4. Manager (Right Bottom)
Draw-UMLActor $g $penActor $brushBlack 1440 760 "Manager`n(Chủ trọ / Admin)" $fontActor $brushBlack

# Generalization arrow: Manager -> Staff (Hollow triangle)
$penGen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(215, 155, 0), 2.5)
$penGen.CustomEndCap = New-Object System.Drawing.Drawing2D.AdjustableArrowCap(6, 7, $false) # Hollow!
$g.DrawLine($penGen, 1475, 755, 1475, 475)
$g.DrawString("inherits", $fontUCMini, [System.Drawing.Brushes]::DarkGoldenrod, 1485, 600)

# -----------------------------------------------------------------
# ACTOR ASSOCIATIONS (Connecting lines)
# -----------------------------------------------------------------
# Tenant connections
$penTenantLine = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(130, 179, 102), 1.6)
$g.DrawLine($penTenantLine, 150, 240, 280, 205) # to Register
$g.DrawLine($penTenantLine, 150, 245, 540, 205) # to Login
$g.DrawLine($penTenantLine, 150, 255, 280, 290) # to Profile KYC
$g.DrawLine($penTenantLine, 150, 230, 830, 205) # to Search
$g.DrawLine($penTenantLine, 150, 235, 1100, 205) # to Request Rental
$g.DrawLine($penTenantLine, 150, 270, 540, 455) # to Sign Contract
$g.DrawLine($penTenantLine, 150, 280, 410, 645) # to View Contract
$g.DrawLine($penTenantLine, 150, 290, 830, 545) # to Pay VNPay

# Staff connections
$penStaffLine = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(214, 182, 86), 1.6)
$g.DrawLine($penStaffLine, 1440, 360, 730, 205) # to Login
$g.DrawLine($penStaffLine, 1440, 370, 1190, 295) # to Manage Room
$g.DrawLine($penStaffLine, 1440, 380, 470, 455) # to Create Contract
$g.DrawLine($penStaffLine, 1440, 390, 470, 545) # to Extend Contract
$g.DrawLine($penStaffLine, 1440, 400, 740, 545) # to Terminate Contract
$g.DrawLine($penStaffLine, 1440, 410, 1030, 455) # to Utility
$g.DrawLine($penStaffLine, 1440, 420, 1100, 455) # to Gen Invoice
$g.DrawLine($penStaffLine, 1440, 430, 1170, 645) # to Confirm Cash

# Manager exclusive connections
$penMgrLine = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(215, 155, 0), 1.8)
$g.DrawLine($penMgrLine, 1440, 790, 740, 290) # to Manage Staff
$g.DrawLine($penMgrLine, 1440, 810, 770, 835) # to Rev Reports
$g.DrawLine($penMgrLine, 1440, 825, 1080, 835) # to Occ Reports
$g.DrawLine($penMgrLine, 1440, 840, 930, 900) # to Config Price

# VNPay Gateway connections
$penVnpLine = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(150, 115, 166), 1.8)
$g.DrawLine($penVnpLine, 150, 640, 830, 545) # to Pay VNPay
$g.DrawLine($penVnpLine, 150, 650, 1100, 545) # to Process IPN

# -----------------------------------------------------------------
# USE CASE RELATIONSHIPS (include & extend)
# -----------------------------------------------------------------
# Pay VNPay <<include>> Process IPN
$g.DrawLine($penDashed, 1030, 545, 1100, 545)
$g.DrawString("<<include>>", $fontUCMini, [System.Drawing.Brushes]::Indigo, 1035, 525)

# Create Contract <<include>> Manage Room (mark room RENTED)
$g.DrawLine($penDashed, 470, 440, 950, 310)
$g.DrawString("<<include>>", $fontUCMini, [System.Drawing.Brushes]::DarkGoldenrod, 700, 370)

# Request Rental <<extend>> Update Profile KYC
$g.DrawLine($penDashed, 470, 290, 1100, 220)
$g.DrawString("<<extend>>", $fontUCMini, [System.Drawing.Brushes]::DarkGreen, 770, 245)

# Save image
$outFile = Join-Path $imgDir "Figure_0_System_UseCase_Diagram.png"
$bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$g.Dispose()

Write-Host "Generated System Use Case Diagram: $outFile"
