+++
title = 'vm.overcommit_memory'
date = 2026-07-31T19:53:28+03:00
lastmod = 2026-07-31T19:53:28+03:00
tags = ["linux"]
+++

`vm.overcommit_memory` needs to be set on kubernetes node since it's a kernel parameter.  
  
however, kubelet won't allow you to set it to 2. see <https://github.com/kubernetes/kubernetes/blob/093c91d2264ad9c4b965ad6dd27b3089681b0d73/pkg/kubelet/cm/container_manager_linux.go?plain=1#L485>  
  
kubelet, depending on your configuration, either errors if this is set to 2 or sets it to 1.  
  
so it's not possible for us to set it to 0 or 2.

https://github.com/kubernetes/kubernetes/issues/135294
https://github.com/kubernetes/kubernetes/issues/14935
https://github.com/kubernetes/kubernetes/issues/90973
