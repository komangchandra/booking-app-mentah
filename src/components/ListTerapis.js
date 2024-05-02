import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../config/Firebase";

const ListTerapis = () => {
  const [terapis, setTerapis] = useState([]);

  useEffect(() => {
    getAllTindakan();
  }, []);

  const getAllTindakan = async () => {
    try {
      const tindakanCollection = collection(db, "dokters");
      const querySnapshot = await getDocs(tindakanCollection);

      const tindakanList = [];
      querySnapshot.forEach((doc) => {
        tindakanList.push({ id: doc.id, ...doc.data() });
      });

      await new Promise((resolve) => {
        setTerapis(tindakanList);
      });

      console.log(tindakanList);

      return tindakanList;
    } catch (error) {
      console.error("Error fetching dokter data:", error);
      throw error;
    }
  };

  return (
    <>
      <ul class="list">
        {terapis.map((terapi) => (
          <div class="container">
            <li key={terapi.id} class="list-item">
              <div>
                {terapi.foto ? (
                  <img src={terapi.foto} alt={terapi.nama} />
                ) : (
                  "Foto tidak tersedia"
                )}
                <h5>
                  {terapi.nama} - {terapi.umur} Tahun
                </h5>
                <p>No hp: {terapi.kontak}</p>
                <p>JK: {terapi.jenis_kelamin}</p>
                <p>{terapi.pengalaman}</p>
              </div>
            </li>
            <button>lihat profil</button>
          </div>
        ))}
      </ul>
    </>
  );
};

export default ListTerapis;
