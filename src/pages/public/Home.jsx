import { Link } from 'react-router-dom';
import bannerImg from '../../banner.jpg'; // src ফোল্ডার থেকে ইমেজ ইমপোর্ট করা হলো

const Home = () => {
  return (
    <div className="space-y-16 pb-12">
      {/* Hero Banner Section with Local Image */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-base-100 to-base-200 py-16 md:py-24 px-4 md:px-8 border-b border-base-200">
        
        {/* Background Banner Image */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <img
            src={bannerImg}
            alt="Campus Clinic Background Banner"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Soft Gradient Overlay for Readability */}
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-base-100 via-transparent to-base-100/80 pointer-events-none"></div>

        {/* Hero Main Content */}
        <div className="container mx-auto max-w-6xl text-center relative z-10 space-y-10">
          
          {/* Top Badge */}
          <div>
            <span className="badge badge-primary badge-outline px-4 py-3 font-semibold text-xs md:text-sm shadow-sm bg-base-100/90 backdrop-blur">
              🏥 24/7 Campus Medical Support System
            </span>
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight tracking-tight">
              Centralized Digital Healthcare for <span className="text-primary">Campus Community</span>
            </h1>
            <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto font-medium">
              Book doctor appointments, order medicines from campus pharmacy, and request emergency ambulance support — all in one unified platform.
            </p>
          </div>

          {/* 3 Key Service Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 max-w-5xl mx-auto">
            
            {/* Card 1: Doctor Appointments */}
            <Link
              to="/doctors"
              className="card bg-base-100/85 backdrop-blur-md border border-base-200/80 shadow-md hover:shadow-2xl hover:border-primary/40 hover:-translate-y-1.5 transition-all duration-300 p-6 text-left flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  👨‍⚕️
                </div>
                <h3 className="font-bold text-lg text-gray-800 group-hover:text-primary transition-colors">
                  Doctor Appointments
                </h3>
                <p className="text-gray-500 text-xs md:text-sm mt-2 leading-relaxed">
                  Schedule visits with campus doctors, view available slots, and get digital prescriptions.
                </p>
              </div>
              <div className="mt-5 text-primary font-bold text-xs md:text-sm flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
                Browse Doctors <span>→</span>
              </div>
            </Link>

            {/* Card 2: Campus Pharmacy */}
            <Link
              to="/pharmacy"
              className="card bg-base-100/85 backdrop-blur-md border border-base-200/80 shadow-md hover:shadow-2xl hover:border-primary/40 hover:-translate-y-1.5 transition-all duration-300 p-6 text-left flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  💊
                </div>
                <h3 className="font-bold text-lg text-gray-800 group-hover:text-primary transition-colors">
                  Campus Pharmacy
                </h3>
                <p className="text-gray-500 text-xs md:text-sm mt-2 leading-relaxed">
                  Check stock availability and order essential medicines directly from the campus pharmacy.
                </p>
              </div>
              <div className="mt-5 text-primary font-bold text-xs md:text-sm flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
                View Pharmacy <span>→</span>
              </div>
            </Link>

            {/* Card 3: Emergency Ambulance */}
            <Link
              to="/emergency"
              className="card bg-base-100/85 backdrop-blur-md border border-base-200/80 shadow-md hover:shadow-2xl hover:border-error/40 hover:-translate-y-1.5 transition-all duration-300 p-6 text-left flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-error/10 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  🚑
                </div>
                <h3 className="font-bold text-lg text-gray-800 group-hover:text-error transition-colors">
                  Emergency Ambulance
                </h3>
                <p className="text-gray-500 text-xs md:text-sm mt-2 leading-relaxed">
                  Immediate ambulance dispatch for critical situations with 24/7 hotline numbers.
                </p>
              </div>
              <div className="mt-5 text-error font-bold text-xs md:text-sm flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
                Request Ambulance <span>→</span>
              </div>
            </Link>

          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              to="/doctors"
              className="btn btn-primary text-white btn-md md:btn-lg font-bold shadow-lg hover:shadow-primary/30 px-8 rounded-xl"
            >
              Find Doctors & Book
            </Link>
            <Link
              to="/emergency"
              className="btn btn-error text-white btn-md md:btn-lg font-bold shadow-lg hover:shadow-error/30 px-8 rounded-xl"
            >
              🚨 Emergency Ambulance
            </Link>
          </div>

        </div>
      </section>

      {/* Emergency Bottom Callout */}
      <section className="container mx-auto max-w-6xl px-6">
        <div className="bg-gradient-to-r from-error/10 via-error/5 to-base-100 border border-error/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <h3 className="text-2xl font-bold text-error flex items-center gap-2">
              <span>🚨</span> Facing a Medical Emergency?
            </h3>
            <p className="text-gray-600 text-sm md:text-base mt-1">
              Our emergency ambulance team is on standby 24/7 inside the campus premises.
            </p>
          </div>
          <Link
            to="/emergency"
            className="btn btn-error text-white btn-md px-8 font-bold whitespace-nowrap shadow-md rounded-xl"
          >
            Call Emergency Dispatch
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;