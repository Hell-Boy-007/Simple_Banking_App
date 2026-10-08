import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BottomWarning } from "../components/BottomWarning"
import { Button } from "../components/Button"
import { Heading } from "../components/Heading"
import { InputBox } from "../components/InputBox"
import { SubHeading } from "../components/SubHeading"

export const Signup = () => {
    const navigate = useNavigate();
    const [details, setDetails] = useState({ username: "", firstName: "", lastName: "", password: "" });
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateField = (event) => {
        setDetails({ ...details, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setIsSubmitting(true);
        try {
            const response = await axios.post("http://localhost:3000/api/v1/user/signup", details);
            localStorage.setItem("token", response.data.token);
            navigate("/dashboard");
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to sign up. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return <div className="bg-slate-300 h-screen flex justify-center">
        <div className="flex flex-col justify-center">
            <div className="rounded-lg bg-white w-80 text-center p-2 h-max px-4">
                <Heading label={"Sign up"} />
                <SubHeading label={"Enter your information to create an account"} />
                <form onSubmit={handleSubmit}>
                    <InputBox name="firstName" value={details.firstName} onChange={updateField} placeholder="John" label="First Name" />
                    <InputBox name="lastName" value={details.lastName} onChange={updateField} placeholder="Doe" label="Last Name" />
                    <InputBox name="username" value={details.username} onChange={updateField} type="email" placeholder="tanishq@gmail.com" label="Email" />
                    <InputBox name="password" value={details.password} onChange={updateField} type="password" placeholder="At least 6 characters" label="Password" />
                    {error && <p role="alert" className="text-sm text-red-600 mt-2">{error}</p>}
                    <div className="pt-4">
                        <Button type="submit" disabled={isSubmitting} label={isSubmitting ? "Creating account..." : "Sign up"} />
                    </div>
                </form>
                <BottomWarning label={"Already have an account?"} buttonText={"Sign in"} to={"/signin"} />
            </div>
        </div>
    </div>
}