Add-Type -AssemblyName System.Windows.Forms
$img = [System.Windows.Forms.Clipboard]::GetImage()
if ($img) {
    $img.Save("C:\Users\MarieLexisDad\Documents\Obsidian Vault\tmp\mpp-presentation-screenshots\knowledge-check.png")
    Write-Host "Saved knowledge-check.png"
} else {
    Write-Host "No image in clipboard"
}
