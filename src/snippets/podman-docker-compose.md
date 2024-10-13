---
title: Trick Docker Compose to Use Podman
tags:
  - containers
  - hack
  - podman
  - linux
published: 2024-05-29
updated: 2024-06-04
---

I recently discovered a way to use [Podman](https://podman.io/) as the backend for [Docker Compose](https://docs.docker.com/compose/). Docker Compose checks the `DOCKER_HOST` environment variable to determine which daemon socket to connect to. Podman doesn't run a daemon by default, so we need to enable it first:

```bash
# starts the podman socket as a non-root user
__$ systemctl --user enable podman.socket
__$ systemctl --user start podman.socket
__$ systemctl --user status podman.socket
```

This will create the socket at `/run/user/$UID/podman/podman.sock`, which we'll need to set as the value of `DOCKER_HOST`.

```bash
__$ export DOCKER_HOST=unix:///run/user/$(id -u)/podman/podman.sock
```

And that's it. Docker Compose should use Podman as the container engine now.

This works for tools that use Docker as a library, like the [Supabase CLI](https://github.com/supabase/cli/), but it won't work for tools that call your system's `docker` binary directly. You can read more about using Podman with Docker Compose in [this Fedora Magazine post](https://fedoramagazine.org/use-docker-compose-with-podman-to-orchestrate-containers-on-fedora/).

Props to [@GZGavinZhao](https://github.com/GZGavinZhao) for sharing the [original solution](https://github.com/supabase/cli/issues/265#issuecomment-1331492583) to this issue.
