# Building Predictive UIs with AI

A Next.js demo showcasing three predictive UI techniques that make AI interfaces feel instant and intelligent. Built for conference talks and educational purposes.

## 🎯 The Three Predictive Techniques

### 1. **Streaming Thinking Process**
Shows AI reasoning in real-time instead of generic loading spinners.

**Why it matters:** Transparency builds trust. Users see progress, not just waiting.

**How it works:**
- Server-Sent Events (SSE) stream thinking steps progressively
- Each thought appears with realistic timing (~800ms intervals)
- Final answer clearly distinguished from thinking process
- Users can toggle visibility for better mobile experience

**Tech:** ReadableStream API, Server-Sent Events, React useReducer

---

### 2. **Context-Aware Suggestions**
AI analyzes full conversation history to predict the user's journey and suggest relevant follow-up questions.

**Why it matters:** Most apps suggest the same questions to everyone. We predict where YOU'RE heading based on YOUR conversation.

**Example flow:**
```
User: "What's the best programming language?"
  → Suggestions: Frameworks, learning resources

User: "What frameworks for web development?"
  → Suggestions: Frontend/backend, databases, deployment

User: "How do I deploy a web app?"
  → Suggestions: Docker, CI/CD, hosting platforms

The system recognizes: learning → web dev → deployment journey
```

**How it works:**
- Tracks full conversation history (questions + answers)
- Analyzes themes (programming, web-dev, career, etc.)
- Detects progression level (beginner → intermediate → advanced)
- Generates journey-aware suggestions using Ollama (local LLM)
- Pattern matching fallback for reliability

**Tech:** Ollama (llama3.2), conversation analysis, multi-theme detection

---

### 3. **Predictive Caching**
Pre-fetches AI answers for predicted questions using confidence scores. When predictions are correct, responses load instantly (0ms vs 3-10s).

**Why it matters:** The difference between fast and feeling psychic.

**The Innovation:**
```
Traditional (TanStack Query):  You decide what to prefetch
Our Approach:                  AI predicts what user will click
```

**How it works:**
- System generates 4 contextual suggestions with confidence scores (0-1)
- Sorts by confidence: `{ question: "...", confidence: 0.95 }`
- Prefetches the **top 2 highest-confidence** predictions in background
- On click: Cached = instant (⚡ 0ms), Not cached = fresh API call (~3-10s)
- Cache window is intentionally short-lived (current suggestions only)

**Smart Resource Allocation:**
- Don't prefetch everything (expensive)
- Prioritize by AI confidence scores
- Only prefetch what's most likely to be clicked

**Tech:** EventSource, Map-based cache, confidence sorting, background prefetching

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Ollama installed locally (optional, has fallback)

### Installation

```bash
# Clone the repo
git clone https://github.com/[your-username]/predictive-uis.git
cd predictive-uis

# Install dependencies
npm install

# (Optional) Install Ollama and pull llama3.2
# https://ollama.com/download
ollama pull llama3.2

# Start dev server
npm run dev
```

### Open the demo
Visit http://localhost:3000

---

## 📖 Demo Walkthrough

### See Streaming in Action:
1. Ask: "What's the best programming language for beginners?"
2. Watch thinking steps appear progressively
3. See final answer with formatted text (bold, lists)

### See Context-Aware Suggestions:
1. Ask a programming question
2. Click a suggested follow-up
3. Notice suggestions evolve based on conversation journey
4. Try changing topics (medicine, cooking) - watch it adapt

### See Predictive Caching:
1. Open browser console
2. Ask a question → Watch for `🎯 [PREFETCH BATCH]` logs
3. Wait for `✅ [PREFETCH] Cached answer` logs
4. Click a cached suggestion → See `⚡ [CACHE HIT]` and instant load
5. See "⚡ Loaded from cache" indicator in UI

**Console Logs You'll See:**
```
🎯 [PREFETCH BATCH] Prefetching top 2 by confidence:
  [{ question: "...", confidence: 0.95 }, ...]

🔄 [PREFETCH] Starting prefetch for: Question 1
✅ [PREFETCH] Cached answer for: Question 1
📦 [CACHE DATA] { answerLength: 450, thoughtsCount: 8 }

⚡ [CACHE HIT] Retrieved from cache: Question 1
⏱️ [PERFORMANCE] Load time: ~0ms (vs 3-10s for fresh API call)
```

---

## 🏗️ Architecture

### Key Files

