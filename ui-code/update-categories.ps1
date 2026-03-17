$apiUrl = "http://192.168.1.66:8082/api/v1/admin/categories"

Write-Host "Updating Existing Categories with Rich Attributes..." -ForegroundColor Cyan

# Define updates for existing categories
$updates = @(
    # Electronics -> Mobile Phones (ID 2)
    @{
        id = 2; name = "Mobile Phones"; slug = "mobile-phones"; parentCategoryId = 1; description = "Smartphones and basic phones"; 
        commissionPercentage = 12.0; displayOrder = 1; isActive = $true;
        attributes = @(
            @{ attributeName = "Storage"; values = @("128GB", "256GB", "512GB", "1TB") },
            @{ attributeName = "Color"; values = @("Titanium", "Phantom Black", "Sierra Blue", "Alpine White") }
        )
    },
    # Clothing & Fashion -> Men (ID 15)
    @{
        id = 15; name = "Men"; slug = "men"; parentCategoryId = 14; description = "Mens clothing and accessories";
        commissionPercentage = 18.0; displayOrder = 1; isActive = $true;
        attributes = @(
            @{ attributeName = "Size"; values = @("S", "M", "L", "XL", "XXL") },
            @{ attributeName = "Color"; values = @("Black", "Navy", "Charcoal", "Olive") }
        )
    },
    # Automotive -> Car Accessories (ID 64)
    @{
        id = 64; name = "Car Accessories"; slug = "car-accessories"; parentCategoryId = 63; description = "Dash cams, seat covers, and organizers";
        commissionPercentage = 15.0; displayOrder = 1; isActive = $true;
        attributes = @(
            @{ attributeName = "Color"; values = @("Black", "Gray", "Beige", "Red") },
            @{ attributeName = "Compatible Vehicle"; values = @("SUV", "Sedan", "Hatchback", "Truck") }
        )
    }
)

foreach ($u in $updates) {
    $id = $u.id
    Write-Host "Updating Category ID: $id ($($u.name))" -ForegroundColor Yellow
    
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    # Create the payload without the 'id' field for the PUT request body, as 'id' is in the URL usually
    $payload = $u | Select-Object -Property * -ExcludeProperty id
    $json = $payload | ConvertTo-Json -Depth 10
    
    $body = "--$boundary" + $LF
    $body += 'Content-Disposition: form-data; name="category"; filename="category.json"' + $LF
    $body += "Content-Type: application/json" + $LF + $LF
    $body += $json + $LF
    $body += "--$boundary--" + $LF

    try {
        $response = Invoke-RestMethod -Uri "$apiUrl/$id" -Method Put -Headers @{ "Content-Type" = "multipart/form-data; boundary=$boundary" } -Body $body
        Write-Host "Successfully updated $($u.name)!" -ForegroundColor Green
    } catch {
        Write-Host "Failed to update $($u.name): $_" -ForegroundColor Red
        if ($_.Exception.Response) {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "Error: $errorBody" -ForegroundColor Gray
        }
    }
}

Write-Host "Category Updates Completed." -ForegroundColor Cyan
