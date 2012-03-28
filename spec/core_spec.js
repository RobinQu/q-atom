/*global describe, jasmine, it, expect, runs, waits, Q */

describe("Basics of Q", function() {
  it("should mixin in rumtime", function() {
    var dog = {
      name: "Jobs"
    };
    Q.mixin(dog, {
      owner: "Robin"
    });
    expect(dog.owner).toEqual("Robin");
  });
  
  it("should merge two objects into a newly created object", function() {
    var a = {
      foo: "bar",
      bar: "foo"
    };
    var b = {
      foo: "bar1",
      bar: "foo1",
      cow: "cow"
    };
    var c = Q.merge(a,b);
    expect(c.foo).toEqual("bar1");
    expect(c.cow).toEqual("cow");
  });
  
  it("shuold generate unique id", function() {
    var i = 100;
    while(i--) {
      expect(Q.guid()).not.toEqual(Q.guid());
    }
  });
});