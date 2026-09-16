# Schriftgroesse der Affinity-Oberflaeche (Standard = 0, Gross = 2)
if opt font=large; then defaults write $DOM com.canva.affinity.Preferences.FontSizeDelta -int 2
else defaults write $DOM com.canva.affinity.Preferences.FontSizeDelta -int 0; fi
