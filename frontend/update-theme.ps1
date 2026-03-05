$files = @(
  "focus.css", "habits.css", "goals.css", "reports.css", "profile.css", "olympiads.css"
)
$dir = "m:\CollegeProjects\academic-worklife-balance-monitors\frontend\src\styles"

foreach ($f in $files) {
  $path = Join-Path $dir $f
  $c = [System.IO.File]::ReadAllText($path)
  
  # Card backgrounds: purple -> navy blue
  $c = $c.Replace("rgba(30, 22, 58, 0.6)", "rgba(18, 36, 62, 0.6)")
  $c = $c.Replace("rgba(30, 22, 58, 0.55)", "rgba(18, 36, 62, 0.55)")
  $c = $c.Replace("rgba(15, 10, 30, 0.8)", "rgba(10, 22, 40, 0.8)")
  
  # Borders: purple -> blue
  $c = $c.Replace("rgba(139, 92, 246, 0.15)", "rgba(59, 130, 246, 0.14)")
  $c = $c.Replace("rgba(139, 92, 246, 0.14)", "rgba(59, 130, 246, 0.13)")
  $c = $c.Replace("rgba(139, 92, 246, 0.12)", "rgba(59, 130, 246, 0.12)")
  $c = $c.Replace("rgba(139, 92, 246, 0.1)", "rgba(59, 130, 246, 0.1)")
  $c = $c.Replace("rgba(139, 92, 246, 0.08)", "rgba(59, 130, 246, 0.08)")
  $c = $c.Replace("rgba(139, 92, 246, 0.06)", "rgba(59, 130, 246, 0.06)")
  $c = $c.Replace("rgba(139, 92, 246, 0.05)", "rgba(59, 130, 246, 0.05)")
  $c = $c.Replace("rgba(139, 92, 246, 0.04)", "rgba(59, 130, 246, 0.04)")
  $c = $c.Replace("rgba(139, 92, 246, 0.07)", "rgba(59, 130, 246, 0.07)")
  $c = $c.Replace("rgba(139, 92, 246, 0.18)", "rgba(59, 130, 246, 0.18)")
  $c = $c.Replace("rgba(139, 92, 246, 0.22)", "rgba(59, 130, 246, 0.22)")
  $c = $c.Replace("rgba(139, 92, 246, 0.3)", "rgba(59, 130, 246, 0.3)")
  $c = $c.Replace("rgba(139, 92, 246, 0.4)", "rgba(59, 130, 246, 0.4)")
  $c = $c.Replace("rgba(139, 92, 246, 0.5)", "rgba(59, 130, 246, 0.5)")
  $c = $c.Replace("rgba(167, 139, 250, 0.4)", "rgba(96, 165, 250, 0.4)")
  
  # Text colors
  $c = $c.Replace("#9b7fcc", "#8badc8")
  $c = $c.Replace("#8b6bb0", "#5a7d9a")
  $c = $c.Replace("#c4a8e8", "#a8c4de")
  $c = $c.Replace("#f0e6ff", "#e8f0ff")
  
  # Accent hex: purple -> blue + gold
  $c = $c.Replace("#a78bfa", "#60a5fa")
  $c = $c.Replace("#c4b5fd", "#93c5fd")
  $c = $c.Replace("#8b5cf6", "#3b82f6")
  $c = $c.Replace("#a855f7", "#2563eb")
  $c = $c.Replace("#ec4899", "#f59e0b")
  $c = $c.Replace("#7c3aed", "#1d4ed8")
  $c = $c.Replace("#6d28d9", "#1e40af")

  [System.IO.File]::WriteAllText($path, $c)
  Write-Host "Updated $f"
}
