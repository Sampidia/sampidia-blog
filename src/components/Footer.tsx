import Link from 'next/link';
import Image from 'next/image';
import { SVGProps } from 'react';
import { Mail, ShieldAlert } from 'lucide-react';

function Facebook(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
    </svg>
  );
}

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function Instagram(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function Pinterest(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M12.017 0C5.396 0 0 5.397 0 12.015c0 5.078 3.158 9.41 7.61 11.17-.107-.947-.2-2.395.043-3.428.22-.924 1.417-6.014 1.417-6.014s-.363-.722-.363-1.79c0-1.68.972-2.93 2.183-2.93 1.03 0 1.526.772 1.526 1.696 0 1.034-.66 2.583-.997 4.02-.283 1.196.6 2.17 1.782 2.17 2.14 0 3.784-2.257 3.784-5.51 0-2.88-2.07-4.897-5.033-4.897-3.43 0-5.44 2.568-5.44 5.223 0 1.035.398 2.147.9 2.758.1.12.115.228.085.348-.094.39-.302 1.23-.343 1.4-.055.227-.182.275-.417.165-1.547-.72-2.512-2.977-2.512-4.792 0-3.904 2.836-7.49 8.18-7.49 4.296 0 7.636 3.06 7.636 7.15 0 4.264-2.684 7.697-6.407 7.697-1.25 0-2.43-.65-2.83-1.42l-.77 2.93c-.28 1.066-1.037 2.407-1.545 3.235C8.852 23.945 10.386 24 12.017 24c6.62 0 12-5.38 12-12C24.017 5.397 18.637 0 12.017 0z"/>
    </svg>
  );
}

function Youtube(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.495 20.455 12 20.455 12 20.455s7.505 0 9.388-.511a3.002 3.002 0 0 0 2.11-2.107C24 15.947 24 12 24 12s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
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
    { name: 'Entertainment', path: '/entertainment' },
    { name: 'Lifestyle', path: '/lifestyle' }
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <Image
                src="/images/SamPidia.png"
                alt="SamPidia Logo"
                width={180}
                height={50}
                className="h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
                sizes="180px"
              />
            </Link>
            <p className="text-slate-300 text-sm max-w-md leading-relaxed">
              Your premier online hub covering breaking news, tech trends, sports updates, and modern lifestyle tips.
            </p>
            <div className="flex gap-3 flex-wrap">
              <a
                href="https://web.facebook.com/sampidiafan/"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-full bg-slate-800 hover:bg-sky-600 hover:text-white transition-all duration-200 shadow-sm"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://x.com/pidiasam"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-950 hover:text-white transition-all duration-200 shadow-sm"
                aria-label="X (formerly Twitter)"
              >
                <XIcon className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com/sampidia0/"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-full bg-slate-800 hover:bg-pink-600 hover:text-white transition-all duration-200 shadow-sm"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.pinterest.com/sampidiablog/"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-full bg-slate-800 hover:bg-red-600 hover:text-white transition-all duration-200 shadow-sm"
                aria-label="Pinterest"
              >
                <Pinterest className="h-4 w-4" />
              </a>
              <a
                href="https://www.youtube.com/@sampidia"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-full bg-slate-800 hover:bg-red-600 hover:text-white transition-all duration-200 shadow-sm"
                aria-label="Youtube"
              >
                <Youtube className="h-4 w-4" />
              </a>
              <a
                href="mailto:sampidiablog@gmail.com"
                className="p-2.5 rounded-full bg-slate-800 hover:bg-indigo-600 hover:text-white transition-all duration-200 shadow-sm"
                aria-label="Email support"
              >
                <Mail className="h-4 w-4" />
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
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>&copy; {currentYear} SamPidia. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-300 transition-colors cursor-pointer">
              Your Hub for News, Tech &amp; Sport
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
