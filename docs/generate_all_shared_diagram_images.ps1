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

# Function to draw UML Package (Folder Tab + Body)
function Draw-UMLPackage($g, $pen, $brush, $x, $y, $w, $h, $tabW, $tabH, $title, $items, $fontTitle, $fontItems, $textBrush) {
    # Draw Tab
    $g.FillRectangle($brush, $x, $y, $tabW, $tabH)
    $g.DrawRectangle($pen, $x, $y, $tabW, $tabH)
    
    # Draw Body
    $g.FillRectangle($brush, $x, ($y + $tabH - 1), $w, ($h - $tabH + 1))
    $g.DrawRectangle($pen, $x, ($y + $tabH - 1), $w, ($h - $tabH + 1))
    
    # Package Title
    $sfTab = New-Object System.Drawing.StringFormat
    $sfTab.Alignment = [System.Drawing.StringAlignment]::Center
    $sfTab.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString($title, $fontTitle, $textBrush, (New-Object System.Drawing.RectangleF($x, $y, $tabW, $tabH)), $sfTab)
    
    # Inner Items
    if ($items -and $items.Count -gt 0) {
        $itemY = $y + $tabH + 10
        foreach ($it in $items) {
            # Draw mini file box
            $bFile = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
            $pFile = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 180, 180), 1)
            $g.FillRectangle($bFile, ($x + 10), $itemY, ($w - 20), 22)
            $g.DrawRectangle($pFile, ($x + 10), $itemY, ($w - 20), 22)
            
            $sfItem = New-Object System.Drawing.StringFormat
            $sfItem.Alignment = [System.Drawing.StringAlignment]::Center
            $sfItem.LineAlignment = [System.Drawing.StringAlignment]::Center
            $g.DrawString($it, $fontItems, $textBrush, (New-Object System.Drawing.RectangleF(($x + 10), $itemY, ($w - 20), 22)), $sfItem)
            $itemY += 28
            $bFile.Dispose()
            $pFile.Dispose()
        }
    }
}

# -------------------------------------------------------------
# 1. FRONT-END ARCHITECTURE (Figure 1.1.1)
# -------------------------------------------------------------
$w = 950
$h = 1300
$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
$g.Clear([System.Drawing.Color]::White)

$fontTitle = New-Object System.Drawing.Font("Arial", 12.5, [System.Drawing.FontStyle]::Bold)
$fontSub = New-Object System.Drawing.Font("Arial", 9.5, [System.Drawing.FontStyle]::Regular)
$fontItalic = New-Object System.Drawing.Font("Arial", 9.5, [System.Drawing.FontStyle]::Italic)

$sfCenter = New-Object System.Drawing.StringFormat
$sfCenter.Alignment = [System.Drawing.StringAlignment]::Center
$sfCenter.LineAlignment = [System.Drawing.StringAlignment]::Center

$penBlack = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(60,60,60), 2)
$penArrow = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(40,40,40), 2)
$penArrow.CustomEndCap = New-Object System.Drawing.Drawing2D.AdjustableArrowCap(4, 5, $true)
$brushBlack = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30,30,30))

# User Actor Box
$bWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
Draw-RoundedRect $g $penBlack $bWhite 360 40 230 80 6
$g.DrawString("User`n(Web Browser / Mobile App)", $fontTitle, $brushBlack, (New-Object System.Drawing.RectangleF(360, 40, 230, 80)), $sfCenter)

$g.DrawLine($penArrow, 475, 120, 475, 170)

# React Web + Mobile Expo side by side
$bBlue = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(218, 232, 252))
$penBlue = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(108, 142, 191), 2)
Draw-RoundedRect $g $penBlue $bBlue 200 170 250 80 6
$g.DrawString("React Admin Web`n(Vite + React 18 + Tailwind)", $fontTitle, $brushBlack, (New-Object System.Drawing.RectangleF(200, 170, 250, 80)), $sfCenter)

$bGreenLight = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(213, 232, 212))
$penGreenLight = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(130, 179, 102), 2)
Draw-RoundedRect $g $penGreenLight $bGreenLight 500 170 250 80 6
$g.DrawString("React Native Mobile App`n(Expo + Android SDK)", $fontTitle, $brushBlack, (New-Object System.Drawing.RectangleF(500, 170, 250, 80)), $sfCenter)

