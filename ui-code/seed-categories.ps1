$apiUrl = "http://192.168.1.66:8082/api/v1/admin/categories"

Write-Host "Starting Backend Category Hierarchy Seeding..." -ForegroundColor Cyan

# 1. Create Parent Categories
$parents = @(
    @{ name = "Electronics"; slug = "electronics"; description = "Gadgets and tech"; commissionPercentage = 8.0; displayOrder = 1; isActive = $true; parentCategoryId = $null },
    @{ name = "Fashion"; slug = "fashion"; description = "Clothing and accessories"; commissionPercentage = 15.0; displayOrder = 2; isActive = $true; parentCategoryId = $null },
    @{ name = "Automotive"; slug = "automotive"; description = "Car parts and accessories"; commissionPercentage = 10.0; displayOrder = 3; isActive = $true; parentCategoryId = $null }
)

$parentMap = @{}

foreach ($p in $parents) {
    Write-Host "Adding Parent Category: $($p.name)" -ForegroundColor Yellow
    
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    $json = $p | ConvertTo-Json
    
    $body = "--$boundary" + $LF
    $body += 'Content-Disposition: form-data; name="category"; filename="category.json"' + $LF
    $body += "Content-Type: application/json" + $LF + $LF
    $body += $json + $LF
    $body += "--$boundary--" + $LF

    try {
        $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Headers @{ "Content-Type" = "multipart/form-data; boundary=$boundary" } -Body $body
        Write-Host "Successfully added $($p.name)! Assigned ID: $($response.id)" -ForegroundColor Green
        $parentMap[$p.name] = $response.id
    } catch {
        Write-Host "Failed to add $($p.name): $_" -ForegroundColor Red
        # Fallback for mock/local if ID isn't returned clearly or if it fails but exists
    }
}

# 2. Create Child Categories
$children = @(
    @{ name = "Mobile Phones"; slug = "mobile-phones"; parentName = "Electronics"; description = "Smartphones and more"; commissionPercentage = 12.0; displayOrder = 1; isActive = $true; 
       attributes = @(@{ attributeName = "Storage"; values = @("128GB", "256GB", "512GB") }, @{ attributeName = "Color"; values = @("Black", "White", "Blue") }) },
    @{ name = "Car Accessories"; slug = "car-accessories"; parentName = "Automotive"; description = "Interior and exterior"; commissionPercentage = 18.0; displayOrder = 1; isActive = $true;
       attributes = @(@{ attributeName = "Wheel Size"; values = @("12Inch", "24Inch") }, @{ attributeName = "Color"; values = @("Red", "Black", "Chrome") }) },
    @{ name = "Men's Wear"; slug = "mens-wear"; parentName = "Fashion"; description = "Premium mens fashion"; commissionPercentage = 20.0; displayOrder = 1; isActive = $true;
       attributes = @(@{ attributeName = "Size"; values = @("S", "M", "L", "XL") }, @{ attributeName = "Color"; values = @("Black", "Brown", "Navy") }) }
)

foreach ($c in $children) {
    $parentName = $c.parentName
    $parentId = $parentMap[$parentName]
    
    if (-not $parentId) {
        Write-Host "Warning: Could not find ID for parent $parentName. Category creation may fail." -ForegroundColor Gray
    }

    $payload = @{
        name = $c.name
        slug = $c.slug
        description = $c.description
        parentCategoryId = $parentId
        commissionPercentage = $c.commissionPercentage
        displayOrder = $c.displayOrder
        isActive = $c.isActive
        attributes = $c.attributes
    }

    Write-Host "Adding Child Category: $($c.name) (under $parentName)" -ForegroundColor Yellow
    
    $boundary = [System.Guid]::NewGuid().ToString()
    $json = $payload | ConvertTo-Json -Depth 10
    
    $body = "--$boundary" + $LF
    $body += 'Content-Disposition: form-data; name="category"; filename="category.json"' + $LF
    $body += "Content-Type: application/json" + $LF + $LF
    $body += $json + $LF
    $body += "--$boundary--" + $LF

    try {
        $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Headers @{ "Content-Type" = "multipart/form-data; boundary=$boundary" } -Body $body
        Write-Host "Successfully added $($c.name)!" -ForegroundColor Green
    } catch {
        Write-Host "Failed to add $($c.name): $_" -ForegroundColor Red
    }
}

Write-Host "Category Seeding Completed." -ForegroundColor Cyan
