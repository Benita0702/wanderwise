// src/components/profile/MyProfile.js
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";

export default function MyProfile() {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [userId, setUserId] = useState(null);
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
  const [isLoading, setIsLoading] = useState(true);

  const populateForm = useCallback((profileData) => {
    if (!profileData) return;

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

    if (profileData.Profile?.data) {
      setPreview(
        "http://localhost:1337" +
          profileData.Profile.data.attributes.url
      );
    } else {
      setPreview(null);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          "http://localhost:1337/api/users/me?populate[user_profile][populate][0]=Profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error(`HTTP error! ${res.status}`);

        const data = await res.json();
        setUserId(data.id);

        if (data.user_profile) {
          setProfile(data.user_profile);
          populateForm(data.user_profile);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [token, populateForm]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("files", file);

    const res = await fetch("http://localhost:1337/api/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
        console.error("Image upload failed");
        return null;
    }

    const data = await res.json();
    return data[0]?.id || null;
  };

  const handleSave = async () => {
    let imageId = profile?.Profile?.data?.id || null;
    if (profileImage) {
      imageId = await uploadImage(profileImage);
    }

    const dataToSave = { ...form, Profile: imageId };
    
    const url = profile
      ? `http://localhost:1337/api/user-profiles/${profile.id}`
      : `http://localhost:1337/api/user-profiles`;

    const method = profile ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: dataToSave }),
      });

      if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error?.message || "Failed to save profile");
      }
      
      const updated = await res.json();
      
      if (updated.data) {
        const newProfile = { id: updated.data.id, ...updated.data.attributes };
        setProfile(newProfile);
        populateForm(newProfile);
        setIsEditing(false);
        alert("Profile updated successfully!");
      }

    } catch (err) {
      console.error("Error saving profile:", err);
      alert(`An error occurred: ${err.message}`);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    populateForm(profile); // Revert changes by re-populating the form with original data
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
        alert("New password must be at least 6 characters long.");
        return;
    }
    
    try {
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
            throw new Error(error.error?.message || "Failed to update password");
        }
    } catch(err) {
        alert("Error: " + err.message);
    }
  };

  if (isLoading) {
    return <div className="max-w-2xl mx-auto p-6 text-center">Loading profile...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">My Profile</h2>

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