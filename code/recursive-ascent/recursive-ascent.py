import sys
import random


class AST:
    def __init__(self, left, right, value: str, kind: str):
        self.left = left
        self.right = right
        self.value = value
        self.kind = kind

    def pprint(self):
        if not self.value.isdigit():
            print("( {} ".format(self.value), end="")
        else:
            print(" {} ".format(self.value), end="")
        if self.left:
            self.left.pprint()
        if self.right:
            self.right.pprint()
        if not self.value.isdigit():
            print(" )", end="")


def lex(string: str):
    return string.split()


def peek(tokens: list[str]):
    return "" if len(tokens) == 0 else tokens[0]


def panic(token: str):
    print("unexpected token: {}".format(token))
    exit()


def state8(left: AST, right: AST):
    # reduce using rule 4: term -> term '*' factor
    return AST(left, right, "*", "term")


def state7(left: AST, right: AST, tokens: list[str]):
    while peek(tokens) == "*":
        tokens = tokens[1:]
        right, tokens = state6(right, tokens)
    # reduce using rule 2: expr -> expr '+' term
    return AST(left, right, "+", "expr"), tokens


def state6(left: AST, tokens: list[str]):
    token = peek(tokens)
    if token.isdigit():
        tokens = tokens[1:]
        right = state4(token)
    else:
        panic(token)
    return state8(left, right), tokens


def state5(left: AST, tokens: list[str]):
    token = peek(tokens)
    if token.isdigit():
        tokens = tokens[1:]
        right = state4(token)
    else:
        panic(token)
    right = state3(right)
    return state7(left, right, tokens)


def state4(token: str):
    # reduce using rule 6: factor -> INTEGER
    return AST(None, None, token, "factor")


def state3(ast: AST):
    # reduce using rule 5: term -> factor
    return AST(ast.left, ast.right, ast.value, "term")


def state2(ast: AST, tokens: list[str]):
    while peek(tokens) == "*":
        tokens = tokens[1:]
        ast, tokens = state6(ast, tokens)
    # reduce using rule 3: expr -> term
    return AST(ast.left, ast.right, ast.value, "expr"), tokens


def state1(ast: AST, tokens: list[str]):
    # loop to handle left recursion
    while peek(tokens) == "+":
        # shift token
        tokens = tokens[1:]
        # go to state 5
        ast, tokens = state5(ast, tokens)
    # accept
    return ast


def state0(tokens: list[str]):
    token = peek(tokens)
    if token.isdigit():
        # shift token, move dot forwards
        tokens = tokens[1:]
        # go to state 4
        ast = state4(token)
    else:
        panic(token)
    # go to state 3
    ast = state3(ast)
    # go to state 2
    ast, tokens = state2(ast, tokens)
    # go to state 1
    return state1(ast, tokens)


def parse(tokens):
    return state0(tokens)


def evaluate(ast):
    if ast.value == "+":
        return evaluate(ast.left) + evaluate(ast.right)
    elif ast.value == "*":
        return evaluate(ast.left) * evaluate(ast.right)
    else:
        return int(ast.value)


def tests():
    errors = 0
    for _ in range(1000):
        k = random.randint(2, 10)
        nums = [str(i) for i in random.sample(range(10_000), k)]
        ops = [random.choice(["+", "*"]) for _ in range(k - 1)]
        expr = [i for j in zip(nums, ops) for i in j] + [nums[-1]]
        input = " ".join(expr)
        res = evaluate(parse(lex(input)))
        py_res = eval(input)
        if res != py_res:
            print("incorrect output for:", input)
            print("got:", res)
            print("expected:", py_res)
            errors += 1
    if errors == 0:
        print("all tests passed!")


def main():
    if len(sys.argv) != 2:
        print("usage: {} [STRING]".format(sys.argv[0]))
        return
    input = sys.argv[1]
    if input == "test":
        tests()
        return
    tokens = lex(sys.argv[1])
    ast = parse(tokens)
    result = evaluate(ast)
    print(result)


if __name__ == "__main__":
    main()
