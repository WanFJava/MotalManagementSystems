Add-Type -AssemblyName System.Drawing

$imgDir = "E:\02_Projects_BaiTap\ReactJS_FER202\LuyenReactJS\MotalManagementSystems\docs\diagram_images"
$dlDir = "C:\Users\nguye\Downloads"
if (!(Test-Path $imgDir)) { New-Item -ItemType Directory -Path $imgDir -Force | Out-Null }

# Reusable drawing helpers
function Draw-UMLClass($g, [float]$x, [float]$y, [float]$w, [string]$headerText, [string]$stereo, $attrList, $methodList, $fillBrush, $headerBrush) {
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(40, 40, 40), [float]1.5)
    $dividerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 120, 120), [float]1.0)
    $fontHeader = New-Object System.Drawing.Font("Arial", [float]10, [System.Drawing.FontStyle]::Bold)
    $fontStereo = New-Object System.Drawing.Font("Arial", [float]9, [System.Drawing.FontStyle]::Italic)
    $fontBody = New-Object System.Drawing.Font("Consolas", [float]9, [System.Drawing.FontStyle]::Regular)
    $textBrush = [System.Drawing.Brushes]::Black

    $headerH = 32.0
    if ($stereo) { $headerH = 44.0 }

    $attrH = 0.0
    if ($attrList -and $attrList.Count -gt 0) {
        $attrH = [float](($attrList.Count * 20) + 10)
    }

    $methodH = 0.0
    if ($methodList -and $methodList.Count -gt 0) {
        $methodH = [float](($methodList.Count * 20) + 10)
    }
    $totalH = [float]($headerH + $attrH + $methodH)

    # Background
    $g.FillRectangle($fillBrush, $x, $y, $w, $totalH)
    if ($headerBrush) {
        $g.FillRectangle($headerBrush, $x, $y, $w, $headerH)
    }
    $g.DrawRectangle($borderPen, $x, $y, $w, $totalH)

    # Header text
    $sfCenter = New-Object System.Drawing.StringFormat
    $sfCenter.Alignment = [System.Drawing.StringAlignment]::Center
    $sfCenter.LineAlignment = [System.Drawing.StringAlignment]::Center

    if ($stereo) {
        $rectStereo = New-Object System.Drawing.RectangleF($x, [float]($y + 3), $w, [float]18)
        $rectHead = New-Object System.Drawing.RectangleF($x, [float]($y + 20), $w, [float]20)
        $g.DrawString("«$stereo»", $fontStereo, $textBrush, $rectStereo, $sfCenter)
        $g.DrawString($headerText, $fontHeader, $textBrush, $rectHead, $sfCenter)
    } else {
        $rectHead = New-Object System.Drawing.RectangleF($x, $y, $w, $headerH)
        $g.DrawString($headerText, $fontHeader, $textBrush, $rectHead, $sfCenter)
    }

    $currY = [float]($y + $headerH)
    if ($attrH -gt 0) {
        $g.DrawLine($dividerPen, $x, $currY, [float]($x + $w), $currY)
        $sfLeft = New-Object System.Drawing.StringFormat
        $sfLeft.Alignment = [System.Drawing.StringAlignment]::Near
        $sfLeft.LineAlignment = [System.Drawing.StringAlignment]::Center
        $itemY = [float]($currY + 5)
        foreach ($attr in $attrList) {
            $rectItem = New-Object System.Drawing.RectangleF([float]($x + 8), $itemY, [float]($w - 12), [float]18)
            $g.DrawString($attr, $fontBody, $textBrush, $rectItem, $sfLeft)
            $itemY += [float]20
        }
        $currY += $attrH
    }

    if ($methodH -gt 0) {
        $g.DrawLine($dividerPen, $x, $currY, [float]($x + $w), $currY)
        $sfLeft = New-Object System.Drawing.StringFormat
        $sfLeft.Alignment = [System.Drawing.StringAlignment]::Near
        $sfLeft.LineAlignment = [System.Drawing.StringAlignment]::Center
        $itemY = [float]($currY + 5)
        foreach ($m in $methodList) {
            $rectItem = New-Object System.Drawing.RectangleF([float]($x + 8), $itemY, [float]($w - 12), [float]18)
            $g.DrawString($m, $fontBody, $textBrush, $rectItem, $sfLeft)
            $itemY += [float]20
        }
    }

    return @{ 
        X = $x; Y = $y; W = $w; H = $totalH; 
        Top = $y; Bottom = ($y + $totalH); 
        Left = $x; Right = ($x + $w); 
        CenterX = ($x + ($w / 2.0)); 
        CenterY = ($y + ($totalH / 2.0)) 
    }
}

