---
title: Simple Bottom Up Parsing with Recursive Ascent
date: "2021-06-14"
---

Bottom up parsers have been a mysterious entity to me. I have only used recursive 
descent parsers before, because they are straightforward and easy to understand. 
I have no previous experience with parser generators such as yacc or bison. In 
order to wrap my head around them, I decided to write my own bottom up parser 
from scratch. I'll summarize my findings here, as well as make a small guide on 
how to write one.


### Bottom Up Parsers
Botom up parsers, like its name implies, parses tokens from the bottom up. They 
recognize the lowest parts of the grammar first, unlike top down parsers which 
recognize the highest parts first. These types of parsers usually employ tables 
to tell the parser what to do. They can handle more grammars than top down 
parsers, but are more difficult to understand and build. This is the reason why 
most people parser generators to build bottom up parsers. 


### Recursive Ascent Parsers
In my research, I stumbled upon the term *recursive ascent parser*. This parsing 
technique is the bottom up counterpart of recursive descent parsing. Instead of 
tables, recursive ascent uses mutually recursive functions. Since I am already 
familiar with recursive descent, I figured I should also try recursive ascent. 
A recursive ascent parser is functionally the same as regular LR parsers, so 
that's what I'll discuss about next.

### LR Parsers
LR parsers (left-to-right, rightmost derivation in reverse) are a family of 
bottom up parsers. These parsers do not backtrack, and are often followed by a 
number denoting the number of tokens it can lookahead, e.g. an LR(0) parser doesn't 
use lookaheads, an LR(1) parser looks one token ahead. Variants of LR parsers include:
- SLR parsers (Simple LR)
- LALR parsers (Look Ahead LR)
- CLR parsers (Canonical LR)  

Some LR parsers are more powerful than the others. For example, SLR parsers are
more powerful than regular LR(0) parsers, LALR(1) parsers are more powerful than 
SLR, and LR(1) more powerful than LALR(1).

### How It Works
An LR parser works by using 2 main actions, namely **shift** and **reduce**. Shift 
means to advance or *shift* to the next token in the token stream. Reduce on the 
other hand means to convert or *reduce* shifted tokens into the grammar rules 
they represent. So an LR parser just shifts token until there's no more input 
left, while reducing the tokens into their rules. Here's an small example:

```markup
// take this sample grammar:
rule #1: expr -> expr '+' num
rule #2: expr -> num
rule #3: num -> 1

// and this input:
'1 + 1 + 1'
```

The actions of an LR parser will look like the following: 

| Step  | Parsed     | Unparsed  | Action                      |
|-------|------------|-----------|-----------------------------|
| 1     | *empty*    | 1 + 1 + 1 | shift                       |
| 2     | 1          | + 1 + 1   | reduce (num -> 1)           |
| 3     | num        | + 1 + 1   | reduce (expr -> num)        |
| 4     | expr       | + 1 + 1   | shift                       |
| 5     | expr +     | 1 + 1     | shift                       |
| 6     | expr + 1   | + 1       | reduce (num -> 1)           |
| 7     | expr + num | + 1       | reduce (expr -> expr + num) |
| 8     | expr       | + 1       | shift                       |
| 9     | expr +     | 1         | shift                       |
| 10    | expr + 1   | *eof*     | reduce (num -> 1)           |
| 11    | expr + num | *eof*     | reduce (expr -> expr + num) |
| 12    | expr       | *eof*     | accept                      |
 
<br>

### Finite State Machine
LR parsers can have only a certain number of possible states, hence why it is
an example of a finite state machine. A finite state machine is an abstract 
model in mathematics that can be in only one of a finite number of states. In a 
typical LR parser, its states are stored in a table called the parse table. In 
a recursive ascent parser, each state is mapped to a function.

Each state in the LR automaton (another name for a FSM) corresponds to a set of 
items in the ***canonical collection of lr(0) items***. So to build this automaton, 
we need to get all the items of this set first.

As an example, I'll build the automaton for the grammar used in the previous 
example. The first step to do is to augment the grammar first to add an extra 
rule. This extra rule is the new starting rule.

```markup
# here's the new grammar:
start -> expr eof
expr -> expr '+' num
expr -> num
num -> 1
``` 

<br>

### The DOT •
An LR(0) item of a grammar is just a rule of the grammar with a special dot "•" 
in its right hand side. If a nonterminal is at the right side of a dot, then 
all of its items need to be included in the item set. A nonterminal is the left 
hand side of a grammar production rule. This action of including the items of a
nonterminal is called *applying closure*. So from the augmented grammar from 
before, its item sets are:  

