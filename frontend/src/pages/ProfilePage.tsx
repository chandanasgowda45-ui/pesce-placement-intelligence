import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Camera, Save, X } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface ProfileForm {
  full_name: string;
  phone: string;
  registration_number: string;
  department: string;
  year: string;
  section: string;
  college: string;
  skills: string;
  bio: string;
}

export default function ProfilePage() {
  const { user, profile, loading, updateProfile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileForm>({
    defaultValues: {
      full_name: "",
      phone: profile?.phone || "",
      registration_number: profile?.registration_number || "",
      department: profile?.department || "",
      year: profile?.year || "",
      section: profile?.section || "",
      college: profile?.college || "",
      skills: profile?.skills?.join(", ") || "",
      bio: profile?.bio || "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name,
        phone: profile.phone || "",
        registration_number: profile.registration_number || "",
        department: profile.department || "",
        year: profile.year || "",
        section: profile.section || "",
        college: profile.college || "",
        skills: profile.skills?.join(", ") || "",
        bio: profile.bio || "",
      });
      setProfilePhoto(profile.profile_photo || null);
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileForm) => {
    setIsSubmitting(true);
    try {
      let resumeUrl = profile?.resume_url;

      if (resumeFile && user) {
        const fileExt = resumeFile.name.split(".").pop();
        const filePath = `${user.id}/resume_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(filePath, resumeFile, { upsert: true });

        if (uploadError) {
          toast.error("Failed to upload resume");
          setIsSubmitting(false);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("resumes")
          .getPublicUrl(filePath);

        resumeUrl = publicUrl;
      }

      const skillArray = data.skills
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const { error } = await updateProfile({
        full_name: data.full_name,
        phone: data.phone,
        registration_number: data.registration_number,
        department: data.department,
        year: data.year,
        section: data.section,
        college: data.college,
        skills: skillArray,
        bio: data.bio,
        resume_url: resumeUrl || "",
      });

      if (error) {
        toast.error(error.message || "Failed to update profile");
      } else {
        toast.success("Profile updated successfully");
        setIsEditing(false);
        await refreshProfile();
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        toast.error("Failed to upload photo");
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setProfilePhoto(publicUrl);
      await updateProfile({ profile_photo: publicUrl });
      await refreshProfile();
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error("Failed to upload photo");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset({
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
      registration_number: profile?.registration_number || "",
      department: profile?.department || "",
      year: profile?.year || "",
      section: profile?.section || "",
      college: profile?.college || "",
      skills: profile?.skills?.join(", ") || "",
      bio: profile?.bio || "",
    });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto p-8">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="border-b-4 border-slate-900 pb-4">
          <h1 className="text-5xl font-black uppercase italic">User <span className="text-primary">Profile</span></h1>
        </div>

        {/* Profile Photo Section */}
        <Card className="border-2 border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profilePhoto || profile?.profile_photo} />
                  <AvatarFallback className="text-lg font-bold">
                    {getInitials(profile?.full_name || "User")}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center cursor-pointer">
                    <Camera className="h-3 w-3 text-primary-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                )}
              </div>
              <div>
                <h2 className="text-xl font-black uppercase">{profile?.full_name || "User"}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                {profile?.college && (
                  <p className="text-xs text-muted-foreground mt-1">{profile.college}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="border-2 border-slate-200">
          <CardHeader className="border-b border-slate-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-black uppercase tracking-tight">
                {isEditing ? "Edit Profile" : "Profile Information"}
              </CardTitle>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleCancel} variant="ghost" size="sm">
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    disabled={!isEditing}
                    {...register("full_name", { required: "Full name is required" })}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                  {errors.full_name && (
                    <p className="text-xs text-destructive">{errors.full_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registration_number">Registration Number / Student ID</Label>
                  <Input
                    id="registration_number"
                    disabled={!isEditing}
                    {...register("registration_number")}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    disabled={!isEditing}
                    {...register("phone")}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    disabled={!isEditing}
                    {...register("department")}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    disabled={!isEditing}
                    {...register("year")}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Input
                    id="section"
                    disabled={!isEditing}
                    {...register("section")}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="college">College</Label>
                  <Input
                    id="college"
                    disabled={!isEditing}
                    {...register("college")}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Textarea
                  id="skills"
                  disabled={!isEditing}
                  placeholder="React, Python, Machine Learning, ..."
                  {...register("skills")}
                  className={!isEditing ? "bg-muted" : ""}
                />
                <p className="text-xs text-muted-foreground">Separate skills with commas</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  {...register("bio")}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>

              {isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="resume">Resume</Label>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  />
                  {profile?.resume_url && (
                    <p className="text-xs text-muted-foreground">
                      Current: <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Resume</a>
                    </p>
                  )}
                </div>
              )}

              {isEditing && (
                <div className="flex gap-3">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button type="button" onClick={handleCancel} variant="outline" disabled={isSubmitting}>
                    Cancel
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}




