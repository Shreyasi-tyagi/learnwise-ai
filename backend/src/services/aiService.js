const { GoogleGenerativeAI } = require('@google/generative-ai')

if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
  throw new Error('GEMINI_API_KEY is not configured in .env')
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const modelName = process.env.GEMINI_MODEL || 'gemini-3.7-flash'

// JSON Model for Roadmap, Resources, and Practice
const jsonModel = genAI.getGenerativeModel({
  model: modelName,
  generationConfig: {
    responseMimeType: 'application/json',
  }
})

// Text Model for AI Mentor
const textModel = genAI.getGenerativeModel({
  model: modelName,
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function isDailyQuotaExhausted(error) {
  const msg = error?.message || ''
  return (
    msg.includes('GenerateRequestsPerDay') ||
    msg.includes('You exceeded your current quota') ||
    msg.includes('free_tier_requests')
  )
}

async function generateJson(prompt) {
  const MAX_RETRIES = 3
  let delay = 1000 // Start with 1 second delay

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await jsonModel.generateContent(prompt)
      let text = result.response.text()

      try {
        text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim()
        return JSON.parse(text)
      } catch (parseError) {
        console.error('[AI Service] Failed to parse AI response:', text)
        throw new Error('AI generated invalid JSON.')
      }
    } catch (error) {
      const isDailyQuota = isDailyQuotaExhausted(error)
      const isTransient = error.status === 503 || error.status === 429 || error.message?.includes('503') || error.message?.includes('429')
      const isRetryable = !isDailyQuota && isTransient

      if (isRetryable && attempt < MAX_RETRIES) {
        console.warn(`[AI Service] Attempt ${attempt} failed with a retryable error. Retrying in ${delay}ms... (Error: ${error.message})`)
        await sleep(delay)
        delay *= 2 // Exponential backoff
        continue
      }

      console.error(`[AI Service] AI Request Failed after ${attempt} attempts:`, error.message)
      throw error // Throw final error
    }
  }
}

async function generateText(prompt, stopSequences = []) {
  const MAX_RETRIES = 3
  let delay = 1000

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const config = {}
      if (stopSequences && stopSequences.length > 0) {
        config.stopSequences = stopSequences
      }
      const result = await textModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: Object.keys(config).length > 0 ? config : undefined,
      })
      return result.response.text()
    } catch (error) {
      const isDailyQuota = isDailyQuotaExhausted(error)
      const isTransient = error.status === 503 || error.status === 429 || error.message?.includes('503') || error.message?.includes('429')
      const isRetryable = !isDailyQuota && isTransient

      if (isRetryable && attempt < MAX_RETRIES) {
        console.warn(`[AI Service Text] Attempt ${attempt} failed with a retryable error. Retrying in ${delay}ms... (Error: ${error.message})`)
        await sleep(delay)
        delay *= 2
        continue
      }

      console.error(`[AI Service Text] AI Request Failed after ${attempt} attempts:`, error.message)
      throw error
    }
  }
}

async function generateRoadmapSteps(level, goal, studyTime) {
  const prompt = `
    You are an expert learning mentor. Create a learning roadmap for a student.
    Level: ${level}
    Goal: ${goal}
    Study Time available: ${studyTime}

    Return a JSON array of steps. Each step MUST be an object with the following exact keys:
    - "title" (string): A short, descriptive title for the step.
    - "focus" (string): A concise explanation of what to focus on in this step.
    - "estimatedTime" (string): Estimated time to complete the step (e.g., "1 week", "2 days").
    - "recommendedResources" (array of strings): 1-3 resource names.
    - "note" (string): Any short advice for this step.

    Do not return markdown formatting. Your entire response must be a valid JSON array of objects.
    Example:
    [
      {
        "title": "Learn React Basics",
        "focus": "Understand components and props",
        "estimatedTime": "1 week",
        "recommendedResources": ["React Docs"],
        "note": "Focus on functional components"
      }
    ]
  `
  return await generateJson(prompt)
}

