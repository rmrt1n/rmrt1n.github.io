---
title: Container Volumes on Selinux Systems
date: "2022-01-02"
---

A problem I often get while working with containers on my machine is the
permission denied error with container volumes. The other day, I was trying to
set up a local instance of [supabase](https://supabase.com/) using their docker
containers. The files needed can be found in the `docker` directory in the main
[repository](https://github.com/supabase/supabase/tree/master/docker) of the 
project. It uses docker-compose to orchestrate the containers needed.

### Differences Between Podman & Docker 
Since I usually use podman and podman-compose for dealing with containers, I 
faced some issues that are not present if I had used docker or docker-compose. 
One of them is:
```sh-session
Error: statfs /home/user/supabase/docker/volumes/db/data: no such file or directory
exit code: 125
```

When running with docker, this problem doesn't happen. This is because docker
creates the host volume mounts if it doesn't exists already. Podman doesn't do
this, hence the error. For this issue, the fix is quite simple, just create the
needed directories.
```bash
$ mkdir volumes/storage volumes/db/data
```

### The Other Issue
The other, more confusing issue was this error:
```sh-session
chmod: changing permissions of '/var/lib/postgresql/data': Permission denied
find: ‘/var/lib/postgresql/data’: Permission denied
chown: changing ownership of '/var/lib/postgresql/data': Permission denied
exit code: 1
```

There were other error messages saying the same thing, permission denied. After
some reading, I found out that the cause of this problem is SELinux.

### SELinux
I'm running [Fedora](https://getfedora.org/), an RPM-based linux distribution 
with SELinux enabled. Other RPM-based distros such as CentOS & RedHat Linux also 
come with SELinux by default. SELinux, or Security-Enhanced Linux, is the Linux 
kernel's security module that provides access control security policies and 
mandatory access controls (MAC). It labels files and processes to ensure no 
processes get unauthorized access to some files or other processes.

The problem with SELinux and containers is that by default, containers are not
given write access to volume binds. The SELinux label for files used in regular
container volume binds is `container_t`. To have write access, the files need to
have the label `container_file_t`. This happens to containers whether it is run
using docker or podman.

### Quick Fix #1
A quick way to avoid all this trouble with SELinux permissions is to set the
SELinux mode to permissive. This will solve the issue completely.
```bash
$ setenforce 0 # this will set SELinux to permissive if it isn't already
$ # to undo do setenforce 1 to change mode to enforcing
```

Or, if you want to, you can also completely disable SELinux. For desktop or
regular use, this should be fine. For servers however, setting SELinux to
permissive or disabling it completely isn't the smartest thing to do, as it
lowers the security of the system.

### Quick Fix #2
This time, the fix will not involve making changes to SELinux. The solution is
to use the `z` or `Z` flag for volume binds. This will change the label of the 
files in the volume bind to `container_file_t`, allowing write access. The full explanation can be read in the podman-run or docker-run man page.

>To change a label in the container context, you can add either of two suffixes
>:z  or :Z  to  the  volume  mount. These suffixes tell Podman to relabel file
>objects on the shared volumes. The z option tells Podman that two containers
>share the  volume  content. As a result, Podman labels the content with a 
>shared content label. Shared volume labels allow all containers to read/write
>content. The Z option tells Podman  to label the content with a private 
>unshared label.

In short, use `Z` if only 1 specific container needs access to the volume, else
use `z`. Because supabase uses docker-compose, we need to edit the compose file
in order to get it to work. You just need to add `:z` to all of the volume binds
in the file.
```docker
# line 133 of docker-compose file
volumes:
  - ./volumes/storage:/var/lib/storage:z
...
```

After doing this, the pod was running successfully. 

### Conclusion
Here's a quick summary. If you're using a SELinux system, and you don't want to
deal with it anymore, set the mode to permissive or disable it completely. Else,
use the `zZ` flag suffixes to volume binds. `:Z` is more restrictive, so just
use `:z` if you don't want to think much about this. 

### References
- [Using SELinux with
    Containers](https://www.arhea.net/posts/2020-04-28-selinux-for-containers.html)
- [Docker volume permission
    denied](https://discussion.fedoraproject.org/t/docker-volume-permission-denied/1948)
- [Volumes and rootless
    Podman](https://blog.christophersmart.com/2021/01/31/volumes-and-rootless-podman/)

