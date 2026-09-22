// ===== ตัวแปรใหม่ =====
const typing         = document.getElementById('typing');
const stopBtn        = document.getElementById('stopBtn');
const textInput      = document.getElementById('textInput');
const sendBtn        = document.getElementById('sendBtn');
const toggleSettings = document.getElementById('toggleSettings');
const settingsPanel  = document.getElementById('settingsPanel');
const providerBadge  = document.getElementById('providerBadge');

// ===== Toggle settings =====
toggleSettings.addEventListener('click', () => {
  settingsPanel.hidden = !settingsPanel.hidden;
});

// ===== Text input =====
sendBtn.addEventListener('click', () => {
  const t = textInput.value.trim();
  if (t) { handleUserInput(t); textInput.value = ''; }
});
textInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendBtn.click();
});

// ===== Stop speaking =====
stopBtn.addEventListener('click', () => {
  speechSynthesis.cancel();
  stopBtn.hidden = true;
  setStatus('SYSTEM READY');
});

// ===== ปรับ handleUserInput ให้โชว์ typing + provider =====
// (แทรกในฟังก์ชันเดิม)

// ก่อน fetch:
const cfg = getApiConfig(apiKey);
providerBadge.textContent = `● ${cfg.name}`;
providerBadge.className = `provider-badge ${cfg.name.toLowerCase()}`;
typing.hidden = false;
stopBtn.hidden = true;

// หลังได้ response (ก่อน speak):
typing.hidden = true;
stopBtn.hidden = false;

// ใน catch:
typing.hidden = true;

// ===== ซ่อน stopBtn เมื่อพูดจบ =====
// ใน speak() function → utter.onend:
utter.onend = () => {
  core.classList.remove('speaking');
  waveform.classList.remove('active');
  setStatus('SYSTEM READY');
  stopBtn.hidden = true;
};
