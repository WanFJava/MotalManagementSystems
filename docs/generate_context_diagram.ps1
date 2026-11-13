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

$w = 1200
$h = 950
$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
$g.Clear([System.Drawing.Color]::White)

$fontSystem = New-Object System.Drawing.Font("Arial", 13.5, [System.Drawing.FontStyle]::Bold)
$fontActor = New-Object System.Drawing.Font("Arial", 11, [System.Drawing.FontStyle]::Bold)
$fontFlow = New-Object System.Drawing.Font("Arial", 8.8, [System.Drawing.FontStyle]::Regular)
$fontTitle = New-Object System.Drawing.Font("Arial", 15, [System.Drawing.FontStyle]::Bold)

$sfCenter = New-Object System.Drawing.StringFormat
$sfCenter.Alignment = [System.Drawing.StringAlignment]::Center
$sfCenter.LineAlignment = [System.Drawing.StringAlignment]::Center

$brushBlack = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30,30,30))
$brushNavy = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(31, 73, 125))

# Header Title
$g.DrawString("SYSTEM CONTEXT DIAGRAM (DFD LEVEL 0)`nMOTEL MANAGEMENT SYSTEM (MMS)", $fontTitle, $brushNavy, (New-Object System.Drawing.RectangleF(0, 20, 1200, 50)), $sfCenter)

# Central System Box (MMS)
$bCenter = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(218, 232, 252))
$pCenter = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(46, 117, 181), 3)
Draw-RoundedRect $g $pCenter $bCenter 430 360 340 220 20
$g.DrawString("0`n`nMOTEL MANAGEMENT SYSTEM`n(MMS APPLICATION ENGINE)`n`nCore Subsystems:`nUser Auth, Room Inventory, Rental Leases,`nMonthly Billing, VNPay Gateway", $fontSystem, $brushNavy, (New-Object System.Drawing.RectangleF(430, 360, 340, 220)), $sfCenter)

# Pens for arrows
$pArrowIn = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(40, 40, 40), 1.8)
$pArrowIn.CustomEndCap = New-Object System.Drawing.Drawing2D.AdjustableArrowCap(4, 5, $true)

$pArrowOut = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(31, 73, 125), 1.8)
$pArrowOut.CustomEndCap = New-Object System.Drawing.Drawing2D.AdjustableArrowCap(4, 5, $true)

# 1. ENTITY: TENANT / GUEST (Top-Left)
$bTenant = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(213, 232, 212))
$pTenant = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(130, 179, 102), 2.5)
Draw-RoundedRect $g $pTenant $bTenant 40 100 240 100 8
$g.DrawString("TENANT / GUEST`n(Prospective Renter & Resident)`n[Mobile App & Web Client]", $fontActor, $brushBlack, (New-Object System.Drawing.RectangleF(40, 100, 240, 100)), $sfCenter)

# Tenant flows
# Tenant -> MMS
$g.DrawLine($pArrowIn, 280, 130, 430, 390)
$g.DrawString("- Search criteria, Rental request`n- KYC citizen ID, Digital signature`n- VNPay payment authorization", $fontFlow, $brushBlack, 160, 225)

# MMS -> Tenant
$g.DrawLine($pArrowOut, 430, 420, 280, 160)
$g.DrawString("- Available room list & details`n- Approved lease contract, Invoices`n- Payment receipts, Booking status", $fontFlow, $brushNavy, 320, 275)

# 2. ENTITY: LANDLORD (Top-Right)
$bLandlord = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 230, 204))
$pLandlord = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(215, 155, 0), 2.5)
Draw-RoundedRect $g $pLandlord $bLandlord 920 100 240 100 8
$g.DrawString("LANDLORD`n(Property Owner / Admin)`n[Admin Web Dashboard]", $fontActor, $brushBlack, (New-Object System.Drawing.RectangleF(920, 100, 240, 100)), $sfCenter)

