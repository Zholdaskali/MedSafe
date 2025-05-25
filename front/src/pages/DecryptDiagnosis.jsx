import React, { useState } from "react";
import axios from "axios";

const DecryptDiagnosis = () => {
  const [encryptedDiagnosis, setEncryptedDiagnosis] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [decryptedDiagnosis, setDecryptedDiagnosis] = useState("");

  // Функция для отправки запроса на сервер для расшифровки диагноза
  const handleDecrypt = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/diagnosis/decrypt", {
        encryptedDiagnosis,
        privateKey,
      });
      setDecryptedDiagnosis(response.data);  // Получаем расшифрованный текст
    } catch (error) {
      console.error("Error decrypting diagnosis:", error);
      setDecryptedDiagnosis("Error decrypting diagnosis.");
    }
  };

  return (
    <div>
      <h2>Decrypt Diagnosis</h2>
      <form onSubmit={handleDecrypt}>
        <div>
          <label>Encrypted Diagnosis:</label>
          <textarea
            value={encryptedDiagnosis}
            onChange={(e) => setEncryptedDiagnosis(e.target.value)}
            placeholder="Enter encrypted diagnosis text"
            required
          />
        </div>
        <div>
          <label>Private Key:</label>
          <textarea
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder="Enter your private key"
            required
          />
        </div>
        <button type="submit">Decrypt Diagnosis</button>
      </form>

      {decryptedDiagnosis && (
        <div>
          <h3>Decrypted Diagnosis</h3>
          <p>{decryptedDiagnosis}</p>
        </div>
      )}
    </div>
  );
};

export default DecryptDiagnosis;
