$baseDir = "C:\Users\redru\OneDrive\Desktop\novo olimpio\microservices\basico\src\main\java\br\com\sol7\olimpio\basico"
$basePkg = "br.com.sol7.olimpio.basico"

# Step 1: Build class name -> correct package map
$classMap = @{}
$fileList = @()

Get-ChildItem -Path $baseDir -Filter "*.java" -Recurse | ForEach-Object {
    $fpath = $_.FullName
    $fileList += $fpath

    $rel = $fpath.Substring($baseDir.Length + 1)
    $parts = $rel.Split('\')
    $pkgParts = $parts[0..($parts.Length - 2)]
    $correctPkg = $basePkg + "." + ($pkgParts -join ".")

    $content = Get-Content -Path $fpath -Raw -ErrorAction SilentlyContinue
    if ($null -eq $content) { return }

    if ($content -match '(?:public\s+)?(?:class|interface|enum|record)\s+(\w+)') {
        $className = $Matches[1]
        $classMap[$className] = $correctPkg
    }
}

Write-Host "Found $($classMap.Count) classes in $($fileList.Count) files"

# Step 2: Fix each file
$fixedCount = 0

foreach ($fpath in $fileList) {
    $content = Get-Content -Path $fpath -Raw -ErrorAction SilentlyContinue
    if ($null -eq $content) { continue }

    $original = $content

    $rel = $fpath.Substring($baseDir.Length + 1)
    $parts = $rel.Split('\')
    $pkgParts = $parts[0..($parts.Length - 2)]
    $correctPkg = $basePkg + "." + ($pkgParts -join ".")

    # Fix package declaration
    $content = [regex]::Replace(
        $content,
        '^package\s+br\.com\.sol7\.olimpio\.basico\.[A-Za-z0-9_]+;',
        "package $correctPkg;",
        [System.Text.RegularExpressions.RegexOptions]::Multiline
    )

    # Fix imports of br.com.sol7.olimpio.basico classes
    $content = [regex]::Replace(
        $content,
        '^import\s+br\.com\.sol7\.olimpio\.basico\.([A-Za-z0-9_.]+);',
        {
            param($m)
            $importPath = $Matches[1]
            $importParts = $importPath.Split('.')
            $className = $importParts[-1]
            if ($classMap.ContainsKey($className)) {
                return "import $($classMap[$className]).$className;"
            }
            return $m.Value
        },
        [System.Text.RegularExpressions.RegexOptions]::Multiline
    )

    if ($content -ne $original) {
        Set-Content -Path $fpath -Value $content -NoNewline -ErrorAction SilentlyContinue
        $fixedCount++
    }
}

Write-Host "Fixed $fixedCount files"