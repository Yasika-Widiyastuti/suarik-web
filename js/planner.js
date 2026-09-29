// planner.js — CRUD langkah, filter, modal edit & hapus, progress bar. localStorage.
(function () {
    "use strict";
    var S = window.Suarik;

    function fillSelect(select, options, formatter) {
        select.innerHTML = '';
        options.forEach(function (v) {
            var o = document.createElement('option');
            o.value = v;
            o.textContent = formatter ? formatter(v) : v;
            select.appendChild(o);
        });
    }
    fillSelect(document.getElementById('category'), S.TASK_CATEGORIES);
    fillSelect(document.getElementById('duration'), S.TASK_DURATIONS, function (d) { return d + ' menit'; });
    fillSelect(document.getElementById('edit-category'), S.TASK_CATEGORIES);
    fillSelect(document.getElementById('edit-duration'), S.TASK_DURATIONS, function (d) { return d + ' menit'; });

    var listEl = document.getElementById('task-list');
    var emptyEl = document.getElementById('empty-state');
    var currentFilter = 'all';

    function renderTasks() {
        var tasks = S.getAllTasks();
        var total = tasks.length;
        var done = tasks.filter(function (t) { return t.completed; }).length;
        var pct = total ? Math.round((done / total) * 100) : 0;

        var pb = document.getElementById('progress-inner');
        var po = document.getElementById('progress-outer');
        pb.style.width = pct + '%';
        po.setAttribute('aria-valuenow', pct);
        document.getElementById('progress-text').innerHTML = '<strong>' + pct + '%</strong> selesai — ' + done + ' dari ' + total + ' langkah';

        if (total === 0) {
            listEl.innerHTML = '';
            emptyEl.hidden = false;
            return;
        }
        emptyEl.hidden = true;

        listEl.innerHTML = tasks.map(function (t) {
            var state = t.completed ? 'done' : 'pending';
            var dueHtml = t.due_date ? '<span class="pill pill-outline">' + S.escapeHTML(t.due_date) + '</span>' : '';
            var checkIcon = t.completed
                ? '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M3 8l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
                : '';
            return '<li class="task-card ' + (t.completed ? 'is-done' : '') + '" data-state="' + state + '">' +
                '<div class="task-toggle">' +
                    '<button type="button" class="task-check" data-toggle="' + t.id + '" aria-label="Ubah status langkah">' + checkIcon + '</button>' +
                '</div>' +
                '<div class="task-body">' +
                    '<h3 class="task-title">' + S.escapeHTML(t.title) + '</h3>' +
                    '<p class="task-meta">' +
                        '<span class="pill">' + S.escapeHTML(t.category) + '</span>' +
                        '<span class="pill pill-outline">' + t.duration + ' menit</span>' +
                        dueHtml +
                        '<span class="task-status">' + (t.completed ? 'Selesai' : 'Belum selesai') + '</span>' +
                    '</p>' +
                '</div>' +
                '<div class="task-actions">' +
                    '<button type="button" class="btn btn-ghost btn-sm" data-edit="' + t.id + '">Edit</button>' +
                    '<button type="button" class="btn btn-ghost btn-sm btn-danger" data-delete="' + t.id + '">Hapus</button>' +
                '</div>' +
            '</li>';
        }).join('');

        applyFilter();
    }

    function applyFilter() {
        listEl.querySelectorAll('.task-card').forEach(function (el) {
            var s = el.dataset.state;
            if (currentFilter === 'all') el.hidden = false;
            else if (currentFilter === 'pending') el.hidden = s !== 'pending';
            else if (currentFilter === 'done') el.hidden = s !== 'done';
        });
    }

    document.querySelectorAll('.filter-chips .chip-filter').forEach(function (chip) {
        chip.addEventListener('click', function () {
            document.querySelectorAll('.filter-chips .chip-filter').forEach(function (c) {
                c.classList.remove('is-active'); c.setAttribute('aria-selected', 'false');
            });
            chip.classList.add('is-active'); chip.setAttribute('aria-selected', 'true');
            currentFilter = chip.dataset.filter;
            applyFilter();
        });
    });

    // Delegasi klik
    listEl.addEventListener('click', function (e) {
        var t = e.target.closest('[data-toggle]');
        if (t) { S.toggleTask(parseInt(t.dataset.toggle, 10)); renderTasks(); window.SuarikToast.show('Status langkah diperbarui.', 'success'); return; }
        var ed = e.target.closest('[data-edit]');
        if (ed) { openEdit(parseInt(ed.dataset.edit, 10)); return; }
        var del = e.target.closest('[data-delete]');
        if (del) { openDelete(parseInt(del.dataset.delete, 10)); return; }
    });

    // Form tambah
    document.getElementById('task-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var f = e.target;
        var title = f.title.value.trim();
        if (!title || title.length > 120) { window.SuarikToast.show('Judul langkah wajib diisi dan maksimal 120 karakter.', 'error'); return; }
        S.addTask({
            title: title,
            category: f.category.value,
            duration: parseInt(f.duration.value, 10),
            due_date: f.due_date.value || ''
        });
        f.reset();
        renderTasks();
        window.SuarikToast.show('Langkah baru berhasil disimpan.', 'success');
    });

    // Modal edit
    function openEdit(id) {
        var task = S.getAllTasks().filter(function (t) { return t.id === id; })[0];
        if (!task) return;
        document.getElementById('edit-id').value = task.id;
        document.getElementById('edit-title-input').value = task.title;
        document.getElementById('edit-category').value = task.category;
        document.getElementById('edit-duration').value = task.duration;
        document.getElementById('edit-due').value = task.due_date || '';
        window.SuarikModal.open('edit-modal');
    }
    document.getElementById('edit-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var id = parseInt(document.getElementById('edit-id').value, 10);
        var title = document.getElementById('edit-title-input').value.trim();
        if (!title || title.length > 120) { window.SuarikToast.show('Judul langkah wajib diisi dan maksimal 120 karakter.', 'error'); return; }
        S.updateTask(id, {
            title: title,
            category: document.getElementById('edit-category').value,
            duration: parseInt(document.getElementById('edit-duration').value, 10),
            due_date: document.getElementById('edit-due').value || ''
        });
        window.SuarikModal.close('edit-modal');
        renderTasks();
        window.SuarikToast.show('Langkah berhasil diperbarui.', 'success');
    });

    // Modal delete
    function openDelete(id) {
        var task = S.getAllTasks().filter(function (t) { return t.id === id; })[0];
        if (!task) return;
        document.getElementById('delete-id').value = task.id;
        document.getElementById('delete-desc').textContent = 'Menghapus "' + task.title + '". Tindakan ini tidak dapat dibatalkan.';
        window.SuarikModal.open('delete-modal');
    }
    document.getElementById('delete-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var id = parseInt(document.getElementById('delete-id').value, 10);
        S.deleteTask(id);
        window.SuarikModal.close('delete-modal');
        renderTasks();
        window.SuarikToast.show('Langkah dihapus.', 'success');
    });

    renderTasks();
})();
