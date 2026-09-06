import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 py-12 px-6 md:px-12 transition-colors duration-300">
      <div className="container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Brand Column */}
        <div className="space-y-3">
          <Link to="/" className="flex items-center gap-2 text-2xl font-black text-primary tracking-tight">
            {/* Pulse Activity Wave SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M22 12h-4l-3 9L9 3l-3 9H2"
              />
            </svg>
            <span className="text-slate-900 dark:text-white">CampusClinic</span>
          </Link>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed font-medium">
            Centralized Digital Healthcare Operating System for Campus Community.
          </p>
        </div>

        {/* Column 1: Services */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 tracking-wider uppercase mb-4">
            SERVICES
          </h4>
          <ul className="space-y-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400">
            <li>
              <Link to="/doctors" className="hover:text-primary dark:hover:text-primary transition-colors">
                Doctor Appointment
              </Link>
            </li>
            <li>
              <Link to="/doctors" className="hover:text-primary dark:hover:text-primary transition-colors">
                Telemedicine
              </Link>
            </li>
            <li>
              <Link to="/pharmacy" className="hover:text-primary dark:hover:text-primary transition-colors">
                Campus Pharmacy
              </Link>
            </li>
            <li>
              <Link to="/emergency" className="hover:text-primary dark:hover:text-primary transition-colors">
                Emergency Ambulance
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 2: Access Portals */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 tracking-wider uppercase mb-4">
            ACCESS PORTALS
          </h4>
          <ul className="space-y-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400">
            <li>
              <Link to="/dashboard/patient" className="hover:text-primary dark:hover:text-primary transition-colors">
                Patient Portal
              </Link>
            </li>
            <li>
              <Link to="/dashboard/doctor" className="hover:text-primary dark:hover:text-primary transition-colors">
                Doctor Portal
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-primary dark:hover:text-primary transition-colors">
                Administration
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Legal & Support */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 tracking-wider uppercase mb-4">
            LEGAL & SUPPORT
          </h4>
          <ul className="space-y-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400">
            <li>
              <Link to="/privacy-policy" className="hover:text-primary dark:hover:text-primary transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms-of-service" className="hover:text-primary dark:hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/health-guidelines" className="hover:text-primary dark:hover:text-primary transition-colors">
                Campus Health Guidelines
              </Link>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Copyright Divider */}
      <div className="container mx-auto max-w-7xl border-t border-slate-200 dark:border-slate-800 mt-10 pt-6 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
        © {new Date().getFullYear()} CampusClinic. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;