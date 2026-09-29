// result.js — Baca ?id= dari URL, tampilkan hasil check-in dan rekomendasi.
(function () {
    "use strict";
    var S = window.Suarik;
    var root = document.getElementById('result-root');
    if (!root) return;

    var params = new URLSearchParams(window.location.search);
    var id = parseInt(params.get('id'), 10);
    if (!id) return renderNotFound();

    var c = S.getCheckin(id);
    if (!c) return renderNotFound();

    var scores = {
        academic_score: c.academic_score, career_score: c.career_score,
        financial_score: c.financial_score, relationship_score: c.relationship_score,
        burnout_score: c.burnout_score
    };
    var focus = S.getFocusCategory(scores);
    var recs = S.getRecommendations(focus);
    var stressText = S.stressLabel(c.stress_level);
    var stressClass = 'stress-' + stressText.toLowerCase().replace(/ /g, '-');

    var selectedAreas = [];
    Object.keys(scores).forEach(function (k) { if (scores[k] > 0) selectedAreas.push(S.CATEGORY_LABELS[k]); });
    var alert = S.needsSupportAlert(c.emotion, c.stress_level, selectedAreas);

    var focusExplain = {
        Akademik: 'Sepertinya area akademik sedang mengambil banyak ruang di pikiranmu. Kamu tidak perlu menyelesaikan semuanya sekaligus.',
        Karier: 'Pikiran tentang karier bisa terasa besar. Kita coba mulai dari satu langkah yang cukup dekat untuk dijangkau.',
        Finansial: 'Beban finansial sering terasa berat karena banyak faktor di luar kendali. Fokus pada satu bagian yang bisa kamu atur hari ini.',
        Relasi: 'Relasi memerlukan energi, dan tidak apa-apa jika kamu butuh jeda. Satu percakapan kecil yang jujur sudah cukup.',
        Burnout: 'Tubuh dan pikiranmu sedang meminta jeda. Beri ruang untuk memulihkan energi lebih dulu.',
        Personal: 'Beri dirimu waktu untuk hadir sejenak sebelum melangkah.'
    };
    var validCat = ['Akademik','Karier','Finansial','Relasi','Burnout','Personal'];
    var recCategory = validCat.indexOf(focus) !== -1 ? focus : 'Personal';

    var recsHtml = recs.map(function (r) {
        return '<li class="recommendation-item">' +
            '<div class="rec-body">' +
                '<h3>' + S.escapeHTML(r.title) + '</h3>' +
                '<p class="rec-meta"><span class="pill">' + r.duration + ' menit</span> <span class="pill pill-outline">' + S.escapeHTML(focus) + '</span></p>' +
                '<p class="rec-reason">' + S.escapeHTML(r.reason) + '</p>' +
            '</div>' +
            '<button type="button" class="btn btn-primary btn-sm add-rec-btn" ' +
                'data-title="' + S.escapeHTML(r.title) + '" ' +
                'data-category="' + S.escapeHTML(recCategory) + '" ' +
                'data-duration="' + r.duration + '">Tambahkan ke Langkah Kecilku</button>' +
        '</li>';
    }).join('');

    var alertHtml = alert ? (
        '<div class="alert alert-support" role="alert">' +
            '<strong>Kamu tidak harus menghadapi semuanya sendirian.</strong>' +
            '<p>Jika kamu merasa tidak aman atau ingin menyakiti diri sendiri, segera hubungi orang tepercaya, layanan darurat setempat, atau tenaga profesional. Kunjungi juga halaman <a href="help.html">Suarakan Butuhmu</a>.</p>' +
        '</div>'
    ) : '';

    var noteHtml = c.note ? (
        '<section class="card note-card"><span class="card-eyebrow">Catatanmu</span><p class="note-text">' + S.escapeHTML(c.note) + '</p></section>'
    ) : '';

    root.innerHTML =
        '<header class="page-head">' +
            '<span class="eyebrow">Yang Sedang Berbicara</span>' +
            '<h1>' + S.escapeHTML(S.empatheticGreeting(c.emotion)) + '</h1>' +
            '<p class="muted">Check-in disimpan pada ' + S.escapeHTML(S.formatDateTime(c.created_at)) + '</p>' +
        '</header>' +
        alertHtml +
        '<div class="grid grid-2">' +
            '<article class="card summary-card">' +
                '<span class="card-eyebrow">Tingkat tekanan</span>' +
                '<div class="stress-badge ' + stressClass + '">' +
                    '<span class="stress-number">' + c.stress_level + '</span>' +
                    '<span class="stress-of">/10</span>' +
                    '<span class="stress-text">' + stressText + '</span>' +
                '</div>' +
                '<p>Angka ini hanya cerminan sesaat, bukan penilaian atas dirimu.</p>' +
            '</article>' +
            '<article class="card summary-card">' +
                '<span class="card-eyebrow">Fokus utama hari ini</span>' +
                '<h2 class="focus-title">' + S.escapeHTML(focus) + '</h2>' +
                '<p>' + S.escapeHTML(focusExplain[focus] || '') + '</p>' +
            '</article>' +
        '</div>' +
        '<section class="card recommendation-card">' +
            '<header class="card-head"><h2>Tiga langkah kecil yang bisa dicoba</h2><p class="muted">Pilih yang paling terjangkau hari ini. Tidak perlu semuanya.</p></header>' +
            '<ul class="recommendation-list">' + recsHtml + '</ul>' +
        '</section>' +
        '<section class="card breathing-card">' +
            '<header class="card-head"><h2>Beri jeda untuk dirimu</h2><p class="muted">Latihan napas 4–4–6. Tarik 4 detik, tahan 4 detik, hembuskan 6 detik.</p></header>' +
            '<div class="breathing-visual"><div class="breathing-circle" id="breathing-circle"></div></div>' +
            '<p class="breathing-phase" id="breathing-phase" aria-live="polite">Tekan mulai untuk memulai.</p>' +
            '<div class="breathing-controls">' +
                '<button type="button" class="btn btn-primary" id="breathing-start">Mulai</button>' +
                '<button type="button" class="btn btn-ghost" id="breathing-pause" disabled>Jeda</button>' +
                '<button type="button" class="btn btn-ghost" id="breathing-reset">Reset</button>' +
            '</div>' +
        '</section>' +
        noteHtml +
        '<div class="page-actions">' +
            '<a href="dashboard.html" class="btn btn-ghost">Buka Jejak Suarik</a>' +
            '<a href="planner.html" class="btn btn-primary">Buka Langkah Kecilku</a>' +
        '</div>';

    // Tombol tambah rekomendasi ke planner
    document.querySelectorAll('.add-rec-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var res = S.addTaskUnique({
                title: btn.dataset.title,
                category: btn.dataset.category,
                duration: parseInt(btn.dataset.duration, 10)
            });
            if (res.duplicate) {
                window.SuarikToast.show('Rekomendasi ini sudah ada di Langkah Kecilku.', 'success');
            } else {
                window.SuarikToast.show('Rekomendasi ditambahkan ke Langkah Kecilku.', 'success');
            }
        });
    });

    // Breathing timer 4-4-6
    (function () {
        var phases = [
            { name: 'Tarik napas', duration: 4000, cls: 'inhale' },
            { name: 'Tahan',       duration: 4000, cls: 'hold' },
            { name: 'Hembuskan',   duration: 6000, cls: 'exhale' }
        ];
        var circle = document.getElementById('breathing-circle');
        var label = document.getElementById('breathing-phase');
        var btnStart = document.getElementById('breathing-start');
        var btnPause = document.getElementById('breathing-pause');
        var btnReset = document.getElementById('breathing-reset');
        var idx = 0, timer = null, running = false;
        function apply() {
            var p = phases[idx];
            circle.className = 'breathing-circle ' + p.cls;
            label.textContent = p.name + ' (' + (p.duration / 1000) + ' detik)';
        }
        function tick() {
            apply();
            timer = setTimeout(function () {
                idx = (idx + 1) % phases.length;
                if (running) tick();
            }, phases[idx].duration);
        }
        btnStart.addEventListener('click', function () {
            if (running) return;
            running = true; btnStart.disabled = true; btnPause.disabled = false; tick();
        });
        btnPause.addEventListener('click', function () {
            running = false; btnStart.disabled = false; btnPause.disabled = true;
            if (timer) clearTimeout(timer);
            label.textContent = 'Dijeda. Tekan mulai untuk melanjutkan.';
        });
        btnReset.addEventListener('click', function () {
            running = false; idx = 0;
            if (timer) clearTimeout(timer);
            circle.className = 'breathing-circle';
            label.textContent = 'Tekan mulai untuk memulai.';
            btnStart.disabled = false; btnPause.disabled = true;
        });
    })();

    function renderNotFound() {
        root.innerHTML =
            '<header class="page-head"><span class="eyebrow">Tidak ditemukan</span><h1>Hasil check-in tidak ditemukan.</h1><p>Coba lakukan check-in baru.</p></header>' +
            '<div class="page-actions"><a href="checkin.html" class="btn btn-primary">Mulai Suara Hari Ini</a></div>';
    }
})();
