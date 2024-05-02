import { Component } from "react";
import { db, dbImage } from "../../config/Firebase";
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import Swal from "sweetalert2";

class Dokter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dokters: [],
      id: null,
      nama: null,
      jenis_kelamin: null,
      pengalaman: null,
      umur: null,
      foto: null,
      kontak: null,
      isEdit: false,
      isProses: false,
    };
  }

  componentDidMount = () => {
    this.getAllDokter();
  };

  getAllDokter = async () => {
    try {
      const dokterCollection = collection(db, "dokters");
      const querySnapshot = await getDocs(dokterCollection);

      const dokterList = [];
      querySnapshot.forEach((doc) => {
        dokterList.push({ id: doc.id, ...doc.data() });
      });

      await new Promise((resolve) => {
        this.setState({ dokters: dokterList }, resolve);
      });
      console.log(this.state.dokters);
    } catch (error) {
      console.error("Error fetching dokter data:", error);
      throw error;
    }
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ isProses: true });
    // buat nama file foto
    const nama = this.state.nama;
    const imageUrl = nama.toLowerCase().replace(/\s+/g, "-");

    try {
      const imgRef = ref(dbImage, `dokters/${imageUrl}`);
      await uploadBytes(imgRef, this.state.foto);

      const urlFoto = await getDownloadURL(imgRef);

      const newDoctor = {
        nama: this.state.nama,
        jenis_kelamin: this.state.jenis_kelamin,
        pengalaman: this.state.pengalaman,
        umur: this.state.umur,
        kontak: this.state.kontak,
        foto: urlFoto,
      };
      await addDoc(collection(db, "dokters"), newDoctor);

      Swal.fire("Berhasil", "Data dokter berhasil ditambah", "success");

      this.getAllDokter();
      this.setState({
        nama: "",
        pengalaman: "",
        umur: "",
        kontak: "",
        foto: null,
        isProses: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Gagal menambah data",
      });
      console.error("Error menambahkan data:", error);
    }
  };

  handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Yakin ingin menghapus?",
        text: "Data tidak akan kembali setelah dihapus",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Hapus",
        cancelButtonText: "Batal",
      });

      if (result.isConfirmed === true) {
        // find by id
        const doctorRef = doc(db, "dokters", id);
        const doctorSnapshot = await getDoc(doctorRef);
        const doctorData = doctorSnapshot.data();

        // Dapatkan URL gambar dari dokumen
        const imageUrl = doctorData.foto;

        // Hapus file gambar dari Firebase Storage
        const fileRef = ref(dbImage, imageUrl);
        await deleteObject(fileRef);

        // Hapus dokumen dari koleksi Firestore
        await deleteDoc(doctorRef);
        await deleteDoc(doc(db, "dokters", id));

        Swal.fire("Berhasil", "Data dokter berhasil dihapus", "success");
        this.getAllDokter();
      }
    } catch (error) {
      console.error("Error menghapus data:", error);
      // Tampilkan notifikasi error menggunakan SweetAlert
      Swal.fire("Error", "Gagal menghapus data dokter", "error");
    }
  };

  handleEdit = (dokter) => {
    const { id, nama, pengalaman, umur, kontak, foto } = dokter;

    this.setState({
      id: id,
      nama: nama,
      pengalaman: pengalaman,
      umur: umur,
      kontak: kontak,
      foto: foto,
      isEdit: !this.state.isEdit,
    });
  };

  handleUpdate = async (e) => {
    this.setState({ isProses: true });
    e.preventDefault();
    const { nama, pengalaman, umur, kontak, jenis_kelamin } = this.state;
    const { id } = this.state;

    try {
      await updateDoc(doc(db, "dokters", id), {
        nama,
        jenis_kelamin,
        pengalaman,
        umur,
        kontak,
      });
      Swal.fire("Berhasil", "Data dokter berhasil diperbarui", "success");
      this.getAllDokter();
      this.setState({
        nama: "",
        jenis_kelamin: "",
        pengalaman: "",
        umur: "",
        kontak: "",
        isEdit: !this.state.isEdit,
        isProses: false,
      });
    } catch (error) {
      console.error("Error updating data:", error);
      Swal.fire("Error", "Gagal memperbarui data dokter", "error");
    }
  };

  render() {
    const jenis_kelamin = [
      { jenis_kelamin: "Laki-laki" },
      { jenis_kelamin: "Perempuan" },
    ];
    return (
      <>
        <form className="form-container" enctype="multipart/form-data">
          <div>
            <label>Nama Terapis</label>
            <input
              type="text"
              value={this.state.nama}
              onChange={(e) => this.setState({ nama: e.target.value })}
            />
          </div>
          <div>
            <label>Jenis Kelamin</label>
            <select
              value={this.state.jenis_kelamin}
              onChange={(e) => this.setState({ jenis_kelamin: e.target.value })}
              required>
              <option>Pilih jenis_kelamin</option>
              {jenis_kelamin.map((item) => (
                <option key={item.jenis_kelamin} value={item.jenis_kelamin}>
                  {item.jenis_kelamin}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Pengalaman</label>
            <input
              type="text"
              value={this.state.pengalaman}
              onChange={(e) => this.setState({ pengalaman: e.target.value })}
            />
          </div>
          <div>
            <label>Umur</label>
            <input
              type="number"
              value={this.state.umur}
              onChange={(e) => this.setState({ umur: e.target.value })}
            />
          </div>
          <div>
            <label>Kontak</label>
            <input
              type="text"
              value={this.state.kontak}
              onChange={(e) => this.setState({ kontak: e.target.value })}
            />
          </div>
          {this.state.isEdit ? (
            <div>
              <img src={this.state.foto} alt={this.state.nama} />
            </div>
          ) : (
            <div>
              <label>Foto</label>
              <input
                type="file"
                onChange={(e) => this.setState({ foto: e.target.files[0] })}
              />
            </div>
          )}
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
        <h3>Data Terapis</h3>
        <table>
          <thead>
            <tr>
              <th>Nama Terapis</th>
              <th>Jenis Kelamin</th>
              <th>Pengalaman</th>
              <th>Umur</th>
              <th>Kontak</th>
              <th>Foto</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {this.state.dokters.map((dokter) => (
              <tr key={dokter.id}>
                <td>{dokter.nama}</td>
                <td>{dokter.jenis_kelamin}</td>
                <td>{dokter.pengalaman}</td>
                <td>{dokter.umur}</td>
                <td>{dokter.kontak}</td>
                <td>
                  {dokter.foto ? (
                    <img src={dokter.foto} alt={dokter.nama} />
                  ) : (
                    "Foto tidak tersedia"
                  )}
                </td>
                <td>
                  <button onClick={() => this.handleEdit(dokter)}>Edit</button>
                  <button onClick={() => this.handleDelete(dokter.id)}>
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

export default Dokter;

// const dokters = [
//   {
//     nama: "dr Riyanti",
//     jenis_kelamin: "Perempuan",
//   },
//   {
//     nama: "dr Handoko",
//     jenis_kelamin: "Laki-laki",
//   },
// ];
