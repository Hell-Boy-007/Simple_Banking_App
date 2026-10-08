
import PropTypes from "prop-types";

export function Button({ label, onClick, type = "button", disabled = false }) {
    return <button onClick={onClick} type={type} disabled={disabled} className="w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 disabled:opacity-50">{label}</button>
}

Button.propTypes = {
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    type: PropTypes.string,
    disabled: PropTypes.bool,
};
