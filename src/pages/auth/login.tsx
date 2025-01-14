import AuthLayout from "@/components/auth/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/hooks/useStore";
import { RemoteApi } from "@/lib/api/remoteApi";
import { delay } from "@/lib/utils";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getDbInstance } from '../../lib/db/dbSingleton';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { triggerFetch } = useStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  // const openDB = async () => {
  //   try {
  //     console.log("Opening DB...");
  //     await db.open();
  //     console.log("DB Opened successfully.");
  //   } catch (error) {
  //     console.error("Error opening DB:", error);
  //     throw new Error("Could not open IndexedDB.");
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Check if email and password are filled
    if (!formData.email || !formData.password) {
      toast.error("Fill in email and password");
      setLoading(false);
      return;
    }

    try {
      const res = await RemoteApi.login(formData.email, formData.password);

      if (res?.data?.accessToken) {
        // Set item to local storage
        sessionStorage.setItem("token", res?.data?.accessToken);
        sessionStorage.setItem("user", JSON.stringify(res?.data?.user));
        console.log("Sleeping...");
        await delay();
        await getDbInstance();
        await triggerFetch();

        setFormData({
          email: "",
          password: ""
        });

        navigate(`/`);
      } else {
        toast.error("Invalid credentials");
      }
    } catch (error) {
      console.log("An error occurred:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-[406px]">
          <h2 className="mb-2 text-2xl font-bold">Login.</h2>
          <p className="mb-4 text-[#667085]">Please enter your details</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                className="text-[#344054] text-sm mb-1 block"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <Input
                  type="email"
                  id="email"
                  className="!px-10 auth-input"
                  placeholder="example@gmail.com"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <Mail className="absolute w-5 h-5 text-gray-500 -translate-y-1/2 left-3 top-1/2" />
              </div>
            </div>

            <div className="mb-3">
              <label
                className="text-[#344054] text-sm mb-1 block"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="auth-input"
                  placeholder="******"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute -translate-y-1/2 right-3 top-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              {/* <a
                href="/forgot-password"
                className="text-sm text-[#344054] hover:text-[#303F9E]"
              >
                Forgot Password?
              </a> */}
              <Button
                type="submit"
                className="bg-[#303F9E] text-white px-4 py-2 rounded-xl shadow-sm hover:bg-[#263284] transition-colors w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    loading <Loader2 className="w-8 h-8 animate-spin" />
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
