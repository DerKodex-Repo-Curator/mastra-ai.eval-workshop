# Scorer Workshop

A demonstration project showcasing different types of scorers for evaluating AI agent performance using the Mastra framework. This workshop focuses on two key evaluation approaches: deterministic scoring and LLM-based scoring.

## Overview

This project demonstrates how to build and use different types of scorers to evaluate AI agent responses, particularly in the context of news-related tasks. The workshop includes agents that can fetch news headlines and articles, with built-in evaluation mechanisms to ensure quality and accuracy.

## Features

### 🤖 AI Agents

- **News Agent**: A comprehensive agent that can fetch top headlines and articles, with built-in scorers for evaluation
- **Headline Agent**: Specialized agent for headline-related tasks
- **Article Agent**: Specialized agent for article fetching and processing

### 🛠️ Tools

- **getTopHeadlines**: Fetches top news headlines from various sources
- **fetchArticle**: Extracts and processes full article content from URLs using Mozilla's Readability

### 📊 Scorers

#### 1. Source Citation Scorer (Deterministic)
A rule-based scorer that ensures the agent's response follows the system prompt by always including citations to sources when using headline tools.

**How it works:**
- Extracts sources from tool invocation results
- Checks if the assistant's response includes all required source citations
- Returns a binary score (0 or 1) based on citation compliance

#### 2. Tool Hallucination Scorer (LLM-based)
An intelligent scorer that uses an LLM to detect when the agent makes claims not supported by or contradicting the provided context from tool results.

**How it works:**
- Extracts all statements from the agent's response
- Compares each statement against the context from tool results
- Uses GPT-4o to determine if statements are supported by the context
- Returns a score based on the ratio of supported vs. unsupported statements

## Project Structure

```
src/mastra/
├── agents/           # AI agent definitions
├── scorers/          # Evaluation scorers
│   ├── source-citation-scorer.ts
│   └── tool-hallucination-scorer.ts
├── tools/            # Available tools for agents
│   └── fetch-article.ts
├── workflows/        # Workflow definitions
└── index.ts         # Main Mastra configuration
```

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- pnpm package manager
- OpenAI API key
- News API key from newsapi.org

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

And add you API keys

### Running the Project

#### Development Mode
```bash
pnpm dev
```

Navigate to the newsAgent and ask for the latest headlines for a category (tech, health, etc.) then follow up by asking a summary for a specific article.

Check out your scores in the `Scorers` section in the side nav bar.

Check out the new observability traces in the `Observability` section in the side nav bar.

#### Run Tests
```bash
pnpm test
```

## Running Experiments

The project uses the `runExperiment` utility from Mastra to systematically test your agents against multiple inputs and evaluate their performance using the configured scorers.


### Running Tests

Execute the included test suite to see the scorers in action:

```bash
pnpm test
```

This will run the experiment tests that validate:
- Source citation compliance across different news categories
- Individual scoring for each test case
- Average performance metrics

### Understanding Results

The `runExperiment` function returns:
- **Aggregate scores**: Average performance across all test cases
- **Individual results**: Per-input scoring details

Check the test output to see how your agent performs on different types of news queries and whether it properly cites sources.# eval-workshop
