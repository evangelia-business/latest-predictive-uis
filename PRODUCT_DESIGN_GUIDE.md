# Product Design Guide: Thinking UIs

## Overview
This guide explores the UX and product design implications of "thinking UIs" - interfaces that show their reasoning process in real-time through progressive disclosure.

---

## 1. User Psychology & Research

### The Waiting Problem

**Traditional Research:**
- Users abandon forms after 3 seconds of waiting (Forrester Research)
- 47% of consumers expect a web page to load in 2 seconds or less (Akamai)
- Every 100ms delay costs 1% in sales (Amazon)

**The Paradox:**
AI operations often take 10-30+ seconds, yet users stay engaged. Why?

### Progressive Disclosure Reduces Perceived Wait Time

**Key Findings:**
1. **Active vs Passive Waiting**
   - Passive: Staring at spinner = feels longer
   - Active: Watching progress = feels shorter
   - Research shows 30-40% reduction in perceived wait time

2. **The Progress Effect**
   - Seeing incremental progress creates engagement
   - Users feel the system is "working" not "stuck"
   - Builds confidence in the outcome

3. **Narrative Creates Investment**
   - Watching "thinking" creates a story
   - Users become invested in the process
   - Less likely to abandon mid-stream

### Trust Through Transparency

**Research by Stanford HCI Group:**
- **79% of users** trust AI more when they see reasoning
- **65% more likely** to accept AI decisions when process is visible
- **Explainability** is the #1 feature users want in AI systems

**Quote from study:**
> "When users understand 'why,' they trust 'what.' Transparency isn't just nice to have—it's fundamental to AI adoption."

---

## 2. Design Patterns for Thinking UIs

### Pattern 1: Progressive Thought Stream

**Description:** Display thoughts as they arrive, building up a list of reasoning steps.

```
┌────────────────────────────────┐
│ 🧠 AI is thinking...       [▼] │
├────────────────────────────────┤
│ ● Step 1: Analyzing question   │
│ ● Step 2: Researching context  │
│ ● Step 3: Evaluating options   │
│ ⋯ Continuing...                │
└────────────────────────────────┘
```

**When to use:**
- Multi-step reasoning
- Complex analysis
- Research-heavy tasks

**Implementation:**
```jsx
<div className="thought-stream">
  {thoughts.map((thought, index) => (
    <div key={index} className="thought-item fade-in">
      <span className="bullet">●</span>
      <span className="text">{thought}</span>
    </div>
  ))}
  {isThinking && <div className="thinking-indicator">⋯</div>}
</div>
```

### Pattern 2: Collapsible Thinking Panel

**Description:** Allow users to show/hide the thinking process while it runs.

```
Collapsed:
┌────────────────────────────────┐
│ 🧠 AI is thinking...    [Show] │
└────────────────────────────────┘

Expanded:
┌────────────────────────────────┐
│ 🧠 AI is thinking...    [Hide] │
├────────────────────────────────┤
│ Step 1: Analyzing...           │
│ Step 2: Researching...         │
└────────────────────────────────┘
```

**When to use:**
- Power users who want control
- Mobile interfaces (save space)
- Repeated interactions

**Implementation:**
```jsx
const [showThinking, setShowThinking] = useState(true);

<div className="thinking-panel">
  <button onClick={() => setShowThinking(!showThinking)}>
    {showThinking ? 'Hide' : 'Show'} thinking
  </button>
  {showThinking && <ThoughtStream thoughts={thoughts} />}
</div>
```

### Pattern 3: Gradient Overlay for Scrollable Content

**Description:** Visual indicator that there's more thinking content below.

```
┌────────────────────────────────┐
│ Step 1: Analyzing question     │
│ Step 2: Researching context    │
│ Step 3: Evaluating options     │
│ Step 4: Considering trade-offs │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ← Gradient
└────────────────────────────────┘
```

**When to use:**
- Long thought streams (5+ steps)
- Fixed-height containers
- Need to show "more below"

**Implementation:**
```css
.thought-stream {
  position: relative;
  max-height: 300px;
  overflow-y: auto;
}

.gradient-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(
    to bottom,
    transparent,
    var(--background-color)
  );
  pointer-events: none;
}
```

### Pattern 4: Step Progress Indicator

**Description:** Show current step number and total steps.

