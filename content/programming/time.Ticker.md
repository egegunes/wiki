+++
title = 'time.Ticker'
date = 2026-08-01T11:30:37+03:00
lastmod = 2026-08-01T11:30:37+03:00
tags = ["golang"]
+++

## Simple

```go
ticker := time.NewTicker(5 * time.Second)
for range ticker.C {
	log.Println("Hey!")
}
```

## With timeout

```go
ticker := time.NewTicker(5 * time.Second)
defer ticker.Stop()

timeout := time.NewTimer(300 * time.Second)
defer timeout.Stop()

for {
	select {
	case <-timeout.C:
		return errors.New("timeout")
	case <-ticker.C:
		// do
	}
}
```
