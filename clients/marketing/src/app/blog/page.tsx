import Link from 'next/link';
import { 
  ArrowLeft,
  ArrowRight,
  Clock,
  Profile as Person
} from 'iconsax-react';

export default function BlogPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={16} color="currentColor" variant="Outline" />
              <span>Back to home</span>
            </Link>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            The Zeiro Blog
          </h1>
    
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Insights, tutorials, and updates from the team building the future of data analysis.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-4 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Featured Post */}
            <div className="md:col-span-2 lg:col-span-3 bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">Featured</span>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Clock size={16} color="currentColor" variant="Outline" />
                    <span>5 min read</span>
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4 hover:text-gray-300 transition-colors">
                  <Link href="#">The Future of Natural Language Data Queries</Link>
                </h2>
                <p className="text-gray-400 leading-relaxed mb-6">
                  Explore how AI is transforming the way we interact with data, making complex analytics accessible to everyone through simple, conversational queries.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Person size={16} color="white" variant="Outline" />
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">Sarah Chen</div>
                      <div className="text-gray-400 text-xs">Head of Product</div>
                    </div>
                  </div>
                  <Link href="#" className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-2">
                    Read more
                    <ArrowRight size={16} color="currentColor" variant="Outline" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Regular Posts */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                  <Clock size={16} color="currentColor" variant="Outline" />
                  <span>3 min read</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 hover:text-gray-300 transition-colors">
                  <Link href="#">Getting Started with Zeiro: A Complete Guide</Link>
                </h3>
                <p className="text-gray-400 leading-relaxed mb-4">
                  Learn how to set up your first data connection and create your first dashboard in under 10 minutes.
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                    <Person size={12} color="white" variant="Outline" />
                  </div>
                  <div className="text-gray-400 text-sm">Mike Johnson</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                  <Clock size={16} color="currentColor" variant="Outline" />
                  <span>7 min read</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 hover:text-gray-300 transition-colors">
                  <Link href="#">5 Advanced SQL Techniques Made Simple</Link>
                </h3>
                <p className="text-gray-400 leading-relaxed mb-4">
                  Discover powerful SQL patterns that Zeiro uses behind the scenes to optimize your natural language queries.
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                    <Person size={12} color="white" variant="Outline" />
                  </div>
                  <div className="text-gray-400 text-sm">Alex Rivera</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                  <Clock size={16} color="currentColor" variant="Outline" />
                  <span>4 min read</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 hover:text-gray-300 transition-colors">
                  <Link href="#">Building Data-Driven Culture in Your Team</Link>
                </h3>
                <p className="text-gray-400 leading-relaxed mb-4">
                  Practical strategies for encouraging data literacy and making analytics accessible across your organization.
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <Person size={12} color="white" variant="Outline" />
                  </div>
                  <div className="text-gray-400 text-sm">Emma Davis</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                  <Clock size={16} color="currentColor" variant="Outline" />
                  <span>6 min read</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 hover:text-gray-300 transition-colors">
                  <Link href="#">Security Best Practices for Data Analytics</Link>
                </h3>
                <p className="text-gray-400 leading-relaxed mb-4">
                  Learn how to maintain security and compliance while democratizing data access in your organization.
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Person size={12} color="white" variant="Outline" />
                  </div>
                  <div className="text-gray-400 text-sm">David Kim</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                  <Clock size={16} color="currentColor" variant="Outline" />
                  <span>5 min read</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 hover:text-gray-300 transition-colors">
                  <Link href="#">Product Update: New Dashboard Features</Link>
                </h3>
                <p className="text-gray-400 leading-relaxed mb-4">
                  Discover the latest dashboard customization options and collaboration features in our newest release.
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                    <Person size={12} color="white" variant="Outline" />
                  </div>
                  <div className="text-gray-400 text-sm">Lisa Park</div>
                </div>
              </div>
            </div>

          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="bg-gray-800 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium">
              Load more posts
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Stay updated
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Get the latest insights and updates delivered to your inbox.
          </p>
          
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
            />
            <button className="bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
