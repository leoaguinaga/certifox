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
  setRole: (role: CampusRole) => void;
  toggleRole: () => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
}

const CampusRoleContext = createContext<CampusRoleContextValue | undefined>(
  undefined
);

export function CampusRoleProvider({
  children,
  initialRole = "student",
}: {
  children: React.ReactNode;
  initialRole?: CampusRole;
}) {
  const [role, setRoleState] = useState<CampusRole>(initialRole);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const setRole = (newRole: CampusRole) => {
    setRoleState(newRole);
    localStorage.setItem("certifox_campus_role", newRole);
  };

  const toggleRole = () => {
    const nextRole = role === "student" ? "teacher" : "student";
    setRole(nextRole);
  };

  const toggleMobileNav = () => setMobileNavOpen((prev) => !prev);

  const user = role === "student" ? MOCK_STUDENT_USER : MOCK_TEACHER_USER;

  return (
    <CampusRoleContext.Provider
      value={{
        role,
        user,
        setRole,
        toggleRole,
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
