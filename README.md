# Vibecheck Simulator

Vibecheck Simulator is an advanced, AI-powered content resonance tool that acts as an instant, on-demand focus group for your communications. Before publishing a press release, marketing copy, or strategic memo, users can feed their text or PDF documents into the desktop app to see exactly how different audiences will react.

Powered by the Google Gemini API (Gemini 3 Pro), the platform dynamically generates a diverse panel of AI personas—ranging from target customers and superfans to brutal skeptics and unpredictable "wildcards". By simulating interviews with these personas, teams can identify blind spots, tone-deaf messaging, and friction points before they become real-world liabilities.

## Key Capabilities

*   **Dual-Mode Simulation**: Users can run content through "Standard Mode" to gauge general audience resonance, or activate "Crisis Mode" to intentionally stress-test sensitive content against simulated PR nightmares and valid critics looking for the worst possible interpretation.
*   **Actionable Intelligence**: The tool synthesizes the AI feedback into a comprehensive "Vibe Report" featuring a quantifiable resonance score and a definitive "Go/No-Go" decision based on its findings.
*   **Deep Tone Analytics**: Content is automatically graded on specific communication metrics, including Defensiveness, Corporate Speak (Jargon), Empathy, and Clarity.
*   **Persona Deep-Dives**: Users can review exactly what resonated, what caused confusion, and what constructive suggestions were offered by each specific persona.

## The Value Proposition

Built as a sleek Electron desktop app with a "Sci-Fi Futurist" interface, Vibecheck Simulator replaces the slow, expensive traditional focus group. It empowers PR strategists, marketers, and executives to quickly validate their messaging, minimize brand risk, and publish with data-backed confidence.

## Tech Stack

*   **Frontend**: React, TypeScript, TailwindCSS
*   **Backend**: Electron (Main Process)
*   **AI**: Google Gemini API (Gemini 3 Pro - `gemini-3-pro-preview`)
*   **State Management**: Zustand with Persistence

## Getting Started

1.  Clone the repository.
2.  Run `npm install`.
3.  Run `npm run dev` to start the development server.
4.  Get a Google AI Studio API Key and enter it in the app.
