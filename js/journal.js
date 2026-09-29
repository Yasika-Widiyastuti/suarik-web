// journal.js — CRUD cerita di localStorage, insight sederhana.
(function () {
    "use strict";
    var S = window.Suarik;

    var topicSel = document.getElementById('j-topic');
    S.JOURNAL_TOPICS.forEach(function (t) {
        var o = document.createElement('option'); o.value = t; o.textContent = t; topicSel.appendChild(o);
    });

    var content = document.getElementById('j-content');
    var counter = document.getElementById('j-count');
    content.addEventListener('input', function () { counter.textContent = content.value.length; });

    var listEl = document.getElementById('journal-list');
    var emptyEl = document.getElementById('journal-empty');
    var insight = document.getElementById('insight-text');

    function render() {
        var journals = S.getAllJournals();
        if (journals.length === 0) {
            listEl.innerHTML = '';
            emptyEl.hidden = false;
            insight.textContent = 'Belum ada cerita. Kamu bisa mulai dari satu paragraf singkat.';
            return;
        }
        emptyEl.hidden = true;

        var counts = {};
        journals.forEach(function (j) { counts[j.topic] = (counts[j.topic] || 0) + 1; });
        var top = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; })[0];
        insight.textContent = 'Belakangan ini kamu cukup sering menulis tentang ' + top + '. Coba beri ruang untuk satu langkah kecil hari ini.';

        listEl.innerHTML = journals.map(function (j) {
            return '<li class="card journal-entry">' +
                '<header class="journal-head">' +
                    '<div><h3>' + S.escapeHTML(j.title || 'Tanpa judul') + '</h3><p class="muted small">' + S.escapeHTML(j.topic) + ' · ' + S.escapeHTML(S.formatDateTime(j.created_at)) + '</p></div>' +
                    '<button type="button" class="btn btn-ghost btn-sm btn-danger" data-delete="' + j.id + '">Hapus</button>' +
                '</header>' +
                '<p class="journal-content">' + S.escapeHTML(j.content) + '</p>' +
            '</li>';
        }).join('');
    }

    listEl.addEventListener('click', function (e) {
        var b = e.target.closest('[data-delete]');
        if (!b) return;
        if (!confirm('Hapus cerita ini?')) return;
        S.deleteJournal(parseInt(b.dataset.delete, 10));
        render();
        window.SuarikToast.show('Cerita dihapus.', 'success');
    });

    document.getElementById('journal-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var f = e.target;
        var body = f.content.value.trim();
        if (!body) { window.SuarikToast.show('Isi cerita wajib diisi.', 'error'); return; }
        if (body.length > 1500) { window.SuarikToast.show('Isi cerita maksimal 1500 karakter.', 'error'); return; }
        S.addJournal({
            title: f.title.value.trim().slice(0, 120),
            content: body,
            topic: f.topic.value
        });
        f.reset();
        counter.textContent = '0';
        render();
        window.SuarikToast.show('Cerita berhasil disimpan.', 'success');
    });

    render();
})();
