---
title: When GNOME Shell Ignores Custom Keybindings
date: "2021-06-21"
---

This is a problem I've had ever since I first used GNOME 3, now GNOME 40, around 
a year ago. For some reason unknown to me, GNOME would ignore my custom 
keybindings that I had set up in the GNOME settings. My changes were binding 
`Super+1` to switch to workspace 1, `Super+2` to workspace 2, and so on.

This works some times, but often it would fail and execute the default actions 
on those shortcuts. The default actions for `Super+N` (where N is a number) is 
to launch the Nth application in the favorites bar. I tried to find a fix for 
this a long time ago, without success. Just a few days ago, I've finally had 
enough of this and started looking for a solution again. 

### Dconf And The Solution
After some reading, I found out about `dconf`. Quoting from the [GNOME wiki](https://wiki.gnome.org/action/show/Projects/dconf?action=show&redirect=dconf) 
about dconf:

> dconf is a low-level configuration system. Its main purpose is to provide a 
> backend to GSettings on platforms that don't already have configuration 
> storage systems. dconf is a simple key-based configuration system. Keys exist 
> in an unstructured database (but it is intended that keys that logically 
> belong together are grouped together). 

So dconf is basically a settings configurator for GNOME. The configuration for 
some of the actions of the GNOME shell is contained here. The frontend for dconf 
is `gsettings`. Using this, the default keybinding actions can be changed. To 
list the default keybindings, use this command.

```sh-session
$ gsettings list-recursively org.gnome.shell.keybindings
org.gnome.shell.keybindings switch-to-application-4 @as ['<Super>4']
org.gnome.shell.keybindings switch-to-application-7 ['<Super>7']
org.gnome.shell.keybindings toggle-message-tray ['<Super>v', '<Super>m']
org.gnome.shell.keybindings toggle-application-view ['<Super>a']
org.gnome.shell.keybindings focus-active-notification ['<Super>n']
org.gnome.shell.keybindings switch-to-application-2 @as ['<Super>2']
org.gnome.shell.keybindings switch-to-application-5 @as ['<Super>5']
...
```

There you can see the value of `switch-to-application-4` is `['<Super>4']`. This 
is the default action of the shortcut `Super+4`. Now, to make GNOME follow 
only the keybindings set through the GNOME settings, we just have to change the 
value of the action to an empty list `[]`. Here's the command to do so:

```sh-session
$ gsettings set org.gnome.shell.keybindings switch-to-application-4 []
```

To change the bindings for N workspaces, you can use a for loop:
```sh-session
$ # N is 6 in this case
$ for i in {1..6}; do \
>   gsettings set org.gnome.shell.keybindings "switch-to-application-$i"; \
> done
```

### Conclusion
Done! just around half an hour of googling led to this. Just a few commands to 
fix a problem that has been annoying me for a long time. To those reading with 
the same problem, hope this helps!

