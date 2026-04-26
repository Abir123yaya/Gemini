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
      const errorMessage = errorData.error || 'Failed to get response from server';
      return `⚠️ **AI Connection Error**: ${errorMessage}`;
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Frontend API Error:", error);
    return "Something went wrong. Please check your internet connection or try again later.";
  }
}
