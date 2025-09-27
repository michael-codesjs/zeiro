import Link from 'next/link';
import { 
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  Setting2 as Settings,
  DocumentText,
  People,
  Global,
  Flash,
  TickCircle as Check,
  Warning2,
  Clock
} from 'iconsax-react';

export default function SecurityPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={16} color="currentColor" variant="Outline" />
              <span>Back to home</span>
            </Link>
          </div>
          
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Security at Zeiro
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Your data security is our top priority. Learn about the comprehensive measures we take to protect your information.
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mt-6">
              <Clock size={16} color="currentColor" variant="Outline" />
              <span>Last updated: December 2024</span>
            </div>
          </div>
        </div>
      </section>

      {/* Security Overview */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield size={32} color="#60a5fa" variant="Outline" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">SOC 2 Compliant</h3>
              <p className="text-muted-foreground text-sm">Independently audited security controls and processes.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Lock size={32} color="#4ade80" variant="Outline" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">End-to-End Encryption</h3>
              <p className="text-muted-foreground text-sm">AES-256 encryption for data in transit and at rest.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Eye size={32} color="#c084fc" variant="Outline" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">24/7 Monitoring</h3>
              <p className="text-muted-foreground text-sm">Continuous security monitoring and threat detection.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <People size={32} color="#fb923c" variant="Outline" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Access Controls</h3>
              <p className="text-muted-foreground text-sm">Multi-factor authentication and role-based permissions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Measures */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-invert prose-lg max-w-none">
            
            {/* Data Protection */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Lock size={20} color="#60a5fa" variant="Outline" />
                </div>
                <h2 className="text-2xl font-bold text-foreground m-0">Data Protection</h2>
              </div>
              
              <div className="space-y-6 text-muted-foreground">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Encryption Standards</h3>
                  <ul className="space-y-2 ml-6">
                    <li>• <strong>Data in Transit:</strong> TLS 1.3 encryption for all data transmission</li>
                    <li>• <strong>Data at Rest:</strong> AES-256 encryption for stored data</li>
                    <li>• <strong>Database Encryption:</strong> Encrypted database storage with key rotation</li>
                    <li>• <strong>Backup Encryption:</strong> All backups are encrypted and stored securely</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Data Isolation</h3>
                  <ul className="space-y-2 ml-6">
                    <li>• Multi-tenant architecture with strict data separation</li>
                    <li>• Customer data is logically isolated and never shared</li>
                    <li>• Dedicated encryption keys per customer</li>
                    <li>• Secure data processing in isolated environments</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Infrastructure Security */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Global size={20} color="#4ade80" variant="Outline" />
                </div>
                <h2 className="text-2xl font-bold text-foreground m-0">Infrastructure Security</h2>
              </div>
              
              <div className="space-y-6 text-muted-foreground">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Cloud Security</h3>
                  <ul className="space-y-2 ml-6">
                    <li>• Hosted on AWS with enterprise-grade security</li>
                    <li>• Virtual Private Cloud (VPC) with network isolation</li>
                    <li>• Web Application Firewall (WAF) protection</li>
                    <li>• DDoS protection and traffic filtering</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Network Security</h3>
                  <ul className="space-y-2 ml-6">
                    <li>• Private subnets for sensitive components</li>
                    <li>• Network Access Control Lists (NACLs)</li>
                    <li>• Security groups with least-privilege access</li>
                    <li>• Regular network penetration testing</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Access Management */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <People size={20} color="#c084fc" variant="Outline" />
                </div>
                <h2 className="text-2xl font-bold text-foreground m-0">Access Management</h2>
              </div>
              
              <div className="space-y-6 text-muted-foreground">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Authentication</h3>
                  <ul className="space-y-2 ml-6">
                    <li>• Multi-factor authentication (MFA) required</li>
                    <li>• Single Sign-On (SSO) integration available</li>
                    <li>• Strong password requirements enforced</li>
                    <li>• Session management with automatic timeouts</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Authorization</h3>
                  <ul className="space-y-2 ml-6">
                    <li>• Role-based access control (RBAC)</li>
                    <li>• Principle of least privilege</li>
                    <li>• Granular permissions management</li>
                    <li>• Regular access reviews and audits</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Monitoring and Detection */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Eye size={20} color="#fb923c" variant="Outline" />
                </div>
                <h2 className="text-2xl font-bold text-foreground m-0">Monitoring and Detection</h2>
              </div>
              
              <div className="space-y-6 text-muted-foreground">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Security Monitoring</h3>
                  <ul className="space-y-2 ml-6">
                    <li>• 24/7 security operations center (SOC)</li>
                    <li>• Real-time threat detection and alerting</li>
                    <li>• Automated incident response procedures</li>
                    <li>• Comprehensive audit logging</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Vulnerability Management</h3>
                  <ul className="space-y-2 ml-6">
                    <li>• Regular vulnerability scans and assessments</li>
                    <li>• Automated security patching</li>
                    <li>• Third-party security audits</li>
                    <li>• Bug bounty program for responsible disclosure</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Compliance and Certifications */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <DocumentText size={20} color="#22d3ee" variant="Outline" />
                </div>
                <h2 className="text-2xl font-bold text-foreground m-0">Compliance and Certifications</h2>
              </div>
              
              <div className="space-y-6 text-muted-foreground">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Industry Standards</h3>
                  <ul className="space-y-2 ml-6">
                    <li>• <strong>SOC 2 Type II:</strong> Annual audits of security controls</li>
                    <li>• <strong>ISO 27001:</strong> Information security management certification</li>
                    <li>• <strong>GDPR:</strong> European data protection regulation compliance</li>
                    <li>• <strong>CCPA:</strong> California Consumer Privacy Act compliance</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Data Residency</h3>
                  <ul className="space-y-2 ml-6">
                    <li>• Data stored in geographically appropriate regions</li>
                    <li>• Compliance with local data sovereignty laws</li>
                    <li>• Customer control over data location preferences</li>
                    <li>• Cross-border data transfer protections</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Incident Response */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <Flash size={20} color="#f87171" variant="Outline" />
                </div>
                <h2 className="text-2xl font-bold text-foreground m-0">Incident Response</h2>
              </div>
              
              <div className="space-y-6 text-muted-foreground">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Response Plan</h3>
                  <ul className="space-y-2 ml-6">
                    <li>• Documented incident response procedures</li>
                    <li>• Dedicated security incident response team</li>
                    <li>• 24/7 emergency response capabilities</li>
                    <li>• Regular incident response drills and testing</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Communication</h3>
                  <ul className="space-y-2 ml-6">
                    <li>• Prompt notification of security incidents</li>
                    <li>• Transparent communication during incidents</li>
                    <li>• Post-incident reports and lessons learned</li>
                    <li>• Regular security updates via our status page</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Employee Security */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Settings size={20} color="#facc15" variant="Outline" />
                </div>
                <h2 className="text-2xl font-bold text-foreground m-0">Employee Security</h2>
              </div>
              
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Security Training</h3>
                  <ul className="space-y-2 ml-6">
                    <li>• Mandatory security awareness training for all employees</li>
                    <li>• Regular phishing simulation exercises</li>
                    <li>• Specialized training for security-sensitive roles</li>
                    <li>• Annual security training updates</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Access Controls</h3>
                  <ul className="space-y-2 ml-6">
                    <li>• Background checks for all employees</li>
                    <li>• Principle of least privilege for system access</li>
                    <li>• Regular access reviews and deprovisioning</li>
                    <li>• Secure development practices and code reviews</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Security Best Practices */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Check size={20} color="#4ade80" variant="Outline" />
                </div>
                <h2 className="text-2xl font-bold text-foreground m-0">Your Security Best Practices</h2>
              </div>
              
              <div className="space-y-4 text-muted-foreground">
                <p>While we implement comprehensive security measures, you can help protect your account by:</p>
                <ul className="space-y-2 ml-6">
                  <li>• Using strong, unique passwords</li>
                  <li>• Enabling multi-factor authentication</li>
                  <li>• Regularly reviewing account activity</li>
                  <li>• Keeping your devices and browsers updated</li>
                  <li>• Being cautious with public Wi-Fi</li>
                  <li>• Reporting suspicious activity immediately</li>
                </ul>
              </div>
            </div>

            {/* Contact Security Team */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">Contact Our Security Team</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>If you have security concerns or want to report a vulnerability:</p>
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                  <p><strong>Security Email:</strong> <a href="mailto:security@zeiro.com" className="text-blue-400 hover:text-blue-300">security@zeiro.com</a></p>
                  <p><strong>Bug Bounty:</strong> <a href="mailto:bounty@zeiro.com" className="text-blue-400 hover:text-blue-300">bounty@zeiro.com</a></p>
                  <p><strong>Emergency:</strong> +1 (555) 123-SECURITY</p>
                  <p><strong>PGP Key:</strong> <a href="/security-pgp-key.txt" className="text-blue-400 hover:text-blue-300">Download Public Key</a></p>
                </div>
              </div>
            </div>

            {/* Security Updates */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">Stay Informed</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>Stay up to date with our security practices:</p>
                <ul className="space-y-2 ml-6">
                  <li>• Follow our <Link href="/status" className="text-blue-400 hover:text-blue-300">status page</Link> for security updates</li>
                  <li>• Subscribe to security notifications in your account settings</li>
                  <li>• Review our <Link href="/privacy" className="text-blue-400 hover:text-blue-300">privacy policy</Link> for data handling practices</li>
                  <li>• Check our <Link href="/blog" className="text-blue-400 hover:text-blue-300">blog</Link> for security-related announcements</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