async function generateResourceRecommendations(query, userContext = null) {
  let contextPrompt = ''
  if (userContext) {
    contextPrompt = `
    The user is currently studying with the following context:
    - Level: ${userContext.level}
    - Goal: ${userContext.goal}
    - Completed Topics: ${userContext.completedSteps?.length ? userContext.completedSteps.join(', ') : 'None yet'}
    Please personalize the recommendations to fit their level and goal, avoiding topics they have already completed if possible.
    `
  }

  const prompt = `
    You are an expert learning mentor. Recommend top 5 learning resources for the topic: "${query}".
    ${contextPrompt}

    Return a JSON array of resources. Each resource MUST be an object with the following exact keys:
    - "title" (string): The title of the resource.
    - "description" (string): A one-sentence explanation of what this resource is and why it's recommended.
    - "source" (string): The creator or platform (e.g., "Official Documentation", "YouTube", "FreeCodeCamp").
    - "category" (string): One of: "Documentation", "Course", "Practice", "Video", "Book", "Other".
    - "searchQuery" (string): A highly specific Google search query to find this exact resource (e.g., "React Official Documentation react.dev").
    - "difficulty" (string): One of: "Beginner", "Intermediate", "Advanced".

    Do not return markdown formatting. Your entire response must be a valid JSON array of objects.
    Example:
    [
      {
        "title": "React Official Docs",
        "description": "The best place to learn React directly from the creators.",
        "source": "Official Documentation",
        "category": "Documentation",
        "searchQuery": "React official documentation react.dev",
        "difficulty": "Beginner"
      }
    ]
  `

  const rawResults = await generateJson(prompt)

  return rawResults.map(res => ({
    title: res.title,
    description: res.description,
    source: res.source,
    category: res.category,
    difficulty: res.difficulty,
    url: `https://www.google.com/search?q=${encodeURIComponent(res.searchQuery || res.title)}`
  }))
}

async function generatePracticeQuestions(userContext = null) {
  let contextPrompt = 'The user wants to practice general web development concepts.'
  if (userContext) {
    contextPrompt = `
    The user is currently studying with the following context:
    - Level: ${userContext.level}
    - Goal: ${userContext.goal}
    - Completed Topics: ${userContext.completedSteps?.length ? userContext.completedSteps.join(', ') : 'None yet'}
    Please generate questions that test their knowledge appropriately based on this context. Focus on topics they might have learned or need to know for their goal.
    `
  }

  const prompt = `
    You are an expert learning mentor. Generate a multiple-choice practice quiz for a student.
    ${contextPrompt}

    Return a JSON array of exactly 5 questions. Each question MUST be an object with the following exact keys:
    - "question" (string): The question text.
    - "options" (array of exactly 4 strings): The 4 possible answers.
    - "correctAnswer" (number): The zero-based index (0, 1, 2, or 3) of the correct option in the options array.
    - "explanation" (string): A short explanation of why the correct answer is right and why the others might be wrong.
    - "topic" (string): The specific sub-topic this question tests (e.g., "React Hooks", "CSS Flexbox").

    Do not return markdown formatting. Your entire response must be a valid JSON object containing a "questions" array, like this:
    {
      "questions": [
        {
          "question": "What is ...?",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": 0,
          "explanation": "Because...",
          "topic": "..."
        }
      ]
    }
  `

  const result = await generateJson(prompt)
  return result.questions || []
}

