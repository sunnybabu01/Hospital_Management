import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlMenu } from "react-icons/sl"; // A modern hamburger icon

/**
 * Hospital Management Frontend — Single-File React App
 * ----------------------------------------------------
 * - Enhanced with animations and a modern color scheme.
 * - Hospital Name: Apollo Hospital
 */

// ====== CONFIG ======
const USE_API = false;
const baseURL = "http://localhost:5000/api";
const DB_PATH = "./db.json"; // Path to the database file
const PORT = 5000; // Port for the backend server
// Removed fs import as it's a Node.js module and not used on the frontend

// ====== THEME COLORS ======
const theme = {
    primary: "indigo-600",
    primaryHover: "indigo-700",
    secondary: "teal-500",
    lightBg: "slate-100",
    text: "slate-800",
    textLight: "slate-500",
    error: "red-500",
    success: "emerald-600",
};

// ====== UTILITIES ======
const ok = (cond, msg) => ({ ok: !!cond, msg });
const validators = {
    dept: (d) => ok(d.dept_name?.trim(), "Department name is required."),
    doctorId: (id) => ok(/^(DR|DC)/.test(id || ""), "Doctor ID must start with DR or DC"),
    doctorRegId: (id) => ok(/^DR/.test(id || ""), "Regular doctor ID must start with DR"),
    doctorOnCallId: (id) => ok(/^DC/.test(id || ""), "On-call doctor ID must start with DC"),
    patientId: (id) => ok(/^PT/.test(id || ""), "Patient ID must start with PT"),
    sex: (s) => ok(["M", "F", "O"].includes(s || ""), "Sex must be M, F, or O"),
    roomType: (t) => ok(["G", "P"].includes(t || ""), "Room type must be G or P"),
    roomStatus: (t) => ok(["Y", "N"].includes(t || ""), "Room status must be Y or N"),
};

function usePersistedState(key, initialValue) {
    const [state, setState] = useState(() => {
        if (!USE_API) {
            try {
                const s = localStorage.getItem(key);
                return s ? JSON.parse(s) : initialValue;
            } catch (e) {
                return initialValue;
            }
        }
        return initialValue;
    });
    useEffect(() => {
        if (!USE_API) localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);
    return [state, setState];
}

// Custom hook to handle clicks outside of a component
function useOnClickOutside(ref, handler) {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler(event);
        };
        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);
        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler]);
}

// ====== REUSABLE COMPONENTS with new styling ======

function Section({ title, subtitle, children }) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border-t-4 border-indigo-500"
        >
            <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
                <div>
                    <h2 className={`text-2xl font-bold text-${theme.text}`}>{title}</h2>
                    {subtitle && <p className={`text-sm text-${theme.textLight}`}>{subtitle}</p>}
                </div>
            </div>
            <div>{children}</div>
        </motion.section>
    );
}

