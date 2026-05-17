/* ============================================================
   EduManage AI Yordamchi — mentor va talaba uchun
   Claude Sonnet 4 API orqali ishlaydi
   ============================================================ */
(function () {
  // ── Tarjimonlar ──────────────────────────────────────────
  const L = () => (typeof LANG !== 'undefined' ? LANG : 'uz');

  const T = {
    uz: {
      title_mentor: '🤖 AI Yordamchi (Mentor)',
      title_student: '🤖 AI Yordamchi (Talaba)',
      placeholder: 'Savol yozing...',
      send: 'Yuborish',
      thinking: '⏳ Javob yozilmoqda...',
      clear: '🗑 Tozalash',
      welcome_mentor: `Salom! Men mentor uchun AI yordamchiman. Quyidagilarda yordam bera olaman:\n\n• 📊 Talabalar progressini tahlil qilish\n• 📝 Dars rejasi va metodika maslahatlar\n• 💡 O'qitish strategiyalari\n• 🎯 Guruh boshqaruvi bo'yicha tavsiyalar\n\nNima yordam kerak?`,
      welcome_student: `Salom! Men talaba uchun AI yordamchiman. Quyidagilarda yordam bera olaman:\n\n• 📚 Dars mavzularini tushuntirish\n• 💡 Masalalar yechishda ko'mak\n• 🎯 O'quv maqsadlarini rejalashtirish\n• 📖 Qiyin tushunchalarni soddalashtirib aytish\n\nNima so'rashni xohlaysiz?`,
    },
    ru: {
      title_mentor: '🤖 AI Ассистент (Ментор)',
      title_student: '🤖 AI Ассистент (Студент)',
      placeholder: 'Введите вопрос...',
      send: 'Отправить',
      thinking: '⏳ Генерируется ответ...',
      clear: '🗑 Очистить',
      welcome_mentor: `Привет! Я AI-ассистент для менторов. Могу помочь с:\n\n• 📊 Анализом прогресса студентов\n• 📝 Планированием уроков\n• 💡 Стратегиями обучения\n• 🎯 Управлением группой\n\nЧем могу помочь?`,
      welcome_student: `Привет! Я AI-ассистент для студентов. Могу помочь с:\n\n• 📚 Объяснением тем\n• 💡 Решением задач\n• 🎯 Планированием учёбы\n• 📖 Упрощением сложных понятий\n\nЧто хотите спросить?`,
    },
    en: {
      title_mentor: '🤖 AI Assistant (Mentor)',
      title_student: '🤖 AI Assistant (Student)',
      placeholder: 'Type your question...',
      send: 'Send',
      thinking: '⏳ Generating answer...',
      clear: '🗑 Clear',
      welcome_mentor: `Hello! I'm the AI assistant for mentors. I can help with:\n\n• 📊 Analyzing student progress\n• 📝 Lesson planning & methodology\n• 💡 Teaching strategies\n• 🎯 Group management tips\n\nWhat do you need help with?`,
      welcome_student: `Hello! I'm the AI assistant for students. I can help with:\n\n• 📚 Explaining lesson topics\n• 💡 Solving problems\n• 🎯 Planning your studies\n• 📖 Simplifying difficult concepts\n\nWhat would you like to ask?`,
    },
  };

  function t(key) {
    const lang = L();
    return (T[lang] || T.uz)[key] || T.uz[key];
  }

  // ── History storage ───────────────────────────────────────
  const STORAGE_KEY_MENTOR = 'ai_history_mentor';
  const STORAGE_KEY_STUDENT = 'ai_history_student';

  function loadHistory(role) {
    try {
      return JSON.parse(localStorage.getItem(role === 'mentor' ? STORAGE_KEY_MENTOR : STORAGE_KEY_STUDENT) || '[]');
    } catch { return []; }
  }
  function saveHistory(role, history) {
    try {
      localStorage.setItem(role === 'mentor' ? STORAGE_KEY_MENTOR : STORAGE_KEY_STUDENT, JSON.stringify(history.slice(-40)));
    } catch {}
  }

  // ── System prompts ────────────────────────────────────────
  function getSystemPrompt(role) {
    const lang = L();
    if (role === 'mentor') {
      if (lang === 'ru') return 'Ты AI-ассистент для ментора образовательного центра. Помогай с планированием уроков, анализом студентов, стратегиями обучения. Отвечай кратко и по делу. Используй эмодзи для структуры.';
      if (lang === 'en') return 'You are an AI assistant for an education center mentor. Help with lesson planning, student analysis, and teaching strategies. Be concise and use emojis for structure.';
      return 'Siz ta\'lim markazi mentori uchun AI yordamchisiz. Dars rejalashtirish, talabalar tahlili, o\'qitish strategiyalarida yordam bering. Qisqa va aniq javob bering. Emojilardan foydalaning.';
    } else {
      if (lang === 'ru') return 'Ты AI-помощник для студента образовательного центра. Объясняй темы, помогай с задачами, мотивируй учиться. Отвечай кратко, понятно, с примерами. Используй эмодзи.';
      if (lang === 'en') return 'You are an AI assistant for a student at an education center. Explain topics, help with problems, and motivate learning. Be concise, clear, and use examples. Use emojis.';
      return 'Siz ta\'lim markazi talabasi uchun AI yordamchisiz. Mavzularni tushuntiring, masalalar yechishda yordam bering, o\'qishga undang. Qisqa, tushunarli va misollar bilan javob bering. Emojilardan foydalaning.';
    }
  }

  // ── API call — server proxy orqali ───────────────────────
  async function askClaude(role, messages) {
    const res = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: getSystemPrompt(role),
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      throw new Error(data.error || 'Server xato: ' + res.status);
    }
    return data.text || '...';
  }

  // ── Markdown-lite renderer ────────────────────────────────
  function md(text) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background:var(--bg4);padding:1px 5px;border-radius:4px;font-size:.9em">$1</code>')
      .replace(/\n/g, '<br>');
  }

  // ── Render AI panel ───────────────────────────────────────
  function renderAIPanel(wrapId, role) {
    const wrap = document.getElementById(wrapId);
    if (!wrap) return;

    let history = loadHistory(role);

    wrap.innerHTML = `
      <div class="ai-panel-container">
        <div class="ai-panel-header">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--teal));display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">🤖</div>
            <div>
              <div style="font-size:15px;font-weight:800;color:var(--text)">${t(role === 'mentor' ? 'title_mentor' : 'title_student')}</div>
              <div style="font-size:11px;color:var(--text3)">Claude Sonnet 4 · ${L() === 'ru' ? 'Онлайн' : L() === 'en' ? 'Online' : 'Onlayn'}</div>
            </div>
          </div>
          <button onclick="window.clearAIHistory('${role}')" style="font-size:11px;padding:5px 10px;border-radius:7px;border:1.5px solid var(--border2);background:var(--bg3);color:var(--text3);cursor:pointer;font-weight:600">${t('clear')}</button>
        </div>
        <div class="ai-messages" id="ai-msgs-${role}"></div>
        <div class="ai-input-row">
          <textarea id="ai-input-${role}" class="ai-textarea" placeholder="${t('placeholder')}" rows="1"
            onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();window.sendAIMsg('${role}')}"
            oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px'"></textarea>
          <button class="ai-send-btn" id="ai-send-${role}" onclick="window.sendAIMsg('${role}')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
      </div>
    `;

    renderMessages(role, history);
  }

  function renderMessages(role, history) {
    const box = document.getElementById('ai-msgs-' + role);
    if (!box) return;
    const lang = L();
    const welcomeText = t(role === 'mentor' ? 'welcome_mentor' : 'welcome_student');

    let html = `<div class="ai-bubble ai-bubble-bot">
      <div class="ai-avatar">🤖</div>
      <div class="ai-bubble-text">${md(welcomeText)}</div>
    </div>`;

    history.forEach(m => {
      if (m.role === 'user') {
        html += `<div class="ai-bubble ai-bubble-user"><div class="ai-bubble-text">${md(m.content)}</div></div>`;
      } else {
        html += `<div class="ai-bubble ai-bubble-bot"><div class="ai-avatar">🤖</div><div class="ai-bubble-text">${md(m.content)}</div></div>`;
      }
    });

    box.innerHTML = html;
    box.scrollTop = box.scrollHeight;
  }

  // ── Send message ──────────────────────────────────────────
  window.sendAIMsg = async function (role) {
    const inp = document.getElementById('ai-input-' + role);
    const btn = document.getElementById('ai-send-' + role);
    const box = document.getElementById('ai-msgs-' + role);
    if (!inp || !box) return;

    const text = inp.value.trim();
    if (!text) return;

    inp.value = '';
    inp.style.height = 'auto';
    if (btn) { btn.disabled = true; btn.style.opacity = '.4'; }

    // Add user bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'ai-bubble ai-bubble-user';
    userBubble.innerHTML = `<div class="ai-bubble-text">${md(text)}</div>`;
    box.appendChild(userBubble);
    box.scrollTop = box.scrollHeight;

    // Typing indicator
    const typing = document.createElement('div');
    typing.className = 'ai-bubble ai-bubble-bot ai-typing';
    typing.innerHTML = `<div class="ai-avatar">🤖</div><div class="ai-bubble-text"><span class="ai-dots"><span></span><span></span><span></span></span></div>`;
    box.appendChild(typing);
    box.scrollTop = box.scrollHeight;

    let history = loadHistory(role);
    history.push({ role: 'user', content: text });

    try {
      const reply = await askClaude(role, history);
      history.push({ role: 'assistant', content: reply });
      saveHistory(role, history);

      typing.remove();
      const botBubble = document.createElement('div');
      botBubble.className = 'ai-bubble ai-bubble-bot';
      botBubble.innerHTML = `<div class="ai-avatar">🤖</div><div class="ai-bubble-text">${md(reply)}</div>`;
      box.appendChild(botBubble);
    } catch (e) {
      typing.remove();
      const errBubble = document.createElement('div');
      errBubble.className = 'ai-bubble ai-bubble-bot';
      errBubble.innerHTML = `<div class="ai-avatar">🤖</div><div class="ai-bubble-text" style="color:var(--red-text)">⚠️ Xato: ${e.message}</div>`;
      box.appendChild(errBubble);
    } finally {
      box.scrollTop = box.scrollHeight;
      if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
      inp.focus();
    }
  };

  window.clearAIHistory = function (role) {
    saveHistory(role, []);
    const wrapId = role === 'mentor' ? 'mentor-ai-wrap' : 'student-ai-wrap';
    renderAIPanel(wrapId, role);
  };

  // ── Public render functions ───────────────────────────────
  window.renderMentorAI = function () { renderAIPanel('mentor-ai-wrap', 'mentor'); };
  window.renderStudentAI = function () { renderAIPanel('student-ai-wrap', 'student'); };

  console.log('[ai-assistant] loaded');
})();
