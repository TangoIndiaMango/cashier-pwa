import { useState } from "react";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";
import AuthLayout from "@/components/auth/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RemoteApi } from "@/lib/api/remoteApi";
import { db } from "@/lib/db/schema";
import toast from "react-hot-toast";
import { useStore } from "@/hooks/useStore";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { triggerFetch } = useStore();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!formData.email || !formData.password) {
      toast.error("Fill in email or password");
      setLoading(false);
      return;
    }
    try {
      const res = await RemoteApi.login(formData?.email, formData?.password);
      console.log(res?.data);
      // set item to local storage
      localStorage.setItem("token", res?.data?.accessToken);
      localStorage.setItem("user", JSON.stringify(res?.data?.user));
      await db.open();
      await triggerFetch();
      setFormData({
        email: "",
        password: ""
      });
      window.location.href = "/";
      setLoading(false);
    } catch (error) {
      console.log("An error occured", error);
      setFormData({
        email: "",
        password: ""
      });
      setLoading(false);
    }
    setFormData({
      email: "",
      password: ""
    });
    setLoading(false);
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
              <a
                href="/forgot-password"
                className="text-sm text-[#344054] hover:text-[#303F9E]"
              >
                Forgot Password?
              </a>
              <Button
                type="submit"
                className="bg-[#303F9E] text-white px-4 py-2 rounded-xl shadow-sm hover:bg-[#263284] transition-colors"
                disabled={loading}
              >
                {loading ? "" : "Login"}
                {loading && <Loader2 className="w-8 h-8 animate-spin" />}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
