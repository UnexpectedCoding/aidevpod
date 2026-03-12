// services/metrics.service.js

class MetricsService {
  constructor() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      agentsUsage: {}, // { pm: 2, dev: 3, ... }
      averageResponseTime: 0,
      totalResponseTime: 0,
    };
  }

  // Track a new request
  trackRequest() {
    this.metrics.totalRequests += 1;
  }

  // Track success
  trackSuccess(responseTime = 0) {
    this.metrics.successfulRequests += 1;
    this._updateResponseTime(responseTime);
  }

  // Track failure
  trackFailure(responseTime = 0) {
    this.metrics.failedRequests += 1;
    this._updateResponseTime(responseTime);
  }

  // Track agent usage
  trackAgentUsage(agentName) {
    if (!this.metrics.agentsUsage[agentName]) {
      this.metrics.agentsUsage[agentName] = 0;
    }
    this.metrics.agentsUsage[agentName] += 1;
  }

  // Private method to update average response time
  _updateResponseTime(responseTime) {
    this.metrics.totalResponseTime += responseTime;

    const totalHandled =
      this.metrics.successfulRequests + this.metrics.failedRequests;

    if (totalHandled > 0) {
      this.metrics.averageResponseTime =
        this.metrics.totalResponseTime / totalHandled;
    }
  }

  // Get all metrics
  getMetrics() {
    return {
      ...this.metrics,
      successRate:
        this.metrics.totalRequests > 0
          ? (
              (this.metrics.successfulRequests /
                this.metrics.totalRequests) *
              100
            ).toFixed(2) + "%"
          : "0%",
    };
  }

  // Reset metrics
  resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      agentsUsage: {},
      averageResponseTime: 0,
      totalResponseTime: 0,
    };
  }
}

module.exports = new MetricsService();