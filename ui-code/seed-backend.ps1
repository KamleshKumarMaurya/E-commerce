$apiUrl = "http://192.168.1.66:8082/api/v1/vendor/products"
$assetsPath = "d:\E-commerce-ui\src\assets\images"
$imageFiles = @("hero-bg.png", "promo-smart.png", "promo-summer.png")

$products = @(
    # --- Electronics (Vendor 1) ---
    @{
        vendorId = "1"
        data = @{
            name = "ZenBuds Wireless ANC"
            sku = "ELC-ZB-ANC"
            price = 199.00; stock = 50; category = "Electronics"
            description = "Premium noise-canceling earbuds with 30-hour battery life and spatial audio support."
            specifications = @{ "Battery" = "30 Hours"; "Bluetooth" = "5.3"; "ANC" = "Active" }
            variants = @(
                @{ sku = "ZB-BLK"; price = 199; attributes = @{ "Color" = "Black" }; status = "ACTIVE" },
                @{ sku = "ZB-WHT"; price = 199; attributes = @{ "Color" = "White" }; status = "ACTIVE" }
            )
        }
    },
    @{
        vendorId = "1"
        data = @{
            name = "Vantage Smart Watch Gen 2"
            sku = "ELC-VW-G2"
            price = 349.00; stock = 30; category = "Electronics"
            description = "Advanced health tracking with AMOLED display and 7-day battery life."
            specifications = @{ "Display" = "AMOLED"; "Waterproof" = "5ATM"; "Sensors" = "Heart, SpO2" }
        }
    },
    @{
        vendorId = "1"
        data = @{
            name = "BoltDrive 2TB External SSD"
            sku = "ELC-SSD-2TB"
            price = 159.00; stock = 100; category = "Electronics"
            description = "High-speed NVMe external storage with USB-C 3.2 Gen 2 connectivity."
            specifications = @{ "Capacity" = "2TB"; "Speed" = "1050MB/s"; "Interface" = "USB-C" }
        }
    },
    @{
        vendorId = "1"
        data = @{
            name = "ClickMaster Mechanical Keyboard"
            sku = "ELC-KB-RGB"
            price = 129.00; stock = 25; category = "Electronics"
            description = "RGB mechanical keyboard with hot-swappable tactile switches."
            specifications = @{ "Switches" = "Tactile"; "Backlight" = "RGB"; "Layout" = "Tenkeyless" }
        }
    },
    @{
        vendorId = "1"
        data = @{
            name = "SwiftGlide Gaming Mouse"
            sku = "ELC-MS-GM"
            price = 79.00; stock = 60; category = "Electronics"
            description = "Ultra-lightweight gaming mouse with 26K DPI optical sensor."
            specifications = @{ "DPI" = "26000"; "Weight" = "58g"; "Buttons" = "6 Programmable" }
        }
    },

    # --- Fashion (Vendor 2) ---
    @{
        vendorId = "2"
        data = @{
            name = "Essential Organic Cotton Tee"
            sku = "FSH-TSH-ORG"
            price = 35.00; stock = 200; category = "Fashion"
            description = "Eco-friendly 100% organic cotton t-shirt with a premium soft-wash finish."
            variants = @(
                @{ sku = "TS-S-NVY"; price = 35; attributes = @{ "Size" = "S"; "Color" = "Navy" }; status = "ACTIVE" },
                @{ sku = "TS-M-BLK"; price = 35; attributes = @{ "Size" = "M"; "Color" = "Black" }; status = "ACTIVE" },
                @{ sku = "TS-L-WHT"; price = 35; attributes = @{ "Size" = "L"; "Color" = "White" }; status = "ACTIVE" }
            )
        }
    },
    @{
        vendorId = "2"
        data = @{
            name = "Vintage Wash Slim Fit Jeans"
            sku = "FSH-JNS-VIN"
            price = 89.00; stock = 45; category = "Fashion"
            description = "Premium denim with a classic vintage wash and comfortable slim-fit silhouette."
            variants = @(
                @{ sku = "JN-32-BLU"; price = 89; attributes = @{ "Size" = "32"; "Color" = "Classic Blue" }; status = "ACTIVE" },
                @{ sku = "JN-34-BLK"; price = 89; attributes = @{ "Size" = "34"; "Color" = "Washed Black" }; status = "ACTIVE" }
            )
        }
    },
    @{
        vendorId = "2"
        data = @{
            name = "Skyline Aviator Sunglasses"
            sku = "FSH-SUN-SKY"
            price = 145.00; stock = 15; category = "Fashion"
            description = "Polarized aviator sunglasses with a gold-plated titanium frame."
            specifications = @{ "Lens" = "Polarized"; "Frame" = "Titanium"; "UV" = "100% Protection" }
        }
    },
    @{
        vendorId = "2"
        data = @{
            name = "AeroStride Running Shoes"
            sku = "FSH-SH-RUN"
            price = 115.00; stock = 80; category = "Fashion"
            description = "Lightweight running shoes with dynamic arch support and breathable mesh upper."
            variants = @(
                @{ sku = "SH-9-RED"; price = 115; attributes = @{ "Size" = "M"; "Color" = "Red" }; status = "ACTIVE" },
                @{ sku = "SH-10-BLU"; price = 115; attributes = @{ "Size" = "L"; "Color" = "Blue" }; status = "ACTIVE" }
            )
        }
    },
    @{
        vendorId = "2"
        data = @{
            name = "Silk Breeze Summer Dress"
            sku = "FSH-DRS-SUM"
            price = 75.00; stock = 20; category = "Fashion"
            description = "A light and airy silk-blend dress perfect for warm summer evenings."
            variants = @(
                @{ sku = "DRS-S-FLW"; price = 75; attributes = @{ "Size" = "S"; "Color" = "Floral" }; status = "ACTIVE" },
                @{ sku = "DRS-M-PNK"; price = 75; attributes = @{ "Size" = "M"; "Color" = "Pink" }; status = "ACTIVE" }
            )
        }
    },

    # --- Automotive (Vendor 7) ---
    @{
        vendorId = "7"
        data = @{
            name = "TurboDrive Air Compressor"
            sku = "AUT-AIR-PRO"
            price = 65.00; stock = 40; category = "Automotive"
            description = "Portable high-power air compressor with digital pressure gauge and auto-stop."
            specifications = @{ "Power" = "12V"; "Max Pressure" = "150 PSI"; "Cable Length" = "3.5m" }
        }
    },
    @{
        vendorId = "7"
        data = @{
            name = "GuardEye 4K Dash Cam"
            sku = "AUT-CAM-4K"
            price = 189.00; stock = 12; category = "Automotive"
            description = "Ultra-HD 4K dashboard camera with night vision and 170-degree wide-angle lens."
            specifications = @{ "Resolution" = "4K Ultra HD"; "G-Sensor" = "Yes"; "Loop Recording" = "Yes" }
        }
    },
    @{
        vendorId = "7"
        data = @{
            name = "GlossMaster Ceramic Kit"
            sku = "AUT-DET-CER"
            price = 49.00; stock = 55; category = "Automotive"
            description = "Professional-grade ceramic coating kit for long-lasting paint protection and shine."
            specifications = @{ "Durability" = "24 Months"; "Hardness" = "9H"; "Volume" = "50ml" }
        }
    },
    @{
        vendorId = "7"
        data = @{
            name = "BrightLite LED Conversion Kit"
            sku = "AUT-LED-H11"
            price = 85.00; stock = 30; category = "Automotive"
            description = "High-lumens LED headlight conversion kit with silent cooling fan system."
            specifications = @{ "Lumens" = "12000LM"; "Color Temp" = "6500K"; "Cooling" = "Turbo Fan" }
        }
    },
    @{
        vendorId = "7"
        data = @{
            name = "VacuPro Car Vacuum"
            sku = "AUT-VAC-CAR"
            price = 55.00; stock = 100; category = "Automotive"
            description = "Handheld high-suction car vacuum with multiple attachments for deep cleaning."
            specifications = @{ "Suction" = "8000Pa"; "Filter" = "HEPA"; "Runtime" = "30 Mins" }
        }
    }
)

Write-Host "Starting E-commerce Backend Seeding (15 Products)..." -ForegroundColor Cyan

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
        if ($_.Exception.Response) {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "Error Body: $errorBody" -ForegroundColor Gray
        }
    }
}

Write-Host "Seeding Completed." -ForegroundColor Cyan
