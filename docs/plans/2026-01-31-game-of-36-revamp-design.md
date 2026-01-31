# Game of 36 - Complete Revamp Design

**Date:** 2026-01-31
**Status:** Approved

---

## Overview

A complete revamp of the Game of 36 puzzle app, transforming it from a prototype into a polished, modern mobile game with proper progression, smart puzzle generation, and engaging user experience.

---

## Visual Design

### Theme System

Two interchangeable themes, both sharing the same layout and structure:

#### Dark & Sleek (Default)

| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#0D0D0F` → `#1A1A2E` gradient | Main background |
| `surface` | `#1F1F2E` | Cards, buttons |
| `primary` | `#00F5FF` | Active elements, cyan glow |
| `secondary` | `#8B5CF6` | Progress, stars |
| `success` | `#00FF88` | Win state |
| `text` | `#FFFFFF` | Primary text |
| `textMuted` | `#6B7280` | Secondary text |

World accent colors:
- Easy: Cyan `#00F5FF`
- Medium: Purple `#8B5CF6`
- Hard: Hot pink `#FF006E`

#### Playful & Colorful

| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#667EEA` → `#F093FB` gradient | Main background |
| `surface` | `#FFFFFF` | Cards, buttons |
| `primary` | `#FBBF24` | Active elements, yellow |
| `secondary` | `#7C3AED` | Progress, numbers |
| `success` | `#34D399` | Win state |
| `text` | `#1F2937` | Primary text |
| `textMuted` | `#6B7280` | Secondary text |

### Component Styling

**Number Buttons:**
- Dark: Glass-morphism cards with inner glow, cyan outline when selected
- Playful: White rounded squares with shadow, bounce animation on tap

**Operator Buttons:**
- Dark: Outlined circles, fill on tap
- Playful: Filled colorful pills

**Typography:**
- Dark: Inter or SF Pro (clean, minimal)
- Playful: Nunito (rounded, friendly)

**Animations:**
- Dark: Smooth fades, subtle pulses
- Playful: Bouncy spring physics, confetti on success

---

## App Structure & Navigation

### Screen Flow

```
Splash (1.5s)
    ↓
Home Menu
    ├→ Campaign → World Select → Level Select → Game → Results
    ├→ Endless → Game → Results
    ├→ Stats Dashboard
    └→ Settings
```

### Home Menu Screen

- App logo with subtle animation
- Three main cards:
  - **Campaign**: "Master the 36" + progress indicator (e.g., "12/55 levels")
  - **Endless**: "Never-ending puzzles" + current streak
  - **Stats**: "Your journey" + quick stat preview
- Settings gear icon (sound, theme toggle)

### Campaign Structure

| World | Levels | Unlock Requirement |
|-------|--------|-------------------|
| Easy | 20 | Available from start |
| Medium | 20 | Complete 80% of Easy (16 levels) |
| Hard | 15 | Complete 80% of Medium (16 levels) |

Total: 55 curated levels

### Navigation Improvements

- Swipe right: go back
- Swipe left: next level (after completion)
- Persistent bottom bar during gameplay: Home | Reset | Hint
- Smooth slide/fade transitions between screens

---

## Gameplay Design

### Game Screen Layout

```
┌────────────────────────────────┐
│  ←  Level 12 · Easy      ★★☆  │  Header
├────────────────────────────────┤
│           [ 36 ]               │  Target (always visible)
│         ─────────              │
│           [ 12 ]               │  Current result
├────────────────────────────────┤
│   ┌────┐ ┌────┐ ┌────┐ ┌────┐ │
│   │  3 │ │  4 │ │  6 │ │  2 │ │  Number buttons
│   └────┘ └────┘ └────┘ └────┘ │
├────────────────────────────────┤
│     (+)  (-)  (×)  (÷)        │  Operator buttons
├────────────────────────────────┤
│   Home      Reset      Hint    │  Action bar
└────────────────────────────────┘
```

### Interaction Flow

1. Tap number → glows, lifts with shadow
2. Tap operator → operator fills, expression builds: `3 +`
3. Tap second number → calculation animates, result appears
4. Used numbers fade to ghost state (visible but dimmed)
5. Repeat until result === 36

### Undo Feature

- Tap current result to undo last operation
- Used numbers restore from ghost state
- Prevents frustration from misclicks

### Hint System

- First hint free per level
- Additional hints earned through streaks
- Hint highlights which number to tap next (subtle pulse)

---

## Difficulty System

### Parameters by Difficulty

| Parameter | Easy | Medium | Hard |
|-----------|------|--------|------|
| Operators | +, - | +, -, × | +, -, ×, ÷ |
| Solutions | Multiple paths | 2-3 paths | Single valid path |
| Complexity | Simple chains | Some order matters | Specific sequence required |
| Number range | 1-12 | 1-15 | 1-20 |

### Star Rating Criteria

- ★☆☆ - Solved (any method)
- ★★☆ - Solved in optimal moves OR under time threshold
- ★★★ - Solved in optimal moves AND under time threshold

Thresholds determined per-level based on optimal solution.

---

## Puzzle Generation Algorithm

### Core Approach: Reverse Generation

Start from 36 and work backwards, splitting into operations:

