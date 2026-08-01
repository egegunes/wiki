+++
title = 'http.Server'
date = 2026-08-01T11:37:46+03:00
lastmod = 2026-08-01T11:37:46+03:00
tags = ["golang"]
+++

## Graceful shutdown

```go
server := &http.Server{Addr: ":8080", Handler: handler}
    
go func() {
    if err := server.ListenAndServe(); err != nil {
        // handle err
    }
}()

// Setting up signal capturing
stop := make(chan os.Signal, 1)
signal.Notify(stop, os.Interrupt)

// Waiting for SIGINT (kill -2)
<-stop

ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()
if err := server.Shutdown(ctx); err != nil {
    // handle err
}
    
// Wait for ListenAndServe goroutine to close.
```
