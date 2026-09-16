#!/bin/zsh
# Switch for Affinity – Wiederherstellen (Aufruf aus dem Installer oder eigener App). Arg1: de|en
setopt NULL_GLOB
R="${0:A:h}/.."
AFF="$HOME/Library/Application Support/Affinity"
SW="$HOME/Library/Application Support/Switch for Affinity"
# Umzug vom frueheren Namen "Affinity Switch" (Sicherungen/Original bleiben erhalten)
OLDSW="$HOME/Library/Application Support/Affinity Switch"
[ -d "$OLDSW" ] && [ ! -d "$SW" ] && mv "$OLDSW" "$SW"
rm -rf "$HOME/Library/Services/Affinity Switch – "*.workflow 2>/dev/null
DOM=com.canva.affinity
UILANG=${1:-de}
t(){ if [ "$UILANG" = de ]; then print -r -- "$1"; else print -r -- "$2"; fi; }
info(){ [ -n "$AFFSWITCH_RESTORE" ] && { print -r -- "$1"; return 0; }; osascript - "$1" <<'AS' >/dev/null 2>&1
on run argv
  display dialog (item 1 of argv) buttons {"OK"} default button "OK" with title "Switch for Affinity" with icon note
end run
AS
}
check(){ osascript -l JavaScript "$R/core/shortcuts.js" --check "$1" 2>/dev/null; }
# Quelle je Datei: zuerst Original, sonst die aelteste Sicherung (= Zustand vor der ersten Installation)
pick(){ local d b=( "$SW/Backups/"*(/on) ); for d in "$SW/Original" "${(@)b}"; do
  [ -f "$d/$1" ] || continue
  # Werkzeugleisten/Einstellungen nur aus Original oder der aeltesten Sicherung (spaetere sind schon umgestellt)
  [ "$1" != shortcuts3.affshortcuts ] && [ "$d" != "$SW/Original" ] && [ "$d" != "${b[1]}" ] && continue
  [ "$1" = shortcuts3.affshortcuts ] && [ "$(check "$d/$1")" != clean ] && continue
  print -r -- "$d/$1"; return 0; done; return 1; }
NAME="$(t 'Zustand vor der ersten Installation' 'state before the first install')"
if ! pick shortcuts3.affshortcuts >/dev/null && [ "$(check "$AFF/shortcuts3.affshortcuts")" != switched ] && ! pick studios3.dat >/dev/null && ! pick $DOM.plist >/dev/null; then
  info "$(t 'Keine Sicherung gefunden – Affinity ist nicht von Switch for Affinity verändert.' 'No backup found – Affinity has not been changed by Switch for Affinity.')"; exit 1
fi

if [ -n "$AFFSWITCH_RESTORE" ]; then CHOICE="$AFFSWITCH_RESTORE"
else
CHOICE=$(osascript - "$(t "Switch for Affinity entfernen und Affinity zurücksetzen auf: $NAME?

• Tastenkürzel, Werkzeuge, Einstellungen & Bedienfelder wie vorher
• Anpassen-Dienste werden entfernt" "Remove Switch for Affinity and restore Affinity to: $NAME?

• Shortcuts, tools, settings & panels as before
• Fitting services will be removed")" "$(t Abbrechen Cancel)" "$(t 'Nur Tastenkürzel' 'Shortcuts only')" "$(t 'Alles wiederherstellen' 'Restore everything')" <<'AS' 2>/dev/null
on run argv
  set r to display dialog (item 1 of argv) buttons {item 2 of argv, item 3 of argv, item 4 of argv} default button (item 4 of argv) with title "Switch for Affinity" with icon caution
  return button returned of r
end run
AS
)
case "$CHOICE" in
  "Nur Tastenkürzel"|"Shortcuts only") CHOICE=keys;;
  "Alles wiederherstellen"|"Restore everything") CHOICE=all;;
  *) exit 0;;
esac
fi

affrunning(){ ps -axo command= | grep -Eq '[A]ffinity[^/]*\.app/Contents/MacOS/Affinity( |$)' && return 0
  [ "$(osascript -e 'application id "com.canva.affinity" is running' 2>/dev/null)" = true ]; }
