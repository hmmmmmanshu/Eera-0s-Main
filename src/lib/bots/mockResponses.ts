/**
 * Mock responses for testing UI before backend is fully connected
 * These will be replaced with real API calls later
 */

export type BotType = 'friend' | 'mentor' | 'ea';

export async function* sendMessageToBotMock(
  botType: BotType,
  message: string,
  userId: string
): AsyncGenerator<string, void, unknown> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Generate mock response based on bot type
  let response = "";
  
  switch (botType) {
    case 'friend':
      response = `Hey! I hear you. ${message.includes('?') ? "That's a great question." : "Thanks for sharing that with me."} Let's work through this together. What do you think would help you feel better about this?`;
      break;
    
    case 'mentor':
      response = `Let's approach this strategically. Here's what I'm thinking:\n\n1. First, let's identify the core issue\n2. Then, we'll map out potential solutions\n3. Finally, we'll create an action plan\n\nWhat's your biggest concern right now?`;
      break;
    
    case 'ea':
      response = `Got it. Here's what I recommend:\n\n• Action item 1\n• Action item 2\n• Next step\n\nShould I help you prioritize these?`;
      break;
  }

  // Simulate streaming by yielding chunks
  const words = response.split(' ');
  for (let i = 0; i < words.length; i++) {
    const chunk = (i === 0 ? '' : ' ') + words[i];
    yield chunk;
    // Small delay to simulate streaming
    if (i % 3 === 0 && i < words.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
}

