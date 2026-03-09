"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  onBack: () => void;
}

interface State {
  hasError: boolean;
}

/** 퀴즈 영역 렌더링 중 오류 시 예외 처리 (데이터 비어있음·파싱 오류 등) */
export default class QuizErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full bg-white flex flex-col items-center p-6 py-12">
          <div className="max-w-md w-full rounded-2xl border border-gray-200 bg-gray-50 p-8 shadow-sm text-center">
            <p className="text-gray-600 mb-2">퀴즈를 불러오는 중 문제가 생겼어요.</p>
            <p className="text-sm text-gray-500 mb-6">이전으로 돌아가 다시 시도해 주세요.</p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false });
                this.props.onBack();
              }}
              className="rounded-xl px-6 py-3 font-semibold text-[#212529] border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            >
              이전으로
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
