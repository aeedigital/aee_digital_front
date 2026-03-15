"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getPrimaryRole, normalizeRoles, type UserRole } from "@/lib/access-control";

// Definição do tipo para o usuário
export interface User {
  _id: string;
  user: string;
  pass: string;
  role: UserRole;
  groups: UserRole[];
  scope?: string;
}

// Definição do tipo do contexto
interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

// Criando o contexto com valores padrão
const UserContext = createContext<UserContextType | undefined>(undefined);

// Criando o Provider para envolver a aplicação
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Recuperar usuário do localStorage ao carregar a página
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser) as Partial<User> & { role?: string; groups?: string[] };
      const groups = normalizeRoles(parsedUser.groups?.length ? parsedUser.groups : parsedUser.role);
      const role = getPrimaryRole(groups);

      if (parsedUser._id && parsedUser.user && parsedUser.pass && role) {
        setUser({
          _id: parsedUser._id,
          user: parsedUser.user,
          pass: parsedUser.pass,
          role,
          groups,
          scope: parsedUser.scope,
        });
      }
    }
  }, []);

  // Atualizar usuário e salvar no localStorage
  const updateUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("user");
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser: updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

// Hook para acessar o contexto do usuário
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser deve ser usado dentro de UserProvider");
  }
  return context;
}
