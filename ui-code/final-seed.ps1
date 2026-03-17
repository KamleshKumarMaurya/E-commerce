$apiUrl = "http://192.168.1.66:8082/api/v1/vendor/products"
$assetsPath = "d:\E-commerce-ui\src\assets\images"
$imageFiles = @("hero-bg.png", "promo-smart.png", "promo-summer.png")

$products = @(
    # --- Electronics (Vendor 1) ---
    @{
        vendorId = "1"
        data = @{
            name = "ZenBook Dual Pro"
            sku = "ELC-LAP-DUAL"
            price = 2499.00; stock = 10; category = "Electronics"
            description = "High-performance laptop with secondary touchscreen display and RTX 4070."
            specifications = @{ "GPU" = "RTX 4070"; "RAM" = "32GB"; "Display" = "4K OLED" }
        }
    },
    @{
        vendorId = "1"
        data = @{
            name = "UltraView 34-inch Monitor"
            sku = "ELC-MON-34"
            price = 599.00; stock = 15; category = "Electronics"
            description = "Ultrawide curved gaming monitor with 175Hz refresh rate and HDR1000."
            specifications = @{ "Resolution" = "3440x1440"; "Refresh" = "175Hz"; "Panel" = "QD-OLED" }
        }
    },
    # --- Automotive (Vendor 7) ---
    @{
        vendorId = "7"
        data = @{
            name = "PeakPerformance Brake Pads"
            sku = "AUT-BRK-CB"
            price = 245.00; stock = 20; category = "Automotive"
            description = "Ceramic brake pads for high-performance vehicles, offering superior stopping power."
            specifications = @{ "Material" = "Ceramic"; "Dust" = "Low"; "Fitment" = "Universal Performance" }
        }
    },
    @{
        vendorId = "7"
        data = @{
            name = "AeroWing Spoiler Lip"
            sku = "AUT-EXT-SPO"
            price = 129.00; stock = 8; category = "Automotive"
            description = "Universal carbon-look trunk spoiler lip for improved aerodynamics and style."
            specifications = @{ "Material" = "ABS Plastic"; "Finish" = "Carbon Fiber Pattern"; "Installation" = "3M Adhesive" }
        }
    },
    @{
        vendorId = "7"
        data = @{
            name = "NitroBoost Fuel Additive"
            sku = "AUT-FLD-NIT"
            price = 19.99; stock = 150; category = "Automotive"
            description = "Premium fuel system cleaner and octane booster for maximum engine efficiency."
            specifications = @{ "Bottle Size" = "500ml"; "Treats" = "60L Fuel"; "Type" = "Octane Boost" }
        }
    }
)

Write-Host "Adding 5 Replacement Products..." -ForegroundColor Cyan

foreach ($p in $products) {
    $vendorId = $p.vendorId
    $json = $p.data | ConvertTo-Json -Depth 10
    $imageFile = Join-Path $assetsPath $imageFiles[([array]::IndexOf($products, $p) % $imageFiles.Count)]
    
    Write-Host "Adding product: $($p.data.name) for Vendor: $vendorId" -ForegroundColor Yellow

    try {
        $boundary = [System.Guid]::NewGuid().ToString()
        $LF = "`r`n"
        
        $body = "--$boundary" + $LF
        $body += 'Content-Disposition: form-data; name="product"; filename="product.json"' + $LF
        $body += "Content-Type: application/json" + $LF + $LF
        $body += $json + $LF
        
        if (Test-Path $imageFile) {
            $fileBytes = [System.IO.File]::ReadAllBytes($imageFile)
            $fileContent = [System.Text.Encoding]::GetEncoding('iso-8859-1').GetString($fileBytes)
            
            $body += "--$boundary" + $LF
            $body += 'Content-Disposition: form-data; name="image"; filename="' + [System.IO.Path]::GetFileName($imageFile) + '"' + $LF
            $body += "Content-Type: image/png" + $LF + $LF
            $body += $fileContent + $LF
        }
        
        $body += "--$boundary--" + $LF

        $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Headers @{
            "X-Vendor-Id" = $vendorId
            "Content-Type" = "multipart/form-data; boundary=$boundary"
        } -Body $body

        Write-Host "Successfully added product!" -ForegroundColor Green
    } catch {
        Write-Host "Failed to add product: $_" -ForegroundColor Red
    }
}

Write-Host "Backend Seeding Fully Completed." -ForegroundColor Cyan
