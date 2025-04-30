import React, { useState } from "react";
import CalendarView from "./components/CalendarView";
import DateClickModal from "./components/DateClickModal";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";


export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [modalDate, setModalDate] = useState(null);

  const handleLogin = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    setUser(decoded);
    setToken(credentialResponse.credential);
  };

  const handleLogout = () => {
    googleLogout();
    setToken(null);
    setUser(null);
  };

  return (
    <div>
      {!token ? (
        <GoogleLogin onSuccess={handleLogin} onError={() => console.error("Login failed")} />
      ) : (
        <>
          <button onClick={handleLogout}>Logout</button>
          <CalendarView token={token} onDateClick={setModalDate} />
          {modalDate && (
            <DateClickModal date={modalDate} onClose={() => setModalDate(null)} />
          )}
        </>
      )}
    </div>
  );
}
