"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { FullPageLoader } from "../components/ui/Feedback";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    router.replace(user ? "/chat" : "/login");
  }, [user, isLoading, router]);

  return <FullPageLoader />;
}
