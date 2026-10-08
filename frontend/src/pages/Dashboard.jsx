import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Appbar } from "../components/Appbar"
import { Balance } from "../components/Balance"
import { Users } from "../components/Users"

export const Dashboard = () => {
    const navigate = useNavigate();
    const [balance, setBalance] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/signin", { replace: true });
            return;
        }

        let isActive = true;
        axios.get("http://localhost:3000/api/v1/account/balance", {
            headers: { Authorization: `Bearer ${token}` }
        }).then((response) => {
            if (isActive) setBalance(response.data.balance);
        }).catch((requestError) => {
            if (!isActive) return;
            if ([401, 403].includes(requestError.response?.status)) {
                localStorage.removeItem("token");
                navigate("/signin", { replace: true });
                return;
            }
            setError(requestError.response?.data?.message || "Unable to load your balance.");
        });

        return () => {
            isActive = false;
        };
    }, [navigate]);

    return <div>
        <Appbar />
        <div className="m-8">
            <Balance value={balance} />
            {error && <p role="alert" className="text-sm text-red-600 mt-2">{error}</p>}
            <Users />
        </div>
    </div>
}