function Draw-Arrow($g, $pen, [float]$fromX, [float]$fromY, [float]$toX, [float]$toY, [string]$type, [string]$label, [string]$multFrom, [string]$multTo) {
    $fontLabel = New-Object System.Drawing.Font("Arial", [float]9, [System.Drawing.FontStyle]::Regular)
    $fontBold = New-Object System.Drawing.Font("Arial", [float]9, [System.Drawing.FontStyle]::Bold)
    $textBrush = [System.Drawing.Brushes]::Black

    $g.DrawLine($pen, $fromX, $fromY, $toX, $toY)

    # Arrow heads
    if ($type -eq "extends") {
        $pts = @(
            (New-Object System.Drawing.PointF($toX, $toY)),
            (New-Object System.Drawing.PointF([float]($toX - 8), [float]($toY + 14))),
            (New-Object System.Drawing.PointF([float]($toX + 8), [float]($toY + 14)))
        )
        $g.FillPolygon([System.Drawing.Brushes]::White, $pts)
        $g.DrawPolygon($pen, $pts)
    } elseif ($type -eq "implements") {
        $pts = @(
            (New-Object System.Drawing.PointF($toX, $toY)),
            (New-Object System.Drawing.PointF([float]($toX - 8), [float]($toY + 14))),
            (New-Object System.Drawing.PointF([float]($toX + 8), [float]($toY + 14)))
        )
        $g.FillPolygon([System.Drawing.Brushes]::White, $pts)
        $g.DrawPolygon([System.Drawing.Pens]::Black, $pts)
    } elseif ($type -eq "composition") {
        $pts = @(
            (New-Object System.Drawing.PointF($fromX, $fromY)),
            (New-Object System.Drawing.PointF([float]($fromX + 8), [float]($fromY - 6))),
            (New-Object System.Drawing.PointF([float]($fromX + 16), $fromY)),
            (New-Object System.Drawing.PointF([float]($fromX + 8), [float]($fromY + 6)))
        )
        $g.FillPolygon([System.Drawing.Brushes]::Black, $pts)
        $g.DrawPolygon([System.Drawing.Pens]::Black, $pts)
    } elseif ($type -eq "open") {
        $g.DrawLine($pen, $toX, $toY, [float]($toX - 6), [float]($toY + 8))
        $g.DrawLine($pen, $toX, $toY, [float]($toX + 6), [float]($toY + 8))
    }

    if ($label) {
        $midX = [float](($fromX + $toX) / 2.0)
        $midY = [float](($fromY + $toY) / 2.0)
        if ([Math]::Abs($fromX - $toX) -lt 8) {
            $g.DrawString($label, $fontBold, $textBrush, [float]($midX + 10), [float]($midY - 8))
        } else {
            $g.DrawString($label, $fontBold, $textBrush, [float]($midX + 6), [float]($midY - 14))
        }
    }
    if ($multFrom) {
        if ([Math]::Abs($fromX - $toX) -lt 8) {
            $g.DrawString($multFrom, $fontLabel, $textBrush, [float]($fromX + 10), [float]($fromY + 4))
        } else {
            $g.DrawString($multFrom, $fontLabel, $textBrush, [float]($fromX + 6), [float]($fromY + 6))
        }
    }
    if ($multTo) {
        if ([Math]::Abs($fromX - $toX) -lt 8) {
            $g.DrawString($multTo, $fontLabel, $textBrush, [float]($toX + 10), [float]($toY - 18))
        } else {
            $g.DrawString($multTo, $fontLabel, $textBrush, [float]($toX + 6), [float]($toY - 20))
        }
    }
}