**state 0**
```markup
start -> • expr eof      // since expr is right of the dot, we compute its closure
expr -> • expr '+' num
expr -> • num            // same goes for num here
num -> • 1
```
From the starting set, the rest of the states can be computed by looking at the 
next symbol after the dot. The only symbols that can come next are the *expr* 
nonterminal, *num* nonterminal, and the '1' terminal symbol.

**state 1**  
The state if an *expr* is given to state 0. 
```markup
start -> expr • eof      // accept. this is the end state.
expr -> expr • '+' num
```

**state 2**  
The state if a *num* is given to state 0. 
```markup
expr -> num •
```

**state 3**  
The state if a 1 is given to state 0. 
```markup
num -> 1 •
```

**state 4**  
The state if a '+' is given to state 1. 
```markup
expr -> expr '+' • num
num -> • 1 
```

**state 5**  
The state if a *num* is given to state 4. 
```markup
expr -> expr '+' num •
```

Here's a diagram representing the LR items:  

<img alt="lr items dfd" width="600px" src="{{ '/assets/lr_items.svg' | url }}">

### The Parse Table
The parse table can be constructed based on the information we have so far. The 
table is divided into two parts, the action table and the goto table. The action 
table holds the actions to take based on a token or a terminal, while the goto 
table holds the state to which the parser needs to shift to given a non terminal. 
Moving from one state to another is a shift action, while items with the dot • 
at the end is a reduce action.

The tables for different LR parsers might differ from each other. LR(0) parsers 
do not use lookahead, which results in reduce actions taking an entire row in 
the table. This is because it doesn't have information on the next token. This 
could result in a *shift-reduce* conflict. This conflict happens when a table 
entry has both a shift and reduce action.

LR parsers with lookahead such as SLR(1), LALR(1), and LR(1) can avoid this 
conflict because they can choose their actions based on the lookahead. Here's 
an LALR(1) table for the previous grammar, the dollar '$' symbol means eof:

| state | 1  | '+' | $   | expr | num |
|-------|----|-----|-----|------|-----|
| 0     | s3 |     |     | gt1  | gt2 | 
| 1     |    | s4  | acc |      |     |
| 2     |    | r2  | r2  |      |     |
| 3     |    | r3  | r3  |      |     |
| 4     | s3 |     |     |      | gt5 |
| 5     |    | r1  | r1  |      |     |

<small>
sN = shift to state N, 
rN = reduce using rule N, 
gtN = go to state N
</small>

<br>
<br>

### Building The Parser
Since I'll be making a recursive ascent parser, the table from the previous 
section won't be necessary, but it's good to have as a reference. In recursive 
ascent, shift actions are encoded as function calls, while reduce actions are 
encoded as function return statements. The return value is usually an AST (abstract 
syntax tree) node, but directly evaluating them is also possible.

I'll write the parser for the previous grammar in python. The tokens will just 
be a list of characters. The resulting AST will be in the form of an s expression. 
S expressions, or usually called *sexprs*, are a way to represent nested data 
(like a tree). For example, the expression '1 + 1' is written as '(+ 1 1)' in 
sexprs.

```python
# first, some setup

# the main parsing function which just calls the first state
def parse(tokens):
    return state0(tokens)

if __name__ == '__main__':
    tokens = ['1', '+', '1', '+', '1']
    print(parse(tokens))
```

I'll also define some helper functions.

```python
# check if an ast node is a num. here, it just checks if the character is a digit
def is_num(ast):
    return ast.isdigit()

# returns the next unparsed token
def peek(tokens):
    return [] if tokens == [] else tokens[0]

# this parser won't have any error handling, so just print a message and exit
def error():
    print('error: unexpected token')
    exit()
```

Here's the first state. The general flow of the most functions looks like this. 
match the next unparsed token into an AST node. Then check if the node is a part 
of a non terminal starting from the lowest rule. In this case, there are 2 non 
terminals, num and expr. Num is checked first, then expr. Here, since a num is 
always and expr, no checking is needed. 

```python
# the first state of the parser
def state0(tokens):
    # match terminals first
    if peek(tokens) == '1':
        # the function state3 returns the next token, and the remaining tokens
        # this is list unpacking
        ast, tokens = state3(tokens)
    else:
        # if an unexpected token is found, just exit
        error()

    # match nonterminals starting from the lowest
    if is_num(ast):
        ast = state2(ast)

    # goto the next state
    return state1(ast, tokens)
```

