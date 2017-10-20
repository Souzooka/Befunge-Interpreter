const assert = require("chai").assert;
const Befunge = require("../Befunge.js");

describe("Befunge Interpreter", () => {
  describe("Parse Function", () => {
    it("should parse an input into a rectangular 2D array", () => {
      const interpreter = new Befunge();
      let input = ">987v>.v\nv456<  :\n>321 ^ _@";
      let expected = [[">", "9", "8", "7", "v", ">", ".", "v", " "], 
                      ["v", "4", "5", "6", "<", " ", " ", ":", " "],
                      [">", "3", "2", "1", " ", "^", " ", "_", "@"]];
                      
      assert.deepEqual(interpreter.parse(input), expected);
    });
  });
  describe("GetOp Function", () => {
    it("should get an operation from the code field", () => {
      const interpreter = new Befunge();
      let input = "123+\n" +
                  "456-\n" +
                  "789/";
      interpreter.code = interpreter.parse(input);
      assert.equal(interpreter.getOp(), "1");
      interpreter.x = 2;
      assert.equal(interpreter.getOp(), "3");
      interpreter.y = 1;
      assert.equal(interpreter.getOp(), "6");
    });
    it("should exhibit wrapping behavior", () => {
      const interpreter = new Befunge();
      let input = "123+\n" +
                  "456-\n" +
                  "789/";
      interpreter.code = interpreter.parse(input);
      assert.equal(interpreter.getOp(), "1");
      ++interpreter.x;
      assert.equal(interpreter.getOp(), "2");
      ++interpreter.x;
      assert.equal(interpreter.getOp(), "3");
      ++interpreter.x;
      assert.equal(interpreter.getOp(), "+");
      ++interpreter.x;
      assert.equal(interpreter.getOp(), "1");
      ++interpreter.y;
      assert.equal(interpreter.getOp(), "4");
      ++interpreter.y;
      assert.equal(interpreter.getOp(), "7");
      ++interpreter.y;
      assert.equal(interpreter.getOp(), "1");
      --interpreter.x;
      assert.equal(interpreter.getOp(), "+");
      --interpreter.y;
      assert.equal(interpreter.getOp(), "/");
    });
  });
  describe("Move Function", () => {
    it("should move the code pointer", () => {
      const interpreter = new Befunge();
      interpreter.direction = "right";
      interpreter.move();
      assert.equal(interpreter.x, 1);
      interpreter.direction = "left";
      interpreter.move();
      assert.equal(interpreter.x, 0);
      interpreter.direction = "down";
      interpreter.move();
      assert.equal(interpreter.y, 1);
      interpreter.direction = "up";
      interpreter.move();
      assert.equal(interpreter.y, 0);
    });
    it("\"#\" should move the pointer twice", () => {
      const interpreter = new Befunge();
      interpreter.direction = "right";
      interpreter.execute("#");
      assert.equal(interpreter.x, 2);
    });
  });
  describe("Push Function", () => {
    it("should push integers to a stack when parsing number", () => {
      const interpreter = new Befunge();
      interpreter.execute("0");
      assert.deepEqual(interpreter.stack, [0]);
      interpreter.execute("1");
      assert.deepEqual(interpreter.stack, [0, 1]);
      interpreter.execute("2");
      assert.deepEqual(interpreter.stack, [0, 1, 2]);
      interpreter.execute("3");
      assert.deepEqual(interpreter.stack, [0, 1, 2, 3]);
      interpreter.execute("4");
      assert.deepEqual(interpreter.stack, [0, 1, 2, 3, 4]);
      interpreter.execute("5");
      assert.deepEqual(interpreter.stack, [0, 1, 2, 3, 4, 5]);
      interpreter.execute("6");
      assert.deepEqual(interpreter.stack, [0, 1, 2, 3, 4, 5, 6]);
      interpreter.execute("7");
      assert.deepEqual(interpreter.stack, [0, 1, 2, 3, 4, 5, 6, 7]);
      interpreter.execute("8");
      assert.deepEqual(interpreter.stack, [0, 1, 2, 3, 4, 5, 6, 7, 8]);   
      interpreter.execute("9");
      assert.deepEqual(interpreter.stack, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
    it("should push any arbitrary integer to stack", () => {
      const interpreter = new Befunge();
      interpreter.push(2131);
      assert.deepEqual(interpreter.stack, [2131]);
    });
    it("should throw if provided a non-integer value", () => {
      const interpreter = new Befunge();
      assert.throws(() => interpreter.push("a"));
      assert.throws(() => interpreter.push(0.4));
    });
  });
  describe("Pop function", () => {
    it("should pop an integer from the stack", () => {
      const interpreter = new Befunge();
      interpreter.push(5);
      assert.equal(interpreter.pop(), 5);
      assert.deepEqual(interpreter.stack, []);
    });
    it("should return 0 if stack is empty", () => {
      const interpreter = new Befunge();
      assert.equal(interpreter.pop(), 0);
    });
    it("the interpreter should interpret \"$\"", () => {
      const interpreter = new Befunge();
      interpreter.execute("1");
      interpreter.execute("$");
      assert.deepEqual(interpreter.stack, []);
    });
  });
  describe("Add function", () => {
    it("should push the sum of the top two integers of the stack", () => {
      const interpreter = new Befunge();
      interpreter.push(1);
      interpreter.push(2);
      interpreter.add();
      assert.equal(interpreter.stack[0], 3);
      interpreter.push(13);
      interpreter.add();
      assert.equal(interpreter.stack[0], 16);
    });
    it("should execute even if there aren't at least two integers in the stack", () => {
      const interpreter = new Befunge();
      interpreter.push(1);
      interpreter.add();
      assert.equal(interpreter.stack[0], 1);
      interpreter.stack = [];
      interpreter.add();
      assert.equal(interpreter.stack[0], 0);
    });
    it("the interpreter should parse \"+\"", () => {
      const interpreter = new Befunge();
      interpreter.execute("1");
      interpreter.execute("9");
      interpreter.execute("+");
      assert.equal(interpreter.stack[0], 10);
    });
  });
  describe("Subtract function", () => {
    it("should push the difference of the top two integers of the stack", () => {
      const interpreter = new Befunge();
      interpreter.push(2);
      interpreter.push(1);
      interpreter.subtract();
      assert.equal(interpreter.stack[0], 1);
      interpreter.push(13);
      interpreter.subtract();
      assert.equal(interpreter.stack[0], -12);
    });
    it("should execute even if there aren't at least two integers in the stack", () => {
      const interpreter = new Befunge();
      interpreter.push(1);
      interpreter.subtract();
      assert.equal(interpreter.stack[0], -1);
      interpreter.stack = [];
      interpreter.subtract();
      assert.equal(interpreter.stack[0], 0);
    });
    it("the interpreter should parse \"-\"", () => {
      const interpreter = new Befunge();
      interpreter.execute("1");
      interpreter.execute("9");
      interpreter.execute("-");
      assert.equal(interpreter.stack[0], -8);
    });
  });
  describe("Multiply function", () => {
    it("should push the product of the top two integers of the stack", () => {
      const interpreter = new Befunge();
      interpreter.push(2);
      interpreter.push(1);
      interpreter.multiply();
      assert.equal(interpreter.stack[0], 2);
      interpreter.push(13);
      interpreter.multiply();
      assert.equal(interpreter.stack[0], 26);
    });
    it("should execute even if there aren't at least two integers in the stack", () => {
      const interpreter = new Befunge();
      interpreter.push(1);
      interpreter.multiply();
      assert.equal(interpreter.stack[0], 0);
      interpreter.stack = [];
      interpreter.multiply();
      assert.equal(interpreter.stack[0], 0);
    });
    it("the interpreter should parse \"*\"", () => {
      const interpreter = new Befunge();
      interpreter.execute("1");
      interpreter.execute("9");
      interpreter.execute("*");
      assert.equal(interpreter.stack[0], 9);
    });
  });
  describe("Divide function", () => {
    it("should push the division of the top two integers of the stack", () => {
      const interpreter = new Befunge();
      interpreter.push(4);
      interpreter.push(2);
      interpreter.divide();
      assert.equal(interpreter.stack[0], 2);
      interpreter.push(0);
      interpreter.divide();
      assert.equal(interpreter.stack[0], 0);
    });
    it("should execute even if there aren't at least two integers in the stack", () => {
      const interpreter = new Befunge();
      interpreter.push(1);
      interpreter.divide();
      assert.equal(interpreter.stack[0], 0);
      interpreter.stack = [];
      interpreter.divide();
      assert.equal(interpreter.stack[0], 0);
    });
    it("the interpreter should parse \"/\"", () => {
      const interpreter = new Befunge();
      interpreter.execute("4");
      interpreter.execute("2");
      interpreter.execute("/");
      assert.equal(interpreter.stack[0], 2);
    });
  });
  describe("Modulo function", () => {
    it("should push the modulo of the top two integers of the stack", () => {
      const interpreter = new Befunge();
      interpreter.push(7);
      interpreter.push(4);
      interpreter.modulo();
      assert.equal(interpreter.stack[0], 3);
      interpreter.push(2);
      interpreter.modulo();
      assert.equal(interpreter.stack[0], 1);
    });
    it("should execute even if there aren't at least two integers in the stack", () => {
      const interpreter = new Befunge();
      interpreter.push(1);
      interpreter.modulo();
      assert.equal(interpreter.stack[0], 0);
      interpreter.stack = [];
      interpreter.modulo();
      assert.equal(interpreter.stack[0], 0);
    });
    it("the interpreter should parse \"%\"", () => {
      const interpreter = new Befunge();
      interpreter.execute("7");
      interpreter.execute("4");
      interpreter.execute("%");
      assert.equal(interpreter.stack[0], 3);
    });
  });
  describe("Not function", () => {
    it("should negate the top value of the stack", () => {
      const interpreter = new Befunge();
      interpreter.execute("1");
      interpreter.execute("!");
      assert.equal(interpreter.stack[0], 0);
      interpreter.execute("!");
      assert.equal(interpreter.stack[0], 1);
    });
  });
  describe("GreaterThan function", () => {
    it("should compare two numbers and store the result in the stack", () => {
      const interpreter = new Befunge();
      interpreter.execute("1");
      interpreter.execute("2");
      interpreter.execute("`");
      assert.equal(interpreter.stack[0], 0);
      interpreter.execute("9");
      interpreter.execute("8");
      interpreter.execute("`");
      assert.equal(interpreter.stack[1], 1);
    });
  });
  describe("ChangeDirection function", () => {
    it("should change direction", () => {
      const interpreter = new Befunge();
      interpreter.execute("v");
      assert.equal(interpreter.direction, "down");
      interpreter.execute("^");
      assert.equal(interpreter.direction, "up");
      interpreter.execute("<");
      assert.equal(interpreter.direction, "left");
      interpreter.execute(">");
      assert.equal(interpreter.direction, "right");
      
      let rand = [];
      for (let i = 0; i < 10; ++i) {
        interpreter.execute("?");
        rand.push(interpreter.direction);
      }
      rand = [...new Set(rand)];
      
      assert.isAbove(rand.length, 2);
    });
  });
  describe("EvalHorizontalDirection function", () => {
    it("should set direction appropriately", () => {
      const interpreter = new Befunge();
      interpreter.execute("0");
      interpreter.execute("_");
      assert.equal(interpreter.direction, "right");
      interpreter.execute("1");
      interpreter.execute("_");
      assert.equal(interpreter.direction, "left");
    });
  });
  describe("EvalVerticalDirection function", () => {
    it("should set direction appropriately", () => {
      const interpreter = new Befunge();
      interpreter.execute("0");
      interpreter.execute("|");
      assert.equal(interpreter.direction, "down");
      interpreter.execute("1");
      interpreter.execute("|");
      assert.equal(interpreter.direction, "up");
    });
  });
  describe("ToggleStringMode function", () => {
    it("should toggle string mode", () => {
      const interpreter = new Befunge();
      interpreter.execute("\"");
      assert.equal(interpreter.stringMode, true);
      interpreter.execute("\"");
      assert.equal(interpreter.stringMode, false);
    });
    it("should push to stack while string mode is active", () => {
      const interpreter = new Befunge();
      interpreter.execute("\"");
      let input = ["R", "a", "w", " ", "D", "a", "n", "g", "e", "r", " ", "i", "s", " ", "a", "n", " ", "o", "k", " ", "g", "a", "m", "e"];
      
      for (let c of input) {
        interpreter.execute(c);
      }
      
      assert.equal(interpreter.stack.map(v => String.fromCharCode(v)).join(""), "Raw Danger is an ok game");
      
      // disable string mode and resume normal operation
      interpreter.execute("\"");
      interpreter.execute("4");
      interpreter.execute("6");
      interpreter.execute("+");
      assert.equal(interpreter.pop(), 10);
    });
  });
  describe("Duplicate function", () => {
    it("should duplicate the top of the stack", () => {
      const interpreter = new Befunge();
      interpreter.execute("1");
      interpreter.execute(":");
      assert.deepEqual(interpreter.stack, [1, 1]);
    });
    it("should push 0 if stack is empty", () => {
      const interpreter = new Befunge();
      interpreter.execute(":");
      assert.equal(interpreter.stack[0], 0);
    });
  });
  describe("Swap function", () => {
    it("should swap top two values on stack", () => {
      const interpreter = new Befunge();
      interpreter.execute("1");
      interpreter.execute("2");
      interpreter.execute("\\");
      assert.deepEqual(interpreter.stack, [2, 1]);
    });
    it("should pretend there is a 0 on the bottom of stack if there is only one element in the stack", () => {
      const interpreter = new Befunge();
      interpreter.execute("1");
      interpreter.execute("\\");
      assert.deepEqual(interpreter.stack, [1, 0]);
    });
  });
  describe("OutputInt function", () => {
    it("should place the top value of stack into output", () => {
      const interpreter = new Befunge();
      interpreter.execute("1");
      interpreter.execute(".");
      assert.equal(interpreter.output, "1");
    });
  });
  describe("OutputString function", () => {
    it("should place the ASCII representation of the top value into output", () => {
      const interpreter = new Befunge();
      interpreter.execute("8");
      interpreter.execute("9");
      interpreter.execute("*");
      interpreter.execute(",");
      assert.equal(interpreter.output, "H");
    });
  });
  describe("Put function", () => {
    it("should inject a character into the code", () => {
      const interpreter = new Befunge();
      interpreter.code = interpreter.parse("123\n456\n789");
      interpreter.execute("8");
      interpreter.execute("9");
      interpreter.execute("*");
      interpreter.execute("1");
      interpreter.execute("0");
      interpreter.execute("p");
      assert.equal(interpreter.code[0][1], "H");
    });
  });
  describe("Get function", () => {
    it("should push the ASCII value of a character in the code to the stack", () => {
      const interpreter = new Befunge();
      interpreter.code = interpreter.parse("123\n456\n789");
      interpreter.execute("1");
      interpreter.execute("0");
      interpreter.execute("g");
      assert.equal(interpreter.stack[0], 50); // Value of "2"
    });
  });
  describe("Interpret function", () => {
    it("should interpret some basic Befunge programs", () => {
      const interpreter = new Befunge();
      assert.equal(interpreter.interpret(">987v>.v\n" +
                                         "v456<  :\n" +
                                         ">321 ^ _@"), "123456789");
      assert.equal(interpreter.interpret("64+\"!dlroW ,olleH\">:#,_@"), "Hello, World!\n");
    });
  });
});