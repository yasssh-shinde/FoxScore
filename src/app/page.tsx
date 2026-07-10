import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0F19] text-white relative overflow-hidden flex flex-col justify-between">
      {/* Background decorative glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[#FF6B35]/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-15%] w-[65%] h-[65%] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 backdrop-blur-md border-b border-white/5 bg-[#0B0F19]/40">
        <div className="text-2xl font-black bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] bg-clip-text text-transparent tracking-tight">
          seofox<span className="text-white">.io</span>
        </div>
        <nav className="flex gap-6 text-sm font-semibold text-gray-300">
          <Link href="/contact" className="hover:text-[#FF6B35] transition-colors duration-200">
            Contact
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex items-center justify-center px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-4xl text-center">
          
          {/* Animated Badge */}
          <div
            className="animate-fade-in-scale delay-100 inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#FF6B35]/15 to-blue-500/15 border border-[#FF6B35]/20 shadow-sm"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B35] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6B35]"></span>
            </span>
            <span className="text-xs md:text-sm font-bold text-[#FF6B35] tracking-wide uppercase">🚀 Free Digital Audit</span>
          </div>

          {/* Main Headline */}
          <h1
            className="animate-fade-in-up delay-200 text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight text-white"
          >
            How Strong Is Your Business{' '}
            <span className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] bg-clip-text text-transparent block sm:inline">
              Online?
            </span>
          </h1>

          {/* Subheading */}
          <p
            className="animate-fade-in-up delay-300 text-lg md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto font-medium"
          >
            Get your comprehensive Digital Health Score in under 60 seconds and find areas to optimize.
          </p>

          {/* Features Grid */}
          <div
            className="animate-fade-in-up delay-400 grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-3xl mx-auto"
          >
            {[
              { 
                text: 'SEO Audit',
                icon: (
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )
              },
              { 
                text: 'Website Analysis',
                icon: (
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
              { 
                text: 'Social Score',
                icon: (
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 10.742l-2.084 1.157M8.684 12.738l2.085-1.157m1.117-2.924A2.5 2.5 0 1111 8a2.5 2.5 0 01-1.117-1.157zm0 9.848a2.5 2.5 0 111.117-4.829 2.5 2.5 0 01-1.117 4.829z" />
                  </svg>
                )
              },
              { 
                text: 'Google Check',
                icon: (
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )
              },
            ].map((item, i) => (
              <div 
                key={i} 
                className="glass-card bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04] p-5 rounded-2xl flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="p-3 bg-white/5 rounded-xl mb-3 shadow-inner">{item.icon}</div>
                <div className="text-sm font-semibold text-gray-200">{item.text}</div>
              </div>
            ))}
          </div>

          {/* Prize Card */}
          <div
            className="animate-fade-in-scale delay-500 glass-card mb-10 border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 to-transparent p-6 rounded-2xl max-w-md mx-auto shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-[-20%] right-[-20%] w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl" />
            <div className="flex items-center justify-center gap-4">
              <span className="text-4xl">🏆</span>
              <div className="text-left">
                <div className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                  Win Cash!
                </div>
                <p className="text-sm text-gray-400">Guess your Digital Health Score correctly to claim.</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div
            className="animate-fade-in-up delay-600"
          >
            <Link
              href="/challenge"
              className="inline-flex items-center gap-2 gradient-btn text-lg px-12 py-4.5 rounded-2xl hover:shadow-2xl hover:shadow-[#FF6B35]/30 hover:scale-[1.03] transition-all duration-300 font-extrabold"
            >
              <span>Start Free Challenge</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-6 text-center text-xs text-gray-500">
        <p>© 2026 SEOFox. All rights reserved.</p>
      </footer>
    </main>
  )
}
