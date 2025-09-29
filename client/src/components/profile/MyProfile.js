import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function MyProfile() {
  const { user, setUser } = useContext(AuthContext);

  const [name, setName] = useState(user?.username || "");
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [birthday, setBirthday] = useState(user?.birthday || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const [file, setFile] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  const API_URL = "http://localhost:1337/api/userprofiles"; // adjust if needed

  // Handle file selection
  const handleImageUpload = (e) => {
    const fileSelected = e.target.files[0];
    if (fileSelected) {
      setFile(fileSelected);
      setProfileImage(URL.createObjectURL(fileSelected)); // preview
    }
  };

  // Phone validation → only if filled
  const validatePhone = (number) => {
    if (!number) return true; // optional
    return /^[0-9]{10}$/.test(number);
  };

  // Birthday validation → only if filled
  const validateBirthday = (dateString) => {
    if (!dateString) return true; // optional
    const today = new Date();
    const dob = new Date(dateString);
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age >= 15;
  };

  // Save updated details
  const handleSave = async () => {
    if (!validatePhone(phone)) {
      alert("Phone number must be exactly 10 digits if provided.");
      return;
    }
    if (!validateBirthday(birthday)) {
      alert("You must be at least 15 years old.");
      return;
    }

    try {
      let uploadedImageId = user?.profileImage?.id || null;

      // Step 1: Upload image if new file selected
      if (file) {
        const formData = new FormData();
        formData.append("files", file);

        const uploadRes = await fetch("http://localhost:1337/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Image upload failed");

        const uploadData = await uploadRes.json();
        uploadedImageId = uploadData[0].id;
      }

      // Step 2: Update profile
      const updatedUser = {
        username: name,
        fullName,
        phone,
        address,
        birthday,
        gender,
        profileImage: uploadedImageId,
      };

      const response = await fetch(`${API_URL}/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: updatedUser }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const result = await response.json();
      setUser(result.data);

      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
      alert("Error updating profile");
    }
  };

  // Password reset
  const handlePasswordReset = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

    try {
      const res = await fetch("http://localhost:1337/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.jwt}`,
        },
        body: JSON.stringify({
          currentPassword,
          password: newPassword,
          passwordConfirmation: confirmPassword,
        }),
      });

      if (!res.ok) throw new Error("Password change failed");

      alert("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Password reset error:", error);
      alert("Error updating password");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-md rounded-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
        My Profile
      </h2>

      {/* Profile Image */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-32 h-32">
          <img
            src={
              profileImage ||
              "https://via.placeholder.com/150?text=Profile+Image"
            }
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
          />
          {isEditing && (
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white px-2 py-1 text-xs rounded-md cursor-pointer">
              Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Email (not editable)
          </label>
          <input
            type="text"
            value={user?.email || ""}
            disabled
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm p-2 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">
            Username
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isEditing}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={!isEditing}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">
            Phone Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={!isEditing}
            maxLength="10"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">
            Address
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={!isEditing}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">
            Birthday
          </label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            disabled={!isEditing}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">
            Gender
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            disabled={!isEditing}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end mt-6 space-x-4">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Edit Profile
          </button>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Save Changes
            </button>
          </>
        )}
      </div>

      {/* Password Reset Section */}
      <div className="mt-10 p-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-red-600">
          Change Password
        </h3>
        <div className="space-y-4">
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm p-2"
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm p-2"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm p-2"
          />
          <button
            onClick={handlePasswordReset}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}
