import { assets } from "../assets/assets";
import { FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <div className="bg-black text-white py-12">
      <div className="container mx-auto px-6 md:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <h1 className="text-2xl font-bold mb-4">Books</h1>
            <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
              Books Delivered. Imagination Unlimited. Your one-stop destination
              for all your reading needs.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h1 className="text-xl font-semibold mb-4">Quick Links</h1>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="/books"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  All Books
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h1 className="text-xl font-semibold mb-4">Contact</h1>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start">
                <span className="min-w-[80px]">Email:</span>
                <span>samy@gmail.com</span>
              </li>
              <li className="flex items-start">
                <span className="min-w-[80px]">Phone:</span>
                <span>+20 10 123 4561</span>
              </li>
              <li className="flex items-start">
                <span className="min-w-[80px]">Address:</span>
                <span>MMEC, Mullana - 133207</span>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h1 className="text-xl font-semibold mb-4">We Accept</h1>
            <div className="flex items-center gap-4">
              <img
                className="w-13 h-8 object-contain rounded"
                src={assets.visa}
                alt="Visa"
              />
              <img
                className="w-13 h-8 object-contain rounded"
                src={assets.mastercard}
                alt="Mastercard"
              />
              <img
                className="w-13 h-8 object-contain rounded"
                src={assets.amercanExpress}
                alt="American Express"
              />
            </div>

            {/* Social Media (Optional) */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3">Follow Us</h2>
              <div className="flex items-center gap-4">
                <FaFacebook className="w-8 h-8 fill-[#1877F2] bg-white rounded-full flex items-center justify-center  transition-colors cursor-pointer" />
                <FaTwitter className="w-8 h-8 fill-[#1DA1F2]  bg-white rounded-full flex items-center justify-center  transition-colors cursor-pointer" />
                <FaLinkedin className="w-8 h-8 fill-[#0077B5] bg-white rounded-full flex items-center justify-center  transition-colors cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Books Store. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