async function generateMentorResponse(message, history = [], userContext = null) {
  let contextSection = 'The student is exploring various computer science / software topics (no active roadmap configured yet).'
  if (userContext) {
    contextSection = `
Student Learning Context:
- Active Subject / Goal: ${userContext.goal || 'General Learning'}
- Experience Level: ${userContext.level || 'Beginner'}
- Completed Roadmap Topics: ${userContext.completedSteps?.length ? userContext.completedSteps.join(', ') : 'None yet'}
- Next / In-Progress Step: ${userContext.nextStep || 'Continuing roadmap'}
- Latest Practice Performance: ${userContext.latestPractice ? `${userContext.latestPractice.percentage}% (${userContext.latestPractice.score}/${userContext.latestPractice.totalQuestions} correct)` : 'No practice taken yet'}
`
  }

  // Format recent conversation messages (history limited to 10-12 messages)
  let conversationHistory = ''
  if (history && history.length > 0) {
    const recent = history.slice(-10)
    conversationHistory = recent.map(msg => `${msg.sender === 'user' ? 'Student' : 'AI Mentor'}: ${msg.text}`).join('\n')
  }

  const prompt = `
You are LearnWise AI Mentor, an expert, personalized technical tutor for computer science students and software developers.
Your mission is to act like a sharp, professional, supportive technical mentor who provides clear conceptual understanding, practical code intuition, and interview readiness without unnecessary fluff.

${contextSection}

CORE TEACHING & BEHAVIORAL RULES:

1. Direct Answer First:
- Directly answer the student's question in the very first sentence or paragraph.
- Never begin with generic greetings, pleasantries, or motivational introductions (e.g. avoid "Hi there!", "Great question!", "It's fantastic to see you!", "Huge congratulations!"). Start straight into the explanation.

2. Calibrated Length & Conciseness:
- For simple or conceptual questions: Keep the answer concise (roughly 2–5 short paragraphs or bullet points) with a compact, focused code example where useful.
- For complex, architectural, or debugging questions: Use structured sections with concise headings, step-by-step logic, and practical code snippets.
- Avoid repeating the same concept in multiple ways unnecessarily.

3. Tutor-Style Technical Explanations:
- Explain the core concept simply and intuitively, provide a small concrete example, and highlight the key idea.
- Code & Debugging: Accurately pinpoint the issue, explain why it happens, provide the corrected code in a fenced block, and explain the key fix.
- SQL: Provide clean, valid SQL with small realistic schemas and explain the essential clauses/join mechanics clearly.

4. Active Learning (At Most ONE Check Question):
- When appropriate, conclude with AT MOST ONE targeted check question that directly tests the concept just explained.
- Never use repetitive, robotic chatbot closings (e.g. do NOT say "Let me know if you'd like...", "Would you like me to...", "I can also help you with...", "How does that feel?").
- Only suggest the next topic or step when it is genuinely relevant to what the student asked.

5. Personalization & Accuracy:
- Tailor technical depth and vocabulary to the student's level (${userContext?.level || 'Beginner'}).
- Answer the user's actual question first; do NOT force roadmap or progress references into unrelated questions.
- Never fabricate progress, completed topics, practice scores, database schemas, or achievements.
- When asked "What should I learn next?", recommend their actual next roadmap topic (${userContext?.nextStep || 'current goal'}) and explain why it fits based on their progress and practice performance.
- Treat practice scores as supporting evidence (e.g. "Your latest score suggests you're ready to proceed"), not absolute mastery.

6. Practice Questions & Evaluation:
- If asked for practice questions: Provide exactly the number requested at their level/topic without giving away answers upfront.
- If the student submits an answer: Start with a clear verdict (Correct / Partially Correct / Incorrect), explain the reasoning, and provide the corrected solution or key concept.

7. Tone, Formatting & Output Rules:
- Professional, friendly, supportive, confident, and concise.
- Avoid excessive enthusiasm, exaggerated praise, and childish phrasing.
- Use at most 1–2 emojis only when they genuinely improve readability.
- Format strictly with clean Markdown: short headings, bullet points, numbered steps, and language-tagged fenced code blocks (\`\`\`sql, \`\`\`javascript, \`\`\`python, \`\`\`cpp, etc.).
- Do not output SVG graphics, HTML tags, or visual XML diagrams. Explain concepts purely using clear text, standard markdown, and programming code snippets.

${conversationHistory ? `Recent Conversation History:\n${conversationHistory}\n` : ''}
Student: ${message}
AI Mentor:
`

  let response = await generateText(prompt, ['\nStudent:', '\nUser:', '\nHuman:'])
  if (response) {
    // Strip leading "AI Mentor:" prefix if echoed
    response = response.replace(/^(?:AI\s*Mentor|Mentor):\s*/i, '')
    // Truncate any hallucinated follow-up turns if present
    const nextTurnIndex = response.search(/\n\s*(?:Student|Human|User)\s*:/i)
    if (nextTurnIndex !== -1) {
      response = response.substring(0, nextTurnIndex)
    }
    // Remove any fenced SVG/XML diagram code blocks
    response = response.replace(/```(?:svg|xml)?[\s\S]*?<svg[\s\S]*?```/gi, '')
    // Remove any raw or standalone SVG tags
    response = response.replace(/<svg[\s\S]*?<\/svg>/gi, '')
    // Remove standalone 'svg' artifact lines (lines containing only the word 'svg')
    response = response.replace(/^\s*svg\s*$/gim, '')
    // Remove any empty code fences left behind
    response = response.replace(/```[a-zA-Z0-9_-]*\s*```/g, '')
    // Clean up excessive newlines
    response = response.replace(/\n{3,}/g, '\n\n').trim()
  }

  return response
}

module.exports = {
  generateJson,
  generateText,
  generateRoadmapSteps,
  generateResourceRecommendations,
  generatePracticeQuestions,
  generateMentorResponse
}

