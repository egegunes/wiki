+++
title = 'Binary Search'
date = 2026-08-01T11:31:37+03:00
lastmod = 2026-08-01T11:31:37+03:00
tags = ["algorithms"]
+++

```go
package main

import (
	"fmt"
)

// binarySearch performs binary search on a sorted slice.
// It returns the index of target if present, or -1 if not found.
func binarySearch(slice []int, target int) int {
    low := 0
    high := len(slice) - 1

    for low <= high {
        mid := low + (high-low)/2

        if slice[mid] == target {
            return mid
        }

        if slice[mid] < target {
            low = mid + 1
        } else {
            high = mid - 1
        }
    }

    return -1 // target not found
}

func main() {
    slice := []int{2, 3, 4, 10, 40}
    target := 10
    result := binarySearch(slice, target)
    if result != -1 {
        fmt.Printf("Element found at index %d\n", result)
    } else {
        fmt.Println("Element not found in the slice")
    }
}
```
