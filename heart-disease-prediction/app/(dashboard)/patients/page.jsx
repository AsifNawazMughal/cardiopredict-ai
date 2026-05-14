"use client";
import { useState, useEffect } from "react";
import { patientsApi } from "../../lib/api";
import { Users, User, Plus, Search, Edit2, Trash2, X, Save, AlertCircle } from "lucide-react";
import Loading from "@/components/Loading";

const GENDERS = ["Male","Female","Other"];

const EMPTY = { first_name:"", last_name:"", date_of_birth:"", gender:"Male", contact_number:"", address:"" };

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  async function load(q) {
    setLoading(true);
    try { setPatients(await patientsApi.getAll(q)); }
    catch(e){} finally { setLoading(false); }
  }

  useEffect(()=>{ load(); },[]);
  useEffect(()=>{ const t=setTimeout(()=>load(search||undefined),350); return()=>clearTimeout(t); },[search]);

  function openAdd(){ setEditing(null); setForm(EMPTY); setError(""); setModal("add"); }
  function openEdit(p){ setEditing(p); setForm({first_name:p.first_name,last_name:p.last_name,date_of_birth:p.date_of_birth||"",gender:p.gender||"Male",contact_number:p.contact_number||"",address:p.address||""}); setError(""); setModal("edit"); }

  async function handleSave(){
    setSaving(true); setError("");
    try {
      if(modal==="add") await patientsApi.create(form);
      else if(editing) await patientsApi.update(editing.id, form);
      setModal(null); load();
    } catch(e){ setError(e instanceof Error?e.message:"Save failed"); }
    finally{ setSaving(false); }
  }

  async function handleDelete(id){
    try { await patientsApi.remove(id); setDeleteId(null); load(); }
    catch(e){ alert(e instanceof Error?e.message:"Delete failed"); }
  }

  function age(dob){ if(!dob) return "—"; return Math.floor((Date.now()-new Date(dob).getTime())/(365.25*24*60*60*1000)); }
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2"><Users className="w-5 h-5 md:w-6 md:h-6 text-red-600"/> Patients</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage your patient records</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors self-start sm:self-auto">
          <Plus className="w-4 h-4"/> Add Patient
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name..."
          className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"/>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>{["#","Name","Age","Gender","Phone","Address","Actions"].map(h=>(
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="py-12"><Loading center size="lg" label="Loading patients…"/></td></tr>
            ) : patients.length===0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">
                <User className="w-10 h-10 mx-auto mb-2 text-gray-300"/><br/>No patients found. <button onClick={openAdd} className="text-red-600 underline">Add first patient</button>
              </td></tr>
            ) : patients.map((p,i)=>(
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400 text-xs">#{i+1}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{p.first_name} {p.last_name}</td>
                <td className="px-4 py-3 text-gray-600">{age(p.date_of_birth)} {p.date_of_birth?"yrs":"—"}</td>
                <td className="px-4 py-3 text-gray-600">{p.gender||"—"}</td>
                <td className="px-4 py-3 text-gray-600">{p.contact_number||"—"}</td>
                <td className="px-4 py-3 text-gray-600 max-w-40 truncate">{p.address||"—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={()=>openEdit(p)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Edit2 className="w-3.5 h-3.5"/></button>
                    <button onClick={()=>setDeleteId(p.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-gray-900">{modal==="add"?"Add New Patient":"Edit Patient"}</h2>
              <button onClick={()=>setModal(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4"/></button>
            </div>
            <div className="p-5 space-y-3">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 text-red-700 text-sm"><AlertCircle className="w-4 h-4 mt-0.5"/>{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name" value={form.first_name} onChange={v=>set("first_name",v)} placeholder="John" required/>
                <Field label="Last Name" value={form.last_name} onChange={v=>set("last_name",v)} placeholder="Doe" required/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date of Birth" type="date" value={form.date_of_birth} onChange={v=>set("date_of_birth",v)}/>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                  <select value={form.gender} onChange={e=>set("gender",e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500">
                    {GENDERS.map(g=><option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <Field label="Phone Number" value={form.contact_number} onChange={v=>set("contact_number",v)} placeholder="+92 300 0000000"/>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                <textarea value={form.address} onChange={e=>set("address",e.target.value)} rows={2} placeholder="Street, City, Country"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"/>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button onClick={()=>setModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-lg text-sm font-medium">
                <Save className="w-3.5 h-3.5"/>{saving?"Saving...":"Save Patient"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6 text-red-600"/>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Delete Patient?</h3>
            <p className="text-gray-500 text-sm mb-5">This will also delete all prediction records for this patient.</p>
            <div className="flex gap-3">
              <button onClick={()=>setDeleteId(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={()=>handleDelete(deleteId)} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({label,type="text",value,onChange,placeholder,required}){
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} required={required}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"/>
    </div>
  );
}
