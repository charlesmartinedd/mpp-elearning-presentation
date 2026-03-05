Add-Type -AssemblyName System.Windows.Forms
$img = [System.Windows.Forms.Clipboard]::GetImage()
if ($img) {
    $img.Save("C:\Users\MarieLexisDad\Documents\Obsidian Vault\tmp\mpp-presentation-screenshots\mpp-logo-raw.png")
    Write-Host "Saved mpp-logo-raw.png"
} else {
    Write-Host "No image in clipboard"
}
