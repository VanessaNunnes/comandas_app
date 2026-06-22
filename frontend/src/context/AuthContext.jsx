import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

// Criação do contexto
const AuthContext = createContext();

// Provedor do contexto
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      if (authService.isAuthenticated()) {
        setIsAuthenticated(true);
        authService.getUserData().then(userData => {
          if (userData) {
            setUser(userData);
          }
        });
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (cpf, senha) => {
    try {
      setLoading(true);
      const result = await authService.login(cpf, senha);

      if (result.success) {
        setIsAuthenticated(true);
        const userData = await authService.getUserData();
        setUser(userData);
        navigate("/home");
        return true;
      } else {
        window.dispatchEvent(new CustomEvent('showSnackbar', {
          detail: { message: result.error, severity: 'error' }
        }));
        return false;
      }
    } catch (error) {
      console.error('Erro no login:', error);
      window.dispatchEvent(new CustomEvent('showSnackbar', {
        detail: { message: 'Erro ao conectar com o servidor', severity: 'error' }
      }));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Função para logout
  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    isTokenExpiringSoon: authService.isTokenExpiringSoon(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
