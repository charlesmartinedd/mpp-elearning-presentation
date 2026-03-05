Add-Type -AssemblyName System.Windows.Forms
$img = [System.Windows.Forms.Clipboard]::GetImage()
if ($img) {
    $img.Save("C:\Users\MarieLexisDad\Documents\Obsidian Vault\tmp\mpp-presentation-screenshots\why-it-matters.png")
    Write-Host "Saved why-it-matters.png"
} else {
    Write-Host "No image in clipboard"
}
