import { Component } from "react";
import { db } from "../../config/Firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

class Tindakan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tindakans: [],
      namaTindakan: null,
      isProses: false,
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

  handleSubmit = async () => {
    this.setState({ isProses: true });
    try {
      const newTindakan = {
        nama_tindakan: this.state.namaTindakan,
      };
      await addDoc(collection(db, "tindakans"), newTindakan);

      Swal.fire("Berhasil", "Data dokter berhasil ditambah", "success");

      this.getAllTindakan();
      this.setState({
        namaTindakan: "",
        isProses: false,
      });
    } catch (error) {
      Swal.fire("Gagal", "Gagal menyimpan", "error");
      console.error("Error menambahkan data:", error);
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
