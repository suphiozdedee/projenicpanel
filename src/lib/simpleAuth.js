
// Simple authentication utility with hardcoded credentials

export const login = async (username, password) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  if (username === 'admin' && password === '344363') {
    const user = { 
      username: 'admin',
      full_name: 'System Admin',
      role: 'admin',
      id: 'local-admin-id'
    };
    localStorage.setItem('simple_auth_user', JSON.stringify(user));
    return { success: true, user };
  }
  
  return { success: false, error: 'Invalid credentials' };
};

export const logout = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  localStorage.removeItem('simple_auth_user');
  return { success: true };
};

export const isAuthenticated = () => {
  const user = localStorage.getItem('simple_auth_user');
  return !!user;
};

export const getSession = () => {
  const userStr = localStorage.getItem('simple_auth_user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      localStorage.removeItem('simple_auth_user');
      return null;
    }
  }
  return null;
};