# Landlord flows
# Landlord -> MMS
$g.DrawLine($pArrowIn, 920, 130, 770, 390)
$g.DrawString("- Room creation, pricing, amenities`n- Lease creation, extension, termination`n- Staff account management", $fontFlow, $brushBlack, 735, 225)

# MMS -> Landlord
$g.DrawLine($pArrowOut, 770, 420, 920, 160)
$g.DrawString("- Rental requests from tenants`n- Monthly utility & billing summaries`n- Real-time revenue & debt statistics", $fontFlow, $brushNavy, 860, 275)

# 3. ENTITY: OPERATIONS STAFF (Bottom-Left)
$bStaff = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 242, 204))
$pStaff = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(214, 182, 86), 2.5)
Draw-RoundedRect $g $pStaff $bStaff 40 740 240 100 8
$g.DrawString("OPERATIONS STAFF`n(Building Operations Staff)`n[Admin Web & Mobile]", $fontActor, $brushBlack, (New-Object System.Drawing.RectangleF(40, 740, 240, 100)), $sfCenter)

# Staff flows
# Staff -> MMS
$g.DrawLine($pArrowIn, 280, 770, 440, 560)
$g.DrawString("- Monthly electric/water readings`n- Cash collection confirmations`n- Room maintenance updates", $fontFlow, $brushBlack, 160, 630)

# MMS -> Staff
$g.DrawLine($pArrowOut, 440, 530, 280, 740)
$g.DrawString("- Assigned rooms & tasks`n- Pre-filled previous meter numbers`n- Overdue debt notifications", $fontFlow, $brushNavy, 320, 675)

# 4. ENTITY: VNPAY GATEWAY (Bottom-Right)
$bVnpay = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(225, 213, 231))
$pVnpay = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(150, 115, 166), 2.5)
Draw-RoundedRect $g $pVnpay $bVnpay 920 740 240 100 8
$g.DrawString("VNPAY PAYMENT GATEWAY`n(External Payment Gateway)`n[VNPay Sandbox API]", $fontActor, $brushBlack, (New-Object System.Drawing.RectangleF(920, 740, 240, 100)), $sfCenter)

# VNPay flows
# MMS -> VNPay
$g.DrawLine($pArrowIn, 760, 530, 920, 740)
$g.DrawString("- Order params, amount, bankCode`n- HMAC-SHA512 secure checksum`n- Return URL & Txn Reference", $fontFlow, $brushBlack, 735, 630)

# VNPay -> MMS
$g.DrawLine($pArrowOut, 920, 770, 760, 560)
$g.DrawString("- Server-to-server IPN webhook`n- Response code 00 (Success)`n- Bank transaction number & time", $fontFlow, $brushNavy, 860, 675)

# 5. ENTITY: CLOUDINARY STORAGE (Top-Center)
$bCloud = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(248, 206, 204))
$pCloud = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(184, 84, 80), 2.5)
Draw-RoundedRect $g $pCloud $bCloud 480 100 240 85 8
$g.DrawString("CLOUDINARY STORAGE`n(Media & Document Cloud CDN)`n[REST Asset Gateway]", $fontActor, $brushBlack, (New-Object System.Drawing.RectangleF(480, 100, 240, 85)), $sfCenter)

# Cloudinary flows
# MMS -> Cloudinary
$g.DrawLine($pArrowIn, 570, 360, 570, 185)
$g.DrawString("Upload room photos, KYC citizen IDs, contract signatures", $fontFlow, $brushBlack, 220, 255)

# Cloudinary -> MMS
$g.DrawLine($pArrowOut, 630, 185, 630, 360)
$g.DrawString("Return optimized CDN image URLs & secure asset tokens", $fontFlow, $brushNavy, 640, 255)

# Save image
$outFile = Join-Path $imgDir "Figure_1_0_System_Context_Diagram.png"
$bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$g.Dispose()

Write-Host "Generated Context Diagram image: $outFile"
