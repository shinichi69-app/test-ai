// เพิ่มก่อน fetch
function getApiConfig(apiKey) {
  if (apiKey.startsWith('gsk_')) {
    return {
      url: 'https://api.groq.com/openai/v1/chat/completions',
      model: 'llama-3.3-70b-versatile',
      name: 'Groq'
    };
  }
  if (apiKey.startsWith('sk-')) {
    return {
      url: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-4o-mini',
      name: 'OpenAI'
    };
  }
  throw new Error('API Key ไม่ถูกต้อง (ต้องขึ้นต้นด้วย sk- หรือ gsk-)');
}

// ใน handleUserInput เปลี่ยนเป็น:
async function handleUserInput(text) {
  if (!text.trim()) return;
  addMessage('user', text);

  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    speak('กรุณาใส่ API Key ก่อนครับ');
    return;
  }

  setStatus('⚙ กำลังประมวลผล...');
  conversationHistory.push({ role: 'user', content: text });

  try {
    const cfg = getApiConfig(apiKey);
    console.log(`Using ${cfg.name} → ${cfg.model}`);

    const res = await fetch(cfg.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: cfg.model,
        messages: conversationHistory,
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const reply = data.choices[0].message.content.trim();
    conversationHistory.push({ role: 'assistant', content: reply });
    addMessage('ai', reply);
    speak(reply);

  } catch (err) {
    console.error(err);
    addMessage('ai', `❌ ${err.message}`);
    setStatus('SYSTEM ERROR');
    setTimeout(() => setStatus('SYSTEM READY'), 2500);
  }
}
