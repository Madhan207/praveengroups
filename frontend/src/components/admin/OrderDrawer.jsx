import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Package, MapPin, CreditCard, Clock, CheckCircle, Truck,
  ShoppingBag, XCircle, AlertCircle, FileText, RotateCcw,
  User, Phone, Hash
} from "lucide-react";
import api from "../../utils/api";
import { useToast } from "../../context/ToastContext";
import { getMediaUrl } from "../../utils/media";

const STATUS_STEPS = [
  { key: "Pending",          label: "Order Placed",     icon: ShoppingBag,  color: "#f59e0b", bg: "#fef3c7" },
  { key: "Payment Verified", label: "Payment Verified", icon: CheckCircle,  color: "#3b82f6", bg: "#dbeafe" },
  { key: "Processing",       label: "Processing",       icon: Clock,        color: "#8b5cf6", bg: "#ede9fe" },
  { key: "Shipped",          label: "Shipped",          icon: Truck,        color: "#06b6d4", bg: "#cffafe" },
  { key: "Delivered",        label: "Delivered",        icon: CheckCircle,  color: "#10b981", bg: "#d1fae5" },
];

const CANCELLED_STEP = { key: "Cancelled", label: "Cancelled", icon: XCircle,    color: "#ef4444", bg: "#fee2e2" };
const RETURNED_STEP  = { key: "Returned",  label: "Returned",  icon: RotateCcw,  color: "#8b5cf6", bg: "#ede9fe" };

const statusIndex = (status) => STATUS_STEPS.findIndex((s) => s.key === status);

