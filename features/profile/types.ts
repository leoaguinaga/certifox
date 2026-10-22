export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "INSTRUCTOR";
  documentType: string;
  documentNumberMasked: string;
  institution: string;
  avatarUrl: string;
  createdAt: string;
}

export interface UpdateProfileInput {
  name: string;
  institution?: string;
  avatarUrl?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}
