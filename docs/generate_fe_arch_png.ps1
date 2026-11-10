Add-Type -AssemblyName System.Drawing

$imgDir = "E:\02_Projects_BaiTap\ReactJS_FER202\LuyenReactJS\MotalManagementSystems\docs\diagram_images"
if (!(Test-Path $imgDir)) { New-Item -ItemType Directory -Path $imgDir -Force | Out-Null }

# Helper to draw rounded rectangle
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

# -------------------------------------------------------------
# 1. FRONT-END ARCHITECTURE DIAGRAM (Figure 1.1.1)
# -------------------------------------------------------------
$w = 1000
$h = 1350
$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
$g.Clear([System.Drawing.Color]::White)

$fontTitle = New-Object System.Drawing.Font("Arial", 13, [System.Drawing.FontStyle]::Bold)
$fontSub = New-Object System.Drawing.Font("Arial", 10, [System.Drawing.FontStyle]::Regular)
$fontItalic = New-Object System.Drawing.Font("Arial", 9.5, [System.Drawing.FontStyle]::Italic)
$sfCenter = New-Object System.Drawing.StringFormat
$sfCenter.Alignment = [System.Drawing.StringAlignment]::Center
$sfCenter.LineAlignment = [System.Drawing.StringAlignment]::Center

$sfLeft = New-Object System.Drawing.StringFormat
$sfLeft.Alignment = [System.Drawing.StringAlignment]::Near
$sfLeft.LineAlignment = [System.Drawing.StringAlignment]::Center

$penBlack = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(60,60,60), 2)
$penArrow = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(40,40,40), 2.5)
$penArrow.CustomEndCap = New-Object System.Drawing.Drawing2D.AdjustableArrowCap(4, 5, $true)

$brushBlack = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30,30,30))

# 1. User Actor Box
$bWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
Draw-RoundedRect $g $penBlack $bWhite 380 40 240 90 6
$g.DrawString("👤 User`n(Web Browser / Mobile App)", $fontTitle, $brushBlack, (New-Object System.Drawing.RectangleF(380, 40, 240, 90)), $sfCenter)

# Arrow from User to Client apps
$g.DrawLine($penArrow, 500, 130, 500, 180)

# 2. React Web App + Mobile Expo App (side by side)
$bBlue = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(218, 232, 252))
$penBlue = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(108, 142, 191), 2)
Draw-RoundedRect $g $penBlue $bBlue 220 180 260 80 6
$g.DrawString("React Admin Web`n(Vite + React 18 + Tailwind)", $fontTitle, $brushBlack, (New-Object System.Drawing.RectangleF(220, 180, 260, 80)), $sfCenter)

$bGreenLight = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(213, 232, 212))
$penGreenLight = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(130, 179, 102), 2)
Draw-RoundedRect $g $penGreenLight $bGreenLight 520 180 260 80 6
$g.DrawString("React Native Mobile App`n(Expo + Android SDK)", $fontTitle, $brushBlack, (New-Object System.Drawing.RectangleF(520, 180, 260, 80)), $sfCenter)

# Arrows down to Frontend Boundary
$g.DrawLine($penArrow, 350, 260, 500, 310)
$g.DrawLine($penArrow, 650, 260, 500, 310)

# 3. Frontend Boundary Box
$penFeBox = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 120, 120), 2)
$penFeBox.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Solid
$g.DrawRectangle($penFeBox, 100, 310, 800, 550)
$g.DrawString("Frontend Presentation Layer (Client Tier)", $fontTitle, $brushBlack, 115, 320)

# 3.1 Router Layer
Draw-RoundedRect $g $penBlue $bBlue 340 360 320 70 6
$g.DrawString("Router Layer`n(React Router DOM & React Navigation)", $fontTitle, $brushBlack, (New-Object System.Drawing.RectangleF(340, 360, 320, 70)), $sfCenter)

# Connectors to Pages, Components, Contexts
$g.DrawLine($penArrow, 500, 430, 500, 480)
$g.DrawLine($penBlack, 240, 455, 760, 455)
$g.DrawLine($penArrow, 240, 455, 240, 480)
$g.DrawLine($penArrow, 760, 455, 760, 480)

