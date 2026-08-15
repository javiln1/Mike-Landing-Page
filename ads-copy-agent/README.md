# Ads Copy Agent

A production-ready Claude Agent SDK application that generates high-converting video ad scripts for your clients.

## Features

- **VSL Scripts** - Long-form video sales letters
- **Facebook/Instagram Ads** - Short-form social media scripts
- **YouTube Pre-roll** - Skippable ad scripts optimized for the 5-second rule
- **UGC Scripts** - Authentic user-generated content style scripts
- **Hook Generator** - Generate 10 hook variations per brief
- **Competitor Analysis** - Analyze and extract patterns from competitor ads
- **Script Optimization** - Improve existing scripts for higher conversion

## Quick Start

### 1. Prerequisites

- **Python 3.10+** (required by the SDK)
- Claude Code CLI installed

```bash
# Check your Python version
python3 --version  # Must be 3.10 or higher

# If needed, install Python 3.10+ via Homebrew (macOS)
brew install python@3.12

# Install Claude Code CLI
curl -fsSL https://claude.ai/install.sh | bash
```

### 2. Setup

```bash
cd ads-copy-agent

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure API key
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### 3. Run

```bash
python main.py
```

## Usage

The agent runs interactively. Just describe what you need:

```
📝 You: Create a Facebook ad script for a weight loss coaching program targeting women 35-55

🤖 Agent: I'd be happy to create a Facebook ad script. First, let me ask a few questions...
```

### Commands

- `exit` - End the session
- `new` - Start a fresh conversation (clears context)
- `save` - Save the last script to a file

### Subagents

The agent has specialized subagents you can invoke:

```
📝 You: Use the hook-generator to create hooks for a SaaS product

📝 You: Use the competitor-analyzer to analyze this ad: [URL]

📝 You: Use the script-optimizer to improve my script
```

## Project Structure

```
ads-copy-agent/
├── main.py              # Main application
├── requirements.txt     # Python dependencies
├── .env.example        # Environment template
├── .gitignore          # Git ignore rules
├── README.md           # This file
└── output/
    └── scripts/        # Generated scripts saved here
```

## Configuration

### System Prompt

Edit `SYSTEM_PROMPT` in `main.py` to customize the agent's persona, expertise, and output format.

### Custom Tools

Add more tools using the `@tool` decorator:

```python
@tool("tool_name", "description", {"param": str})
async def my_tool(args: dict) -> dict:
    # Tool implementation
    return {"content": [{"type": "text", "text": "Result"}]}
```

### Subagents

Add specialized subagents in the `SUBAGENTS` dictionary:

```python
"agent-name": AgentDefinition(
    description="When to use this agent",
    prompt="System prompt for this agent",
    tools=["Read", "WebSearch"],
    model="sonnet"
)
```

## API Reference

### `run_interactive_session()`
Starts an interactive chat session with the agent.

### `run_single_query(prompt: str)`
Run a single query and return the result (for automation).

```python
from main import run_single_query
import asyncio

result = asyncio.run(run_single_query("Create a hook for a fitness app"))
print(result)
```

## Resources

- [Claude Code SDK Docs](https://platform.claude.com/docs/en/agent-sdk/overview)
- [Python SDK Reference](https://platform.claude.com/docs/en/agent-sdk/python)
- [Get API Key](https://console.anthropic.com/)
