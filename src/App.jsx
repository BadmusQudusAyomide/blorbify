import { useEffect, useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase.js";
import AuthScreen from "./AuthScreen.jsx";
import OnboardingScreen from "./OnboardingScreen.jsx";
import Dashboard from "./Dashboard.jsx";
import Storefront from "./Storefront.jsx";
import PaymentSuccess from "./PaymentSuccess.jsx";
import LandingPage from "./LandingPage.jsx";

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0F1518", color: "#F6F8F1", fontFamily: "Raleway, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.15)", borderTopColor: "#AFFF00", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
        <div>Loading your workspace…</div>
      </div>
    </div>
  );
}

function StorefrontRoute() {
  const { storeSlug } = useParams();
  return <Storefront slug={storeSlug} />;
}

// Decides once (on mount, once auth state is known) whether to bounce an
// already-signed-in visitor away from /login or /signup. It deliberately does
// NOT re-evaluate when `currentUser` changes afterwards, because both flows
// mutate `currentUser` themselves mid-flow (e.g. signup creates the account
// before the OTP step is shown) and would otherwise get redirected away by
// this route before AuthScreen gets a chance to render that step.
function AuthOnlyRoute({ authLoading, currentUser, postAuthPath, children }) {
  // "Adjust state during render" pattern (see react.dev "You might not need
  // an Effect"): comparing against a value snapshotted from the previous
  // render lets us freeze the redirect decision the moment authLoading first
  // resolves, without an Effect (which would cause an extra flicker render)
  // or a ref (which can't be read during render).
  //
  // prevAuthLoading must start `true` regardless of the current authLoading
  // value. If it started as `authLoading` itself, mounting this route AFTER
  // the app's initial auth check already resolved (the common case — e.g.
  // clicking a nav link to /login once the app is settled) would seed
  // prevAuthLoading === authLoading (both false) on the very first render,
  // so the "did it just resolve" comparison below would never see a
  // difference and decision would stay null forever — an infinite loading
  // screen.
  const [prevAuthLoading, setPrevAuthLoading] = useState(true);
  const [decision, setDecision] = useState(null);

  if (authLoading !== prevAuthLoading) {
    setPrevAuthLoading(authLoading);
    if (!authLoading && decision === null) {
      setDecision(Boolean(currentUser));
    }
  }

  if (authLoading || decision === null) return <LoadingScreen />;
  if (decision) return <Navigate to={postAuthPath} replace />;
  return children;
}

function AppShell() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const loadUserProfile = useCallback(async (user) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const profile = userSnap.exists() ? userSnap.data() : {};
      setUserProfile(profile);
      return profile;
    } catch (error) {
      console.error("Failed to load user profile:", error);
      setUserProfile(null);
      return null;
    }
  }, []);

  useEffect(() => {
    // Only the very first callback (resolving whether a session already
    // exists) should show the full-page loader. Later transitions — signup
    // creating an account, login succeeding, logout — happen while the user
    // is already looking at a specific screen (AuthScreen, Dashboard, ...)
    // which manages its own loading state; swapping in the global
    // LoadingScreen for those would unmount that screen mid-flow and drop
    // whatever step it was on (e.g. the post-signup OTP step).
    let isInitialCheck = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (isInitialCheck) setAuthLoading(true);
      setCurrentUser(user);
      if (!user) {
        setUserProfile(null);
        if (isInitialCheck) setAuthLoading(false);
        isInitialCheck = false;
        return;
      }

      try {
        await loadUserProfile(user);
      } finally {
        if (isInitialCheck) setAuthLoading(false);
        isInitialCheck = false;
      }
    });

    return () => unsubscribe();
  }, [loadUserProfile]);

  const handleAuthSuccess = useCallback(async (user = auth.currentUser) => {
    if (!user) return;

    setAuthLoading(true);
    setCurrentUser(user);
    try {
      const profile = await loadUserProfile(user);
      navigate(profile?.onboardingCompleted ? "/dashboard" : "/onboarding");
    } finally {
      setAuthLoading(false);
    }
  }, [loadUserProfile, navigate]);

  const handleLogout = useCallback(async () => {
    try {
      await auth.signOut();
    } finally {
      setCurrentUser(null);
      setUserProfile(null);
      navigate("/");
    }
  }, [navigate]);

  const handleOnboardingComplete = useCallback((onboardingData) => {
    setUserProfile((prev) => ({
      ...(prev || {}),
      ...(onboardingData || {}),
      onboardingCompleted: true,
      onboardingData: onboardingData || prev?.onboardingData,
    }));
    navigate("/dashboard");
  }, [navigate]);

  const onboardingCompleted = Boolean(userProfile?.onboardingCompleted);
  const needsEmailVerification = Boolean(currentUser) && userProfile?.emailVerified === false;
  const postAuthPath = needsEmailVerification ? "/verify-email" : onboardingCompleted ? "/dashboard" : "/onboarding";

  return (
    <Routes>
      <Route path="/payment/success" element={<PaymentSuccess />} />

      <Route
        path="/"
        element={
          authLoading ? (
            <LoadingScreen />
          ) : currentUser ? (
            <Navigate to={postAuthPath} replace />
          ) : (
            <LandingPage />
          )
        }
      />

      <Route
        path="/login"
        element={
          <AuthOnlyRoute authLoading={authLoading} currentUser={currentUser} postAuthPath={postAuthPath}>
            <AuthScreen initialMode="login" onSuccess={handleAuthSuccess} />
          </AuthOnlyRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <AuthOnlyRoute authLoading={authLoading} currentUser={currentUser} postAuthPath={postAuthPath}>
            <AuthScreen initialMode="signup" onSuccess={handleAuthSuccess} />
          </AuthOnlyRoute>
        }
      />

      <Route
        path="/verify-email"
        element={
          authLoading ? (
            <LoadingScreen />
          ) : !currentUser ? (
            <Navigate to="/login" replace />
          ) : !needsEmailVerification ? (
            <Navigate to={onboardingCompleted ? "/dashboard" : "/onboarding"} replace />
          ) : (
            <AuthScreen
              initialMode="verify"
              verifyEmail={currentUser.email}
              onSuccess={handleAuthSuccess}
              onCancel={handleLogout}
            />
          )
        }
      />

      <Route
        path="/onboarding"
        element={
          authLoading ? (
            <LoadingScreen />
          ) : !currentUser ? (
            <Navigate to="/login" replace />
          ) : needsEmailVerification ? (
            <Navigate to="/verify-email" replace />
          ) : (
            <OnboardingScreen
              userId={currentUser.uid}
              userProfile={userProfile}
              onComplete={handleOnboardingComplete}
            />
          )
        }
      />

      {["/dashboard", "/dashboard/:tab", "/dashboard/orders/:orderId"].map((path) => (
        <Route
          key={path}
          path={path}
          element={
            authLoading ? (
              <LoadingScreen />
            ) : !currentUser ? (
              <Navigate to="/login" replace />
            ) : needsEmailVerification ? (
              <Navigate to="/verify-email" replace />
            ) : !onboardingCompleted ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <Dashboard user={currentUser} userProfile={userProfile} onLogout={handleLogout} />
            )
          }
        />
      ))}

      <Route path="/:storeSlug" element={<StorefrontRoute />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
