import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateDiagnosis = () => {
  const [patientId, setPatientId] = useState("");
  const [recordId, setRecordId] = useState("");
  const [diagnosisText, setDiagnosisText] = useState("");
  const [publicKey, setPublicKey] = useState(""); // Публичный ключ (получаем с бэкенда)
  const navigate = useNavigate();

  const fetchPublicKey = async () => {
    try {
      const response = await axios.get("/api/security-keys/public/1"); // Пример запроса на получение публичного ключа
      setPublicKey(response.data);
    } catch (error) {
      console.error("Error fetching public key:", error);
    }
  };

  const encryptWithRSA = (text, publicKey) => {
    const crypto = require("crypto");
    const buffer = Buffer.from(text, "utf8");
    const encrypted = crypto.publicEncrypt(publicKey, buffer);
    return encrypted.toString("base64");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const encryptedDiagnosis = encryptWithRSA(diagnosisText, publicKey);
      const response = await axios.post("/api/diagnosis/create", {
        patientId,
        recordId,
        diagnosisText: encryptedDiagnosis,
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating diagnosis:", error);
    }
  };

  // Загружаем публичный ключ при монтировании компонента
  React.useEffect(() => {
    fetchPublicKey();
  }, []);

  return (
    <div>
      <h2>Create Diagnosis</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Patient ID:</label>
          <input
            type="text"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Record ID:</label>
          <input
            type="text"
            value={recordId}
            onChange={(e) => setRecordId(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Diagnosis Text:</label>
          <textarea
            value={diagnosisText}
            onChange={(e) => setDiagnosisText(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create Diagnosis</button>
      </form>
    </div>
  );
};

export default CreateDiagnosis;
