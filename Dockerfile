FROM node:24.16.0-bookworm-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends git ca-certificates \
 && rm -rf /var/lib/apt/lists/*

ARG CLAUDE_CODE_VERSION=2.1.250
RUN npm install -g "@anthropic-ai/claude-code@${CLAUDE_CODE_VERSION}" \
 && npm cache clean --force

RUN useradd --create-home box && install -d -o box -g box /box

USER box
WORKDIR /box

ENV GIT_AUTHOR_NAME=mini-factory \
    GIT_AUTHOR_EMAIL=factory@box.local \
    GIT_COMMITTER_NAME=mini-factory \
    GIT_COMMITTER_EMAIL=factory@box.local

CMD ["sleep", "infinity"]
