import React, { useEffect, useState } from "react";
import { dbImage } from "../../config/Firebase";
import { ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";

const ImagePage = () => {
  const [nama, setNama] = useState("");
  const [img, setImg] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);

  useEffect(() => {
    // Mengambil daftar file yang ada di folder dokters
    const imgFolderRef = ref(dbImage, "dokters");
    listAll(imgFolderRef)
      .then((res) => {
        // Mendapatkan URL gambar untuk setiap file
        const promises = res.items.map((itemRef) => getDownloadURL(itemRef));
        // Menunggu hingga semua URL gambar selesai diambil
        return Promise.all(promises);
      })
      .then((urls) => {
        // Menyimpan URL gambar dalam state
        setImageUrls(urls);
      })
      .catch((error) => {
        console.error("Error getting images:", error);
      });
  }, []);

  const handleUpload = () => {
    const namaFile = nama.toLowerCase().replace(/\s+/g, "-");

    const imgRef = ref(dbImage, `dokters/${namaFile}`);
    uploadBytes(imgRef, img);

    console.log(uploadBytes);
  };
  return (
    <>
      <div>ImagePage</div>
      <div>
        <input
          type="text"
          placeholder="nama foto"
          onChange={(e) => setNama(e.target.value)}
        />
      </div>
      <div>
        <input type="file" onChange={(e) => setImg(e.target.files[0])} />
      </div>
      <button onClick={handleUpload}>Simpan</button>

      <div>
        {imageUrls.map((url, index) => (
          <img key={index} src={url} alt={`Image ${index}`} />
        ))}
      </div>
    </>
  );
};

export default ImagePage;