# ==============================================================================
# 1. RENDER CLASS DIAGRAM (Figure_2_2_1_Class_Diagram_Room.png)
# ==============================================================================
function Render-ClassDiagram {
    $bmpW = 1520
    $bmpH = 1180
    $bmp = New-Object System.Drawing.Bitmap($bmpW, $bmpH)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
    $g.Clear([System.Drawing.Color]::White)

    $titleFont = New-Object System.Drawing.Font("Arial", [float]14, [System.Drawing.FontStyle]::Bold)
    $g.DrawString("Room & Search Management - Detailed Class Diagram (Repository & Service Pattern)", $titleFont, [System.Drawing.Brushes]::Black, [float]40, [float]20)

    $brushWhite = [System.Drawing.Brushes]::White
    $brushHeader = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 245, 245))
    $penSolid = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(50, 50, 50), [float]1.5)
    $penDashed = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(50, 50, 50), [float]1.5)
    $penDashed.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash

    # LEFT SIDE
    $methodsGeneric = @("+ getById()", "+ findAll()", "+ save()", "+ deleteById()")
    $cGeneric = Draw-UMLClass $g 140 170 240 "IGenericRepository" "Interface" $null $methodsGeneric $brushWhite $brushHeader

    $methodsRentRepo = @("+ findByCustomerId()", "+ findByRoomId()")
    $cRentRepo = Draw-UMLClass $g 40 370 200 "RentalRequestRepository" $null $null $methodsRentRepo $brushWhite $null

    $methodsRoomRepo = @("+ findAvailableRoom()", "+ findByRoomNumber()")
    $cRoomRepo = Draw-UMLClass $g 270 370 200 "RoomRepository" $null $null $methodsRoomRepo $brushWhite $null

    Draw-Arrow $g $penDashed $cRentRepo.CenterX $cRentRepo.Top 200 $cGeneric.Bottom "implements" $null $null $null
    Draw-Arrow $g $penDashed $cRoomRepo.CenterX $cRoomRepo.Top 320 $cGeneric.Bottom "implements" $null $null $null

    $attrsService = @("- roomRepository: RoomRepository", "- rentalRequestRepo: RentalRequestRepository")
    $methodsService = @("+ checkAvailability()", "+ createBooking()", "+ searchRoom()", "+ createRoom()", "+ updateRoom()", "+ deleteRoom()")
    $cService = Draw-UMLClass $g 60 550 380 "RoomService" $null $attrsService $methodsService $brushWhite $null

    Draw-Arrow $g $penDashed 140 $cService.Top $cRentRepo.CenterX $cRentRepo.Bottom "open" "Use" $null $null
    Draw-Arrow $g $penDashed 370 $cService.Top $cRoomRepo.CenterX $cRoomRepo.Bottom "open" "Use" $null $null

    # RIGHT SIDE
    $attrsUser = @("- id: Long", "- fullName: String", "- email: String", "- password: String", "- phone: String", "- role: Role «enum»", "- isActive: boolean", "- createdAt: LocalDateTime")
    $methodsUser = @("+ login()", "+ logout()")
    $cUser = Draw-UMLClass $g 790 60 240 "User" $null $attrsUser $methodsUser $brushWhite $null

    $methodsCust = @("+ browseRoom()", "+ searchRoom()", "+ createRentalBooking()")
    $cCust = Draw-UMLClass $g 660 370 210 "Customer" $null $null $methodsCust $brushWhite $null

    $methodsStaff = @("+ confirmBooking()", "+ viewRoomBooking()", "+ createRoom()", "+ deleteRoom()", "+ editRoom()")
    $cStaff = Draw-UMLClass $g 930 370 210 "Staff" $null $null $methodsStaff $brushWhite $null

    Draw-Arrow $g $penSolid $cCust.CenterX $cCust.Top 850 $cUser.Bottom "extends" "Extends" $null $null
    Draw-Arrow $g $penSolid $cStaff.CenterX $cStaff.Top 970 $cUser.Bottom "extends" "Extends" $null $null

    $attrsRent = @("- id: Long", "- checkInDate: LocalDateTime", "- checkOutDate: LocalDateTime", "- totalAmount: BigDecimal", "- status: BookingStatus «enum»", "- createdAt: LocalDateTime")
    $methodsRent = @("+ confirm()", "+ cancel()")
    $cRent = Draw-UMLClass $g 650 550 230 "RentalRequest" $null $attrsRent $methodsRent $brushWhite $null
    Draw-Arrow $g $penSolid $cCust.CenterX $cCust.Bottom $cRent.CenterX $cRent.Top "none" "creates" "1" "0..1*"

    $attrsPay = @("- id: Long", "- amount: BigDecimal", "- type: PaymentType «enum»", "- status: PaymentStatus «enum»", "- paidAt: LocalDateTime")
    $methodsPay = @("+ process()")
    $cPay = Draw-UMLClass $g 1000 550 230 "Payment" $null $attrsPay $methodsPay $brushWhite $null
    Draw-Arrow $g $penSolid $cRent.Right 640 $cPay.Left 640 "composition" "involves" "1" "1..*"

    $attrsRoom = @("- id: Long", "- roomNumber: String", "- type: RoomType «enum»", "- price: BigDecimal", "- status: RoomStatus «enum»", "- createdAt: LocalDateTime")
    $methodsRoom = @("+ checkAvailability()")
    $cRoom = Draw-UMLClass $g 660 850 210 "Room" $null $attrsRoom $methodsRoom $brushWhite $null
    Draw-Arrow $g $penSolid $cRent.CenterX $cRent.Bottom $cRoom.CenterX $cRoom.Top "none" "linked to" "0..1*" "1"

    $outPath = Join-Path $imgDir "Figure_2_2_1_Class_Diagram_Room.png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Save((Join-Path $dlDir "Figure_2_2_1_Class_Diagram_Room.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated: Figure_2_2_1_Class_Diagram_Room.png"
}

