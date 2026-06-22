"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { ProtectedRoute } from "../../components/layout/ProtectedRoute";
import { useAuth } from "../../hooks/useAuth";
import { Avatar } from "../../components/ui/Avatar";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { userService } from "../../services/userService";

function ProfileContent() {
  const { user, updateLocalUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(user?.name ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!user) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedUser = await userService.updateProfile({
        name: name.trim(),
        avatar: avatar.trim() || undefined,
      });
      updateLocalUser(updatedUser);
      setSuccessMessage("Profile updated successfully");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to update profile. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
        <button
          onClick={() => router.push("/chat")}
          className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Back to chats"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">Your profile</h1>
      </div>

      <div className="mx-auto max-w-md px-4 py-8">
        <div className="mb-6 flex flex-col items-center">
          <Avatar name={user.name} src={avatar || user.avatar} size="xl" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />

          <Input
            label="Avatar URL"
            placeholder="https://example.com/your-photo.jpg"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <p className="rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              {user.email}
            </p>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </p>
          )}
          {successMessage && (
            <p className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
              <Check className="h-4 w-4" /> {successMessage}
            </p>
          )}

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Save changes
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