$g.DrawLine($penArrow, 325, 250, 475, 300)
$g.DrawLine($penArrow, 625, 250, 475, 300)

# Frontend Boundary Box
$penFeBox = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 120, 120), 2)
$g.DrawRectangle($penFeBox, 80, 300, 790, 540)
$g.DrawString("Frontend Presentation Layer (Client Tier)", $fontTitle, $brushBlack, 95, 310)

# Router Layer
Draw-RoundedRect $g $penBlue $bBlue 315 350 320 70 6
$g.DrawString("Router Layer`n(React Router DOM & React Navigation)", $fontTitle, $brushBlack, (New-Object System.Drawing.RectangleF(315, 350, 320, 70)), $sfCenter)

$g.DrawLine($penArrow, 475, 420, 475, 470)
$g.DrawLine($penBlack, 225, 445, 725, 445)
$g.DrawLine($penArrow, 225, 445, 225, 470)
$g.DrawLine($penArrow, 725, 445, 725, 470)

# Pages
Draw-RoundedRect $g $penGreenLight $bGreenLight 120 470 210 95 6
$g.DrawString("Pages / Screens`n- Rooms & Search`n- Contract Leases`n- Invoices & Payments", $fontSub, $brushBlack, (New-Object System.Drawing.RectangleF(120, 470, 210, 95)), $sfCenter)

# Components
Draw-RoundedRect $g $penGreenLight $bGreenLight 370 470 210 95 6
$g.DrawString("Components`n- Modals & Forms`n- Data Tables & Cards`n- Digital Sign Canvas", $fontSub, $brushBlack, (New-Object System.Drawing.RectangleF(370, 470, 210, 95)), $sfCenter)

# Contexts
Draw-RoundedRect $g $penGreenLight $bGreenLight 620 470 210 95 6
$g.DrawString("Contexts & Hooks`n- AuthContext (JWT)`n- ThemeContext`n- useDebounce / useFetch", $fontSub, $brushBlack, (New-Object System.Drawing.RectangleF(620, 470, 210, 95)), $sfCenter)

# Service Layer
$g.DrawLine($penBlack, 225, 565, 225, 605)
$g.DrawLine($penBlack, 725, 565, 725, 605)
$g.DrawLine($penBlack, 225, 605, 725, 605)
$g.DrawLine($penArrow, 475, 605, 475, 640)

$bYellow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 242, 204))
$penYellow = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(214, 182, 86), 2)
Draw-RoundedRect $g $penYellow $bYellow 300 640 350 140 6
$g.DrawString("Client Service Layer`n- Axios API Interceptors & Clients`n- Auth Session Storage (JWT Token)`n- Formatters (Currency VND, Dates)`n- Client-side Form Validation Rules", $fontSub, $brushBlack, (New-Object System.Drawing.RectangleF(300, 640, 350, 140)), $sfCenter)

# Down to Backend
$g.DrawLine($penArrow, 475, 840, 475, 910)
$g.DrawString("HTTPS / REST JSON APIs", $fontItalic, $brushBlack, 485, 865)

# Backend
$bRedLight = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(248, 206, 204))
$penRedLight = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(184, 84, 80), 2)
Draw-RoundedRect $g $penRedLight $bRedLight 330 910 290 120 6
$g.DrawString("NodeJS Backend (REST API)`n(Express.js Engine)`n- Routes & Middlewares`n- Controllers & Validators`n- Domain Services", $fontTitle, $brushBlack, (New-Object System.Drawing.RectangleF(330, 910, 290, 120)), $sfCenter)

# Left to VNPay, Right to Mongo
$g.DrawLine($penArrow, 330, 970, 220, 970)
$g.DrawLine($penArrow, 620, 970, 730, 970)

$bOrangeLight = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 230, 204))
$penOrangeLight = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(215, 155, 0), 2)
Draw-RoundedRect $g $penOrangeLight $bOrangeLight 30 910 190 120 6
$g.DrawString("External Services`n- VNPay Payment Portal`n- Cloudinary Storage`n- SMTP Mail / SMS", $fontSub, $brushBlack, (New-Object System.Drawing.RectangleF(30, 910, 190, 120)), $sfCenter)

