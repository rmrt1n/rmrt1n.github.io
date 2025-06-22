---
title: A Better Shell Script Wrapper for JAR Files
tags:
  - Linux
  - Java
published: 2024-09-09
updated: 2024-10-14
---

To run a JAR file, usually you would do:

{% code %}
```bash
__$ java -jar /path/to/jar
```
{% endcode %}

It's a bit long to type, so some people (me included) would wrap it in a shell script:

{% code "run-jar.sh" %}
```bash
#!/usr/bin/bash
java -jar /path/to/jar
```
{% endcode %}

This way, you only have to type `./run-jar.sh`, or `run-jar.sh` if you have the script somewhere in your shell's `PATH`.

A problem with this approach is that you now have two files, the shell script and the JAR file. If you move or delete the JAR file, the script breaks. A better way to do this is to "include" the JAR file directly in the shell script.

First, we'll change `run-jar.sh`'s shebang (`#!`) line from `#!/usr/bin/bash` to `#!/usr/bin/java`. This tells the shell to run the script using `java -jar` instead of the usual bash or sh:

{% code %}
```bash
__$ echo '#!/usr/bin/java -jar' > run-jar.sh
```
{% endcode %}

Then, we'll append the entire JAR file to the script:

{% code %}
```bash
__$ cat /path/to/jar >> run-jar.sh
```
{% endcode %}

Finally, all we have to do is set the script file permission to executable:

{% code %}
```bash
__$ chmod +x run-jar.sh
```
{% endcode %}

This way, everything you need to run the program is in a single file, making it simpler to manage.
