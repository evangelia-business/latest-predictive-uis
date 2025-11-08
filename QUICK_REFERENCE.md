# Quick Reference Card
**Print this and keep it handy during your presentation!**

---

## ⏱️ Timing At-a-Glance

| Min | Section | Key Points |
|-----|---------|------------|
| 0-3 | Intro | Hook with "What if UIs could show thinking?" |
| 3-7 | Reactive Problem | Traditional loading, black box, anxiety |
| 7-11 | Thinking UIs | Progressive disclosure, transparency, trust |
| 11-19 | Technical Arch | SSE, ReadableStream, event format |
| 19-29 | React Deep Dive | useReducer, custom hooks, startTransition |
| 29-34 | Product Design | UX patterns, when to use, accessibility |
| 34-39 | Live Demo | Show UI → DevTools → Code |
| 39-40 | Wrap Up | Key takeaways, GitHub link |

---

## 🎯 Key Messages

1. **UIs are evolving** from reactive → predictive/transparent
2. **SSE enables** real-time streaming with simple HTTP
3. **React patterns** (useReducer, concurrent) handle complexity
4. **Progressive disclosure** builds trust and reduces anxiety
5. **These patterns work** with any backend (simulated or real AI)

---

## 🎬 Demo Flow (5 min)

1. **Show interface** (45s)
   - "Clean, simple UI with question input"

2. **Ask question** (90s)
   - Type: "What's the best programming language for beginners?"
   - Watch thoughts stream progressively
   - "Transforms waiting into engagement"

3. **Toggle visibility** (30s)
   - Click Hide → Show
   - "User control is critical"

4. **DevTools** (60s)
   - Network → EventSource connection
   - "One connection, real-time updates"

5. **Server code** (60s)
   - route.js → ReadableStream
   - "Simple, works with any AI backend"

6. **React code** (60s)
   - Canvas.js → useReducer + startTransition
   - "Clean state management"

7. **Wrap** (30s)
   - "SSE + React = thinking UIs"

---

## 🔑 Code Highlights

### Server (route.js)
```javascript
const stream = new ReadableStream({
  start(controller) {
    controller.enqueue(`data: ${JSON.stringify({...})}\n\n`);
  }
});
return new Response(stream, { headers });
```

### Client (Canvas.js)
```javascript
const [state, dispatch] = useReducer(aiReducer, initialState);

onMessage('thinking', (data) => {
  startTransition(() => {
    dispatch({ type: 'ADD_THOUGHTS', payload: data.thoughts });
  });
});
```

---

## 💡 Transition Lines

**Intro → Reactive:**
> "Let's start with how we've built UIs traditionally..."

**Reactive → Thinking:**
> "But there's a better way emerging..."

**Thinking → Technical:**
> "So how do we actually build this? Let me show you..."

**Technical → React:**
> "Now on the client side, React handles this elegantly..."

**React → Design:**
> "The technical patterns enable new UX possibilities..."

**Design → Demo:**
> "Let me show you this in action..."

**Demo → Wrap:**
> "So that's the full picture. Let's recap the key takeaways..."

---

## 🚨 Emergency Fixes

**Dev server not responding:**
```bash
npm run dev -- --port 3002
```

**Browser cache:**
- Cmd/Ctrl + Shift + R (hard refresh)

**Can't see EventSource:**
- Refresh with DevTools open
- Check "All" filter in Network tab

**Code too small:**
- Browser: Cmd/Ctrl + Plus
- VS Code: View → Appearance → Zoom In

**Demo breaks:**
- Use backup video recording
- "Let me show you a recording instead..."

---

## ❓ Q&A Fast Answers

**"How with real AI?"**
→ "Replace simulated loop with OpenAI streaming. React stays the same."

**"Why SSE vs WebSockets?"**
→ "SSE is simpler for one-way streaming. Works with serverless. Auto-reconnects."

**"Mobile?"**
→ "EventSource works everywhere. Collapse by default. Debounce updates to 3s."

**"Error handling?"**
→ "EventSource auto-reconnects. Implement retry logic with backoff. Show friendly errors."

**"Scale?"**
→ "Each SSE holds connection. Use Cloudflare Workers or message queues at scale."

**"Testing?"**
→ "Unit test reducer (pure). Mock EventSource in integration. E2E with Playwright."

**"When NOT to use?"**
→ "Fast ops (<1s), security-sensitive, mobile-only, or simplicity is goal."

---

## 📊 Slides to Emphasize

**Slide #8:** Reactive vs Thinking diagram (pause here)
**Slide #12:** SSE architecture (explain thoroughly)
**Slide #18:** useReducer pattern (show how clean it is)
**Slide #25:** Progressive disclosure psychology (key insight)
**Slide #35:** Key takeaways (repeat 3x)

---

## 🎤 Energy Checkpoints

**Min 0:** HIGH energy - Hook them!
**Min 10:** Maintain - Technical content
**Min 20:** BOOST - "Now here's where it gets cool..."
**Min 30:** Maintain - Design section
**Min 34:** HIGH - "Let me show you live..."
**Min 39:** PEAK - Final takeaways

---

## ✋ If Running Over Time

**Cut these:**
- Skip some thinking UI examples (slide 10-11)
- Shorten DevTools section (30s instead of 60s)
- Skip showing custom hook code
- Reduce Q&A time

**Keep these:**
- Opening hook (critical)
- Live demo (the wow moment)
- Server code walkthrough
- React code walkthrough
- Final takeaways

---

## 🎯 Opening Lines

Option 1:
> "What if your UI could show its thinking? Not just a spinner, not just 'loading,' but actual step-by-step reasoning?"

Option 2:
> "Raise your hand if you've stared at a loading spinner wondering if the system is working or stuck. Keep it up if you've abandoned a task because of that uncertainty."

Option 3:
> "AI is changing how we build interfaces. Today I'll show you how to build UIs that think out loud."

Pick the one that feels most natural!

---

## 🎯 Closing Lines

Option 1:
> "The future of UIs isn't just faster—it's more transparent. And with SSE and React, you can build that future today."

Option 2:
> "These patterns work whether you're simulating responses or calling real AI. The architecture is ready. Now go build transparent UIs that users trust."

Option 3:
> "Remember: Users don't just want fast—they want to understand. Show them your thinking, and they'll trust your answers. Thank you!"

---

## 📱 Important Links

**GitHub:** github.com/yourname/real-time-ai-simulation
**Twitter:** @yourhandle
**Email:** your@email.com
**Slides:** yoursite.com/thinking-uis

Write these on whiteboard or slide!

---

## ✅ Pre-Talk Checklist

**10 Min Before:**
- [ ] Bathroom break
- [ ] Water bottle filled
- [ ] Phone on silent
- [ ] Laptop plugged in
- [ ] Demo running (http://localhost:3001)
- [ ] VS Code open with files ready
- [ ] DevTools ready
- [ ] Backup video accessible

**5 Min Before:**
- [ ] Deep breaths
- [ ] Power pose
- [ ] Review opening lines
- [ ] Check mic/clicker
- [ ] Smile!

---

## 🎭 Remember

- ✅ Audience wants you to succeed
- ✅ You know this better than anyone
- ✅ Small mistakes don't matter
- ✅ Your enthusiasm is contagious
- ✅ Focus on value you're providing
- ✅ Have fun with it!

---

## 🚀 YOU'VE GOT THIS!

Take a deep breath.
You're prepared.
You're going to do great.

Break a leg! 🎉
