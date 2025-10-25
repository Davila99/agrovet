import React, { useEffect, useState } from "react";
import { api } from "../../services/httpClient";

const HelloTest = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.getHello()
      .then((data) => setMessage(data.message))
      .catch((err) => console.error("❌ Error:", err));
  }, []);

  return (
    <div
      style={{
        color: "#000",
      }}>
      <h2>Respuesta del backend:</h2>
      <p>{message}</p>
    </div>
  );
};

export default HelloTest;
