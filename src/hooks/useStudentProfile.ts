import { useState, useEffect } from "react";

export interface StudentProfile {
  skills: string[];
  cgpa: number;
  interests: ("growth" | "wlb" | "tech" | "stability")[];
  goal: "startup" | "corporate" | "marquee";
}

const DEFAULT_PROFILE: StudentProfile = {
  skills: ["React", "JavaScript", "Python"],
  cgpa: 8.5,
  interests: ["tech", "growth"],
  goal: "corporate",
};

export function useStudentProfile() {
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem("student_profile");
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const updateProfile = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    localStorage.setItem("student_profile", JSON.stringify(newProfile));
  };

  return { profile, updateProfile };
}
