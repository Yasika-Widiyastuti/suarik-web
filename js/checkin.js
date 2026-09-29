// checkin.js — Multi-step form check-in. Simpan ke localStorage lalu redirect ke result.html?id=X
(function () {
    "use strict";
    var S = window.Suarik;
    var form = document.getElementById('checkin-form');
    if (!form) return;

    // Render pilihan emosi & area
    var emoGrid = document.getElementById('emotion-grid');
    var emoDesc = {
        Tenang: 'Hari terasa cukup lapang.',
        Bersemangat: 'Ada energi untuk memulai.',
        Cemas: 'Pikiran terasa penuh dan tidak tenang.',
        Kewalahan: 'Terlalu banyak yang datang bersamaan.',
        Lelah: 'Energi terasa habis meski hari baru mulai.',
        Sedih: 'Ada rasa berat yang ingin didengarkan.'
    };
    S.EMOTIONS.forEach(function (emo) {
        var card = document.createElement('label');
        card.className = 'emotion-card';
        card.innerHTML = '<input type="radio" name="emotion" value="' + S.escapeHTML(emo) + '" required>' +
            '<span class="emotion-icon" aria-hidden="true"></span>' +
            '<span class="emotion-label">' + S.escapeHTML(emo) + '</span>' +
            '<span class="emotion-desc">' + S.escapeHTML(emoDesc[emo] || '') + '</span>';
        emoGrid.appendChild(card);
    });

    var areaGrid = document.getElementById('area-grid');
    S.AREA_CHOICES.forEach(function (a) {
        var card = document.createElement('label');
        card.className = 'area-card';
        card.innerHTML = '<input type="checkbox" name="areas" value="' + S.escapeHTML(a.label) + '">' +
            '<span class="area-check" aria-hidden="true"><svg viewBox="0 0 16 16" width="14" height="14"><path d="M3 8l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
            '<span class="area-text"><span class="area-title">' + S.escapeHTML(a.display) + '</span><span class="area-desc">' + S.escapeHTML(a.label) + '</span></span>';
        areaGrid.appendChild(card);
    });

    // Selection styling — biarkan <label> native yang toggle checkbox/radio,
    // JS cukup dengarkan event `change` dan update kelas `.is-selected`.
    emoGrid.querySelectorAll('.emotion-card input').forEach(function (input) {
        input.addEventListener('change', function () {
            emoGrid.querySelectorAll('.emotion-card').forEach(function (c) { c.classList.remove('is-selected'); });
            if (input.checked) input.closest('.emotion-card').classList.add('is-selected');
        });
    });
    areaGrid.querySelectorAll('.area-card input').forEach(function (input) {
        input.addEventListener('change', function () {
            input.closest('.area-card').classList.toggle('is-selected', input.checked);
        });
    });

    // Multi-step
    var steps = form.querySelectorAll('.form-step');
    var indicators = form.querySelectorAll('.progress-step');
    var currentStep = 1;

    function showStep(n) {
        currentStep = n;
        steps.forEach(function (s) { s.classList.toggle('active', parseInt(s.dataset.step, 10) === n); });
        indicators.forEach(function (ind) {
            var idx = parseInt(ind.dataset.step, 10);
            ind.classList.remove('active', 'done');
            if (idx < n) ind.classList.add('done'); else if (idx === n) ind.classList.add('active');
        });
        var active = form.querySelector('.form-step.active input, .form-step.active textarea, .form-step.active select');
        if (active) setTimeout(function () { active.focus(); }, 40);
    }
    function validateStep(n) {
        clearErrors();
        if (n === 1) {
            if (!form.querySelector('input[name="emotion"]:checked')) { showError('emotion'); return false; }
        }
        if (n === 3) {
            if (form.querySelectorAll('input[name="areas"]:checked').length === 0) { showError('areas'); return false; }
        }
        return true;
    }
    function showError(name) { var el = form.querySelector('[data-error-for="' + name + '"]'); if (el) el.hidden = false; }
    function clearErrors() { form.querySelectorAll('.field-error').forEach(function (e) { e.hidden = true; }); }

    form.querySelectorAll('.btn-next').forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (!validateStep(currentStep)) return;
            showStep(parseInt(btn.dataset.next, 10));
        });
    });
    form.querySelectorAll('.btn-prev').forEach(function (btn) {
        btn.addEventListener('click', function () { showStep(parseInt(btn.dataset.prev, 10)); });
    });

    // Slider
    var slider = document.getElementById('stress_level');
    var num = document.querySelector('.slider-number');
    var lbl = document.getElementById('stress-label');
    function updateSlider() {
        var v = parseInt(slider.value, 10);
        num.textContent = v;
        lbl.textContent = S.stressLabel(v);
    }
    slider.addEventListener('input', updateSlider);
    updateSlider();

    // Character counter
    var note = document.getElementById('note');
    var noteCount = document.getElementById('note-count');
    note.addEventListener('input', function () { noteCount.textContent = note.value.length; });

    // Submit
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validateStep(1)) { showStep(1); return; }
        if (!validateStep(3)) { showStep(3); return; }

        var btn = document.getElementById('checkin-submit');
        btn.classList.add('is-loading'); btn.disabled = true;

        var emotion = form.querySelector('input[name="emotion"]:checked').value;
        var stress = parseInt(slider.value, 10);
        var areas = Array.prototype.slice.call(form.querySelectorAll('input[name="areas"]:checked')).map(function (c) { return c.value; });
        var noteVal = (note.value || '').trim().slice(0, 500);

        var entry = S.saveCheckin({
            emotion: emotion, stress_level: stress, areas: areas, note: noteVal
        });

        // Simulasikan loading singkat lalu redirect
        setTimeout(function () {
            window.location.href = 'result.html?id=' + entry.id;
        }, 300);
    });

    showStep(1);
})();