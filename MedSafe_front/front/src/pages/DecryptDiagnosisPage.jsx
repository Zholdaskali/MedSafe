import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import api from '../../utils/api';

const DecryptDiagnosisPage = () => {
  const [user, setUser] = useState(null);
  const [diagnoses, setDiagnoses] = useState([]);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [decryptedDiagnosis, setDecryptedDiagnosis] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useSelector((state) => state.token);

  // Перевод ролей
  const translateRole = (role) => {
    switch (role) {
      case 'ROLE_USER':
        return 'Науқас';
      case 'ROLE_DOCTOR':
        return 'Дәрігер';
      default:
        return role;
    }
  };

  // Получение заголовков авторизации
  const getAuthHeaders = () => {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      throw new Error('Жарамды JWT токені табылмады');
    }
    return { Authorization: `Bearer ${token.trim()}` };
  };

  // Получение данных пользователя
  const fetchUserData = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await api.get('/api/v1/users/me', {
        headers: getAuthHeaders(),
      });
      console.log('Пайдаланушы мәліметтері:', response.data);
      setUser(response.data);
    } catch (err) {
      console.error('Пайдаланушы мәліметтерін жүктеу қатесі:', err);
      setError('Пайдаланушы мәліметтерін жүктеу кезінде қате: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  // Получение списка диагнозов
  const fetchDiagnoses = async () => {
    if (!user || !user.userId) {
      console.warn('Пайдаланушы немесе userId жоқ');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await api.get(`/api/v1/diagnosis/${user.userId}`, {
        headers: getAuthHeaders(),
      });
      console.log('Алынған диагноздар:', response.data);
      response.data.forEach((diagnosis, index) => {
        if (!diagnosis.diagnosis) {
          console.warn(`Диагноз ${index} (ID: ${diagnosis.diagnosisId}) diagnosis өрісін қамтымайды`);
        }
      });
      setDiagnoses(response.data);
      if (response.data.length === 0) {
        setSuccess('Бұл пайдаланушы үшін диагноздар табылмады.');
      }
    } catch (err) {
      console.error('Диагноздарды жүктеу қатесі:', err);
      setError(`Диагноздарды жүктеу кезінде қате: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  // Обработка загрузки файла с приватным ключом
  const handlePrivateKeyFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.warn('Файл таңдалмады');
      setError('Жеке кілт файлы таңдаңыз.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      let keyContent = event.target.result?.trim();
      console.log('Жеке кілттің шикі мазмұны:', keyContent);

      if (!keyContent) {
        setError('Жеке кілт файлы бос немесе қате.');
        return;
      }

      const hasPemHeaders = keyContent.includes('-----BEGIN PRIVATE KEY-----') && keyContent.includes('-----END PRIVATE KEY-----');
      if (!hasPemHeaders) {
        keyContent = `-----BEGIN PRIVATE KEY-----\n${keyContent}\n-----END PRIVATE KEY-----`;
      }

      keyContent = keyContent.replace(/\r\n|\n|\r/g, '\n').trim();
      setPrivateKey(keyContent);
      setSuccess('Жеке кілт сәтті жүктелді.');
      console.log('Орнатылған privateKey:', keyContent.substring(0, 50) + '...');
    };
    reader.onerror = () => {
      console.error('Файлды оқу қатесі');
      setError('Жеке кілт файлы оқу кезінде қате.');
    };
    reader.readAsText(file);
  };

  // Обработка выбора диагноза
  const handleDiagnosisSelect = (diagnosis) => {
    if (!diagnosis.diagnosis) {
      setError('Таңдалған диагнозда шифрленген деректер жоқ.');
      return;
    }
    const newSelection = selectedDiagnosis === diagnosis.diagnosis ? '' : diagnosis.diagnosis;
    setSelectedDiagnosis(newSelection);
    console.log('Таңдалған диагноз:', newSelection || 'таңдау қалпына келтірілді');
  };

  // Обработка клавиш для выбора диагноза
  const handleDiagnosisKeyDown = (e, diagnosis) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDiagnosisSelect(diagnosis);
    }
  };

  // Расшифровка выбранного диагноза
  const decryptDiagnosis = async () => {
    setError('');
    setSuccess('');
    setDecryptedDiagnosis('');
    if (!selectedDiagnosis) {
      setError('Тізімнен диагнозды таңдаңыз.');
      return;
    }
    if (!privateKey.trim()) {
      setError('Жеке кілтті жүктеңіз.');
      return;
    }
    setLoading(true);
    try {
      console.log('Шешуге жіберілетін сұрау:', { encryptedDiagnosis: selectedDiagnosis, privateKey });
      const response = await api.post(
        '/api/v1/diagnosis/decrypt',
        {
          encryptedDiagnosis: selectedDiagnosis,
          privateKey,
        },
        {
          headers: getAuthHeaders(),
        }
      );
      console.log('Шешілген диагноз:', response.data);
      setDecryptedDiagnosis(response.data.decryptedDiagnosis || response.data);
      setSuccess('Диагноз сәтті шешілді!');
    } catch (err) {
      console.error('Шешу қатесі:', err);
      setError(err.response?.data?.message || `Шешу кезінде қате: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  // Скачивание расшифрованного диагноза
  const downloadDecryptedDiagnosis = () => {
    if (!decryptedDiagnosis) {
      setError('Жүктеуге деректер жоқ.');
      return;
    }
    const blob = new Blob([decryptedDiagnosis], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `decrypted_diagnosis_${new Date().toISOString()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setSuccess('Шешілген диагноз жүктелді!');
  };

  // Загрузка данных пользователя при монтировании
  useEffect(() => {
    fetchUserData();
  }, []);

  // Загрузка диагнозов при получении userId
  useEffect(() => {
    if (user && user.userId) {
      fetchDiagnoses();
    }
  }, [user]);

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex flex-col">
      <motion.section
        className="w-full px-4 sm:px-6 lg:px-8 py-8"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        aria-labelledby="decrypt-heading"
      >
        <h1 id="decrypt-heading" className="text-3xl font-bold text-center text-gray-800 mb-8">
          Диагнозды шешу
        </h1>

        {/* Сообщение об ошибке */}
        {error && (
          <motion.div
            className="bg-red-100 text-red-700 p-4 rounded-lg mb-8 text-center w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}

        {/* Сообщение об успехе */}
        {success && (
          <motion.div
            className="bg-green-100 text-green-700 p-4 rounded-lg mb-8 text-center w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {success}
          </motion.div>
        )}

        {/* Информация о пользователе */}
        {user && (
          <motion.div
            className="bg-white p-6 rounded-xl shadow-lg mb-8 w-full"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">
              Пайдаланушы мәліметтері
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-800 font-semibold">Аты:</p>
                <p className="text-gray-600">{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <p className="text-gray-800 font-semibold">Email:</p>
                <p className="text-gray-600">{user.email}</p>
              </div>
              <div>
                <p className="text-gray-800 font-semibold">Пайдаланушы аты:</p>
                <p className="text-gray-600">{user.username}</p>
              </div>
              <div>
                <p className="text-gray-800 font-semibold">Рөлдер:</p>
                <p className="text-gray-600">
                  {user.roles?.map((role) => translateRole(role.roleName)).join(', ') || 'Рөлдер жоқ'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Индикатор загрузки */}
        {loading && (
          <div className="text-center text-gray-600 mb-8">Жүктелуде...</div>
        )}

        {/* Список диагнозов с checkbox */}
        {diagnoses.length > 0 && (
          <motion.div
            className="bg-white p-6 rounded-xl shadow-lg mb-8 w-full"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">
              Сіздің диагноздарыңыз
            </h2>
            <ul className="space-y-2">
              {diagnoses.map((diagnosis) => (
                <li
                  key={diagnosis.diagnosisId}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  tabIndex="0"
                  onKeyDown={(e) => handleDiagnosisKeyDown(e, diagnosis)}
                  role="button"
                >
                  <input
                    type="checkbox"
                    id={`diagnosis-${diagnosis.diagnosisId}`}
                    checked={selectedDiagnosis === diagnosis.diagnosis}
                    onChange={() => handleDiagnosisSelect(diagnosis)}
                    className="mr-2 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    aria-label={`Диагнозды таңдау, күні: ${new Date(diagnosis.diagnosisDate).toLocaleDateString('kk-KZ')}`}
                  />
                  <label
                    htmlFor={`diagnosis-${diagnosis.diagnosisId}`}
                    className="cursor-pointer text-gray-800"
                  >
                    <span className="font-medium">Күні:</span>{' '}
                    {new Date(diagnosis.diagnosisDate).toLocaleDateString('kk-KZ')} (ID: {diagnosis.diagnosisId})
                  </label>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Форма для расшифровки */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow-lg mb-8 w-full"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">
            Диагнозды шешу
          </h2>
          <div className="mb-4">
            <label
              htmlFor="privateKey"
              className="block text-gray-800 font-semibold mb-2"
              id="privateKey-label"
            >
              Жеке кілтті жүктеңіз
            </label>
            <input
              id="privateKey"
              type="file"
              accept=".pem,.txt,.rem"
              onChange={handlePrivateKeyFileUpload}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-describedby="privateKey-label"
              aria-label="Жеке кілтті жүктеу"
            />
          </div>
          <button
            onClick={decryptDiagnosis}
            disabled={loading || !selectedDiagnosis || !privateKey.trim()}
            className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Диагнозды шешу"
          >
            {loading ? 'Шешілуде...' : 'Диагнозды шешу'}
          </button>
        </motion.div>

        {/* Расшифрованный диагноз */}
        {decryptedDiagnosis && (
          <motion.div
            className="bg-white p-6 rounded-xl shadow-lg w-full"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">
              Шешілген диагноз
            </h2>
            <textarea
              readOnly
              value={decryptedDiagnosis}
              rows={6}
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"
              aria-label="Шешілген диагноз"
            />
            <button
              onClick={downloadDecryptedDiagnosis}
              className="mt-4 w-full py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Шешілген диагнозды жүктеу"
            >
              Шешілген диагнозды жүктеу
            </button>
          </motion.div>
        )}
      </motion.section>
    </div>
  );
};

export default DecryptDiagnosisPage;