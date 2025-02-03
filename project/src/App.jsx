import React, { useContext } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import SignUp from "./pages/Signup";
import Login from "./pages/Login";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import Elections from "./pages/Election";
import ElectionsList from "./components/ElectionList";
import UpdateProfile from "./components/UpdateProfile";
import ElectionDetails from "./components/Electiondetails";

const AdminDashboard = () => <div className="container mx-auto py-8">Admin Dashboard</div>;
const UserDashboard = () => <div className="container mx-auto py-8">User Dashboard</div>;

const Logout = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  React.useEffect(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  return <div>Logging out...</div>;
};

const App = () => {
  const { profileData, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/elections" element={<Elections />} />
          <Route path="/elections/:id" element={<ElectionDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/update-profile" element={<UpdateProfile />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;