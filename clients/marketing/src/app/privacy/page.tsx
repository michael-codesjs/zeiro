import Link from 'next/link';
import { 
  ArrowLeft,
  Shield,
  Eye,
  Lock,
  People,
  DocumentText,
  Setting2 as Settings,
  Global,
  Clock
} from 'iconsax-react';

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mt-6">
              <Clock size={16} color="currentColor" variant="Outline" />
              <span>Last updated: December 2024</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Overview */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield size={32} color="#60a5fa" variant="Outline" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Data Protection</h3>
              <p className="text-gray-400 text-sm">We use industry-standard encryption and security measures to protect your data.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Eye size={32} color="#4ade80" variant="Outline" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Transparency</h3>
              <p className="text-gray-400 text-sm">We're clear about what data we collect and how we use it.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <People size={32} color="#c084fc" variant="Outline" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Your Rights</h3>
              <p className="text-gray-400 text-sm">You have full control over your personal information and can request changes anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-invert prose-lg max-w-none">
            
            {/* Information We Collect */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <DocumentText size={20} color="#60a5fa" variant="Outline" />
                </div>
                <h2 className="text-2xl font-bold text-white m-0">Information We Collect</h2>
              </div>
              
              <div className="space-y-6 text-gray-300">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Personal Information</h3>
                  <p className="mb-4">When you create an account or use our services, we may collect:</p>
                  <ul className="space-y-2 ml-6">
                    <li>• Name and email address</li>
                    <li>• Company information and job title</li>
                    <li>• Contact information</li>
                    <li>• Payment and billing information</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Usage Data</h3>
                  <p className="mb-4">We automatically collect information about how you use our platform:</p>
                  <ul className="space-y-2 ml-6">
                    <li>• Log data and analytics</li>
                    <li>• Device and browser information</li>
                    <li>• IP address and location data</li>
                    <li>• Cookies and similar technologies</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Data You Upload</h3>
                  <p className="mb-4">When using our data analysis platform:</p>
                  <ul className="space-y-2 ml-6">
                    <li>• Database connections and queries</li>
                    <li>• Uploaded files and datasets</li>
                    <li>• Dashboard configurations</li>
                    <li>• Custom reports and visualizations</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* How We Use Information */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Settings size={20} color="#4ade80" variant="Outline" />
                </div>
                <h2 className="text-2xl font-bold text-white m-0">How We Use Your Information</h2>
              </div>
              
              <div className="space-y-4 text-gray-300">
                <p>We use the information we collect to:</p>
                <ul className="space-y-2 ml-6">
                  <li>• Provide and improve our data analysis services</li>
                  <li>• Process your queries and generate insights</li>
                  <li>• Communicate with you about your account and our services</li>
                  <li>• Provide customer support and technical assistance</li>
                  <li>• Send important updates and security notifications</li>
                  <li>• Analyze usage patterns to improve our platform</li>
                  <li>• Comply with legal obligations and prevent fraud</li>
                </ul>
              </div>
            </div>

            {/* Data Sharing */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Global size={20} color="#c084fc" variant="Outline" />
                </div>
                <h2 className="text-2xl font-bold text-white m-0">Data Sharing and Disclosure</h2>
              </div>
              
              <div className="space-y-4 text-gray-300">
                <p>We do not sell your personal information. We may share your information only in these limited circumstances:</p>
                <ul className="space-y-2 ml-6">
                  <li>• <strong>Service Providers:</strong> Trusted third parties who help us operate our platform</li>
                  <li>• <strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li>• <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                  <li>• <strong>With Your Consent:</strong> When you explicitly agree to share your information</li>
                </ul>
              </div>
            </div>

            {/* Data Security */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Lock size={20} color="#fb923c" variant="Outline" />
                </div>
                <h2 className="text-2xl font-bold text-white m-0">Data Security</h2>
              </div>
              
              <div className="space-y-4 text-gray-300">
                <p>We implement comprehensive security measures to protect your information:</p>
                <ul className="space-y-2 ml-6">
                  <li>• End-to-end encryption for data in transit and at rest</li>
                  <li>• Regular security audits and penetration testing</li>
                  <li>• Multi-factor authentication and access controls</li>
                  <li>• SOC 2 Type II compliance</li>
                  <li>• GDPR and CCPA compliance</li>
                  <li>• Regular employee security training</li>
                </ul>
              </div>
            </div>

            {/* Your Rights */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <People size={20} color="#22d3ee" variant="Outline" />
                </div>
                <h2 className="text-2xl font-bold text-white m-0">Your Privacy Rights</h2>
              </div>
              
              <div className="space-y-4 text-gray-300">
                <p>You have the following rights regarding your personal information:</p>
                <ul className="space-y-2 ml-6">
                  <li>• <strong>Access:</strong> Request a copy of your personal data</li>
                  <li>• <strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li>• <strong>Deletion:</strong> Request deletion of your personal data</li>
                  <li>• <strong>Portability:</strong> Export your data in a machine-readable format</li>
                  <li>• <strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                  <li>• <strong>Restriction:</strong> Limit how we process your information</li>
                </ul>
                <p className="mt-4">To exercise these rights, contact us at <a href="mailto:privacy@zeiro.com" className="text-blue-400 hover:text-blue-300">privacy@zeiro.com</a></p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6">Contact Us</h2>
              <div className="space-y-4 text-gray-300">
                <p>If you have questions about this Privacy Policy or our data practices, please contact us:</p>
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                  <p><strong>Email:</strong> <a href="mailto:privacy@zeiro.com" className="text-blue-400 hover:text-blue-300">privacy@zeiro.com</a></p>
                  <p><strong>Address:</strong> Zeiro Inc., 123 Data Street, Analytics City, AC 12345</p>
                  <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                </div>
              </div>
            </div>

            {/* Updates */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6">Policy Updates</h2>
              <div className="space-y-4 text-gray-300">
                <p>We may update this Privacy Policy from time to time. When we do, we will:</p>
                <ul className="space-y-2 ml-6">
                  <li>• Post the updated policy on this page</li>
                  <li>• Update the "Last updated" date at the top</li>
                  <li>• Notify you of significant changes via email</li>
                  <li>• Provide a 30-day notice for material changes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