$bPurple = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(225, 213, 231))
$penPurple = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(150, 115, 166), 2)
Draw-RoundedRect $g $penPurple $bPurple 730 910 190 120 6
$g.DrawString("Database Tier`nMongoDB Database`n(Mongoose ODM)`nCollections: users, rooms,`ncontracts, invoices...", $fontSub, $brushBlack, (New-Object System.Drawing.RectangleF(730, 910, 190, 120)), $sfCenter)

$out1 = Join-Path $imgDir "Figure_1_1_1_Frontend_Architecture.png"
$bmp.Save($out1, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$g.Dispose()
Write-Host "Generated: $out1"

# -------------------------------------------------------------
# 2. BACK-END ARCHITECTURE (Figure 1.1.2) - Matching sample layout
# -------------------------------------------------------------
$w = 850
$h = 1050
$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
$g.Clear([System.Drawing.Color]::White)

# Client at top
Draw-RoundedRect $g $penBlack $bWhite 200 30 200 65 6
$g.DrawString("Client`n(Web / Mobile)", $fontTitle, $brushBlack, (New-Object System.Drawing.RectangleF(200, 30, 200, 65)), $sfCenter)
$g.DrawLine($penArrow, 300, 95, 300, 140)

# API Layer (Green Dashed)
$penDashGreen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(130, 179, 102), 2)
$penDashGreen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
$bGreenBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 247, 235))
Draw-RoundedRect $g $penDashGreen $bGreenBg 50 140 500 80 8
$g.DrawString("API Layer", $fontItalic, $brushBlack, 60, 150)
Draw-RoundedRect $g $penBlack $bWhite 180 155 240 50 4
$g.DrawString("Routes", $fontTitle, $brushBlack, (New-Object System.Drawing.RectangleF(180, 155, 240, 50)), $sfCenter)
$g.DrawLine($penArrow, 300, 220, 300, 270)

# Request Processing Layer (Yellow Dashed)
$penDashYellow = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(214, 182, 86), 2)
$penDashYellow.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
$bYellowBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 252, 235))
Draw-RoundedRect $g $penDashYellow $bYellowBg 50 270 500 150 8
$g.DrawString("Request Processing Layer", $fontItalic, $brushBlack, 60, 280)
Draw-RoundedRect $g $penBlack $bWhite 180 295 240 45 4
$g.DrawString("Middlewares (Auth, RBAC)", $fontTitle, $brushBlack, (New-Object System.Drawing.RectangleF(180, 295, 240, 45)), $sfCenter)
$g.DrawLine($penArrow, 300, 340, 300, 360)
Draw-RoundedRect $g $penBlack $bWhite 180 360 240 45 4
$g.DrawString("Validators", $fontTitle, $brushBlack, (New-Object System.Drawing.RectangleF(180, 360, 240, 45)), $sfCenter)
$g.DrawLine($penArrow, 300, 420, 300, 470)

# Application Layer (Blue Dashed)
$penDashBlue = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(108, 142, 191), 2)
$penDashBlue.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
$bBlueBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 243, 255))
Draw-RoundedRect $g $penDashBlue $bBlueBg 50 470 500 80 8
$g.DrawString("Application Layer", $fontItalic, $brushBlack, 60, 480)
Draw-RoundedRect $g $penBlack $bWhite 180 485 240 50 4
$g.DrawString("Controllers", $fontTitle, $brushBlack, (New-Object System.Drawing.RectangleF(180, 485, 240, 50)), $sfCenter)
$g.DrawLine($penArrow, 300, 550, 300, 600)

# Business Logic Layer (Orange Dashed)
$penDashOrange = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(215, 155, 0), 2)
$penDashOrange.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
$bOrangeBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 248, 235))
Draw-RoundedRect $g $penDashOrange $bOrangeBg 50 600 500 85 8
$g.DrawString("Business Logic Layer", $fontItalic, $brushBlack, 60, 610)
Draw-RoundedRect $g $penBlack $bWhite 180 615 240 55 4
$g.DrawString("Services", $fontTitle, $brushBlack, (New-Object System.Drawing.RectangleF(180, 615, 240, 55)), $sfCenter)
$g.DrawLine($penArrow, 300, 685, 300, 735)

