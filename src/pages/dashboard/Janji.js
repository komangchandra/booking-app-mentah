import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { Component } from "react";
import { db } from "../../config/Firebase";
import Swal from "sweetalert2";

class Janji extends Component {
  constructor(props) {
    super(props);
    this.state = {
      janjis: [],
      dokters: [],
      tindakans: [],
      durasi: null,
      tindakan: null,
      isProses: false,
      isEdit: false,
      jenisKelamin: null,
      dokterRef: null,
      jamMulai: null,
      jamSelesai: null,
      namaPasien: null,
      status: null,
      tanggal: null,
      tindakanRef: null,
      waktuTindakanRef: null,
    };
  }

  componentDidMount = () => {
    this.getAllJanji();
    // this.getAllDokter();
    this.getAllTindakan();
  };

  handleChangeJenisKelamin = async (e) => {
    await new Promise((resolve) => {
      this.setState({ jenisKelamin: e.target.value }, resolve);
    });
    const jnsKelamin = this.state.jenisKelamin;
    console.log("JK:", jnsKelamin);
    await this.getAllDokter(jnsKelamin);
  };

  getAllDokter = async (jnsKelamin) => {
    try {
      const dokterCollection = collection(db, "dokters");
      const querySnapshot = await getDocs(dokterCollection);

      const dokterList = [];
      querySnapshot.forEach((doc) => {
        const dokterData = doc.data();
        if (dokterData.jenis_kelamin === jnsKelamin) {
          dokterList.push({ id: doc.id, ...dokterData });
        }
      });

      await new Promise((resolve) => {
        this.setState({ dokters: dokterList }, resolve);
      });

      console.log("Dokter: ", this.state.dokters);

      return dokterList;
    } catch (error) {
      console.error("Error fetching dokter data:", error);
      throw error;
    }
  };

