#!/bin/zsh
# Esegue un agente di Cose Fighe dal Mac con Claude Code (abbonamento), senza interazione.
# Uso: agents/esegui-agente.sh scout-eventi   (oppure scout-esperienze, scrivi-articolo, controllo-seo)
set -u
AGENT="${1:?nome agente}"
MANUALE="${2:-}"   # passa "manuale" per saltare il controllo di cadenza e giorno
DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG="$DIR/agents/log"
mkdir -p "$LOG"
cd "$DIR"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
# Le chiavi stanno in .env (mai stampate).
set -a; source "$DIR/.env"; set +a
PROMPT="Sei l'agente \"$AGENT\" di Cose Fighe. Lavori in questo repository sul Mac del proprietario. Le chiavi sono già nelle variabili d'ambiente (VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY, GYG_PARTNER_ID, VIATOR_PID, VIATOR_API_KEY): non stamparle mai. Leggi e segui alla lettera il file .claude/commands/$AGENT.md, compreso il punto 0 (il cancello: interruttore generale, agente attivo, cadenza e giorno, ultima esecuzione). Se il cancello dice di fermarti, fermati e scrivi una riga.${MANUALE:+ ATTENZIONE: questa esecuzione è stata lanciata a mano da una persona: rispetta solo l'interruttore generale e quello dell'agente, ignora cadenza, giorno e ultima esecuzione.} Rispondi in italiano con un riepilogo finale."
STAMP="$(date +%Y-%m-%d_%H%M)"
echo "[$STAMP] avvio $AGENT" >> "$LOG/$AGENT.log"
claude -p "$PROMPT" --model claude-sonnet-5 --allowedTools "Bash,Read,Write,Edit,Glob,Grep,WebFetch,WebSearch" --max-turns 200 < /dev/null >> "$LOG/$AGENT.log" 2>&1
echo "[$STAMP] fine $AGENT (exit $?)" >> "$LOG/$AGENT.log"
