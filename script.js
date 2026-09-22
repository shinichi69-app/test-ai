/* ===== Top bar ===== */
.top-bar {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 12px;
  align-items: center;
  z-index: 10;
}
.icon-btn {
  background: rgba(0, 30, 50, 0.7);
  border: 1px solid rgba(0, 212, 255, 0.4);
  color: #00d4ff;
  width: 40px; height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s;
}
.icon-btn:hover {
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.6);
  transform: rotate(90deg);
}

.provider-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 11px;
  letter-spacing: 2px;
  background: rgba(0, 30, 50, 0.7);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: #00d4ff;
}
.provider-badge.groq   { color: #ff9944; border-color: #ff9944; }
.provider-badge.openai { color: #00ffaa; border-color: #00ffaa; }

/* ===== Typing indicator ===== */
.typing {
  display: flex;
  gap: 6px;
  padding: 8px 16px;
}
.typing span {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #00ffaa;
  animation: bounce 1.4s infinite;
}
.typing span:nth-child(2) { animation-delay: 0.2s; }
.typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-10px); }
}

/* ===== Text input row ===== */
.text-input-row {
  display: flex;
  gap: 10px;
  width: 100%;
}
.text-input-row input {
  flex: 1;
  padding: 12px 18px;
  background: rgba(0, 30, 50, 0.7);
  border: 1px solid rgba(0, 212, 255, 0.4);
  border-radius: 8px;
  color: #00d4ff;
  font-size: 14px;
  outline: none;
}
.text-input-row input:focus {
  border-color: #00d4ff;
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.5);
}
.text-input-row .btn { padding: 12px 20px; }

/* ===== Mobile ===== */
@media (max-width: 600px) {
  .hud { padding: 20px; gap: 15px; }
  .ring-3 { display: none; }
  .ring-2 { width: 240px; height: 240px; }
  .ring-1 { width: 180px; height: 180px; }
  .core { width: 110px; height: 110px; }
  .btn { padding: 12px 20px; font-size: 12px; letter-spacing: 2px; }
  .transcript { max-height: 140px; font-size: 13px; }
  .top-bar { top: 10px; right: 10px; }
}
