import 'dotenv/config';
import { getProvider } from '../src/lib/orchestration/providers';
import { HumanMessage } from '@langchain/core/messages';

async function run() {
  try {
    const model = getProvider('gemini');
    console.log('initialized', model.constructor.name);
    const response = await model.invoke('Give a one-sentence JSON response: {"message": "hello"}');
    console.log('invoke result:', JSON.stringify(response, null, 2));
  } catch (error: any) {
    console.error('Gemini test failed:', error?.message || error);
    process.exit(1);
  }
}

run();
