class Befunge {
  constructor() {
    this.init();
  }
  
  init() {
    // state for testing
    this.directions = {
      "up": "up",
      "down": "down",
      "left": "left",
      "right": "right",
    };
    this.stack = [];
    this.code = null;
    this.direction = this.directions.right;
    this.x = 0;
    this.y = 0;
    this.stringMode = false;
    this.output = "";
    
    this.ops = {
      " ":  () => null, // nop
      "0":  () => this.push(0),
      "1":  () => this.push(1),
      "2":  () => this.push(2),
      "3":  () => this.push(3),
      "4":  () => this.push(4),
      "5":  () => this.push(5),
      "6":  () => this.push(6),
      "7":  () => this.push(7),
      "8":  () => this.push(8),
      "9":  () => this.push(9),
      "+":  () => this.add(),
      "-":  () => this.subtract(),
      "*":  () => this.multiply(),
      "/":  () => this.divide(),
      "%":  () => this.modulo(),
      "!":  () => this.not(),
      "`":  () => this.greaterThan(),
      ">":  () => this.changeDirection(this.directions.right),
      "<":  () => this.changeDirection(this.directions.left),
      "^":  () => this.changeDirection(this.directions.up),
      "v":  () => this.changeDirection(this.directions.down),
      "?":  () => this.changeDirection(),
      "_":  () => this.evalHorizontalDirection(),
      "|":  () => this.evalVerticalDirection(),
      "\"": () => this.toggleStringMode(),
      ":":  () => this.duplicate(),
      "\\": () => this.swap(),
      "$":  () => this.pop(),
      ".":  () => this.outputInt(),
      ",":  () => this.outputString(),
      "#":  () => this.move(),
      "p":  () => this.put(),
      "g":  () => this.get(),
    };
  }
  
  // Adds top two integers on stack and pushes it back
  add() {
    let a = this.pop(),
        b = this.pop();
        
    this.push(a + b);
  }
  
  changeDirection(direction) {
    // Random direction
    if (direction == undefined) {
      let directions = Object.keys(this.directions).map(key => this.directions[key]);
      
      this.direction = directions[~~(Math.random() * directions.length)];
      return;
    }
    
    this.direction = direction;
  }
  
  // Performs int division on the stack
  divide() {
    let a = this.pop(),
        b = this.pop();
        
    if (a == 0) {
      this.push(0);
    } else {
      this.push(~~(b / a));
    }
  }
  
  duplicate() {
    if (this.stack.length == 0) {
      this.push(0);
    } else {
      let value = this.pop();
      this.push(value);
      this.push(value);
    }
  }
  
  evalHorizontalDirection() {
    let a = this.pop();
    
    if (a == 0) {
      this.changeDirection(this.directions.right);
    } else {
      this.changeDirection(this.directions.left);
    }
  }
  
  evalVerticalDirection() {
    let a = this.pop();
    
    if (a == 0) {
      this.changeDirection(this.directions.down);
    } else {
      this.changeDirection(this.directions.up);
    }
  }
  
  // Executes the associated function in the interpreters oplist
  execute(op) {
    if (this.stringMode && op != "\"") {
      this.push(op.charCodeAt(0));
      this.move();
      return;
    }
  
    if (!this.ops.hasOwnProperty(op)) {
      throw new Error("execute: Unknown operation!");
    }
    this.ops[op]();
    this.move();
  }
  
  // Gets the ascii value of a character in the code
  get() {
    let y = this.pop(),
        x = this.pop();
        
    this.push(this.code[y][x].charCodeAt(0));
  }
  
  // Gets operation at the current code pointer
  // performs wrapping behavior
  getOp() {
    // wrap if necessary
    // underflow check
    if (this.y < 0) { this.y += this.code.length; }
    if (this.x < 0) { this.x += this.code[0].length; }
    
    // overflow check
    this.y %= this.code.length;
    this.x %= this.code[0].length;
  
    return this.code[this.y][this.x];
  }
  
  greaterThan() {
    let a = this.pop(),
        b = this.pop();
        
    if (b > a) {
      this.push(1);
    } else {
      this.push(0);
    }
  }
  
  interpret(code) {
    // clear state
    this.init();
    this.code = this.parse(code);
    
    while (this.getOp() != "@") {
      this.execute(this.getOp());
    }
    
    return this.output;
  }
  
  modulo() {
    let a = this.pop(),
        b = this.pop();
    
    if (a == 0) {
      this.push(0);
    } else {
      this.push(b % a);
    }
  }
  
  // Moves the pointer
  move() {
    switch(this.direction) {
      case this.directions.right: { ++this.x; break; }
      case this.directions.left: { --this.x; break; }
      case this.directions.down: { ++this.y; break; }
      case this.directions.up: { --this.y; break; }
    }
  }
  
  // Multiplies top two integers on stack and pushes it back
  multiply() {
    let a = this.pop(),
        b = this.pop();
        
    this.push(a * b);
  }
  
  // Logical NOT
  not() {
    let a = this.pop();
    
    if (a == 0) {
      this.push(1);
    } else {
      this.push(0);
    }
  }
  
  outputInt() {
    this.output += this.pop().toString();
  }
  
  outputString() {
    this.output += String.fromCharCode(this.pop());
  }
  
  // Parses input into a 2d array
  parse(code) {
    // inital parse
    let result = code.split("\n").map(v => v.split(""));
    
    // pad right side with no operation codes
    let max = result.reduce((p, c) => c.length > p ? c.length : p, 0);
    return result.map(v => v.concat(new Array(max - v.length).fill(" ")));
  }
  
  // Pops an integer from the stack (or 0, if stack is empty)
  pop() {
    if (this.stack.length == 0) {
      return 0;
    }
    return this.stack.pop();
  }
  
  // Pushes an integer value to the stack
  push(value) {
    if (!Number.isInteger(value)) {
      throw new Error("push: Value must be an integer!");
    }
    
    this.stack.push(value);
  }
  
  // Injects a value from the stack into code
  put() {
    let y = this.pop(),
        x = this.pop(),
        v = this.pop();
        
    this.code[y][x] = String.fromCharCode(v);
  }
    
  // Subtracts top two values of the stack
  subtract() {
    let a = this.pop(),
        b = this.pop();
        
    this.push(b - a);
  }
  
  // Swaps top two values of the stack
  swap() {
    let a = this.pop(),
        b = this.pop();
        
    this.push(a);
    this.push(b);
  }
  
  // Toggles string mode on/off
  toggleStringMode() {
    this.stringMode = !this.stringMode;
  }
}

module.exports = Befunge;