# ==============================================================================
# 2. RENDER SEQUENCE DIAGRAM ENGINE (With «model» and «database» MongoDB)
# ==============================================================================
function Render-UMLSequenceDiagram($title, $fileName, $actorName, $lifelines, $steps, $altInfo, [int]$customWidth = 1620) {
    $w = $customWidth
    $h = 1080
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
    $g.Clear([System.Drawing.Color]::White)

    # Title Banner
    $titleFont = New-Object System.Drawing.Font("Arial", [float]13, [System.Drawing.FontStyle]::Bold)
    $g.DrawString($title, $titleFont, [System.Drawing.Brushes]::Black, [float]40, [float]16)

    # Pens & Brushes
    $actorPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(40, 40, 40), [float]1.5)
    $boxFill = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(90, 160, 190)) # Cyan / Slate Blue
    $boxBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(30, 80, 110), [float]1.5)
    
    # Specific colors for database (Soft Green/Teal)
    $dbFill = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 170, 130))
    $dbBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(40, 100, 70), [float]1.5)

    $whiteBrush = [System.Drawing.Brushes]::White
    $blackBrush = [System.Drawing.Brushes]::Black
    $lifelinePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(150, 150, 150), [float]1.0)
    $lifelinePen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
    $msgPen = New-Object System.Drawing.Pen([System.Drawing.Color]::Black, [float]1.2)
    $returnPen = New-Object System.Drawing.Pen([System.Drawing.Color]::Black, [float]1.2)
    $returnPen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
    $actBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(130, 185, 205))
    $actBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(40, 90, 120), [float]1.0)

    $fontStereo = New-Object System.Drawing.Font("Arial", [float]8, [System.Drawing.FontStyle]::Regular)
    $fontHeader = New-Object System.Drawing.Font("Arial", [float]8.5, [System.Drawing.FontStyle]::Bold)
    $fontMsg = New-Object System.Drawing.Font("Arial", [float]8.2, [System.Drawing.FontStyle]::Regular)

    $sfCenter = New-Object System.Drawing.StringFormat
    $sfCenter.Alignment = [System.Drawing.StringAlignment]::Center
    $sfCenter.LineAlignment = [System.Drawing.StringAlignment]::Center

    # 1. Draw Actor (Stick Figure) at lifeline 0
    $actX = [float]65
    $actY = [float]48
    $g.DrawEllipse($actorPen, [float]($actX - 10), $actY, [float]20, [float]20)
    $g.DrawLine($actorPen, $actX, [float]($actY + 20), $actX, [float]($actY + 45))
    $g.DrawLine($actorPen, [float]($actX - 18), [float]($actY + 30), [float]($actX + 18), [float]($actY + 30))
    $g.DrawLine($actorPen, $actX, [float]($actY + 45), [float]($actX - 14), [float]($actY + 70))
    $g.DrawLine($actorPen, $actX, [float]($actY + 45), [float]($actX + 14), [float]($actY + 70))
    
    $rectActor = New-Object System.Drawing.RectangleF([float]($actX - 45), [float]($actY + 74), [float]90, [float]20)
    $g.DrawString($actorName, $fontHeader, $blackBrush, $rectActor, $sfCenter)

    # Actor lifeline
    $g.DrawLine($lifelinePen, $actX, [float]($actY + 95), $actX, [float]($h - 40))

    # 2. Draw Object Lifelines
    foreach ($ll in $lifelines) {
        $x = [float]$ll.X
        $boxW = [float]155
        $boxH = [float]46
        $topY = [float]60

        $isDb = ($ll.Stereo -eq "database")
        $fill = if ($isDb) { $dbFill } else { $boxFill }
        $border = if ($isDb) { $dbBorder } else { $boxBorder }

        $g.FillRectangle($fill, [float]($x - ($boxW/2.0)), $topY, $boxW, $boxH)
        $g.DrawRectangle($border, [float]($x - ($boxW/2.0)), $topY, $boxW, $boxH)

        if ($ll.Stereo) {
            $rectSt = New-Object System.Drawing.RectangleF([float]($x - ($boxW/2.0)), [float]($topY + 3), $boxW, [float]16)
            $rectNm = New-Object System.Drawing.RectangleF([float]($x - ($boxW/2.0)), [float]($topY + 20), $boxW, [float]22)
            $g.DrawString("«$($ll.Stereo)»", $fontStereo, $whiteBrush, $rectSt, $sfCenter)
            $g.DrawString($ll.Name, $fontHeader, $whiteBrush, $rectNm, $sfCenter)
        } else {
            $rectBox = New-Object System.Drawing.RectangleF([float]($x - ($boxW/2.0)), $topY, $boxW, $boxH)
            $g.DrawString($ll.Name, $fontHeader, $whiteBrush, $rectBox, $sfCenter)
        }

        # Lifeline dash
        $g.DrawLine($lifelinePen, $x, [float]($topY + $boxH), $x, [float]($h - 40))
    }

    # 3. Draw Alt Frame if defined
    if ($altInfo) {
        $framePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(60, 60, 60), [float]1.2)
        $altDividerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(80, 80, 80), [float]1.0)
        $altDividerPen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash

        $af = $altInfo
        $g.DrawRectangle($framePen, [float]$af.X, [float]$af.Y, [float]$af.W, [float]$af.H)

        # Alt tag
        $g.FillRectangle([System.Drawing.Brushes]::White, [float]$af.X, [float]$af.Y, [float]36, [float]18)
        $g.DrawRectangle($framePen, [float]$af.X, [float]$af.Y, [float]36, [float]18)
        $g.DrawString("alt", $fontHeader, $blackBrush, [float]($af.X + 6), [float]($af.Y + 2))

        # True Guard
        $fontItalic = New-Object System.Drawing.Font("Arial", [float]8.5, [System.Drawing.FontStyle]::Italic)
        $g.DrawString("[$($af.GuardTrue)]", $fontItalic, $blackBrush, [float]($af.X + 8), [float]($af.Y + 24))

        # Divider line
        $g.DrawLine($altDividerPen, [float]$af.X, [float]$af.DividerY, [float]($af.X + $af.W), [float]$af.DividerY)
        # False Guard
        $g.DrawString("[$($af.GuardFalse)]", $fontItalic, $blackBrush, [float]($af.X + 8), [float]($af.DividerY + 6))
    }

    # 4. Draw Activations and Messages
    foreach ($step in $steps) {
        $fromX = [float]$step.From
        $toX = [float]$step.To
        $y = [float]$step.Y
        $isRet = $step.IsReturn
        $isCreate = $step.IsCreate
        $text = $step.Text

        if ($step.ActTarget) {
            $g.FillRectangle($actBrush, [float]($toX - 5), $y, [float]10, [float]36)
            $g.DrawRectangle($actBorder, [float]($toX - 5), $y, [float]10, [float]36)
        }

        $p = if ($isRet -or $isCreate) { $returnPen } else { $msgPen }
        $g.DrawLine($p, $fromX, $y, $toX, $y)

        # Arrowhead
        $dir = if ($toX -gt $fromX) { 1.0 } else { -1.0 }
        if ($isRet) {
            $g.DrawLine($p, $toX, $y, [float]($toX - (7 * $dir)), [float]($y - 5))
            $g.DrawLine($p, $toX, $y, [float]($toX - (7 * $dir)), [float]($y + 5))
        } else {
            $pts = @(
                (New-Object System.Drawing.PointF($toX, $y)),
                (New-Object System.Drawing.PointF([float]($toX - (8 * $dir)), [float]($y - 4))),
                (New-Object System.Drawing.PointF([float]($toX - (8 * $dir)), [float]($y + 4)))
            )
            $g.FillPolygon($blackBrush, $pts)
        }

        # Text label
        $textX = [float]([Math]::Min($fromX, $toX) + 10)
        $g.DrawString($text, $fontMsg, $blackBrush, $textX, [float]($y - 14))
    }

    $outPath = Join-Path $imgDir $fileName
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Save((Join-Path $dlDir $fileName), [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated: $fileName"
}

# ==============================================================================
# Sequence 1: UC-M03 Request Rental (With Model & MongoDB)
# Lifelines: Customer -> UI -> Controller -> Service -> RoomRepo -> RentalRequestRepo -> Model: Room -> Model: RentalRequest -> Database: MongoDB
# ==============================================================================
function Render-UCM03 {
    $lifelines = @(
        @{ X = 220; Stereo = "user interaction"; Name = "Rental Booking View" },
        @{ X = 410; Stereo = "control"; Name = "RoomController" },
        @{ X = 600; Stereo = "service"; Name = "RoomService" },
        @{ X = 790; Stereo = "repository"; Name = "RoomRepository" },
        @{ X = 990; Stereo = "repository"; Name = "RentalRequestRepo" },
        @{ X = 1190; Stereo = "model"; Name = "Room" },
        @{ X = 1390; Stereo = "model"; Name = "RentalRequest" },
        @{ X = 1590; Stereo = "database"; Name = "MongoDB" }
    )

    $steps = @(
        @{ From = 65; To = 220; Y = 135; Text = "1: requestRentalBooking(roomId, checkIn, checkOut)"; ActTarget = $true },
        @{ From = 220; To = 410; Y = 175; Text = "2: POST /api/rooms/rental-booking"; ActTarget = $true },
        @{ From = 410; To = 600; Y = 215; Text = "3: checkRoomAvailable(roomId, checkIn, checkOut)"; ActTarget = $true },
        @{ From = 600; To = 790; Y = 255; Text = "4: findById(roomId)"; ActTarget = $true },
        @{ From = 790; To = 1190; Y = 295; Text = "5: findById(roomId)"; ActTarget = $true },
        @{ From = 1190; To = 1590; Y = 325; Text = "6: db.rooms.findOne({ _id: roomId })"; ActTarget = $true },
        @{ From = 1590; To = 1190; Y = 355; Text = "7: room document (BSON)"; IsReturn = $true },
        @{ From = 1190; To = 790; Y = 375; Text = "8: Room hydrated entity"; IsReturn = $true },
        @{ From = 790; To = 600; Y = 395; Text = "9: return Room"; IsReturn = $true },

        # Alt available
        @{ From = 600; To = 410; Y = 445; Text = "10: available = true"; IsReturn = $true },
        @{ From = 410; To = 600; Y = 480; Text = "11: generateNewBooking(customerId, roomId, checkIn, checkOut)"; ActTarget = $true },
        @{ From = 600; To = 990; Y = 515; Text = "12: createRentalRequest(dto)"; ActTarget = $true },
        @{ From = 990; To = 1390; Y = 550; Text = "13: «create» new RentalRequest(dto, PENDING)"; IsCreate = $true; ActTarget = $true },
        @{ From = 1390; To = 1590; Y = 585; Text = "14: db.rentalRequests.insertOne(requestDoc)"; ActTarget = $true },
        @{ From = 1590; To = 1390; Y = 615; Text = "15: inserted ack with _id"; IsReturn = $true },
        @{ From = 1390; To = 990; Y = 645; Text = "16: saved RentalRequest"; IsReturn = $true },
        @{ From = 600; To = 790; Y = 680; Text = "17: updateRoomStatus(roomId, RESERVED)"; ActTarget = $true },
        @{ From = 790; To = 1590; Y = 715; Text = "18: db.rooms.updateOne({ _id: roomId }, { `$set: { status: RESERVED } })"; ActTarget = $true },
        @{ From = 1590; To = 790; Y = 750; Text = "19: update response OK"; IsReturn = $true },
        @{ From = 410; To = 220; Y = 790; Text = "20: confirmBooking(trackingId)"; IsReturn = $true },
        @{ From = 220; To = 65; Y = 825; Text = "21: Rental Booking Confirmed"; IsReturn = $true },

        # Alt unavailable
        @{ From = 600; To = 410; Y = 910; Text = "22: available = false"; IsReturn = $true },
        @{ From = 410; To = 220; Y = 950; Text = "23: 400 Bad Request ('Room is unavailable')"; IsReturn = $true },
        @{ From = 220; To = 65; Y = 990; Text = "24: showBookingErrorToast('Room not available')"; IsReturn = $true }
    )

    $altInfo = @{
        X = 35; Y = 405; W = 1630; H = 635;
        DividerY = 875;
        GuardTrue = "available: room.status == AVAILABLE";
        GuardFalse = "unavailable: room.status != AVAILABLE"
    }

    Render-UMLSequenceDiagram "Figure 2.2.3. Request Rental / Booking Sequence Diagram (Layered Pattern with MongoDB)" "Figure_2_2_3_Request_Rental_Sequence.png" "Customer" $lifelines $steps $altInfo 1700
}

# ==============================================================================
# Sequence 2: UC-M02 Search & Filter Rooms (With Model & MongoDB)
# ==============================================================================
function Render-UCM02 {
    $lifelines = @(
        @{ X = 250; Stereo = "user interaction"; Name = "Room Search View" },
        @{ X = 500; Stereo = "control"; Name = "RoomController" },
        @{ X = 750; Stereo = "service"; Name = "RoomService" },
        @{ X = 1000; Stereo = "repository"; Name = "RoomRepository" },
        @{ X = 1250; Stereo = "model"; Name = "Room" },
        @{ X = 1500; Stereo = "database"; Name = "MongoDB" }
    )

    $steps = @(
        @{ From = 65; To = 250; Y = 135; Text = "1: enterSearchCriteria(keyword, priceMin, priceMax, roomType)"; ActTarget = $true },
        @{ From = 250; To = 500; Y = 175; Text = "2: GET /api/rooms/search?keyword=...&priceMin=..."; ActTarget = $true },
        @{ From = 500; To = 750; Y = 215; Text = "3: searchRoom(searchCriteria)"; ActTarget = $true },
        @{ From = 750; To = 1000; Y = 255; Text = "4: findAvailableRoom(criteria)"; ActTarget = $true },
        @{ From = 1000; To = 1250; Y = 295; Text = "5: find(queryCriteria)"; ActTarget = $true },
        @{ From = 1250; To = 1500; Y = 325; Text = "6: db.rooms.find({ status: AVAILABLE, price: { `$gte, `$lte } })"; ActTarget = $true },
        @{ From = 1500; To = 1250; Y = 355; Text = "7: room documents cursor"; IsReturn = $true },
        @{ From = 1250; To = 1000; Y = 375; Text = "8: List<Room> hydrated entities"; IsReturn = $true },
        @{ From = 1000; To = 750; Y = 395; Text = "9: return List<Room>"; IsReturn = $true },

        # Alt found
        @{ From = 750; To = 500; Y = 445; Text = "10: hasResults = true"; IsReturn = $true },
        @{ From = 500; To = 750; Y = 485; Text = "11: formatRoomCards(rooms)"; ActTarget = $true },
        @{ From = 750; To = 500; Y = 525; Text = "12: return 200 OK (rooms array)"; IsReturn = $true },
        @{ From = 500; To = 250; Y = 565; Text = "13: renderRoomList(rooms)"; IsReturn = $true },
        @{ From = 250; To = 65; Y = 605; Text = "14: displayRoomCards(results)"; IsReturn = $true },

        # Alt empty
        @{ From = 750; To = 500; Y = 760; Text = "15: hasResults = false"; IsReturn = $true },
        @{ From = 500; To = 250; Y = 800; Text = "16: return 200 OK (empty array)"; IsReturn = $true },
        @{ From = 250; To = 65; Y = 840; Text = "17: displayEmptyPlaceholder('No matching rooms found')"; IsReturn = $true }
    )

    $altInfo = @{
        X = 35; Y = 405; W = 1540; H = 480;
        DividerY = 715;
        GuardTrue = "rooms.size() > 0";
        GuardFalse = "rooms.isEmpty()"
    }

    Render-UMLSequenceDiagram "Figure 2.2.2. Search & Filter Rooms Sequence Diagram (with MongoDB)" "Figure_2_2_2_Search_Room_Sequence.png" "Customer" $lifelines $steps $altInfo 1620
}

# ==============================================================================
# Sequence 3: UC-M04.1 Create Room (With Model & MongoDB)
# ==============================================================================
function Render-UCM04_1 {
    $lifelines = @(
        @{ X = 250; Stereo = "user interaction"; Name = "Create Room View" },
        @{ X = 500; Stereo = "control"; Name = "RoomController" },
        @{ X = 750; Stereo = "service"; Name = "RoomService" },
        @{ X = 1000; Stereo = "repository"; Name = "RoomRepository" },
        @{ X = 1250; Stereo = "model"; Name = "Room" },
        @{ X = 1500; Stereo = "database"; Name = "MongoDB" }
    )

    $steps = @(
        @{ From = 65; To = 250; Y = 135; Text = "1: inputRoomDetails(roomNumber, type, price, area)"; ActTarget = $true },
        @{ From = 250; To = 500; Y = 175; Text = "2: POST /api/rooms"; ActTarget = $true },
        @{ From = 500; To = 750; Y = 215; Text = "3: createRoom(createRoomDTO)"; ActTarget = $true },
        @{ From = 750; To = 1000; Y = 255; Text = "4: findByRoomNumber(roomNumber)"; ActTarget = $true },
        @{ From = 1000; To = 1250; Y = 295; Text = "5: findOne({ roomNumber })"; ActTarget = $true },
        @{ From = 1250; To = 1500; Y = 325; Text = "6: db.rooms.findOne({ roomNumber })"; ActTarget = $true },
        @{ From = 1500; To = 1250; Y = 355; Text = "7: null or existing document"; IsReturn = $true },
        @{ From = 1250; To = 750; Y = 385; Text = "8: return existingRoom"; IsReturn = $true },

        # Alt unique
        @{ From = 750; To = 500; Y = 445; Text = "9: isValid = true"; IsReturn = $true },
        @{ From = 750; To = 1250; Y = 485; Text = "10: «create» new Room(roomNumber, type, price, AVAILABLE)"; IsCreate = $true; ActTarget = $true },
        @{ From = 750; To = 1000; Y = 525; Text = "11: save(newRoom)"; ActTarget = $true },
        @{ From = 1000; To = 1500; Y = 560; Text = "12: db.rooms.insertOne(newRoomDoc)"; ActTarget = $true },
        @{ From = 1500; To = 1000; Y = 590; Text = "13: inserted ack with _id"; IsReturn = $true },
        @{ From = 1000; To = 750; Y = 620; Text = "14: saved Room entity"; IsReturn = $true },
        @{ From = 750; To = 500; Y = 650; Text = "15: return 201 Created (Room)"; IsReturn = $true },
        @{ From = 500; To = 250; Y = 680; Text = "16: displaySuccessToast('Room created successfully')"; IsReturn = $true },
        @{ From = 250; To = 65; Y = 710; Text = "17: showRoomCreated()"; IsReturn = $true },

        # Alt duplicate
        @{ From = 750; To = 500; Y = 810; Text = "18: isValid = false"; IsReturn = $true },
        @{ From = 500; To = 250; Y = 850; Text = "19: return 409 Conflict ('Room number already exists')"; IsReturn = $true },
        @{ From = 250; To = 65; Y = 890; Text = "20: displayValidationError('Duplicate room number')"; IsReturn = $true }
    )

    $altInfo = @{
        X = 35; Y = 405; W = 1540; H = 530;
        DividerY = 765;
        GuardTrue = "existingRoom == null (Unique)";
        GuardFalse = "existingRoom != null (Duplicate)"
    }

    Render-UMLSequenceDiagram "Figure 2.2.4. Create Room Sequence Diagram (with MongoDB)" "Figure_2_2_4_Create_Room_Sequence.png" "Staff" $lifelines $steps $altInfo 1620
}

# ==============================================================================
# Sequence 4: UC-M04.2 Update Room Info (With Model & MongoDB)
# ==============================================================================
function Render-UCM04_2 {
    $lifelines = @(
        @{ X = 250; Stereo = "user interaction"; Name = "Edit Room View" },
        @{ X = 500; Stereo = "control"; Name = "RoomController" },
        @{ X = 750; Stereo = "service"; Name = "RoomService" },
        @{ X = 1000; Stereo = "repository"; Name = "RoomRepository" },
        @{ X = 1250; Stereo = "model"; Name = "Room" },
        @{ X = 1500; Stereo = "database"; Name = "MongoDB" }
    )

    $steps = @(
        @{ From = 65; To = 250; Y = 135; Text = "1: modifyRoomInfo(roomId, newPrice, newType, newStatus)"; ActTarget = $true },
        @{ From = 250; To = 500; Y = 175; Text = "2: PUT /api/rooms/{id}"; ActTarget = $true },
        @{ From = 500; To = 750; Y = 215; Text = "3: updateRoom(roomId, updateRoomDTO)"; ActTarget = $true },
        @{ From = 750; To = 1000; Y = 255; Text = "4: findById(roomId)"; ActTarget = $true },
        @{ From = 1000; To = 1250; Y = 295; Text = "5: findById(roomId)"; ActTarget = $true },
        @{ From = 1250; To = 1500; Y = 325; Text = "6: db.rooms.findById(roomId)"; ActTarget = $true },
        @{ From = 1500; To = 1250; Y = 355; Text = "7: room document"; IsReturn = $true },
        @{ From = 1250; To = 750; Y = 385; Text = "8: Room entity instance"; IsReturn = $true },

        # Alt found
        @{ From = 750; To = 500; Y = 445; Text = "9: isFound = true"; IsReturn = $true },
        @{ From = 750; To = 1250; Y = 485; Text = "10: updateAttributes(price, type, status)"; ActTarget = $true },
        @{ From = 750; To = 1000; Y = 525; Text = "11: save(room)"; ActTarget = $true },
        @{ From = 1000; To = 1500; Y = 560; Text = "12: db.rooms.updateOne({ _id: roomId }, { `$set: updateFields })"; ActTarget = $true },
        @{ From = 1500; To = 1000; Y = 590; Text = "13: update acknowledgment"; IsReturn = $true },
        @{ From = 1000; To = 750; Y = 620; Text = "14: updated Room entity"; IsReturn = $true },
        @{ From = 750; To = 500; Y = 650; Text = "15: return 200 OK (updatedRoom)"; IsReturn = $true },
        @{ From = 500; To = 250; Y = 680; Text = "16: displaySuccessToast('Room updated successfully')"; IsReturn = $true },
        @{ From = 250; To = 65; Y = 710; Text = "17: showUpdatedRoomDetails()"; IsReturn = $true },

        # Alt not found
        @{ From = 750; To = 500; Y = 810; Text = "18: isFound = false"; IsReturn = $true },
        @{ From = 500; To = 250; Y = 850; Text = "19: return 404 Not Found ('Room does not exist')"; IsReturn = $true },
        @{ From = 250; To = 65; Y = 890; Text = "20: displayErrorMessage('Room not found')"; IsReturn = $true }
    )

    $altInfo = @{
        X = 35; Y = 405; W = 1540; H = 530;
        DividerY = 765;
        GuardTrue = "room != null";
        GuardFalse = "room == null"
    }

    Render-UMLSequenceDiagram "Figure 2.2.5. Update Room Info Sequence Diagram (with MongoDB)" "Figure_2_2_5_Update_Room_Sequence.png" "Staff" $lifelines $steps $altInfo 1620
}

# ==============================================================================
# Sequence 5: UC-M04.3 Delete Room (With Model & MongoDB)
# ==============================================================================
function Render-UCM04_3 {
    $lifelines = @(
        @{ X = 250; Stereo = "user interaction"; Name = "Room List View" },
        @{ X = 500; Stereo = "control"; Name = "RoomController" },
        @{ X = 750; Stereo = "service"; Name = "RoomService" },
        @{ X = 1000; Stereo = "repository"; Name = "RoomRepository" },
        @{ X = 1250; Stereo = "model"; Name = "Room" },
        @{ X = 1500; Stereo = "database"; Name = "MongoDB" }
    )

    $steps = @(
        @{ From = 65; To = 250; Y = 135; Text = "1: requestDeleteRoom(roomId)"; ActTarget = $true },
        @{ From = 250; To = 500; Y = 175; Text = "2: DELETE /api/rooms/{id}"; ActTarget = $true },
        @{ From = 500; To = 750; Y = 215; Text = "3: deleteRoom(roomId)"; ActTarget = $true },
        @{ From = 750; To = 1000; Y = 255; Text = "4: findById(roomId)"; ActTarget = $true },
        @{ From = 1000; To = 1250; Y = 295; Text = "5: findById(roomId)"; ActTarget = $true },
        @{ From = 1250; To = 1500; Y = 325; Text = "6: db.rooms.findById(roomId)"; ActTarget = $true },
        @{ From = 1500; To = 1250; Y = 355; Text = "7: room document with status"; IsReturn = $true },
        @{ From = 1250; To = 750; Y = 385; Text = "8: Room entity instance"; IsReturn = $true },

        # Alt can delete
        @{ From = 750; To = 500; Y = 445; Text = "9: canDelete = true"; IsReturn = $true },
        @{ From = 750; To = 1000; Y = 485; Text = "10: deleteById(roomId)"; ActTarget = $true },
        @{ From = 1000; To = 1500; Y = 525; Text = "11: db.rooms.deleteOne({ _id: roomId })"; ActTarget = $true },
        @{ From = 1500; To = 1000; Y = 560; Text = "12: delete result { deletedCount: 1 }"; IsReturn = $true },
        @{ From = 1000; To = 750; Y = 590; Text = "13: return deleteStatus = true"; IsReturn = $true },
        @{ From = 750; To = 500; Y = 620; Text = "14: return 200 OK ('Room deleted successfully')"; IsReturn = $true },
        @{ From = 500; To = 250; Y = 650; Text = "15: refreshRoomTable('Room deleted')"; IsReturn = $true },
        @{ From = 250; To = 65; Y = 680; Text = "16: displayDeleteConfirmation()"; IsReturn = $true },

        # Alt cannot delete
        @{ From = 750; To = 500; Y = 770; Text = "17: canDelete = false"; IsReturn = $true },
        @{ From = 500; To = 250; Y = 810; Text = "18: return 400 Bad Request ('Cannot delete occupied room under lease')"; IsReturn = $true },
        @{ From = 250; To = 65; Y = 850; Text = "19: displayWarningAlert('Cannot delete room currently rented')"; IsReturn = $true }
    )

    $altInfo = @{
        X = 35; Y = 405; W = 1540; H = 490;
        DividerY = 725;
        GuardTrue = "room.status != RENTED";
        GuardFalse = "room.status == RENTED"
    }

    Render-UMLSequenceDiagram "Figure 2.2.6. Delete Room Sequence Diagram (with MongoDB)" "Figure_2_2_6_Delete_Room_Sequence.png" "Staff" $lifelines $steps $altInfo 1620
}

Write-Host "Rendering high-resolution diagrams for Module 2 with «model» and «database» MongoDB..."
Render-ClassDiagram
Render-UCM03
Render-UCM02
Render-UCM04_1
Render-UCM04_2
Render-UCM04_3
Write-Host "All Module 2 images rendered successfully!"
