import { Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  useUser,
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
      <Footer />
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
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const hasCompletedOnboarding = user?.unsafeMetadata?.onboardingCompleted;

  if (!hasCompletedOnboarding) {
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
          path="/signin"
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
          path="/signup"
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
