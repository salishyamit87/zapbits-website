export default function Features() {
  const features = [
    {
      title: "Zero Configuration",
      description: "Get started in minutes without complex network setup. Our platform handles everything automatically.",
      icon: "⚡"
    },
    {
      title: "Military Grade Security",
      description: "End-to-end encryption ensures your data remains private and secure across all connections.",
      icon: "🔒"
    },
    {
      title: "Cross Platform",
      description: "Works seamlessly on Windows, Mac, Linux, iOS, and Android devices.",
      icon: "🔄"
    },
    {
      title: "Easy Management",
      description: "Simple dashboard to manage all your nodes, users, and access controls.",
      icon: "🎛️"
    },
    {
      title: "High Performance",
      description: "Optimized routing and low latency connections for the best user experience.",
      icon: "🚀"
    },
    {
      title: "24/7 Support",
      description: "Round-the-clock support to help you with any issues or questions.",
      icon: "🛟"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Why Choose ZapBits?</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Enterprise-grade secure networking made simple for teams of all sizes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-blue-600 rounded-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="mb-6 opacity-90">Join thousands of teams using ZapBits for secure networking.</p>
            <a 
              href="/signup"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Start Free Trial
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}