  getAllTindakan = async () => {
    try {
      const tindakanCollection = collection(db, "tindakans");
      const querySnapshot = await getDocs(tindakanCollection);

      const tindakanList = [];
      await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          // Ambil data tindakan dari dokumen
          const tindakanData = doc.data();

          // Ambil subcollection waktu_tindakan dari dokumen tindakan
          const waktuTindakanCollection = collection(doc.ref, "waktu_tindakan");
          const waktuTindakanSnapshot = await getDocs(waktuTindakanCollection);
          const waktuTindakanList = [];

          // Loop untuk setiap dokumen di subcollection waktu_tindakan
          waktuTindakanSnapshot.forEach((waktuTindakanDoc) => {
            waktuTindakanList.push({
              id: waktuTindakanDoc.id,
              ...waktuTindakanDoc.data(),
            });
          });

          // Tambahkan data tindakan dan waktu_tindakan ke dalam tindakanList
          tindakanList.push({
            id: doc.id,
            ...tindakanData,
            waktu_tindakan: waktuTindakanList,
          });
        })
      );

      // Set state dengan tindakanList yang telah diperbarui
      this.setState({ tindakans: tindakanList });
    } catch (error) {
      console.error("Error fetching dokter data:", error);
      throw error;
    }
  };

  getAllJanji = async () => {
    try {
      const janjiCollection = collection(db, "janji_temu");
      const querySnapshot = await getDocs(janjiCollection);

      const janjiList = [];
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

        // Menambahkan data janji temu ke dalam list janjiList
        janjiList.push({
          id: doc.id,
          dokter: namaDokter,
          // date: janjiData.date,
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

      // console.log({ janji: janjiList });
      this.setState({ janjis: janjiList });
    } catch (error) {
      console.error("Error fetching janji data:", error);
      throw error;
    }
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ isProses: true });

    try {
      const {
        dokterRef,
        tindakanRef,
        waktuTindakanRef,
        jamMulai,
        namaPasien,
        status,
        tanggal,
      } = this.state;

      // Membuat objek referensi Firestore untuk dokterRef, tindakanRef, dan waktuTindakanRef
      const dokterDocRef = doc(db, "dokters", dokterRef);
      const tindakanDocRef = doc(db, "tindakans", tindakanRef);
      const waktuTindakanDocRef = doc(
        db,
        "tindakans",
        tindakanRef,
        "waktu_tindakan",
        waktuTindakanRef
      );

      try {
        const waktuTindakanDocSnap = await getDoc(waktuTindakanDocRef);
        if (waktuTindakanDocSnap.exists()) {
          const waktuTindakanData = waktuTindakanDocSnap.data();
          var durasi = waktuTindakanData.durasi;
        }
      } catch (error) {
        console.error("Error fetching waktu_tindakan document:", error);
      }

      const [jam, menit] = jamMulai.split(":").map(Number);
      const waktuMulai = new Date();
      waktuMulai.setHours(jam);
      waktuMulai.setMinutes(menit);

      // Tambahkan durasi ke waktuMulai
      const waktuSelesai = new Date(waktuMulai.getTime() + durasi * 60000); // Konversi durasi dari menit ke milidetik

      // Format waktuSelesai ke dalam string "HH:mm"
      const jamSelesai = `${String(waktuSelesai.getHours()).padStart(
        2,
        "0"
      )}:${String(waktuSelesai.getMinutes()).padStart(2, "0")}`;

      // Membuat objek data baru untuk ditambahkan ke koleksi "janji_temu"
      const newData = {
        dokter_ref: dokterDocRef,
        tindakan_ref: tindakanDocRef,
        waktu_tindakan_ref: waktuTindakanDocRef,
        jam_mulai: jamMulai,
        jam_selesai: jamSelesai,
        nama_pasien: namaPasien,
        status: status,
        tanggal: tanggal,
      };

      // Menambahkan data baru ke koleksi "janji_temu"
      await addDoc(collection(db, "janji_temu"), newData);

      // Memberikan notifikasi bahwa data berhasil ditambahkan
      Swal.fire("Berhasil", "Data janji temu berhasil ditambah", "success");

      // Reset nilai state setelah data berhasil ditambahkan
      this.setState({
        jenisKelamin: "",
        dokterRef: "",
        tindakanRef: "",
        waktuTindakanRef: "",
        jamMulai: "",
        jamSelesai: "",
        namaPasien: "",
        status: "",
        tanggal: "",
        isProses: false,
      });

      // Mengambil ulang data janji temu untuk mengupdate tampilan
      this.getAllJanji();
    } catch (error) {
      // Menampilkan pesan error jika terjadi kesalahan
      console.error("Error menambah data janji temu:", error);
      alert("Gagal menambah data janji temu.");
    }
  };

  handleDelete = async (id) => {
    try {
      const result = window.confirm("Apakah Anda yakin ingin menghapus?");
      if (result === true) {
        await deleteDoc(doc(db, "janji_temu", id));
        Swal.fire("Berhasil", "Data dokter berhasil ditambah", "success");

        this.getAllJanji();
      }
    } catch (error) {
      console.error("Error menghapus data:", error);
      alert("Gagal menghapus data.");
    }
  };

  handleEdit = async (janji) => {
    const {
      id,
      dokter_ref,
      jam_mulai,
      jam_selesai,
      nama_pasien,
      status,
      tanggal,
      tindakan_ref,
      waktu_tindakan_ref, // tambahkan waktu_tindakan_ref
    } = janji;

    console.log(janji);

    this.setState({
      id: id,
      dokterRef: dokter_ref,
      jamMulai: jam_mulai,
      jamSelesai: jam_selesai,
      namaPasien: nama_pasien,
      status: status,
      tanggal: tanggal,
      tindakanRef: tindakan_ref,
      waktuTindakanRef: waktu_tindakan_ref, // Sesuaikan dengan field yang menyimpan referensi waktu_tindakan
      isEdit: true, // Perubahan ke true karena ini merupakan mode edit
    });
  };

  handleUpdate = async (e) => {
    e.preventDefault();
    this.setState({ isProses: true });

    try {
      const {
        id,
        dokterRef,
        tindakanRef,
        jamMulai,
        namaPasien,
        status,
        tanggal,
        waktuTindakanRef,
      } = this.state;

      const dokterDocRef = doc(db, "dokters", dokterRef);
      const tindakanDocRef = doc(db, "tindakans", tindakanRef);
      const waktuTindakanDocRef = doc(
        db,
        "tindakans",
        tindakanRef,
        "waktu_tindakan",
        waktuTindakanRef
      );

      try {
        const waktuTindakanDocSnap = await getDoc(waktuTindakanDocRef);
        if (waktuTindakanDocSnap.exists()) {
          const waktuTindakanData = waktuTindakanDocSnap.data();
          var durasi = waktuTindakanData.durasi;
        }
      } catch (error) {
        console.error("Error fetching waktu_tindakan document:", error);
      }

      const [jam, menit] = jamMulai.split(":").map(Number);
      const waktuMulai = new Date();
      waktuMulai.setHours(jam);
      waktuMulai.setMinutes(menit);

      // Tambahkan durasi ke waktuMulai
      const waktuSelesai = new Date(waktuMulai.getTime() + durasi * 60000); // Konversi durasi dari menit ke milidetik

      // Format waktuSelesai ke dalam string "HH:mm"
      const jamSelesai = `${String(waktuSelesai.getHours()).padStart(
        2,
        "0"
      )}:${String(waktuSelesai.getMinutes()).padStart(2, "0")}`;

      const updatedData = {
        dokter_ref: dokterDocRef,
        tindakan_ref: tindakanDocRef,
        waktu_tindakan_ref: waktuTindakanDocRef,
        jam_mulai: jamMulai,
        jam_selesai: jamSelesai,
        nama_pasien: namaPasien,
        status: status,
        tanggal: tanggal,
      };

      await updateDoc(doc(db, "janji_temu", id), updatedData);

      Swal.fire("Berhasil", "Data janji temu berhasil diperbarui", "success");

      this.getAllJanji();

      this.setState({
        jenisKelamin: "",
        dokterRef: "",
        tindakanRef: "",
        jamMulai: "",
        jamSelesai: "",
        namaPasien: "",
        status: "",
        tanggal: "",
        waktuTindakanRef: "",
        isEdit: false,
        isProses: false,
      });
    } catch (error) {
      console.error("Error updating data:", error);
      Swal.fire("Error", "Gagal memperbarui data janji temu", "error");
      this.setState({ isProses: false });
    }
  };

  render() {
    const status = [
      { id: 1, nama: "Belum Diproses" },
      { id: 2, nama: "Diproses" },
      { id: 3, nama: "Dibatalkan" },
    ];

    const ganders = [{ name: "Laki-laki" }, { name: "Perempuan" }];
    return (
      <>
        <div>
          <label>Filter jenis kelamin:</label>
          <select
            onChange={this.handleChangeJenisKelamin}
            value={this.state.bulan}>
            <option>Pilih Jenis Kelamin</option>
            {ganders.map((gander) => (
              <option key={gander.name} value={gander.name}>
                {gander.name}
              </option>
            ))}
          </select>
        </div>
        <hr />
        <form className="form-container">
          <div>
            <label>Nama Dokter</label>
            <select
              value={this.state.dokterRef}
              onChange={(e) => this.setState({ dokterRef: e.target.value })}
              required>
              <option>Pilih Dokter</option>
              {this.state.dokters.map((dokter) => (
                <option key={dokter.id} value={dokter.id}>
                  {dokter.nama}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Jenis Tindakan</label>
            <select
              value={this.state.tindakanRef}
              onChange={(e) => this.setState({ tindakanRef: e.target.value })}
              required>
              <option>Pilih Jenis Tindakan</option>
              {this.state.tindakans.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama_tindakan}
                </option>
              ))}
            </select>
          </div>
          {this.state.tindakanRef && (
            <div>
              <label>Waktu Tindakan</label>
              <select
                value={this.state.waktuTindakanRef}
                onChange={(e) =>
                  this.setState({ waktuTindakanRef: e.target.value })
                }
                required>
                <option>Pilih Waktu Tindakan</option>
                {this.state.tindakans
                  .find((item) => item.id === this.state.tindakanRef)
                  ?.waktu_tindakan.map((subItem) => (
                    <option key={subItem.id} value={subItem.id}>
                      {subItem.durasi} Menit - Rp {subItem.biaya}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div>
            <label>jamMulai</label>
            <input
              type="time"
              value={this.state.jamMulai}
              onChange={(e) => this.setState({ jamMulai: e.target.value })}
              required
            />
          </div>
          <div>
            <label>namaPasien</label>
            <input
              type="text"
              value={this.state.namaPasien}
              onChange={(e) => this.setState({ namaPasien: e.target.value })}
              required
            />
          </div>
          <div>
            <label>status</label>
            <select
              value={this.state.status}
              onChange={(e) => this.setState({ status: e.target.value })}
              required>
              <option>Pilih Status</option>
              {status.map((item) => (
                <option key={item.id} value={item.nama}>
                  {item.nama}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>tanggal</label>
            <input
              type="date"
              value={this.state.tanggal}
              onChange={(e) => this.setState({ tanggal: e.target.value })}
              required
            />
          </div>
          {this.state.isEdit ? (
            <button type="submit" onClick={this.handleUpdate}>
              Update Data
            </button>
          ) : (
            <button
              disabled={this.state.isProses}
              type="submit"
              onClick={this.handleSubmit}>
              Tambah data
            </button>
          )}
        </form>
        <hr />
        <h3>Janji Temu</h3>
        <table>
          <thead>
            <tr>
              <th>Nama Dokter</th>
              <th>Tindakan</th>
              <th>Jam Mulai</th>
              <th>Jam Selesai</th>
              <th>Nama Pasien</th>
              <th>Status</th>
              <th>Tanggal</th>
              <th>Durasi</th>
              <th>Biaya</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {this.state.janjis.map((janji) => (
              <tr key={janji.id}>
                <td>{janji.dokter}</td>
                <td>{janji.tindakan}</td>
                <td>{janji.jam_mulai}</td>
                <td>{janji.jam_selesai}</td>
                <td>{janji.nama_pasien}</td>
                <td>{janji.status}</td>
                <td>{janji.tanggal}</td>
                <td>{janji.durasi}</td>
                <td>Rp {janji.biaya.toLocaleString("id-ID")}</td>
                <td>
                  <button onClick={() => this.handleEdit(janji)}>Edit</button>
                  <button onClick={() => this.handleDelete(janji.id)}>
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }
}

export default Janji;
