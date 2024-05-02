import { Component } from "react";
import { db } from "../../config/Firebase";
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import Swal from "sweetalert2";

class Pendapatan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      janjis: [],
      pendapatans: [],
      bulan: null,
      tahun: new Date().getFullYear(),
      isProses: false,
    };
  }

  componentDidMount = () => {
    this.getAllPendapatan();
  };

  handleMonthChange = (e) => {
    this.setState({ bulan: e.target.value });
  };

  handleYearChange = (e) => {
    this.setState({ tahun: parseInt(e.target.value) });
    console.log({ bulan: this.state.bulan });
    console.log({ tahun: this.state.tahun });
  };

  getAllProcessedJanjis = async () => {
    try {
      const janjiCollection = collection(db, "janji_temu");

      const processedJanjiList = [];

      for (let tanggal = 1; tanggal <= 31; tanggal++) {
        const formattedTanggal = `${this.state.tahun}-${
          this.state.bulan
        }-${tanggal.toString().padStart(2, "0")}`;

        const q = query(
          janjiCollection,
          where("status", "==", "Diproses"),
          where("tanggal", "==", formattedTanggal)
        );

        const querySnapshot = await getDocs(q);

        for (const doc of querySnapshot.docs) {
          const janjiData = doc.data();

          // Mendapatkan nama dokter dari referensi dokter_ref
          const dokterDoc = await getDoc(janjiData.dokter_ref);
          const namaDokter = dokterDoc.data().nama;

          // Mendapatkan data tindakan dari referensi tindakan_ref
          const tindakanDoc = await getDoc(janjiData.tindakan_ref);
          const tindakanData = tindakanDoc.data();
          const namaTindakan = tindakanData.nama_tindakan;

          // Mendapatkan durasi dan biaya dari subkoleksi waktu_tindakan di dalam dokumen tindakan
          const waktuTindakanRef = janjiData.waktu_tindakan_ref;
          const waktuTindakanDoc = await getDoc(waktuTindakanRef);
          const waktuTindakanData = waktuTindakanDoc.data();
          const durasi = waktuTindakanData.durasi;
          const biaya = waktuTindakanData.biaya;

          // Menambahkan data janji temu ke dalam list processedJanjiList
          processedJanjiList.push({
            id: doc.id,
            dokter: namaDokter,
            jam_mulai: janjiData.jam_mulai,
            jam_selesai: janjiData.jam_selesai,
            nama_pasien: janjiData.nama_pasien,
            status: janjiData.status,
            tanggal: janjiData.tanggal,
            tindakan: namaTindakan,
            durasi: durasi,
            biaya: biaya,
          });
        }
      }

      console.log({ janji: processedJanjiList });

      // Setelah semua data diproses, atur state janjis dan kembalikan processedJanjiList
      await new Promise((resolve) => {
        this.setState({ janjis: processedJanjiList }, resolve);
      });

      return processedJanjiList;
    } catch (error) {
      console.error("Error fetching processed janji data:", error);
    }
  };

  handleDeleteAll = async () => {
    try {
      const pendapatanCollection = collection(db, "pendapatan_terapi");
      const querySnapshot = await getDocs(pendapatanCollection);

      // Iterasi melalui setiap dokumen dan hapus
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      console.log(
        "Semua dokumen di collection pendapatan_terapi berhasil dihapus."
      );
    } catch (error) {
      console.error("Error deleting documents:", error);
    }
  };

  handleCreate = async () => {
    try {
      const pendapatanCollection = collection(db, "pendapatan_terapi");

      console.log({ data: this.state.janjis });
      // Iterasi setiap data janji dari state janjis
      for (const janji of this.state.janjis) {
        // Buat dokumen baru di koleksi pendapatan_terapi
        await addDoc(pendapatanCollection, {
          nama_dokter: janji.dokter,
          tindakan: janji.tindakan,
          tanggal: janji.tanggal,
          durasi: janji.durasi,
          biaya: janji.biaya,
        });
      }
      console.log("Dokumen pendapatan_terapi berhasil dibuat");
    } catch (error) {
      console.error("Error creating pendapatan_terapi document:", error);
    }
  };

  getAllPendapatan = async () => {
    try {
      const pendapatanCollection = collection(db, "pendapatan_terapi");
      const querySnapshot = await getDocs(pendapatanCollection);
      const pendapatanList = [];

      querySnapshot.forEach((doc) => {
        pendapatanList.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      this.setState({ pendapatans: pendapatanList });
      console.log({ pendapatans: this.state.pendapatans });

      return pendapatanList;
    } catch (error) {
      console.error("Error fetching pendapatan_terapi documents:", error);
      throw error;
    }
  };

  handleSearch = async (e) => {
    e.preventDefault();
    this.setState({ isProses: true });
    await this.getAllProcessedJanjis();
    await this.handleDeleteAll();
    await this.handleCreate();
    await this.getAllPendapatan(); // Panggil fungsi untuk mendapatkan data pendapatan juga
    await new Promise((resolve) => {
      this.setState({ isProses: false }, resolve);
    });
  };

  render() {
    const months = [
      { value: "01", label: "Januari" },
      { value: "02", label: "Februari" },
      { value: "03", label: "Maret" },
      { value: "04", label: "April" },
      { value: "05", label: "Mei" },
      { value: "06", label: "Juni" },
      { value: "07", label: "Juli" },
      { value: "08", label: "Agustus" },
      { value: "09", label: "September" },
      { value: "10", label: "Oktober" },
      { value: "11", label: "November" },
      { value: "12", label: "Desember" },
    ];

    const startYear = 2010;
    const endYear = new Date().getFullYear();
    const years = [];
    for (let year = endYear; year >= startYear; year--) {
      years.push(year);
    }

    return (
      <>
        <form className="form-container">
          <div>
            <label>Pilih Bulan:</label>
            <select onChange={this.handleMonthChange} value={this.state.bulan}>
              <option value="">Pilih</option>
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Pilih Tahun:</label>
            <select onChange={this.handleYearChange} value={this.state.tahun}>
              <option value="">Pilih</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <button
            disabled={this.state.isProses}
            type="submit"
            onClick={this.handleSearch}>
            Cari data
          </button>
        </form>
        <hr />
        <h3>
          Data Pendapatan bulan:{this.state.bulan} tahun: {this.state.tahun}
        </h3>
        <table>
          <thead>
            <tr>
              <th>Nama Dokter</th>
              <th>Tindakan</th>
              <th>Tanggal</th>
              <th>Durasi</th>
              <th>Biaya</th>
            </tr>
          </thead>
          <tbody>
            {this.state.pendapatans.length === 0 ? (
              <tr>
                <td colSpan="5">Tidak ada data</td>
              </tr>
            ) : (
              this.state.pendapatans.map((pendapatan) => (
                <tr key={pendapatan.id}>
                  <td>{pendapatan.nama_dokter}</td>
                  <td>{pendapatan.tindakan}</td>
                  <td>{pendapatan.tanggal}</td>
                  <td>{pendapatan.durasi} Menit</td>
                  <td>Rp {pendapatan.biaya.toLocaleString("id-ID")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </>
    );
  }
}

export default Pendapatan;