if affrunning; then
  osascript -e 'tell application id "com.canva.affinity" to quit' >/dev/null 2>&1
  for i in {1..60}; do affrunning || break; sleep 0.5; done
  while affrunning; do
    [ -n "$AFFSWITCH_RESTORE" ] && exit 1
    osascript -e "display dialog \"$(t 'Bitte Affinity jetzt beenden (⌘Q) und danach auf OK klicken.' 'Please quit Affinity now (⌘Q), then click OK.')\" with title \"Switch for Affinity\" with icon caution" >/dev/null 2>&1 || exit 0
    for i in {1..20}; do affrunning || break; sleep 0.5; done
  done
fi
sleep 1

affrunning && { info "$(t 'Affinity läuft noch – abgebrochen.' 'Affinity is still running – aborted.')"; exit 1; }
# aktuellen Zustand vorher sichern
BK="$SW/Backups/$(date +%Y-%m-%d_%H-%M-%S)-vor-Wiederherstellen"; mkdir -p "$BK"
for f in shortcuts3.affshortcuts studios3.dat; do [ -f "$AFF/$f" ] && cp -p "$AFF/$f" "$BK/"; done
defaults export $DOM "$BK/$DOM.plist" 2>/dev/null
MISS=()
CUR="$AFF/shortcuts3.affshortcuts"
if S=$(pick shortcuts3.affshortcuts); then cp "$S" "$CUR"
elif [ "$(check "$CUR")" = switched ]; then
  # kein Original vorhanden: Standard-Kuerzel aus der mitgelieferten Affinity-Datei zurueckholen (aktuelle Datei bleibt Basis)
  TMP=$(mktemp -t affrestore)
  if osascript -l JavaScript "$R/core/shortcuts.js" "$CUR" "$R/core/mapping.json" "$TMP" "" de "" "$R/core/fallback-shortcuts.affshortcuts" >/dev/null 2>&1 && [ "$(check "$TMP")" = clean ]; then cp "$TMP" "$CUR"
  else MISS+=("$(t Tastenkürzel shortcuts)"); fi
  rm -f "$TMP"
fi
rm -f "$SW/.shortcuts-written"
if [ "$CHOICE" = all ]; then
  if S=$(pick studios3.dat); then cp "$S" "$AFF/studios3.dat"; else MISS+=("$(t Werkzeugleisten toolbars)"); fi
  if S=$(pick $DOM.plist); then defaults import $DOM "$S"
  else
    # keine gesicherten Einstellungen: nur die von Switch for Affinity gesetzten Werte entfernen
    for k in com.canva.affinity.scheme.uimode Tab-ToolUIPanel-NumberOfColumns MonochromaticIconography DockContextToolbar com.canva.affinity.Preferences.FontSizeDelta CMYKGlobalProfile RGBGlobalProfile ShowRulers EnableMCPServer com.canva.affinity.scripting.enabled; do defaults delete $DOM $k 2>/dev/null; done
    for G in E9159E4D-661F-4138-A995-81A178A1824C 7C4CC2E1-D695-422B-AD3B-326C60971BE7 831AAB2C-659F-4906-A8B1-8BA4544DB274; do
      for k in "com.canva.affinity.Studio.Data.1.$G" "com.canva.affinity.Studio.Data.1.$G.com.canva.affinity.hide.west" "com.canva.affinity.Studio.Data.1.$G.com.canva.affinity.hide.east" "$G.east.studio.width"; do defaults delete $DOM "$k" 2>/dev/null; done
    done
  fi
  rm -rf "$HOME/Library/Services/Switch for Affinity – "*.workflow "$SW/anpassen"
  defaults delete app.affinityswitch 2>/dev/null
  osascript -l JavaScript "$R/core/services.js" remove >/dev/null 2>&1
  /System/Library/CoreServices/pbs -flush >/dev/null 2>&1; /System/Library/CoreServices/pbs -update >/dev/null 2>&1
fi
open -b $DOM
if [ ${#MISS} -gt 0 ]; then
  info "$(t "Wiederhergestellt – außer: ${(j:, :)MISS} (keine Sicherung vorhanden). Die Sicherungen liegen unter ~/Library/Application Support/Switch for Affinity." "Restored – except: ${(j:, :)MISS} (no backup available). Backups are in ~/Library/Application Support/Switch for Affinity.")"
else
  info "$(t 'Wiederhergestellt. Die Sicherungen bleiben unter ~/Library/Application Support/Switch for Affinity erhalten.' 'Restored. Backups remain in ~/Library/Application Support/Switch for Affinity.')"
fi
