/**
 * FairStay — AI Sacred Pilgrimage Concierge Client Script
 * Multi-turn chatbot, typing indicator, quick prompt pills, and creator bypass.
 */

document.addEventListener('DOMContentLoaded', () => {
  const launcherBtn = document.getElementById('aiLauncherBtn');
  const chatPanel = document.getElementById('aiChatPanel');
  const closeBtn = document.getElementById('aiCloseChatBtn');
  const resetBtn = document.getElementById('aiResetChatBtn');
  const chatForm = document.getElementById('aiChatForm');
  const chatInput = document.getElementById('aiChatInput');
  const chatBody = document.getElementById('aiChatBody');
  const quickPills = document.querySelectorAll('.ai-quick-pill');

  let chatHistory = [];

  if (!launcherBtn || !chatPanel || !chatForm || !chatInput || !chatBody) return;

  // Toggle Chat Panel
  launcherBtn.addEventListener('click', () => {
    chatPanel.classList.toggle('d-none');
    if (!chatPanel.classList.contains('d-none')) {
      chatInput.focus();
      scrollToBottom();
    }
  });

  closeBtn.addEventListener('click', () => {
    chatPanel.classList.add('d-none');
  });

  // Reset Chat
  resetBtn.addEventListener('click', () => {
    chatHistory = [];
    chatBody.innerHTML = `
      <div class="chat-message bot-message mb-3">
        <div class="chat-bubble bot-bubble shadow-sm">
          🙏 <strong>Pranam pilgrim!</strong> Chat history refreshed. How may I assist your holy pilgrimage journey today?
        </div>
      </div>
    `;
  });

  // Quick Prompt Pills
  quickPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const prompt = pill.getAttribute('data-prompt');
      if (prompt) {
        sendMessage(prompt);
      }
    });
  });

  // Submit Form
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;
    sendMessage(message);
    chatInput.value = '';
  });

  async function sendMessage(userText) {
    // Append User Message to UI
    appendMessage(userText, 'user');
    chatHistory.push({ role: 'user', content: userText });

    // Show Typing Indicator
    const typingEl = showTypingIndicator();
    scrollToBottom();

    try {
      const response = await fetch('/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: chatHistory,
        }),
      });

      const data = await response.json();
      removeTypingIndicator(typingEl);

      const botReply = data.reply || 'Pranam! May your pilgrimage be blessed.';
      appendMessage(botReply, 'bot');
      chatHistory.push({ role: 'model', content: botReply });
    } catch (err) {
      console.error('[AI Concierge Client Error]:', err);
      removeTypingIndicator(typingEl);
      appendMessage('Pranam pilgrim! Connection wavered. Please ask again or refer to the corridor help center.', 'bot');
    }

    scrollToBottom();
  }

  function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender}-message mb-3`;

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}-bubble shadow-sm`;

    // Convert basic markdown to HTML (bold, lists, breaks)
    const formatted = formatMarkdown(text);
    bubble.innerHTML = formatted;

    msgDiv.appendChild(bubble);
    chatBody.appendChild(msgDiv);
  }

  function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.className = 'chat-message bot-message mb-3';
    typingDiv.innerHTML = `
      <div class="chat-bubble bot-bubble shadow-sm py-2 px-3">
        <span class="typing-dots small text-muted">
          <span></span><span></span><span></span>
        </span>
      </div>
    `;
    chatBody.appendChild(typingDiv);
    return typingDiv;
  }

  function removeTypingIndicator(el) {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }

  function scrollToBottom() {
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function formatMarkdown(str) {
    if (!str) return '';
    let html = str
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '<br /><br />')
      .replace(/\n- /g, '<br />• ')
      .replace(/\n/g, '<br />');
    return html;
  }
});
