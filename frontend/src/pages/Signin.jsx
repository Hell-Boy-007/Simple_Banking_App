import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BottomWarning } from "../components/BottomWarning"
import { Button } from "../components/Button"
import { Heading } from "../components/Heading"
import { InputBox } from "../components/InputBox"
import { SubHeading } from "../components/SubHeading"

export const Signin = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateField = (event) => {
        setCredentials({ ...credentials, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setIsSubmitting(true);
        try {
            const response = await axios.post("http://localhost:3000/api/v1/user/signin", credentials);
            localStorage.setItem("token", response.data.token);
            navigate("/dashboard");
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to sign in. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return <div className="bg-slate-300 h-screen flex justify-center">
        <div className="flex flex-col justify-center">
            <div className="rounded-lg bg-white w-80 text-center p-2 h-max px-4">
                <Heading label={"Sign in"} />
                <SubHeading label={"Enter your credentials to access your account"} />
                <form onSubmit={handleSubmit}>
                    <InputBox name="username" value={credentials.username} onChange={updateField} type="email" placeholder="tanishq@gmail.com" label="Email" />
                    <InputBox name="password" value={credentials.password} onChange={updateField} type="password" placeholder="Password" label="Password" />
                    {error && <p role="alert" className="text-sm text-red-600 mt-2">{error}</p>}
                    <div className="pt-4">
                        <Button type="submit" disabled={isSubmitting} label={isSubmitting ? "Signing in..." : "Sign in"} />
                    </div>
                </form>
                <BottomWarning label={"Don't have an account?"} buttonText={"Sign up"} to={"/signup"} />
            </div>
        </div>
    </div>
}