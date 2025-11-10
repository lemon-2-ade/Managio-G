import { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import axios from "axios";
import Lottie from "lottie-react";
import loadingAnimation from "../src/assets/loading.json";
import AppRoutes from "./routes/Routes";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [delayComplete, setDelayComplete] = useState(false);

  const fetchUser = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/user`,
        {
          withCredentials: true,
        }
      );
      setUser(data);
    } catch (err) {
      console.log("User not authenticated");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    const delayTimer = setTimeout(() => {
      setDelayComplete(true);
    }, 2000);

    return () => clearTimeout(delayTimer);
  }, []);

  if (loading || !delayComplete) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Lottie animationData={loadingAnimation} loop className="w-40 h-40" />
      </div>
    );
  }

  return (
    <Router>
      <AppRoutes user={user} fetchUser={fetchUser} />
    </Router>
  );
}

export default App;
