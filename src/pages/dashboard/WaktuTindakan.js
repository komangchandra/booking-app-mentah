import { Component } from "react";
import withRouter from "../../withRouter";
import { db } from "../../config/Firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import Swal from "sweetalert2";

class WaktuTindakan extends Component {
  constructor(props) {
    super(props);
    const { id } = this.props.params;
    this.state = {
      idTindakan: id,
      namaTindakan: null,
      waktuTindakans: [],
      durasi: null,
      tindakan: null,
      isProses: false,
      isEdit: false,
    };
  }

  componentDidMount = () => {
    this.getAllWaktuTindakan();
    this.getNamaTindakan();
  };

  getNamaTindakan = async () => {
    try {
      const tindakanDoc = await getDoc(
        doc(db, "tindakans", this.state.idTindakan)
      );
      const tindakanData = tindakanDoc.data();
      if (tindakanData) {
        this.setState({ namaTindakan: tindakanData.nama_tindakan });
      } else {
        console.error("Tindakan not found");
      }
    } catch (error) {
      console.error("Error fetching nama tindakan:", error);
    }
  };

  getAllWaktuTindakan = async () => {
    try {
      const { idTindakan } = this.state;

      const waktuTindakanCollection = collection(
        db,
        `tindakans/${idTindakan}/waktu_tindakan`
      );

      const querySnapshot = await getDocs(waktuTindakanCollection);

      const waktuTindakanList = [];

      querySnapshot.forEach((doc) => {
        waktuTindakanList.push({ id: doc.id, ...doc.data() });
      });

      this.setState({ waktuTindakans: waktuTindakanList });
    } catch (error) {
      console.error("Error fetching waktu tindakan data:", error);
      throw error;
    }
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ isProses: false });
    try {
      const { durasi, biaya } = this.state;
      const data = {
        durasi: parseInt(durasi),
        biaya: parseInt(biaya),
      };

      await addDoc(
        collection(db, `tindakans/${this.state.idTindakan}/waktu_tindakan`),
        data
      );
      Swal.fire("Berhasil", "Data dokter berhasil ditambah", "success");
      this.setState({ isProses: false, durasi: "", biaya: "" });
      this.getAllWaktuTindakan();
    } catch (error) {
      console.error("Error menambah data:", error);
      alert("Gagal menambah data.");
    }
  };

  handleDelete = async (id) => {
    try {
      const result = window.confirm("Apakah Anda yakin ingin menghapus?");
      if (result === true) {
        await deleteDoc(
          doc(db, `tindakans/${this.state.idTindakan}/waktu_tindakan`, id)
        );
        alert("Data berhasil dihapus.");
        this.getAllWaktuTindakan();
      }
    } catch (error) {
      console.error("Error menghapus data:", error);
      alert("Gagal menghapus data. Error: " + error.message);
    }
  };

  handleEdit = (dokter) => {
    const { id, durasi, biaya } = dokter;

    this.setState({
      id: id,
      durasi: durasi,
      biaya: biaya,
      isEdit: !this.state.isEdit,
    });
  };

  handleUpdate = async (e) => {
    e.preventDefault();
    this.setState({ isProses: true });

    try {
      const { idTindakan, id, durasi, biaya } = this.state;

      // Menyiapkan data yang akan diupdate
      const dataToUpdate = {
        durasi: parseInt(durasi), // Pastikan durasi berupa integer
        biaya: parseInt(biaya), // Pastikan biaya berupa integer
      };

      // Mengupdate data di Firestore
      await updateDoc(
        doc(db, `tindakans/${idTindakan}/waktu_tindakan`, id),
        dataToUpdate
      );

      // Memberi notifikasi jika update berhasil
      alert("Data berhasil diperbarui.");

      // Mengambil ulang data tindakan setelah update
      this.getAllWaktuTindakan();

      // Mengatur state isEdit menjadi false dan isProses menjadi false
      this.setState({ isEdit: false, isProses: false });
    } catch (error) {
      console.error("Error mengupdate data:", error);
      alert("Gagal mengupdate data.");
      this.setState({ isProses: false });
    }
  };

  render() {
    return (
      <>
        <form className="form-container">
          <div>
            <label>Durasi</label>
            <input
              type="number"
              value={this.state.durasi}
              onChange={(e) => this.setState({ durasi: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Biaya</label>
            <input
              type="number"
              value={this.state.biaya}
              onChange={(e) => this.setState({ biaya: e.target.value })}
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
        <h3>Tindakan: {this.state.namaTindakan}</h3>
        <table>
          <thead>
            <tr>
              <th>Durasi</th>
              <th>Biaya</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {this.state.waktuTindakans.map((item) => (
              <tr key={item.id}>
                <td>{item.durasi}</td>
                <td>Rp {item.biaya.toLocaleString("id-ID")}</td>
                <td>
                  <button onClick={() => this.handleEdit(item)}>Edit</button>
                  <button onClick={() => this.handleDelete(item.id)}>
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

export default withRouter(WaktuTindakan);
