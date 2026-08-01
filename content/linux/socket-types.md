+++
title = 'Socket Types'
date = 2026-07-31T19:59:08+03:00
lastmod = 2026-07-31T19:59:08+03:00
tags = []
+++

1. SOCK_STREAM:
   - Provides a reliable, connection-oriented, bidirectional byte stream.
   - Uses TCP (Transmission Control Protocol) for transport.
   - Ensures data is received in the same order it was sent.
   - Guarantees delivery of data (or notifies of failure).
   - Handles flow control and error correction.
   - Suitable for applications requiring reliable data transfer, like file transfer or web browsing.

2. SOCK_DGRAM:
   - Provides a connectionless, unreliable datagram service.
   - Uses UDP (User Datagram Protocol) for transport.
   - Messages have defined boundaries (sent and received as discrete units).
   - No guarantee of delivery, ordering, or protection against duplication.
   - Faster than SOCK_STREAM due to less overhead.
   - Suitable for applications where speed is more important than reliability, like real-time gaming or streaming.

3. SOCK_SEQPACKET:
   - Provides a reliable, connection-oriented, bidirectional, sequenced packet service.
   - Similar to SOCK_STREAM, but preserves message boundaries.
   - Ensures data is received in the same order it was sent.
   - Guarantees delivery of data (or notifies of failure).
   - Less commonly used than SOCK_STREAM or SOCK_DGRAM.
   - Suitable for applications that need the reliability of SOCK_STREAM but also require message boundaries to be preserved.

Key differences:
- Reliability: SOCK_STREAM and SOCK_SEQPACKET are reliable, while SOCK_DGRAM is not.
- Connection: SOCK_STREAM and SOCK_SEQPACKET are connection-oriented, while SOCK_DGRAM is connectionless.
- Message boundaries: SOCK_DGRAM and SOCK_SEQPACKET preserve message boundaries, while SOCK_STREAM is a byte stream.
- Order: SOCK_STREAM and SOCK_SEQPACKET guarantee order, while SOCK_DGRAM does not.
- Speed: SOCK_DGRAM is generally faster due to less overhead, followed by SOCK_SEQPACKET, then SOCK_STREAM.



