param(
    [Parameter(Mandatory = $true)]
    [string]$InputFile,

    [Parameter(Mandatory = $true)]
    [string]$ProjectDirectory
)

$binaryExtensions = @(
    '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.ico',
    '.woff', '.woff2', '.ttf', '.eot', '.otf',
    '.mp3', '.wav', '.ogg', '.mp4', '.webm',
    '.pdf', '.zip', '.rar', '.7z'
)

$directoryByLevel = @{}
$insideStructure = $false
$missing = [System.Collections.Generic.List[string]]::new()

foreach ($line in [System.IO.File]::ReadLines([System.IO.Path]::GetFullPath($InputFile))) {
    if ($line -eq '<directory_structure>') {
        $insideStructure = $true
        continue
    }
    if ($line -eq '</directory_structure>') {
        break
    }
    if (-not $insideStructure -or [string]::IsNullOrWhiteSpace($line)) {
        continue
    }

    $trimmed = $line.TrimStart()
    $indent = $line.Length - $trimmed.Length
    $level = [int]($indent / 2)

    if ($trimmed.EndsWith('/')) {
        $directoryByLevel[$level] = $trimmed.TrimEnd('/')
        foreach ($key in @($directoryByLevel.Keys)) {
            if ($key -gt $level) {
                $directoryByLevel.Remove($key)
            }
        }
        continue
    }

    $parts = [System.Collections.Generic.List[string]]::new()
    for ($i = 0; $i -lt $level; $i++) {
        if ($directoryByLevel.ContainsKey($i)) {
            $parts.Add($directoryByLevel[$i])
        }
    }
    $parts.Add($trimmed)
    $relativePath = $parts -join '/'
    $extension = [System.IO.Path]::GetExtension($relativePath).ToLowerInvariant()

    if ($binaryExtensions -contains $extension) {
        $localPath = Join-Path ([System.IO.Path]::GetFullPath($ProjectDirectory)) $relativePath
        if (-not [System.IO.File]::Exists($localPath)) {
            $missing.Add($relativePath)
        }
    }
}

$missing | Sort-Object -Unique
