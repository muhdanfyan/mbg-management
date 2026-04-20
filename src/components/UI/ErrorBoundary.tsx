import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home, ChevronRight } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-xl w-full">
            {/* Visual Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[#F0F7F7] rounded-3xl mb-6 text-[#1E8289] animate-pulse">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-bold text-[#164E4D] mb-4">
                Sistem Mengalami Kendala
              </h1>
              <p className="text-gray-500 text-lg">
                Kami mendeteksi gangguan pada modul ini. Jangan khawatir, data Anda tetap aman dalam sistem.
              </p>
            </div>

            {/* Support Box */}
            <div className="bg-[#F8FAF9] border border-[#E2E8F0] rounded-[2.5rem] p-8 mb-8">
               <div className="space-y-4">
                  <div className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded-xl bg-white border border-[#E2F8F3] flex items-center justify-center text-[#1E8289] shrink-0">
                        <RefreshCcw className="w-5 h-5" />
                     </div>
                     <div>
                        <h3 className="font-bold text-[#164E4D]">Langkah Pemulihan</h3>
                        <p className="text-sm text-gray-500">Coba muat ulang halaman untuk mengatur ulang state sistem.</p>
                     </div>
                  </div>
                  
                  <details className="group">
                    <summary className="text-xs font-bold text-[#1E8289] uppercase tracking-widest cursor-pointer list-none flex items-center gap-2 hover:opacity-80">
                      <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                      Detail Teknis (Untuk Admin)
                    </summary>
                    <div className="mt-4 p-4 bg-white rounded-xl border border-[#E2E8F0] text-[10px] font-mono text-red-600 overflow-auto max-h-40">
                      {this.state.error && this.state.error.toString()}
                      <br />
                      {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </div>
                  </details>
               </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-[#1E8289] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#1E8289]/20 hover:bg-[#166E74] transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <RefreshCcw className="w-5 h-5" />
                Muat Ulang Sekarang
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-white border border-[#E2E8F0] text-[#164E4D] font-bold py-4 rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Home className="w-5 h-5" />
                Kembali ke Beranda
              </button>
            </div>

            <p className="text-center mt-12 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
              Wahdah Dining Management System • v2.1-Stable
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