```
Step 1: Start with target (36)
Step 2: Pick random operator, split into two operands
        36 = 6 × 6  OR  36 = 40 - 4  OR  36 = 9 + 27
Step 3: Recursively split operands
Step 4: Stop when exactly 4 leaf numbers remain
```

### Example

```
36
├─ × → 6 and 6
│      ├─ 6 = 2 + 4 → [2, 4]
│      └─ 6 = 3 × 2 → [3, 2]
Result: [2, 4, 3, 2] ✓
Solution: (2+4) × (3×2) = 6 × 6 = 36
```

### Difficulty Control

| Difficulty | Allowed Operators | Tree Depth | Solution Uniqueness |
|------------|-------------------|------------|---------------------|
| Easy | +, - | 2-3 | Multiple paths allowed |
| Medium | +, -, × | 3 | 2-3 valid paths |
| Hard | +, -, ×, ÷ | 3 | Single valid path |

### Variety Guarantees

- Track recently generated number sets, avoid repeats
- Enforce operator diversity across consecutive puzzles
- Validate all generated puzzles have valid solutions

---

## Rewards & Progress

### Success Screen

```
┌────────────────────────────────┐
│            ✓ 36                │
│          ★ ★ ★                 │
│       "Perfect Solve!"         │
│                                │
│    Moves: 3    Best: 3         │
│    Time: 12s   Best: 10s       │
│                                │
│   [ Home ]      [ Next ]       │
│                                │
│        🔥 5 day streak         │
└────────────────────────────────┘
```

### Streak System

- **Daily streak**: Play at least 1 puzzle per day
- **Solve streak**: Consecutive solves without reset
- Streaks displayed on home menu and results
- Streak freeze option (earned or via ad)

### Stats Dashboard

```
┌────────────────────────────────┐
│  OVERVIEW                      │
│  🧩 142 Puzzles   🔥 12 Days   │
│  ⭐ 89 Stars                   │
├────────────────────────────────┤
│  CAMPAIGN PROGRESS             │
│  ████████████░░░░  38/55       │
│  Easy   20/20 ★★★              │
│  Medium 14/20                  │
│  Hard    4/15                  │
├────────────────────────────────┤
│  ENDLESS MODE                  │
│  Best run: 23    Total: 87     │
├────────────────────────────────┤
│  PLAY STYLE                    │
│  Avg time: 18s                 │
│  Favorite op: × (45%)          │
│  Perfect solves: 34            │
└────────────────────────────────┘
```

---

## Onboarding

### First Launch Flow

```
Splash → Welcome Screen → Tutorial Level → Home Menu
```

### Welcome Screen

- App title and tagline: "Combine 4 numbers to make exactly 36"
- Primary CTA: "Let's Learn"
- Secondary: "Skip Tutorial →" (subtle)

### Interactive Tutorial

**Level 0:** Numbers `[9, 9, 9, 9]`

Step-by-step with dimmed overlay:

1. "Tap a number to select it" → pulse on any 9
2. Player taps → "Great! Now pick an operator" → pulse on +
3. Player taps + → "Tap another number to combine"
4. Player taps 9 → shows 18, "You made 18! Keep going..."
5. Player finishes freely
6. Success: "You got it! Now try the real puzzles."

### Returning Players

- Tutorial completion saved to storage
- "How to Play" accessible from settings anytime

---

## Technical Implementation

### Project Structure

```
/src
  /components
    Button.js
    NumberCard.js
    OperatorButton.js
    StarRating.js
    ProgressBar.js
    Modal.js
  /screens
    SplashScreen.js
    HomeScreen.js
    CampaignScreen.js
    LevelSelectScreen.js
    GameScreen.js
    ResultScreen.js
    EndlessScreen.js
    StatsScreen.js
    TutorialScreen.js
    SettingsScreen.js
  /themes
    dark.js
    playful.js
    ThemeContext.js
  /logic
    puzzleGenerator.js
    difficultyConfig.js
    starCalculator.js
  /data
    campaignLevels.js
    storage.js
  /navigation
    AppNavigator.js
App.js
```

### Dependencies

```json
{
  "@react-navigation/native": "^6.x",
  "@react-navigation/stack": "^6.x",
  "react-native-reanimated": "^3.x",
  "expo-linear-gradient": "^12.x",
  "@react-native-async-storage/async-storage": "^1.x"
}
```

### Data Persistence (AsyncStorage)

- `progress`: Campaign completion, stars per level
- `streaks`: Daily streak count, last play date
- `stats`: Total solves, times, operator usage
- `settings`: Theme preference, sound, tutorial completed

---

## Summary

| Aspect | Decision |
|--------|----------|
| Themes | Dark & Sleek (default) + Playful & Colorful |
| Levels | 55 campaign (20 Easy, 20 Medium, 15 Hard) + Endless |
| Algorithm | Reverse generation from 36 |
| Difficulty | Operator restrictions, solution uniqueness, step complexity |
| Rewards | 1-3 stars, daily/solve streaks, stats dashboard |
| Onboarding | Interactive tutorial (9+9+9+9), skippable |
| Navigation | Swipe gestures, smooth transitions, bottom action bar |
