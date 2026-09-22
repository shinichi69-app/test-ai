// ====== ตัวแปรหลัก ======
const core        = document.getElementById('core');
const statusEl    = document.getElementById('status');
const transcript  = document.getElementById('transcript');
const listenBtn   = document.getElementById('listenBtn');
const clearBtn    = document.getElementById('clearBtn');
const waveform    = document.getElementById('waveform');
const apiKeyInput = document.getElementById('apiKey');
const langSelect  = document.getElementById('langSelect');

let isListening = false;
let recognition = null;
let conversationHistory = [
  {
    role: 'system',
    content: `คุณคือ JARVIS ผู้ช่วย AI อัจฉริยะ สไตล์ Iron Man 
              ตอบสุภาพ กระชับ ตรงประเด็น เรียกผู้ใช้ว่า "ท่าน" 
              ตอบเป็นภาษาเดียวกับที่ผู้ใช้ถาม`
  }
];

// โหลด API key ที่เคยบันทึก
apiKeyInput.value = localStorage.getItem('openai_key') || '';
apiKeyInput.addEventListener('change', () => {
  localStorage.setItem('openai_key', apiKeyInput.value.trim());
});

// ====== ตั้งค่า Speech Recognition ======
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  setStatus('⚠ เบราว์เซอร์ไม่รองรับ กรุณาใช้ Chrome');
} else {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = langSelect.value;

  recognition.onstart = () => {
    isListening = true;
    core.classList.add('listening');
    core.classList.remove('speaking');
    waveform.classList.add('active');
    listenBtn.classList.add('active');
    setStatus('🎤 กำลังฟัง...');
  };

  recognition.onresult = (e) => {
    const transcriptText = Array.from(e.results)
      .map(r => r[0].transcript).join('');
    setStatus(`🎤 "${transcriptText}"`);
    
    if (e.results[e.results.length - 1].isFinal) {
      handleUserInput(transcriptText);
    }
  };

  recognition.onerror = (e) => {
    console.error('Speech error:', e.error);
    setStatus(`⚠ Error: ${e.error}`);
    stopListening();
  };

  recognition.onend = () => stopListening();
}

// ====== ฟังก์ชันควบคุม ======
function startListening() {
  if (!recognition) return;
  recognition.lang = langSelect.value;
  try { recognition.start(); }
  catch (err) { console.warn(err); }
}

function stopListening() {
  isListening = false;
  core.classList.remove('listening');
  waveform.classList.remove('active');
  listenBtn.classList.remove('active');
  if (statusEl.textContent.startsWith('🎤') || statusEl.textContent.startsWith('⚠')) {
    setStatus('SYSTEM READY');
  }
}

function setStatus(text) {
  statusEl.textContent = text;
}

function addMessage(role, text) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.innerHTML = `<span class="label">${role === 'user' ? 'YOU:' : 'JARVIS:'}</span>${escapeHtml(text)}`;
  transcript.appendChild(div);
  transcript.scrollTop = transcript.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

// ====== ประมวลผลคำถาม ======
async function handleUserInput(text) {
  if (!text.trim()) return;
  addMessage('user', text);

  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    speak('กรุณาใส่ OpenAI API Key ก่อนครับ');
    addMessage('ai', '⚠ กรุณาใส่ API Key ในช่องด้านล่าง');
    return;
  }

  setStatus('⚙ กำลังประมวลผล...');
  conversationHistory.push({ role: 'user', content: text });

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
    addMessage('ai', `❌ เกิดข้อผิดพลาด: ${err.message}`);
    setStatus('SYSTEM ERROR');
    setTimeout(() => setStatus('SYSTEM READY'), 2500);
  }
}

// ====== Text-to-Speech ======
function speak(text) {
  if (!('speechSynthesis' in window)) return;

  speechSynthesis.cancel();
  // ตัด markdown / emoji ออกเพื่อให้อ่านลื่น
  const clean = text
    .replace(/[*_`#>\-]/g, '')
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '');

  const utter = new SpeechSynthesisUtterance(clean);
  utter.lang = langSelect.value;
  utter.rate = 1.05;
  utter.pitch = 0.95;
  utter.volume = 1;

  // เลือกเสียงผู้ชายถ้ามี
  const voices = speechSynthesis.getVoices();
  const preferred = voices.find(v => 
    v.lang.startsWith(langSelect.value.split('-')[0]) &&
    /male|google|premium/i.test(v.name)
  ) || voices.find(v => v.lang.startsWith(langSelect.value.split('-')[0]));
  if (preferred) utter.voice = preferred;

  utter.onstart = () => {
    core.classList.add('speaking');
    core.classList.remove('listening');
    waveform.classList.add('active');
    setStatus('🔊 กำลังตอบ...');
  };
  utter.onend = () => {
    core.classList.remove('speaking');
    waveform.classList.remove('active');
    setStatus('SYSTEM READY');
  };

  speechSynthesis.speak(utter);
}

// โหลด voices (Chrome โหลดแบบ async)
if ('speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
}

// ====== ปุ่มควบคุม ======
listenBtn.addEventListener('click', () => {
  if (!recognition) {
    alert('เบราว์เซอร์ไม่รองรับ Web Speech API กรุณาใช้ Chrome / Edge');
    return;
  }
  if (isListening) {
    recognition.stop();
  } else {
    startListening();
  }
});

clearBtn.addEventListener('click', () => {
  transcript.innerHTML = '';
  conversationHistory = conversationHistory.slice(0, 1);
  setStatus('SYSTEM READY');
});

// กด Spacebar เพื่อ activate
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
    e.preventDefault();
    listenBtn.click();
  }
});
