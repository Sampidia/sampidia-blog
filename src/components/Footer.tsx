import Link from 'next/link';
import { BookOpen, Mail, Facebook, Twitter, ShieldAlert } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const policyLinks = [
    { name: 'About Us', path: '/about-sampidia' },
    { name: 'Disclaimer', path: '/disclaimer' },
    { name: 'DMCA Statement', path: '/dmca-statement' },
    { name: 'Privacy Policy', path: '/privacy-policy' }
  ];

  const categoryLinks = [
    { name: 'News', path: '/news' },
    { name: 'Tech', path: '/tech' },
    { name: 'Sports', path: '/sports' },
    { name: 'Jobs', path: '/jobs' },
    { name: 'Lifestyle', path: '/lifestyle' }
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="bg-sky-500 p-2 rounded-lg text-white group-hover:scale-105 transition-transform duration-200">
                <BookOpen className="h-6 w-6" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                SamPidia
              </span>
            </Link>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              Your premier online educational hub providing high-quality guidance for admissions, Post-UTME guidelines, scholarship updates, career training, recruitment opportunities, and graduate lifestyle tips.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full bg-slate-800 hover:bg-sky-600 hover:text-white transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full bg-slate-800 hover:bg-sky-400 hover:text-white transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="mailto:sampidiablog@gmail.com"
                className="p-2 rounded-full bg-slate-800 hover:bg-indigo-600 hover:text-white transition-colors duration-200"
                aria-label="Email support"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Categories Col */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Categories</h3>
            <ul className="space-y-3 text-sm">
              {categoryLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.path}
                    className="text-slate-400 hover:text-white hover:underline transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal / Policy Col */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Legal & Information</h3>
            <ul className="space-y-3 text-sm">
              {policyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.path}
                    className="text-slate-400 hover:text-white hover:underline transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 p-3 bg-slate-800/50 rounded-lg flex items-start gap-2 border border-slate-800 max-w-xs">
              <ShieldAlert className="h-5 w-5 text-sky-500 flex-shrink-0 mt-0.5" />
              <span className="text-[11px] text-slate-400 leading-normal">
                Strict adherence to copyright and digital protection laws. See our DMCA details.
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {currentYear} SamPidia. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 transition-colors cursor-pointer">
              Designed for Academic & Career Growth
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
