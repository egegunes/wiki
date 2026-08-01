+++
title = 'MySQL Binlog'
date = 2026-08-01T11:09:38+03:00
lastmod = 2026-08-01T11:09:38+03:00
tags = ["mysql"]
+++

- Most numeric fields use fixed-length encoding with **little-endian** byte order. 
	- When you see `7a000000` in a hex dump, you read it as `0x0000007a` = 122 in decimal.

- The first event starts at position 4.

- Every event in the binary log (version 4+) shares a common 19-byte header structure.
	- Timestamp, 4 bytes, Unix epoch seconds when the event was created
	- Event Type, 1 byte, Identifies how to interpret the payload
	- Server ID, 4 bytes, The server that originated this event (prevents circular replication)
	- Event Size, 4 bytes, Total size of this event in bytes (header + payload)
	- Next Position, 4 bytes, File offset where the next event begins
	- Flags, 2 bytes, Event-specific flags (bit field)
