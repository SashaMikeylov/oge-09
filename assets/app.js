const units = window.GEO09_UNITS || [];

    const storageKey = 'geo09-progress-v2';
    const reportsKey = 'geo09-class-reports-v1';
    const journalPassword = '110987';
    const readStore = key => {
      try { return JSON.parse(localStorage.getItem(key)) || null; }
      catch { return null; }
    };
    let saved = readStore(storageKey) || {};
    const loadedReports = readStore(reportsKey);
    let reports = Array.isArray(loadedReports) ? loadedReports : [];
    let run = null;
    let revealObserver = null;
    let toastTimer = null;
    const grid = document.getElementById('unitGrid');
    const quizBox = document.getElementById('quizBox');
    const headerProgress = document.getElementById('headerProgress');
    const icons = ['A', 'B', 'C', 'D'];
    const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
    const percent = (value, total) => total ? Math.round(value / total * 100) : 0;
    const questionWord = value => {
      const lastTwo = value % 100;
      if (lastTwo >= 11 && lastTwo <= 14) return 'вопросов';
      const last = value % 10;
      return last === 1 ? 'вопрос' : last >= 2 && last <= 4 ? 'вопроса' : 'вопросов';
    };
    const topicWord = value => {
      const lastTwo = value % 100;
      if (lastTwo >= 11 && lastTwo <= 14) return 'тем';
      const last = value % 10;
      return last === 1 ? 'тема' : last >= 2 && last <= 4 ? 'темы' : 'тем';
    };

    function setupReveals() {
      const targets = document.querySelectorAll('.stats-band, .section-head, .unit-card, .path-card, .about-topic-list > div, .about-steps article, .quiz-intro, .quiz-box, .classroom-section, .teacher-note');
      if (!('IntersectionObserver' in window)) return;
      if (!revealObserver) {
        revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        }), { threshold: .08 });
      }
      targets.forEach((element, index) => {
        if (element.dataset.revealReady) return;
        element.dataset.revealReady = 'true';
        element.classList.add('reveal-ready');
        if (element.matches('.unit-card, .path-card, .about-topic-list > div, .about-steps article')) element.style.transitionDelay = `${(index % 3) * 65}ms`;
        revealObserver.observe(element);
      });
    }

    function setupHeroParallax() {
      const art = document.querySelector('.hero-art');
      if (!art || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      art.addEventListener('pointermove', event => {
        const box = art.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - .5;
        const y = (event.clientY - box.top) / box.height - .5;
        art.style.setProperty('--tilt-y', `${x * 5}deg`);
        art.style.setProperty('--tilt-x', `${-y * 4}deg`);
      });
      art.addEventListener('pointerleave', () => {
        art.style.setProperty('--tilt-x', '0deg');
        art.style.setProperty('--tilt-y', '-2deg');
      });
    }

    function renderUnits() {
      if (!grid) return;
      grid.innerHTML = units.map((unit, index) => {
        const result = saved[index];
        const status = result ? `<span class="card-status done">${result.best}/${unit.questions.length} верно</span>` : '<span class="card-status">не начато</span>';
        return `<a class="unit-card" href="practice.html?unit=${index}" aria-label="Открыть тему: ${unit.title}">
          <div class="unit-top"><span class="unit-number">ТЕМА ${String(index + 1).padStart(2, '0')}</span>${status}</div>
          <div class="unit-content"><div class="unit-art ${unit.color}">${unit.art}</div><div class="unit-copy"><h3>${unit.title}</h3><p>${unit.short}</p></div></div>
          <div class="unit-footer"><span class="card-count">${String(unit.questions.length).padStart(2, '0')} заданий</span><span class="card-arrow" aria-hidden="true">↗</span></div>
        </a>`;
      }).join('');
      updateHeaderProgress();
      setupReveals();
    }

    function updateHeaderProgress() {
      if (!headerProgress) return;
      const done = units.filter((_, index) => saved[index]).length;
      headerProgress.textContent = `${done} из ${units.length} тем`;
    }

    function shuffle(items) {
      const result = [...items];
      for (let index = result.length - 1; index > 0; index--) {
        const other = Math.floor(Math.random() * (index + 1));
        [result[index], result[other]] = [result[other], result[index]];
      }
      return result;
    }

    function startRun(unitIndexes, selectedEntries = null, scopeLabel = '', mode = 'topic', randomCount = 0) {
      const entries = selectedEntries || [];
      if (!selectedEntries) unitIndexes.forEach(unitIndex => units[unitIndex].questions.forEach((question, questionIndex) => entries.push({ unitIndex, questionIndex, question })));
      const label = scopeLabel || (unitIndexes.length > 1 ? `Полный курс · ${entries.length} вопросов` : units[unitIndexes[0]].title);
      run = { id: `geo09-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`, unitIndexes, entries, position: 0, correct: 0, answered: false, studentName: '', scopeLabel: label, mode, randomCount };
      renderSetup();
    }

    function startRandomRun(count) {
      const topicPools = shuffle(units.map((unit, unitIndex) => ({
        unitIndex,
        questions: shuffle(unit.questions.map((question, questionIndex) => ({ unitIndex, questionIndex, question })))
      })));
      const entries = [];
      while (entries.length < count) {
        let added = false;
        for (const pool of topicPools) {
          if (!pool.questions.length || entries.length >= count) continue;
          entries.push(pool.questions.pop());
          added = true;
        }
        if (!added) break;
      }
      const selectedUnits = [...new Set(entries.map(entry => entry.unitIndex))].sort((a, b) => a - b);
      const names = { 7: 'Малая тренировка', 15: 'Средняя тренировка', 30: 'Большая тренировка' };
      document.querySelectorAll('.mode-card').forEach(card => {
        const selected = Number(card.dataset.mode) === count;
        card.classList.toggle('is-selected', selected);
        card.setAttribute('aria-pressed', String(selected));
      });
      startRun(selectedUnits, shuffle(entries), `${names[count] || 'Случайная тренировка'} · ${entries.length} вопросов`, 'random', count);
    }

    function renderSetup() {
      const total = run.entries.length;
      const label = run.scopeLabel;
      quizBox.innerHTML = `<div class="quiz-box-top"><span class="quiz-topic">${label}</span><span class="quiz-step">${String(total).padStart(2, '0')} ${questionWord(total).toLocaleUpperCase('ru-RU')}</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:0"></div></div>
        <form class="setup-card" id="studentForm">
          <div class="setup-icon" aria-hidden="true">∠</div><span class="eyebrow">ПЕРЕД СТАРТОМ</span>
          <h3>Кто проходит квиз?</h3>
          <p>Имя появится в итоговом отчёте, чтобы учитель видел результат. Отчёт не отправляется автоматически.</p>
          <div class="student-field"><label for="studentName">Имя и фамилия</label><input id="studentName" name="studentName" maxlength="70" autocomplete="name" placeholder="Например, Анна Петрова"></div>
          <div class="setup-meta"><span>${total} ${questionWord(total)}</span><span>${run.unitIndexes.length} ${topicWord(run.unitIndexes.length)}</span><span>с разбором ошибок</span></div>
          <button class="button-primary" type="submit">Начать квиз <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2.5 8h10m-4-4 4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        </form>`;
      document.getElementById('studentForm').addEventListener('submit', event => {
        event.preventDefault();
        run.studentName = document.getElementById('studentName').value.trim().slice(0, 70) || 'Без имени';
        renderQuestion();
      });
    }

    function renderQuestion() {
      const entry = run.entries[run.position];
      const unit = units[entry.unitIndex];
      const q = entry.question;
      const questionNumber = run.position + 1;
      const total = run.entries.length;
      const topicLabel = run.unitIndexes.length === 1 && run.mode === 'topic' ? unit.title : `Маршрут · ${unit.title}`;
      quizBox.innerHTML = `<div class="quiz-box-top"><span class="quiz-topic">${topicLabel}</span><span class="quiz-step">${String(questionNumber).padStart(2,'0')} / ${String(total).padStart(2,'0')}</span></div>
        <div class="progress-track" aria-label="Прогресс квиза"><div class="progress-fill" style="width:${((questionNumber - 1) / total) * 100}%"></div></div>
        <div class="quiz-content" key="${questionNumber}"><div class="question-meta"><span class="question-line">ОГЭ · задание ${q.line || 'тренировочное'}</span><span class="question-topic">${unit.title}</span></div><h3 class="question">${q.q}</h3>
          ${q.figure ? `<div class="question-figure">${q.figure}</div>` : ''}
          <div class="answers" role="group" aria-label="Варианты ответа">${q.a.map((answer, index) => `<button type="button" class="answer" data-answer="${index}"><span class="answer-key">${icons[index]}</span><span>${answer}</span></button>`).join('')}</div>
          <div class="feedback" id="feedback" role="status"></div>
          <div class="quiz-controls"><span class="quiz-hint">Выбери один вариант ответа</span><button class="button-next" id="nextQuestion" type="button" disabled>${questionNumber === total ? 'К результату' : 'Следующий вопрос'} →</button></div>
        </div>`;
      quizBox.querySelectorAll('[data-answer]').forEach(button => button.addEventListener('click', () => chooseAnswer(Number(button.dataset.answer))));
      document.getElementById('nextQuestion').addEventListener('click', advance);
    }

    function chooseAnswer(selected) {
      if (run.answered) return;
      run.answered = true;
      const entry = run.entries[run.position];
      const q = entry.question;
      const isCorrect = selected === q.correct;
      entry.wasCorrect = isCorrect;
      entry.selectedIndex = selected;
      if (isCorrect) run.correct++;
      quizBox.querySelectorAll('[data-answer]').forEach((button, index) => {
        button.disabled = true;
        if (index === selected) button.classList.add(isCorrect ? 'selected-correct' : 'selected-wrong');
        if (index === q.correct && !isCorrect) button.classList.add('is-correct');
      });
      const feedback = document.getElementById('feedback');
      const prefix = isCorrect ? 'Верно!' : `Пока нет. Правильный ответ: ${q.a[q.correct]}.`;
      feedback.innerHTML = `<div class="feedback-head ${isCorrect ? 'ok' : 'no'}"><span>${isCorrect ? '✓' : '↗'}</span>${prefix}</div><p>${q.note}</p>`;
      feedback.classList.add('visible');
      document.getElementById('nextQuestion').disabled = false;
      document.querySelector('.quiz-hint').textContent = isCorrect ? 'Отлично — запомни правило из заметки' : 'Разбор поможет закрепить тему';
    }

    function advance() {
      if (!run.answered) return;
      if (run.position + 1 < run.entries.length) {
        run.position++;
        run.answered = false;
        renderQuestion();
      } else renderResult();
    }

    function makeReport() {
      const topicResults = run.unitIndexes.map(unitIndex => {
        const entries = run.entries.filter(item => item.unitIndex === unitIndex);
        const correct = entries.filter(item => item.wasCorrect).length;
        return { title: units[unitIndex].title, correct, wrong: entries.length - correct, total: entries.length };
      });
      const mistakes = run.entries.filter(item => !item.wasCorrect).map(item => ({
        topic: units[item.unitIndex].title,
        question: item.question.q,
        selected: item.question.a[item.selectedIndex],
        correctAnswer: item.question.a[item.question.correct],
        note: item.question.note
      }));
      return {
        format: 'geo09-student-report', version: 1, id: run.id,
        student: run.studentName || 'Без имени', createdAt: new Date().toISOString(),
        scope: run.scopeLabel,
        total: run.entries.length, correct: run.correct, wrong: run.entries.length - run.correct,
        topics: topicResults, mistakes
      };
    }

    function renderResult() {
      const report = makeReport();
      const isAll = run.mode === 'course';
      const message = report.correct === report.total ? 'Все задания решены верно — отличный результат.' : percent(report.correct, report.total) >= 75 ? 'Сильный результат. Ошибки ниже покажут, что повторить точечно.' : percent(report.correct, report.total) >= 50 ? 'Хорошая основа. Разбери ошибки и повтори темы с низким результатом.' : 'Проверь пояснения к ошибкам и пройди маршрут ещё раз — это поможет закрепить формулы.';
      if (run.mode !== 'random') report.topics.forEach((topic, index) => {
        const unitIndex = run.unitIndexes[index];
        saved[unitIndex] = { best: Math.max(saved[unitIndex]?.best || 0, topic.correct) };
      });
      reports = [report, ...reports.filter(item => item.id !== report.id)].slice(0, 150);
      try {
        localStorage.setItem(storageKey, JSON.stringify(saved));
        localStorage.setItem(reportsKey, JSON.stringify(reports));
      } catch {}
      renderUnits();
      renderJournal();

      const topicRows = report.topics.map(topic => `<div class="topic-result"><span class="topic-result-name" title="${escapeHTML(topic.title)}">${escapeHTML(topic.title)}</span><span class="topic-result-track"><span class="topic-result-fill" style="display:block;width:${percent(topic.correct,topic.total)}%"></span></span><span class="topic-result-score">${topic.correct}/${topic.total}</span></div>`).join('');
      const mistakeRows = report.mistakes.map(mistake => `<article class="mistake-item"><strong>${escapeHTML(mistake.topic)} · ${escapeHTML(mistake.question)}</strong><p>Твой ответ: <b>${escapeHTML(mistake.selected)}</b> · Верный: <b>${escapeHTML(mistake.correctAnswer)}</b><br>${escapeHTML(mistake.note)}</p></article>`).join('');
      quizBox.innerHTML = `<div class="quiz-box-top"><span class="quiz-topic">${isAll ? 'Маршрут завершён' : escapeHTML(report.scope)}</span><span class="quiz-step">ОТЧЁТ УЧЕНИКА</span></div><div class="progress-track"><div class="progress-fill" style="width:100%"></div></div>
        <div class="result-panel">
          <div class="result-heading"><div><span class="eyebrow">${escapeHTML(report.student)} · ${new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'short'}).format(new Date(report.createdAt))}</span><h3>${report.correct} из ${report.total} верно</h3><p>${message}</p></div><div class="score-ring" style="--score:${percent(report.correct,report.total)}%"><strong>${percent(report.correct,report.total)}%</strong></div></div>
          <div class="result-metrics"><div class="result-metric good"><strong>${report.correct}</strong><span>правильно</span></div><div class="result-metric missed"><strong>${report.wrong}</strong><span>ошибок</span></div><div class="result-metric"><strong>${report.total}</strong><span>всего заданий</span></div></div>
          <div class="result-subhead">Результат по темам <small>верные / все</small></div><div class="topic-results">${topicRows}</div>
          <div class="result-subhead">${report.wrong ? `Разбор ошибок · ${report.wrong}` : 'Ошибок нет'} <small>${report.wrong ? 'ответ и правило для повтора' : 'можно идти дальше'}</small></div>
          ${report.wrong ? `<div class="mistake-list">${mistakeRows}</div>` : '<div class="all-correct">Чистый маршрут. Каждая формула сработала точно — сохрани результат и переходи к следующей теме.</div>'}
          <div class="result-actions"><button class="button-secondary primary-soft" id="downloadStudentReport" type="button">Скачать отчёт для учителя ↓</button><button class="button-secondary" id="retryButton" type="button">Пройти ещё раз ↻</button><a class="button-secondary" href="journal.html">Открыть журнал класса ↗</a></div>
          <p class="report-help">Отчёт содержит имя, баллы по темам и список ошибок. Он скачивается на устройство и не отправляется автоматически.</p>
        </div>`;
      document.getElementById('downloadStudentReport').addEventListener('click', () => downloadStudentReport(report));
      document.getElementById('retryButton').addEventListener('click', () => {
        const previousRun = run;
        if (previousRun.randomCount) startRandomRun(previousRun.randomCount);
        else startRun(previousRun.unitIndexes, null, previousRun.scopeLabel, previousRun.mode);
      });
    }

    function formatDate(iso) {
      const date = new Date(iso);
      return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date);
    }

    function showToast(message) {
      const root = document.getElementById('toastRoot');
      if (!root) return;
      root.replaceChildren();
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      root.appendChild(toast);
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.remove(), 4200);
    }

    function saveDownload(blob, filename) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1200);
    }

    function downloadStudentReport(report) {
      const safeName = report.student.toLowerCase().replace(/[^a-zа-яё0-9]+/gi, '-').replace(/^-|-$/g, '') || 'student';
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json;charset=utf-8' });
      saveDownload(blob, `geo09-${safeName}-${report.id.slice(-8)}.json`);
      showToast('Отчёт скачан. Ученик может отправить JSON-файл учителю.');
    }

    function validStudentReport(raw) {
      if (!raw || raw.format !== 'geo09-student-report' || raw.version !== 1 || typeof raw.id !== 'string' || typeof raw.student !== 'string' || typeof raw.scope !== 'string') return null;
      if (!Number.isInteger(raw.total) || !Number.isInteger(raw.correct) || !Number.isInteger(raw.wrong) || raw.total < 1 || raw.correct < 0 || raw.wrong < 0 || raw.correct + raw.wrong !== raw.total) return null;
      if (!Array.isArray(raw.topics) || raw.topics.length < 1 || raw.topics.length > units.length || !Array.isArray(raw.mistakes) || raw.mistakes.length > raw.wrong) return null;
      const date = new Date(raw.createdAt);
      if (Number.isNaN(date.getTime())) return null;
      const topics = raw.topics.map(topic => {
        if (!topic || typeof topic.title !== 'string' || !Number.isInteger(topic.total) || !Number.isInteger(topic.correct) || !Number.isInteger(topic.wrong) || topic.total < 1 || topic.correct + topic.wrong !== topic.total) return null;
        return { title: topic.title.slice(0, 100), total: topic.total, correct: topic.correct, wrong: topic.wrong };
      });
      if (topics.some(topic => !topic) || topics.reduce((sum, topic) => sum + topic.total, 0) !== raw.total || topics.reduce((sum, topic) => sum + topic.correct, 0) !== raw.correct) return null;
      const mistakes = raw.mistakes.map(item => {
        if (!item || ['topic','question','selected','correctAnswer','note'].some(key => typeof item[key] !== 'string')) return null;
        return { topic: item.topic.slice(0,100), question: item.question.slice(0,500), selected: item.selected.slice(0,100), correctAnswer: item.correctAnswer.slice(0,100), note: item.note.slice(0,1000) };
      });
      if (mistakes.some(item => !item)) return null;
      return { format: 'geo09-student-report', version: 1, id: raw.id.slice(0,100), student: raw.student.trim().slice(0,70) || 'Без имени', createdAt: date.toISOString(), scope: raw.scope.slice(0,100), total: raw.total, correct: raw.correct, wrong: raw.wrong, topics, mistakes };
    }

    async function importStudentReports(files) {
      let imported = 0;
      let skipped = 0;
      for (const file of files) {
        if (file.size > 1_000_000) { skipped++; continue; }
        try {
          const report = validStudentReport(JSON.parse(await file.text()));
          if (!report || reports.some(item => item.id === report.id)) { skipped++; continue; }
          reports.unshift(report);
          imported++;
        } catch { skipped++; }
      }
      reports = reports.slice(0, 150);
      try { localStorage.setItem(reportsKey, JSON.stringify(reports)); } catch {}
      renderJournal();
      showToast(imported ? `Добавлено отчётов: ${imported}${skipped ? ` · пропущено: ${skipped}` : ''}.` : 'Подходящие новые отчёты не найдены. Проверь формат JSON-файла.');
    }

    function renderJournal() {
      const content = document.getElementById('journalContent');
      const countLabel = document.getElementById('journalCount');
      const csvButton = document.getElementById('exportClassCsv');
      const clearButton = document.getElementById('clearClassJournal');
      if (!content || !countLabel || !csvButton || !clearButton) return;
      countLabel.textContent = reports.length ? `Загружено отчётов: ${reports.length}` : 'Пока нет отчётов';
      csvButton.disabled = reports.length === 0;
      clearButton.disabled = reports.length === 0;
      if (!reports.length) {
        content.innerHTML = '<div class="journal-empty">Здесь появятся результаты класса.<br>На общем устройстве они сохраняются сами. Если ученики проходят квиз на своих устройствах, выбери их JSON-отчёты через «Импортировать отчёты».</div>';
        return;
      }
      const totalAnswers = reports.reduce((sum, report) => sum + report.total, 0);
      const totalCorrect = reports.reduce((sum, report) => sum + report.correct, 0);
      const topicErrors = new Map();
      reports.forEach(report => report.topics.forEach(topic => topicErrors.set(topic.title, (topicErrors.get(topic.title) || 0) + topic.wrong)));
      const hardest = [...topicErrors.entries()].sort((a,b) => b[1] - a[1]).slice(0, 3);
      const topicChips = hardest.map(([title, errors]) => `<span class="journal-chip">${escapeHTML(title)} <b>${errors} ошибок</b></span>`).join('');
      const rows = [...reports].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map((report, index) => {
        const details = report.mistakes.length ? `<div class="journal-detail-list">${report.mistakes.map(mistake => `<div class="journal-detail-item"><b>${escapeHTML(mistake.topic)} · ${escapeHTML(mistake.question)}</b><span>Ответ: ${escapeHTML(mistake.selected)} · Верно: ${escapeHTML(mistake.correctAnswer)}</span></div>`).join('')}</div>` : '<div class="journal-detail-list"><span>Все ответы верны — отлично!</span></div>';
        return `<tr style="animation-delay:${Math.min(index,8) * 35}ms"><td class="journal-student">${escapeHTML(report.student)}</td><td>${formatDate(report.createdAt)}</td><td>${escapeHTML(report.scope)}</td><td class="journal-good">${report.correct}/${report.total}</td><td class="journal-wrong">${report.wrong}</td><td>${percent(report.correct, report.total)}%</td><td><details class="journal-detail"><summary>${report.wrong ? 'Посмотреть ошибки' : 'Без ошибок'}</summary>${details}</details></td></tr>`;
      }).join('');
      content.innerHTML = `<div class="journal-summary"><div class="journal-stat"><strong>${reports.length}</strong><span>отчётов</span></div><div class="journal-stat"><strong>${percent(totalCorrect,totalAnswers)}%</strong><span>средняя точность</span></div><div class="journal-stat"><strong>${reports.reduce((sum,report) => sum + report.wrong,0)}</strong><span>ошибок всего</span></div></div>
        <div class="journal-topic-bars">${topicChips || '<span class="journal-chip">Пока нет ошибок</span>'}</div>
        <div class="journal-table-wrap"><table class="journal-table"><thead><tr><th>Ученик</th><th>Дата</th><th>Маршрут</th><th>Верно</th><th>Ошибки</th><th>Точность</th><th>Разбор</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    }

    function exportClassCsv() {
      if (!reports.length) return;
      const quote = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
      const headers = ['Ученик','Дата','Маршрут','Правильно','Ошибки','Всего','Точность',...units.map(unit => unit.title)];
      const rows = [...reports].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(report => {
        const topicScores = units.map(unit => {
          const topic = report.topics.find(item => item.title === unit.title);
          return topic ? `${topic.correct}/${topic.total}` : '';
        });
        return [report.student, formatDate(report.createdAt), report.scope, report.correct, report.wrong, report.total, `${percent(report.correct,report.total)}%`, ...topicScores];
      });
      const csv = '\ufeff' + [headers, ...rows].map(row => row.map(quote).join(';')).join('\r\n');
      saveDownload(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'geo09-zhurnal-klassa.csv');
      showToast('Сводка класса скачана в CSV — её можно открыть в Excel.');
    }

    function clearClassJournal() {
      const dialog = document.getElementById('clearJournalDialog');
      const passwordInput = document.getElementById('clearJournalPassword');
      const error = document.getElementById('clearJournalError');
      if (!reports.length || !dialog || !passwordInput || !error) return;
      error.hidden = true;
      passwordInput.value = '';
      dialog.hidden = false;
      window.requestAnimationFrame(() => passwordInput.focus());
    }

    function closeClearJournalDialog() {
      const dialog = document.getElementById('clearJournalDialog');
      const passwordInput = document.getElementById('clearJournalPassword');
      if (!dialog) return;
      dialog.hidden = true;
      if (passwordInput) passwordInput.value = '';
      const clearButton = document.getElementById('clearClassJournal');
      if (clearButton) clearButton.focus();
    }

    function submitClearJournalPassword(event) {
      event.preventDefault();
      const passwordInput = document.getElementById('clearJournalPassword');
      const error = document.getElementById('clearJournalError');
      if (!passwordInput || !error) return;
      if (passwordInput.value !== journalPassword) {
        error.hidden = false;
        passwordInput.select();
        return;
      }
      reports = [];
      try { localStorage.removeItem(reportsKey); } catch {}
      closeClearJournalDialog();
      renderJournal();
      showToast('Журнал очищен. Прогресс по темам сохранён.');
    }

    function renderInitialQuiz() {
      if (!quizBox) return;
      quizBox.innerHTML = `<div class="quiz-box-top"><span class="quiz-topic">готов к старту?</span><span class="quiz-step">${units.reduce((sum, unit) => sum + unit.questions.length, 0)} ВОПРОСА</span></div><div class="progress-track"><div class="progress-fill" style="width:0"></div></div><div class="result-card"><div class="result-stamp">∠</div><h3>Выбери свой темп</h3><p>Запусти малую, среднюю или большую случайную тренировку выше. В конце увидишь точность, результат по темам и разбор ошибок.</p><button class="button-primary" id="quickStart" type="button">Пройти весь курс · ${units.reduce((sum, unit) => sum + unit.questions.length, 0)} вопросов <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2.5 8h10m-4-4 4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>`;
      document.getElementById('quickStart').addEventListener('click', () => startRun(units.map((_, index) => index), null, `Полный курс · ${units.reduce((sum, unit) => sum + unit.questions.length, 0)} вопросов`, 'course'));
    }

    const reportImport = document.getElementById('reportImport');
    const exportButton = document.getElementById('exportClassCsv');
    const clearJournalButton = document.getElementById('clearClassJournal');
    const clearJournalForm = document.getElementById('clearJournalForm');
    const cancelClearJournalButton = document.getElementById('cancelClearJournal');
    const clearJournalDialog = document.getElementById('clearJournalDialog');
    if (reportImport) reportImport.addEventListener('change', event => {
      importStudentReports(Array.from(event.target.files || []));
      event.target.value = '';
    });
    if (exportButton) exportButton.addEventListener('click', exportClassCsv);
    if (clearJournalButton) clearJournalButton.addEventListener('click', clearClassJournal);
    if (clearJournalForm) clearJournalForm.addEventListener('submit', submitClearJournalPassword);
    if (cancelClearJournalButton) cancelClearJournalButton.addEventListener('click', closeClearJournalDialog);
    if (clearJournalDialog) {
      clearJournalDialog.addEventListener('click', event => {
        if (event.target === clearJournalDialog) closeClearJournalDialog();
      });
      document.addEventListener('keydown', event => {
        if (clearJournalDialog.hidden) return;
        if (event.key === 'Escape') closeClearJournalDialog();
        if (event.key === 'Tab') {
          const focusable = clearJournalDialog.querySelectorAll('input:not([disabled]), button:not([disabled])');
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
      });
    }
    document.querySelectorAll('.mode-card[data-mode]').forEach(card => card.addEventListener('click', () => startRandomRun(Number(card.dataset.mode))));
    renderUnits();
    renderJournal();
    updateHeaderProgress();
    if (quizBox) {
      const requestedUnit = new URLSearchParams(window.location.search).get('unit');
      if (requestedUnit === 'all') startRun(units.map((_, index) => index), null, `Полный курс · ${units.reduce((sum, unit) => sum + unit.questions.length, 0)} вопросов`, 'course');
      else if (requestedUnit !== null && Number.isInteger(Number(requestedUnit)) && Number(requestedUnit) >= 0 && Number(requestedUnit) < units.length) startRun([Number(requestedUnit)]);
      else renderInitialQuiz();
    }
    setupReveals();
    setupHeroParallax();
