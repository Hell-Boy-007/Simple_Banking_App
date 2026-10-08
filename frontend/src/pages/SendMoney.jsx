import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import axios from "axios";
import { useState } from 'react';

export const SendMoney = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const id = searchParams.get("id");
    const name = searchParams.get("name");
    const [amount, setAmount] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!id || !name) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleTransfer = async (event) => {
        event.preventDefault();
        const numericAmount = Number(amount);
        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            setMessage("Enter an amount greater than zero.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/signin");
            return;
        }

        setMessage("");
        setIsSubmitting(true);
        try {
            await axios.post("http://localhost:3000/api/v1/account/transfer", {
                to: id,
                amount: numericAmount
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate("/dashboard");
        } catch (error) {
            setMessage(error.response?.data?.message || "Transfer failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return <div className="flex justify-center h-screen bg-gray-100">
        <div className="h-full flex flex-col justify-center">
                <div
                    className="border h-min text-card-foreground max-w-md p-4 space-y-8 w-96 bg-white shadow-lg rounded-lg"
                >
                    <div className="flex flex-col space-y-1.5 p-6">
                    <h2 className="text-3xl font-bold text-center">Send Money</h2>
                    </div>
                    <div className="p-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-2xl text-white">{name[0].toUpperCase()}</span>
                        </div>
                        <h3 className="text-2xl font-semibold">{name}</h3>
                    </div>
                    <form className="space-y-4" onSubmit={handleTransfer}>
                        <div className="space-y-2">
                        <label
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            htmlFor="amount"
                        >
                            Amount (in Rs)
                        </label>
                        <input
                            value={amount}
                            onChange={(event) => setAmount(event.target.value)}
                            type="number"
                            min="0.01"
                            step="0.01"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            id="amount"
                            placeholder="Enter amount"
                        />
                        </div>
                        {message && <p role="alert">{message}</p>}
                        <button type="submit" disabled={isSubmitting} className="justify-center rounded-md text-sm font-medium ring-offset-background transition-colors h-10 px-4 py-2 w-full bg-green-500 text-white disabled:opacity-50">
                            {isSubmitting ? "Sending..." : "Initiate Transfer"}
                        </button>
                    </form>
                    </div>
            </div>
        </div>
    </div>
}