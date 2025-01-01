import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen">
      <div className="flex flex-row min-h-screen">
        {/* Left Section */}
        <div className="relative hidden w-1/2 md:flex">
          <div className="w-full bg-[#4379EE29] bg-cover bg-no-repeat relative  bg-[url('/auth-bg.svg')]">
            <div className="absolute bottom-10 left-10 right-10">
              <div className="bg-[rgba(234,236,240,0.3)] backdrop-blur-lg border border-white/50 rounded-2xl p-6">
                <div className="flex items-center mb-8">
                  <img
                    src="pers-logo.svg"
                    alt="logo"
                    className="mr-2 w-[50px] h-[50px]"
                  />
                  <h4 className="m-0 text-xl">
                    <span className="mr-2 font-bold">PERSIANAS</span>
                    ONLINE PORTAL (POP)
                  </h4>
                </div>
                <div className="text-base">
                  Persianas represents the opportunity for partners to profitably
                  make their mark in Africa's largest and most dynamic marketplace.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full md:w-1/2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
