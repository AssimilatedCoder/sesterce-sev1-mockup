/**
 * Activity Logger Utility
 * Logs user activities (tab clicks, actions, etc.) to the backend
 */

interface ActivityLog {
  activity_type: 'tab_click' | 'calculation' | 'override_change' | 'login' | 'logout' | 'page_load';
  details: string;
}

class ActivityLogger {
  private baseUrl = 'http://localhost:7779';
  private isEnabled = true;

  /**
   * Get auth token from localStorage
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(): boolean {
    const expiry = localStorage.getItem('tokenExpiry');
    if (!expiry) return true;
    return Date.now() > parseInt(expiry);
  }

  /**
   * Log user activity to backend
   */
  async logActivity(activity_type: ActivityLog['activity_type'], details: string): Promise<void> {
    if (!this.isEnabled) return;

    const token = this.getAuthToken();
    if (!token || this.isTokenExpired()) {
      // Don't log if user is not authenticated
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/log-activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          activity_type,
          details
        })
      });

      if (!response.ok) {
        console.warn('Failed to log activity:', response.statusText);
      }
    } catch (error) {
      console.warn('Error logging activity:', error);
    }
  }

  /**
   * Log tab click
   */
  async logTabClick(tabId: string, tabLabel: string): Promise<void> {
    await this.logActivity('tab_click', `${tabId}: ${tabLabel}`);
  }

  /**
   * Log calculation performed
   */
  async logCalculation(calculationType: string, parameters?: any): Promise<void> {
    const details = parameters 
      ? `${calculationType} with params: ${JSON.stringify(parameters)}`
      : calculationType;
    await this.logActivity('calculation', details);
  }

  /**
   * Log override changes
   */
  async logOverrideChange(overrideType: string, value: any): Promise<void> {
    await this.logActivity('override_change', `${overrideType}: ${value}`);
  }

  /**
   * Log page load
   */
  async logPageLoad(page: string): Promise<void> {
    await this.logActivity('page_load', page);
  }

  /**
   * Log login
   */
  async logLogin(username: string): Promise<void> {
    await this.logActivity('login', `User: ${username}`);
  }

  /**
   * Log logout
   */
  async logLogout(username: string): Promise<void> {
    await this.logActivity('logout', `User: ${username}`);
  }

  /**
   * Enable/disable activity logging
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Batch log multiple activities (for performance)
   */
  async logBatch(activities: ActivityLog[]): Promise<void> {
    // For now, just log them individually
    // In the future, we could implement a batch endpoint
    for (const activity of activities) {
      await this.logActivity(activity.activity_type, activity.details);
    }
  }
}

// Export singleton instance
export const activityLogger = new ActivityLogger();

// Export types
export type { ActivityLog };