```
┌────────────────────────────────┐
│ 🧠 Thinking... (3/10)          │
├────────────────────────────────┤
│ ██████░░░░░░░░░░░░░░░░░░░ 30%  │
│                                │
│ Current: Evaluating options    │
└────────────────────────────────┘
```

**When to use:**
- Known number of steps
- User needs time estimate
- Long processes (> 10 seconds)

**Implementation:**
```jsx
<div className="progress-indicator">
  <span className="step-count">
    {currentStep}/{totalSteps}
  </span>
  <div className="progress-bar">
    <div
      className="progress-fill"
      style={{ width: `${(currentStep / totalSteps) * 100}%` }}
    />
  </div>
  <span className="current-step">{thoughts[currentStep]}</span>
</div>
```

### Pattern 5: Interruptible Streaming

**Description:** Allow users to cancel and start new operations.

```
┌────────────────────────────────┐
│ 🧠 AI is thinking...    [✕ Cancel] │
├────────────────────────────────┤
│ Step 1: Analyzing...           │
│ Step 2: Researching...         │
└────────────────────────────────┘

User clicks cancel or asks new question:
┌────────────────────────────────┐
│ ⓘ Previous query cancelled     │
│ 🧠 Starting new analysis...    │
└────────────────────────────────┘
```

**When to use:**
- Long-running operations
- User might change their mind
- Multiple attempts expected

**Implementation:**
```jsx
const handleNewQuestion = () => {
  disconnect(); // Stop current stream
  dispatch({ type: 'RESET' });
  connect(newUrl); // Start new stream
};

const handleCancel = () => {
  disconnect();
  dispatch({ type: 'CANCELLED' });
};
```

---

## 3. Visual Hierarchy & Styling

### Hierarchy Principles

**Primary:** Final answer (most prominent)
**Secondary:** Thinking process (visible but subtle)
**Tertiary:** Controls and metadata

```
┌─────────────────────────────────────┐
│                                     │
│  ▓▓▓ FINAL ANSWER                   │  ← Large, bold
│  ▓▓▓ Clear and actionable           │
│  ▓▓▓                                │
│                                     │
├─────────────────────────────────────┤
│  🧠 Thinking (Hide)                 │  ← Medium, subtle
│  • Step 1...                        │
│  • Step 2...                        │
│                                     │
└─────────────────────────────────────┘
```

### Color Palette Recommendations

**Thinking Panel:**
- Background: Subtle gray/blue tint
- Text: Medium contrast (not pure black)
- Accent: Soft blue for active thinking

**Final Answer:**
- Background: White or pure surface
- Text: High contrast
- Accent: Brand color for emphasis

**Example:**
```css
/* Thinking panel */
.thinking-panel {
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.6);
}

/* Final answer */
.final-answer {
  background: white;
  border: 2px solid var(--brand-color);
  color: rgba(0, 0, 0, 0.9);
  font-weight: 600;
}
```

### Typography

**Thinking Text:**
- Font size: 14-15px
- Line height: 1.6
- Font weight: 400 (regular)

**Final Answer:**
- Font size: 16-18px
- Line height: 1.5
- Font weight: 500-600 (medium/semibold)

**Code/Technical:**
- Monospace font
- Slightly smaller (13-14px)
- Higher line height (1.8)

### Animation Guidelines

**Entrance Animations:**
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.thought-item {
  animation: fadeIn 0.3s ease-out;
}
```

**Thinking Indicator:**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.thinking-indicator {
  animation: pulse 1.5s ease-in-out infinite;
}
```

**Don't:**
- ❌ Aggressive bouncing
- ❌ Rapid flashing
- ❌ Spinning endlessly
- ❌ Distracting motion

**Do:**
- ✅ Subtle fades
- ✅ Gentle pulses
- ✅ Smooth transitions
- ✅ Purposeful motion

---

## 4. UX Copy & Microcopy

### Thinking States

**Generic (Avoid):**
- "Loading..."
- "Please wait..."
- "Processing..."

**Better:**
- "Analyzing your question..."
- "Researching relevant information..."
- "Formulating response..."

**Best:**
- "Breaking down your question into key components..."
- "Searching through 10,000+ sources..."
- "Evaluating 3 possible approaches..."

**Principle:** Be specific and descriptive. Tell users what's actually happening.

### Error Messages

