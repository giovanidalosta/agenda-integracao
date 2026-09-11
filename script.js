/**
 * Ikatec - Agenda de Integração
 * Pure JavaScript - no framework.
 */
(function () {
  'use strict';

  /* State */
  var activityCounter = 0;
  var activities = [];

  /* DOM refs */
  var collabNameEl = document.getElementById('collabName');
  var integrationDateEl = document.getElementById('integrationDate');
  var addActivityBtn = document.getElementById('addActivityBtn');
  var activitiesContainer = document.getElementById('activitiesContainer');
  var generateBtn = document.getElementById('generateBtn');
  var exportPdfBtn = document.getElementById('exportPdfBtn');
  var exportPngBtn = document.getElementById('exportPngBtn');
  var agendaDoc = document.getElementById('agendaDoc');

  /* Helpers */
  function fmtTime(t) {
    if (!t) return '--:--';
    return t.replace(':', 'h');
  }

  function fmtDate(d) {
    if (!d) return '';
    var dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var TYPE_LABELS = {
    normal: 'Normal',
    free: 'Horario Livre',
    lunch: 'Almoco',
    training: 'Treinamento',
    meeting: 'Reuniao'
  };

  /* Create activity card */
  function createActivityCard() {
    activityCounter++;
    var id = activityCounter;
    activities.push({ id: id, start: '', end: '', title: '', desc: '', type: 'normal' });

    var card = document.createElement('div');
    card.className = 'activity-card';
    card.dataset.id = id;
    card.innerHTML =
      '<div class="card-header">' +
      '<span>Atividade ' + id + '</span>' +
      '<button class="remove-btn" title="Remover">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
      '<path d="M18 6 6 18M6 6l12 12"/></svg>' +
      '</button>' +
      '</div>' +
      '<div class="time-row">' +
      '<div class="field"><label>Inicio</label><input type="time" class="js-start" /></div>' +
      '<div class="field"><label>Fim</label><input type="time" class="js-end" /></div>' +
      '</div>' +
      '<div class="field"><label>Título</label>' +
      '<input type="text" class="js-title" placeholder="Ex.: Integração com RH" /></div>' +
      '<div class="field"><label>Descrição</label>' +
      '<textarea class="js-desc" placeholder="Detalhes da atividade..."></textarea></div>' +
      '<div class="field"><label>Tipo</label>' +
      '<select class="js-type">' +
      '<option value="normal">Normal</option>' +
      '<option value="free">Horario Livre</option>' +
      '<option value="lunch">Almoco</option>' +
      '<option value="training">Treinamento</option>' +
      '<option value="meeting">Reuniao</option>' +
      '</select></div>';

    /* Remove handler */
    card.querySelector('.remove-btn').addEventListener('click', function () {
      var idx = activities.findIndex(function (a) { return a.id === id; });
      if (idx !== -1) activities.splice(idx, 1);
      card.remove();
      renderAgenda();
    });

    /* Sync inputs to state */
    function sync() {
      var a = activities.find(function (a) { return a.id === id; });
      if (!a) return;
      a.start = card.querySelector('.js-start').value;
      a.end = card.querySelector('.js-end').value;
      a.title = card.querySelector('.js-title').value;
      a.desc = card.querySelector('.js-desc').value;
      a.type = card.querySelector('.js-type').value;
      renderAgenda();
    }

    card.querySelectorAll('input, textarea, select').forEach(function (el) {
      el.addEventListener('input', sync);
      el.addEventListener('change', sync);
    });

    activitiesContainer.appendChild(card);
    renderAgenda();
  }

  /* Render agenda document */
  function renderAgenda() {
    var name = collabNameEl.value.trim() || '[Nome do Colaborador]';
    var rawDate = integrationDateEl.value;
    var dateStr = rawDate ? fmtDate(rawDate) : '[Data da Integração]';

    var sorted = activities.slice().sort(function (a, b) {
      return a.start.localeCompare(b.start);
    });

    var rowsHtml = '';
    sorted.forEach(function (act) {
      if (!act.title && !act.start) return;
      var label = TYPE_LABELS[act.type] || act.type;
      rowsHtml +=
        '<tr class="row-' + act.type + '">' +
        '<td>' + fmtTime(act.start) + ' &ndash; ' + fmtTime(act.end) + '</td>' +
        '<td>' +
        '<span class="act-badge">' + label + '</span>' +
        '<div class="act-title">' + escHtml(act.title || '&mdash;') + '</div>' +
        (act.desc ? '<div class="act-desc">' + escHtml(act.desc) + '</div>' : '') +
        '</td>' +
        '</tr>';
    });

    var tableHtml = rowsHtml
      ? '<table class="agenda-table"><thead><tr><th>Horario</th><th>Atividade</th></tr></thead><tbody>' + rowsHtml + '</tbody></table>'
      : '<div class="empty-state"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg><p>Adicione atividades no painel ao lado para visualizar a agenda.</p></div>';

    agendaDoc.innerHTML =
      '<div class="doc-stripe"></div>' +
      '<div class="doc-header">' +
      '<div class="doc-logo">' +
      '<img src="logo.png" alt="Ikatec" onerror="this.style.display=\'none\';this.parentElement.innerHTML=\'<span class=doc-logo-placeholder>IK</span>\'" />' +
      '</div>' +
      '<div class="doc-title-area">' +
      '<div class="doc-label">Ikatec Tecnologia e Inovacao</div>' +
      '<div class="doc-title">Agenda de Integração</div>' +
      '<div class="doc-welcome">Bem-vindo(a) a Ikatec, ' + escHtml(name) + '!</div>' +
      '</div>' +
      '</div>' +
      '<div class="doc-info-band">' +
      '<div class="doc-info-item"><div class="doc-info-label">Colaborador</div><div class="doc-info-value">' + escHtml(name) + '</div></div>' +
      '<div class="doc-info-item"><div class="doc-info-label">Data da Integração</div><div class="doc-info-value">' + dateStr + '</div></div>' +
      '</div>' +
      '<div class="doc-body">' +
      '<div class="doc-section-label">Programação do Dia</div>' +
      tableHtml +
      '</div>' +
      '<div class="doc-footer">' +
      '<span class="doc-footer-tag">Tecnologia e inovação para transformar negócios e pessoas</span>' +
      '<span class="doc-footer-logo"><svg width="16" height="16" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#09A8C9"/><path d="M8 14h12M14 8v12" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg> Ikatec</span>' +
      '</div>';
  }

  /* Export PDF */
  function exportToPdf() {
    var orig = exportPdfBtn.innerHTML;
    exportPdfBtn.textContent = 'Gerando...';
    exportPdfBtn.disabled = true;
    html2canvas(agendaDoc, { scale: 2, useCORS: true, backgroundColor: '#ffffff' }).then(function (canvas) {
      var imgData = canvas.toDataURL('image/png');
      var jsPDF = window.jspdf.jsPDF;
      var pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      var pdfW = pdf.internal.pageSize.getWidth();
      var pdfH = (canvas.height * pdfW) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
      pdf.save('agenda-integracao.pdf');
    }).finally(function () {
      exportPdfBtn.innerHTML = orig;
      exportPdfBtn.disabled = false;
    });
  }

  /* Export PNG */
  function exportToPng() {
    var orig = exportPngBtn.innerHTML;
    exportPngBtn.textContent = 'Gerando...';
    exportPngBtn.disabled = true;
    html2canvas(agendaDoc, { scale: 2, useCORS: true, backgroundColor: '#ffffff' }).then(function (canvas) {
      var link = document.createElement('a');
      link.download = 'agenda-integracao.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }).finally(function () {
      exportPngBtn.innerHTML = orig;
      exportPngBtn.disabled = false;
    });
  }

  /* Event listeners */
  addActivityBtn.addEventListener('click', createActivityCard);
  generateBtn.addEventListener('click', renderAgenda);
  exportPdfBtn.addEventListener('click', exportToPdf);
  exportPngBtn.addEventListener('click', exportToPng);
  collabNameEl.addEventListener('input', renderAgenda);
  integrationDateEl.addEventListener('input', renderAgenda);

  /* Initial render */
  renderAgenda();
})();