// src/components/profile/MyProfile.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function MyProfile() {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    FullName: "",
    Phone: "",
    Address: "",
    Birthday: "",
    Gender: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  // ✅ Load user profile from Strapi
  useEffect(() => {
    if (!token) return;

    fetch(`http://localhost:1337/api/users/me?populate=user_profile.Profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.user_profile) {
          const profileData = data.user_profile;
          setProfile(profileData);

          // Handle Strapi rich-text JSON for Address
          let addressText = "";
          if (Array.isArray(profileData.Address)) {
            addressText = profileData.Address.map((block) =>
              block.children.map((child) => child.text).join("")
            ).join("\n");
          } else {
            addressText = profileData.Address || "";
          }

          setForm({
            FullName: profileData.FullName || "",
            Phone: profileData.Phone || "",
            Address: addressText,
            Birthday: profileData.Birthday || "",
            Gender: profileData.Gender || "",
          });

          if (profileData.Profile) {
            setPreview("http://localhost:1337" + profileData.Profile.url);
          }
        }
      })
      .catch((err) => console.error("Error loading profile:", err));
  }, [token]);

  // ✅ Handle text input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // ✅ Upload image to Strapi
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("files", file);

    const res = await fetch("http://localhost:1337/api/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    if (data[0]) return data[0].id;
    return null;
  };

  // ✅ Save profile
  const handleSave = async () => {
    if (!profile) return;

    let imageId = profile.Profile?.id || null;
    if (profileImage) {
      imageId = await uploadImage(profileImage);
    }

    const res = await fetch(
      `http://localhost:1337/api/user-profiles/${profile.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            ...form,
            Profile: imageId ? imageId : null,
          },
        }),
      }
    );

    const updated = await res.json();
    console.log("Profile updated:", updated);

    if (updated?.data?.attributes?.Profile) {
      setPreview("http://localhost:1337" + updated.data.attributes.Profile.url);
    }

    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  // ✅ Cancel editing
  const handleCancel = () => {
    if (profile) {
      setForm({
        FullName: profile.FullName || "",
        Phone: profile.Phone || "",
        Address: profile.Address || "",
        Birthday: profile.Birthday || "",
        Gender: profile.Gender || "",
      });
      if (profile.Profile) {
        setPreview("http://localhost:1337" + profile.Profile.url);
      }
    }
    setIsEditing(false);
  };

  // ✅ Change password
  const handleChangePassword = async () => {
    const res = await fetch("http://localhost:1337/api/auth/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword,
        password: newPassword,
        passwordConfirmation: newPassword,
      }),
    });

    if (res.ok) {
      alert("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } else {
      const error = await res.json();
      alert("Error: " + (error.error?.message || "Failed to update password"));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">My Profile</h2>

      {/* Profile Image */}
      <div className="mb-4 text-center">
        {preview ? (
          <img
            src={preview}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover mx-auto"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
        {isEditing && (
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-2"
          />
        )}
      </div>

      {/* Profile Fields */}
      <div className="space-y-3">
        <input
          type="text"
          name="FullName"
          value={form.FullName}
          onChange={handleChange}
          disabled={!isEditing}
          placeholder="Full Name"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="Phone"
          value={form.Phone}
          onChange={handleChange}
          disabled={!isEditing}
          placeholder="Phone Number"
          className="w-full p-2 border rounded"
        />
        <textarea
          name="Address"
          value={form.Address}
          onChange={handleChange}
          disabled={!isEditing}
          placeholder="Address"
          className="w-full p-2 border rounded"
        />
        <input
          type="date"
          name="Birthday"
          value={form.Birthday}
          onChange={handleChange}
          disabled={!isEditing}
          className="w-full p-2 border rounded"
        />
        <select
          name="Gender"
          value={form.Gender}
          onChange={handleChange}
          disabled={!isEditing}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Others">Others</option>
        </select>
      </div>

      {/* Buttons */}
      {!isEditing ? (
        <button
          onClick={() => setIsEditing(true)}
          className="mt-4 bg-gray-600 text-white px-4 py-2 rounded"
        >
          Edit Profile
        </button>
      ) : (
        <div className="mt-4 space-x-2">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>
          <button
            onClick={handleCancel}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Change Password */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Change Password</h3>
        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />
        <button
          onClick={handleChangePassword}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Update Password
        </button>
      </div>
    </div>
  );
}