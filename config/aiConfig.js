export const AI_CONFIG = {
  provider: 'gemini', // 'gemini', 'openai', or 'claude'
  gemini: {
    apiKey: 'YOUR_GOOGLE_GEMINI_API_KEY',
    model: 'gemini-pro'
  },
  openai: {
    apiKey: 'YOUR_OPENAI_API_KEY',
    model: 'gpt-3.5-turbo'
  },
  claude: {
    apiKey: 'YOUR_CLAUDE_API_KEY',
    model: 'claude-3-opus-20240229'
  }
};