Add-Type -AssemblyName System.Windows.Forms
$img = [System.Windows.Forms.Clipboard]::GetImage()
if ($img) {
    $img.Save("C:\Users\MarieLexisDad\Documents\Obsidian Vault\tmp\mpp-presentation-screenshots\flashcards.png")
    Write-Host "Saved flashcards.png"
} else {
    Write-Host "No image in clipboard"
}