The next state has left recursion. A top down parser can't handle this, but a 
bottom up parser can parse it just fine. The resulting tree will be left-associative, 
but since the grammar is just about addition, the associativity is not that important.

```python
def state1(ast, tokens):
    # loop for left recursive grammars
    while peek(tokens) == '+':
        ast, tokens = state4(ast, tokens)

    # this is the end of the token stream. this is the accept action
    return ast
```

The next states contain reduce actions. Usually, there will be some transformation 
to create the AST node, like in state5. But in some, like state2, nothing needs 
to be done so just return the node. This function is not necessary, but it helps 
to make the code easier to understand.

```python
# do nothing, just return
def state2(ast):
    return ast

# this function shifts a token, and returns it along with the remaining tokens
def state3(tokens):
    return tokens[0], tokens[1:]

# create the tree representation
def state5(left, right):
    return ['+', left, right]
```

The output for the tokens in the program should look like this '(+ (+ 1 1) 1)'. 
Let's run the program to see if it is correct:

```sh-session
$ python parser.py
['+', ['+', '1', '1'], '1']
```

The output looks right! Now this is just a very basic example. A more complex 
grammar will have more states and therefore, more functions. Here's an example 
of a parser for a more complicated grammar.

```markup
// here's a larger grammar
expr -> expr '+' term
expr -> expr '-' term
expr -> term
term -> term '*' factor
term -> term '/' factor
term -> factor
factor -> '-' factor
factor -> '(' expr ')'
factor -> number

// here number is a terminal. it just means any integer
```
Here's the canonical collection of LR(0) items for the grammar: 

<img alt="lr items dfd" width="650px" src="{{ '/assets/lr_items2.svg' | url }}">

And here's the code for the parser. I decided to immediately evaluate the rules 
inside the parser. The program will have a REPL, for easier testing and 
debugging. It will also have a lexer to split the input into tokens.

```python
# unimplemented for now
def parse(tokens):
    return tokens

# splits a string into tokens based on the grammar
def tokenize(inp):
    tokens = []
    for i in range(len((inp))):
        # break out of loop if at end of input
        if inp == '':
            break; # skip whitespace
        if inp[i].isspace():
            continue
        # get integer literals
        if inp[i].isdigit():
            num = 0
            while i < len(inp) and inp[i].isdigit():
                num = num * 10 + (ord(inp[i]) - ord('0'))
                i += 1
            tokens.append(num)
            continue
        if inp[i] == '+':
            tokens.append('+')
        elif inp[i] == '-':
            tokens.append('-')
        elif inp[i] == '*':
            tokens.append('*')
        elif inp[i] == '/':
            tokens.append('/')
        elif inp[i] == '(':
            tokens.append('(')
        elif inp[i] == ')':
            tokens.append(')')
        else:
            print('error: unexpected character: \'{}\''.format(inp[i]))
            exit()
    return tokens

# simple repl that prints the evaluation of the given input
def repl():
    while True:
        inp = input('> ')
        print(parse(tokenize(inp)))

if __name__ == '__main__':
    repl()
```

Here's the meat of the parser. 

```python
# the parser's first state
def state0(tokens):
    # match tokens
    node, tokens = match_tokens(tokens)
    # factor is lower than term in the grammar rules, so check for it first
    node, tokens = state3(node, tokens) # go to factor reducing rule
    node, tokens = state2(node, tokens) # go to term reducing rule
    return state1(node, tokens) # go to expr reducing rule

def state1(node, tokens):
    # left recursive, so loop
    while peek(tokens) == '+' or peek(tokens) == '-':
        node, tokens = (state7(node, tokens)
                        if peek(tokens) == '+'
                        else state8(node, tokens))

    # end of the token stream
    if tokens == []:
        return node
    else:
        parse_error(tokens)

# this is similiar to state 1
def state2(node, tokens):
    while peek(tokens) == '*' or peek(tokens) == '/':
        node, tokens = (state9(node, tokens)
                        if peek(tokens) == '*'
                        else state10(node, tokens))
    if type(peek(tokens)) == int or peek(tokens) == '(':
        parse_error(tokens)
    else:
        return node, tokens
```

The match_tokens() function is a helper function to reduce repeating code. The 
only tokens that can start a rule are numbers, '-', and '(', so anything else 
that comes is a syntax error.

```python
# match tokens for some states. 
def match_tokens(tokens):
    peeked = peek(tokens)
    if type(peeked) == int:
        node, tokens = state6(tokens)
    elif peeked == '(':
        node, tokens = state5(tokens)
    elif peeked == '-':
        node, tokens = state4(tokens)
    else:
        parse_error(tokens)
    return node, tokens

def parse_error(tokens):
    if tokens == []:
        print('unexpected eof')
    else:
        print('unexpected token: \'{}\''.format(tokens[0]))
    exit(0)
```

