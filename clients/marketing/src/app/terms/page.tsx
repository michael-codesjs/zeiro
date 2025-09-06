import Link from 'next/link';
import { 
  ArrowLeft,
  DocumentText,
  Shield,
  People,
  Setting2 as Settings,
  Warning2,
  TickCircle as Check,
  CloseCircle as X,
  Clock
} from 'iconsax-react';

export default function TermsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={16} color="currentColor" variant="Outline" />
              <span>Back to home</span>
            </Link>
          </div>
          
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              These terms govern your use of Zeiro's data analysis platform and services.
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mt-6">
              <Clock size={16} color="currentColor" variant="Outline" />
              <span>Last updated: December 2024</span>
            </div>
          </div>
        </div>
      </section>

      {/* Key Points */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Check size={32} color="#4ade80" variant="Outline" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Fair Use</h3>
              <p className="text-gray-400 text-sm">Use our platform responsibly and in accordance with applicable laws.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield size={32} color="#60a5fa" variant="Outline" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Data Rights</h3>
              <p className="text-gray-400 text-sm">You retain ownership of your data while granting us necessary permissions to provide our services.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Warning2 size={32} color="#fb923c" variant="Outline" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Limitations</h3>
              <p className="text-gray-400 text-sm">Our liability is limited as outlined in these terms to protect both parties.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-invert prose-lg max-w-none">
            
            {/* Acceptance of Terms */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <DocumentText size={20} color="#60a5fa" variant="Outline" />
                </div>
                <h2 className="text-2xl font-bold text-white m-0">Acceptance of Terms</h2>
              </div>
              
              <div className="space-y-4 text-gray-300">
                <p>By accessing or using Zeiro's services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.</p>
                <p>These terms apply to all users of our platform, including free trial users, paid subscribers, and enterprise customers.</p>
              </div>
            </div>

            {/* Description of Service */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Settings size={20} color="#4ade80" variant="Outline" />
                </div>
                <h2 className="text-2xl font-bold text-white m-0">Description of Service</h2>
              </div>
              
              <div className="space-y-4 text-gray-300">
                <p>Zeiro provides a cloud-based data analysis platform that enables users to:</p>
                <ul className="space-y-2 ml-6">
                  <li>• Connect to various data sources and databases</li>
                  <li>• Perform natural language queries on their data</li>
                  <li>• Create visualizations and dashboards</li>
                  <li>• Generate automated reports and insights</li>
                  <li>• Collaborate with team members on data projects</li>
                </ul>
                <p>We reserve the right to modify, suspend, or discontinue any part of our service at any time with reasonable notice.</p>
              </div>
            </div>

            {/* User Accounts */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <People size={20} color="#c084fc" variant="Outline" />
                </div>
                <h2 className="text-2xl font-bold text-white m-0">User Accounts and Responsibilities</h2>
              </div>
              
              <div className="space-y-6 text-gray-300">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Account Creation</h3>
                  <ul className="space-y-2 ml-6">
                    <li>• You must provide accurate and complete information</li>
                    <li>• You are responsible for maintaining account security</li>
                    <li>• You must be at least 18 years old to create an account</li>
                    <li>• One person or entity may not maintain multiple accounts</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Account Security</h3>
                  <ul className="space-y-2 ml-6">
                    <li>• Keep your login credentials confidential</li>
                    <li>• Enable two-factor authentication when available</li>
                    <li>• Notify us immediately of any unauthorized access</li>
                    <li>• You are liable for all activities under your account</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Acceptable Use */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Check size={20} color="#4ade80" variant="Outline" />
                </div>
                <h2 className="text-2xl font-bold text-white m-0">Acceptable Use Policy</h2>
              </div>
              
              <div className="space-y-6 text-gray-300">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Permitted Uses</h3>
                  <ul className="space-y-2 ml-6">
                    <li>• Analyze your own data or data you have permission to use</li>
                    <li>• Create reports and visualizations for business purposes</li>
                    <li>• Collaborate with authorized team members</li>
                    <li>• Integrate with approved third-party services</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Prohibited Uses</h3>
                  <ul className="space-y-2 ml-6">
                    <li>• Upload or analyze data you don't have rights to use</li>
                    <li>• Attempt to reverse engineer our platform</li>
                    <li>• Use our service for illegal or harmful activities</li>
                    <li>• Violate any applicable laws or regulations</li>
                    <li>• Interfere with other users' access to the service</li>
                    <li>• Attempt to gain unauthorized access to our systems</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Data and Privacy */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <Shield size={20} color="#22d3ee" variant="Outline" />
                </div>
                <h2 className="text-2xl font-bold text-white m-0">Data Ownership and Privacy</h2>
              </div>
              
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Your Data</h3>
                  <ul className="space-y-2 ml-6">
                    <li>• You retain all rights to your data</li>
                    <li>• You grant us permission to process your data to provide our services</li>
                    <li>• We will not share your data with third parties without your consent</li>
                    <li>• You can export or delete your data at any time</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Our Responsibilities</h3>
                  <ul className="space-y-2 ml-6">
                    <li>• Implement appropriate security measures</li>
                    <li>• Process data only as necessary to provide services</li>
                    <li>• Comply with applicable data protection laws</li>
                    <li>• Notify you of any data breaches promptly</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <DocumentText size={20} color="#facc15" variant="Outline" />
                </div>
                <h2 className="text-2xl font-bold text-white m-0">Payment and Billing</h2>
              </div>
              
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Subscription Plans</h3>
                  <ul className="space-y-2 ml-6">
                    <li>• Fees are charged in advance on a monthly or annual basis</li>
                    <li>• All fees are non-refundable except as required by law</li>
                    <li>• We may change pricing with 30 days notice</li>
                    <li>• Taxes are your responsibility unless otherwise stated</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Cancellation</h3>
                  <ul className="space-y-2 ml-6">
                    <li>• You may cancel your subscription at any time</li>
                    <li>• Cancellation takes effect at the end of your billing period</li>
                    <li>• We may suspend or terminate accounts for non-payment</li>
                    <li>• Data may be deleted after account termination</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Limitation of Liability */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Warning2 size={20} color="#fb923c" variant="Outline" />
                </div>
                <h2 className="text-2xl font-bold text-white m-0">Limitation of Liability</h2>
              </div>
              
              <div className="space-y-4 text-gray-300">
                <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
                <ul className="space-y-2 ml-6">
                  <li>• Our services are provided "as is" without warranties</li>
                  <li>• We are not liable for indirect, incidental, or consequential damages</li>
                  <li>• Our total liability is limited to the amount you paid in the last 12 months</li>
                  <li>• We do not guarantee uninterrupted or error-free service</li>
                  <li>• You are responsible for backing up your data</li>
                </ul>
              </div>
            </div>

            {/* Termination */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <X size={20} color="#f87171" variant="Outline" />
                </div>
                <h2 className="text-2xl font-bold text-white m-0">Termination</h2>
              </div>
              
              <div className="space-y-4 text-gray-300">
                <p>We may terminate or suspend your account immediately if you:</p>
                <ul className="space-y-2 ml-6">
                  <li>• Violate these terms of service</li>
                  <li>• Fail to pay applicable fees</li>
                  <li>• Engage in fraudulent or illegal activities</li>
                  <li>• Pose a security risk to our platform or other users</li>
                </ul>
                <p>Upon termination, your right to use the service ceases immediately, and we may delete your data after a reasonable grace period.</p>
              </div>
            </div>

            {/* Changes to Terms */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6">Changes to These Terms</h2>
              <div className="space-y-4 text-gray-300">
                <p>We may update these terms from time to time. When we do:</p>
                <ul className="space-y-2 ml-6">
                  <li>• We will post the updated terms on this page</li>
                  <li>• We will update the "Last updated" date</li>
                  <li>• We will notify you of material changes via email</li>
                  <li>• Continued use of our service constitutes acceptance of new terms</li>
                </ul>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6">Contact Us</h2>
              <div className="space-y-4 text-gray-300">
                <p>If you have questions about these Terms of Service, please contact us:</p>
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                  <p><strong>Email:</strong> <a href="mailto:legal@zeiro.com" className="text-blue-400 hover:text-blue-300">legal@zeiro.com</a></p>
                  <p><strong>Address:</strong> Zeiro Inc., 123 Data Street, Analytics City, AC 12345</p>
                  <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
