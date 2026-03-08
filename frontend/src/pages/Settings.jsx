import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Name</label>
              <input type="text" defaultValue={user?.name} className="input" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" defaultValue={user?.email} className="input" disabled />
            </div>
            <div>
              <label className="label">Role</label>
              <input type="text" defaultValue={user?.role} className="input capitalize" disabled />
            </div>
            <button className="btn btn-primary">Update Profile</button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Change Password</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input type="password" className="input" />
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" className="input" />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input type="password" className="input" />
            </div>
            <button className="btn btn-primary">Change Password</button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
