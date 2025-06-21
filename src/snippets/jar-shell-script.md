---
title: A Better Shell Script Wrapper for JAR Files
tags:
  - Linux
  - Java
published: 2024-09-09
updated: 2024-10-14
---

To run a JAR file, usually you would do:

```bash
__$ java -jar /path/to/jar
```

It's a bit long to type, so some people (me included) would wrap it in a shell script:

```bash
# run-jar
#!/usr/bin/bash
java -jar /path/to/jar
```

This way, you only have to type `./run-jar`, or `run-jar` if you have the script somewhere in your shell's `PATH`.

A problem with this approach is that you now have two files, the shell script and the JAR file. If you move or delete the JAR file, the script breaks. A better way to do this is to "include" the JAR file directly in the shell script:

```bash
# Add the shebang (#!) line to specify the script's interpreter
# This will tell the shell to run the script using java -jar instead of the
# usual bash or sh
__$ echo '#!/usr/bin/java -jar' > run-jar

# Append the JAR file to the script
__$ cat /path/to/jar >> run-jar

# Set the file permission to be executable
__$ chmod +x run-jar

# Run the jar file
__$ ./run-jar
```

This way, everything you need to run the program is in a single file, making it simpler to manage.
