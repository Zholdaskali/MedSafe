import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
// import { HiClipboardDocument, HiArrowDownTray } from 'react-icons/hi';
import api from '../../utils/api';

const KeyGenerationPage = () => {
  const [user, setUser] = useState(null);
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [privateKeyInput, setPrivateKeyInput] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  // Получение данных пользователя
  const fetchUserData = async () => {
    setError('');
    setIsLoading(true);
    try {
      if (!token || typeof token !== 'string' || token.trim() === '') {
        throw new Error('Жарамды JWT токені табылмады');
      }
      const response = await api.get('/api/v1/users/me', {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });
      setUser(response.data);
    } catch (err) {
      setError('Пайдаланушы мәліметтерін жүктеу кезінде қате: ' + (err.message || err));
    } finally {
      setIsLoading(false);
    }
  };

  // Генерация пары ключей
  const generateKeys = async () => {
    setError('');
    setSuccess('');
    setPublicKey('');
    setPrivateKey('');
    setIsLoading(true);
    try {
      if (!token || typeof token !== 'string' || token.trim() === '') {
        throw new Error('Жарамды JWT токені табылмады');
      }
      if (!user || !user.userId) {
        throw new Error('Пайдаланушы мәліметтері жүктелмеді');
      }
      const response = await api.post(
        `/api/security-keys/generate/${user.userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token.trim()}` },
        }
      );
      setPublicKey(response.data.publicKey);
      setPrivateKey(response.data.privateKey);
      setSuccess('Кілттер жұбы сәтті генерацияланды!');
    } catch (err) {
      const errorMessage =
        err.response?.status === 400
          ? 'Сұраудың қате форматы. Деректерді тексеріңіз.'
          : err.response?.status === 403
            ? 'Рұқсат жоқ: кілттерді генерациялауға құқық жеткіліксіз'
            : `Кілттерді генерациялау кезінде қате: ${err.message || err}`;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Получение публичного ключа
  const fetchPublicKey = async () => {
    setError('');
    setSuccess('');
    setPublicKey('');
    setIsLoading(true);
    try {
      if (!token || typeof token !== 'string' || token.trim() === '') {
        throw new Error('Жарамды JWT токені табылмады');
      }
      if (!user || !user.userId) {
        throw new Error('Пайдаланушы мәліметтері жүктелмеді');
      }
      const response = await api.get(
        `/api/security-keys/public/${user.userId}`,
        {
          headers: { Authorization: `Bearer ${token.trim()}` },
        }
      );
      setPublicKey(response.data);
      setSuccess('Ашық кілт сәтті алынды!');
    } catch (err) {
      const errorMessage =
        err.response?.status === 404
          ? 'Ашық кілт осы пайдаланушы үшін табылмады'
          : err.response?.status === 403
            ? 'Рұқсат жоқ: кілтті алуға құқық жеткіліксіз'
            : `Ашық кілтті алу кезінде қате: ${err.message || err}`;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Проверка валидности приватного ключа
  const validatePrivateKey = async () => {
    setError('');
    setSuccess('');
    setValidationResult(null);
    setIsLoading(true);
    try {
      if (!token || typeof token !== 'string' || token.trim() === '') {
        throw new Error('Жарамды JWT токені табылмады');
      }
      if (!user || !user.userId) {
        throw new Error('Пайдаланушы мәліметтері жүктелмеді');
      }
      if (!privateKeyInput) {
        throw new Error('Тексеру үшін жеке кілтті енгізіңіз');
      }
      const response = await api.post(
        `/api/security-keys/validate`,
        {
          privateKey: privateKeyInput,
          userId: user.userId,
        },
        {
          headers: { Authorization: `Bearer ${token.trim()}` },
        }
      );
      setValidationResult(response.data);
      setSuccess(response.data ? 'Жеке кілт жарамды!' : 'Жеке кілт жарамсыз.');
    } catch (err) {
      const errorMessage =
        err.response?.status === 400
          ? 'Сұраудың қате форматы. Деректерді тексеріңіз.'
          : err.response?.status === 403
            ? 'Рұқсат жоқ: кілтті тексеруге құқық жеткіліксіз'
            : `Жеке кілтті тексеру кезінде қате: ${err.message || err}`;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Копирование ключа в буфер обмена
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Кілт алмасу буферіне көшірілді!');
  };

  // Скачивание ключа как файла
  const downloadKey = (key, filename) => {
    const blob = new Blob([key], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex flex-col">
      <motion.section
        className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        aria-labelledby="keygen-heading"
      >
        <h1
          id="keygen-heading"
          className="text-4xl md:text-5xl font-bold tracking-tight text-center text-gray-800 mb-10"
        >
          RSA кілттерін генерациялау және басқару
        </h1>

        {/* Alerts */}
        {error && (
          <motion.div
            className="border-l-4 border-red-500 bg-red-50 text-red-800 p-4 rounded-lg mb-10 text-center w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            aria-live="polite"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            className="border-l-4 border-green-500 bg-green-50 text-green-800 p-4 rounded-lg mb-10 text-center w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            aria-live="polite"
          >
            {success}
          </motion.div>
        )}

        {isLoading && (
          <div className="text-center text-gray-600 mb-10">Жүктелуде...</div>
        )}

        {/* Generated Keys */}
        {(publicKey || privateKey) && (
          <motion.div
            className="bg-gradient-to-b from-white to-gray-50 p-8 rounded-2xl shadow-xl mb-10 w-full hover:shadow-2xl transition-shadow"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-2xl font-semibold text-blue-700 mb-6">
              Генерацияланған кілттер
            </h2>
            <div className="space-y-6">
              {publicKey && (
                <div>
                  <label
                    className="block text-gray-900 font-medium mb-2"
                    id="generatedPublicKey-label"
                  >
                    Ашық кілт
                  </label>
                  <textarea
                    value={publicKey}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="6"
                    aria-describedby="generatedPublicKey-label"
                    aria-label="Генерацияланған ашық кілт"
                  />
                  <div className="mt-3 flex gap-3">
                    <motion.button
                      onClick={() => copyToClipboard(publicKey)}
                      className="flex items-center bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                      variants={buttonVariants}
                      aria-label="Генерацияланған ашық кілтті көшіру үшін батырманы басыңыз"
                    >
                      {/* <HiClipboardDocument className="mr-2 h-5 w-5" /> */}
                      Көшіру
                    </motion.button>
                    <motion.button
                      onClick={() => downloadKey(publicKey, 'public_key.pem')}
                      className="flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      variants={buttonVariants}
                      aria-label="Генерацияланған ашық кілтті жүктеу үшін батырманы басыңыз"
                    >
                      {/* <HiArrowDownTray className="mr-2 h-5 w-5" /> */}
                      Жүктеу
                    </motion.button>
                  </div>
                </div>
              )}
              {privateKey && (
                <div>
                  <label
                    className="block text-gray-900 font-medium mb-2"
                    id="generatedPrivateKey-label"
                  >
                    Жеке кілт
                  </label>
                  <textarea
                    value={privateKey}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="6"
                    aria-describedby="generatedPrivateKey-label"
                    aria-label="Генерацияланған жеке кілт"
                  />
                  <div className="mt-3 flex gap-3">
                    <motion.button
                      onClick={() => copyToClipboard(privateKey)}
                      className="flex items-center bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                      variants={buttonVariants}
                      aria-label="Генерацияланған жеке кілтті көшіру үшін батырманы басыңыз"
                    >
                      {/* <HiClipboardDocument className="mr-2 h-5 w-5" /> */}
                      Көшіру
                    </motion.button>
                    <motion.button
                      onClick={() => downloadKey(privateKey, 'private_key.pem')}
                      className="flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      variants={buttonVariants}
                      aria-label="Генерацияланған жеке кілтті жүктеу үшін батырманы басыңыз"
                    >
                      {/* <HiArrowDownTray className="mr-2 h-5 w-5" /> */}
                      Жүктеу
                    </motion.button>
                  </div>
                  <p className="text-red-600 text-sm mt-3">
                    Жеке кілтті қауіпсіз жерде сақтаңыз. Ол қайта көрсетілмейді!
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* User Information */}
        {user && (
          <motion.div
            className="bg-gradient-to-b from-white to-gray-50 p-8 rounded-2xl shadow-xl mb-10 w-full hover:shadow-2xl transition-shadow"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-2xl font-semibold text-blue-700 mb-6">
              Пайдаланушы мәліметтері
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-900 font-medium">Аты:</p>
                <p className="text-gray-600">{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <p className="text-gray-900 font-medium">Email:</p>
                <p className="text-gray-600">{user.email}</p>
              </div>
              <div>
                <p className="text-gray-900 font-medium">Пайдаланушы аты:</p>
                <p className="text-gray-600">{user.username}</p>
              </div>
              <div>
                <p className="text-gray-900 font-medium">Рөлдер:</p>
                <p className="text-gray-600">
                  {user.roles?.map((role) => translateRole(role.roleName)).join(', ') || 'Рөлдер жоқ'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <hr className="border-t border-gray-200 my-8" />

        {/* Key Generation */}
        <motion.div
          className="bg-gradient-to-b from-white to-gray-50 p-8 rounded-2xl shadow-xl mb-10 w-full hover:shadow-2xl transition-shadow"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl font-semibold text-blue-700 mb-6">
            Кілттер жұбын жасау
          </h2>
          <p className="text-gray-600 mb-6">
            Ағымдағы пайдаланушы үшін жаңа RSA кілттер жұбын генерациялау үшін төмендегі батырманы басыңыз.
          </p>
          <motion.button
            onClick={generateKeys}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!user || isLoading}
            variants={buttonVariants}
            aria-label="Кілттерді генерациялау үшін батырманы басыңыз"
          >
            {isLoading ? 'Генерациялануда...' : 'Кілттерді генерациялау'}
          </motion.button>
        </motion.div>

        <hr className="border-t border-gray-200 my-8" />

        {/* Fetch Public Key */}
        <motion.div
          className="bg-gradient-to-b from-white to-gray-50 p-8 rounded-2xl shadow-xl mb-10 w-full hover:shadow-2xl transition-shadow"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl font-semibold text-blue-700 mb-6">
            Ашық кілтті алу
          </h2>
          <p className="text-gray-600 mb-6">
            Бар ашық кілтті алу үшін төмендегі батырманы басыңыз.
          </p>
          <motion.button
            onClick={fetchPublicKey}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!user || isLoading}
            variants={buttonVariants}
            aria-label="Ашық кілтті алу үшін батырманы басыңыз"
          >
            {isLoading ? 'Алынуда...' : 'Ашық кілтті алу'}
          </motion.button>
          {publicKey && (
            <div className="mt-6">
              <label
                className="block text-gray-900 font-medium mb-2"
                id="publicKey-label"
              >
                Ашық кілт
              </label>
              <textarea
                value={publicKey}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="6"
                aria-describedby="publicKey-label"
                aria-label="Ашық кілт"
              />
              <div className="mt-3 flex gap-3">
                <motion.button
                  onClick={() => copyToClipboard(publicKey)}
                  className="flex items-center bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                  variants={buttonVariants}
                  aria-label="Ашық кілтті көшіру үшін батырманы басыңыз"
                >
                  {/* <HiClipboardDocument className="mr-2 h-5 w-5" /> */}
                  Көшіру
                </motion.button>
                <motion.button
                  onClick={() => downloadKey(publicKey, 'public_key.pem')}
                  className="flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  variants={buttonVariants}
                  aria-label="Ашық кілтті жүктеу үшін батырманы басыңыз"
                >
                  {/* <HiArrowDownTray className="mr-2 h-5 w-5" /> */}
                  Жүктеу
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>

        <hr className="border-t border-gray-200 my-8" />

        {/* Validate Private Key */}
        <motion.div
          className="bg-gradient-to-b from-white to-gray-50 p-8 rounded-2xl shadow-xl mb-10 w-full hover:shadow-2xl transition-shadow"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl font-semibold text-blue-700 mb-6">
            Жеке кілтті тексеру
          </h2>
          <p className="text-gray-600 mb-6">
            Жеке кілтті енгізіңіз және оның жарамдылығын тексеру үшін батырманы басыңыз.
          </p>
          <textarea
            value={privateKeyInput}
            onChange={(e) => setPrivateKeyInput(e.target.value)}
            placeholder="Жеке кілтті енгізіңіз..."
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="6"
            aria-label="Жеке кілтті енгізу"
          />
          <motion.button
            onClick={validatePrivateKey}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!user || !privateKeyInput || isLoading}
            variants={buttonVariants}
            aria-label="Жеке кілтті тексеру үшін батырманы басыңыз"
          >
            {isLoading ? 'Тексерілуде...' : 'Кілтті тексеру'}
          </motion.button>
          {validationResult !== null && (
            <p
              className={`mt-4 text-sm ${
                validationResult ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {validationResult ? 'Жеке кілт жарамды.' : 'Жеке кілт жарамсыз.'}
            </p>
          )}
        </motion.div>
      </motion.section>
    </div>
  );
};

export default KeyGenerationPage;