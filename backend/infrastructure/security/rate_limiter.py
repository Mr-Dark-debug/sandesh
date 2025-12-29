import time
from typing import Dict, List, Tuple
from collections import defaultdict

class RateLimiter:
    """
    Simple in-memory rate limiter using a sliding window algorithm.
    """
    _instance = None

    def __init__(self):
        # Dictionary to store timestamps for each key: key -> list of timestamps
        self.requests: Dict[str, List[float]] = defaultdict(list)

    @classmethod
    def get_instance(cls):
        """Singleton accessor."""
        if cls._instance is None:
            cls._instance = RateLimiter()
        return cls._instance

    def is_allowed(self, key: str, limit: int, window_seconds: int) -> bool:
        """
        Check if a request is allowed for the given key.

        Args:
            key: Unique identifier (e.g., IP address or username)
            limit: Max number of requests allowed in the window
            window_seconds: Time window in seconds

        Returns:
            True if allowed, False if limit exceeded
        """
        now = time.time()
        window_start = now - window_seconds

        # Get existing timestamps for this key
        timestamps = self.requests[key]

        # Filter out timestamps older than the window
        # This effectively slides the window and cleans up old data
        valid_timestamps = [t for t in timestamps if t > window_start]

        if len(valid_timestamps) >= limit:
            # Update the list with valid ones just to be clean (optional but good for memory)
            self.requests[key] = valid_timestamps
            return False

        # Add current timestamp
        valid_timestamps.append(now)
        self.requests[key] = valid_timestamps

        # Cleanup other keys periodically?
        # For simplicity in this scope, we clean only the accessed key.
        # A global cleanup could be added if memory usage becomes a concern,
        # but for a single instance app, this is likely fine.

        return True

    def reset(self, key: str):
        """Reset the counter for a key."""
        if key in self.requests:
            del self.requests[key]

# Global instance for easy import
limiter = RateLimiter.get_instance()
