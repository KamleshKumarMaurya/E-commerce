$apiUrl = "http://192.168.1.66:8082/api/v1/vendor/products"
$assetsPath = "d:\E-commerce-ui\src\assets\images"
$imageFiles = @("hero-bg.png", "promo-smart.png", "promo-summer.png")

$products = @(
    # --- Previously Failed Fashion Products (Now using Vendor 1) ---
    @{
        vendorId = "1"
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
        vendorId = "1"
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
        vendorId = "1"
        data = @{
            name = "Skyline Aviator Sunglasses"
            sku = "FSH-SUN-SKY"
            price = 145.00; stock = 15; category = "Fashion"
            description = "Polarized aviator sunglasses with a gold-plated titanium frame."
            specifications = @{ "Lens" = "Polarized"; "Frame" = "Titanium"; "UV" = "100% Protection" }
        }
    },
    @{
        vendorId = "1"
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
        vendorId = "1"
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
    }
)

Write-Host "Retrying 5 Failed Products for Vendor 1..." -ForegroundColor Cyan

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

Write-Host "Retry Seeding Completed." -ForegroundColor Cyan