# Side Helper Box (Right) - Jobs, Utils, Constants, Configs
Draw-RoundedRect $g $penDashOrange $bOrangeBg 580 440 230 330 8
$g.DrawLine($penArrow, 420, 642, 580, 490)
$g.DrawLine($penArrow, 420, 642, 580, 570)
$g.DrawLine($penArrow, 420, 642, 580, 650)
$g.DrawLine($penArrow, 420, 642, 580, 730)

Draw-RoundedRect $g $penBlack $bWhite 600 465 190 45 4
$g.DrawString("Jobs (Cron Tasks)", $fontTitle, $brushBlack, (New-Object System.Drawing.RectangleF(600, 465, 190, 45)), $sfCenter)

Draw-RoundedRect $g $penBlack $bWhite 600 545 190 45 4
$g.DrawString("Utils (Helpers)", $fontTitle, $brushBlack, (New-Object System.Drawing.RectangleF(600, 545, 190, 45)), $sfCenter)

Draw-RoundedRect $g $penBlack $bWhite 600 625 190 45 4
$g.DrawString("Constants (Enums)", $fontTitle, $brushBlack, (New-Object System.Drawing.RectangleF(600, 625, 190, 45)), $sfCenter)

Draw-RoundedRect $g $penBlack $bWhite 600 705 190 45 4
$g.DrawString("Configs (DB, JWT, VNP)", $fontTitle, $brushBlack, (New-Object System.Drawing.RectangleF(600, 705, 190, 45)), $sfCenter)

# Data Access Layer (Red Dashed)
$penDashRed = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(184, 84, 80), 2)
$penDashRed.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
$bRedBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 240, 240))
Draw-RoundedRect $g $penDashRed $bRedBg 50 735 500 80 8
$g.DrawString("Data Access Layer", $fontItalic, $brushBlack, 60, 745)
Draw-RoundedRect $g $penBlack $bWhite 180 750 240 50 4
$g.DrawString("Models (Mongoose ODM)", $fontTitle, $brushBlack, (New-Object System.Drawing.RectangleF(180, 750, 240, 50)), $sfCenter)
$g.DrawLine($penArrow, 300, 815, 300, 865)

# MongoDB Database at bottom
Draw-RoundedRect $g $penBlack $bWhite 160 865 280 65 6
$g.DrawString("MongoDB Database Cluster", $fontTitle, $brushBlack, (New-Object System.Drawing.RectangleF(160, 865, 280, 65)), $sfCenter)

$out2 = Join-Path $imgDir "Figure_1_1_2_Backend_Architecture.png"
$bmp.Save($out2, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$g.Dispose()
Write-Host "Generated: $out2"

# -------------------------------------------------------------
# 3. BACK-END PACKAGE DIAGRAM (Figure 1.2.2) - Matching sample packages
# -------------------------------------------------------------
$w = 1100
$h = 850
$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
$g.Clear([System.Drawing.Color]::White)

$bPkg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 242, 204))
$pPkg = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(214, 182, 86), 2)
$pDashed = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(100, 100, 100), 1.8)
$pDashed.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
$pDashed.CustomEndCap = New-Object System.Drawing.Drawing2D.AdjustableArrowCap(4, 5, $true)

$fontPkgTitle = New-Object System.Drawing.Font("Arial", 11, [System.Drawing.FontStyle]::Bold)
$fontPkgItem = New-Object System.Drawing.Font("Arial", 8.5, [System.Drawing.FontStyle]::Regular)

# 1. /utils (top center)
Draw-UMLPackage $g $pPkg $bPkg 440 20 220 120 70 24 "utils" @("responseFormatter.js", "vnpayHash.js", "tokenUtil.js") $fontPkgTitle $fontPkgItem $brushBlack

# 2. /jobs (top left)
Draw-UMLPackage $g $pPkg $bPkg 60 160 190 120 60 24 "jobs" @("expireContractJob.js", "invoiceGenJob.js", "paymentRemindJob.js") $fontPkgTitle $fontPkgItem $brushBlack

