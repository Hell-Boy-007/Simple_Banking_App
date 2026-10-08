
import PropTypes from "prop-types";

export function InputBox({ label, placeholder, type = "text", name, value, onChange }) {
    return <div>
        <label htmlFor={name} className="text-sm font-medium text-left py-2 block">
            {label}
        </label>
        <input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required className="w-full px-2 py-1 border rounded border-slate-200" />
    </div>
}

InputBox.propTypes = {
    label: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
    type: PropTypes.string,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};
