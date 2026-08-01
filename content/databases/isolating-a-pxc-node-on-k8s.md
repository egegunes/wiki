+++
title = 'Isolating a PXC Node on K8s'
date = 2026-07-31T19:36:29+03:00
lastmod = 2026-07-31T19:36:29+03:00
tags = ["pxc", "mysql", "kubernetes", "k8spxc"]
+++

isolating a PXC pod so it's removed from the cluster while running

NetworkPolicy is CNI-dependent, so might not work with K3s/minikube; Customer was using Cillium, so we:  

- labeled the pod (this was for some reason required, can't recall, but it would refuse to take the pod name as a pod selector)
- `touch /var/lib/mysql/sst_in_progress` to keep liveness check happy
- make un-ready: `mv /var/lib/mysql/readiness-check.sh /var/lib/mysql/readiness-check.sh.$(date +%s).backup; ln -s /bin/false /var/lib/mysql/readiness-check.sh`
- apply policy:
    
```    
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: pxc-0-deny-egress
spec:
  podSelector:
    matchLabels:
      joni4: joni4
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - ports:
        - protocol: TCP
          port: 3306
      from:
        - namespaceSelector:
            matchLabels:
              project: myproject
        - podSelector:
            matchLabels:
              role: frontend
  egress:
    - ports:
        - protocol: TCP
          port: 22
      to:
        - namespaceSelector:
            matchLabels:
              project: myproject
        - podSelector:
            matchLabels:
              role: frontend
```
