#!/bin/zsh
# Tic quotidiano dal Mac: prova tutti gli agenti, ognuno decide dal pannello se lavorare oggi.
DIR="$(cd "$(dirname "$0")/.." && pwd)"
for a in scout-eventi scout-esperienze scrivi-articolo traduci-inglese controllo-seo; do
  "$DIR/agents/esegui-agente.sh" "$a"
done
