# Die Box bedienen, ohne sich die vier Handgriffe zu merken.
#
#   make image                das Image bauen — einmal, dauert ein paar Minuten
#   make run                  säen, starten, laufen lassen
#   make run GOAL="..."       mit eigener Aufgabe
#   make log                  zusehen, was die Box gerade tut
#   make shell                hinein, wo der Code liegt (/box)
#   make harvest              die jüngste Box ernten und abreißen
#   make boxes                was gerade steht
#   make remote               dasselbe, aber auf der fremden Maschine
#
# `box.js` bleibt der Fahrer; das hier tippt nur, was du sonst tippen würdest.
# Jedes Ziel zeigt seinen Befehl, damit der Weg ohne Makefile offen bleibt.

IMAGE ?= mini-factory-box
GOAL  ?= Implement a FizzBuzz function
ENV   ?= .env.openrouter

.DEFAULT_GOAL := help
.PHONY: help image run log shell harvest boxes remote

help:
	@sed -n '2,10p' $(MAKEFILE_LIST) | sed 's/^# \{0,1\}//'

image:
	docker build -t $(IMAGE) .

# Die Credentials kommen aus $(ENV), wenn es sie gibt. Ohne sie startet die Box
# trotzdem und die Agent-Phasen sterben drin — genau das ist der erste Beat des
# Kurses, also wird hier nicht abgebrochen, sondern gesagt, was fehlt.
run:
	@if [ -f "$(ENV)" ]; then \
	  echo "  Credentials aus $(ENV)"; \
	else \
	  echo "  kein $(ENV) — die Box startet, die Agent-Phasen sterben drin."; \
	  echo "  cp env.openrouter.example $(ENV) und den Key eintragen."; \
	fi
	@set -a; [ -f "$(ENV)" ] && . ./$(ENV); set +a; \
	 node box.js start "$(GOAL)"

# Ohne Argument die jüngste: die Namen sind box-<timestamp>, also sortiert die
# jüngste nach oben. BOX=box-... nimmt eine bestimmte.
#
# Exit 2 heißt „läuft noch" und ist kein Fehler — man ruft das Ziel absichtlich
# mehrfach auf, und ein rotes make bei jedem Blick auf den Fortschritt sieht aus,
# als wäre etwas kaputt. Alles andere reicht box.js durch.
harvest:
	@box="$(BOX)"; \
	 [ -n "$$box" ] || box="$$(node box.js list | awk 'NR>1 {print $$1}' | sort -r | head -1)"; \
	 [ -n "$$box" ] || { echo "  keine Box da — erst make run"; exit 1; }; \
	 echo "  ernte $$box"; \
	 node box.js harvest "$$box"; rc=$$?; \
	 [ $$rc -eq 2 ] && { echo "  noch nicht fertig — gleich nochmal: make harvest"; exit 0; }; \
	 exit $$rc

# `docker exec -d` gibt sofort zurück und schreibt nach /tmp/run.log in der Box —
# darum steht nach `make run` nichts auf dem Schirm. Genau das ist der Punkt von
# Stück 13: anwerfen, Laptop zu. Zusehen will man trotzdem manchmal.
log:
	@box="$(BOX)"; \
	 [ -n "$$box" ] || box="$$(node box.js list | awk 'NR>1 {print $$1}' | sort -r | head -1)"; \
	 [ -n "$$box" ] || { echo "  keine Box da — erst make run"; exit 1; }; \
	 docker exec "$$box" tail -f /tmp/run.log

# Der Code liegt in /box, nicht hier: die Box hat ihn aus dem Seed-Bundle
# geklont. Nach Hause kommt er erst beim Ernten, als Branch factory/<zeit>.
shell:
	@box="$(BOX)"; \
	 [ -n "$$box" ] || box="$$(node box.js list | awk 'NR>1 {print $$1}' | sort -r | head -1)"; \
	 [ -n "$$box" ] || { echo "  keine Box da — erst make run"; exit 1; }; \
	 docker exec -it "$$box" sh -c 'cd /box && exec sh'

boxes:
	@node box.js list

# Stück 13 ist eine Zeile in einer Datei: DOCKER_HOST zeigt woandershin, und
# derselbe Fahrer fährt dieselbe Box auf einem Rechner, der dir nicht gehört.
remote:
	@[ -f .env.remote ] || { \
	  echo "  kein .env.remote — cp env.remote.example .env.remote und DOCKER_HOST eintragen."; exit 1; }
	@set -a; . ./.env.remote; [ -f "$(ENV)" ] && . ./$(ENV); set +a; \
	 echo "  Host: $$DOCKER_HOST"; \
	 node box.js start "$(GOAL)"
