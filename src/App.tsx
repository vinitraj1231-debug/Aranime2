import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Navbar from "./components/Navbar";
import AgeGate from "./components/AgeGate";

export default function App() {
  return (
    <BrowserRouter>
      {/* 18+ Age Gate overlay */}
      <AgeGate />
      
      <div className="min-h-screen bg-bg-darker flex flex-col">
        <Navbar user={null} isAdmin={false} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
