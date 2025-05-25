import { Link, NavLink, Outlet } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { logout } from '../services/authService';
import { clearToken } from '../store/tokenSlice';
import api from '../../utils/api';

function Layout() {
  const dispatch = useDispatch();
  const { token, roles } = useSelector((state) => state.token);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Fetch user data
  const fetchUserData = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await api.get('/api/v1/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Пайдаланушы мәліметтері:', response.data);
      setUser(response.data);
    } catch (err) {
      console.error('Пайдаланушы мәліметтерін алу қатесі:', err);
      setError('Пайдаланушы мәліметтерін алу қатесі: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token]);

  // Handle modal open/close
  const openProfileModal = () => {
    if (token && user) {
      setIsProfileModalOpen(true);
    }
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isProfileModalOpen) {
        closeProfileModal();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isProfileModalOpen]);

  // Focus trap for modal
  useEffect(() => {
    if (isProfileModalOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isProfileModalOpen]);

  const handleLogout = () => {
    console.log('Logging out');
    logout();
    dispatch(clearToken());
    setMenuOpen(false);
    setIsProfileModalOpen(false);
  };

  const linkClass = ({ isActive }) =>
    `transition-colors duration-200 hover:text-blue-400 ${isActive ? 'text-blue-400 font-semibold' : 'text-gray-200'
    }`;

  // Check roles
  const isUser = roles.includes('ROLE_USER');
  const isDoctor = roles.includes('ROLE_DOCTOR');

  // Animation variants
  const profileVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 text-gray-800 font-sans">
      <nav className="bg-blue-800 px-4 sm:px-6 lg:px-8 py-4 shadow-lg w-full">
        <div className="w-full flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-white tracking-tight">
            MedSafe
          </Link>

          <div className="hidden md:flex items-center space-x-8 text-sm">
            {token ? (
              <>
                {isDoctor && (
                  <>
                    <NavLink to="/home" className={linkClass}>
                      Басты бет
                    </NavLink>
                    <NavLink to="/dashboard" className={linkClass}>
                      Бақылау тақтасы
                    </NavLink>
                    <NavLink to="/audit/logs" className={linkClass}>
                      Аудит журналы
                    </NavLink>
                    <NavLink to="/diagnosis/create" className={linkClass}>
                      Диагноз құру
                    </NavLink>
                  </>
                )}
                {isUser && (
                  <>
                    <NavLink to="/diagnosis/view" className={linkClass}>
                      Диагнозды шешу
                    </NavLink>
                    <NavLink to="/diagnosis/key-generation" className={linkClass}>
                      RSA генерация
                    </NavLink>
                  </>
                )}
                <motion.div
                  className="flex items-center space-x-4"
                  initial="hidden"
                  animate="visible"
                  variants={profileVariants}
                >
                  <button
                    onClick={openProfileModal}
                    className="flex items-center bg-blue-600/50 rounded-lg px-3 py-1.5 hover:bg-blue-600/70 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
                    aria-label="Пайдаланушы профилін ашу"
                    disabled={!token || !user}
                  >
                    {loading ? (
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                      />
                    ) : (
                      <FaUserCircle className="text-white mr-2" size={20} />
                    )}
                    <div>
                      <span className="text-white font-medium text-sm truncate max-w-[150px]">
                        {user ? `${user.firstName} ${user.lastName}` : 'Пайдаланушы'}
                      </span>
                      <span className="text-gray-200 text-xs block">
                        Рөл: {roles.map(translateRole).join(', ') || 'Жоқ'}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition transform hover:scale-105"
                    aria-label="Шығу"
                  >
                    <FaSignOutAlt className="mr-2" />
                    Шығу
                  </button>
                </motion.div>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClass}>
                  Кіру
                </NavLink>
                <NavLink to="/register" className={linkClass}>
                  Тіркелу
                </NavLink>
              </>
            )}
          </div>

          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Мәзірді жабу' : 'Мәзірді ашу'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>

        {menuOpen && (
          <motion.div
            className="md:hidden mt-4 space-y-4 px-4 text-sm bg-blue-700/90 rounded-b-lg py-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {token ? (
              <>
                {isDoctor && (
                  <>
                    <NavLink
                      to="/home"
                      className={linkClass}
                      onClick={() => setMenuOpen(false)}
                    >
                      Басты бет
                    </NavLink>
                    <NavLink
                      to="/dashboard"
                      className={linkClass}
                      onClick={() => setMenuOpen(false)}
                    >
                      Бақылау тақтасы
                    </NavLink>
                    <NavLink
                      to="/audit/logs"
                      className={linkClass}
                      onClick={() => setMenuOpen(false)}
                    >
                      Аудит журналы
                    </NavLink>
                    <NavLink
                      to="/diagnosis/create"
                      className={linkClass}
                      onClick={() => setMenuOpen(false)}
                    >
                      Диагноз құру
                    </NavLink>
                  </>
                )}
                {isUser && (
                  <>
                    <NavLink
                      to="/diagnosis/view"
                      className={linkClass}
                      onClick={() => setMenuOpen(false)}
                    >
                      Диагнозды шешу
                    </NavLink>
                    <NavLink
                      to="/diagnosis/key-generation"
                      className={linkClass}
                      onClick={() => setMenuOpen(false)}
                    >
                      RSA генерация
                    </NavLink>
                  </>
                )}
                <div className="border-t border-blue-600 pt-4">
                  <button
                    onClick={() => {
                      openProfileModal();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center bg-blue-600/50 rounded-lg px-3 py-2 mb-4 hover:bg-blue-600/70 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
                    aria-label="Пайдаланушы профилін ашу"
                    disabled={!token || !user}
                  >
                    {loading ? (
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                      />
                    ) : (
                      <FaUserCircle className="text-white mr-2" size={20} />
                    )}
                    <div>
                      <span className="text-white font-medium text-sm truncate max-w-[150px]">
                        {user ? `${user.firstName} ${user.lastName}` : 'Пайдаланушы'}
                      </span>
                      <span className="text-gray-200 text-xs block">
                        Рөл: {roles.map(translateRole).join(', ') || 'Жоқ'}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition"
                    aria-label="Шығу"
                  >
                    <FaSignOutAlt className="mr-2" />
                    Шығу
                  </button>
                </div>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={linkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  Кіру
                </NavLink>
                <NavLink
                  to="/register"
                  className={linkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  Тіркелу
                </NavLink>
              </>
            )}
          </motion.div>
        )}
      </nav>

      {/* Profile Modal */}
      {isProfileModalOpen && user && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          onClick={closeProfileModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-modal-title"
        >
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            onClick={(e) => e.stopPropagation()}
            ref={modalRef}
          >
            <h2 id="profile-modal-title" className="text-2xl font-bold text-gray-800 mb-4">
              Пайдаланушы профилі
            </h2>
            <div className="space-y-3">
              <p className="text-gray-600">
                <span className="font-semibold text-blue-600">Аты:</span> {user.firstName}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold text-blue-600">Тегі:</span> {user.lastName}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold text-blue-600">Email:</span> {user.email}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold text-blue-600">Пайдаланушы аты:</span> {user.username}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold text-blue-600">Рөл:</span>{' '}
                {roles.map(translateRole).join(', ') || 'Жоқ'}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold text-blue-600">Тіркелген күні:</span>{' '}
                {new Date(user.createdAt).toLocaleDateString('kk-KZ')}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold text-blue-600">Жаңартылған күні:</span>{' '}
                {new Date(user.updatedAt).toLocaleDateString('kk-KZ')}
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                ref={closeButtonRef}
                onClick={closeProfileModal}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                aria-label="Профильді жабу"
              >
                Жабу
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
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
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;