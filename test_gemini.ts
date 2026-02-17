import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

const apiKey = 'FAKE-123';

async function testGemini() {
    console.log('Testing Gemini 1.5 Pro with provided key...');

    try {
        const google = createGoogleGenerativeAI({
            apiKey,
        });
        const model = google('gemini-1.5-pro');

        const { text } = await generateText({
            model,
            prompt: 'Hello, are you working? Reply with "Yes, I am Gemini 1.5 Pro".',
        });

        console.log('Success! Response:', text);
    } catch (error) {
        console.error('Error testing Gemini:', error);
    }
}

testGemini();
