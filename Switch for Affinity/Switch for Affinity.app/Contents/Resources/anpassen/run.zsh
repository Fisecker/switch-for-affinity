#!/bin/zsh
# InDesign "Objekt > Anpassen" in Affinity ausfuehren. Aufruf: run.zsh center|fitProp|fillProp|contentToFrame|frameToContent
H="${0:A:h}"; MODE="$1"
TMPJS=$(mktemp -t affjs); TMPREQ=$(mktemp -t affreq)
sed "s/__MODE__/$MODE/" "$H/anpassen.js" > "$TMPJS"
ARGS=$(osascript -l JavaScript -e 'function run(a){ObjC.import("Foundation");var s=$.NSString.stringWithContentsOfFileEncodingError(a[0],4,null).js;return JSON.stringify({script:s});}' "$TMPJS")
{ print -r -- 'read_sdk_documentation_topic	{"filename":"preamble"}'; print -r -- "execute_script	$ARGS"; } > "$TMPREQ"
/bin/zsh "$H/mcp-client.zsh" "$TMPREQ" "$H/letzter-lauf.txt"
RC=$?
rm -f "$TMPJS" "$TMPREQ"
if [ $RC -eq 2 ]; then
  osascript -e 'display notification "Affinity-MCP ist aus: Affinity > Einstellungen > Protokoll für Modellkontext (MCP) einschalten." with title "Switch for Affinity"'
fi
