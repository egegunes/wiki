+++
title = 'Unsafe Sysctls'
date = 2026-07-31T19:55:28+03:00
lastmod = 2026-07-31T19:55:28+03:00
tags = ["linux"]
+++

Kubernetes maintains a list of safe sysctls to modify.

As of 1.36 the list is:
- kernel.shm_rmid_forced;
- net.ipv4.ip_local_port_range;
- net.ipv4.tcp_syncookies;
- net.ipv4.ping_group_range (since Kubernetes 1.18);
- net.ipv4.ip_unprivileged_port_start (since Kubernetes 1.22);
- net.ipv4.ip_local_reserved_ports (since Kubernetes 1.27, needs kernel 3.16+);
- net.ipv4.tcp_keepalive_time (since Kubernetes 1.29, needs kernel 4.5+);
- net.ipv4.tcp_fin_timeout (since Kubernetes 1.29, needs kernel 4.6+);
- net.ipv4.tcp_keepalive_intvl (since Kubernetes 1.29, needs kernel 4.5+);
- net.ipv4.tcp_keepalive_probes (since Kubernetes 1.29, needs kernel 4.5+).
- net.ipv4.tcp_rmem (since Kubernetes 1.32, needs kernel 4.15+).
- net.ipv4.tcp_wmem (since Kubernetes 1.32, needs kernel 4.15+).

Up-to-date list can be found in [docs](https://kubernetes.io/docs/tasks/administer-cluster/sysctl-cluster/#safe-and-unsafe-sysctls).

You can enable unsafe sysctls in kubelet:
```shell
kubelet --allowed-unsafe-sysctls \
  'kernel.msg*,net.core.somaxconn' ...
```

For example in EKS:
```yaml
kubeletExtraConfig:
  allowedUnsafeSysctls:
	- "net.core.optmem_max"
	- "net.core.rmem_max"
	- "net.core.wmem_max"
	- "net.core.rmem_default"
	- "net.core.wmem_default"
	- "net.ipv4.tcp_rmem"
	- "net.ipv4.tcp_wmem"
	- "net.core.netdev_max_backlog"
	- "net.ipv4.tcp_max_syn_backlog"
	- "net.ipv4.tcp_mtu_probing"
	- "net.ipv4.tcp_max_tw_buckets"
	- "net.ipv4.tcp_tw_reuse"
	- "net.ipv4.tcp_fin_timeout"
	- "net.ipv4.tcp_slow_start_after_idle"
```

Then set them in pod security context:
```yaml
podSecurityContext:
sysctls:
  - name: net.core.optmem_max
	value: "40960"
  - name: net.ipv4.tcp_rmem
	value: "4096 87380 16777216"
  - name: net.ipv4.tcp_wmem
	value: "4096 65536 16777216"
  - name: net.ipv4.tcp_max_syn_backlog
	value: "30000"
  - name: net.ipv4.tcp_max_tw_buckets
	value: "2000000"
  - name: net.ipv4.tcp_tw_reuse
	value: "1"
  - name: net.ipv4.tcp_fin_timeout
	value: "30"
  - name: net.ipv4.tcp_slow_start_after_idle
	value: "0"
  - name: net.ipv4.tcp_mtu_probing
	value: "1"
```
