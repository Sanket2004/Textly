import { Navigate } from "react-router-dom";
import useAppStore from "../stores/useStore";

export default function ProtectedRoute({ children }) {
    const { username } = useAppStore();

    if (!username) {
        return <Navigate to="/onboarding" replace />;
    }

    return children;
}