# 3. /service (center)
Draw-UMLPackage $g $pPkg $bPkg 420 180 260 170 80 24 "service" @("auth.service.js", "room.service.js", "contract.service.js", "utility.service.js", "vnpay.service.js") $fontPkgTitle $fontPkgItem $brushBlack

# 4. /models (top right)
Draw-UMLPackage $g $pPkg $bPkg 780 160 250 180 80 24 "models" @("User.js", "Room.js", "RentalRequest.js", "Contract.js", "UtilityReading.js", "Invoice.js") $fontPkgTitle $fontPkgItem $brushBlack

# 5. /config (mid right)
Draw-UMLPackage $g $pPkg $bPkg 820 400 180 110 70 24 "config" @("db.js", "jwt.config.js", "vnpay.config.js") $fontPkgTitle $fontPkgItem $brushBlack

# 6. /controllers (mid center)
Draw-UMLPackage $g $pPkg $bPkg 420 420 260 170 90 24 "controllers" @("auth.controller.js", "room.controller.js", "contract.controller.js", "utility.controller.js", "payment.controller.js") $fontPkgTitle $fontPkgItem $brushBlack

# 7. /constants (mid left)
Draw-UMLPackage $g $pPkg $bPkg 60 380 190 120 80 24 "constants" @("roles.enum.js", "roomStatus.js", "contractStatus.js") $fontPkgTitle $fontPkgItem $brushBlack

# 8. /routes (bottom center)
Draw-UMLPackage $g $pPkg $bPkg 420 650 260 170 70 24 "routes" @("auth.routes.js", "room.routes.js", "contract.routes.js", "utility.routes.js", "payment.routes.js") $fontPkgTitle $fontPkgItem $brushBlack

# 9. /middlewares (bottom left)
Draw-UMLPackage $g $pPkg $bPkg 60 670 200 120 100 24 "middlewares" @("auth.middleware.js", "roleGuard.js", "errorHandler.js") $fontPkgTitle $fontPkgItem $brushBlack

# 10. /validators (bottom right)
Draw-UMLPackage $g $pPkg $bPkg 780 670 230 130 90 24 "validators" @("auth.validator.js", "room.validator.js", "contract.validator.js", "utility.validator.js") $fontPkgTitle $fontPkgItem $brushBlack

# Dashed connection arrows
# routes -> middlewares, validators, controllers
$g.DrawLine($pDashed, 420, 735, 260, 735)
$g.DrawLine($pDashed, 680, 735, 780, 735)
$g.DrawLine($pDashed, 550, 650, 550, 590)

# controllers -> constants, service
$g.DrawLine($pDashed, 420, 505, 250, 440)
$g.DrawLine($pDashed, 550, 420, 550, 350)

# service -> jobs, utils, models, config
$g.DrawLine($pDashed, 250, 220, 420, 265)
$g.DrawLine($pDashed, 550, 180, 550, 140)
$g.DrawLine($pDashed, 680, 265, 780, 250)
$g.DrawLine($pDashed, 680, 330, 820, 455)

$out3 = Join-Path $imgDir "Figure_1_2_2_Backend_Package_Diagram.png"
$bmp.Save($out3, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$g.Dispose()
Write-Host "Generated: $out3"

# -------------------------------------------------------------
# 4. FRONT-END PACKAGE DIAGRAM (Figure 1.2.1)
# -------------------------------------------------------------
$w = 1100
$h = 750
$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
$g.Clear([System.Drawing.Color]::White)

$bFePkg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(218, 232, 252))
$pFePkg = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(108, 142, 191), 2)

# Central Core: MMS System
Draw-RoundedRect $g $penBlack $bRedLight 470 320 160 80 6
$g.DrawString("MMS System`n(Front-end Root)", $fontTitle, $brushBlack, (New-Object System.Drawing.RectangleF(470, 320, 160, 80)), $sfCenter)

