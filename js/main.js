// main.js — Header, footer, navigasi mobile, toast, modal, tahun otomatis.
(function () {
    "use strict";

    // Tandai active nav berdasarkan atribut data-page pada <body>
    var page = document.body.getAttribute('data-page');
    if (page) {
        document.querySelectorAll('.primary-nav a[data-nav]').forEach(function (a) {
            if (a.getAttribute('data-nav') === page) a.classList.add('active');
        });
    }

    // Isi tahun otomatis di footer
    document.querySelectorAll('[data-year]').forEach(function (el) {
        el.textContent = new Date().getFullYear();
    });

    // Mobile nav toggle
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('primary-nav');
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            toggle.setAttribute('aria-label', open ? 'Tutup menu navigasi' : 'Buka menu navigasi');
        });
        nav.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function () {
                if (window.innerWidth <= 960) {
                    nav.classList.remove('open');
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // Toast API
    function showToast(message, category) {
        var container = document.getElementById('toast-container');
        if (!container) return;
        var t = document.createElement('div');
        t.className = 'toast toast-' + (category || 'success');
        t.setAttribute('role', 'status');
        t.innerHTML = '<span class="toast-icon" aria-hidden="true"></span>' +
                      '<span class="toast-text"></span>' +
                      '<button type="button" class="toast-close" aria-label="Tutup notifikasi">×</button>';
        t.querySelector('.toast-text').textContent = message;
        t.querySelector('.toast-close').addEventListener('click', function () { dismiss(t); });
        container.appendChild(t);
        setTimeout(function () { dismiss(t); }, 5000);
    }
    function dismiss(t) {
        t.style.opacity = '0';
        t.style.transform = 'translateY(-6px)';
        setTimeout(function () { if (t.parentNode) t.remove(); }, 250);
    }
    window.SuarikToast = { show: showToast };

    // Tampilkan flash message tersimpan
    if (window.Suarik) {
        var flash = window.Suarik.popFlash();
        if (flash) showToast(flash.message, flash.category);
    }

    // Modal API
    window.SuarikModal = {
        open: function (id) {
            var m = document.getElementById(id);
            if (!m) return;
            m.classList.add('is-open');
            m.setAttribute('aria-hidden', 'false');
            var f = m.querySelector('input, select, textarea, button');
            if (f) setTimeout(function () { f.focus(); }, 60);
        },
        close: function (id) {
            var m = document.getElementById(id);
            if (!m) return;
            m.classList.remove('is-open');
            m.setAttribute('aria-hidden', 'true');
        }
    };
    document.querySelectorAll('[data-close]').forEach(function (el) {
        el.addEventListener('click', function (e) {
            e.preventDefault();
            var modal = el.closest('.modal');
            if (modal) window.SuarikModal.close(modal.id);
        });
    });

    // Escape menutup modal / toast
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        var openModal = document.querySelector('.modal.is-open');
        if (openModal) { window.SuarikModal.close(openModal.id); return; }
        var openToast = document.querySelector('.toast');
        if (openToast) openToast.remove();
    });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        var target = link.getAttribute('href');
        if (!target || target === '#') return;
        link.addEventListener('click', function (e) {
            var el = document.querySelector(target);
            if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        });
    });
})();
