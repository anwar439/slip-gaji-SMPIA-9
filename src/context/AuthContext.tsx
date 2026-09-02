import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee, UserRole } from '../types';
import { INITIAL_EMPLOYEES } from '../data/mockData';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employee?: Employee;
}

interface AuthContextType {
  role: UserRole;
  isLoggedIn: boolean;
  currentUser: AuthUser;
  currentEmployee: Employee | null;
  employees: Employee[];
  setRole: (role: UserRole) => void;
  switchEmployee: (employeeId: string) => void;
  loginAsAdmin: () => void;
  loginAsEmployee: (nipOrEmail: string) => boolean;
  loginWithCredentials: (usernameOrNip: string, password: string, roleType: UserRole) => { success: boolean; message: string };
  logout: () => void;
  isSwitcherOpen: boolean;
  setIsSwitcherOpen: (open: boolean) => void;
}

const DEFAULT_ADMIN_USERS: Record<string, { id: string; name: string; email: string; pass: string }> = {
  kepsek123: {
    id: 'admin-kepsek',
    name: 'Amirudin, M.Pd. (Kepala Sekolah)',
    email: 'kepala.sekolah@smpia9.sch.id',
    pass: 'kepsek123456',
  },
  wakasek123: {
    id: 'admin-wakasek',
    name: 'Wakil Kepala Sekolah (Kurikulum & SDM)',
    email: 'wakasek@smpia9.sch.id',
    pass: 'wakasek123456',
  },
  admin: {
    id: 'admin-tu',
    name: 'Dwi Marjuki, S.Kom. (Admin TU & Kepegawaian)',
    email: 'admin.smpia9@al-azhar.sch.id',
    pass: 'admin',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'slip_gaji_auth_session_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('employee');
  const [activeAdminKey, setActiveAdminKey] = useState<string>('kepsek123');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        return parsed.isLoggedIn ?? true;
      }
    } catch {
      // Ignore
    }
    return true; // Keep logged in by default for preview, can logout to test login page
  });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('emp-guru-1'); // Amirudin, M.Pd.
  const [isSwitcherOpen, setIsSwitcherOpen] = useState<boolean>(false);
  const [employeesList, setEmployeesList] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem('slip_gaji_employees_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return INITIAL_EMPLOYEES;
  });

  // Load from local storage if exists
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (parsed.role) setRoleState(parsed.role);
        if (parsed.employeeId) setSelectedEmployeeId(parsed.employeeId);
        if (parsed.adminKey) setActiveAdminKey(parsed.adminKey);
        if (typeof parsed.isLoggedIn === 'boolean') setIsLoggedIn(parsed.isLoggedIn);
      }
    } catch {
      // Ignore
    }

    const checkEmployees = () => {
      try {
        const savedEmp = localStorage.getItem('slip_gaji_employees_v1');
        if (savedEmp) {
          const parsed = JSON.parse(savedEmp);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setEmployeesList(parsed);
          }
        }
      } catch {
        // Ignore
      }
    };

    window.addEventListener('storage', checkEmployees);
    return () => window.removeEventListener('storage', checkEmployees);
  }, []);

  const saveSession = (newRole: UserRole, empId: string, loggedIn: boolean = true, adminKey: string = activeAdminKey) => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ role: newRole, employeeId: empId, isLoggedIn: loggedIn, adminKey }));
    } catch {
      // Ignore
    }
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    saveSession(newRole, selectedEmployeeId, isLoggedIn, activeAdminKey);
  };

  const switchEmployee = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setRoleState('employee');
    setIsLoggedIn(true);
    saveSession('employee', employeeId, true, activeAdminKey);
  };

  const loginAsAdmin = () => {
    setRoleState('admin');
    setIsLoggedIn(true);
    saveSession('admin', selectedEmployeeId, true, activeAdminKey);
  };

  const loginAsEmployee = (nipOrEmail: string): boolean => {
    const cleanInput = nipOrEmail.toLowerCase().trim();
    const found = employeesList.find(
      (e) => (e.nip && e.nip.toLowerCase().trim() === cleanInput) || (e.email && e.email.toLowerCase().trim() === cleanInput)
    );
    if (found) {
      setSelectedEmployeeId(found.id);
      setRoleState('employee');
      setIsLoggedIn(true);
      saveSession('employee', found.id, true, activeAdminKey);
      return true;
    }
    return false;
  };

  const loginWithCredentials = (usernameOrNip: string, password: string, roleType: UserRole): { success: boolean; message: string } => {
    const cleanUser = usernameOrNip.toLowerCase().trim();
    const cleanPass = password.trim();

    if (!cleanUser) {
      return { success: false, message: 'Harap masukkan ID Pengguna atau NIP.' };
    }
    if (!cleanPass) {
      return { success: false, message: 'Harap masukkan Password.' };
    }

    if (roleType === 'admin') {
      // Check Admin 1: kepsek123
      if (cleanUser === 'kepsek123') {
        if (cleanPass === 'kepsek123456') {
          setActiveAdminKey('kepsek123');
          setRoleState('admin');
          setIsLoggedIn(true);
          saveSession('admin', selectedEmployeeId, true, 'kepsek123');
          return { success: true, message: 'Selamat datang, Bapak Amirudin, M.Pd. (Kepala Sekolah).' };
        }
        return { success: false, message: 'Password Admin Kepala Sekolah salah. (Pass: kepsek123456)' };
      }

      // Check Admin 2: wakasek123
      if (cleanUser === 'wakasek123') {
        if (cleanPass === 'wakasek123456') {
          setActiveAdminKey('wakasek123');
          setRoleState('admin');
          setIsLoggedIn(true);
          saveSession('admin', selectedEmployeeId, true, 'wakasek123');
          return { success: true, message: 'Selamat datang, Wakil Kepala Sekolah (Kurikulum & SDM).' };
        }
        return { success: false, message: 'Password Admin Wakasek salah. (Pass: wakasek123456)' };
      }

      // Fallback standard admin account
      if (
        (cleanUser === 'admin' || cleanUser === 'admin.smpia9' || cleanUser === 'admin@alazhar.sch.id' || cleanUser === 'admin.payroll@alazhar.sch.id') &&
        (cleanPass === 'admin' || cleanPass === 'admin123' || cleanPass === 'alazhar9')
      ) {
        setActiveAdminKey('admin');
        setRoleState('admin');
        setIsLoggedIn(true);
        saveSession('admin', selectedEmployeeId, true, 'admin');
        return { success: true, message: 'Berhasil login sebagai Administrator TU.' };
      }

      return { success: false, message: 'Akun Admin tidak ditemukan atau Password salah. Gunakan akun kepsek123 atau wakasek123.' };
    }

    // Employee credential check: username is NIP or Email
    const found = employeesList.find(
      (e) =>
        (e.nip && e.nip.toLowerCase().trim() === cleanUser) ||
        (e.email && e.email.toLowerCase().trim() === cleanUser)
    );

    if (!found) {
      return { success: false, message: `Pegawai dengan NIP/Email "${usernameOrNip}" tidak ditemukan dalam sistem.` };
    }

    // Check employee password
    const expectedPassword = found.password || found.nip || '123456';
    if (cleanPass === expectedPassword || cleanPass === found.nip || cleanPass === '123456') {
      setSelectedEmployeeId(found.id);
      setRoleState('employee');
      setIsLoggedIn(true);
      saveSession('employee', found.id, true, activeAdminKey);
      return { success: true, message: `Selamat datang kembali, ${found.name}!` };
    }

    return { success: false, message: 'Password salah. Pastikan menggunakan password yang telah didaftarkan Admin (default: NIP Anda).' };
  };

  const logout = () => {
    setIsLoggedIn(false);
    saveSession(role, selectedEmployeeId, false, activeAdminKey);
  };

  const currentEmployee = employeesList.find((e) => e.id === selectedEmployeeId) || employeesList[0] || INITIAL_EMPLOYEES[0];

  const currentAdminData = DEFAULT_ADMIN_USERS[activeAdminKey] || DEFAULT_ADMIN_USERS.kepsek123;

  const currentUser: AuthUser =
    role === 'admin'
      ? {
          id: currentAdminData.id,
          name: currentAdminData.name,
          email: currentAdminData.email,
          role: 'admin',
        }
      : {
          id: currentEmployee.id,
          name: currentEmployee.name,
          email: currentEmployee.email,
          role: 'employee',
          employee: currentEmployee,
        };

  return (
    <AuthContext.Provider
      value={{
        role,
        isLoggedIn,
        currentUser,
        currentEmployee,
        employees: employeesList,
        setRole,
        switchEmployee,
        loginAsAdmin,
        loginAsEmployee,
        loginWithCredentials,
        logout,
        isSwitcherOpen,
        setIsSwitcherOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
