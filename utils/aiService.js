import { AI_CONFIG } from '../config/aiConfig';

const QUESTION_PROMPTS = {
  mcq: "Generate a multiple choice question for {subject} Grade {grade} with 4 options and mark the correct answer",
  short_answer: "Generate a short answer question (2-3 lines) for {subject} Grade {grade}",
  long_answer: "Generate a long answer question (5-7 lines) for {subject} Grade {grade}",
  fill_blank: "Generate a fill in the blank question for {subject} Grade {grade}",
  true_false: "Generate a true/false statement question for {subject} Grade {grade}",
  match_column: "Generate a match the column question for {subject} Grade {grade} with 4 items to match"
};

export const generateQuestionsWithAI = async (params) => {
  const { grade, subject, questionCounts, provider = 'gemini' } = params;
  
  const questions = [];
  let questionId = 1;

  for (const [type, count] of Object.entries(questionCounts)) {
    for (let i = 0; i < count; i++) {
      try {
        const prompt = QUESTION_PROMPTS[type]
          .replace('{subject}', subject)
          .replace('{grade}', grade);

        let question;
        if (provider === 'gemini') {
          question = await generateWithGemini(prompt, type);
        } else if (provider === 'openai') {
          question = await generateWithOpenAI(prompt, type);
        } else if (provider === 'claude') {
          question = await generateWithClaude(prompt, type);
        }

        if (question) {
          question.id = questionId++;
          question.type = type;
          questions.push(question);
        }
      } catch (error) {
        console.error(`Error generating ${type} question:`, error);
      }
    }
  }

  return questions;
};

const generateWithGemini = async (prompt, type) => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${AI_CONFIG.gemini.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${prompt}. Also provide: correct answer, explanation, and marks (1-5). Format as JSON with keys: question, correctAnswer, explanation, marks${type === 'mcq' || type === 'match_column' ? ', options' : ''}`
          }]
        }]
      })
    });

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse JSON response');
    }
    
    return parseAIResponse(content, type);
  } catch (error) {
    console.error('Gemini API error:', error);
    return null;
  }
};

const generateWithOpenAI = async (prompt, type) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.openai.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: AI_CONFIG.openai.model,
        messages: [{
          role: 'user',
          content: `${prompt}. Also provide: correct answer, explanation, and marks (1-5). Format as JSON with keys: question, correctAnswer, explanation, marks${type === 'mcq' || type === 'match_column' ? ', options' : ''}`
        }]
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse JSON response');
    }
    
    return parseAIResponse(content, type);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return null;
  }
};

const generateWithClaude = async (prompt, type) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': AI_CONFIG.claude.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: AI_CONFIG.claude.model,
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `${prompt}. Also provide: correct answer, explanation, and marks (1-5). Format as JSON with keys: question, correctAnswer, explanation, marks${type === 'mcq' || type === 'match_column' ? ', options' : ''}`
        }]
      })
    });

    const data = await response.json();
    const content = data.content[0].text;
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse JSON response');
    }
    
    return parseAIResponse(content, type);
  } catch (error) {
    console.error('Claude API error:', error);
    return null;
  }
};

const parseAIResponse = (content, type) => {
  return {
    question: content,
    correctAnswer: 'Sample Answer',
    explanation: 'This is the explanation for this question.',
    marks: 1,
    options: type === 'mcq' ? ['A', 'B', 'C', 'D'] : undefined
  };
};