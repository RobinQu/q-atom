/*global describe, jasmine, it, expect, runs, waits, Q */

describe("Q.Object, object extension toolkits", function() {
  var Animal, Dog, Bee, animal, dog;
  
  it("should define a class/module", function() {
    Animal = Q.Object.extend({
      lang: "animal",
      talk: function() {
        return this.lang;
      }
    });

    animal = Animal.create();
    expect(animal.init).toBeTruthy();
  });
  
  it("should assign super method to overriden methods", function() {
    Bee = Animal.extend({
      lang: "b~~~~",
      talk: function() {
        return arguments.callee.base.apply(this, arguments);
      }
    });
    
    expect(Bee.create().talk()).toEqual("b~~~~");
  });
  
  it("should extend a class with mixins and props", function() {
    Dog = Animal.extend({
      lang: "doggy",
      bark: function() {
        return "bark";
      }
    });
    dog = Dog.create();
    
    // console.log(Animal.prototype);
    // console.log(animal);
    
    expect(animal.talk()).toEqual("animal");
    expect(dog.talk()).toEqual("doggy");
    expect(dog.bark()).toEqual("bark");
  });
  
  it("should work with 'new' keyword", function() {
    var animal = new Animal();
    expect(animal.talk()).toEqual("animal");
  });
  
  it("should create with object hash", function() {
    var count = 0;
    var animal = Animal.create({
      name: "bee",
      lang: "balbal"
    });
    
    expect(animal.name).toEqual("bee");
    animal.lang = "bee-lang";
  });
  
  it("should modify on instance not on prototype", function() {
    var Father = Q.Object.extend({
      memory: null,
      init: function() {//should create a new array for each instance
        this.memory = [];
        return this;
      }
    });
    
    var f1 = Father.create();
    f1.memory.push("birth");
    var f2 = Father.create();
    
    expect(f1.memory[0]).toEqual("birth");
    expect(Father.prototype.memory).toEqual(null);
    expect(f2.memory.length).toEqual(0);
    
    var Son = Father.extend({});
    expect(Son.prototype.memory).toEqual(null);
    
    
  });
  

});