# Left: Admin Web Packages
$bGreenPkg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(213, 232, 212))
$pGreenPkg = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(130, 179, 102), 2)
Draw-UMLPackage $g $pGreenPkg $bGreenPkg 50 60 320 280 120 26 "Admin Web UI" @("pages/Dashboard.jsx", "pages/RoomManagement.jsx", "pages/ContractManagement.jsx", "pages/UtilityInvoices.jsx", "pages/UserManagement.jsx", "components/RoomModal.jsx", "components/InvoiceTable.jsx") $fontPkgTitle $fontPkgItem $brushBlack

# Right: Tenant Mobile Packages
Draw-UMLPackage $g $pFePkg $bFePkg 730 60 320 280 130 26 "Tenant Mobile App" @("screens/HomeScreen.jsx", "screens/RoomSearchScreen.jsx", "screens/RoomDetailScreen.jsx", "screens/SignContractScreen.jsx", "screens/MyInvoicesScreen.jsx", "screens/ProfileKYCScreen.jsx", "components/SignCanvas.jsx") $fontPkgTitle $fontPkgItem $brushBlack

# Bottom: Shared Services, Context & Utils
Draw-UMLPackage $g $pPkg $bYellow 380 480 340 220 120 26 "Shared Services" @("services/apiClient.js (Axios)", "services/authService.js", "services/vnpayService.js", "context/AuthContext.jsx", "utils/currencyVN.js", "utils/validators.js") $fontPkgTitle $fontPkgItem $brushBlack

# Connectors
$g.DrawLine($pDashed, 470, 360, 370, 200)
$g.DrawLine($pDashed, 630, 360, 730, 200)
$g.DrawLine($pDashed, 550, 400, 550, 480)

$out4 = Join-Path $imgDir "Figure_1_2_1_Frontend_Package_Diagram.png"
$bmp.Save($out4, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$g.Dispose()
Write-Host "Generated: $out4"

# -------------------------------------------------------------
# 5. DOMAIN CLASS DIAGRAM (Figure 3.1) - High resolution overview
# -------------------------------------------------------------
$w = 1200
$h = 800
$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
$g.Clear([System.Drawing.Color]::White)

function Draw-ClassBox($g, $x, $y, $w, $h, $name, $attrs, $methods) {
    $bHead = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(218, 232, 252))
    $pBox = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(108, 142, 191), 2)
    $bBody = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    
    $g.FillRectangle($bBody, $x, $y, $w, $h)
    $g.FillRectangle($bHead, $x, $y, $w, 30)
    $g.DrawRectangle($pBox, $x, $y, $w, $h)
    $g.DrawLine($pBox, $x, ($y + 30), ($x + $w), ($y + 30))
    
    $fName = New-Object System.Drawing.Font("Arial", 11, [System.Drawing.FontStyle]::Bold)
    $fField = New-Object System.Drawing.Font("Arial", 8.5, [System.Drawing.FontStyle]::Regular)
    $bTxt = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Black)
    
    $sfH = New-Object System.Drawing.StringFormat
    $sfH.Alignment = [System.Drawing.StringAlignment]::Center
    $sfH.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString($name, $fName, $bTxt, (New-Object System.Drawing.RectangleF($x, $y, $w, 30)), $sfH)
    
    $curY = $y + 36
    foreach ($a in $attrs) {
        $g.DrawString($a, $fField, $bTxt, ($x + 8), $curY)
        $curY += 18
    }
    
    if ($methods -and $methods.Count -gt 0) {
        $g.DrawLine($pBox, $x, $curY, ($x + $w), $curY)
        $curY += 6
        foreach ($m in $methods) {
            $g.DrawString($m, $fField, $bTxt, ($x + 8), $curY)
            $curY += 18
        }
    }
    $bHead.Dispose(); $pBox.Dispose(); $bBody.Dispose(); $fName.Dispose(); $fField.Dispose(); $bTxt.Dispose()
}

# 1. User
Draw-ClassBox $g 50 50 250 230 "User" @("+ _id: ObjectId", "+ fullName: String", "+ phone: String", "+ email: String", "+ passwordHash: String", "+ role: UserRole", "+ cccd: String", "+ isKycDone: Boolean") @("+ comparePassword()", "+ generateJwtToken()")

# 2. Room
Draw-ClassBox $g 470 50 260 230 "Room" @("+ _id: ObjectId", "+ roomNumber: String", "+ roomType: String", "+ price: Number", "+ area: Number", "+ amenities: String[]", "+ status: RoomStatus", "+ images: String[]") @("+ isAvailable(): Boolean", "+ changeStatus(status)")