function Toolbar({ current, onChange }) {
    const tabs = [
        ["departments", "Departments"], ["doctors", "Doctors"], ["patients", "Patients"],
        ["checkup", "Check‑Up"], ["admit", "Admit"], ["regular", "Regular Visits"],
        ["operation", "Operation"], ["discharge", "Discharge"], ["rooms", "Rooms"],
    ];
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef();
    useOnClickOutside(menuRef, () => setIsMenuOpen(false));

    const handleTabChange = (tabId) => {
        onChange(tabId);
        setIsMenuOpen(false); // Close menu on tab selection
    };

    return (
        <div className="sticky top-0 z-20 bg-white/70 backdrop-blur-lg shadow-md">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between py-3">
                    <div className="flex items-center">
                        <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 mr-6">
                            Apollo Hospital
                        </div>
                    </div>
                    {/* Desktop Tabs */}
                    <div className="hidden md:flex flex-wrap gap-2">
                        {tabs.map(([id, label]) => (
                            <button
                                key={id}
                                onClick={() => handleTabChange(id)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                                    current === id
                                        ? `bg-${theme.primary} text-white shadow-md`
                                        : `text-gray-600 hover:bg-indigo-100 hover:text-${theme.primary}`
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-600"
                            aria-label="Open Menu"
                        >
                            <SlMenu size={24} />
                        </button>
                    </div>

                    <span className="hidden md:block ml-auto text-xs text-gray-500 self-center">
                        Mode: {USE_API ? "API (Live)" : "City Care Hospital"}
                    </span>
                </div>

                {/* Mobile Dropdown Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            ref={menuRef}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden md:hidden pb-4"
                        >
                            <div className="flex flex-col gap-2">
                                {tabs.map(([id, label]) => (
                                    <button
                                        key={id}
                                        onClick={() => handleTabChange(id)}
                                        className={`w-full text-left px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                                            current === id
                                                ? `bg-${theme.primary} text-white shadow-md`
                                                : `text-gray-600 hover:bg-indigo-100 hover:text-${theme.primary}`
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function Field({ label, children, required }) {
    return (
        <label className="block">
            <span className={`text-sm font-semibold text-gray-700 mb-1 block`}>{label}{required && <span className="text-red-500"> *</span>}</span>
            {children}
        </label>
    );
}

function TextInput(props) {
    return <input {...props} className={`w-full rounded-lg border-gray-300 px-3 py-2 bg-white/50 outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-${theme.primary} transition-all duration-200 ${props.className || ""}`} />;
}

function Select(props) {
    return <select {...props} className={`w-full rounded-lg border-gray-300 px-3 py-2 bg-white/50 outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-${theme.primary} transition-all duration-200 ${props.className || ""}`} />;
}

function Button({ children, onClick, className = '' }) {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`px-6 py-2 rounded-lg bg-${theme.primary} hover:bg-${theme.primaryHover} text-white font-semibold shadow-md transition-all duration-200 ${className}`}
        >
            {children}
        </motion.button>
    );
}

function Table({ columns, rows }) {
    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className={`bg-slate-200 text-slate-700`}>
                        {columns.map((c) => (
                            <th key={c.key} className="px-4 py-3 text-left font-bold uppercase tracking-wider">
                                {c.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={i} className="border-b border-slate-200 odd:bg-white even:bg-slate-50 hover:bg-indigo-50 transition-colors">
                            {columns.map((c) => (
                                <td key={c.key} className="px-4 py-3 align-top">
                                    {c.render ? c.render(r[c.key], r) : String(r[c.key] ?? "")}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function FlashMessage({ msg }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className={`fixed top-24 right-5 z-50 rounded-xl px-5 py-3 text-base font-semibold shadow-2xl ${
                msg.type === "error"
                    ? `bg-red-100 text-${theme.error}`
                    : `bg-emerald-100 text-${theme.success}`
            }`}
        >
            {msg.type === 'error' ? 'Error: ' : 'Success: '} {msg.text}
        </motion.div>
    );
}

function FormGrid({ state, setState, fields }) {
    return (
        <div className="grid md:grid-cols-3 gap-6">
            {fields.map(([key, label, type = "text", options]) => (
                <Field key={key} label={label} required={/(\*|\.\.\.)$/.test(label)}>
                    {type === "select" ? (
                        <Select value={state[key] ?? ""} onChange={(e) => setState({ ...state, [key]: e.target.value })}>
                            {options.map((o, i) => (
                                <option key={i} value={typeof o === 'object' ? o.value : o}>
                                    {typeof o === 'object' ? o.label : (o || "-- Select --")}
                                </option>
                            ))}
                        </Select>
                    ) : (
                        <TextInput type={type} value={state[key] ?? ""} onChange={(e) => setState({ ...state, [key]: e.target.value })} />
                    )}
                </Field>
            ))}
        </div>
    );
}

// ====== MAIN APP ======
export default function App() {
    const [tab, setTab] = useState("departments");
    const [msg, setMsg] = useState(null);

    const [departments, setDepartments] = usePersistedState("hm_departments", []);
    const [allDoctors, setAllDoctors] = usePersistedState("hm_allDoctors", []);
    const [docReg, setDocReg] = usePersistedState("hm_docReg", []);
    const [docOnCall, setDocOnCall] = usePersistedState("hm_docOnCall", []);
    const [patients, setPatients] = usePersistedState("hm_patients", []);
    const [checkups, setCheckups] = usePersistedState("hm_checkups", []);
    const [admits, setAdmits] = usePersistedState("hm_admits", []);
    const [regularVisits, setRegularVisits] = usePersistedState("hm_regularVisits", []);
    const [operations, setOperations] = usePersistedState("hm_operations", []);
    const [discharges, setDischarges] = usePersistedState("hm_discharges", []);
    const [rooms, setRooms] = usePersistedState("hm_rooms", []);

    const flash = (type, text) => {
        setMsg({ type, text });
        setTimeout(() => setMsg(null), 3000);
    };

    // A mapping of tab IDs to their components
    const tabComponents = {
        departments: <Departments data={departments} add={(d) => setDepartments([d, ...departments])} flash={flash} />,
        doctors: <Doctors departments={departments} allDoctors={allDoctors} setAllDoctors={setAllDoctors} docReg={docReg} setDocReg={setDocReg} docOnCall={docOnCall} setDocOnCall={setDocOnCall} flash={flash} />,
        patients: <Patients departments={departments} patients={patients} setPatients={setPatients} flash={flash} />,
        checkup: <Checkup patients={patients} allDoctors={allDoctors} checkups={checkups} setCheckups={setCheckups} flash={flash} />,
        admit: <Admit patients={patients} allDoctors={allDoctors} departments={departments} rooms={rooms} admits={admits} setAdmits={setAdmits} flash={flash} />,
        regular: <RegularVisits patients={patients} regularVisits={regularVisits} setRegularVisits={setRegularVisits} flash={flash} />,
        operation: <Operations patients={patients} allDoctors={allDoctors} operations={operations} setOperations={setOperations} flash={flash} />,
        discharge: <Discharge patients={patients} discharges={discharges} setDischarges={setDischarges} flash={flash} />,
        rooms: <Rooms rooms={rooms} setRooms={setRooms} flash={flash} />,
    };

    return (
        <div className="min-h-screen animated-gradient">
            <Toolbar current={tab} onChange={setTab} />
            <main className="max-w-7xl mx-auto px-4 py-8">
                <AnimatePresence>
                    {msg && <FlashMessage msg={msg} />}
                </AnimatePresence>
                {tabComponents[tab]}
            </main>
        </div>
    );
}

// ====== SECTION COMPONENTS (ALL INCLUDED AND STYLED) ======

function Departments({ data, add, flash }) {
    const [form, setForm] = useState({ dept_name: "", dept_location: "", facilities: "" });
    const handleAdd = () => {
        const v = validators.dept(form);
        if (!v.ok) return flash("error", v.msg);
        if (data.some(d => d.dept_name === form.dept_name)) return flash("error", "Department already exists.");
        add(form);
        flash("ok", "Department saved.");
        setForm({ dept_name: "", dept_location: "", facilities: "" });
    };

    return (
        <Section title="Departments" subtitle="Manage hospital departments">
            <FormGrid
                state={form}
                setState={setForm}
                fields={[["dept_name", "Department Name*"], ["dept_location", "Location"], ["facilities", "Facilities"]]}
            />
            <div className="mt-6"><Button onClick={handleAdd}>Save Department</Button></div>
            <div className="mt-8"><Table columns={[{ key: "dept_name", label: "Department" }, { key: "dept_location", label: "Location" }, { key: "facilities", label: "Facilities" }]} rows={data} /></div>
        </Section>
    );
}

function Doctors({ departments, allDoctors, setAllDoctors, docReg, setDocReg, docOnCall, setDocOnCall, flash }) {
    const [allForm, setAllForm] = useState({ doctor_id: "", dept_name: "" });
    const [regForm, setRegForm] = useState({ doctor_id: "", name: "", qualification: "", address: "", phone: "", salary: "", date_of_joining: "" });
    const [ocForm, setOcForm] = useState({ doctor_id: "", name: "", qualification: "", fees_per_call: "", payment_due: "", address: "", phone: "" });

    const addAll = () => {
        const v = validators.doctorId(allForm.doctor_id);
        if (!v.ok) return flash("error", v.msg);
        if (!departments.find((d) => d.dept_name === allForm.dept_name)) return flash("error", "Department does not exist.");
        if (allDoctors.some((d) => d.doctor_id === allForm.doctor_id)) return flash("error", "Doctor already exists.");
        setAllDoctors([allForm, ...allDoctors]);
        flash("ok", "Doctor mapping saved.");
        setAllForm({ doctor_id: "", dept_name: "" });
    };
    const addReg = () => {
        const v = validators.doctorRegId(regForm.doctor_id);
        if (!v.ok) return flash("error", v.msg);
        if (!allDoctors.some((d) => d.doctor_id === regForm.doctor_id)) return flash("error", "Doctor must exist in ALL_DOCTORS list first.");
        setDocReg([regForm, ...docReg]);
        flash("ok", "Regular doctor saved.");
        setRegForm({ doctor_id: "", name: "", qualification: "", address: "", phone: "", salary: "", date_of_joining: "" });
    };
    const addOnCall = () => {
        const v = validators.doctorOnCallId(ocForm.doctor_id);
        if (!v.ok) return flash("error", v.msg);
        if (!allDoctors.some((d) => d.doctor_id === ocForm.doctor_id)) return flash("error", "Doctor must exist in ALL_DOCTORS list first.");
        setDocOnCall([ocForm, ...docOnCall]);
        flash("ok", "On-call doctor saved.");
        setOcForm({ doctor_id: "", name: "", qualification: "", fees_per_call: "", payment_due: "", address: "", phone: "" });
    };

    return (
        <>
            <Section title="All Doctors" subtitle="Map every doctor to an existing department">
                <div className="grid md:grid-cols-3 gap-6 items-end">
                    <Field label="Doctor ID (DR... or DC...)*">
                        <TextInput value={allForm.doctor_id} onChange={(e) => setAllForm({ ...allForm, doctor_id: e.target.value.toUpperCase() })} />
                    </Field>
                    <Field label="Department*">
                        <Select value={allForm.dept_name} onChange={(e) => setAllForm({ ...allForm, dept_name: e.target.value })}>
                            <option value="">-- Select --</option>
                            {departments.map((d) => <option key={d.dept_name} value={d.dept_name}>{d.dept_name}</option>)}
                        </Select>
                    </Field>
                    <Button onClick={addAll}>Save Mapping</Button>
                </div>
                <div className="mt-8"><Table columns={[{ key: "doctor_id", label: "Doctor ID" }, { key: "dept_name", label: "Department" }]} rows={allDoctors} /></div>
            </Section>

            <Section title="Regular Doctors" subtitle="Doctor ID must start with DR and exist in All Doctors">
                <FormGrid state={regForm} setState={setRegForm} fields={[
                    ["doctor_id", "Doctor ID (DR...)*"], ["name", "Name"], ["qualification", "Qualification"],
                    ["address", "Address"], ["phone", "Phone"], ["salary", "Salary", "number"], ["date_of_joining", "Date of Joining", "date"],
                ]} />
                <div className="mt-6"><Button onClick={addReg}>Save Regular Doctor</Button></div>
                <div className="mt-8"><Table columns={[{ key: "doctor_id", label: "ID" }, { key: "name", label: "Name" }, { key: "qualification", label: "Qualification" }, { key: "phone", label: "Phone" }, { key: "salary", label: "Salary" }, { key: "date_of_joining", label: "Joined" }]} rows={docReg} /></div>
            </Section>

            <Section title="On‑Call Doctors" subtitle="Doctor ID must start with DC and exist in All Doctors">
                <FormGrid state={ocForm} setState={setOcForm} fields={[
                    ["doctor_id", "Doctor ID (DC...)*"], ["name", "Name"], ["qualification", "Qualification"],
                    ["fees_per_call", "Fees per Call", "number"], ["payment_due", "Payment Due", "number"], ["address", "Address"], ["phone", "Phone"],
                ]} />
                <div className="mt-6"><Button onClick={addOnCall}>Save On‑Call Doctor</Button></div>
                <div className="mt-8"><Table columns={[{ key: "doctor_id", label: "ID" }, { key: "name", label: "Name" }, { key: "qualification", label: "Qualification" }, { key: "fees_per_call", label: "Fees/Call" }, { key: "payment_due", label: "Payment Due" }]} rows={docOnCall} /></div>
            </Section>
        </>
    );
}

function Patients({ departments, patients, setPatients, flash }) {
    const [f, setF] = useState({ sex: "M", entry_date: new Date().toISOString().slice(0, 10) });
    const add = () => {
        const vId = validators.patientId(f.patient_id); if (!vId.ok) return flash("error", vId.msg);
        const vSex = validators.sex(f.sex); if (!vSex.ok) return flash("error", vSex.msg);
        if (!departments.find((d) => d.dept_name === f.dept_name)) return flash("error", "Department must exist.");
        if (patients.some((p) => p.patient_id === f.patient_id)) return flash("error", "Patient already exists.");
        setPatients([f, ...patients]);
        flash("ok", "Patient saved.");
        setF({ sex: "M", entry_date: new Date().toISOString().slice(0, 10), patient_id: "", name: "", age: "", doctor_name: "", diagnosis: "" });
    };
    return (
        <Section title="Patient Entry" subtitle="Create patient record at arrival (PAT_ENTRY)">
            <FormGrid state={f} setState={setF} fields={[
                ["patient_id", "Patient ID (PT...)*"], ["name", "Name"], ["age", "Age", "number"],
                ["sex", "Sex", "select", ["M", "F", "O"]], ["address", "Address"], ["city", "City"],
                ["phone", "Phone"], ["entry_date", "Entry Date", "date"], ["doctor_name", "Doctor Name"],
                ["diagnosis", "Diagnosis"], ["dept_name", "Department*", "select", ["", ...departments.map((d) => d.dept_name)]],
            ]}
            />
            <div className="mt-6"><Button onClick={add}>Save Patient</Button></div>
            <div className="mt-8"><Table rows={patients} columns={[
                { key: "patient_id", label: "Patient ID" }, { key: "name", label: "Name" }, { key: "age", label: "Age" },
                { key: "sex", label: "Sex" }, { key: "dept_name", label: "Department" }, { key: "entry_date", label: "Entry Date" },
            ]} />
            </div>
        </Section>
    );
}

function Checkup({ patients, allDoctors, checkups, setCheckups, flash }) {
    const [f, setF] = useState({ checkup_date: new Date().toISOString().slice(0, 10), status: "Regular" });
    const add = () => {
        if (!patients.some((p) => p.patient_id === f.patient_id)) return flash("error", "Patient must exist.");
        if (!allDoctors.some((d) => d.doctor_id === f.doctor_id)) return flash("error", "Doctor must exist.");
        setCheckups([f, ...checkups]);
        flash("ok", "Check‑up saved.");
        setF({ ...f, diagnosis: "", treatment: "" });
    };
    return (
        <Section title="Patient Check‑Up" subtitle="Diagnosis, Treatment & Status (PAT_CHKUP)">
            <FormGrid state={f} setState={setF} fields={[
                ["patient_id", "Patient ID*"], ["doctor_id", "Doctor ID (DR/DC)*"], ["checkup_date", "Date", "date"],
                ["diagnosis", "Diagnosis"], ["treatment", "Treatment"], ["status", "Status", "select", ["Admitted", "Operation", "Regular"]],
            ]}
            />
            <div className="mt-6"><Button onClick={add}>Save Check‑Up</Button></div>
            <div className="mt-8"><Table rows={checkups} columns={[
                { key: "patient_id", label: "Patient" }, { key: "doctor_id", label: "Doctor" }, { key: "checkup_date", label: "Date" },
                { key: "status", label: "Status" }, { key: "diagnosis", label: "Diagnosis" }, { key: "treatment", label: "Treatment" },
            ]} />
            </div>
        </Section>
    );
}

function Admit({ patients, allDoctors, departments, rooms, admits, setAdmits, flash }) {
    const [f, setF] = useState({ date_of_admission: new Date().toISOString().slice(0, 10) });
    const add = () => {
        if (!patients.some((p) => p.patient_id === f.patient_id)) return flash("error", "Patient must exist.");
        if (!departments.some((d) => d.dept_name === f.dept_name)) return flash("error", "Department must exist.");
        if (!allDoctors.some((d) => d.doctor_id === f.doctor_id)) return flash("error", "Doctor must exist.");
        if (!rooms.some((r) => r.room_no === f.room_no)) return flash("error", "Room must exist.");
        setAdmits([f, ...admits]);
        flash("ok", "Admission saved.");
        setF({ date_of_admission: new Date().toISOString().slice(0, 10) });
    };
    return (
        <Section title="Patient Admit" subtitle="Admission details (PAT_ADMIT)">
            <FormGrid state={f} setState={setF} fields={[
                ["patient_id", "Patient ID*"], ["advance_payment", "Advance Payment", "number"], ["mode_of_payment", "Mode of Payment"],
                ["room_no", "Room No*", "select", ["", ...rooms.map((r) => r.room_no)]],
                ["dept_name", "Department*", "select", ["", ...departments.map((d) => d.dept_name)]],
                ["date_of_admission", "Date of Admission", "date"], ["initial_condition", "Initial Condition"], ["diagnosis", "Diagnosis"],
                ["treatment", "Treatment"], ["doctor_id", "Doctor ID*"], ["attendant_name", "Attendant Name"],
            ]}
            />
            <div className="mt-6"><Button onClick={add}>Save Admission</Button></div>
            <div className="mt-8"><Table rows={admits} columns={[
                { key: "patient_id", label: "Patient" }, { key: "room_no", label: "Room" }, { key: "dept_name", label: "Dept" },
                { key: "doctor_id", label: "Doctor" }, { key: "date_of_admission", label: "Admitted On" },
            ]} />
            </div>
        </Section>
    );
}

function RegularVisits({ patients, regularVisits, setRegularVisits, flash }) {
    const [f, setF] = useState({ visit_date: new Date().toISOString().slice(0, 10) });
    const add = () => {
        if (!patients.some((p) => p.patient_id === f.patient_id)) return flash("error", "Patient must exist.");
        setRegularVisits([f, ...regularVisits]);
        flash("ok", "Regular visit saved.");
        setF({ ...f, diagnosis: "", treatment: "", medicine: "" });
    };
    return (
        <Section title="Regular Patient" subtitle="Repeat visits (PAT_REG)">
            <FormGrid state={f} setState={setF} fields={[
                ["patient_id", "Patient ID*"], ["visit_date", "Date", "date"], ["diagnosis", "Diagnosis"],
                ["treatment", "Treatment"], ["medicine", "Medicine"], ["treatment_status", "Status"],
            ]}
            />
            <div className="mt-6"><Button onClick={add}>Save Visit</Button></div>
            <div className="mt-8"><Table rows={regularVisits} columns={[
                { key: "patient_id", label: "Patient" }, { key: "visit_date", label: "Date" },
                { key: "diagnosis", label: "Diagnosis" }, { key: "treatment", label: "Treatment" }]}
            />
            </div>
        </Section>
    );
}

function Operations({ patients, allDoctors, operations, setOperations, flash }) {
    const [f, setF] = useState({ date_of_operation: new Date().toISOString().slice(0, 10) });
    const add = () => {
        if (!patients.some((p) => p.patient_id === f.patient_id)) return flash("error", "Patient must exist.");
        if (!allDoctors.some((d) => d.doctor_id === f.doctor_id)) return flash("error", "Doctor must exist.");
        setOperations([f, ...operations]);
        flash("ok", "Operation saved.");
        setF({ date_of_operation: new Date().toISOString().slice(0, 10) });
    };
    return (
        <Section title="Operation" subtitle="Surgery details (PAT_OPR)">
            <FormGrid state={f} setState={setF} fields={[
                ["patient_id", "Patient ID*"], ["date_of_admission", "Date of Admission", "date"],
                ["date_of_operation", "Date of Operation", "date"], ["doctor_id", "Doctor ID*"],
                ["operation_theater_no", "OT No"], ["operation_type", "Operation Type"],
                ["condition_before", "Condition Before"], ["condition_after", "Condition After"], ["treatment_advice", "Treatment Advice"],
            ]}
            />
            <div className="mt-6"><Button onClick={add}>Save Operation</Button></div>
            <div className="mt-8"><Table rows={operations} columns={[
                { key: "patient_id", label: "Patient" }, { key: "doctor_id", label: "Doctor" },
                { key: "operation_type", label: "Type" }, { key: "date_of_operation", label: "Date" }]}
            />
            </div>
        </Section>
    );
}

function Discharge({ patients, discharges, setDischarges, flash }) {
    const [f, setF] = useState({ discharge_date: new Date().toISOString().slice(0, 10) });
    const add = () => {
        if (!patients.some((p) => p.patient_id === f.patient_id)) return flash("error", "Patient must exist.");
        setDischarges([f, ...discharges]);
        flash("ok", "Discharge saved.");
        setF({ discharge_date: new Date().toISOString().slice(0, 10) });
    };
    return (
        <Section title="Discharge" subtitle="Finalize patient discharge (PAT_DIS)">
            <FormGrid state={f} setState={setF} fields={[
                ["patient_id", "Patient ID*"], ["treatment_given", "Treatment Given"], ["treatment_advice", "Treatment Advice"],
                ["payment_made", "Payment Made", "number"], ["mode_of_payment", "Mode of Payment"], ["discharge_date", "Discharge Date", "date"],
            ]}
            />
            <div className="mt-6"><Button onClick={add}>Save Discharge</Button></div>
            <div className="mt-8"><Table rows={discharges} columns={[
                { key: "patient_id", label: "Patient" }, { key: "discharge_date", label: "Date" }, { key: "payment_made", label: "Payment" }]}
            />
            </div>
        </Section>
    );
}

function Rooms({ rooms, setRooms, flash }) {
    const [f, setF] = useState({ room_type: "G", status: "N" });
    const add = () => {
        const vType = validators.roomType(f.room_type); if (!vType.ok) return flash("error", vType.msg);
        const vSt = validators.roomStatus(f.status); if (!vSt.ok) return flash("error", vSt.msg);
        if (f.status === "Y" && !validators.patientId(f.patient_id).ok) return flash("error", "When occupied, provide valid PT... patient id.");
        setRooms([f, ...rooms]);
        flash("ok", "Room saved.");
        setF({ room_type: "G", status: "N", room_no: "", patient_id: "", patient_name: "" });
    };
    return (
        <Section title="Room Details" subtitle="Room type: G/P, Status: Y/N (ROOM_DETAILS)">
            <FormGrid state={f} setState={setF} fields={[
                ["room_no", "Room No*"], ["room_type", "Room Type", "select", ["G", "P"]],
                ["status", "Status", "select", ["Y", "N"]], ["patient_id", "Patient ID (if occupied)"],
                ["patient_name", "Patient Name"], ["charges_per_day", "Charges/Day", "number"],
            ]}
            />
            <div className="mt-6"><Button onClick={add}>Save Room</Button></div>
            <div className="mt-8"><Table rows={rooms} columns={[
                { key: "room_no", label: "Room" }, { key: "room_type", label: "Type" }, { key: "status", label: "Status" },
                { key: "patient_id", label: "Patient" }, { key: "charges_per_day", label: "Charges/Day" }]}
            />
            </div>
        </Section>
    );
}