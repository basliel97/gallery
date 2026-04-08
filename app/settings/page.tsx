"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";
import { HardDrive, Loader2 } from "lucide-react";

type User = {
  email?: string;
  id: string;
} | null;

interface StorageInfo {
  used: number;
  limit: number;
}

const STORAGE_LIMIT_MB = 1000;

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [storageLoading, setStorageLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    getUser();
  }, [supabase]);

  useEffect(() => {
    async function fetchStorage() {
      if (!user?.id) return;
      
      setStorageLoading(true);
      try {
        const { data: files, error } = await supabase.storage
          .from("photos")
          .list(user.id, { limit: 1000 });

        if (error) throw error;

        const totalSize = (files ?? []).reduce((acc, file) => acc + (file.metadata?.size || 0), 0);
        setStorageInfo({
          used: totalSize,
          limit: STORAGE_LIMIT_MB * 1024 * 1024,
        });
      } catch (err) {
        console.error("Failed to fetch storage:", err);
      } finally {
        setStorageLoading(false);
      }
    }

    if (user) {
      fetchStorage();
    }
  }, [user, supabase]);

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email || "",
      password: currentPassword,
    });

    if (signInError) {
      setPasswordLoading(false);
      toast.error("Current password is incorrect");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function handleLogoutConfirmed() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings</p>
      </div>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="mb-3 text-sm font-medium text-foreground">Profile</h2>
        <p className="text-sm text-muted-foreground">{user?.email || "No email"}</p>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Storage</h2>
          <HardDrive className="size-4 text-zinc-400" />
        </div>
        {storageLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading...
          </div>
        ) : storageInfo ? (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatBytes(storageInfo.used)} used</span>
              <span>{formatBytes(storageInfo.limit)} total</span>
            </div>
            <Progress
              value={(storageInfo.used / storageInfo.limit) * 100}
              className="h-2"
            />
            <p className="text-xs text-zinc-400">
              {formatBytes(storageInfo.limit - storageInfo.used)} remaining
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Unable to fetch storage info</p>
        )}
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="mb-3 text-sm font-medium text-foreground">Theme</h2>
        <div className="flex gap-2">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("light")}
          >
            Light
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("dark")}
          >
            Dark
          </Button>
          <Button
            variant={theme === "system" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("system")}
          >
            System
          </Button>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="mb-3 text-sm font-medium text-foreground">Password</h2>
        <form onSubmit={handlePasswordUpdate} className="space-y-3">
          <Input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button type="submit" disabled={passwordLoading} className="w-full">
            {passwordLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => setLogoutConfirmOpen(true)}
        >
          Logout
        </Button>
        <ConfirmDialog
          isOpen={logoutConfirmOpen}
          onClose={() => setLogoutConfirmOpen(false)}
          title="Logout"
          description="Are you sure you want to logout?"
          confirmText="Logout"
          variant="destructive"
          onConfirm={handleLogoutConfirmed}
        />
      </section>
    </div>
  );
}