# Pages
$bGreen = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(213, 232, 212))
Draw-RoundedRect $g $penGreenLight $bGreen 140 480 200 90 6
$g.DrawString("Pages / Screens`n• Rooms & Search`n• Contract Leases`n• Invoices & Payments", $fontSub, $brushBlack, (New-Object System.Drawing.RectangleF(140, 480, 200, 90)), $sfCenter)

# Components
Draw-RoundedRect $g $penGreenLight $bGreen 400 480 200 90 6
$g.DrawString("Components`n• Modals & Forms`n• Data Tables & Cards`n• Digital Sign Canvas", $fontSub, $brushBlack, (New-Object System.Drawing.RectangleF(400, 480, 200, 90)), $sfCenter)

# Contexts
Draw-RoundedRect $g $penGreenLight $bGreen 660 480 200 90 6
$g.DrawString("Contexts & Hooks`n• AuthContext (JWT)`n• ThemeContext`n• useDebounce / useFetch", $fontSub, $brushBlack, (New-Object System.Drawing.RectangleF(660, 480, 200, 90)), $sfCenter)

# Connectors down to Service Layer
$g.DrawLine($penBlack, 240, 570, 240, 615)
$g.DrawLine($penBlack, 760, 570, 760, 615)
$g.DrawLine($penBlack, 240, 615, 760, 615)
$g.DrawLine($penArrow, 500, 615, 500, 650)

# Service Layer Box (Inside Frontend)
$bYellow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 242, 204))
$penYellow = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(214, 182, 86), 2)
Draw-RoundedRect $g $penYellow $bYellow 320 650 360 140 6
$g.DrawString("Client Service & API Layer`n- Axios API Interceptors & Client`n- Auth Session Storage (JWT / Storage)`n- Formatters (Currency VND, Dates)`n- Client-side Form Validation", $fontSub, $brushBlack, (New-Object System.Drawing.RectangleF(320, 650, 360, 140)), $sfCenter)

# Arrow from Frontend to NodeJS Backend
$g.DrawLine($penArrow, 500, 860, 500, 930)
$g.DrawString("HTTPS / REST JSON APIs", $fontItalic, $brushBlack, 510, 885)

# 4. NodeJS Backend Box
$bRedLight = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(248, 206, 204))
$penRedLight = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(184, 84, 80), 2)
Draw-RoundedRect $g $penRedLight $bRedLight 350 930 300 130 6
$g.DrawString("NodeJS Backend (REST API)`n(Express.js Engine)`n- Routes & Middlewares`n- Controllers & Validators`n- Domain Services", $fontTitle, $brushBlack, (New-Object System.Drawing.RectangleF(350, 930, 300, 130)), $sfCenter)

# Connectors from Backend to External Services & Database
$g.DrawLine($penArrow, 350, 995, 230, 995)
$g.DrawLine($penArrow, 650, 995, 770, 995)

# External Services Box (Left)
$bOrangeLight = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 230, 204))
$penOrangeLight = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(215, 155, 0), 2)
Draw-RoundedRect $g $penOrangeLight $bOrangeLight 30 935 200 120 6
$g.DrawString("External Services`n- VNPay Payment Gateway`n- Cloudinary Storage`n- SMTP Mail / SMS", $fontSub, $brushBlack, (New-Object System.Drawing.RectangleF(30, 935, 200, 120)), $sfCenter)

# Database Box (Right)
$bPurple = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(225, 213, 231))
$penPurple = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(150, 115, 166), 2)
Draw-RoundedRect $g $penPurple $bPurple 770 935 200 120 6
$g.DrawString("Database Tier`nMongoDB Cluster`n(Mongoose ODM)`nCollections: users, rooms,`ncontracts, invoices...", $fontSub, $brushBlack, (New-Object System.Drawing.RectangleF(770, 935, 200, 120)), $sfCenter)

# Save
$out1 = Join-Path $imgDir "Figure_1_1_1_Frontend_Architecture.png"
$bmp.Save($out1, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$g.Dispose()
Write-Host "Created: $out1"
