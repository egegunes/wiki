+++
title = 'bytes.Buffer'
date = 2026-08-01T11:25:32+03:00
lastmod = 2026-08-01T11:25:32+03:00
tags = ["golang"]
+++

## Direct Initialization vs Pre-allocated Buffer

**First Approach**:
```go
w := bytes.Buffer{}
w.WriteString(itemType)
w.WriteRune(':')
w.WriteString(clientId)
```

**Second Approach**:
```go
l := len(itemType) + len(clientId) + len(id) + 2
buf := make([]byte, 0, l)
w := bytes.NewBuffer(buf)
```

## Key Differences

**Memory Allocation**:
- The first approach uses bytes.Buffer's internal 64-byte array for small strings
- The second approach pre-allocates a specific buffer size based on the final string length

**Performance Characteristics**:
- First approach: 2 allocations (one for buffer structure, one for String() conversion)
- Second approach: 3 allocations (initial slice, buffer structure, and String() conversion)

**Use Cases**:
- First approach is better for:
  - Small strings that fit within the 64-byte internal buffer
  - When exact size is unknown
  - Simpler code with fewer allocations

- Second approach is better for:
  - Large strings where size is known
  - When you want to control initial capacity
  - Cases where memory efficiency is critical

# Buffer in the first approach automatically grows when writing more than 64 bytes. 

## Internal Buffer Management

**Initial State**:
- A zero-value bytes.Buffer starts with a small internal array of 64 bytes (smallBufferSize)
- This is an optimization for small strings to avoid initial allocations

**Growth Mechanism**:
- When writing data, the buffer first tries to grow by reslicing
- If reslicing isn't possible, it calls the grow() function
- For empty buffers under 64 bytes, it allocates exactly smallBufferSize
- For larger sizes, it doubles the capacity when more space is needed

## Growth Algorithm

The buffer grows according to these rules:

1. First attempts to use the internal 64-byte array
2. When that's exceeded, allocates a new slice with formula:
```go
if c := 2*cap(b.buf) + n; c > 2*cap(b.buf) {
    buf = make([]byte, n, c)
}
```
