+++
title = 'Hostnames With Multiple Headless Services'
date = 2026-07-31T19:56:59+03:00
lastmod = 2026-07-31T19:56:59+03:00
tags = []
+++

```
$ k get pod cluster1-mysql-0 -o yaml | grep subdomain
  subdomain: cluster1-mysql
```

Kubernetes has [a check](https://github.com/kubernetes/kubernetes/blob/master/pkg/controller/util/endpoint/controller_utils.go#L162-L164) to match `subdomain` to service name:

```go
func ShouldSetHostname(pod *v1.Pod, svc *v1.Service) bool {  
    return len(pod.Spec.Hostname) > 0 && pod.Spec.Subdomain == svc.Name && svc.Namespace == pod.Namespace  
}
```

That's why resolving `cluster1-mysql-0.cluster1-mysql.default.svc.cluster.local` works but `cluster1-mysql-0.cluster1-mysql-unready.default.svc.cluster.local` not.
