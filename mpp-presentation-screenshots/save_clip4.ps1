Add-Type -AssemblyName System.Windows.Forms
$img = [System.Windows.Forms.Clipboard]::GetImage()
if ($img) {
    $img.Save("C:\Users\MarieLexisDad\Documents\Obsidian Vault\tmp\mpp-presentation-screenshots\storyline-embed.png")
    Write-Host "Saved storyline-embed.png"
} else {
    Write-Host "No image in clipboard"
}