**Generic (Avoid):**
- "Error occurred"
- "Something went wrong"
- "Try again later"

**Better:**
- "Connection lost. Retrying..."
- "That took too long. Let's try again?"
- "I'm having trouble understanding. Can you rephrase?"

**Best:**
- "Lost connection to the server. I'll retry in 3 seconds..."
- "This is taking longer than expected. You can cancel and try a shorter question."
- "I couldn't find enough information about '[topic]'. Try asking about '[related topic]' instead?"

**Principle:** Explain what happened, why, and what users can do about it.

### Completion Messages

**Options:**
1. Simple: "Done!"
2. Contextual: "Analysis complete"
3. Actionable: "Here's what I found:"
4. Conversational: "I've thought through your question. Here's my answer:"

---

## 5. Accessibility Considerations

### Screen Reader Support

```jsx
<div
  role="status"
  aria-live="polite"
  aria-atomic="false"
  aria-label="AI thinking process"
>
  {thoughts.map((thought, index) => (
    <div key={index} aria-label={`Step ${index + 1}: ${thought}`}>
      {thought}
    </div>
  ))}
</div>

<div
  role="alert"
  aria-live="assertive"
  aria-atomic="true"
>
  {finalAnswer && `Answer ready: ${finalAnswer}`}
</div>
```

**Key ARIA Attributes:**
- `role="status"` - For thinking updates
- `role="alert"` - For final answer/errors
- `aria-live="polite"` - Don't interrupt user
- `aria-live="assertive"` - Interrupt for important updates
- `aria-atomic="false"` - Only announce new content

### Keyboard Navigation

```jsx
<button
  className="cancel-button"
  onClick={handleCancel}
  onKeyDown={(e) => e.key === 'Escape' && handleCancel()}
  aria-label="Cancel current operation"
>
  Cancel
</button>

<div
  className="thought-stream"
  tabIndex={0}
  role="log"
  aria-label="Thinking process log"
>
  {/* Thoughts */}
</div>
```

**Required:**
- Tab navigation through all controls
- Escape key to cancel
- Enter to submit questions
- Focus management

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .thought-item {
    animation: none;
  }

  .thinking-indicator {
    animation: none;
  }

  * {
    transition-duration: 0.01ms !important;
  }
}
```

### Color Contrast

**WCAG AA Requirements:**
- Normal text: 4.5:1 contrast ratio
- Large text (18px+): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

**Test Your Colors:**
- Use WebAIM Contrast Checker
- Chrome DevTools Lighthouse
- Browser extensions for real-time checking

---

## 6. Mobile Considerations

### Space Constraints

**Problem:** Limited screen space on mobile

**Solutions:**

1. **Collapsed by Default**
```jsx
const [showThinking, setShowThinking] = useState(
  window.innerWidth > 768 // Desktop default: true, Mobile: false
);
```

2. **Bottom Sheet Pattern**
```
┌─────────────────┐
│                 │
│  Final Answer   │
│                 │
│                 │
├─────────────────┤
│ 🧠 [Tap to see  │ ← Swipe up to expand
│    thinking]    │
└─────────────────┘
```

3. **Condensed View**
```
Desktop:
● Analyzing your question in detail...
● Researching relevant information from multiple sources...

Mobile:
● Analyzing...
● Researching...
```

### Performance on Mobile

**Considerations:**
- Battery consumption from open connections
- Data usage from streaming
- CPU usage from frequent re-renders

**Optimizations:**
```jsx
// Debounce updates on mobile
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
const updateInterval = isMobile ? 3000 : 1500;

// Limit thought history on mobile
const maxThoughts = isMobile ? 5 : 10;
const displayedThoughts = thoughts.slice(-maxThoughts);
```

### Touch Interactions

```jsx
// Swipe to dismiss
const handleTouchStart = (e) => {
  touchStartY = e.touches[0].clientY;
};

