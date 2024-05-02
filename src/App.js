import "./App.css";
import Navigation from "./components/Navigation";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Dashboard from "./pages/dashboard/Dashboard";
import Dokter from "./pages/dashboard/Dokter";
import Janji from "./pages/dashboard/Janji";
import ImagePage from "./pages/client/Image";
import Tindakan from "./pages/dashboard/Tindakan";
import WaktuTindakan from "./pages/dashboard/WaktuTindakan";
import Pendapatan from "./pages/dashboard/Pendapatan";
import Home from "./pages/client/Home";

function App() {
  return (
    <div className="App">
      <Router>
        <aside>
          <Navigation />
        </aside>
        <main>
          <Routes>
            <Route path="/" Component={Home} />
            <Route path="/images" Component={ImagePage} />
            <Route path="/dashboard" Component={Dashboard} />
            <Route path="/dashboard/terapis" Component={Dokter} />
            <Route path="/dashboard/janji-temu" Component={Janji} />
            <Route path="/dashboard/tindakan" Component={Tindakan} />
            <Route path="/dashboard/tindakan/:id" Component={WaktuTindakan} />
            <Route path="/dashboard/pendapatan" Component={Pendapatan} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;
