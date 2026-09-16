#!/bin/zsh
# MCP-Batch-Client fuer Affinity (lokal). Nutzung: mcp-client.zsh <requests> <ausgabe>
REQ="$1"; OUT="$2"
BASE="http://[::1]:6767"
TMP=$(mktemp -t affmcp)
curl -sN -g "$BASE/sse" > "$TMP" 2>/dev/null &
CP=$!
trap 'kill $CP 2>/dev/null; cp "$TMP" "$OUT" 2>/dev/null; rm -f "$TMP" "$TMP.req"' EXIT
EP=""
for i in {1..100}; do EP=$(grep -m1 '^data:' "$TMP" | sed 's/^data: *//' | tr -d '\r'); [ -n "$EP" ] && break; sleep 0.05; done
[ -z "$EP" ] && exit 2
post(){ curl -s -g -X POST "$BASE$EP" -H 'Content-Type: application/json' --data-binary @"$TMP.req" >/dev/null 2>&1; }
waitid(){ local n=0; while (( n < 400 )); do n=$((n+1)); grep -q "\"id\":${1}[,}]" "$TMP" && return 0; sleep 0.05; done; return 1; }
print -r -- '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"affinity-switch","version":"1.0"}}}' > "$TMP.req"; post; waitid 1
print -r -- '{"jsonrpc":"2.0","method":"notifications/initialized"}' > "$TMP.req"; post
rid=10
while IFS=$'\t' read -r tool args; do
  [ -z "$tool" ] && continue
  rid=$((rid+1))
  print -r -- "{\"jsonrpc\":\"2.0\",\"id\":${rid},\"method\":\"tools/call\",\"params\":{\"name\":\"${tool}\",\"arguments\":${args}}}" > "$TMP.req"
  post </dev/null; waitid ${rid} </dev/null
done < "$REQ"
exit 0
