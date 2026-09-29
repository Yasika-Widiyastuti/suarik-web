// dashboard.js — Ringkasan, bar chart, line chart. Baca dari localStorage.
(function () {
    "use strict";
    var S = window.Suarik;
    var root = document.getElementById('dashboard-root');
    if (!root) return;

    var checkins = S.getAllCheckins();
    var tasks = S.getAllTasks();

    if (checkins.length === 0) {
        root.innerHTML =
            '<div class="card empty-state">' +
                '<h2>Belum ada check-in tercatat.</h2>' +
                '<p>Mulai dari satu check-in singkat untuk melihat pola pertamamu di sini.</p>' +
                '<a href="checkin.html" class="btn btn-primary">Mulai Suara Hari Ini</a>' +
            '</div>';
        return;
    }

    var tasksCompleted = tasks.filter(function (t) { return t.completed; }).length;
    var avgStress = Math.round((checkins.reduce(function (a, c) { return a + c.stress_level; }, 0) / checkins.length) * 10) / 10;
    var last = checkins[checkins.length - 1];
    var latestScores = {
        Akademik: last.academic_score, Karier: last.career_score,
        Finansial: last.financial_score, Relasi: last.relationship_score, Burnout: last.burnout_score
    };

    var trendLabels = [], trendValues = [];
    var focusCounter = {};
    checkins.forEach(function (c) {
        var s = {
            academic_score: c.academic_score, career_score: c.career_score,
            financial_score: c.financial_score, relationship_score: c.relationship_score,
            burnout_score: c.burnout_score
        };
        var f = S.getFocusCategory(s);
        focusCounter[f] = (focusCounter[f] || 0) + 1;
        trendLabels.push(S.shortMonth(c.created_at));
        trendValues.push(c.stress_level);
    });
    var topFocus = Object.keys(focusCounter).sort(function (a, b) { return focusCounter[b] - focusCounter[a]; })[0] || '-';

    var weekly = 'Rata-rata tingkat tekananmu berada di ' + avgStress + '/10. Area yang paling sering muncul adalah ' + topFocus + '. Data ini hanya cerminan pola, bukan penilaian atas dirimu.';

    var fallbackCat = Object.keys(latestScores).map(function (k) {
        var v = latestScores[k];
        var pct = Math.round((v / 10) * 100);
        return '<li><span class="fallback-label">' + S.escapeHTML(k) + '</span><span class="fallback-bar" style="--v: ' + pct + '%"><span></span></span><span class="fallback-value">' + v + '</span></li>';
    }).join('');

    var fallbackTrend = trendLabels.map(function (lbl, i) {
        return '<li><span>' + S.escapeHTML(lbl) + '</span><strong>' + trendValues[i] + '</strong></li>';
    }).join('');

    root.innerHTML =
        '<div class="grid grid-4 summary-grid">' +
            '<article class="stat-card"><span class="stat-label">Jumlah check-in</span><span class="stat-value">' + checkins.length + '</span></article>' +
            '<article class="stat-card"><span class="stat-label">Rata-rata tekanan</span><span class="stat-value">' + avgStress + '<span class="stat-of">/10</span></span></article>' +
            '<article class="stat-card"><span class="stat-label">Aksi selesai</span><span class="stat-value">' + tasksCompleted + '<span class="stat-of">/' + tasks.length + '</span></span></article>' +
            '<article class="stat-card"><span class="stat-label">Fokus paling sering</span><span class="stat-value stat-focus">' + S.escapeHTML(topFocus) + '</span></article>' +
        '</div>' +
        '<div class="grid grid-2 chart-grid">' +
            '<section class="card chart-card">' +
                '<header class="card-head"><h2>Skor kategori dari check-in terbaru</h2><p class="muted">Skor 0 berarti kategori tidak dipilih pada check-in terakhir.</p></header>' +
                '<div class="chart-container"><canvas id="categoryChart" height="220" aria-label="Bar chart skor kategori terbaru" role="img"></canvas></div>' +
                '<ul class="chart-fallback" id="categoryFallback" hidden>' + fallbackCat + '</ul>' +
            '</section>' +
            '<section class="card chart-card">' +
                '<header class="card-head"><h2>Tren tingkat tekanan</h2><p class="muted">Dari check-in tertua ke terbaru.</p></header>' +
                '<div class="chart-container"><canvas id="trendChart" height="220" aria-label="Line chart tren tingkat tekanan" role="img"></canvas></div>' +
                '<ol class="chart-fallback chart-fallback-inline" id="trendFallback" hidden>' + fallbackTrend + '</ol>' +
            '</section>' +
        '</div>' +
        '<section class="card reflection-card"><span class="card-eyebrow">Refleksi mingguan</span><p>' + S.escapeHTML(weekly) + '</p></section>';

    function renderFallback() {
        var cf = document.getElementById('categoryFallback'), tf = document.getElementById('trendFallback');
        if (cf) cf.hidden = false;
        if (tf) tf.hidden = false;
        var cc = document.getElementById('categoryChart'), tc = document.getElementById('trendChart');
        if (cc) cc.style.display = 'none';
        if (tc) tc.style.display = 'none';
    }
    function drawCharts() {
        if (typeof window.Chart === 'undefined') { renderFallback(); return; }
        try {
            new window.Chart(document.getElementById('categoryChart'), {
                type: 'bar',
                data: {
                    labels: Object.keys(latestScores),
                    datasets: [{
                        label: 'Skor',
                        data: Object.keys(latestScores).map(function (k) { return latestScores[k]; }),
                        backgroundColor: ['#8B7DB8','#E99A7A','#202A44','#6F9B7C','#7466A6'],
                        borderRadius: 10, maxBarThickness: 44
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, max: 10, ticks: { stepSize: 2 } } },
                    plugins: { legend: { display: false } }
                }
            });
            new window.Chart(document.getElementById('trendChart'), {
                type: 'line',
                data: {
                    labels: trendLabels,
                    datasets: [{
                        label: 'Tingkat tekanan', data: trendValues,
                        borderColor: '#202A44', backgroundColor: 'rgba(139,125,184,0.2)',
                        tension: 0.35, fill: true, pointBackgroundColor: '#7466A6', pointRadius: 4
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, max: 10 } },
                    plugins: { legend: { display: false } }
                }
            });
        } catch (err) { renderFallback(); }
    }
    if (document.readyState === 'complete') drawCharts();
    else window.addEventListener('load', drawCharts);
    setTimeout(function () { if (typeof window.Chart === 'undefined') renderFallback(); }, 3000);
})();
