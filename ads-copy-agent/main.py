"""
Ads Copy Agent - Production-Ready Ad Script Generator
=====================================================

A Claude Agent SDK application that generates video ad scripts,
sales copy, and marketing content for clients.

Usage:
    python main.py

Requirements:
    - ANTHROPIC_API_KEY environment variable
    - Claude Code CLI installed (curl -fsSL https://claude.ai/install.sh | bash)
"""

import asyncio
import os
import sys
import json
from datetime import datetime
from typing import Any
from dotenv import load_dotenv

# Base path for client data
NEXUS_PATH = "/Users/javilopez/Downloads/Nexus"
CLIENTS_PATH = f"{NEXUS_PATH}/clients"
SCRIPTS_DB_PATH = f"{NEXUS_PATH}/scripts-database"

# Check Python version first
if sys.version_info < (3, 10):
    print(f"\n⚠️  Python 3.10+ is required!")
    print(f"Current version: Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
    print("\nInstall Python 3.10+ using:")
    print("  brew install python@3.12  # macOS")
    print("  apt install python3.12    # Ubuntu/Debian")
    sys.exit(1)

from claude_agent_sdk import (
    ClaudeSDKClient,
    ClaudeAgentOptions,
    AgentDefinition,
    AssistantMessage,
    TextBlock,
    ResultMessage,
    tool,
    create_sdk_mcp_server,
)

# Load environment variables
load_dotenv()

# ============================================================================
# SYSTEM PROMPT - The brain of your ad script agent
# ============================================================================

SYSTEM_PROMPT = """You are a direct-response ad script specialist trained in Jeremy Haynes' methodology from Megalodon Marketing.

## YOUR CAPABILITIES
You have access to powerful tools to create, manage, and optimize ad campaigns:

### CLIENT MANAGEMENT
- `manage_client` - Save/load client profiles (stored in /Users/javilopez/Downloads/Nexus/clients/)
- `create_brief` - Create structured creative briefs
- Start sessions with "Load client: [name]" to pull up saved profiles

### SCRIPT CREATION
- `get_ad_template` - Get proven script structures
- `get_winning_script_examples` - Reference winning scripts
- `get_hook_formulas` - 70+ proven hook formulas
- `get_niche_angles` - Niche-specific angles (coaching, ecommerce, saas, fitness, finance, realestate)
- `get_voice_profile` - Brand voice guidelines (professional, casual, edgy, inspirational, direct)

### PLATFORM OPTIMIZATION
- `get_platform_guide` - Platform-specific best practices (TikTok, Facebook, YouTube, Instagram, LinkedIn)

### QUALITY & COMPLIANCE
- `score_script` - Score scripts on hook strength, specificity, proof, CTA clarity
- `compliance-checker` subagent - Check for policy violations before running ads

### SCRIPT DATABASE
- `manage_script_db` - Add winning scripts, search by niche/angle/platform
- `log_performance` - Track what's working (CTR, CPA, ROAS)

### CONTENT STRATEGY
- `get_warming_content_ideas` - Tornado Strategy content
- `content-strategist` subagent - Plan warming + DR campaigns
- `trends-researcher` subagent - Current trends and opportunities

### PRODUCTION
- `storyboard-creator` subagent - Visual shot-by-shot breakdowns
- `dynamic-tester` subagent - Create A/B test variations

## WORKFLOW
1. **Load or Create Client Profile** - Use `manage_client` to load existing or create new
2. **Gather Brief** - Use `create_brief` if info is missing
3. **Research** - Get platform guide, niche angles, voice profile
4. **Create Scripts** - Use templates and references
5. **Score & Check Compliance** - Before finalizing
6. **Save Winning Scripts** - Add to database with performance data

## YOUR ROLE
You create high-converting video ad scripts for coaching, consulting, and high-ticket offers. Before writing ANY script, you MUST ask about:
- **Client/Brand**: Who is the business? What's their voice/tone?
- **Offer**: What exactly are they selling? Price point?
- **Avatar**: Who is the target customer? Demographics, pain points, desires?
- **Proof**: What results/testimonials/case studies do they have?
- **Platform**: Where will this ad run? (Facebook, YouTube, TikTok, etc.)

## PROVEN 4-PART SCRIPT STRUCTURE
Based on winning scripts, ALWAYS use this exact structure:

```
### HOOK (0:00 - 0:10)
Pattern interrupt that speaks directly to their pain. Short, punchy sentences.
Make them feel SEEN. Reference seasonal triggers, life comparisons, or bold statements.

### BRIDGE (0:10 - 0:22)
Transition from pain to possibility. Introduce a specific student transformation.
"But what if I told you there's a way out?" or "This is exactly where [Student] was..."

### BODY (0:22 - 0:48)
The proof and mechanism. Tell the student's specific story:
- Where they started (relatable situation)
- What they did (the system/method)
- The specific result (exact numbers, timeframe)

### CTA (0:48 - 1:00)
"If you're ready to [desired transformation], I've put together a free training
that shows you the exact [X]-step system [Student] used.
Click below and I'll see you on the next page."
```

## PROOF POINT COLLECTION (Ask for these!)
Before writing scripts, gather the client's BEST proof points:
- **Student/Client Name**: Real name adds credibility
- **Starting Point**: Where they were (relatable situation)
- **Transformation**: What changed (specific numbers, timeframe)
- **Location**: Adds specificity and relatability
- **Unique Angle**: What makes their story compelling?

Example format: "[NAME] went from [BEFORE STATE] to [AFTER STATE] in [TIMEFRAME]. [Location]. [Relatable detail]."

## SCRIPT METADATA FORMAT
Each script should include:
- **Script Number**: For tracking
- **Angle**: (e.g., "Job Frustration", "Financial Freedom", "Golden Handcuffs")
- **Cognitive Bias**: (e.g., "Social Proof", "Loss Aversion", "Sunk Cost")
- **Target Audience**: (e.g., "Corporate Workers", "Trade Workers", "Commission-Based")
- **Length**: Target ~60 seconds
- **Variation**: A, B, or C (for A/B testing)

## THE TORNADO STRATEGY CONTEXT
You understand that ads exist within a larger ecosystem. The Tornado Strategy uses CONTENT to warm up audiences before direct response ads hit them.

**The Problem**: Paid leads are "cold" because they haven't consumed content before talking to sales. Organic leads are "warm" because they've consumed countless pieces of content first.

**The Solution**: Hit prospects with 5-12+ pieces of content per week WHILE running direct response ads. This replicates the organic experience at scale.

**Two Content Types**:
1. **WARMING CONTENT** - Builds familiarity, trust, handles objections passively (Reels, TikToks, short videos)
2. **DIRECT RESPONSE ADS** - Asks for the action (book call, buy, opt-in)

**Content Goals** (for warming content):
- Establish familiarity bias ("I feel like I know this person")
- Overcome objections before they arise
- Reduce the sales cycle timeline
- Plant the right beliefs about company/product/service
- Build massive warm retargeting audiences

**The "Cashier" Goal**: Make leads SO warm that salespeople become cashiers, not closers. Leads should arrive educated, trusting, and ready to buy.

## CORE FRAMEWORK: Hook → Reasons → CTA
Every ad follows this 3-step structure:
1. **HOOK** (First 5 seconds) - Pattern interrupt that stops the scroll. This is EVERYTHING.
2. **REASONS** (Middle section) - Why they should care, believe, and act NOW
3. **CTA** (End) - Clear, specific action with urgency

## AUDIENCE TARGETING PHILOSOPHY
You write for TWO distinct audiences:

**IN-MARKET (3-4% of audience)**
- Already searching for a solution
- High intent, ready to buy
- Hook with: specific solution, speed, ease
- Example: "Looking for a [solution]? Here's the fastest way to [result]..."

**NEEDS-CONVINCED (30% of audience)**
- Has the problem but hasn't decided to solve it yet
- Needs education and pain agitation
- Hook with: pain points, consequences of inaction, "what if"
- Example: "Still struggling with [problem]? Here's why it's getting worse..."

## AD LENGTH SWEET SPOT
- **Optimal**: 30-60 seconds
- Under 30s = not enough time to build trust
- Over 90s = losing attention
- First 5 seconds determine if they watch the rest

## TRUST ALGORITHM
The reason people don't buy: LACK OF TRUST. Build it through:
1. Specificity (exact numbers, timeframes, names)
2. Proof (testimonials, case studies, demonstrations)
3. Authority (credentials, experience, results)
4. Relatability (show you understand their situation)

## HOOK TYPES (Use from Jeremy's Swipe File)
- **Who Else Wants**: "Who else wants [desirable outcome]?"
- **Secret/Hidden**: "The secret of [topic] that [experts] don't tell you"
- **Method That Helps**: "Here's a method that's helping [audience] to [result]"
- **Little Known**: "Little known ways to [achieve goal]"
- **Get Rid Of**: "Get rid of [problem] once and for all"
- **Quick Way**: "Here's a quick way to [solve problem]"
- **Now You Can**: "Now you can have [desire] without [obstacle]"
- **Like [Authority]**: "[Do something] like [world-class example]"
- **Mistakes**: "Are you making these [number] mistakes in [topic]?"
- **Shocking Truth**: "The surprising truth about [topic]"
- **Contrarian**: "Forget [common belief], here's what actually works"
- **Specific Result**: "[Exact result] in [timeframe] - here's how"

## AD FORMATS YOU CREATE

**TALKING HEAD AD**
- Direct to camera, personal connection
- Best for: coaches, consultants, personal brands
- Structure: Hook → Personal story/credibility → Proof → CTA

**CASE STUDY AD**
- Focus on one client's transformation
- Best for: showing specific results
- Structure: Hook with result → Before state → Process → After state → CTA

**Q&A / INTERVIEW STYLE**
- Interviewer asks questions, expert answers
- Best for: complex offers, building authority
- Structure: Hook question → Expert answer → Deeper question → Proof → CTA

**TESTIMONIAL MASHUP**
- Multiple short testimonials edited together
- Best for: social proof stacking
- Structure: Hook testimonial → 3-5 supporting clips → CTA

**DEMONSTRATION AD**
- Show the product/process in action
- Best for: physical products, software, processes
- Structure: Hook with end result → Show process → Address objections → CTA

**UGC STYLE**
- Looks organic, shot on phone
- Best for: younger audiences, TikTok/Reels
- Structure: Casual hook → Quick story → Result → Soft CTA

## OUTPUT FORMAT
Always deliver scripts in this exact format:

```
---
**Script #[Number]** | **Variation [A/B/C]**
**Angle**: [Primary angle]
**Cognitive Bias**: [Psychology trigger]
**Target Audience**: [Specific segment]
**Length**: ~60 seconds
---

### HOOK (0:00 - 0:10)
[Pattern interrupt - short, punchy sentences that speak to their pain]
"Script text here..."

### BRIDGE (0:10 - 0:22)
[Transition to hope - introduce the student/client or solution]
"Script text here..."

### BODY (0:22 - 0:48)
[Proof - specific transformation story with numbers]
"Script text here..."

### CTA (0:48 - 1:00)
[Clear action with specific next step]
"If you're ready to [transformation], [describe the free resource/next step].
Click below and [what happens next]."
```

Include:
- Speaker notes in (parentheses)
- B-roll suggestions in [brackets]
- Exact timestamps as shown

**CTA Formula**: "If you're ready to [DESIRED OUTCOME], I've put together [LEAD MAGNET/NEXT STEP] that shows you [SPECIFIC BENEFIT]. Click below and [BRIDGE TO NEXT PAGE]."

## DYNAMIC TESTING APPROACH
When asked, provide MULTIPLE variations:
- 3-5 different hooks for testing
- Different angles (pain vs aspiration, logic vs emotion)
- Different lengths (15s, 30s, 60s versions)

## WHAT TO ASK BEFORE WRITING
Never guess. Always clarify:
1. **Offer**: What exactly are they selling? Price point?
2. **Audience**: In-market or needs-convinced? Demographics?
3. **Platform**: Facebook, YouTube, TikTok? (affects hook style)
4. **Proof**: What results/testimonials do they have?
5. **Angle**: What's the unique mechanism or differentiator?
6. **Format**: Talking head, UGC, case study, etc.?

## YOUR VOICE
- Direct and confident, not salesy
- Specific numbers > vague claims
- Show, don't tell
- Every word earns its place
- Write like you're talking to ONE person
"""

# ============================================================================
# CUSTOM TOOLS - Extend agent capabilities
# ============================================================================

@tool(
    "save_script",
    "Save a completed ad script to a file for the client",
    {"filename": str, "content": str, "script_type": str}
)
async def save_script(args: dict[str, Any]) -> dict[str, Any]:
    """Save generated scripts to output files."""
    filename = args["filename"]
    content = args["content"]
    script_type = args["script_type"]

    # Ensure output directory exists
    output_dir = "output/scripts"
    os.makedirs(output_dir, exist_ok=True)

    filepath = f"{output_dir}/{filename}"
    with open(filepath, "w") as f:
        f.write(f"# {script_type.upper()} AD SCRIPT\n")
        f.write(f"# Generated by Ads Copy Agent\n")
        f.write("=" * 50 + "\n\n")
        f.write(content)

    return {
        "content": [{
            "type": "text",
            "text": f"✅ Script saved to: {filepath}"
        }]
    }


@tool(
    "get_warming_content_ideas",
    "Get content ideas for the Tornado Strategy - content that warms up cold audiences before direct response ads",
    {"content_type": str, "niche": str}
)
async def get_warming_content_ideas(args: dict[str, Any]) -> dict[str, Any]:
    """Return warming content ideas based on the Tornado Strategy."""

    content_types = {
        "objection_handling": """
# OBJECTION HANDLING CONTENT (Tornado Strategy)
Purpose: Address objections BEFORE they come up in sales conversations

## Content Ideas for "{niche}":

1. **"The Truth About [Common Objection]"**
   - Address the #1 reason people don't buy
   - Show why that objection doesn't apply here
   - Use case study as proof

2. **"Why [Competitor Approach] Doesn't Work"**
   - Compare your method vs alternatives
   - Not trash-talking, just education
   - Position your unique mechanism

3. **"Is [Your Offer] Right For You? (Honest Answer)"**
   - Qualify/disqualify viewers
   - Show who this IS and ISN'T for
   - Builds trust through honesty

4. **"What Happens If You Do Nothing?"**
   - Consequence of inaction content
   - Future-pace the pain
   - Create urgency without being salesy

5. **"[Common Myth] is Keeping You Stuck"**
   - Bust myths in your industry
   - Reframe their thinking
   - Position your solution as the answer

Format: 30-90 second Reels/TikToks, talking head or B-roll with voiceover
""",

        "authority_building": """
# AUTHORITY BUILDING CONTENT (Tornado Strategy)
Purpose: Establish credibility so they trust you when direct response ads hit

## Content Ideas for "{niche}":

1. **Behind-the-Scenes Content**
   - Show your process working
   - Client calls (with permission)
   - Day-in-the-life of results happening

2. **Micro Case Studies**
   - 60-second client transformation stories
   - Specific numbers and timeframes
   - Before/after with context

3. **Hot Takes / Industry Commentary**
   - Your opinion on trends
   - What most people get wrong
   - Contrarian but backed by experience

4. **Teaching Moments**
   - Share ONE tactical tip
   - Quick win they can implement
   - Positions you as the expert

5. **Proof Compilation**
   - Screenshots of results
   - DMs from happy clients
   - Before/afters with narration

Format: Mix of talking head, screen recordings, and B-roll compilations
""",

        "relatability": """
# RELATABILITY CONTENT (Tornado Strategy)
Purpose: Make them feel "this person understands me"

## Content Ideas for "{niche}":

1. **"I Used to Think [Wrong Belief] Too..."**
   - Share your journey
   - Mistakes you made
   - What changed your mind

2. **"The Moment I Realized [Key Insight]"**
   - Specific story/turning point
   - Emotional connection
   - Lesson learned

3. **"What Nobody Tells You About [Topic]"**
   - Insider perspective
   - Raw, honest take
   - Builds "this person gets it" feeling

4. **"Unpopular Opinion: [Contrarian Take]"**
   - Challenge conventional wisdom
   - Back it up with your experience
   - Attracts your ideal audience, repels wrong fit

5. **Day-in-the-Life / Process Content**
   - Show what you actually do
   - Humanize the brand
   - Let them see behind the curtain

Format: Casual, authentic, phone-quality often works better than polished
""",

        "value_bombs": """
# VALUE BOMB CONTENT (Tornado Strategy)
Purpose: Deliver so much value they think "if the free stuff is this good..."

## Content Ideas for "{niche}":

1. **"How to [Achieve Quick Win] in [Timeframe]"**
   - One specific, actionable tip
   - Something they can do TODAY
   - Results they can see immediately

2. **"The [Number] Step Framework for [Outcome]"**
   - Simple, memorable framework
   - Easy to understand
   - Positions your methodology

3. **"Stop Doing [Common Mistake]. Do This Instead."**
   - Call out a specific mistake
   - Give the fix
   - Quick win content

4. **"Here's Exactly What I'd Do If [Their Situation]"**
   - Put yourself in their shoes
   - Give specific advice
   - Shows you understand their problems

5. **"The [Tool/Tactic/Strategy] That Changed Everything"**
   - Share something specific that works
   - Be generous with information
   - Creates reciprocity

Format: Can be talking head, screen share, whiteboard, demonstration
""",

        "social_proof": """
# SOCIAL PROOF CONTENT (Tornado Strategy)
Purpose: Stack evidence so they believe results are possible for THEM

## Content Ideas for "{niche}":

1. **Client Spotlight Videos**
   - Quick interview or testimonial
   - Specific results with numbers
   - Relatable starting point

2. **Results Reaction Videos**
   - React to client wins
   - Screenshot/DM reveals
   - Authentic excitement

3. **Before/After Compilations**
   - Multiple transformations in one video
   - Quick cuts, high energy
   - Variety of client types

4. **"How [Client Name] Achieved [Result]"**
   - Mini case study format
   - Their situation → what we did → outcome
   - 60-90 seconds

5. **Milestone Celebration Content**
   - "Just hit [X clients/results/milestone]"
   - Genuine gratitude
   - Proof of track record

Format: Mix of UGC testimonials, your commentary, and results screenshots
"""
    }

    content_type = args["content_type"].lower().replace(" ", "_").replace("-", "_")
    niche = args.get("niche", "[your niche]")

    if content_type == "all":
        result = "# ALL WARMING CONTENT TYPES (Tornado Strategy)\n\n"
        for ct, template in content_types.items():
            result += template.replace("{niche}", niche) + "\n\n---\n\n"
        return {"content": [{"type": "text", "text": result}]}

    elif content_type in content_types:
        result = content_types[content_type].replace("{niche}", niche)
        return {"content": [{"type": "text", "text": result}]}

    else:
        available = ", ".join(content_types.keys())
        return {
            "content": [{
                "type": "text",
                "text": f"Content type '{content_type}' not found.\n\nAvailable types:\n" +
                       "- objection_handling: Address objections before they arise\n" +
                       "- authority_building: Establish credibility and expertise\n" +
                       "- relatability: Build connection and trust\n" +
                       "- value_bombs: Deliver actionable tips and quick wins\n" +
                       "- social_proof: Stack evidence of results\n" +
                       "- all: Get ALL warming content frameworks"
            }]
        }


@tool(
    "get_hook_formulas",
    "Get proven hook formulas from Jeremy Haynes' swipe file. Filter by category or get all.",
    {"category": str}
)
async def get_hook_formulas(args: dict[str, Any]) -> dict[str, Any]:
    """Return hook formulas from Jeremy Haynes' copywriting swipe file."""

    hook_categories = {
        "curiosity": [
            "Who Else Wants [blank]?",
            "The Secret of [blank]",
            "What Everybody Ought to Know About [blank]",
            "The Surprising Truth About [blank]",
            "The Shocking Truth About [blank]",
            "Little Known Ways to [blank]",
            "The Hidden Benefits of [blank]",
            "[Expert/Celebrity] Secrets for [goal]",
            "Insider Secrets to Beating the Odds and Winning at [blank]",
        ],
        "how_to": [
            "Here is a Method That is Helping [blank] to [blank]",
            "Here's a Quick Way to [solve a problem]",
            "How to [accomplish a goal] Without [common obstacle]",
            "[Do something] like [world-class example]",
            "Discover the [number] Proven Techniques for [solving a problem]",
            "The [expert/celebrity] Way to [accomplish a goal]",
            "How to win friends and influence people",
            "How to get your cooking bragged about",
            "How teens are getting rich from their phones",
        ],
        "problem_solution": [
            "Get Rid of [problem] Once and For All",
            "Solve [problem] with [number] Tips",
            "Overcome [obstacle] to [accomplish goal]",
            "Are You Making These [number] Common Mistakes with [topic]?",
            "Avoid [number] [topic] Mistakes",
            "Do you make these mistakes in English?",
        ],
        "transformation": [
            "Now You Can Have [something desirable] [great circumstance]",
            "Have a [or] Build a [blank] You Can Be Proud Of",
            "Unlock the Power of [blank] and Achieve [desired outcome]",
            "Transform Your [aspect of life] in Just [time frame] with [product/service]",
            "Achieve [desired outcome] in [time frame]",
            "Change Your [aspect of life] in [time frame]",
            "Revolutionize Your [blank] with [product/service]",
            "Humans Are Built Not Born",
        ],
        "ultimate_guide": [
            "The Only Guide You'll Ever Need for [blank]",
            "The Ultimate [blank] Guide",
            "The best XYZ for your money",
            "The best XYZ money can buy you",
        ],
        "contrarian": [
            "Forget [common belief], [surprising alternative]",
            "You Don't Have to Be a Runner to Win a Marathon",
            "I Regret to Inform You Expensive Vacuums Are Worth It",
            "It's well known that X (works or doesn't work)",
            "You may not want to buy a new car after reading this",
            "These are the new rules of capitalism",
        ],
        "social_proof": [
            "Why So Many Americans Are Turning To Buddhism",
            "Truckers are furious they didn't know about this GPS tracker",
            "We Did It Again.",
            "If it wasn't that good, we wouldn't make buckets of it",
            "Join [number] others who [achieved result]",
        ],
        "question": [
            "Are you ashamed of the smells in your home?",
            "How do you know when is it time to hire a copywriter?",
            "What Are \"Headlines\" and Why Are They So Important?",
            "Is 500% Growth For Your Roofing Company Too Much?",
            "Is Anthony's The Best Pizza Chain In America?",
        ],
        "specific_result": [
            "Forget Tesla, These Glove Makers Have Rallied More Than 1,000%",
            "[Specific number] in [timeframe] - Here's How",
            "7 gourmet instant coffees that even coffee snobs will love",
            "Daily to do list hack for salespeople",
        ],
        "authority": [
            "It's like Elon Musk designed a bean bag",
            "The Most Valuable Skill Colleges Never Teach",
            "Greatest Bible news in 341 years",
            "Confessions of a poor art collector",
        ],
        "fomo_urgency": [
            "I wish I'd found this iPhone accessory years ago",
            "It's time to take real estate investing seriously",
            "For those seeking an exceptional life",
            "Admit it, you really want X and X can help",
        ],
        "product_specific": [
            "Buy no desk until you've seen this sensation of the business show",
            "Car insurance at low cost--if you are a careful driver",
            "Girls … Want quick curls?",
            "What is reef safe sunscreen? Here's what to look for",
            "iPhone 13: mostly disappointing",
        ]
    }

    category = args["category"].lower().replace(" ", "_").replace("-", "_")

    if category == "all":
        result = "# ALL HOOK FORMULAS (Jeremy Haynes Swipe File)\n\n"
        for cat, hooks in hook_categories.items():
            result += f"## {cat.upper().replace('_', ' ')}\n"
            for i, hook in enumerate(hooks, 1):
                result += f"{i}. {hook}\n"
            result += "\n"
        return {"content": [{"type": "text", "text": result}]}

    elif category in hook_categories:
        result = f"# {category.upper().replace('_', ' ')} HOOKS\n\n"
        for i, hook in enumerate(hook_categories[category], 1):
            result += f"{i}. {hook}\n"
        return {"content": [{"type": "text", "text": result}]}

    else:
        available = ", ".join(hook_categories.keys())
        return {
            "content": [{
                "type": "text",
                "text": f"Category '{category}' not found.\n\nAvailable categories:\n" +
                       "- curiosity: Mystery and intrigue hooks\n" +
                       "- how_to: Educational/method hooks\n" +
                       "- problem_solution: Pain point hooks\n" +
                       "- transformation: Before/after hooks\n" +
                       "- ultimate_guide: Authority/comprehensive hooks\n" +
                       "- contrarian: Challenge common beliefs\n" +
                       "- social_proof: Trend/popularity hooks\n" +
                       "- question: Engaging question hooks\n" +
                       "- specific_result: Number-driven hooks\n" +
                       "- authority: Expert/credibility hooks\n" +
                       "- fomo_urgency: Fear of missing out hooks\n" +
                       "- product_specific: Product-focused hooks\n" +
                       "- all: Get ALL hook formulas"
            }]
        }


@tool(
    "get_winning_script_examples",
    "Get proven winning script examples to use as reference templates. These show ideal structure, voice, and patterns to adapt for any client.",
    {"angle": str}
)
async def get_winning_script_examples(args: dict[str, Any]) -> dict[str, Any]:
    """Return winning script templates as reference examples."""

    scripts = {
        "commute_trap": """
# REFERENCE SCRIPT: THE COMMUTE TRAP
**Use Case**: Seasonal job frustration angle
**Cognitive Bias**: Loss Aversion / Social Comparison
**Best For**: Corporate workers, commuters, Q4 campaigns
**Adapt For**: Any coaching offer targeting 9-5 escapees

---

### HOOK (0:00 - 0:10)
It's that time of year again.
The mornings are getting darker, the commute's getting longer, and you're realizing another year has passed where your friends bought houses, started families, and travelled to other countries...
While you're still wondering if your paycheck will cover rent.

### BRIDGE (0:10 - 0:22)
But here's the thing most people never realize:
The problem isn't your work ethic—it's that you're trading time for money in a system designed to keep you exactly where you are.
What if there was a way to break out?

### BODY (0:22 - 0:48)
This is exactly what Zane realized.
He was stuck in a corporate job in Toronto, making $1,500 a month, watching everyone else get ahead.
Then he discovered remote sales—a skill that pays you based on results, not hours.
Within 90 days, Zane went from $1,500 to $9,000 a month, working from his laptop.
No commute. No boss. No ceiling.

### CTA (0:48 - 1:00)
If you're ready to stop watching from the sidelines while others build the life you want, I've put together a free training that shows you the exact 3-step system Zane used.
Click below and I'll see you on the next page.
""",

        "hard_work_lie": """
# REFERENCE SCRIPT: THE HARD WORK LIE
**Use Case**: Effort vs Results disconnect angle
**Cognitive Bias**: Sunk Cost / Effort Justification
**Best For**: Hard workers feeling stuck, trades, corporate grinders
**Adapt For**: Any offer targeting people who work hard but aren't getting ahead

---

### HOOK (0:00 - 0:10)
You've been lied to your whole life.
"Work hard and you'll get ahead."
But here's the truth no one tells you: The hardest workers rarely make the most money.
They just make the most... tired.

### BRIDGE (0:10 - 0:22)
I'm not saying hard work doesn't matter.
But if effort alone created wealth, construction workers would be millionaires and trust fund kids would be broke.
The difference isn't how hard you work—it's WHAT you work on.

### BODY (0:22 - 0:48)
Sam was laying bricks in the UK, working 60-hour weeks for £3,000 a month.
He was the hardest worker on every site.
But hard work wasn't getting him ahead—it was just getting him sore.
Then he learned a high-income skill: remote sales.
Within 4 months, Sam went from breaking his back for £3K to making £6,000 a month from his laptop.
Same work ethic. Completely different vehicle.

### CTA (0:48 - 1:00)
If you're tired of working hard for someone else's dream, I've put together a free training that shows you how Sam made the switch.
Click below and I'll see you on the next page.
""",

        "golden_handcuffs": """
# REFERENCE SCRIPT: THE GOLDEN HANDCUFFS
**Use Case**: Trapped by "good" job angle
**Cognitive Bias**: Loss Aversion / Status Quo
**Best For**: Well-paid but miserable professionals
**Adapt For**: Any premium offer targeting successful but unfulfilled people

---

### HOOK (0:00 - 0:10)
You make good money.
Better than most people you know.
So why does it feel like you're still trapped?
That's the golden handcuffs—and most people never escape them.

### BRIDGE (0:10 - 0:22)
Here's what no one tells you about "good" jobs:
They pay you just enough to keep you comfortable, but never enough to actually be free.
You're not building wealth—you're renting a lifestyle that disappears the moment you stop showing up.

### BODY (0:22 - 0:48)
Louis was making "decent" money in a UK call centre—£24K a year.
Not terrible. Not great. Just... stuck.
He could survive, but he couldn't escape.
Then he learned remote sales and everything changed.
Within 60 days, Louis closed his first deal.
Now he makes £4K a week—more than his old annual salary every single month.
Same Louis. Different game.

### CTA (0:48 - 1:00)
If you're ready to stop being comfortable and start being free, I've put together a free training that shows you the exact path Louis took.
Click below and I'll see you on the next page.
""",

        "introvert_closer": """
# REFERENCE SCRIPT: THE INTROVERT CLOSER
**Use Case**: "It's not what you think" angle
**Cognitive Bias**: Identity Challenge / Reframing
**Best For**: People with preconceptions about the offer
**Adapt For**: Any offer that challenges common beliefs about who can succeed

---

### HOOK (0:00 - 0:10)
"I could never do sales—I'm too introverted."
That's exactly what I used to think.
Turns out, the best closers aren't loud, pushy, or extroverted.
They're the ones who actually listen.

### BRIDGE (0:10 - 0:22)
Here's what most people don't understand about high-ticket sales:
It's not about convincing people to buy things they don't want.
It's about asking the right questions and letting them convince themselves.
Introverts are actually built for this.

### BODY (0:22 - 0:48)
Zane considered himself an introvert.
Hated networking. Hated small talk. Hated the idea of "selling."
But when he learned script-based remote sales, everything clicked.
He wasn't cold calling strangers or pitching products.
He was having real conversations with people who already wanted help.
Within 90 days, this "introvert" was making $9,000 a month.
No personality change required.

### CTA (0:48 - 1:00)
If you've ever thought sales isn't for you because you're not "that type," I've put together a free training that shows you why that's actually your biggest advantage.
Click below and I'll see you on the next page.
""",

        "60_day_path": """
# REFERENCE SCRIPT: THE SPEED TO RESULTS
**Use Case**: Fast transformation timeline angle
**Cognitive Bias**: Specificity / Achievability
**Best For**: People who want fast, predictable results
**Adapt For**: Any offer with a clear timeline to first result

---

### HOOK (0:00 - 0:10)
60 to 80 days.
That's how long it takes to go from complete beginner to closing your first high-ticket deal—if you know what you're doing.
Most people spend years trying to figure it out alone.
They don't have to.

### BRIDGE (0:10 - 0:22)
I've watched hundreds of people make this transition.
The ones who succeed don't have special talents or connections.
They just follow a proven path instead of wandering in the dark.
It really is that simple.

### BODY (0:22 - 0:48)
Louis started with zero sales experience.
No fancy degree. No industry connections. Just a willingness to learn.
He followed the system step by step:
Week 1-2: Learned the fundamentals.
Week 3-6: Practiced on live calls.
Day 60: Closed his first deal.
Now he's making £4K a week.
Not because he's special—because he had a roadmap.

### CTA (0:48 - 1:00)
If you're ready to stop guessing and start following a proven path, I've put together a free training that shows you exactly how Louis did it.
Click below and I'll see you on the next page.
""",

        "script_based_system": """
# REFERENCE SCRIPT: THE PROVEN SYSTEM
**Use Case**: Remove the guesswork angle
**Cognitive Bias**: Certainty / Simplicity
**Best For**: People who need structure, fear of unknown
**Adapt For**: Any offer with a step-by-step system or methodology

---

### HOOK (0:00 - 0:10)
What if you never had to wonder what to say on a sales call?
What if every question, every response, every objection had a proven answer—and you just followed the script?
That's not a fantasy. It's how the top closers actually work.

### BRIDGE (0:10 - 0:22)
Here's what nobody tells you about high-ticket sales:
The best closers aren't winging it.
They're not naturally gifted smooth talkers.
They're following battle-tested scripts that have generated millions.
And you can learn them too.

### BODY (0:22 - 0:48)
When Sam started, he was terrified of sales calls.
Didn't know what to say. Didn't know how to handle objections.
But then he got access to proven scripts—word-for-word frameworks that remove all the guesswork.
He didn't have to be creative. He just had to follow the process.
Within 4 months, this former brick layer was making £6,000 a month from his laptop.
Same Sam. Just better tools.

### CTA (0:48 - 1:00)
If you're tired of guessing and ready for a system that actually works, I've put together a free training that shows you the exact scripts our top closers use.
Click below and I'll see you on the next page.
"""
    }

    angle = args["angle"].lower().replace(" ", "_").replace("-", "_")

    if angle == "all":
        result = "# WINNING SCRIPT REFERENCE EXAMPLES\n\n"
        result += "These are proven scripts to use as templates. Adapt the structure, voice, and patterns for your client.\n\n"
        for name, script in scripts.items():
            result += script + "\n\n" + "=" * 60 + "\n\n"
        return {"content": [{"type": "text", "text": result}]}

    elif angle in scripts:
        return {"content": [{"type": "text", "text": scripts[angle]}]}

    else:
        return {
            "content": [{
                "type": "text",
                "text": f"Script angle '{angle}' not found.\n\nAvailable reference scripts:\n\n" +
                       "- commute_trap: Seasonal frustration angle (comparing to peers)\n" +
                       "- hard_work_lie: Effort vs results disconnect angle\n" +
                       "- golden_handcuffs: Trapped by 'good' situation angle\n" +
                       "- introvert_closer: 'It's not what you think' reframing angle\n" +
                       "- 60_day_path: Speed to results angle (specific timeline)\n" +
                       "- script_based_system: Proven system/methodology angle\n" +
                       "- all: Get ALL reference script templates\n\n" +
                       "💡 TIP: Use these as structural templates, then adapt with YOUR client's:\n" +
                       "- Brand voice and tone\n" +
                       "- Student/client proof points\n" +
                       "- Specific offer and CTA"
            }]
        }


@tool(
    "get_ad_template",
    "Get a proven ad script template based on Jeremy Haynes' methodology",
    {"template_type": str}
)
async def get_ad_template(args: dict[str, Any]) -> dict[str, Any]:
    """Return proven ad script templates based on Jeremy Haynes' framework."""
    templates = {
        "talking_head": """
# TALKING HEAD AD TEMPLATE (Jeremy Haynes Method)
Duration: 30-60 seconds | Best for: Coaches, consultants, personal brands

## HOOK (0:00-0:05) - CRITICAL: Pattern interrupt
(Direct to camera, confident energy)
Choose one approach:
- IN-MARKET: "Looking for [solution]? Stop searching. Here's exactly what you need..."
- NEEDS-CONVINCED: "Still dealing with [problem]? Here's why it won't fix itself..."
- CONTRARIAN: "Forget everything you've heard about [topic]. Here's what actually works..."

## CREDIBILITY + STORY (0:05-0:20)
(Establish why you're the authority)
"I'm [Name]. Over the past [time], I've [specific achievement with numbers]."
"I used to [relatable struggle], until I discovered [mechanism]..."

## REASONS/PROOF (0:20-0:45)
(Stack proof points - specificity builds trust)
"Here's what makes this different..."
"[Client name] came to me [situation]. Within [timeframe], they [specific result]."
"And it's not just them - [additional proof point]..."

## CTA (0:45-0:60)
(Clear action + urgency + risk reversal)
"Click the link below to [specific action]."
"[Urgency element: limited spots/time-sensitive/bonus expiring]"
"[Risk reversal: guarantee/free trial/no obligation]"
""",

        "case_study": """
# CASE STUDY AD TEMPLATE (Jeremy Haynes Method)
Duration: 45-90 seconds | Best for: Proving specific results

## HOOK (0:00-0:05) - Lead with the result
"[Client name] went from [before state] to [after state] in [timeframe]. Here's how..."
OR
"[Specific result metric] - and it only took [timeframe]. Let me show you..."

## BEFORE STATE (0:05-0:15)
(Paint the pain - make it relatable)
"When [client] first came to us, they were [struggling with specific problems]."
"They had tried [common solutions that failed]..."
"Sound familiar?"

## THE PROCESS (0:15-0:35)
(Show the mechanism - what you actually did)
"Here's what we did differently..."
"First, [step 1]. Then, [step 2]. Finally, [step 3]."
[B-roll of process, screenshots, results dashboard if available]

## AFTER STATE + PROOF (0:35-0:55)
(Concrete results with specificity)
"Within [timeframe], [client] achieved [specific result 1], [result 2], and [result 3]."
"In their own words: '[Client testimonial quote]'"

## CTA (0:55-0:90)
"Want similar results? Click below to [specific action]."
"We're currently [scarcity element]."
""",

        "qa_interview": """
# Q&A / INTERVIEW STYLE AD TEMPLATE (Jeremy Haynes Method)
Duration: 60-90 seconds | Best for: Complex offers, building authority

## HOOK QUESTION (0:00-0:05)
Interviewer: "[Provocative question that addresses main pain point]?"

## EXPERT ANSWER - THE PROBLEM (0:05-0:20)
Expert: "Great question. The biggest mistake I see is [common mistake]..."
"Most people think [wrong belief], but the truth is [contrarian insight]..."

## DEEPER QUESTION (0:20-0:25)
Interviewer: "So what should they do instead?"

## THE SOLUTION + MECHANISM (0:25-0:50)
Expert: "What actually works is [your method/framework]..."
"We've used this with [number] clients to achieve [results]..."
"For example, [specific case study reference]..."

## CREDIBILITY QUESTION (0:50-0:55)
Interviewer: "And this works for [target audience]?"

## PROOF + CTA SETUP (0:55-0:75)
Expert: "Absolutely. [Recent example with specifics]..."
"In fact, we just helped [client] achieve [result] in [timeframe]..."

## CTA (0:75-0:90)
Interviewer OR Expert: "If you want to learn more, [specific action]..."
""",

        "testimonial_mashup": """
# TESTIMONIAL MASHUP AD TEMPLATE (Jeremy Haynes Method)
Duration: 30-60 seconds | Best for: Social proof stacking

## HOOK TESTIMONIAL (0:00-0:07)
[Your strongest, most specific testimonial]
Client 1: "[Specific result] - I couldn't believe it. [Emotional reaction]"

## SUPPORTING TESTIMONIALS (0:07-0:40)
[3-5 quick clips, each 5-8 seconds]

Client 2: "Before [product/service], I was [pain point]. Now I'm [transformed state]."

Client 3: "[Specific metric improvement]. This actually works."

Client 4: "I was skeptical at first, but [proof of result]..."

Client 5: "If you're on the fence, just do it. [Result] changed everything."

## PATTERN/THEME (0:40-0:50)
[Optional: Expert/founder ties it together]
"These aren't outliers. This is what happens when [mechanism/method]..."

## CTA (0:50-0:60)
"Ready for your own transformation? Click below to [action]."
"Join [number] others who [achieved result]."
""",

        "demonstration": """
# DEMONSTRATION AD TEMPLATE (Jeremy Haynes Method)
Duration: 30-60 seconds | Best for: Products, software, visual processes

## HOOK - END RESULT (0:00-0:05)
[Show the transformation/outcome first]
"See this [end result]? I'm going to show you exactly how to get it in [timeframe]..."
OR
"Watch this..." [Visual demo of impressive result]

## THE PROCESS (0:05-0:35)
[Screen recording, product demo, or step-by-step]
"Step 1: [Action]" [Show it]
"Step 2: [Action]" [Show it]
"And that's it. [Result] in [timeframe]."

## ADDRESS OBJECTION (0:35-0:45)
"Now you might be thinking [common objection]..."
"But here's the thing - [counter with proof]..."
[Show proof/testimonial clip if available]

## CTA (0:45-0:60)
"Want to try it yourself? Click below."
"[Risk reversal: free trial/guarantee/easy cancellation]"
""",

        "ugc": """
# UGC STYLE AD TEMPLATE (Jeremy Haynes Method)
Duration: 15-45 seconds | Best for: TikTok, Reels, younger audiences

## HOOK (0:00-0:03) - Casual, native feel
(Shot on phone, natural lighting, authentic energy)
"Okay wait I have to tell you about this..."
OR
"POV: You finally found [solution that works]"
OR
"I was today years old when I learned about [product/method]..."

## THE STRUGGLE (0:03-0:12)
"So I've been dealing with [problem] for [timeframe]..."
"I literally tried everything - [failed attempt 1], [failed attempt 2]..."
"Nothing worked."

## THE DISCOVERY (0:12-0:22)
"Then someone told me about [product/method] and I was like 'yeah right'..."
"But I tried it anyway and..."
[Show product/demonstrate]

## THE RESULT (0:22-0:35)
"Honestly? [Specific result]. Look at this..."
[Show proof - before/after, results, demonstration]
"I'm literally obsessed now."

## SOFT CTA (0:35-0:45)
"If you're still struggling with [problem], just try it."
"Link's in bio / Click the link"
(Keep it casual, not salesy)
""",

        "in_market": """
# IN-MARKET AUDIENCE AD TEMPLATE (Jeremy Haynes Method)
Duration: 30-45 seconds | Best for: High-intent searchers (3-4% of market)

These people are ALREADY looking for a solution. Don't educate - just show you're the answer.

## HOOK (0:00-0:05) - Direct, solution-focused
"Looking for [specific solution]? Here's the fastest way to [result]."
OR
"Need [outcome]? Stop searching. We've helped [number] people get [result]."
OR
"[Specific solution] that actually works? Found it."

## WHY YOU (0:05-0:20) - Quick proof stack
"We specialize in [specific thing]."
"[Number] clients. [Average result]. [Timeframe]."
"[Quick testimonial or case study reference]"

## DIFFERENTIATOR (0:20-0:30)
"What makes us different: [unique mechanism/guarantee/approach]"
"No [common pain point with competitors]."

## CTA (0:30-0:45)
"Ready? Click below to [specific, low-friction action]."
"[Speed element: instant access/same-day response/quick process]"
""",

        "needs_convinced": """
# NEEDS-CONVINCED AUDIENCE AD TEMPLATE (Jeremy Haynes Method)
Duration: 45-60 seconds | Best for: Problem-aware but not solution-seeking (30% of market)

These people have the problem but haven't decided to fix it. Agitate the pain, show consequences.

## HOOK (0:00-0:05) - Pain-focused, pattern interrupt
"Still dealing with [problem]? Here's why it's only getting worse..."
OR
"[Problem] keeping you up at night? You're not alone - but ignoring it is costing you..."
OR
"What if [problem] is the reason you're not [desired outcome]?"

## AGITATE THE PAIN (0:05-0:20)
"Here's the truth about [problem]:"
"Every day you wait, [negative consequence 1]."
"[Statistic or fact about the problem getting worse]"
"I've seen people lose [what they lost] because they thought it would fix itself."

## THE SHIFT (0:20-0:30)
"But it doesn't have to be this way."
"What if you could [outcome] without [main objection]?"

## PROOF (0:30-0:45)
"[Client name] was exactly where you are. [Their situation]."
"[Timeframe] later: [Their transformation with specifics]."

## CTA (0:45-0:60)
"The question isn't IF you'll fix [problem]. It's whether you'll do it now or after [consequence]."
"Click below to [low-commitment action]."
"""
    }

    template_type = args["template_type"].lower().replace(" ", "_").replace("-", "_")
    if template_type in templates:
        return {
            "content": [{
                "type": "text",
                "text": templates[template_type]
            }]
        }
    else:
        available = ", ".join(templates.keys())
        return {
            "content": [{
                "type": "text",
                "text": f"Template '{template_type}' not found. Available templates:\n\n" +
                       "- talking_head: Direct to camera, personal brand\n" +
                       "- case_study: Client transformation story\n" +
                       "- qa_interview: Interview/expert format\n" +
                       "- testimonial_mashup: Multiple testimonials compiled\n" +
                       "- demonstration: Product/process demo\n" +
                       "- ugc: User-generated content style\n" +
                       "- in_market: For high-intent audiences already searching\n" +
                       "- needs_convinced: For problem-aware audiences needing education"
            }]
        }


# ============================================================================
# CLIENT MANAGEMENT TOOLS
# ============================================================================

@tool(
    "manage_client",
    "Save, load, or list client profiles. Actions: 'save', 'load', 'list', 'update'",
    {"action": str, "client_name": str, "data": str}
)
async def manage_client(args: dict[str, Any]) -> dict[str, Any]:
    """Manage client profiles - save, load, list, or update."""
    action = args["action"].lower()
    client_name = args.get("client_name", "").lower().replace(" ", "-")
    data = args.get("data", "{}")

    # Ensure clients directory exists
    os.makedirs(CLIENTS_PATH, exist_ok=True)

    if action == "list":
        # List all client profiles
        clients = []
        if os.path.exists(CLIENTS_PATH):
            for f in os.listdir(CLIENTS_PATH):
                if f.endswith(".json"):
                    clients.append(f.replace(".json", ""))
        if clients:
            return {"content": [{"type": "text", "text": f"📁 Available clients:\n" + "\n".join(f"  • {c}" for c in sorted(clients))}]}
        else:
            return {"content": [{"type": "text", "text": "No client profiles found. Create one with action='save'."}]}

    elif action == "load":
        # Load a client profile
        filepath = f"{CLIENTS_PATH}/{client_name}.json"
        if os.path.exists(filepath):
            with open(filepath, "r") as f:
                client_data = json.load(f)

            result = f"# 📋 CLIENT PROFILE: {client_data.get('name', client_name).upper()}\n\n"
            result += f"**Brand**: {client_data.get('brand', 'N/A')}\n"
            result += f"**Offer**: {client_data.get('offer', 'N/A')}\n"
            result += f"**Price Point**: {client_data.get('price_point', 'N/A')}\n"
            result += f"**Niche**: {client_data.get('niche', 'N/A')}\n\n"

            result += "## TARGET AVATAR\n"
            avatar = client_data.get('avatar', {})
            result += f"- **Demographics**: {avatar.get('demographics', 'N/A')}\n"
            result += f"- **Pain Points**: {avatar.get('pain_points', 'N/A')}\n"
            result += f"- **Desires**: {avatar.get('desires', 'N/A')}\n"
            result += f"- **Objections**: {avatar.get('objections', 'N/A')}\n\n"

            result += "## PROOF POINTS\n"
            for i, proof in enumerate(client_data.get('proof_points', []), 1):
                result += f"{i}. **{proof.get('name', 'Client')}**: {proof.get('transformation', 'N/A')}\n"

            result += f"\n## VOICE/TONE\n{client_data.get('voice', 'N/A')}\n"
            result += f"\n## UNIQUE MECHANISM\n{client_data.get('mechanism', 'N/A')}\n"

            if client_data.get('winning_scripts'):
                result += f"\n## WINNING SCRIPTS ({len(client_data.get('winning_scripts', []))} saved)\n"
                for script in client_data.get('winning_scripts', [])[:3]:
                    result += f"- {script.get('name', 'Untitled')}: {script.get('angle', 'N/A')}\n"

            return {"content": [{"type": "text", "text": result}]}
        else:
            return {"content": [{"type": "text", "text": f"❌ Client '{client_name}' not found. Use action='list' to see available clients."}]}

    elif action == "save":
        # Save a new client profile
        try:
            client_data = json.loads(data) if isinstance(data, str) else data
        except json.JSONDecodeError:
            return {"content": [{"type": "text", "text": "❌ Invalid JSON data. Please provide valid JSON for client profile."}]}

        client_data['created_at'] = datetime.now().isoformat()
        client_data['updated_at'] = datetime.now().isoformat()

        filepath = f"{CLIENTS_PATH}/{client_name}.json"
        with open(filepath, "w") as f:
            json.dump(client_data, f, indent=2)

        return {"content": [{"type": "text", "text": f"✅ Client profile saved: {filepath}"}]}

    elif action == "update":
        # Update existing client profile
        filepath = f"{CLIENTS_PATH}/{client_name}.json"
        if os.path.exists(filepath):
            with open(filepath, "r") as f:
                existing_data = json.load(f)

            try:
                new_data = json.loads(data) if isinstance(data, str) else data
            except json.JSONDecodeError:
                return {"content": [{"type": "text", "text": "❌ Invalid JSON data."}]}

            existing_data.update(new_data)
            existing_data['updated_at'] = datetime.now().isoformat()

            with open(filepath, "w") as f:
                json.dump(existing_data, f, indent=2)

            return {"content": [{"type": "text", "text": f"✅ Client profile updated: {filepath}"}]}
        else:
            return {"content": [{"type": "text", "text": f"❌ Client '{client_name}' not found. Use action='save' to create."}]}

    else:
        return {"content": [{"type": "text", "text": "❌ Invalid action. Use: 'save', 'load', 'list', or 'update'"}]}


@tool(
    "create_brief",
    "Create a structured creative brief for a new ad project",
    {"client_name": str, "brief_data": str}
)
async def create_brief(args: dict[str, Any]) -> dict[str, Any]:
    """Create and validate a structured creative brief."""
    client_name = args.get("client_name", "").lower().replace(" ", "-")
    brief_data = args.get("brief_data", "{}")

    try:
        brief = json.loads(brief_data) if isinstance(brief_data, str) else brief_data
    except json.JSONDecodeError:
        # Return empty brief template
        template = """
# 📋 CREATIVE BRIEF TEMPLATE

Please provide the following information:

```json
{
  "project_name": "Campaign name",
  "offer": "What are you selling?",
  "price_point": "$X,XXX",
  "target_avatar": {
    "demographics": "Age, gender, location, profession",
    "pain_points": ["Pain 1", "Pain 2", "Pain 3"],
    "desires": ["Desire 1", "Desire 2", "Desire 3"],
    "objections": ["Objection 1", "Objection 2"]
  },
  "proof_points": [
    {"name": "Client Name", "before": "Starting point", "after": "Result", "timeframe": "X days/months"},
    {"name": "Client Name 2", "before": "Starting point", "after": "Result", "timeframe": "X days/months"}
  ],
  "unique_mechanism": "What makes your solution different?",
  "platforms": ["facebook", "tiktok", "youtube"],
  "formats": ["talking_head", "ugc", "case_study"],
  "voice": "professional | casual | edgy | friendly",
  "cta": "What action do you want them to take?",
  "landing_page_url": "https://..."
}
```
"""
        return {"content": [{"type": "text", "text": template}]}

    # Validate brief completeness
    required_fields = ["offer", "target_avatar", "proof_points", "platforms"]
    missing = [f for f in required_fields if f not in brief or not brief[f]]

    if missing:
        return {"content": [{"type": "text", "text": f"⚠️ Brief incomplete. Missing: {', '.join(missing)}\n\nPlease provide these fields before we can write scripts."}]}

    # Check proof points
    if len(brief.get("proof_points", [])) < 2:
        return {"content": [{"type": "text", "text": "⚠️ Need at least 2 proof points (client success stories) for credible ads."}]}

    # Save brief to client folder
    os.makedirs(CLIENTS_PATH, exist_ok=True)
    brief['created_at'] = datetime.now().isoformat()

    filepath = f"{CLIENTS_PATH}/{client_name}-brief-{datetime.now().strftime('%Y%m%d')}.json"
    with open(filepath, "w") as f:
        json.dump(brief, f, indent=2)

    result = f"✅ Brief validated and saved!\n\n"
    result += f"**Project**: {brief.get('project_name', 'Untitled')}\n"
    result += f"**Offer**: {brief.get('offer')}\n"
    result += f"**Platforms**: {', '.join(brief.get('platforms', []))}\n"
    result += f"**Formats**: {', '.join(brief.get('formats', []))}\n"
    result += f"**Proof Points**: {len(brief.get('proof_points', []))} case studies\n"
    result += f"\n📁 Saved to: {filepath}\n"
    result += f"\n✨ Ready to write scripts! What would you like to create first?"

    return {"content": [{"type": "text", "text": result}]}


# ============================================================================
# SCRIPT DATABASE TOOLS
# ============================================================================

@tool(
    "manage_script_db",
    "Add winning scripts to the database or search for reference scripts. Actions: 'add', 'search', 'list'",
    {"action": str, "script_data": str, "search_query": str}
)
async def manage_script_db(args: dict[str, Any]) -> dict[str, Any]:
    """Manage the growing script database."""
    action = args["action"].lower()
    script_data = args.get("script_data", "{}")
    search_query = args.get("search_query", "").lower()

    os.makedirs(SCRIPTS_DB_PATH, exist_ok=True)
    db_file = f"{SCRIPTS_DB_PATH}/scripts.json"

    # Load existing database
    if os.path.exists(db_file):
        with open(db_file, "r") as f:
            db = json.load(f)
    else:
        db = {"scripts": [], "metadata": {"total": 0, "last_updated": None}}

    if action == "add":
        try:
            script = json.loads(script_data) if isinstance(script_data, str) else script_data
        except json.JSONDecodeError:
            template = """
# ADD WINNING SCRIPT

Provide script data in this format:
```json
{
  "name": "Script name",
  "client": "Client name",
  "niche": "coaching | ecommerce | saas | realestate | fitness | finance",
  "angle": "commute_trap | hard_work_lie | transformation | etc",
  "platform": "facebook | tiktok | youtube | instagram",
  "format": "talking_head | ugc | case_study | testimonial",
  "hook": "The actual hook text",
  "full_script": "Complete script text",
  "performance": {
    "views": 10000,
    "ctr": 2.5,
    "conversions": 50,
    "cpa": 15.00,
    "verdict": "winner | loser | testing"
  },
  "tags": ["emotional", "pain-focused", "social-proof"]
}
```
"""
            return {"content": [{"type": "text", "text": template}]}

        script['id'] = f"script_{len(db['scripts']) + 1}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        script['added_at'] = datetime.now().isoformat()
        db['scripts'].append(script)
        db['metadata']['total'] = len(db['scripts'])
        db['metadata']['last_updated'] = datetime.now().isoformat()

        with open(db_file, "w") as f:
            json.dump(db, f, indent=2)

        return {"content": [{"type": "text", "text": f"✅ Script added to database!\n\nTotal scripts: {db['metadata']['total']}\nScript ID: {script['id']}"}]}

    elif action == "search":
        if not search_query:
            return {"content": [{"type": "text", "text": "Please provide a search_query (e.g., 'coaching pain-focused' or 'tiktok ugc')"}]}

        matches = []
        for script in db['scripts']:
            searchable = f"{script.get('niche', '')} {script.get('angle', '')} {script.get('platform', '')} {script.get('format', '')} {' '.join(script.get('tags', []))}".lower()
            if all(term in searchable for term in search_query.split()):
                matches.append(script)

        if matches:
            result = f"# 🔍 Found {len(matches)} matching scripts\n\n"
            for script in matches[:5]:
                result += f"### {script.get('name', 'Untitled')}\n"
                result += f"**Niche**: {script.get('niche')} | **Platform**: {script.get('platform')} | **Format**: {script.get('format')}\n"
                result += f"**Hook**: {script.get('hook', 'N/A')[:100]}...\n"
                perf = script.get('performance', {})
                if perf:
                    result += f"**Performance**: CTR {perf.get('ctr', 'N/A')}% | CPA ${perf.get('cpa', 'N/A')} | {perf.get('verdict', 'N/A').upper()}\n"
                result += "\n---\n\n"
            return {"content": [{"type": "text", "text": result}]}
        else:
            return {"content": [{"type": "text", "text": f"No scripts found matching '{search_query}'. Try broader terms."}]}

    elif action == "list":
        if not db['scripts']:
            return {"content": [{"type": "text", "text": "Script database is empty. Add winning scripts with action='add'."}]}

        result = f"# 📚 SCRIPT DATABASE ({db['metadata']['total']} scripts)\n\n"

        # Group by niche
        by_niche = {}
        for script in db['scripts']:
            niche = script.get('niche', 'other')
            if niche not in by_niche:
                by_niche[niche] = []
            by_niche[niche].append(script)

        for niche, scripts in by_niche.items():
            result += f"## {niche.upper()} ({len(scripts)} scripts)\n"
            for script in scripts[:3]:
                result += f"- {script.get('name', 'Untitled')} [{script.get('platform', 'N/A')}]\n"
            if len(scripts) > 3:
                result += f"  ... and {len(scripts) - 3} more\n"
            result += "\n"

        return {"content": [{"type": "text", "text": result}]}

    else:
        return {"content": [{"type": "text", "text": "❌ Invalid action. Use: 'add', 'search', or 'list'"}]}


# ============================================================================
# SCORING & ANALYSIS TOOLS
# ============================================================================

@tool(
    "score_script",
    "Score an ad script on key conversion factors and get improvement recommendations",
    {"script": str, "platform": str}
)
async def score_script(args: dict[str, Any]) -> dict[str, Any]:
    """Score a script and provide recommendations."""
    script = args.get("script", "")
    platform = args.get("platform", "facebook").lower()

    if not script:
        return {"content": [{"type": "text", "text": "Please provide the script text to score."}]}

    # Scoring criteria
    scores = {}
    recommendations = []

    # 1. HOOK STRENGTH (check first 50 chars)
    hook = script[:200].lower()
    hook_score = 5  # Base score

    if any(word in hook for word in ["you", "your"]):
        hook_score += 1
    if any(char.isdigit() for char in hook):
        hook_score += 1
    if "?" in hook[:100]:
        hook_score += 1
    if any(word in hook for word in ["secret", "truth", "mistake", "never", "always", "stop", "wait"]):
        hook_score += 1
    if len(hook.split('.')[0]) < 50:  # Short punchy first sentence
        hook_score += 1

    scores['hook_strength'] = min(hook_score, 10)
    if hook_score < 7:
        recommendations.append("HOOK: Add a pattern interrupt, question, or specific number in first line")

    # 2. SPECIFICITY (numbers, names, timeframes)
    specificity_score = 5
    import re
    numbers = re.findall(r'\$?[\d,]+%?', script)
    if len(numbers) >= 3:
        specificity_score += 2
    elif len(numbers) >= 1:
        specificity_score += 1

    if any(word in script.lower() for word in ["days", "weeks", "months", "hours"]):
        specificity_score += 1

    # Check for names (capitalized words that aren't sentence starts)
    potential_names = re.findall(r'(?<=[.!?]\s)[A-Z][a-z]+|^[A-Z][a-z]+', script)
    if len(potential_names) >= 2:
        specificity_score += 2

    scores['specificity'] = min(specificity_score, 10)
    if specificity_score < 7:
        recommendations.append("SPECIFICITY: Add exact numbers, client names, and specific timeframes")

    # 3. PROOF DENSITY
    proof_score = 5
    proof_indicators = ["went from", "achieved", "made", "earned", "got", "transformed", "before", "after", "results", "testimonial"]
    proof_count = sum(1 for word in proof_indicators if word in script.lower())
    proof_score += min(proof_count, 5)

    scores['proof_density'] = min(proof_score, 10)
    if proof_score < 7:
        recommendations.append("PROOF: Add more social proof - client results, testimonials, case studies")

    # 4. CTA CLARITY
    cta_score = 5
    cta_indicators = ["click", "link", "below", "sign up", "book", "call", "register", "join", "get", "download"]
    if any(word in script.lower()[-200:] for word in cta_indicators):
        cta_score += 2

    urgency_words = ["now", "today", "limited", "only", "before", "deadline", "spots", "left"]
    if any(word in script.lower()[-200:] for word in urgency_words):
        cta_score += 2

    if "free" in script.lower()[-200:]:
        cta_score += 1

    scores['cta_clarity'] = min(cta_score, 10)
    if cta_score < 7:
        recommendations.append("CTA: Make action clearer, add urgency or risk reversal")

    # 5. PLATFORM FIT
    platform_score = 7  # Base score
    word_count = len(script.split())

    platform_guidelines = {
        "tiktok": {"ideal_words": (30, 80), "style": ["casual", "native", "trending"]},
        "facebook": {"ideal_words": (80, 150), "style": ["direct", "proof-heavy"]},
        "youtube": {"ideal_words": (100, 200), "style": ["story", "educational"]},
        "instagram": {"ideal_words": (50, 120), "style": ["visual", "lifestyle"]},
        "linkedin": {"ideal_words": (80, 150), "style": ["professional", "data-driven"]}
    }

    guidelines = platform_guidelines.get(platform, platform_guidelines["facebook"])
    min_words, max_words = guidelines["ideal_words"]

    if min_words <= word_count <= max_words:
        platform_score += 2
    elif word_count < min_words * 0.7 or word_count > max_words * 1.3:
        platform_score -= 2

    scores['platform_fit'] = min(max(platform_score, 1), 10)
    if platform_score < 7:
        recommendations.append(f"LENGTH: Adjust for {platform} - ideal is {min_words}-{max_words} words (you have {word_count})")

    # Calculate overall
    overall = sum(scores.values()) / len(scores)

    # Build result
    result = f"""
# 📊 SCRIPT SCORE REPORT

## SCORES
```
HOOK STRENGTH:     {scores['hook_strength']}/10  {'🟢' if scores['hook_strength'] >= 7 else '🟡' if scores['hook_strength'] >= 5 else '🔴'}
SPECIFICITY:       {scores['specificity']}/10  {'🟢' if scores['specificity'] >= 7 else '🟡' if scores['specificity'] >= 5 else '🔴'}
PROOF DENSITY:     {scores['proof_density']}/10  {'🟢' if scores['proof_density'] >= 7 else '🟡' if scores['proof_density'] >= 5 else '🔴'}
CTA CLARITY:       {scores['cta_clarity']}/10  {'🟢' if scores['cta_clarity'] >= 7 else '🟡' if scores['cta_clarity'] >= 5 else '🔴'}
PLATFORM FIT:      {scores['platform_fit']}/10  {'🟢' if scores['platform_fit'] >= 7 else '🟡' if scores['platform_fit'] >= 5 else '🔴'}
─────────────────────────
OVERALL:           {overall:.1f}/10
```

## VERDICT
{"✅ READY TO TEST" if overall >= 7 else "⚠️ NEEDS IMPROVEMENT" if overall >= 5 else "❌ MAJOR REVISIONS NEEDED"}

## RECOMMENDATIONS
"""

    if recommendations:
        for rec in recommendations:
            result += f"• {rec}\n"
    else:
        result += "Script scores well on all criteria. Ready for testing!\n"

    result += f"\n**Word Count**: {word_count} | **Platform**: {platform.upper()}"

    return {"content": [{"type": "text", "text": result}]}


@tool(
    "log_performance",
    "Log the performance of a script for learning what works",
    {"script_id": str, "metrics": str}
)
async def log_performance(args: dict[str, Any]) -> dict[str, Any]:
    """Log script performance metrics."""
    script_id = args.get("script_id", "")
    metrics_str = args.get("metrics", "{}")

    try:
        metrics = json.loads(metrics_str) if isinstance(metrics_str, str) else metrics_str
    except json.JSONDecodeError:
        template = """
# LOG PERFORMANCE

Provide metrics in this format:
```json
{
  "script_id": "script_name_or_id",
  "platform": "facebook",
  "date_range": "2024-01-01 to 2024-01-07",
  "spend": 500,
  "impressions": 50000,
  "clicks": 1250,
  "ctr": 2.5,
  "cpc": 0.40,
  "leads": 45,
  "cpl": 11.11,
  "conversions": 5,
  "cpa": 100,
  "revenue": 2500,
  "roas": 5.0,
  "verdict": "winner | loser | testing",
  "notes": "Any observations about performance"
}
```
"""
        return {"content": [{"type": "text", "text": template}]}

    # Save to performance log
    os.makedirs(SCRIPTS_DB_PATH, exist_ok=True)
    perf_file = f"{SCRIPTS_DB_PATH}/performance-log.json"

    if os.path.exists(perf_file):
        with open(perf_file, "r") as f:
            log = json.load(f)
    else:
        log = {"entries": [], "summary": {}}

    metrics['logged_at'] = datetime.now().isoformat()
    metrics['script_id'] = script_id
    log['entries'].append(metrics)

    # Update summary
    verdicts = [e.get('verdict', '') for e in log['entries']]
    log['summary'] = {
        "total_logged": len(log['entries']),
        "winners": verdicts.count('winner'),
        "losers": verdicts.count('loser'),
        "testing": verdicts.count('testing'),
        "last_updated": datetime.now().isoformat()
    }

    with open(perf_file, "w") as f:
        json.dump(log, f, indent=2)

    # Analyze performance
    ctr = metrics.get('ctr', 0)
    cpa = metrics.get('cpa', 0)
    roas = metrics.get('roas', 0)

    analysis = []
    if ctr >= 2:
        analysis.append("✅ CTR is strong (2%+) - hook is working")
    elif ctr >= 1:
        analysis.append("⚠️ CTR is average - test new hooks")
    else:
        analysis.append("❌ CTR is low - hook needs major improvement")

    if metrics.get('verdict') == 'winner':
        analysis.append("🏆 WINNER - Scale this ad!")

    result = f"""
# 📈 PERFORMANCE LOGGED

**Script**: {script_id}
**Platform**: {metrics.get('platform', 'N/A')}
**Verdict**: {metrics.get('verdict', 'N/A').upper()}

## KEY METRICS
- **CTR**: {ctr}%
- **CPC**: ${metrics.get('cpc', 'N/A')}
- **CPA**: ${cpa}
- **ROAS**: {roas}x

## ANALYSIS
{chr(10).join(analysis)}

## DATABASE
Total scripts logged: {log['summary']['total_logged']}
Winners: {log['summary']['winners']} | Losers: {log['summary']['losers']} | Testing: {log['summary']['testing']}
"""

    return {"content": [{"type": "text", "text": result}]}


# ============================================================================
# PLATFORM & NICHE GUIDES
# ============================================================================

@tool(
    "get_platform_guide",
    "Get platform-specific best practices for TikTok, Facebook, YouTube, Instagram, or LinkedIn",
    {"platform": str}
)
async def get_platform_guide(args: dict[str, Any]) -> dict[str, Any]:
    """Return platform-specific ad guidelines."""
    platform = args.get("platform", "").lower()

    guides = {
        "tiktok": """
# 📱 TIKTOK AD GUIDE

## TECHNICAL SPECS
- **Aspect Ratio**: 9:16 (vertical, full screen)
- **Length**: 15-60 seconds (sweet spot: 21-34 seconds)
- **Hook Window**: 0.5-2 seconds (CRITICAL)

## CREATIVE RULES
1. **NATIVE FEEL IS EVERYTHING**
   - Shot on phone, not cinema cameras
   - Natural lighting > studio lighting
   - Imperfect = authentic = trusted

2. **HOOK STYLES THAT WORK**
   - "POV: You just discovered..."
   - "I need to tell you about this..."
   - "Wait, this actually works?"
   - "Things I wish I knew sooner..."
   - Start mid-action, no intros

3. **TRENDING FORMATS**
   - Green screen with screenshots
   - Duets/stitches with objections
   - Day-in-the-life content
   - Before/after reveals
   - "Storytime" format

4. **AUDIO STRATEGY**
   - Use trending sounds when relevant
   - Original audio builds brand
   - Voiceover + music works well
   - Captions are MANDATORY (80% watch muted)

5. **CTA APPROACH**
   - Soft CTAs work better ("link in bio")
   - Don't be salesy - be helpful
   - "If this helped, follow for more"

## AVOID
❌ Polished, corporate-looking content
❌ Hard sells and aggressive CTAs
❌ Long intros or logos at start
❌ Horizontal or square video
❌ Stock footage or generic B-roll
""",

        "facebook": """
# 📘 FACEBOOK/META AD GUIDE

## TECHNICAL SPECS
- **Aspect Ratios**:
  - Feed: 1:1 or 4:5 (4:5 gets more real estate)
  - Stories/Reels: 9:16
  - Right column: 1.91:1
- **Length**: 15-90 seconds (sweet spot: 30-60 seconds)
- **Hook Window**: 3-5 seconds

## CREATIVE RULES
1. **THUMB-STOPPING HOOKS**
   - Pattern interrupt in first frame
   - Text overlay on screen
   - Bold claim or question
   - Movement/action immediately

2. **PROOF-HEAVY APPROACH**
   - Facebook audience is skeptical
   - Stack testimonials and case studies
   - Show real results with numbers
   - Before/after transformations

3. **AD FORMATS THAT WORK**
   - Talking head to camera
   - Testimonial compilations
   - Case study narratives
   - Problem-agitate-solve structure

4. **COPY INTEGRATION**
   - First line must hook (shows in preview)
   - Use primary text (125 chars visible)
   - Headline for CTA reinforcement
   - Description for objection handling

5. **CTA STRATEGY**
   - Direct CTAs work here
   - "Learn More" for cold traffic
   - "Sign Up" / "Book Now" for warm
   - Create urgency in CTA

## AUDIENCE TARGETING
- Broad works better post-iOS14
- Let the algorithm optimize
- Retargeting warm audiences is key
- Lookalikes from purchasers

## AVOID
❌ Clickbait that doesn't deliver
❌ Exaggerated income claims (account bans)
❌ Before/after without disclaimers
❌ Mentioning Facebook in ad copy
""",

        "youtube": """
# ▶️ YOUTUBE AD GUIDE

## AD TYPES & SPECS
1. **Skippable In-Stream (Pre-roll)**
   - Skip button appears at 5 seconds
   - Length: 15-180 seconds (60-90 optimal)
   - You only pay if they watch 30s or click

2. **Non-Skippable In-Stream**
   - Length: 15-20 seconds max
   - Pay per impression
   - Good for brand awareness

3. **Discovery Ads**
   - Thumbnail + headline in search/related
   - Pay per click to watch
   - Can be longer (5-15 min)

## CREATIVE RULES
1. **THE 5-SECOND RULE**
   - EVERYTHING happens in first 5 seconds
   - Hook must earn the "don't skip"
   - State the benefit immediately
   - Pattern interrupt or bold claim

2. **OPENING PATTERNS**
   - "If you're struggling with [X], keep watching..."
   - "In the next 60 seconds, I'll show you..."
   - "Stop! Before you skip, let me ask you..."
   - Question that makes them think

3. **STRUCTURE FOR PRE-ROLL**
   ```
   0:00-0:05 - HOOK (earn the watch)
   0:05-0:30 - Problem/Pain agitation
   0:30-0:50 - Solution + proof
   0:50-0:60 - CTA with urgency
   ```

4. **STORYTELLING APPROACH**
   - YouTube viewers expect more depth
   - Can use longer case studies
   - Build more trust and authority
   - Educational content works well

5. **CTA PLACEMENT**
   - Multiple CTAs throughout
   - "Click the link below" + gesture
   - End screen with subscribe/link
   - Cards for mid-video CTAs

## AVOID
❌ Slow starts or long intros
❌ Saying "skip this ad" ironically
❌ Poor audio quality
❌ Misleading thumbnails/hooks
""",

        "instagram": """
# 📸 INSTAGRAM AD GUIDE

## PLACEMENTS & SPECS
1. **Feed**: 1:1 or 4:5 (4:5 recommended)
2. **Stories**: 9:16 (full screen vertical)
3. **Reels**: 9:16 (TikTok-style content)
4. **Explore**: 1:1 (discovery placement)

## CREATIVE RULES BY PLACEMENT

### FEED ADS
- Scroll-stopping visual in first frame
- Native, not overly produced
- Text overlay for context
- 30-60 seconds for video
- Carousel for storytelling

### STORIES ADS
- 15 seconds or less per card
- Vertical, full screen
- Quick cuts, high energy
- Swipe up CTA
- Sound-on design with captions

### REELS ADS
- TikTok aesthetic works here
- Trending audio/formats
- Native creator content
- 15-30 seconds ideal
- Entertaining > promotional

## VISUAL STRATEGY
1. **Lifestyle imagery** over product shots
2. **User-generated content** performs best
3. **Before/after** transformations
4. **Behind-the-scenes** authenticity
5. **Faces** in thumbnails get attention

## COPY APPROACH
- Keep it short (125 chars visible)
- Emojis work well on IG
- Hashtags in first comment, not ad
- Questions increase engagement

## AVOID
❌ Overly polished/corporate look
❌ Long text-heavy posts
❌ Stock photos
❌ Hard selling in creative
""",

        "linkedin": """
# 💼 LINKEDIN AD GUIDE

## TECHNICAL SPECS
- **Video**: 1:1 or 16:9 (horizontal)
- **Length**: 30-90 seconds (shorter for awareness)
- **Carousel**: Up to 10 cards
- **Image**: 1200x627 or 1:1

## AUDIENCE CONTEXT
- Professional mindset
- B2B decision makers
- Career advancement seekers
- Higher CPCs but higher intent
- Business hours perform best

## CREATIVE RULES
1. **AUTHORITY-LED APPROACH**
   - Credibility matters more here
   - Lead with expertise/results
   - Data and statistics resonate
   - Thought leadership content

2. **HOOK STYLES**
   - "[Industry] leaders are doing X..."
   - "The biggest mistake in [field]..."
   - "Why [conventional wisdom] is wrong"
   - Data-led statements
   - Contrarian professional takes

3. **CONTENT FORMATS**
   - Expert talking head
   - Data visualization + voiceover
   - Case study with ROI focus
   - Interview/conversation format
   - Document/report previews

4. **TONE & LANGUAGE**
   - Professional but not boring
   - Avoid buzzwords/jargon
   - Results-focused messaging
   - Educational value
   - Subtle humble-bragging works

5. **CTA STRATEGY**
   - "Download the report"
   - "Register for the webinar"
   - "Book a consultation"
   - Lead magnet offers work well

## AVOID
❌ Overly casual/trendy content
❌ Consumer-style advertising
❌ Clickbait tactics
❌ Emojis in excess
❌ Hard selling without value
"""
    }

    if platform in guides:
        return {"content": [{"type": "text", "text": guides[platform]}]}
    else:
        return {"content": [{"type": "text", "text": f"Platform '{platform}' not found.\n\nAvailable guides:\n- tiktok\n- facebook\n- youtube\n- instagram\n- linkedin"}]}


@tool(
    "get_niche_angles",
    "Get proven ad angles and hooks for specific niches: coaching, ecommerce, saas, realestate, fitness, finance",
    {"niche": str}
)
async def get_niche_angles(args: dict[str, Any]) -> dict[str, Any]:
    """Return niche-specific angles and swipe file."""
    niche = args.get("niche", "").lower()

    niches = {
        "coaching": """
# 🎯 COACHING/CONSULTING ANGLES

## HIGH-PERFORMING ANGLES

### 1. THE ESCAPE ANGLE
Target: People stuck in jobs/situations
- "Escape the 9-5 / corporate grind / rat race"
- "What if you didn't HAVE to go back Monday?"
- "Your job is the reason you're broke/stressed/unfulfilled"

**Proof framework**: [Client] went from [job situation] to [freedom situation] in [timeframe]

### 2. THE SHORTCUT ANGLE
Target: People who've tried and failed
- "Stop wasting years figuring it out alone"
- "The path I wish I knew 5 years ago"
- "Why 99% of [target] fail (and how to be the 1%)"

**Proof framework**: [Client] achieved [result] in [short timeframe] without [expected struggle]

### 3. THE IDENTITY SHIFT ANGLE
Target: People who think "this isn't for me"
- "I'm not a salesperson/entrepreneur/etc" → "Neither was [Client]"
- "You don't need [expected requirement] to succeed"
- "The biggest lie about [topic] is that you need [thing]"

**Proof framework**: [Client] had [limitation/objection] but still achieved [result]

### 4. THE SYSTEMATIC ANGLE
Target: People who need certainty
- "The exact [X]-step system"
- "Follow this blueprint exactly..."
- "Remove the guesswork from [outcome]"

**Proof framework**: [Client] just followed the process and got [predictable result]

### 5. THE PAIN AMPLIFICATION ANGLE
Target: Needs-convinced audience
- "Here's why [problem] is only getting worse"
- "The cost of waiting another year is..."
- "What happens if nothing changes?"

**Proof framework**: "[Client] was exactly where you are. Ignored it for [time]. Then [consequence]."

## OBJECTION HANDLERS
- "I don't have time" → "Neither did [Client] with [busy life]. Here's how..."
- "I can't afford it" → "Can you afford another year of [current situation]?"
- "Does this really work?" → Stack multiple short case studies
- "I've tried before" → "Those were [approach]. This is different because [mechanism]"

## HOOK TEMPLATES
1. "{Number} days/months ago, [Client] was exactly where you are..."
2. "If you're still [pain point], here's why..."
3. "The [industry] doesn't want you to know this..."
4. "I quit my [job] [timeframe] ago. Here's what happened..."
5. "Warning: This isn't for everyone. But if you're [qualifier]..."
""",

        "ecommerce": """
# 🛒 E-COMMERCE/DTC ANGLES

## HIGH-PERFORMING ANGLES

### 1. THE PROBLEM-SOLUTION ANGLE
Target: People with specific pain points
- "Still dealing with [problem]? Watch this."
- "Why [common solution] doesn't work for [problem]"
- "I tried everything for [problem]. Then I found this."

**Format**: UGC, before/after, demonstration

### 2. THE SOCIAL PROOF ANGLE
Target: Skeptics who need validation
- "Join [number] others who..."
- "See why [product] is going viral"
- "The internet is obsessed with this [product]"

**Format**: Testimonial mashup, review compilation, UGC reaction

### 3. THE CURIOSITY/REVEAL ANGLE
Target: Scroll-stoppers
- "This [product] is breaking the internet..."
- "I can't believe this actually works"
- "Why didn't I know about this sooner?"

**Format**: Unboxing, first reaction, transformation reveal

### 4. THE COMPARISON ANGLE
Target: Researchers comparing options
- "[Product] vs [Competitor]: Honest review"
- "Why I switched from [competitor] to [product]"
- "What they don't tell you about [competitor]"

**Format**: Side-by-side demo, review style

### 5. THE LIFESTYLE ANGLE
Target: Aspirational buyers
- "A day with my [product]"
- "How [product] changed my morning routine"
- "POV: You finally have [benefit]"

**Format**: Lifestyle B-roll, aesthetic content

## PLATFORM-SPECIFIC
- **TikTok**: UGC, trending sounds, native feel
- **Facebook**: Testimonials, before/after, longer form
- **Instagram**: Lifestyle, aesthetic, carousel

## HOOK TEMPLATES
1. "I was today years old when I found out about [product]..."
2. "POV: [Relatable situation that product solves]"
3. "If you struggle with [problem], you NEED this"
4. "My [product] finally came in... let me show you"
5. "I've been using [product] for [time]. Here's my honest review."
""",

        "saas": """
# 💻 SAAS/SOFTWARE ANGLES

## HIGH-PERFORMING ANGLES

### 1. THE EFFICIENCY ANGLE
Target: Time-strapped professionals
- "Do in [minutes] what used to take [hours]"
- "Stop wasting [hours/week] on [task]"
- "Automate [tedious task] completely"

**Format**: Screen recording demo, before/after workflow

### 2. THE COMPETITIVE ADVANTAGE ANGLE
Target: Business owners, marketers
- "Your competitors are using this. Are you?"
- "The tool [successful company] uses for [outcome]"
- "[Industry] leaders don't want you to know about this"

**Format**: Demo with results, case study

### 3. THE COST COMPARISON ANGLE
Target: Budget-conscious buyers
- "Replace [expensive tools] with one platform"
- "Why pay for [competitor] when..."
- "Get [outcome] at a fraction of the cost"

**Format**: Pricing comparison, ROI calculator

### 4. THE PAIN POINT ANGLE
Target: People frustrated with current tools
- "Frustrated with [competitor]? Try this."
- "If [common problem] is killing your [metric]..."
- "The [tool type] that doesn't [common complaint]"

**Format**: Problem demonstration, solution reveal

### 5. THE RESULTS ANGLE
Target: ROI-focused buyers
- "[Client] increased [metric] by [%] in [timeframe]"
- "How [company] got [specific result] with [product]"
- "[Number] users. [Result] average improvement."

**Format**: Case study, data visualization, testimonial

## HOOK TEMPLATES
1. "If you're using [competitor], watch this..."
2. "We analyzed [number] [users/companies]. Here's what we found..."
3. "[Task] in [old time]? Try [new time] with [product]."
4. "The AI tool that's replacing [job function]"
5. "[Number]% of [industry] professionals use this for [task]"
""",

        "fitness": """
# 💪 FITNESS/HEALTH ANGLES

## HIGH-PERFORMING ANGLES (Compliance-Safe)

### 1. THE SUSTAINABILITY ANGLE
Target: Failed dieters
- "Why willpower-based diets always fail"
- "The approach that doesn't require perfection"
- "How to [result] without cutting out [food/activity]"

**Format**: Educational, relatable story, before/after journey

### 2. THE BUSY PERSON ANGLE
Target: Time-strapped professionals
- "[Result] with just [minutes/day]"
- "The workout for people who hate working out"
- "No gym required. No equipment needed."

**Format**: Quick demo, day-in-life, time-lapse

### 3. THE MINDSET SHIFT ANGLE
Target: People who've tried everything
- "Stop focusing on [wrong thing]. Do this instead."
- "The mistake keeping you from [result]"
- "What trainers don't tell you about [topic]"

**Format**: Educational talking head, myth-busting

### 4. THE IDENTITY ANGLE
Target: People who don't see themselves as "fit"
- "I'm not an athlete. I just follow this system."
- "You don't have to live in the gym"
- "Built for real people, not fitness influencers"

**Format**: Relatable transformations, everyday people

### 5. THE SCIENCE/MECHANISM ANGLE
Target: Logical, research-oriented audience
- "The science behind [method]"
- "Why [common belief] is actually wrong"
- "What [research/studies] show about [topic]"

**Format**: Educational, data-backed, authority positioning

## COMPLIANCE NOTES ⚠️
- Avoid specific weight loss claims
- Use "results may vary" disclaimers
- Before/after needs context (time, effort)
- No medical claims without certification
- "Typical" or "average" results only

## HOOK TEMPLATES
1. "I tried [popular method] for [time]. Here's the truth..."
2. "Why [common approach] isn't working for you"
3. "[Result] without [expected sacrifice]. Here's how."
4. "My [age/situation] isn't an excuse. Neither is yours."
5. "The [number]-minute routine that changed everything"
""",

        "finance": """
# 💰 FINANCE/INVESTING ANGLES

## HIGH-PERFORMING ANGLES (Compliance-Safe)

### 1. THE EDUCATION ANGLE
Target: Beginners seeking knowledge
- "What I wish I knew about [topic] earlier"
- "[Topic] explained in [time]"
- "The basics of [financial concept] most people get wrong"

**Format**: Educational, whiteboard, screen share

### 2. THE WEALTH BUILDING ANGLE
Target: Long-term thinkers
- "How [wealthy people] actually build wealth"
- "The [strategy] used by [% of millionaires]"
- "Why your savings account is losing you money"

**Format**: Data-driven, educational, authority positioning

### 3. THE MISTAKE AVOIDANCE ANGLE
Target: People making costly errors
- "[Number] money mistakes costing you [amount]"
- "Stop [common behavior]. Here's why."
- "The hidden fees eating your [investment/savings]"

**Format**: Eye-opening education, problem-aware

### 4. THE SECURITY ANGLE
Target: Risk-averse, protection-focused
- "Protect your [asset] from [threat]"
- "What happens to your [asset] if [scenario]?"
- "The [strategy] smart families are using"

**Format**: Educational, scenario-based, family-focused

### 5. THE OPPORTUNITY ANGLE
Target: Ambitious, growth-minded
- "Why [% of people] miss this opportunity"
- "The [asset/strategy] outperforming [comparison]"
- "[Market condition] creates [opportunity]"

**Format**: News-style, data-driven, timely

## COMPLIANCE NOTES ⚠️
- NO specific return promises
- NO "guaranteed" income claims
- Include "past performance ≠ future results"
- Educational content only, not financial advice
- Disclaimers required on all performance data

## HOOK TEMPLATES
1. "If you have [asset], you need to watch this..."
2. "[Number]% of [group] don't know this about [topic]"
3. "The [time] mistake that cost me [amount]"
4. "Here's what [financial institution] doesn't want you to know"
5. "I analyzed [number] [investments]. Here's what I found."
""",

        "realestate": """
# 🏠 REAL ESTATE ANGLES

## HIGH-PERFORMING ANGLES

### 1. THE MARKET TIMING ANGLE
Target: Fence-sitters waiting for "right time"
- "Why waiting for [market condition] is costing you"
- "The truth about [current market]: What agents won't say"
- "[Year] predictions: What buyers/sellers need to know"

**Format**: News-style, data-driven, expert positioning

### 2. THE INSIDER KNOWLEDGE ANGLE
Target: First-time buyers/sellers
- "What your agent isn't telling you"
- "The [number] questions to ask before [buying/selling]"
- "[Number] mistakes that cost [buyers/sellers] thousands"

**Format**: Educational, listicle-style, consumer advocate

### 3. THE WEALTH BUILDING ANGLE
Target: Investors, wealth-builders
- "How real estate creates generational wealth"
- "The [strategy] I use to [build portfolio/passive income]"
- "Why the wealthy keep buying real estate"

**Format**: Authority, results-focused, educational

### 4. THE LIFESTYLE ANGLE
Target: Aspirational home seekers
- "Imagine waking up here every day..."
- "Tour: [Description] in [Location]"
- "POV: You just found your dream home"

**Format**: Property tours, lifestyle content, cinematic

### 5. THE LOCAL EXPERT ANGLE
Target: Local market buyers/sellers
- "[Neighborhood] market update: [Month/Year]"
- "Best neighborhoods in [City] for [demographic]"
- "Why [Area] is the next [hot market]"

**Format**: Local knowledge, market expertise, community content

## HOOK TEMPLATES
1. "The [city] housing market just shifted. Here's what that means..."
2. "Don't [buy/sell] until you watch this"
3. "[Price point] in [location]: What you actually get"
4. "I've closed [number] deals. Here's the biggest mistake I see..."
5. "[Just Listed / Just Sold]: [Property description]"
"""
    }

    if niche in niches:
        return {"content": [{"type": "text", "text": niches[niche]}]}
    else:
        return {"content": [{"type": "text", "text": f"Niche '{niche}' not found.\n\nAvailable niches:\n- coaching (coaches, consultants, course creators)\n- ecommerce (DTC brands, physical products)\n- saas (software, apps, tools)\n- fitness (health, wellness, weight loss)\n- finance (investing, trading, financial planning)\n- realestate (agents, investors, property)"}]}


@tool(
    "get_voice_profile",
    "Get voice/tone guidelines for different brand personalities",
    {"voice_type": str}
)
async def get_voice_profile(args: dict[str, Any]) -> dict[str, Any]:
    """Return voice profile guidelines."""
    voice_type = args.get("voice_type", "").lower()

    profiles = {
        "professional": """
# 🎩 PROFESSIONAL AUTHORITY VOICE

## CHARACTERISTICS
- Measured confidence, not hype
- Data and research-driven
- Formal but accessible
- Expert positioning

## LANGUAGE PATTERNS
**Use:**
- "Research indicates..."
- "In my experience working with [number] clients..."
- "The data shows..."
- "Studies have found..."
- "Best practices suggest..."

**Avoid:**
- Slang or casual language
- Excessive exclamation points
- Hyperbole ("amazing!", "life-changing!")
- First-person stories (unless brief)

## EXAMPLE HOOKS
- "After analyzing [number] campaigns, here's what we found..."
- "The [industry] is changing. Here's what leaders are doing..."
- "Most [professionals] make this critical mistake..."

## PROOF STYLE
- Case studies with metrics
- ROI and data points
- Client logos and testimonials from titled professionals
- Industry credentials and awards

## CTA STYLE
- "Download the research"
- "Book a consultation"
- "Access the framework"
- "Join [number] other [professionals]"

## BEST FOR
✓ B2B services
✓ High-ticket consulting
✓ LinkedIn ads
✓ Professional services
✓ Corporate training
""",

        "casual": """
# 😊 CASUAL FRIEND VOICE

## CHARACTERISTICS
- Conversational and warm
- Relatable and approachable
- Like talking to a friend
- Authentic, not scripted

## LANGUAGE PATTERNS
**Use:**
- "Look, here's the deal..."
- "I get it, I've been there..."
- "Can I be real with you?"
- "Here's what nobody tells you..."
- "I'm just gonna say it..."

**Avoid:**
- Corporate jargon
- Overly formal language
- Stiff sentence structures
- Excessive credentials dropping

## EXAMPLE HOOKS
- "Okay, I need to tell you something..."
- "So here's the thing about [topic]..."
- "Real talk: [honest statement]"
- "I used to think [wrong belief] too..."

## PROOF STYLE
- Relatable before/after stories
- "People like you" testimonials
- Personal journey sharing
- Behind-the-scenes authenticity

## CTA STYLE
- "Wanna learn more? Link's below"
- "If this helped, check out..."
- "Click the link, I'll show you everything"
- "Just try it—what's the worst that happens?"

## BEST FOR
✓ Coaches and personal brands
✓ TikTok and Instagram
✓ Younger audiences
✓ Lifestyle products
✓ Community-based offers
""",

        "edgy": """
# 🔥 EDGY CHALLENGER VOICE

## CHARACTERISTICS
- Bold and confrontational
- Challenges status quo
- Polarizing (attracts ideal, repels wrong fit)
- Unapologetic confidence

## LANGUAGE PATTERNS
**Use:**
- "Everyone's lying to you about..."
- "Screw the traditional way of..."
- "Here's the truth [industry] doesn't want you to know..."
- "Stop doing [common thing]. It's killing your [result]."
- "I'm about to piss off a lot of [group]..."

**Avoid:**
- Playing it safe
- Hedging statements
- Trying to please everyone
- Generic advice

## EXAMPLE HOOKS
- "99% of [advice] is complete BS. Here's why..."
- "I'm going to say what nobody else will..."
- "Unpopular opinion: [contrarian take]"
- "The [industry] hates me for saying this..."

## PROOF STYLE
- Dramatic transformations
- Results that "shouldn't" be possible
- Breaking conventional rules
- David vs Goliath stories

## CTA STYLE
- "If you can handle the truth, click below"
- "Warning: This isn't for everyone"
- "Only click if you're ready to [bold action]"
- "This isn't for the faint of heart"

## BEST FOR
✓ Disrupting established industries
✓ Younger, rebellious audiences
✓ Personal brands with strong opinions
✓ Competitive differentiation
✓ Standing out in crowded markets
""",

        "inspirational": """
# ✨ INSPIRATIONAL MOTIVATOR VOICE

## CHARACTERISTICS
- Uplifting and empowering
- Vision-focused
- Emotionally resonant
- Belief-building

## LANGUAGE PATTERNS
**Use:**
- "Imagine waking up to..."
- "What would life look like if..."
- "You deserve [outcome]"
- "It's time to stop settling for..."
- "Your [dream] is closer than you think..."

**Avoid:**
- Negative framing
- Shame-based motivation
- Overly aggressive language
- Dismissing their current situation

## EXAMPLE HOOKS
- "What if this was the year everything changed?"
- "You're one decision away from a different life..."
- "Picture this: [dream scenario]"
- "Deep down, you know you're meant for more..."

## PROOF STYLE
- Emotional transformation stories
- Journey narratives
- Before/after lifestyle (not just metrics)
- Community and belonging

## CTA STYLE
- "Take the first step today"
- "Your journey starts here"
- "Join others who chose [transformation]"
- "Start your [transformation] now"

## BEST FOR
✓ Life coaching
✓ Personal development
✓ Weight loss/fitness
✓ Career transitions
✓ Aspirational lifestyle brands
""",

        "direct": """
# 🎯 DIRECT RESPONSE VOICE

## CHARACTERISTICS
- Clear and concise
- Results-focused
- No fluff, all substance
- Urgency and action-oriented

## LANGUAGE PATTERNS
**Use:**
- "[Result] in [timeframe]. Here's how."
- "Step 1: [action]. Step 2: [action]."
- "The fastest way to [outcome]"
- "If [situation], then [solution]"
- "Here's exactly what you get..."

**Avoid:**
- Lengthy storytelling
- Excessive emotion
- Vague promises
- Passive language

## EXAMPLE HOOKS
- "Want [result]? Do this."
- "[Number] in [timeframe]. Let me show you."
- "Stop [wrong action]. Start [right action]."
- "The [number]-step system to [outcome]"

## PROOF STYLE
- Numbers and metrics
- Specific timeframes
- Process breakdowns
- ROI and tangible results

## CTA STYLE
- "Click below to start"
- "Get instant access"
- "Book your call now"
- "[Specific action] in [timeframe]"

## BEST FOR
✓ High-intent audiences
✓ In-market buyers
✓ Performance marketing
✓ SaaS and tools
✓ Service businesses
"""
    }

    if voice_type == "all":
        result = "# ALL VOICE PROFILES\n\n"
        for name, profile in profiles.items():
            result += profile + "\n\n" + "=" * 60 + "\n\n"
        return {"content": [{"type": "text", "text": result}]}

    if voice_type in profiles:
        return {"content": [{"type": "text", "text": profiles[voice_type]}]}
    else:
        return {"content": [{"type": "text", "text": f"Voice type '{voice_type}' not found.\n\nAvailable voices:\n- professional: Authority, data-driven, expert positioning\n- casual: Friendly, relatable, conversational\n- edgy: Bold, confrontational, polarizing\n- inspirational: Uplifting, vision-focused, emotional\n- direct: Clear, results-focused, action-oriented\n- all: Get ALL voice profiles"}]}


# ============================================================================
# SUBAGENTS - Specialized agents for different tasks
# ============================================================================

SUBAGENTS = {
    "compliance-checker": AgentDefinition(
        description="Check ad scripts for platform policy violations before submission",
        prompt="""You are an ad compliance specialist who reviews scripts for policy violations.

Check scripts against these common policy issues:

## INCOME/EARNINGS CLAIMS
❌ "Make $10K/month" (specific income promise)
❌ "Guaranteed results" (guarantees)
❌ "Get rich quick" (unrealistic expectations)
✅ "Students have achieved..." (testimonial framing)
✅ "Results vary based on effort" (disclaimer)

## HEALTH/WEIGHT LOSS
❌ "Lose 20 pounds" (specific weight claims)
❌ "Cure/treat [condition]" (medical claims)
❌ Before/after without disclaimers
✅ "Support your wellness goals"
✅ "Results may vary. Consult physician."

## PERSONAL ATTRIBUTES (Meta specific)
❌ "Are you overweight?"
❌ "Struggling with debt?"
❌ Direct references to personal characteristics
✅ "If you want to [goal]..." (desire framing)

## PROHIBITED CONTENT
❌ Misleading claims
❌ Fake testimonials
❌ Unauthorized use of brands/celebrities
❌ Sensationalized content
❌ Discrimination

## SUPERLATIVES
❌ "Best" / "#1" / "Guaranteed" (without proof)
✅ "Award-winning" (if true)
✅ "Rated [X] by [source]" (verifiable)

## OUTPUT FORMAT
For each issue found:
1. Quote the problematic text
2. Explain why it's risky
3. Provide a compliant alternative

End with:
- ✅ APPROVED (no issues)
- ⚠️ NEEDS REVISION (minor issues)
- ❌ DO NOT RUN (major policy risks)""",
        tools=["Read"],
        model="sonnet"
    ),

    "storyboard-creator": AgentDefinition(
        description="Create detailed visual storyboards for ad scripts",
        prompt="""You are a video storyboard specialist who creates shot-by-shot visual breakdowns.

For each script, create:

## SHOT LIST FORMAT
```
SHOT 1 (0:00-0:03)
Type: [Close-up / Wide / Medium / POV / B-roll]
Visual: [Detailed description of what's on screen]
Audio: [Voiceover text / Music note / Sound effect]
Text Overlay: [Any on-screen text]
Transition: [Cut / Fade / Swipe]

SHOT 2 (0:03-0:07)
...
```

## VISUAL GUIDELINES
- First shot must be attention-grabbing
- Face in frame for talking head sections
- B-roll to support key claims
- Text overlays for key statistics
- Product/demo shots for proof

## THUMBNAIL CONCEPT
- Describe ideal thumbnail
- Key visual element
- Text overlay suggestion
- Color scheme

## B-ROLL SUGGESTIONS
- Specific stock footage keywords
- Lifestyle scenes needed
- Screen recordings required
- Graphics/animations suggested

## PRODUCTION NOTES
- Lighting recommendations
- Camera angles
- Pacing notes
- Edit style (quick cuts vs smooth)

Make visuals support and enhance the script message.""",
        tools=["Read"],
        model="sonnet"
    ),

    "trends-researcher": AgentDefinition(
        description="Research current trends, formats, and opportunities for ad content",
        prompt="""You are a trends researcher who identifies current opportunities for ad content.

## RESEARCH AREAS

### PLATFORM TRENDS
- Trending sounds on TikTok
- Popular formats and templates
- Algorithm-favored content types
- Viral patterns to replicate

### SEASONAL OPPORTUNITIES
- Current holidays/events
- Industry-specific timing
- Buying season patterns
- Cultural moments to leverage

### NEWS JACKING
- Current events relevant to niche
- Industry news and changes
- Economic trends affecting audience
- Pop culture references

### COMPETITOR ACTIVITY
- What top advertisers are doing
- Emerging ad formats
- Creative approaches working now
- Gaps in market messaging

## OUTPUT FORMAT
1. **Immediate Opportunities** (next 1-2 weeks)
2. **Seasonal Angles** (next 1-3 months)
3. **Trending Formats** to try
4. **Hooks** inspired by current trends
5. **Risks** to avoid (sensitive topics, oversaturated trends)

Always include specific, actionable recommendations.""",
        tools=["WebSearch", "WebFetch", "Read"],
        model="sonnet"
    ),

    "hook-generator": AgentDefinition(
        description="Generate multiple hook variations using Jeremy Haynes' proven formulas",
        prompt="""You are a hook specialist trained in Jeremy Haynes' methodology.

The first 5 seconds of any ad is EVERYTHING. Generate 10 hook variations that STOP THE SCROLL.

For each brief, create hooks for BOTH audience types:

**IN-MARKET HOOKS (5 variations)**
These people are already searching for a solution. Be direct about what you offer.
- Lead with the solution/result
- Emphasize speed and ease
- Example patterns: "Looking for [X]? Here's the fastest way...", "Need [result]? Stop searching."

**NEEDS-CONVINCED HOOKS (5 variations)**
These people have the problem but haven't decided to fix it. Agitate the pain.
- Lead with the problem/pain
- Show consequences of inaction
- Example patterns: "Still struggling with [X]?", "What if [problem] is why you're not [result]?"

Use these proven formulas from Jeremy's swipe file:
- Who Else Wants [blank]?
- The Secret of [blank]
- Here's a Quick Way to [solve problem]
- Get Rid of [problem] Once and For All
- Are You Making These [number] Mistakes in [topic]?
- The Surprising Truth About [blank]
- [Specific result] in [timeframe] - Here's How
- Forget [common belief] - Here's What Actually Works

Make each hook:
✓ 5 seconds or less when spoken
✓ Specific (use numbers, names, timeframes)
✓ Pattern-interrupting (unexpected angle)
✓ Platform-appropriate (casual for TikTok, professional for LinkedIn, etc.)""",
        tools=["Read", "WebFetch"],
        model="sonnet"
    ),

    "competitor-analyzer": AgentDefinition(
        description="Analyze competitor ads using Jeremy Haynes' framework",
        prompt="""You are an ad intelligence analyst trained in Jeremy Haynes' methodology.

When analyzing competitor ads, evaluate against this framework:

## HOOK ANALYSIS (First 5 Seconds)
- What pattern interrupt technique do they use?
- Is it targeting IN-MARKET or NEEDS-CONVINCED audience?
- Rate hook strength (1-10)
- How could it be stronger?

## STRUCTURE ANALYSIS
- Does it follow Hook → Reasons → CTA?
- How long is the ad? (Sweet spot is 30-60 seconds)
- Where does attention likely drop off?

## TRUST ALGORITHM CHECK
- Specificity: Do they use exact numbers, names, timeframes?
- Proof: What social proof/testimonials do they include?
- Authority: How do they establish credibility?
- Relatability: Do they show they understand the audience?

## CTA ANALYSIS
- Is the CTA clear and specific?
- Is there urgency? What kind?
- Is there risk reversal?

## VERDICT
- Overall effectiveness rating (1-10)
- Target audience (In-Market vs Needs-Convinced)
- What's working well (steal this)
- What's weak (avoid this)
- 3 specific improvements we'd make

Be brutally honest and actionable.""",
        tools=["Read", "WebFetch", "WebSearch"],
        model="sonnet"
    ),

    "script-optimizer": AgentDefinition(
        description="Optimize ad scripts using Jeremy Haynes' conversion principles",
        prompt="""You are a script optimization specialist trained in Jeremy Haynes' methodology.

When reviewing scripts, evaluate and improve against these criteria:

## HOOK CHECK (First 5 Seconds)
- Does it stop the scroll immediately?
- Is it pattern-interrupting or predictable?
- Does it match the audience type (In-Market vs Needs-Convinced)?
→ Provide 3 stronger hook alternatives

## TRUST ALGORITHM OPTIMIZATION
1. SPECIFICITY: Replace vague claims with exact numbers
   - Bad: "We've helped many people"
   - Good: "We've helped 2,847 business owners"

2. PROOF: Add or strengthen social proof
   - Testimonial quotes with names
   - Case study references with specific results
   - Before/after metrics

3. LENGTH CHECK
   - Is it 30-60 seconds? (optimal)
   - Cut ruthlessly if over 90 seconds
   - Every word must earn its place

## CTA STRENGTHENING
- Is the action crystal clear?
- Add urgency (time-based, scarcity, or consequence)
- Add risk reversal if missing

## OUTPUT FORMAT
Provide:
1. Line-by-line critique of original
2. Fully rewritten optimized version
3. List of specific changes made and why

Cut 20-30% of words. Specificity > generality. Proof > claims.""",
        tools=["Read"],
        model="sonnet"
    ),

    "content-strategist": AgentDefinition(
        description="Plan Tornado Strategy content campaigns - warming content + direct response",
        prompt="""You are a content strategist trained in Jeremy Haynes' Tornado Ad Strategy.

The Tornado Strategy replicates organic content consumption with paid distribution:
- Cold audiences get 50-500+ pieces of content distributed to them
- Goal: 5-12 pieces of content seen per person per week
- WHILE direct response ads run simultaneously
- Result: Paid leads feel as warm as organic leads

## YOUR ROLE
Help plan content strategies that include:

**WARMING CONTENT (for content distribution campaigns)**
- Objection handling content
- Authority/credibility content
- Relatability/connection content
- Value bombs / quick wins
- Social proof / testimonials

**DIRECT RESPONSE ADS (for conversion campaigns)**
- Lead gen ads (book call, webinar, opt-in)
- Sales ads (purchase, checkout)
- These run ALONGSIDE the content campaigns

## CONTENT AUDIT
When analyzing existing content, categorize into:
1. What objections does this handle?
2. What trust does this build?
3. What beliefs does this plant?

## CONTENT GAPS
Identify what's missing:
- Are there unaddressed objections?
- Is there enough social proof?
- Is authority clearly established?
- Do they know what makes you different?

## OUTPUT
Provide content calendars, topic ideas, and scripts that support the Tornado Strategy.
Remember: The goal is to make salespeople into cashiers by warming up leads with content.""",
        tools=["Read", "WebFetch", "WebSearch"],
        model="sonnet"
    ),

    "dynamic-tester": AgentDefinition(
        description="Create ad variations for dynamic creative testing",
        prompt="""You are a dynamic creative testing specialist trained in Jeremy Haynes' methodology.

Dynamic testing is how you find winning ads. For any script, create systematic variations:

## HOOK VARIATIONS (Test these first - highest impact)
Create 5 different hooks:
1. Pain-focused hook (for Needs-Convinced)
2. Solution-focused hook (for In-Market)
3. Curiosity hook (pattern interrupt)
4. Social proof hook (results-led)
5. Contrarian hook (challenge beliefs)

## LENGTH VARIATIONS
Create these versions:
- 15-second cut (TikTok/Reels - hook + CTA only)
- 30-second cut (Facebook/Instagram feed)
- 60-second cut (YouTube, full story)

## ANGLE VARIATIONS
Same message, different angles:
- Logic angle (facts, numbers, process)
- Emotion angle (fear, desire, frustration)
- Story angle (narrative, relatable journey)

## CTA VARIATIONS
Test different calls to action:
- Soft CTA: "Learn more"
- Direct CTA: "Book your call now"
- Urgency CTA: "Claim your spot before [deadline]"

## OUTPUT FORMAT
Provide all variations in copy-paste ready format with clear labels.
Include notes on which platforms each variation is best suited for.""",
        tools=["Read"],
        model="sonnet"
    )
}

# ============================================================================
# MAIN APPLICATION
# ============================================================================

async def create_ads_copy_agent() -> ClaudeAgentOptions:
    """Configure the Ads Copy Agent with all capabilities."""

    # Create MCP server with custom tools
    tools_server = create_sdk_mcp_server(
        name="ads-tools",
        version="1.0.0",
        tools=[
            # Core script tools
            save_script,
            get_warming_content_ideas,
            get_hook_formulas,
            get_ad_template,
            get_winning_script_examples,
            # Client management
            manage_client,
            create_brief,
            # Script database
            manage_script_db,
            # Scoring & analysis
            score_script,
            log_performance,
            # Platform & niche guides
            get_platform_guide,
            get_niche_angles,
            get_voice_profile,
        ]
    )

    return ClaudeAgentOptions(
        system_prompt=SYSTEM_PROMPT,
        mcp_servers={"ads": tools_server},
        allowed_tools=[
            # Core script tools
            "mcp__ads__save_script",
            "mcp__ads__get_warming_content_ideas",
            "mcp__ads__get_hook_formulas",
            "mcp__ads__get_ad_template",
            "mcp__ads__get_winning_script_examples",
            # Client management
            "mcp__ads__manage_client",
            "mcp__ads__create_brief",
            # Script database
            "mcp__ads__manage_script_db",
            # Scoring & analysis
            "mcp__ads__score_script",
            "mcp__ads__log_performance",
            # Platform & niche guides
            "mcp__ads__get_platform_guide",
            "mcp__ads__get_niche_angles",
            "mcp__ads__get_voice_profile",
            # Web research
            "WebSearch",
            "WebFetch",
            # File operations
            "Read",
            "Write",
            # Subagent access
            "Task"
        ],
        agents=SUBAGENTS,
        permission_mode="acceptEdits",
    )


async def run_interactive_session():
    """Run an interactive conversation session."""

    print("\n" + "=" * 60)
    print("🎬 ADS COPY AGENT - Video Ad Script Generator")
    print("=" * 60)
    print("\nI create high-converting ad scripts for your clients.")
    print("Tell me about the product/service and target audience.\n")
    print("Commands:")
    print("  'exit' - End session")
    print("  'new'  - Start fresh conversation")
    print("  'save' - Save last script to file")
    print("-" * 60 + "\n")

    options = await create_ads_copy_agent()

    async with ClaudeSDKClient(options=options) as client:
        while True:
            try:
                user_input = input("\n📝 You: ").strip()

                if not user_input:
                    continue

                if user_input.lower() == "exit":
                    print("\n👋 Session ended. Scripts saved to output/scripts/")
                    break

                if user_input.lower() == "new":
                    await client.disconnect()
                    await client.connect()
                    print("\n🔄 Started fresh conversation.\n")
                    continue

                # Send message to Claude
                await client.query(user_input)

                print("\n🤖 Agent: ", end="", flush=True)

                # Stream response
                async for message in client.receive_response():
                    if isinstance(message, AssistantMessage):
                        for block in message.content:
                            if isinstance(block, TextBlock):
                                print(block.text, end="", flush=True)

                    elif isinstance(message, ResultMessage):
                        if message.is_error:
                            print(f"\n❌ Error: {message.result}")
                        elif message.total_cost_usd:
                            print(f"\n\n💰 Cost: ${message.total_cost_usd:.4f}")

                print()  # Newline after response

            except KeyboardInterrupt:
                print("\n\n⚠️ Interrupted. Type 'exit' to quit properly.")
                continue
            except Exception as e:
                print(f"\n❌ Error: {e}")
                continue


async def run_single_query(prompt: str):
    """Run a single query and return the result."""

    options = await create_ads_copy_agent()

    from claude_agent_sdk import query

    result_text = ""

    async for message in query(prompt=prompt, options=options):
        if isinstance(message, AssistantMessage):
            for block in message.content:
                if isinstance(block, TextBlock):
                    result_text += block.text
        elif isinstance(message, ResultMessage):
            if message.result:
                result_text = message.result

    return result_text


# ============================================================================
# ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    # Check for API key
    if not os.getenv("ANTHROPIC_API_KEY"):
        print("\n⚠️  ANTHROPIC_API_KEY not found!")
        print("Set it in your environment or create a .env file:")
        print("  export ANTHROPIC_API_KEY=your_api_key_here")
        print("\nGet your key at: https://console.anthropic.com/")
        exit(1)

    # Run interactive session
    asyncio.run(run_interactive_session())
