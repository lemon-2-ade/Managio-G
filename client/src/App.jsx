import { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Lottie from "lottie-react";
import loadingAnimation from "../src/assets/loading.json";
import AppRoutes from "./routes/Routes";
import { useAuth } from "./context/AuthContext.jsx";

function App() {
    const { user, loading, refreshUser } = useAuth();
    const [delayComplete, setDelayComplete] = useState(false);

    useEffect(() => {
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
            <AppRoutes user={user} fetchUser={refreshUser} />
        </Router>
    );
}

export default App;
