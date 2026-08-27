import { useState } from "react";
import { X } from "lucide-react";

export default function NoteModal({ problem, onSave, onClose }) {
  const [text, setText] = useState(problem?.progress?.notes || "");
  const [saving, setSaving] = useState(false);

  if (!problem) return null;

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(problem._id, text.slice(0, 5000));
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card note-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p className="eyebrow">NOTE</p>
            <h3>{problem.title}</h3>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <textarea
          className="note-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Your approach, the trick you missed, what to remember next time…"
          maxLength={5000}
          autoFocus
        />

        <div className="modal-actions">
          <span className="note-count">{text.length}/5000</span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="secondary-button" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button className="primary-button" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save note"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