Here are some more states:
```python
# the redundant, do nothing reduce action state
def state3(node, tokens):
    return node, tokens

def state4(tokens):
    tokens = shift(tokens)
    node, tokens = match_tokens(tokens)
    # the result of the previous statement wil be a factor, so go to its state
    return state11(node, tokens)

# this state is similiar to state 0, the only difference being the
# last function to goto
def state5(tokens):
    tokens = shift(tokens)
    node, tokens = match_tokens(tokens)
    node, tokens = state3(node, tokens)
    node, tokens = state2(node, tokens)
    return state12(node, tokens)

def state6(tokens):
    return tokens[0], tokens[1:]
```

Most of the code is repetitive, with the only differences being the tokens to 
check, or which state to go to next. The large number of states that need to be 
translated makes recursive ascent parsers impractical to write by hand. Recursive 
descent parsers are usually shorter and also easier to implement, making them 
more popular. Anyways, here's the rest of the code:

```python
### some repeating connector states
def state7(node, tokens):
    tokens = shift(tokens)
    new_node, tokens = match_tokens(tokens)
    new_node, tokens = state3(new_node, tokens)
    return state13(node, new_node, tokens)

def state8(node, tokens):
    tokens = shift(tokens)
    new_node, tokens = match_tokens(tokens)
    new_node, tokens = state3(new_node, tokens)
    return state14(node, new_node, tokens)

def state9(node, tokens):
    tokens = shift(tokens)
    new_node, tokens = match_tokens(tokens)
    return state15(node, new_node, tokens)

def state10(node, tokens):
    tokens = shift(tokens)
    new_node, tokens = match_tokens(tokens)
    return state16(node, new_node, tokens)
###

# reduce action for unary negation operator
def state11(node, tokens):
    return -node, tokens

# some of the items have left recursion, so loop again
def state12(node, tokens):
    while peek(tokens) == '+' or peek(tokens) == '-':
        node, tokens = (state7(node, tokens)
                        if peek(tokens) == '+'
                        else state8(node, tokens))
    if peek(tokens) == ')':
        return state17(node, tokens)
    else:
        parse_error(tokens)

# reduce action of add/sub operations. handle terms before the expr
def state13(left, right, tokens):
    while peek(tokens) == '*' or peek(tokens) == '/':
        right, tokens = (state9(right, tokens)
                         if peek(tokens) == '*'
                         else state10(right, tokens))
    return left + right, tokens

# exactly the same as the previous state
def state14(left, right, tokens):
    while peek(tokens) == '*' or peek(tokens) == '/':
        right, tokens = (state9(right, tokens)
                         if peek(tokens) == '*'
                         else state10(right, tokens))
    return left - right, tokens

### other reduce actions
def state15(left, right, tokens):
    return left * right, tokens

def state16(left, right, tokens):
    return left / right, tokens

def state17(node, tokens):
    tokens = shift(tokens)
    return node, tokens
###
### some helper functions
def shift(tokens):
    return tokens[1:]

def peek(tokens):
    return [] if tokens == [] else tokens[0]
###
```

Time for some tests:
```sh-session
$ python parser.py
> 1 + 2
3
> (1 + 2 * 3) - -1
8
> 3 * (2 + 4)
18
```
Good. Everything works. (I haven't tested this thoroughly so if you found a mistake 
somewhere please tell me!)

### Conclusion
So that's bottom up parsing using a recursive ascent technique. Before writing 
this article, I had difficulty finding resources on this topic. Most of them are 
academic papers that uses a lot of fancy notations that discouraged me from reading. 
This [article](https://www.abubalay.com/blog/2018/04/08/recursive-ascent) in 
particular really helped me to understand some of the concepts, so I highly 
reccommend checking it out!


### References
- [Writing a recursive ascent parser by hand - Abubalay](https://www.abubalay.com/blog/2018/04/08/recursive-ascent)
- [Recursive Ascent Parser](https://en.wikipedia.org/wiki/Recursive_ascent_parser)
- [LR Parser](https://en.wikipedia.org/wiki/LR_parser)
- [LR Parser - Tutorial And Example](https://www.tutorialandexample.com/lr-parser/)
- [Recursive Ascent: An LR Analog to Recursive Descent](https://dl.acm.org/doi/pdf/10.1145/47907.47909)

