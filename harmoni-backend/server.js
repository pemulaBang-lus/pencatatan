const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

// Inisialisasi Database SQLite
const db = new sqlite3.Database('./harmoni.sqlite', (err) => {
    if (err) {
        console.error("Gagal terhubung database:", err.message);
    } else {
        console.log('Database Harmoni terhubung ');
        
        // Buat tabel otomatis jika belum ada
        db.run(`CREATE TABLE IF NOT EXISTS dokumen (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            jenis_dokumen TEXT,
            nomor_dokumen TEXT,
            npp TEXT,
            dpbb TEXT,
            tujuan_dept TEXT,
            pic_penerima TEXT,
            status_posisi TEXT,
            nama_bank TEXT,
            rekening TEXT,
            status_rekening TEXT
        )`);
    }
});

// READ: Ambil Semua Dokumen
app.get('/api/dokumen', (req, res) => {
    db.all("SELECT * FROM dokumen ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: rows || [] });
    });
});

// CREATE: Tambah Dokumen Baru
app.post('/api/dokumen', (req, res) => {
    const { jenis_dokumen, nomor_dokumen, npp, dpbb, tujuan_dept, pic_penerima, status_posisi, nama_bank, rekening, status_rekening } = req.body;
    const sql = `INSERT INTO dokumen (jenis_dokumen, nomor_dokumen, npp, dpbb, tujuan_dept, pic_penerima, status_posisi, nama_bank, rekening, status_rekening) VALUES (?,?,?,?,?,?,?,?,?,?)`;
    db.run(sql, [jenis_dokumen, nomor_dokumen, npp, dpbb, tujuan_dept, pic_penerima, status_posisi, nama_bank, rekening, status_rekening], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ id: this.lastID, message: "Dokumen berhasil disimpan!" });
    });
});

// UPDATE: Edit Dokumen
app.put('/api/dokumen/:id', (req, res) => {
    const { jenis_dokumen, nomor_dokumen, npp, dpbb, tujuan_dept, pic_penerima, status_posisi, nama_bank, rekening, status_rekening } = req.body;
    const sql = `UPDATE dokumen SET jenis_dokumen=?, nomor_dokumen=?, npp=?, dpbb=?, tujuan_dept=?, pic_penerima=?, status_posisi=?, nama_bank=?, rekening=?, status_rekening=? WHERE id=?`;
    db.run(sql, [jenis_dokumen, nomor_dokumen, npp, dpbb, tujuan_dept, pic_penerima, status_posisi, nama_bank, rekening, status_rekening, req.params.id], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Dokumen berhasil diperbarui!" });
    });
});

// DELETE: Hapus Dokumen
app.delete('/api/dokumen/:id', (req, res) => {
    db.run("DELETE FROM dokumen WHERE id = ?", req.params.id, function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Dokumen berhasil dihapus!" });
    });
});

// Jalankan Server di Port 5000
app.listen(5000, () => {
    console.log('Backend berjalan di http://localhost:5000');
});