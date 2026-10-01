SHELL := /bin/sh

PORT ?= 3000

.DEFAULT_GOAL := help

.PHONY: help install dev build start lint format format-check typecheck check

help: ## Show available commands
	@awk 'BEGIN {FS = ":.*## "; printf "Usage: make \033[36m<target>\033[0m\n\n"} /^[a-zA-Z_-]+:.*## / {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install exact dependencies from package-lock.json
	npm ci

dev: ## Start the development server (PORT=3000)
	npm run dev -- --port $(PORT)

build: ## Create a production build
	npm run build

start: ## Start the production server (PORT=3000)
	npm run start -- --port $(PORT)

lint: ## Run ESLint
	npm run lint

format: ## Format source files with Prettier
	npm run format

format-check: ## Check source formatting with Prettier
	npm run format:check

typecheck: ## Run TypeScript without emitting files
	npm run typecheck

check: lint format-check typecheck build ## Run all validation checks
