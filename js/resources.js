// resources.js — Render kartu bekal + filter + pencarian dari data hardcoded.
(function () {
    "use strict";
    var S = window.Suarik;

    var grid = document.getElementById('resource-grid');
    var empty = document.getElementById('resource-empty');
    var chips = document.getElementById('cat-chips');

    // Render filter chips
    chips.innerHTML = '<button type="button" class="chip chip-filter is-active" data-cat="all" role="tab" aria-selected="true">Semua</button>' +
        S.RESOURCE_CATEGORIES.map(function (c) {
            return '<button type="button" class="chip chip-filter" data-cat="' + S.escapeHTML(c) + '" role="tab" aria-selected="false">' + S.escapeHTML(c) + '</button>';
        }).join('');

    // Render cards
    grid.innerHTML = S.RESOURCES.map(function (r) {
        var searchStr = (r.title + ' ' + r.summary + ' ' + r.category).toLowerCase();
        return '<article class="card resource-card" data-cat="' + S.escapeHTML(r.category) + '" data-search="' + S.escapeHTML(searchStr) + '">' +
            '<span class="pill">' + S.escapeHTML(r.category) + '</span>' +
            '<h3>' + S.escapeHTML(r.title) + '</h3>' +
            '<p class="resource-summary">' + S.escapeHTML(r.summary) + '</p>' +
            '<p class="muted small">' + r.reading_time + ' menit baca</p>' +
            '<details class="resource-details">' +
                '<summary class="btn btn-ghost btn-sm">Baca Ringkasan</summary>' +
                '<p class="resource-detail-text">' + S.escapeHTML(r.detail) + '</p>' +
            '</details>' +
        '</article>';
    }).join('');

    var activeCat = 'all';
    var search = document.getElementById('resource-search');
    var cards = grid.querySelectorAll('.resource-card');

    function apply() {
        var q = (search.value || '').toLowerCase().trim();
        var visible = 0;
        cards.forEach(function (card) {
            var catOk = activeCat === 'all' || card.dataset.cat === activeCat;
            var qOk = !q || card.dataset.search.indexOf(q) !== -1;
            if (catOk && qOk) { card.hidden = false; visible++; } else { card.hidden = true; }
        });
        empty.hidden = visible !== 0;
    }
    chips.querySelectorAll('.chip-filter').forEach(function (chip) {
        chip.addEventListener('click', function () {
            chips.querySelectorAll('.chip-filter').forEach(function (c) {
                c.classList.remove('is-active'); c.setAttribute('aria-selected', 'false');
            });
            chip.classList.add('is-active'); chip.setAttribute('aria-selected', 'true');
            activeCat = chip.dataset.cat;
            apply();
        });
    });
    search.addEventListener('input', apply);
})();
