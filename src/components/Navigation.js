import React from "react";
import { Link } from "react-router-dom";

const navList = [
  { id: 1, nama: "Terapis", link: "/dashboard/terapis" },
  { id: 4, nama: "Tindakan", link: "/dashboard/tindakan" },
  { id: 3, nama: "Janji Temu", link: "/dashboard/janji-temu" },
  {
    id: 6,
    nama: "Pendapatan",
    link: "/dashboard/pendapatan",
  },
  {
    id: 5,
    nama: "Statistik dan Laporan",
    link: "/dashboard/statistik-dan-laporan",
  },
];

const Navigation = () => {
  return (
    <>
      <div>
        <Link to={"/dashboard"}>Dashboard</Link>
      </div>
      <ul>
        {navList.map((item) => (
          <li key={item.id}>
            <Link to={item.link}>{item.nama}</Link>
          </li>
        ))}
      </ul>
    </>
  );
};

export default Navigation;
