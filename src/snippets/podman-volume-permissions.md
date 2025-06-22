---
title: Fixing Podman Volume Permission Issues
tags:
  - Containers
  - Linux
  - Security
published: 2024-05-22
updated: 2025-06-22
---

If you use [Podman](https://podman.io/) to run containers on a system with [SELinux](https://www.redhat.com/en/topics/linux/what-is-selinux) enabled, you've probably encountered some permission errors when trying to mount volumes like:

{% code %}
```bash
# will error, the container process can't find the file
__$ podman run --rm -it -v .:/root steghide info favicon.png
# steghide: could not open the file "favicon.png".
```
{% endcode %}

This happens because by default, rootless containers are not given access to the host machine's volume bind directory. To fix this, you just have to add a `:z` or a `:Z` suffix to the volume mounts.[^1]

{% code %}
```bash
__$ podman run --rm -it -v .:/root:z steghide info favicon.png
# it works now
# "favicon.png":
#   format: png
#   ...
```
{% endcode %}

The `:z` and `:Z` suffixes tell Podman to set the required labels to the volume mount directory & files. Without these labels, SELinux will prevent any processes inside the container from using the contents of the volume mount.[^2]

The difference between `:z` and `:Z` is that `:z` tells Podman that more than one container will access the volume, while `:Z` means that only the current container can use it. In general, I recommend to just use the `:z` label unless you know that only 1 container will be using the volume.

[^1]: The other options is to set SELinux to permissive mode: `setenforce 0`, but you probably shouldn't do this, especially if you're running on a server.
[^2]: Read the full explanation in [**`man podman-run`**](https://docs.podman.io/en/latest/markdown/podman-run.1.html) and `Ctrl+F` for "labeling volume mounts".