const Section = ({ title, icon: Icon, iconColor = "#6366f1", children }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2.5" style={{ background: "#f8fafc" }}>
      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: iconColor + "20" }}>
        <Icon className="w-3.5 h-3.5" style={{ color: iconColor }} />
      </div>
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const OrderDrawer = ({ order, onClose, onStatusChange, onLocalUpdate }) => {
  const { toast } = useToast();
  if (!order) return null;

  const isCancelled = order.status === "Cancelled";
  const isReturned  = order.status === "Returned";
  const steps = isCancelled
    ? [...STATUS_STEPS.slice(0, 1), CANCELLED_STEP]
    : isReturned
    ? [...STATUS_STEPS, RETURNED_STEP]
    : STATUS_STEPS;
  const currentIdx = isCancelled ? 1 : isReturned ? steps.length - 1 : statusIndex(order.status);

  const toAbsUrl = (path) => {
    if (!path) return null;
    return getMediaUrl(path);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: "480px",
          background: "#f8fafc",
          borderLeft: "1px solid #e2e8f0",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.12)",
        }}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
      >
        {/* Header */}
        <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Hash className="w-4 h-4 text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-900">Order {order.id}</h2>
              {order.return_requested && (
                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold border border-red-200">
                  RETURN
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {new Date(order.created_at).toLocaleDateString("en-IN", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">

          {/* Return Card — First if exists */}
          {order.return_requested && (
            <div className="rounded-2xl border-2 border-red-200 overflow-hidden" style={{ background: "#fff5f5" }}>
              <div className="px-5 py-3 border-b border-red-100 flex items-center justify-between" style={{ background: "#fee2e2" }}>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-red-600" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-700">Return Request</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  order.status === "Returned" ? "bg-green-100 text-green-700 border-green-200" :
                  order.status === "Return Rejected" ? "bg-orange-100 text-orange-700 border-orange-200" :
                  "bg-yellow-100 text-yellow-700 border-yellow-200"
                }`}>
                  {order.status === "Returned" ? "ACCEPTED" : order.status === "Return Rejected" ? "REJECTED" : "PENDING"}
                </span>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1.5">Customer Reason</p>
                  <p className="text-sm text-slate-700 bg-white rounded-xl p-3 border border-red-100 leading-relaxed">
                    {order.return_reason || "No reason provided."}
                  </p>
                </div>

                {order.return_proof && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-2">Photo Proof</p>
                    <a href={toAbsUrl(order.return_proof)} target="_blank" rel="noopener noreferrer">
                      <img
                        src={toAbsUrl(order.return_proof)}
                        alt="Return Proof"
                        className="w-full rounded-xl border-2 border-red-100 hover:opacity-90 transition-opacity object-cover"
                        style={{ maxHeight: "200px" }}
                      />
                      <p className="text-[10px] text-red-400 mt-1 text-center">↗ Click to view full image</p>
                    </a>
                  </div>
                )}

                {order.status !== "Returned" && order.status !== "Return Rejected" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onStatusChange(order.id, "status", "Returned")}
                      className="flex-1 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors"
                    >
                      ✓ Accept Return
                    </button>
                    <button
                      onClick={() => onStatusChange(order.id, "status", "Return Rejected")}
                      className="flex-1 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors"
                    >
                      ✗ Reject Return
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Customer */}
          <Section title="Customer Details" icon={User} iconColor="#6366f1">
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Name</p>
                <p className="text-sm font-semibold text-slate-800">{order.user_name || order.full_name}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Email</p>
                <p className="text-sm font-semibold text-slate-800">{order.user_email || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Phone</p>
                <p className="text-sm font-semibold text-slate-800">{order.mobile_number || "—"}</p>
              </div>
            </div>
          </Section>

          {/* Shipping */}
          <Section title="Shipping Address" icon={MapPin} iconColor="#10b981">
            <p className="text-sm text-slate-700 leading-relaxed">
              {order.address},<br />
              {order.city}, {order.state} — {order.pincode}
            </p>
          </Section>

          {/* Payment */}
          <Section title="Payment" icon={CreditCard} iconColor="#8b5cf6">
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                order.payment_method === "UPI" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"
              }`}>
                {order.payment_method}
              </span>
              <span className="text-2xl font-bold text-green-600">₹{Number(order.total_amount).toLocaleString("en-IN")}</span>
            </div>
            {order.payment_verification && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <p className="text-xs text-slate-500">
                  UTR: <span className="font-mono font-bold text-brand-600 ml-1">{order.payment_verification.utr_number}</span>
                </p>
                {order.payment_verification.screenshot && (
                  <a href={toAbsUrl(order.payment_verification.screenshot)} target="_blank" rel="noopener noreferrer">
                    <img
                      src={toAbsUrl(order.payment_verification.screenshot)}
                      alt="Payment Proof"
                      className="w-full rounded-lg border border-slate-200 hover:opacity-90 transition-opacity"
                      style={{ maxHeight: "150px", objectFit: "cover" }}
                    />
                    <p className="text-[10px] text-slate-400 mt-1 text-center">↗ Click to enlarge</p>
                  </a>
                )}
              </div>
            )}
          </Section>

          {/* Items */}
          <Section title={`Order Items (${order.items?.length || 0})`} icon={Package} iconColor="#f59e0b">
            <div className="space-y-2.5">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 leading-tight">{item.product_name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-700">
                    ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          {/* Timeline */}
          <Section title="Order Timeline" icon={Clock} iconColor="#06b6d4">
            <div>
              {steps.map((step, i) => {
                const Icon   = step.icon;
                const done   = i <= currentIdx;
                const isCurr = i === currentIdx;
                return (
                  <div key={step.key} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: done ? step.bg : "#f1f5f9" }}>
                        <Icon className="w-4 h-4" style={{ color: done ? step.color : "#cbd5e1" }} />
                      </div>
                      {i < steps.length - 1 && (
                        <div className="w-0.5 h-6 my-0.5" style={{ background: i < currentIdx ? "#818cf8" : "#e2e8f0" }} />
                      )}
                    </div>
                    <div className="pt-1.5 pb-3">
                      <p className={`text-sm font-semibold ${done ? "text-slate-800" : "text-slate-300"}`}>
                        {step.label}
                        {isCurr && (
                          <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                            CURRENT
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Invoice */}
          <Section title="Invoice" icon={FileText} iconColor="#3b82f6">
            {order.invoice_file && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-800">Invoice Available</span>
                </div>
                <a
                  href={toAbsUrl(order.invoice_file)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-bold"
                >
                  View / Download
                </a>
              </div>
            )}
            {!order.invoice_file && (
              <p className="text-xs text-slate-400 mb-3">No invoice uploaded yet.</p>
            )}
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2">
                {order.invoice_file ? "Replace Invoice" : "Upload Invoice"}
              </p>
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={async (e) => {
                  if (!e.target.files?.[0]) return;
                  const formData = new FormData();
                  formData.append("invoice_file", e.target.files[0]);
                  try {
                    toast("Uploading invoice...", "info");
                    const res = await api.patch(`/orders/${order.id}/`, formData);
                    const url = res.data.invoice_file;
                    if (onLocalUpdate) onLocalUpdate(order.id, "invoice_file", url);
                    else onStatusChange(order.id, "invoice_file", url);
                    toast("Invoice uploaded successfully!", "success");
                  } catch {
                    toast("Failed to upload invoice", "error");
                  }
                }}
                className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
            </div>
          </Section>

          {/* Update Status */}
          <Section title="Update Order Status" icon={CheckCircle} iconColor="#10b981">
            <select
              value={order.status}
              onChange={(e) => onStatusChange(order.id, "status", e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm font-bold border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-slate-700 cursor-pointer"
            >
              {["Pending","Payment Verified","Processing","Shipped","Delivered","Cancelled","Returned","Return Rejected"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {order.tracking_id && (
              <p className="mt-2 text-xs text-slate-400">
                Tracking ID: <span className="font-mono font-bold text-slate-600">{order.tracking_id}</span>
              </p>
            )}
          </Section>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderDrawer;
