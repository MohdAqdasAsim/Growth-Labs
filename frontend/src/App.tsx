import { Routes, Route, Outlet, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  SignedIn,
  SignedOut,
  useUser,
  useClerk,
} from "@clerk/clerk-react";
import {
  Landing,
  Signin,
  NotFound,
  Signup,
  Docs,
  Pricing,
  Dashboard,
  SSOCallback,
  Onboarding,
  Campaign,
  Studio,
  Analytics,
  Workspaces,
  CreateCampaign,
  CampaignDetail,
  CreatePost,
} from "./pages";
import { Header, Footer, AuthHeader, Breadcrumb, SideBar } from "./components";
import { useApiClient } from "./lib/api";

function AuthLayout() {
  return (
    <div className="bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[48px_48px]">
      <AuthHeader />
      <section>
        <Outlet />
        <SideBar />
      </section>
    </div>
  );
}

function PublicLayout() {
  return (
    <div className="bg-[#0a0a0a]">
      <Header />
      <Outlet />
      {/* <Footer /> */}
    </div>
  );
}

function PrivatLayout() {
  const location = useLocation();

  // Check if current path matches campaign detail pattern (/campaign/:id)
  const isCampaignDetail =
    /^\/campaign\/[^/]+$/.test(location.pathname) &&
    location.pathname !== "/campaign/create";

  const hideSidebarPaths = ["/dashboard/workspaces"];
  const shouldShowSidebar =
    !hideSidebarPaths.includes(location.pathname) && !isCampaignDetail;

  return (
    <div className="bg-[#0a0a0a] h-screen flex flex-col overflow-hidden">
      <Breadcrumb />
      <div className="flex flex-1 overflow-hidden">
        {shouldShowSidebar && <SideBar />}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  // Handle loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981]"></div>
      </div>
    );
  }

  // Not signed in - redirect to signin
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Check if user was deleted (Clerk sets deletedAt timestamp)
  if (user.deletedSelfAt || (user as any).deletedAt) {
    signOut().then(() => {
      navigate("/signin", { replace: true });
    });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Account not found. Redirecting to sign in...</p>
      </div>
    );
  }

  return <>{children}</>;
}

function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const { isLoaded } = useUser();
  const api = useApiClient();
  const [onboardingStatus, setOnboardingStatus] = useState<"loading" | "complete" | "incomplete">("loading");
  const [error, setError] = useState<string | null>(null);
  const [setupMessage, setSetupMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    const checkOnboarding = async (retries = 3, delay = 1000) => {
      try {
        // Check if profile exists in backend
        await api.get("/onboarding");
        // Profile exists, onboarding is complete
        setSetupMessage(null);
        setOnboardingStatus("complete");
      } catch (err: any) {
        if (err.message?.includes("404")) {
          // Profile doesn't exist, redirect to onboarding
          setSetupMessage(null);
          setOnboardingStatus("incomplete");
        } else if (err.status === 503 && retries > 0) {
          // Account setup in progress (webhook race condition)
          setSetupMessage("Setting up your account...");
          const retryDelay = err.retryAfter ? parseInt(err.retryAfter) * 1000 : delay;
          console.log(`Account setup in progress, retrying in ${retryDelay}ms (${retries} attempts left)`);
          setTimeout(() => checkOnboarding(retries - 1, delay * 2), retryDelay);
        } else if (err.message?.includes("403") || err.message?.includes("401")) {
          // Auth error, let Clerk handle it
          setSetupMessage(null);
          setError("Authentication error");
        } else if (err.status === 503) {
          // Exhausted retries
          setSetupMessage(null);
          setError("Account setup is taking longer than expected. Please sign out and try again.");
        } else {
          // Other errors - assume incomplete for safety
          console.error("Onboarding check error:", err);
          setSetupMessage(null);
          setOnboardingStatus("incomplete");
        }
      }
    };

    checkOnboarding();
  }, [isLoaded, api]);

  if (!isLoaded || onboardingStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          {setupMessage && (
            <p className="text-neutral-400 text-sm">{setupMessage}</p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">{error}</p>
      </div>
    );
  }

  if (onboardingStatus === "incomplete") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route
          path="/signin/*"
          element={
            <>
              <SignedIn>
                <Navigate to="/dashboard" replace />
              </SignedIn>
              <SignedOut>
                <Signin />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/signup/*"
          element={
            <>
              <SignedIn>
                <Navigate to="/dashboard" replace />
              </SignedIn>
              <SignedOut>
                <Signup />
              </SignedOut>
            </>
          }
        />
        <Route path="/sso-callback" element={<SSOCallback />} />
      </Route>

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      <Route element={<PrivatLayout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <OnboardingCheck>
                <Dashboard />
              </OnboardingCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/workspaces"
          element={
            <ProtectedRoute>
              <OnboardingCheck>
                <Workspaces />
              </OnboardingCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaign"
          element={
            <ProtectedRoute>
              <OnboardingCheck>
                <Campaign />
              </OnboardingCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaign/create"
          element={
            <ProtectedRoute>
              <OnboardingCheck>
                <CreateCampaign />
              </OnboardingCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaign/:id"
          element={
            <ProtectedRoute>
              <OnboardingCheck>
                <CampaignDetail />
              </OnboardingCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/studio"
          element={
            <ProtectedRoute>
              <OnboardingCheck>
                <Studio />
              </OnboardingCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/studio/create-post"
          element={
            <ProtectedRoute>
              <OnboardingCheck>
                <CreatePost />
              </OnboardingCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <OnboardingCheck>
                <Analytics />
              </OnboardingCheck>
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
