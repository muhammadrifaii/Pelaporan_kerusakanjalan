import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Terjadi Kesalahan
            </h1>

            <p className="text-sm text-gray-500 mb-6">
              Aplikasi mengalami error yang tidak terduga. Silakan coba lagi.
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 bg-red-50 rounded-xl border border-red-100">
                <p className="text-xs font-mono text-red-700 text-left break-words max-h-24 overflow-y-auto">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.href = '/'
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Kembali ke Beranda
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
