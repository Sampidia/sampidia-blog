import Link from 'next/link';
import { SVGProps } from 'react';
import { BookOpen, Mail, ShieldAlert } from 'lucide-react';

function Facebook(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function Twitter(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

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
