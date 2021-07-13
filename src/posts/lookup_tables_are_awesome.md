---
title: Lookup Tables Are Awesome
date: "2021-07-13"
---

I found out about lookup tables around a month ago, from a book about embedded 
systems, so I thought I should write about it. They are something I wish I had 
known about earlier. A lookup table is essentially a table (usually implemented 
as an array) containing pre-computed values. 

Lookup tables are often used to avoid performing a lot of calculations in a 
program. They are used as a replacement for large nested if-else statements or 
switch statements. When using if-else statements, the program has to compute 
the conditions. This is more work for the program. Lookup tables don't have 
this problem as to use it, we only need to index it.

### Example
A lookup table that a lot of people use, especially students, is the periodic 
table. Below is the code for a program that displays the name of the element 
based on their atomic number, with and without a lookup table. The code for 
all examples below is in C.

Here's the program without the table:
```c
// to keep the example short, the program only handles the first 5 elements
#include <stdio.h>

int main() {
    int inp;
    printf("enter the atomic number of an element: ");
    scanf("%d", &inp);
    switch (inp) {
        case 1: puts("Hydrogen"); break;
        case 2: puts("Helium"); break;
        case 3: puts("Lithium"); break;
        case 4: puts("Beryllium"); break;
        case 5: puts("Boron"); break;
        default: puts("error: unknown element!");
    }
    return 0;
}
```

And here's the program with the lookup table:
```c
#include <stdio.h>

static const char *periodic_table[] = {
    "Hydrogen", "Helium", "Lithium", "Beryllium", "Boron"
};

int main() {
    int inp;
    printf("enter the atomic number of an element: ");
    scanf("%d", &inp);
    if (inp >= 1 && inp <= 5) {
        puts(periodic_table[inp-1]);
    } else {
        puts("error: unknown element!");
    }
    return 0;
}
```

Note that the `periodic_table` array uses the `static` storage class specifier. 
This means that the array is allocated only once and persists until the end 
of the program. `const` is also used here because the values in the table are 
read-only.

Although the code with the switch statement might look more intuitive, if more 

elements are to be handled, the switch statement will end up too long and 
difficult to read and modify. On the other hand, with a lookup table, to handle 
more elements you only need to add the new elements to the table. The main 
function can be left unchanged.

### Jump Tables
A jump table, or also known as a branch table, is a type of lookup table that 
contains program instructions. It is used to handle multiple similiar events 
in a program. It is often used in assembly programs, using gotos. 

Jump tables can also be implemented in C, using function pointers. This is what 
I usually use lookup tables for. The table contains function pointers, and 
the program will call the function that corresponds to the table index.

### Example
One of my side projects, a [redis clone](https://github.com/rmrt1n/redis-kw), 
uses a jump table to handle the different redis commands. Here's a few code 
snippets that shows the use of the jump table.
```c
/* interpreter.c */ 

...

/* The lookup table is an array of function pointers. The functions each takes
 * a hashtable and a command, and returns a string. Arrays can only be in a 
 * single type, so all of the functions here needs to have the same parameters 
 * and return types.
 */
static char *(*fns[])(HashTable *, Command *) = {
    &exec_del, &exec_exists, &exec_type,
    &exec_set, &exec_get, &exec_mset, &exec_mget,
    &exec_incr, &exec_decr, &exec_incrby, &exec_decrby, &exec_strlen,

    ...
};

/* The interpret function takes in a hashtable, and a command to run on it. 
 * The function will first find the function that handles the command, call it, 
 * and return its return value.
 */
char *interpret(HashTable *ht, Command *cmd) {
    char *res;
    res = fns[cmd->type](ht, cmd);
    command_free(cmd);
    return res;
}
```

The index for the table uses the `type` member of the struct `Command`. It is 
an enum of all the possible commands. Enum member values start from 0, so it 
maps perfectly to the lookup table indexes. Here's the enum definition:
```c
typedef struct Command {
    enum {
        DEL, EXISTS, TYPE,
        SET, GET, MSET, MGET, INCR, DECR, INCRBY, DECRBY, STRLEN,

        ...
    } type;

    ...
} Command;

```

The `interpreter` function used to use a huge switch statement to handle the 
commands. I changed it to use lookup tables after learning about them. After 
that I did some digging into the original Redis source. I found out later that 
it also uses a lookup table! Here's a part of the Redis source that shows the 
table:
```c
/* redis.c */
struct redisCommand *commandTable;
struct redisCommand readonlyCommandTable[] = {
    {"get",getCommand,2,0,NULL,1,1,1},
    {"set",setCommand,3,REDIS_CMD_DENYOOM,NULL,0,0,0},

    ...
}
```

### Conclusion
Lookup tables are one of the things I think that most programmers should know. 
It makes code much cleaner and easier to read. This applies not only to C, but 
also to other programming languages like Python, Java, etc.