const handleTouchEnd = (e) => {
  const touchEndY = e.changedTouches[0].clientY;
  const diff = touchStartY - touchEndY;

  if (diff > 50) {
    // Swiped up - expand
    setShowThinking(true);
  } else if (diff < -50) {
    // Swiped down - collapse
    setShowThinking(false);
  }
};
```

---

## 7. When NOT to Use Thinking UIs

### Anti-Patterns

**1. Fast Operations (< 1 second)**
- Thinking UI adds overhead
- Traditional loading spinner is fine
- Don't over-engineer simple tasks

**2. Security-Sensitive Reasoning**
- Don't expose fraud detection logic
- Don't show credit risk calculations
- Keep sensitive algorithms hidden

**3. Overly Technical Output**
- Don't show SQL queries to end users
- Don't expose API call details
- Abstract technical details

**4. Too Many Simultaneous Streams**
- Don't show 10 thinking panels at once
- Combine related operations
- Prioritize important ones

**5. Non-Interactive Contexts**
- Email notifications
- PDF reports
- Batch processing logs

### Decision Framework

Ask these questions:

1. **Does it take > 3 seconds?**
   - No → Use traditional loading
   - Yes → Consider thinking UI

2. **Is the process transparent-safe?**
   - No → Hide reasoning
   - Yes → Show thinking

3. **Do users benefit from seeing steps?**
   - No → Just show final result
   - Yes → Show thinking

4. **Is there screen space?**
   - No (mobile) → Collapsed by default
   - Yes (desktop) → Expanded by default

---

## 8. Measuring Success

### Key Metrics

**1. Perceived Performance**
```javascript
// Track how users feel about wait time
analytics.track('thinking_ui_feedback', {
  actualDuration: 15000, // 15 seconds
  perceivedDuration: userRating // Ask: "Did it feel fast?"
});
```

**2. Engagement During Waiting**
```javascript
// Track if users watch thinking or look away
document.addEventListener('visibilitychange', () => {
  analytics.track('user_attention', {
    visible: !document.hidden,
    thinkingActive: isThinking
  });
});
```

**3. Abandonment Rate**
```javascript
// Compare with/without thinking UI
analytics.track('query_abandoned', {
  thinkingUIEnabled: true,
  timeBeforeAbandon: 8000 // 8 seconds
});
```

**4. Trust Indicators**
```javascript
// Ask users after response
showSurvey({
  question: "How confident are you in this answer?",
  scale: 1-5
});
```

### A/B Testing

**Test 1: Thinking UI vs Traditional Loading**
- Group A: Shows thinking steps
- Group B: Shows spinner only
- Measure: Abandonment rate, satisfaction, trust

**Test 2: Expanded vs Collapsed Default**
- Group A: Thinking visible by default
- Group B: Thinking hidden by default
- Measure: Engagement, completion rate

**Test 3: Different Thinking Speeds**
- Group A: Update every 1 second
- Group B: Update every 2 seconds
- Group C: Update every 3 seconds
- Measure: Perceived performance, satisfaction

---

## 9. Design Checklist

Before launching a thinking UI:

### Functionality
- [ ] Thoughts stream progressively (not all at once)
- [ ] Final answer is clearly distinguished
- [ ] Users can hide/show thinking
- [ ] Users can cancel operations
- [ ] Connection errors are handled gracefully
- [ ] Reconnection works automatically

### Visual Design
- [ ] Clear hierarchy (answer > thinking)
- [ ] Sufficient color contrast (WCAG AA)
- [ ] Smooth animations (< 300ms)
- [ ] Gradient overlay for long content
- [ ] Loading indicators are clear
- [ ] Mobile responsive layout

### Accessibility
- [ ] Screen reader announcements work
- [ ] Keyboard navigation complete
- [ ] Focus management correct
- [ ] Reduced motion respected
- [ ] ARIA labels present
- [ ] Color not sole indicator

### Performance
- [ ] Memoization prevents unnecessary renders
- [ ] startTransition for non-urgent updates
- [ ] Cleanup on unmount prevents leaks
- [ ] Mobile performance acceptable
- [ ] Battery impact measured

### Content
- [ ] Thinking steps are descriptive
- [ ] Error messages are helpful
- [ ] Loading copy makes sense
- [ ] Success states are clear
- [ ] Empty states handled

---

## Conclusion

Thinking UIs represent a fundamental shift in how we design interfaces for AI-powered features. By embracing transparency and progressive disclosure, we can:

- **Build trust** through explainability
- **Reduce anxiety** during long operations
- **Increase engagement** through narrative
- **Improve perceived performance** even when actual speed is the same

The key is balancing transparency with simplicity - showing enough to build trust without overwhelming users with technical details.

Remember: The goal isn't to show everything, but to show *just enough* for users to understand and trust what's happening.
