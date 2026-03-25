import { useState } from "react";
import { User, X } from "lucide-react";
import { updateUserProfile } from "../../services/api";
import "./profileEditModal.css";

const ProfileEditModal = ({ user, onClose, onUpdate }) => {
  const [name, setName] = useState(user.name || "");
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [loading, setLoading] = useState(false);

  /* =========================
     SAVE PROFILE
  ========================= */
  const handleSave = async () => {
    if (!name.trim()) {
      alert("Name cannot be empty");
      return;
    }

    try {
      setLoading(true);

      const res = await updateUserProfile({
        name,
        avatar,
      });

      // Update parent state
      onUpdate(res.data);

      // Close modal
      onClose();
    } catch (err) {
      console.error(err);
      alert("Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <User size={24} color="#0ea5e9" />
            <h2 style={{ margin: 0 }}>Edit Profile</h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        {/* NAME FIELD */}
        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />

        {/* AVATAR URL FIELD */}
        <label>Profile Image</label>
<input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setAvatar(reader.result); // base64 image
    };

    reader.readAsDataURL(file);
  }}
/>


        {/* BUTTONS */}
        <div className="modal-actions">
          <button
            className="cancel-btn"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="save-btn"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
