import Header from "@/components/Header";
import SearchInterface from "@/components/SearchInterface";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-glow/5 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-glow/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }}></div>
        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLCAyNDAsIDI1NSwgMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50"></div>
      </div>

      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 z-10 w-full max-w-5xl mx-auto">
        <div className="text-center space-y-6 mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white drop-shadow-lg">
            Advanced <span className="text-cyan-glow text-glow">OSINT</span> Analysis
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Protect yourself against modern cyber threats. Enter a phone number or scan a suspicious link to perform deep analysis across our global intelligence network.
          </p>
        </div>

        <SearchInterface />
      </main>

      <footer className="p-6 text-center text-slate-500 text-sm font-mono z-10 glass-panel border-x-0 border-b-0 rounded-none">
        <p>© {new Date().getFullYear()} TELISIX Intelligence Network. Secure Connection Established.</p>
      </footer>
    </div>
  );
}
