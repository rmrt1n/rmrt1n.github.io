---
title: Tagged Unions in C
date: "2021-07-04"
---

One of my favorite data structures is the tagged union. It is also usually called 
as a variant, discriminated union, disjoint union, or sum type. Just like regular 
unions, it can hold different types of data in the same place in memory. However, 
unlike regular untagged unions, the tagged union has a ***tag*** field that 
indicates what value it is supposed to store.

An advantage of using tagged unions over its untagged counterpart is that it is 
more type-safe. When using untagged unions, the programmer needs to keep track of 
what values are being stored. Accessing a value that is not stored in the union 
can lead to undefined behavior. This is not a problem with tagged unions.

A lot of languages support tagged unions. Functional languages like Haskell or 
OCaml rely heavily on tagged unions, or in their respective languages, called 
just as types or datatypes. Modern languages like Rust and Swift also supports 
them. C++ has a variant library from [Boost](https://www.boost.org/). In C 
however, there is no support for tagged unions. We need to implement them ourselves.

A straightforward way to define tagged unions in C is by encompassing the tag 
and the union in a struct. It would look like this:
```c
typedef enum Tag {tag1, tag2, tag3} Tag;

typedef union Union {
  int value1;
  char value2;
  void *value3;
} Union;

typedef struct TaggedUnion {
  Tag tag; 
  Union value;
} TaggedUnion;
```

### Example
Below is an example of a use case for tagged unions. I used an AST (abstract 
syntax tree) as the example because that's what I used tagged unions for most 
often. An AST is a type of tree structure that is used to represent the 
structure of a program. Here's how I usually define them.
```c
/* Here's an AST structure for arithmetic operations. It is a recursive data 
 * structure, meaning that it contains values of the same type.
 *
 * The type specifies the type of the node. In this case, there are 3 types:
 * AST_LEAF: Represents a leaf/terminal node. this contains the numbers
 * AST_UNOP: Represents a unary operation, e.g. -1, +2, --4
 * AST_BINOP: Represents a binary operation, e.g. 1 + 2, 3 * 4
 *
 * Each member of the union corresponds to a type. If the type is AST_LEAF, then
 * the value the struct will hold is leaf_val, if it's AST_UNOP then unop_val 
 * and for AST_BINOP, binop_val. 
 */
typedef struct Ast {
    enum {AST_LEAF, AST_UNOP, AST_BINOP} type;

    union {
        int leaf_val;

        struct {
            enum {UNOP_POS, UNOP_MIN} op;
            struct Ast *operand;
        } unop_val;
     
        struct {
            enum {BINOP_ADD, BINOP_SUB, BINOP_MUL, BINOP_DIV} op;
            struct Ast *left;
            struct Ast *right;
        } binop_val;
    } value;
} Ast;
```

Even though tagged unions are supposed to be safer than untagged unions, in C, 
the programmer can still make mistakes like accessing the wrong value. This is 
because even though there is the tag field, all of the members of the union can 
still be accessed. In some languages, this is not possible because of the checking 
done by the compiler. In C, there is no checking, so we need to check the tag 
everytime before trying to access the value of the union.

This can be done easily using a switch statement:
```c
Ast node;
node.type = AST_LEAF;
node.value.leaf_node = 10;

switch (node.type) {
    case AST_LEAF:
        printf("leaf node value: %d\n", node.value.leaf_val);
        break;
    case AST_UNOP:
        /* stuff for unop */
        break;
    case AST_BINOP:
        /* stuff for binop */
        break;
    default:
        puts("undefined node type");
}
```

### Another Example
Say you are making a [Caves of Qud](https://www.cavesofqud.com/) rip-off. CoQ 
is a fantasy roguelike game. In this game, players play a character that roams 
around the CoQ world. The character can either be a mutant (a creature that can 
have mutations like wings and night vision), or a true kin (one of the races in 
the CoQ world).

Mutants can have different types of mutations, e.g. physical mutations and 
mental mutations. True kins can upgrade themselves with cybernetic enhancements. 
These are the 2 types of character a player can play as. This can  be represented 
with a tagged union. I'll wrap the character type in a library just to be neat.

```c
/* character.h */
#ifndef CHARACTER_H
#define CHARACTER_H

typedef struct Character Character;

#endif
```
First I wrote the forward declaration of the struct. I decided to make the type 
Character opaque, as doing this will not allow the user to access the struct 
members. The way to access them is through accessor functions. Here's the struct 
definition: 

```c
/* character.c */
#include "character.h"

typedef struct Character { char *name;
    int stats[6];
    enum {C_MUTANT, C_TRUEKIN} genotype;
    int ftr_cnt;
    union {
        Mutations *mutations;
        Cybernetics *cybernetics;
    } features;
} Character;
```
A character will have a name, 6 stats, a genotype denoting whether it is a 
mutant or true kin, a ftr_cnt indicating the number of mutations/cybernetics, 
and an array of mutations/cybernetics depending on the genotype.

```c
/* character.h */
typedef struct Mutations {
    enum {M_PHYSICAL, M_MENTAL} type;    
    char *name;
} Mutations;

typedef struct Cybernetics {
    enum {B_BODY, B_HEAD, B_ARMS, B_LEGS} type;
    char *name;
} Cybernetics;
```
Each mutation/cybernetic has a type and a name. These structs and their members 
can be accessed by the user. Next, in order to be able to use the Character type, 
it needs to be constructed first with some constructor functions. First, the 
function declarations:
```c
/* character.h */
Character *chr_init_mutant(char *name, int *stats, Mutations *features, int n);
Character *chr_init_truekin(char *name, int *stats, Cybernetics *features, int n);
```
And then the definitions:

```c
/* character.c */
#include <stdlib.h>
#include <string.h>

...

Character *chr_init_mutant(char *name, int *stats, Mutations *features, int n) {
    Character *chr = malloc(sizeof(Character));
    chr->name = strdup(name);
    for (int i = 0; i < 6; i++) chr->stats[i] = stats[i];
    chr->genotype = C_MUTANT;
    chr->ftr_cnt = n;
    chr->features.mutations = features;
    return chr;
}

Character *chr_init_truekin(char *name, int *stats, Cybernetics *features, int n) {
    Character *chr = malloc(sizeof(Character));
    chr->name = strdup(name);
    for (int i = 0; i < 6; i++) chr->stats[i] = stats[i];
    chr->genotype = C_TRUEKIN;
    chr->ftr_cnt = n;
    chr->features.cybernetics = features;
    return chr;
}
```
Next, I'll declare the accessor functions.

```c
/* character.h */
int chr_genotype(Character *chr);
char *chr_name(Character *chr);
int *chr_stats(Character *chr);
int chr_nfeatures(Character *chr);
Mutations *chr_mutations(Character *chr);
Cybernetics *chr_cybernetics(Character *chr);
```
And the definitions:

```c
/* character.c */
int chr_genotype(Character *chr) {
    return chr->genotype;
}

char *chr_name(Character *chr) {
    return chr->name;
}

int *chr_stats(Character *chr) {
    return chr->stats;
}

int chr_nfeatures(Character *chr) {
    return chr->ftr_cnt;
}

Mutations *chr_mutations(Character *chr) {
    if (chr_genotype(chr) == C_MUTANT) return chr->features.mutations;
    return NULL;
}

Cybernetics *chr_cybernetics(Character *chr) {
    if (chr_genotype(chr) == C_TRUEKIN) return chr->features.cybernetics;
    return NULL;
}
```
For `chr_mutations` and `chr_cybernetics`, if they are given a character of a 
wrong type, they will return `NULL`. The library is now done. Time to test. 
Here's the main function:

```c
/* main.c */
#include <stdio.h>
#include "character.h"

int main() {
    Mutations m[3] = {
        {M_PHYSICAL, "Super Strength"},
        {M_MENTAL, "Pyrokinesis"},
        {M_MENTAL, "Press of Death"}
    };
    int stats[6] = {15, 20, 2, 13, 10, 20};
    Character *chr = chr_init_mutant("Arthur Boyle", stats, m, 3);
    puts(chr_name(chr));
    return 0;
}
```

When compiled and ran, this will be the output:
```sh-session
$ gcc main.c character.c
$ ./a.out
Arthur Boyle
```
Great, it works! Since the `Character` type is supposed to be opaque, let's try 
to access one of its members.
```c
/* main.c */
...
    Character *chr = chr_init_mutant("Arthur Boyle", stats, m, 3);
    puts(chr->name);
    return 0;
}
```
When compiled, this should produce an error.

```sh-session
$ gcc main.c character.c
main.c: In function 'main':
main.c:12:13: error: invalid use of incomplete typedef 'Character'
   12 |     puts(chr->name);
      |             ^~
```
Finally, I'll define a function to display the entire contents of the struct, 
just to test the other accessor functions. The enum stats is just aliases for 
the stats array indexes.
```c
enum Stats {
    S_STRENGTH, S_TOUGHNESS, S_INTELLIGENCE,
    S_AGILITY, S_WILLPOWER, S_EGO
};

void chr_display(Character *chr) {
    printf("Name: %s\n", chr_name(chr));
    puts("Stats:");
    int *stats = chr_stats(chr);
    printf("  Strength: %d\n", stats[S_STRENGTH]);
    printf("  Toughness: %d\n", stats[S_TOUGHNESS]);
    printf("  Intelligence: %d\n", stats[S_INTELLIGENCE]);
    printf("  Agility: %d\n", stats[S_STRENGTH]);
    printf("  Willpower: %d\n", stats[S_WILLPOWER]);
    printf("  Ego: %d\n", stats[S_EGO]);
    Mutations *m = chr_mutations(chr);
    for (int i = 0; i < chr_nfeatures(chr); i++) {
        printf("Mutation #%d: ", i + 1);
        printf("%s ", m[i].type == M_PHYSICAL 
                         ? "(Physical Mutation)" 
                         : "(Mental Mutation)");
        printf("%s\n", m[i].name);
    }
}

int main() {
    ...
    chr_display(chr);
    return 0;
}
```
And lastly, compile and run.

```sh-session
$ ./a.out
Name: Arthur Boyle
Stats:
  Strength: 15
  Toughness: 20
  Intelligence: 2
  Agility: 15
  Willpower: 10
  Ego: 20
Mutation #1: (Physical Mutation) Super Strength
Mutation #2: (Mental Mutation) Pyrokinesis
Mutation #3: (Mental Mutation) Press of Death
```
Here's the output. It works as expected.

### Conclusion
So that was tagged unions, a neat data structure for storing objects with 
different types, and also some ways of implementing them in the C programming 
language. Thanks for reading!

