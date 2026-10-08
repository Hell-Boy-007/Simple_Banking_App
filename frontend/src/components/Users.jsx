import { useEffect, useState } from "react"
import { Button } from "./Button"
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";


export const Users = () => {
    // Replace with backend call
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        let isActive = true;
        axios.get("http://localhost:3000/api/v1/user/bulk", { params: { filter } })
            .then(response => {
                if (isActive) {
                    setUsers(response.data.user);
                    setError("");
                }
            })
            .catch(() => {
                if (isActive) setError("Unable to load users.");
            });
        return () => {
            isActive = false;
        };
    }, [filter])

    return <>
        <div className="font-bold mt-6 text-lg">
            Users
        </div>
        <div className="my-2">
            <input onChange={(e) => {
                setFilter(e.target.value)
            }} type="text" placeholder="Search users..." className="w-full px-2 py-1 border rounded border-slate-200"></input>
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div>
            {users.map(user => <User key={user._id} user={user} />)}
        </div>
    </>
}

function User({ user }) {
    const navigate = useNavigate();

    return <div className="flex justify-between">
        <div className="flex">
            <div className="rounded-full h-12 w-12 bg-slate-200 flex justify-center mt-1 mr-2">
                <div className="flex flex-col justify-center h-full text-xl">
                    {user.firstName[0]}
                </div>
            </div>
            <div className="flex flex-col justify-center h-ful">
                <div>
                    {user.firstName} {user.lastName}
                </div>
            </div>
        </div>

        <div className="flex flex-col justify-center h-ful">
            <Button onClick={() => {
                navigate(`/send?id=${encodeURIComponent(user._id)}&name=${encodeURIComponent(user.firstName)}`);
            }} label={"Send Money"} />
        </div>
    </div>
}

User.propTypes = {
    user: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string.isRequired,
    }).isRequired,
};