// data.js — Storage helpers, konstanta, dan logika rule-based untuk Suarik static.
// Semua data disimpan di localStorage. Tidak ada backend.

(function (global) {
    "use strict";

    var KEY_CHECKINS = 'suarik.checkins';
    var KEY_TASKS = 'suarik.tasks';
    var KEY_JOURNALS = 'suarik.journals';
    var KEY_FLASH = 'suarik.flash';

    // ---------- Konstanta domain ----------
    var EMOTIONS = ['Tenang', 'Bersemangat', 'Cemas', 'Kewalahan', 'Lelah', 'Sedih'];

    var AREA_CHOICES = [
        { label: 'Akademik dan skripsi',      field: 'academic_score',     display: 'Akademik' },
        { label: 'Karier dan masa depan',     field: 'career_score',       display: 'Karier' },
        { label: 'Finansial',                 field: 'financial_score',    display: 'Finansial' },
        { label: 'Relasi dan keluarga',       field: 'relationship_score', display: 'Relasi' },
        { label: 'Kelelahan atau burnout',    field: 'burnout_score',      display: 'Burnout' }
    ];

    var FOCUS_PRIORITY = ['Burnout', 'Akademik', 'Karier', 'Finansial', 'Relasi'];

    var CATEGORY_LABELS = {
        academic_score:     'Akademik',
        career_score:       'Karier',
        financial_score:    'Finansial',
        relationship_score: 'Relasi',
        burnout_score:      'Burnout'
    };

    var TASK_CATEGORIES = ['Akademik', 'Karier', 'Finansial', 'Relasi', 'Burnout', 'Personal'];
    var TASK_DURATIONS = [10, 15, 25, 30];
    var JOURNAL_TOPICS = ['Akademik', 'Karier', 'Finansial', 'Relasi', 'Burnout', 'Lainnya'];
    var RESOURCE_CATEGORIES = ['Akademik', 'Karier', 'Finansial', 'Burnout', 'Relasi'];

    var RECOMMENDATIONS = {
        Akademik: [
            { title: 'Tulis tiga poin kecil untuk skripsi', duration: 10, reason: 'Menurunkan hambatan awal dengan memecah pekerjaan menjadi bagian yang jelas.' },
            { title: 'Sesi fokus 25 menit tanpa distraksi', duration: 25, reason: 'Sesi pendek yang konsisten membantu menjaga momentum tanpa kelelahan.' },
            { title: 'Susun satu pertanyaan spesifik untuk teman atau dosen', duration: 15, reason: 'Pertanyaan spesifik memudahkan mendapat bantuan yang tepat.' }
        ],
        Karier: [
            { title: 'Catat tiga kemampuan yang sudah dimiliki', duration: 10, reason: 'Memulai dari kekuatan membantu menyeimbangkan pikiran soal kekurangan.' },
            { title: 'Pelajari satu lowongan tanpa langsung melamar', duration: 15, reason: 'Membaca untuk memahami kebutuhan pasar, bukan menekan diri untuk melamar.' },
            { title: 'Perbarui satu bagian kecil di CV atau portofolio', duration: 25, reason: 'Perubahan kecil lebih mudah dituntaskan dan menjaga dokumen tetap segar.' }
        ],
        Finansial: [
            { title: 'Catat pengeluaran hari ini tanpa menghakimi', duration: 10, reason: 'Melihat data lebih membantu daripada menebak-nebak dengan rasa cemas.' },
            { title: 'Tentukan satu pengeluaran untuk ditinjau minggu ini', duration: 10, reason: 'Perubahan bertahap lebih berkelanjutan daripada memangkas besar sekaligus.' },
            { title: 'Buat daftar kebutuhan dan keinginan tujuh hari ke depan', duration: 15, reason: 'Rencana singkat membantu menentukan prioritas dengan tenang.' }
        ],
        Relasi: [
            { title: 'Kirim pesan sederhana ke orang yang kamu percaya', duration: 10, reason: 'Kontak singkat menjaga hubungan tanpa harus menunggu momen sempurna.' },
            { title: 'Tulis satu hal yang ingin kamu sampaikan dengan tenang', duration: 15, reason: 'Menuliskan lebih dulu membantu memilih kata yang lebih jujur.' },
            { title: 'Ambil jeda sebelum merespons konflik', duration: 10, reason: 'Jeda singkat memberi ruang untuk merespons, bukan bereaksi.' }
        ],
        Burnout: [
            { title: 'Ambil jeda 10 menit tanpa layar', duration: 10, reason: 'Mata dan pikiran butuh jeda dari input digital yang terus mengalir.' },
            { title: 'Minum air dan lakukan peregangan ringan', duration: 10, reason: 'Tubuh yang bergerak membantu mereset ketegangan pikiran.' },
            { title: 'Pilih satu tugas paling penting, izinkan sisanya menunggu', duration: 15, reason: 'Fokus pada satu hal mengurangi rasa kewalahan.' }
        ],
        Personal: [
            { title: 'Rapikan satu area kecil di sekitarmu', duration: 10, reason: 'Ruang yang lebih ringan sering membantu pikiran ikut terasa lebih ringan.' },
            { title: 'Tulis satu hal yang ingin kamu beri ruang hari ini', duration: 10, reason: 'Menuliskan niat kecil membantu memilih hal yang benar-benar penting.' },
            { title: 'Pilih aktivitas sederhana untuk lebih hadir', duration: 15, reason: 'Aktivitas yang disadari membantu mengurangi mode autopilot.' }
        ]
    };

    var RESOURCES = [
        { category: 'Akademik', title: 'Memecah skripsi menjadi tugas kecil', summary: 'Ubah bab besar menjadi daftar tugas 25 menit yang bisa dimulai hari ini.', detail: 'Skripsi terasa berat karena kita melihatnya sebagai satu bongkahan besar. Coba tuliskan bab yang sedang dikerjakan, lalu pecah menjadi tiga sampai lima tugas kecil berdurasi 25 menit. Pilih satu tugas paling mudah untuk dimulai. Selesai satu tugas kecil sudah cukup untuk hari ini.', reading_time: 4 },
        { category: 'Akademik', title: 'Membuat sesi fokus yang realistis', summary: 'Sesi fokus pendek yang konsisten lebih berkelanjutan daripada maraton semalam.', detail: 'Coba pola 25 menit fokus dan 5 menit istirahat. Sebelum mulai, tulis satu kalimat tentang apa yang akan dikerjakan pada sesi tersebut. Setelah sesi selesai, catat satu kemajuan kecil, sekecil apa pun. Jangan menuntut hasil sempurna dalam satu sesi.', reading_time: 3 },
        { category: 'Karier', title: 'Memetakan skill yang sudah dimiliki', summary: 'Tulis apa yang sudah kamu bisa sebelum memikirkan apa yang belum kamu miliki.', detail: 'Ambil selembar catatan dan tuliskan minimal lima skill yang kamu miliki, baik teknis maupun non-teknis. Tambahkan satu contoh proyek atau pengalaman untuk setiap skill. Peta ini akan membantumu memilih lowongan yang sesuai tanpa membandingkan diri secara berlebihan.', reading_time: 4 },
        { category: 'Karier', title: 'Memulai portofolio tanpa menunggu sempurna', summary: 'Portofolio bertumbuh seiring waktu. Mulai dari satu karya kecil hari ini.', detail: 'Pilih satu proyek, tugas kuliah, atau eksperimen kecil yang pernah kamu kerjakan. Tulis satu paragraf singkat berisi tujuan, peran, dan hasilnya. Simpan sebagai draft. Kamu bisa memperbarui dan menambah karya lain nanti tanpa harus menunggu portofolio benar-benar lengkap.', reading_time: 5 },
        { category: 'Finansial', title: 'Mencatat pengeluaran tanpa menghakimi diri', summary: 'Catat dulu, evaluasi kemudian. Tujuannya melihat pola, bukan menghukum diri.', detail: 'Selama tujuh hari, catat pengeluaran harianmu di catatan sederhana. Belum perlu kategori rumit atau aplikasi khusus. Setelah tujuh hari, baca ulang catatanmu dengan netral. Fokus pada pola, bukan pada rasa bersalah.', reading_time: 3 },
        { category: 'Finansial', title: 'Membedakan kebutuhan dan keinginan', summary: 'Latihan sederhana untuk memilih pengeluaran yang lebih selaras dengan prioritasmu.', detail: 'Buat dua kolom: kebutuhan dan keinginan. Tuliskan pengeluaran minggu lalu di kolom yang sesuai. Untuk keinginan, tanyakan apakah kamu masih menginginkannya setelah 24 jam. Latihan ini membantu memilah tanpa harus melarang diri sendiri.', reading_time: 4 },
        { category: 'Burnout', title: 'Mengenali tanda tubuh membutuhkan jeda', summary: 'Sinyal tubuh sering muncul lebih dulu daripada kesadaran pikiran.', detail: 'Perhatikan tanda seperti bahu tegang, pernapasan dangkal, sulit fokus, atau mudah tersinggung. Bila muncul, beri jeda 5–10 menit untuk berdiri, minum air, atau melihat ke kejauhan. Jeda kecil membantu mencegah kelelahan yang menumpuk.', reading_time: 3 },
        { category: 'Burnout', title: 'Membuat batas sederhana dalam rutinitas', summary: 'Batas bukan penolakan; batas adalah cara menjaga energi agar bertahan lebih lama.', detail: 'Pilih satu batas kecil untuk minggu ini. Misalnya, tidak membuka pesan kerja setelah pukul 21.00, atau menutup laptop 30 menit sebelum tidur. Sampaikan kepada orang yang perlu tahu, lalu jalankan tanpa merasa bersalah.', reading_time: 4 },
        { category: 'Relasi', title: 'Menyampaikan perasaan dengan kalimat aku', summary: 'Kalimat aku membantu menyampaikan perasaan tanpa membuat orang lain defensif.', detail: 'Struktur sederhana: aku merasa (perasaan) ketika (situasi) karena (alasan). Contoh: aku merasa kewalahan ketika permintaan datang mendadak karena aku butuh waktu untuk menyusun prioritas. Coba tulis satu kalimat aku hari ini untuk situasi yang sedang mengganggumu.', reading_time: 3 },
        { category: 'Relasi', title: 'Meminta bantuan tanpa merasa menjadi beban', summary: 'Meminta bantuan adalah bagian sehat dari relasi, bukan tanda kelemahan.', detail: 'Mulailah dari permintaan kecil yang jelas. Sebutkan apa yang kamu butuhkan, kapan, dan seberapa lama. Contoh: bolehkah kamu menemaniku menulis selama 30 menit besok pagi. Permintaan yang spesifik lebih mudah dijawab dan mengurangi rasa segan.', reading_time: 3 }
    ];

    // ---------- Helper localStorage ----------
    function readList(key) {
        try {
            var raw = localStorage.getItem(key);
            if (!raw) return [];
            var v = JSON.parse(raw);
            return Array.isArray(v) ? v : [];
        } catch (e) { return []; }
    }
    function writeList(key, list) {
        try { localStorage.setItem(key, JSON.stringify(list)); } catch (e) {}
    }
    function nextId(list) {
        var max = 0;
        list.forEach(function (it) { if (typeof it.id === 'number' && it.id > max) max = it.id; });
        return max + 1;
    }
    function nowIso() { return new Date().toISOString(); }

    // ---------- Check-in ----------
    function calculateScores(stress, areas) {
        var scores = { academic_score: 0, career_score: 0, financial_score: 0, relationship_score: 0, burnout_score: 0 };
        AREA_CHOICES.forEach(function (a) {
            if (areas.indexOf(a.label) !== -1) scores[a.field] = stress;
        });
        return scores;
    }
    function getFocusCategory(scores) {
        var vals = Object.keys(scores).map(function (k) { return scores[k]; });
        var max = Math.max.apply(null, vals.concat([0]));
        if (max <= 0) return 'Personal';
        var top = [];
        Object.keys(scores).forEach(function (k) {
            if (scores[k] === max) top.push(CATEGORY_LABELS[k]);
        });
        for (var i = 0; i < FOCUS_PRIORITY.length; i++) {
            if (top.indexOf(FOCUS_PRIORITY[i]) !== -1) return FOCUS_PRIORITY[i];
        }
        return top[0];
    }
    function getRecommendations(focus) {
        return (RECOMMENDATIONS[focus] || RECOMMENDATIONS.Personal).slice(0, 3);
    }
    function empatheticGreeting(emotion) {
        var m = {
            Tenang: 'Senang mendengar hari ini terasa cukup tenang untukmu',
            Bersemangat: 'Bagus, energimu sedang tersedia hari ini',
            Cemas: 'Rasa cemas boleh hadir. Kita coba pelan-pelan menyusunnya',
            Kewalahan: 'Ketika terlalu banyak yang terasa bersamaan, satu langkah kecil sudah cukup',
            Lelah: 'Lelah adalah sinyal tubuh yang layak didengarkan',
            Sedih: 'Rasa sedih boleh diberi ruang. Kamu tidak sendirian'
        };
        return m[emotion] || 'Terima kasih sudah menyempatkan diri untuk check-in';
    }
    function stressLabel(level) {
        if (level <= 3) return 'Ringan';
        if (level <= 6) return 'Sedang';
        if (level <= 8) return 'Berat';
        return 'Sangat berat';
    }
    function needsSupportAlert(emotion, stress, areas) {
        if (stress >= 9) return true;
        if (emotion === 'Sedih' && areas.length > 2) return true;
        return false;
    }

    function saveCheckin(payload) {
        var list = readList(KEY_CHECKINS);
        var scores = calculateScores(payload.stress_level, payload.areas);
        var entry = {
            id: nextId(list),
            emotion: payload.emotion,
            stress_level: payload.stress_level,
            academic_score: scores.academic_score,
            career_score: scores.career_score,
            financial_score: scores.financial_score,
            relationship_score: scores.relationship_score,
            burnout_score: scores.burnout_score,
            note: payload.note || '',
            created_at: nowIso()
        };
        list.push(entry);
        writeList(KEY_CHECKINS, list);
        return entry;
    }
    function getCheckin(id) {
        var list = readList(KEY_CHECKINS);
        for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
        return null;
    }
    function getAllCheckins() { return readList(KEY_CHECKINS); }

    // ---------- Tasks ----------
    function addTask(task) {
        var list = readList(KEY_TASKS);
        var entry = {
            id: nextId(list),
            title: task.title,
            category: task.category,
            duration: task.duration,
            due_date: task.due_date || '',
            completed: 0,
            created_at: nowIso()
        };
        list.push(entry);
        writeList(KEY_TASKS, list);
        return entry;
    }
    function addTaskUnique(task) {
        // Cegah duplikasi rekomendasi (title + category, belum selesai)
        var list = readList(KEY_TASKS);
        var exists = list.some(function (t) {
            return t.title === task.title && t.category === task.category && !t.completed;
        });
        if (exists) return { duplicate: true };
        return { duplicate: false, entry: addTask(task) };
    }
    function getAllTasks() {
        var list = readList(KEY_TASKS);
        // Urutkan: belum selesai dulu, lalu terbaru
        list.sort(function (a, b) {
            if (a.completed !== b.completed) return a.completed - b.completed;
            return (b.created_at > a.created_at) ? 1 : -1;
        });
        return list;
    }
    function toggleTask(id) {
        var list = readList(KEY_TASKS);
        var found;
        list.forEach(function (t) { if (t.id === id) { t.completed = t.completed ? 0 : 1; found = t; } });
        writeList(KEY_TASKS, list);
        return found;
    }
    function updateTask(id, patch) {
        var list = readList(KEY_TASKS);
        var found;
        list.forEach(function (t) {
            if (t.id === id) {
                t.title = patch.title;
                t.category = patch.category;
                t.duration = patch.duration;
                t.due_date = patch.due_date || '';
                found = t;
            }
        });
        writeList(KEY_TASKS, list);
        return found;
    }
    function deleteTask(id) {
        var list = readList(KEY_TASKS).filter(function (t) { return t.id !== id; });
        writeList(KEY_TASKS, list);
    }

    // ---------- Journals ----------
    function addJournal(entry) {
        var list = readList(KEY_JOURNALS);
        var e = {
            id: nextId(list),
            title: entry.title || '',
            content: entry.content,
            topic: entry.topic,
            created_at: nowIso()
        };
        list.push(e);
        writeList(KEY_JOURNALS, list);
        return e;
    }
    function getAllJournals() {
        var list = readList(KEY_JOURNALS);
        list.sort(function (a, b) { return (b.created_at > a.created_at) ? 1 : -1; });
        return list;
    }
    function deleteJournal(id) {
        var list = readList(KEY_JOURNALS).filter(function (j) { return j.id !== id; });
        writeList(KEY_JOURNALS, list);
    }

    // ---------- Flash (pengganti Flask flash) ----------
    function setFlash(message, category) {
        try {
            localStorage.setItem(KEY_FLASH, JSON.stringify({
                message: message,
                category: category || 'success'
            }));
        } catch (e) {}
    }
    function popFlash() {
        try {
            var raw = localStorage.getItem(KEY_FLASH);
            if (!raw) return null;
            localStorage.removeItem(KEY_FLASH);
            return JSON.parse(raw);
        } catch (e) { return null; }
    }

    // ---------- Formatting helpers ----------
    function formatDate(iso) {
        try {
            var d = new Date(iso);
            var mo = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
            var day = String(d.getDate()).padStart(2, '0');
            return day + ' ' + mo[d.getMonth()] + ' ' + d.getFullYear();
        } catch (e) { return iso; }
    }
    function formatDateTime(iso) {
        try {
            var d = new Date(iso);
            var hh = String(d.getHours()).padStart(2, '0');
            var mm = String(d.getMinutes()).padStart(2, '0');
            return formatDate(iso) + ' · ' + hh + ':' + mm;
        } catch (e) { return iso; }
    }
    function shortMonth(iso) {
        try {
            var d = new Date(iso);
            var mo = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
            return String(d.getDate()).padStart(2, '0') + ' ' + mo[d.getMonth()];
        } catch (e) { return iso.slice(5, 10); }
    }
    function escapeHTML(s) {
        if (s == null) return '';
        return String(s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    // ---------- Export ----------
    global.Suarik = {
        EMOTIONS: EMOTIONS,
        AREA_CHOICES: AREA_CHOICES,
        CATEGORY_LABELS: CATEGORY_LABELS,
        TASK_CATEGORIES: TASK_CATEGORIES,
        TASK_DURATIONS: TASK_DURATIONS,
        JOURNAL_TOPICS: JOURNAL_TOPICS,
        RESOURCE_CATEGORIES: RESOURCE_CATEGORIES,
        RESOURCES: RESOURCES,

        calculateScores: calculateScores,
        getFocusCategory: getFocusCategory,
        getRecommendations: getRecommendations,
        empatheticGreeting: empatheticGreeting,
        stressLabel: stressLabel,
        needsSupportAlert: needsSupportAlert,

        saveCheckin: saveCheckin,
        getCheckin: getCheckin,
        getAllCheckins: getAllCheckins,

        addTask: addTask,
        addTaskUnique: addTaskUnique,
        getAllTasks: getAllTasks,
        toggleTask: toggleTask,
        updateTask: updateTask,
        deleteTask: deleteTask,

        addJournal: addJournal,
        getAllJournals: getAllJournals,
        deleteJournal: deleteJournal,

        setFlash: setFlash,
        popFlash: popFlash,

        formatDate: formatDate,
        formatDateTime: formatDateTime,
        shortMonth: shortMonth,
        escapeHTML: escapeHTML
    };
})(window);
