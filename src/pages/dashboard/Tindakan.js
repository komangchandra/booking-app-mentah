import { Component } from "react";
import { db, dbImage } from "../../config/Firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

class Tindakan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tindakans: [],
      id: null,
      namaTindakan: null,
      deskripsiTindakan: null,
      fotoTindakan: null,
      isProses: false,
      isEdit: false,
    };
  }

  componentDidMount = () => {
    this.getAllTindakan();
  };

  getAllTindakan = async () => {
    try {
      const tindakanCollection = collection(db, "tindakans");
      const querySnapshot = await getDocs(tindakanCollection);

      const tindakanList = [];
      querySnapshot.forEach((doc) => {
        tindakanList.push({ id: doc.id, ...doc.data() });
      });

      console.log(tindakanList);
      this.setState({ tindakans: tindakanList });
    } catch (error) {
      console.error("Error fetching dokter data:", error);
      throw error;
    }
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ isProses: true });

    const namaTindakan = this.state.namaTindakan;
    const imageUrl = namaTindakan.toLowerCase().replace(/\s+/g, "-");
    try {
      const imgRef = ref(dbImage, `tindakans/${imageUrl}`);
      await uploadBytes(imgRef, this.state.fotoTindakan);

      const urlFoto = await getDownloadURL(imgRef);

      const newTindakan = {
        nama_tindakan: this.state.namaTindakan,
        deskripsi_tindakan: this.state.deskripsiTindakan,
        foto_tindakan: urlFoto,
      };
      await addDoc(collection(db, "tindakans"), newTindakan);

      Swal.fire("Berhasil", "Data dokter berhasil ditambah", "success");

      this.getAllTindakan();
      this.setState({
        namaTindakan: "",
        deskripsiTindakan: "",
        fotoTindakan: "",
        isProses: false,
      });
    } catch (error) {
      Swal.fire("Gagal", "Gagal menyimpan", "error");
      console.error("Error menambahkan data:", error);
    }
  };

  handleEdit = (dokter) => {
    const { id, nama_tindakan, deskripsi_tindakan, foto_tindakan } = dokter;

    this.setState({
      id: id,
      namaTindakan: nama_tindakan,
      deskripsiTindakan: deskripsi_tindakan,
      fotoTindakan: foto_tindakan,
      isEdit: !this.state.isEdit,
    });
  };

  handleUpdate = async (e) => {
    this.setState({ isProses: true });
    e.preventDefault();
    const { id, namaTindakan, deskripsiTindakan } = this.state;

    try {
      await updateDoc(doc(db, "tindakans", id), {
        namaTindakan,
        deskripsiTindakan,
      });
      Swal.fire("Berhasil", "Data dokter berhasil diperbarui", "success");
      this.getAllTindakan();
      this.setState({
        namaTindakan: "",
        deskripsiTindakan: "",
        isEdit: !this.state.isEdit,
        isProses: false,
      });
    } catch (error) {
      console.error("Error updating data:", error);
      Swal.fire("Error", "Gagal memperbarui data dokter", "error");
    }
  };

  handleDelete = async (id) => {
    try {
      const result = window.confirm("Apakah Anda yakin ingin menghapus?");
      if (result === true) {
        await deleteDoc(doc(db, "tindakans", id));
        alert("Data berhasil dihapus.");
        this.getAllTindakan();
      }
    } catch (error) {
      console.error("Error menghapus data:", error);
      alert("Gagal menghapus data.");
    }
  };

  render() {
    return (
      <>
        <form className="form-container">
          <div>
            <label>Nama Tindakan</label>
            <input
              type="text"
              value={this.state.namaTindakan}
              onChange={(e) => this.setState({ namaTindakan: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Deskripsi tindakan</label>
            <textarea
              type="text"
              value={this.state.deskripsiTindakan}
              onChange={(e) =>
                this.setState({ deskripsiTindakan: e.target.value })
              }
              required
              cols="30"
              rows="10"></textarea>
          </div>
          {this.state.isEdit ? (
            <div>
              <img
                src={this.state.fotoTindakan}
                alt={this.state.namaTindakan}
              />
            </div>
          ) : (
            <div>
              <label>Foto</label>
              <input
                type="file"
                onChange={(e) =>
                  this.setState({ fotoTindakan: e.target.files[0] })
                }
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
        <h3>Data Tindakan</h3>
        <table>
          <thead>
            <tr>
              <th>Nama Tindakan</th>
              <th>Foto</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {this.state.tindakans.map((tindakan) => (
              <tr key={tindakan.id}>
                <td>
                  <Link to={tindakan.id}>{tindakan.nama_tindakan}</Link>
                </td>
                <td>
                  {tindakan.foto_tindakan ? (
                    <img
                      src={tindakan.foto_tindakan}
                      alt={tindakan.nama_tindakan}
                    />
                  ) : (
                    "Foto tidak tersedia"
                  )}
                </td>
                <td>
                  <button onClick={() => this.handleEdit(tindakan)}>
                    Edit
                  </button>
                  <button onClick={() => this.handleDelete(tindakan.id)}>
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

export default Tindakan;
