import { Component } from "react";
import ListTerapis from "../../components/ListTerapis";
import { db } from "../../config/Firebase";
import { collection, getDocs } from "firebase/firestore";

class Home extends Component {
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

      await new Promise((resolve) => {
        this.setState({ tindakans: tindakanList }, resolve);
      });

      return tindakanList;
    } catch (error) {
      console.error("Error fetching dokter data:", error);
      throw error;
    }
  };

  render() {
    return (
      <>
        <h3>List Para Terapi</h3>
        <ListTerapis />
        <h3>Jenis Pelayanan</h3>
        <ul class="list">
          {this.state.tindakans.map((tindakan) => (
            <div class="container">
              <li key={tindakan.id} class="list-item">
                <div>
                  <h5>{tindakan.nama_tindakan}</h5>
                </div>
              </li>
              <button>Pilih waktu</button>
            </div>
          ))}
        </ul>
      </>
    );
  }
}

export default Home;
