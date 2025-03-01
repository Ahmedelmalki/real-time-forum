package middleware

import (
	"fmt"
	"net/http"
	"sync"
	"time"
)

type visitor struct {
	lastSeen  time.Time
	requests  int
	blocked   bool
	blockTime time.Time
}

type RateLimiter struct {
	visitors      map[string]*visitor
	mu            sync.Mutex
	requests      int           // max requests allowed
	duration      time.Duration // time window
	blockDuration time.Duration // how long to block if limit exceeded
}

func NewRateLimiter(requests int, duration time.Duration) *RateLimiter {
	return &RateLimiter{
		visitors:      make(map[string]*visitor),
		requests:      requests,
		duration:      duration,
		blockDuration: time.Minute, // Block for 1 minute when limit exceeded
	}
}

func (rl *RateLimiter) cleanupVisitors() {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	for ip, v := range rl.visitors {
		if time.Since(v.lastSeen) > rl.duration*2 {
			delete(rl.visitors, ip)
		}
	}
}

func RateLimit(next http.Handler) http.Handler {
	limiter := NewRateLimiter(1000, time.Minute) // 10 requests per minute

	// Start cleanup goroutine
	go func() {
		for {
			time.Sleep(time.Minute)
			limiter.cleanupVisitors()
		}
	}()

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := r.RemoteAddr
		fmt.Println("IP:", ip)	
		limiter.mu.Lock()
		v, exists := limiter.visitors[ip]

		if !exists {
			limiter.visitors[ip] = &visitor{
				lastSeen: time.Now(),
				requests: 1,
			}
			limiter.mu.Unlock()
			next.ServeHTTP(w, r)
			return
		}

		// Check if visitor is blocked
		if v.blocked {
			if time.Since(v.blockTime) < limiter.blockDuration {
				limiter.mu.Unlock()
				http.Error(w, "Too many requests, please try again later", http.StatusTooManyRequests)
				return
			}
			// Unblock after duration
			v.blocked = false
		}

		// Check if time window has passed
		if time.Since(v.lastSeen) > limiter.duration {
			v.requests = 1
			v.lastSeen = time.Now()
		} else {
			v.requests++
			// Block if too many requests
			if v.requests > limiter.requests {
				v.blocked = true
				v.blockTime = time.Now()
				limiter.mu.Unlock()
				fmt.Println("Too many requests, please try again later")
				http.Error(w, "Too many requests, please try again later", http.StatusTooManyRequests)
				return
			}
		}

		v.lastSeen = time.Now()
		limiter.mu.Unlock()
		next.ServeHTTP(w, r)
	})
}