# 3. RentalRequest
Draw-ClassBox $g 890 50 260 210 "RentalRequest" @("+ _id: ObjectId", "+ roomId: ObjectId", "+ tenantName: String", "+ tenantPhone: String", "+ moveInDate: Date", "+ status: RequestStatus", "+ note: String") @("+ approveRequest()", "+ rejectRequest()")

# 4. RentalContract
Draw-ClassBox $g 50 450 270 260 "RentalContract" @("+ _id: ObjectId", "+ contractCode: String", "+ roomId: ObjectId", "+ tenantId: ObjectId", "+ depositAmount: Number", "+ rentalPrice: Number", "+ startDate: Date", "+ endDate: Date", "+ status: ContractStatus", "+ signatureUrl: String") @("+ signOnline(sigData)", "+ extendLease(months)", "+ terminateContract()")

# 5. UtilityReading
Draw-ClassBox $g 470 450 260 250 "UtilityReading" @("+ _id: ObjectId", "+ roomId: ObjectId", "+ month: String", "+ oldElec: Number", "+ newElec: Number", "+ electricUsage: Number", "+ oldWater: Number", "+ newWater: Number", "+ waterUsage: Number") @("+ calculateUsage()")

# 6. Invoice
Draw-ClassBox $g 890 350 260 250 "Invoice" @("+ _id: ObjectId", "+ invoiceCode: String", "+ roomId: ObjectId", "+ contractId: ObjectId", "+ month: String", "+ roomAmount: Number", "+ electricAmount: Number", "+ waterAmount: Number", "+ totalAmount: Number", "+ status: InvoiceStatus") @("+ computeTotal()", "+ markAsPaid(method)")

# 7. PaymentTransaction
Draw-ClassBox $g 890 640 260 140 "PaymentTransaction" @("+ _id: ObjectId", "+ invoiceId: ObjectId", "+ vnpTxnRef: String", "+ amount: Number", "+ paymentMethod: String", "+ status: String") @("+ verifyChecksum()")

# Connectors with multiplicities
$pRel = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(40, 40, 40), 2)
$fCard = New-Object System.Drawing.Font("Arial", 9.5, [System.Drawing.FontStyle]::Bold)

# User - Room
$g.DrawLine($pRel, 300, 160, 470, 160)
$g.DrawString("1", $fCard, $brushBlack, 310, 140)
$g.DrawString("1..*", $fCard, $brushBlack, 435, 140)
$g.DrawString("manages", $fontItalic, $brushBlack, 350, 140)

# Room - RentalRequest
$g.DrawLine($pRel, 730, 160, 890, 160)
$g.DrawString("1", $fCard, $brushBlack, 740, 140)
$g.DrawString("0..*", $fCard, $brushBlack, 855, 140)
$g.DrawString("receives", $fontItalic, $brushBlack, 780, 140)

# Room - Contract
$g.DrawLine($pRel, 520, 280, 250, 450)
$g.DrawString("1", $fCard, $brushBlack, 500, 290)
$g.DrawString("0..*", $fCard, $brushBlack, 270, 430)

# Room - UtilityReading
$g.DrawLine($pRel, 600, 280, 600, 450)
$g.DrawString("1", $fCard, $brushBlack, 610, 290)
$g.DrawString("1..*", $fCard, $brushBlack, 610, 425)

# Contract - Invoice
$g.DrawLine($pRel, 320, 540, 890, 500)
$g.DrawString("1", $fCard, $brushBlack, 340, 520)
$g.DrawString("1..*", $fCard, $brushBlack, 850, 485)

# Invoice - PaymentTransaction
$g.DrawLine($pRel, 1020, 600, 1020, 640)
$g.DrawString("1", $fCard, $brushBlack, 1030, 605)
$g.DrawString("0..*", $fCard, $brushBlack, 1030, 620)

$out5 = Join-Path $imgDir "Figure_3_1_System_Domain_Class_Diagram.png"
$bmp.Save($out5, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$g.Dispose()
Write-Host "Generated: $out5"
