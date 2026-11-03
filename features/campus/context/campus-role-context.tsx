"use client";

import React, { createContext, useContext, useState } from "react";
import {
  CampusRole,
  CampusUserProfile,
  MOCK_STUDENT_USER,
  MOCK_TEACHER_USER,
} from "../types";

interface CampusRoleContextValue {
  role: CampusRole;
  user: CampusUserProfile;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
}

const CampusRoleContext = createContext<CampusRoleContextValue | undefined>(
  undefined
);

interface CampusRoleProviderProps {
  children: React.ReactNode;
  initialRole?: CampusRole;
  initialUser?: Partial<CampusUserProfile>;
}

export function CampusRoleProvider({
  children,
  initialRole = "student",
  initialUser,
}: CampusRoleProviderProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const toggleMobileNav = () => setMobileNavOpen((prev) => !prev);

  // A4: El rol proviene estrictamente de la sesión real, sin toggles arbitrarios
  const fallbackProfile = initialRole === "teacher" ? MOCK_TEACHER_USER : MOCK_STUDENT_USER;
  const user: CampusUserProfile = {
    ...fallbackProfile,
    ...initialUser,
    name: initialUser?.name || fallbackProfile.name,
    email: initialUser?.email || fallbackProfile.email,
    roleLabel: initialRole === "teacher" ? "Docente Verificado" : "Estudiante Regular",
  };

  return (
    <CampusRoleContext.Provider
      value={{
        role: initialRole,
        user,
        mobileNavOpen,
        setMobileNavOpen,
        toggleMobileNav,
      }}
    >
      {children}
    </CampusRoleContext.Provider>
  );
}

export function useCampusRole() {
  const context = useContext(CampusRoleContext);
  if (!context) {
    throw new Error("useCampusRole must be used within a CampusRoleProvider");
  }
  return context;
}
