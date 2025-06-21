---
title: Configure Keyboard Shortcuts for GNOME Workspace Switching
tags:
  - Linux
published: 2024-05-14
updated: 2024-05-22
status: published
---

GNOME settings only allow you to configure the keyboard shortcuts to switch to workspaces 1-4. There are no options to add shortcuts to switch to any other workspaces. It's possible to configure this by editing `dconf` directly using `gsettings` from the command line:


```bash
# replace range with whatever workspaces you want
__$ for i in {5..6}; do gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-$i "['<Super>$i']"; done
```

`dconf` is GNOME's configuration system, and `gsettings` is the frontend for `dconf`. It's essentially a key-value store of GNOME's config. You can also configure the keyboard shortcuts for other settings that are not shown in GNOME settings with `gsettings`.
