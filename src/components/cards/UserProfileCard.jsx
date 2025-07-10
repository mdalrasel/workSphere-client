import { useEffect, useState, Fragment } from "react";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { Dialog, Transition } from "@headlessui/react";
import { FaUserEdit, FaLock, FaUser, FaEnvelope, FaBriefcase, FaMoneyBillWave, FaUniversity, FaCheckCircle } from "react-icons/fa";

const UserProfileCard = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [userData, setUserData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user?.email) {
      axiosSecure.get(`/users?email=${user.email}`)
        .then(res => setUserData(res.data))
        .catch(err => console.error(err));
    }
  }, [user, axiosSecure]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo" && files?.length) {
      const formData = new FormData();
      formData.append("image", files[0]);
      const imgbbApiKey = import.meta.env.VITE_imgbbApiKey;
      const uploadUrl = `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`;

      fetch(uploadUrl, {
        method: "POST",
        body: formData,
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUserData(prev => ({ ...prev, photo: data.data.url }));
          }
        })
        .catch(err => console.error(err));
    } else {
      setUserData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    try {
      await axiosSecure.put(`/users/${userData.email}`, userData);
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
   <div className="flex justify-center p-6">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-200 rounded-lg shadow-md">
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1522199755839-a2bacb67c546?auto=format&fit=crop&w=1350&q=80"
            alt="Cover"
            className="h-48 w-full object-cover rounded-t-lg"
          />

          <img
            src={userData?.photo || "https://i.ibb.co/3FqHZy9/default-avatar.png"}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 absolute left-8 -bottom-12"
          />

          <button
            onClick={() => setIsOpen(true)}
            className="absolute right-8 -bottom-12 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <FaUserEdit /> Edit Profile
          </button>
        </div>

        <div className="pt-16 px-8 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong>Name:</strong> {userData?.name}</div>
            <div><strong>Email:</strong> {userData?.email}</div>
            <div><strong>Role:</strong> {userData?.role}</div>
            <div><strong>Designation:</strong> {userData?.designation || 'N/A'}</div>
            <div><strong>Salary:</strong> {userData?.salary}</div>
            <div><strong>Bank Account:</strong> {userData?.bank_account_no || 'N/A'}</div>
            <div><strong>Verified:</strong> {userData?.isVerified ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
          <div className="fixed inset-0 bg-black bg-opacity-5" />

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900 mb-4">
                  Update your personal information to keep your profile up-to-date
                </Dialog.Title>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-1"><FaUser /> Name</label>
                    <input name="name" value={userData?.name || ''} onChange={handleInputChange} className="border p-2 w-full" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-1"><FaUser /> Photo (Upload)</label>
                    <input type="file" name="photo" onChange={handleInputChange} className="border p-2 w-full" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-1"><FaBriefcase /> Designation</label>
                    <input name="designation" value={userData?.designation || ''} onChange={handleInputChange} className="border p-2 w-full" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-1"><FaUniversity /> Bank Account No</label>
                    <input name="bank_account_no" value={userData?.bank_account_no || ''} onChange={handleInputChange} className="border p-2 w-full" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-1"><FaEnvelope /> Email</label>
                    <input disabled value={userData?.email || ''} className="border p-2 w-full bg-gray-200 cursor-not-allowed" title="Can't edit email" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-1"><FaLock /> Role</label>
                    <input disabled value={userData?.role || ''} className="border p-2 w-full bg-gray-200 cursor-not-allowed" title="Can't edit role" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-1"><FaMoneyBillWave /> Salary</label>
                    <input disabled value={userData?.salary} className="border p-2 w-full bg-gray-200 cursor-not-allowed" title="Can't edit salary" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-1"><FaCheckCircle /> Verification Status</label>
                    <input disabled value={userData?.isVerified ? 'Verified' : 'Not Verified'} className="border p-2 w-full bg-gray-200 cursor-not-allowed" title="Can't edit verification status" />
                  </div>

                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button onClick={() => setIsOpen(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                  <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default UserProfileCard;
