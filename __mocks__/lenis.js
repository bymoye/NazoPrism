/**
 * Mock for lenis library
 * 为测试环境提供 lenis 库的模拟实现
 */

// Mock Lenis class
class MockLenis {
  constructor(options = {}) {
    this.options = options;
    this.isRunning = false;
  }

  start() {
    this.isRunning = true;
  }

  stop() {
    this.isRunning = false;
  }

  destroy() {
    this.isRunning = false;
  }

  scrollTo(_target, _options = {}) {
    // Mock scroll behavior
  }

  on(_event, _callback) {
    // Mock event listener
  }

  off(_event, _callback) {
    // Mock event listener removal
  }
}

// Mock useLenis hook
const useLenis = (_callback, _deps) => {
  // Mock hook implementation
  return null;
};

// Mock ReactLenis component
const ReactLenis = ({ children }) => {
  return children;
};

// Export mocks
module.exports = MockLenis;
module.exports.useLenis = useLenis;
module.exports.ReactLenis = ReactLenis;
module.exports.default = MockLenis;