**Server-side streaming:**
- `src/app/api/socket/route.js` - SSE endpoint with Ollama integration
- `src/app/api/suggestions/route.js` - Context-aware suggestion generation

**Client-side:**
- `src/app/components/Canvas.js` - Main UI component with conversation history
- `src/app/hooks/useServerSentEvents.js` - SSE connection management
- `src/app/hooks/usePrefetch.js` - Predictive caching with confidence sorting
- `src/app/utils/suggestions.js` - Suggestion generation utilities

**Key Patterns:**
- React useReducer for complex state management
- startTransition for non-urgent updates
- useMemo for performance optimization
- Conversation history tracking
- Confidence-based resource allocation

---

## 🎓 Educational Use

This demo is perfect for:
- Conference talks on Predictive UI
- Workshops on AI integration
- Teaching SSE and real-time patterns
- Demonstrating React 19 features
- Examples of smart caching strategies

### Presenting This Demo:

**3-Technique Narrative:**
1. **Start:** "What makes interfaces feel intelligent?"
2. **Demo Technique #1:** Show streaming thinking
3. **Demo Technique #2:** Show conversation journey with evolving suggestions
4. **Demo Technique #3:** Open console, show prefetching and cache hits
5. **Key Insight:** "We're not just fast - we're predictive. The AI anticipates user intent."

**Code Walkthrough Order:**
1. Show `route.js` - SSE streaming
2. Show `suggestions/route.js` - Conversation analysis
3. Show `usePrefetch.js` - Confidence sorting (line 87-92)
4. Show console logs live

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **React:** v19 (useReducer, startTransition, useMemo)
- **AI:** Ollama (llama3.2) with pattern-matching fallback
- **Streaming:** Server-Sent Events, ReadableStream API
- **Caching:** Map-based with confidence scoring
- **Styling:** CSS modules

---

## 🔄 Fallback Strategy

System degrades gracefully:

1. **Ollama available** → Smart AI suggestions with conversation analysis
2. **Ollama fails** → Pattern-matching fallback with theme detection
3. **Initial suggestions** → Hardcoded diverse topics to start conversation

Check console for `source: "ollama"` vs `source: "pattern-matching"`

---

## 🎯 Key Talking Points

### For Conferences:

**"What makes this different from TanStack Query?"**
> "TanStack Query requires you to explicitly say what to prefetch. We use AI confidence scores to predict what the user will click based on conversation context. It's the difference between manual and intelligent prefetching."

**"How do you know which suggestions to cache?"**
> "We sort suggestions by AI confidence scores and prefetch the top 2. Higher confidence = more likely to be clicked = better use of server resources."

**"What about stale cache?"**
> "The cache window is intentionally short-lived - only for current suggestions. After asking a new question, new suggestions replace old ones. It's ephemeral, contextual caching - just like predictive UI should be."

**"Does the conversation history really matter?"**
> "Absolutely. Try asking about programming → web dev → deployment. Watch the suggestions evolve from frameworks to Docker and CI/CD. It understands your *journey*, not just your last question."

---

## 📊 Performance Metrics

**Streaming:**
- First thought: ~800ms
- Subsequent thoughts: ~800ms intervals
- Total thinking time: 6-8 seconds (realistic AI timing)

**Caching:**
- Cache hit: ~0-5ms (instant)
- Cache miss: 3-10s (fresh API call with Ollama)
- Prefetch overhead: Runs in background, doesn't block UI

**Confidence Sorting:**
- Average confidence range: 0.82-0.95
- Top 2 typically have 0.90+ confidence
- Pattern matching assigns manual scores, Ollama generates them

---

## 🤝 Contributing

This is an educational demo. Feel free to:
- Fork for your own talks
- Adapt the techniques
- Add new predictive patterns
- Share improvements

---

## 📝 License

MIT - Use this for your talks, workshops, and projects

---

## 🙏 Acknowledgments

- Vercel for Next.js
- Ollama for local LLM capabilities
- React team for concurrent features
- Conference attendees for feedback

---

## 📚 Further Reading

- [Server-Sent Events MDN](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [React 19 startTransition](https://react.dev/reference/react/startTransition)
- [Ollama Documentation](https://ollama.com/docs)
- [Predictive UI Patterns](https://www.smashingmagazine.com/2022/04/designing-better-predictive-ui/)

---

**Built for conference talks about predictive UI patterns** ✨

Questions? Open an issue or reach out on [Twitter/LinkedIn]
