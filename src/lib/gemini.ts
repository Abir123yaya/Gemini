export async function generateChatResponse(messages: { role: 'user' | 'model', content: string }[]) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to get response from server');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Frontend API Error:", error);
    if (error instanceof Error && error.message.includes("Failed to get response from server")) {
      return "⚠️ **Connection Error**: The server couldn't connect to the AI. If you're the owner, make sure your GEMINI_API_KEY is correctly set in your environment variables.";
    }
    return "Something went wrong. Please check your internet connection or try again later.";
  }
}
