import { AIProvider } from './aiProvider';
import { DevelopmentAIProvider } from './developmentProvider';

function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER || 'development';

  switch (provider) {
    case 'development':
    default:
      return new DevelopmentAIProvider();
  }
}

export const ai = getAIProvider();
export type { AIProvider };
